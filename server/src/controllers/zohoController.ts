import { Request, Response } from 'express';
import axios from 'axios';
import { successResponse, errorResponse } from '../utils/apiResponse';

// Helper to get ENV vars dynamically (avoids hoisting issues)
const getZohoConfig = () => {
  return {
    apiBase: process.env.ZOHO_API_BASE || 'https://www.zohoapis.eu',
    accountsUrl: process.env.ZOHO_ACCOUNTS_URL || 'https://accounts.zoho.eu',
    clientId: process.env.ZOHO_CLIENT_ID,
    clientSecret: process.env.ZOHO_CLIENT_SECRET,
    refreshToken: process.env.ZOHO_REFRESH_TOKEN,
  };
};

// Simple in-memory cache for token
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

const getAccessToken = async () => {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const config = getZohoConfig();

  try {
    if (!config.refreshToken || !config.clientId || !config.clientSecret) {
        throw new Error('Missing Zoho credentials in .env');
    }

    // Force .com if using .com accounts URL to match user expectation (Strict Override)
    // Actually relying on env var is better, logging for debug.
    console.log(`[Zoho Auth] Refreshing token via ${config.accountsUrl}...`);

    const response = await axios.post(`${config.accountsUrl}/oauth/v2/token`, null, {
      params: {
        refresh_token: config.refreshToken,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        grant_type: 'refresh_token',
      },
      timeout: 10000
    });
    
    // Safety check for response format
    if (!response.data || !response.data.access_token) {
        console.error('[Zoho Auth] Invalid Token Response:', response.data);
        throw new Error('Invalid response from Zoho Token Endpoint');
    }

    cachedToken = response.data.access_token;
    // Refresh token expiry is usually 1 hour, set safe expiry (e.g. 50 mins)
    tokenExpiry = Date.now() + (response.data.expires_in - 600) * 1000; 
    
    return cachedToken;
  } catch (error: any) {
    console.error('Error refreshing Zoho token:', error.response?.data || error.message);
    throw new Error('Failed to refresh Zoho token');
  }
};

// Internal Service for Aggregation
export const getFinanceDataInternal = async (organization_id: string, from?: any, to?: any) => {
    const config = getZohoConfig();
    const token = await getAccessToken();

    if (!token) {
        throw new Error('Authentication Failed: Unable to retrieve valid Zoho Token');
    }

    const fetchAll = async (resource: string, params: any) => {
        let allItems: any[] = [];
        let hasMore = true;
        let page = 1;

        while (hasMore) {
            const response = await axios.get(`${config.apiBase}/books/v3/${resource}`, {
                headers: { Authorization: `Zoho-oauthtoken ${token}` },
                params: { ...params, page, per_page: 200 },
                timeout: 10000
            });
            const items = response.data[resource] || [];
            allItems = allItems.concat(items);
            hasMore = response.data.page_context?.has_more_page || false;
            page++;
            if (page > 20) break; // Safety limit (4000 items)
        }
        return allItems;
    };

    // 1. Fetch Invoices
    const invoiceParams: any = { organization_id };
    if (from) invoiceParams.date_start = from;
    if (to) invoiceParams.date_end = to;
    
    console.log(`[Zoho API] Fetching All Invoices for ORG ${organization_id}...`);
    const invoices = await fetchAll('invoices', invoiceParams);

    let revenue_total = 0;
    let unpaid_total = 0;
    let currency_code = '';

    for (const invoice of invoices) {
        // Chiffre d'Affaire: Only non-void, non-draft
        if (invoice.status !== 'void' && invoice.status !== 'draft') {
            revenue_total += (invoice.total || 0);
        }
        if (invoice.balance > 0) {
            unpaid_total += invoice.balance;
        }
        if (!currency_code && invoice.currency_code) {
            currency_code = invoice.currency_code;
        }
    }

    // 2. Fetch Expenses
    const expenseParams: any = { organization_id };
    if (from) expenseParams.date_start = from;
    if (to) expenseParams.date_end = to;

    console.log(`[Zoho API] Fetching All Expenses for ORG ${organization_id}...`);
    const expenses = await fetchAll('expenses', expenseParams);
    
    let expenses_total = 0;

    for (const expense of expenses) {
         // Expenses should probably exclude 'void' if status is available
         if (expense.status !== 'void') {
            expenses_total += (expense.total || 0);
         }
         if (!currency_code && expense.currency_code) {
             currency_code = expense.currency_code;
         }
    }

    const net_profit = revenue_total - expenses_total;

    const validInvoices = invoices.filter(i => i.status !== 'void' && i.status !== 'draft');

    return {
      revenue_total,
      expenses_total,
      unpaid_total,
      net_profit,
      invoice_count: validInvoices.length,
      currency_code,
      organization_id
    };
};

export const getAggregateFinanceData = async (from?: any, to?: any) => {
    // Default Dates: First day of current month to Today if not provided
    if (!from || !to) {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        if (!from) from = firstDay.toISOString().split('T')[0];
        if (!to) to = now.toISOString().split('T')[0];
    }

    const orgIds = process.env.ZOHO_ORG_IDS?.split(',').map(id => id.trim()).filter(id => id) || [];
    
    console.log(`[Zoho Aggregation] Aggregating ${orgIds.length} orgs from ${from} to ${to}`);
    
    let total_revenue = 0;
    let total_expenses = 0;
    let total_unpaid = 0;
    let total_invoices = 0;
    let currency = 'XOF';

    const results = await Promise.allSettled(
        orgIds.map(id => getFinanceDataInternal(id, from, to))
    );

    results.forEach(result => {
        if (result.status === 'fulfilled') {
            total_revenue += result.value.revenue_total;
            total_expenses += result.value.expenses_total;
            total_unpaid += result.value.unpaid_total;
            total_invoices += result.value.invoice_count;
            if (result.value.currency_code) currency = result.value.currency_code;
        } else {
            console.error(`[Zoho Aggregation] Failed to fetch data for one organization:`, result.reason?.message || result.reason);
        }
    });

    return {
        revenue_total: total_revenue,
        expenses_total: total_expenses,
        unpaid_total: total_unpaid,
        invoice_count: total_invoices,
        net_profit: total_revenue - total_expenses,
        currency_code: currency
    };
};

export const getRecentZohoActivities = async () => {
    const orgIds = process.env.ZOHO_ORG_IDS?.split(',').map(id => id.trim()).filter(id => id) || [];
    const token = await getAccessToken();
    const config = getZohoConfig();
    
    let allActivities: any[] = [];

    const fetchOps = orgIds.map(async (orgId) => {
        try {
            const [invRes, expRes] = await Promise.all([
                axios.get(`${config.apiBase}/books/v3/invoices`, {
                    headers: { Authorization: `Zoho-oauthtoken ${token}` },
                    params: { organization_id: orgId, per_page: 5, sort_column: 'created_time', sort_order: 'D' },
                    timeout: 10000
                }),
                axios.get(`${config.apiBase}/books/v3/expenses`, {
                    headers: { Authorization: `Zoho-oauthtoken ${token}` },
                    params: { organization_id: orgId, per_page: 5, sort_column: 'created_time', sort_order: 'D' },
                    timeout: 10000
                })
            ]);

            const invoices = invRes.data.invoices || [];
            invoices.forEach((inv: any) => {
                allActivities.push({
                    id: inv.invoice_id,
                    type: 'sale',
                    text: `Facture ${inv.invoice_number} - ${inv.total.toLocaleString()} ${inv.currency_code}`,
                    date: inv.created_time,
                    color: 'text-green-600',
                    icon: 'ShoppingCart'
                });
            });

            const expenses = expRes.data.expenses || [];
            expenses.forEach((exp: any) => {
                allActivities.push({
                    id: exp.expense_id,
                    type: 'expense',
                    text: `Dépense: ${exp.description || 'Sans description'} - ${exp.total.toLocaleString()} ${exp.currency_code}`,
                    date: exp.created_time,
                    color: 'text-red-600',
                    icon: 'TrendingUp'
                });
            });
        } catch (err: any) {
            const status = err.response?.status;
            const message = err.response?.data?.message || err.message;
            if (status === 400 && message.includes('désactivé')) {
                console.warn(`[Zoho API] Skip Recent Activities for ORG ${orgId}: Account deactivated`);
            } else {
                console.error(`Error fetching recent Zoho activities for org ${orgId}:`, message);
            }
        }
    });

    await Promise.allSettled(fetchOps);
    
    // Sort combined by date descending
    return allActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
};

// --- Manual Aging Calculation Helpers ---

const calculateAging = (items: any[], type: 'receivables' | 'payables') => {
    const now = new Date();
    const result = {
        aging_details: [
            { range_name: '0-30', amount: 0 },
            { range_name: '31-60', amount: 0 },
            { range_name: '61-90', amount: 0 },
            { range_name: '90+', amount: 0 }
        ]
    };

    items.forEach(item => {
        const balance = type === 'receivables' ? item.balance : item.balance; // 'balance' is common
        if (balance <= 0) return;

        const dateStr = type === 'receivables' ? item.due_date : item.due_date;
        const dueDate = new Date(dateStr);
        const diffDays = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays <= 30) result.aging_details[0].amount += balance;
        else if (diffDays <= 60) result.aging_details[1].amount += balance;
        else if (diffDays <= 90) result.aging_details[2].amount += balance;
        else result.aging_details[3].amount += balance;
    });

    return result;
};

const fetchManualAging = async (type: 'receivables' | 'payables', organization_id: string, token: string) => {
    const config = getZohoConfig();
    const endpoint = type === 'receivables' ? 'invoices' : 'bills';
    try {
        console.log(`[Zoho Manual Aging] Fetching ${endpoint} for manual calculation...`);
        const response = await axios.get(`${config.apiBase}/books/v3/${endpoint}`, {
            headers: { Authorization: `Zoho-oauthtoken ${token}` },
            params: { organization_id, status: 'unpaid', per_page: 200 }
        });
        const items = response.data[endpoint] || [];
        return calculateAging(items, type);
    } catch (error: any) {
        console.error(`[Zoho Manual Aging] Error fetching ${endpoint}:`, error.message);
        return null;
    }
};

// --- Revenue by Product ---

/**
 * Fetches revenue broken down by product/item from Zoho Books.
 * Strategy:
 *   1. Try the `salesbyitem` report (available in some Zoho plans).
 *   2. Fallback: fetch individual invoice details and aggregate line_items.
 */
const getRevenueByProduct = async (
    organization_id: string,
    validInvoiceIds: string[],
    from?: any,
    to?: any
): Promise<{ name: string; total: number; quantity: number }[]> => {
    const config = getZohoConfig();
    const token = await getAccessToken();
    const headers = { Authorization: `Zoho-oauthtoken ${token}` };

    // 1. Try the salesbyitem report
    try {
        console.log(`[Zoho Revenue by Product] Trying salesbyitem report for ORG ${organization_id}...`);
        const params: any = { organization_id };
        if (from) params.from_date = from;
        if (to) params.to_date = to;

        const response = await axios.get(`${config.apiBase}/books/v3/reports/salesbyitem`, {
            headers,
            params,
            timeout: 15000
        });

        // The report may return data in different shapes depending on the Zoho plan
        const reportData = response.data?.sales_by_item || response.data?.salesbyitem || [];
        if (Array.isArray(reportData) && reportData.length > 0) {
            console.log(`[Zoho Revenue by Product] salesbyitem report succeeded with ${reportData.length} items.`);
            return reportData
                .map((item: any) => ({
                    name: item.item_name || item.name || 'Inconnu',
                    total: Number(item.item_total || item.total || item.amount || 0),
                    quantity: Number(item.quantity_sold || item.quantity || 0)
                }))
                .filter((item: any) => item.total > 0)
                .sort((a: any, b: any) => b.total - a.total)
                .slice(0, 15);
        }
    } catch (err: any) {
        console.warn(`[Zoho Revenue by Product] salesbyitem report failed (${err.response?.data?.code || err.message}), falling back to invoice line items.`);
    }

    // 2. Fallback: fetch individual invoice details and aggregate line_items
    console.log(`[Zoho Revenue by Product] Fetching line items from ${Math.min(validInvoiceIds.length, 50)} invoices...`);
    const productMap: Record<string, { total: number; quantity: number }> = {};

    // Limit to 50 most recent invoices to avoid excessive API calls
    const idsToFetch = validInvoiceIds.slice(0, 50);

    // Fetch in batches of 5 to avoid rate limits
    const BATCH_SIZE = 5;
    for (let i = 0; i < idsToFetch.length; i += BATCH_SIZE) {
        const batch = idsToFetch.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.allSettled(
            batch.map(id =>
                axios.get(`${config.apiBase}/books/v3/invoices/${id}`, {
                    headers,
                    params: { organization_id },
                    timeout: 10000
                })
            )
        );

        batchResults.forEach(result => {
            if (result.status === 'fulfilled') {
                const invoice = result.value.data?.invoice;
                const lineItems: any[] = invoice?.line_items || [];
                lineItems.forEach((item: any) => {
                    const name = item.name || item.item_name || item.description || 'Inconnu';
                    const amount = Number(item.item_total || item.line_total || 0);
                    const qty = Number(item.quantity || 1);
                    if (!productMap[name]) productMap[name] = { total: 0, quantity: 0 };
                    productMap[name].total += amount;
                    productMap[name].quantity += qty;
                });
            }
        });

        // Small delay between batches to respect rate limits
        if (i + BATCH_SIZE < idsToFetch.length) {
            await new Promise(res => setTimeout(res, 400));
        }
    }

    const result = Object.entries(productMap)
        .map(([name, data]) => ({ name, ...data }))
        .filter(item => item.total > 0)
        .sort((a, b) => b.total - a.total)
        .slice(0, 15);

    console.log(`[Zoho Revenue by Product] Aggregated ${result.length} products from invoice line items.`);
    return result;
};

// --- New Dashboard Logic ---

const fetchZohoReport = async (endpoint: string, organization_id: string, params: any = {}) => {
    const config = getZohoConfig();
    const token = await getAccessToken();
    
    try {
        const url = `${config.apiBase}/books/v3/reports/${endpoint}`;
        const response = await axios.get(url, {
            headers: { Authorization: `Zoho-oauthtoken ${token}` },
            params: { ...params, organization_id }
        });
        console.log(`[Zoho Report API] Successfully fetched ${endpoint} for ORG ${organization_id}`);
        return response.data;
    } catch (error: any) {
        const isAgingReport = ['agingofreceivables', 'customeraging', 'receivablesaging', 'arinvoiceaging', 
                               'agingofpayables', 'vendoraging', 'payablesaging', 'apbillaging'].includes(endpoint);

        // Handle specific Zoho code 5 (Invalid URL) with expanded fallback list
        if (error.response?.data?.code === 5) {
            let fallback: string | null = null;
            
            if (endpoint === 'agingofreceivables') fallback = 'customeraging';
            else if (endpoint === 'customeraging') fallback = 'receivablesaging';
            else if (endpoint === 'receivablesaging') fallback = 'arinvoiceaging';
            
            else if (endpoint === 'agingofpayables') fallback = 'vendoraging';
            else if (endpoint === 'vendoraging') fallback = 'payablesaging';
            else if (endpoint === 'payablesaging') fallback = 'apbillaging';

            if (fallback) {
                // Keep it quiet for aging reports since we know they often fail and we have a manual fallback
                if (!isAgingReport) {
                    console.warn(`[Zoho Report API] ${endpoint} failed (Code 5), trying fallback: ${fallback}`);
                }
                return fetchZohoReport(fallback, organization_id, params);
            }
        }

        // Only log errors if it's NOT a known failing aging report (we have manual fallback for these)
        if (!isAgingReport) {
            console.error(`[Zoho Report API] [ORG:${organization_id}] Error fetching ${endpoint}:`, error.response?.data || error.message);
        } else if (endpoint === 'arinvoiceaging' || endpoint === 'apbillaging') {
            // Log once for the final fallback failure
            console.log(`[Zoho Report API] [ORG:${organization_id}] Standard API for ${endpoint.includes('ar') ? 'Receivables' : 'Payables'} Aging not available. Fallback to manual.`);
        }
        
        return null;
    }
};

export const getFinanceDashboardData = async (req: Request, res: Response) => {
    try {
        let { organization_id, from, to } = req.query;

        if (!organization_id && process.env.ZOHO_ORG_IDS) {
            organization_id = process.env.ZOHO_ORG_IDS.split(',')[0].trim();
        }

        if (!organization_id) {
            return res.status(400).json(errorResponse('VALIDATION', 'organization_id is required'));
        }

        // Default Dates: First day of current month to Today
        if (!from || !to) {
            const now = new Date();
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            if (!from) from = firstDay.toISOString().split('T')[0];
            if (!to) to = now.toISOString().split('T')[0];
        }

        console.log(`[Zoho Dashboard] Fetching data for ORG ${organization_id} from ${from} to ${to}`);

        // Helper to fetch all pages of a resource
        const fetchAllPages = async (resource: string, orgId: string, params: any = {}) => {
            const config = getZohoConfig();
            const token = await getAccessToken();
            let allItems: any[] = [];
            let hasMore = true;
            let page = 1;

            console.log(`[Zoho Pagination] Fetching ${resource} for ORG ${orgId}...`);

            while (hasMore) {
                try {
                    const response = await axios.get(`${config.apiBase}/books/v3/${resource}`, {
                        headers: { Authorization: `Zoho-oauthtoken ${token}` },
                        params: { ...params, organization_id: orgId, page, per_page: 200 }
                    });
                    const items = response.data[resource] || [];
                    allItems = allItems.concat(items);
                    hasMore = response.data.page_context?.has_more_page || false;
                    console.log(`[Zoho Pagination] ${resource} Page ${page}: fetched ${items.length} items`);
                    page++;
                    if (page > 10) break; // Safety limit
                } catch (err: any) {
                    console.error(`[Zoho Pagination] Error on ${resource} Page ${page}:`, err.response?.data || err.message);
                    throw err;
                }
            }
            return allItems;
        };

        // Parallel fetching
        let [plData, bsData, invoices] = await Promise.all([
            fetchZohoReport('profitandloss', organization_id as string, { from_date: from, to_date: to }),
            fetchZohoReport('balancesheet', organization_id as string, { date: to || new Date().toISOString().split('T')[0] }),
            fetchAllPages('invoices', organization_id as string, { 
                date_start: from, 
                date_end: to
            })
        ]);

        // Calculate revenue from invoices (Exclude draft/void)
        const validInvoices = invoices.filter((inv: any) => inv.status !== 'void' && inv.status !== 'draft');
        const invoiceRevenueTotal = validInvoices.reduce((sum: number, inv: any) => sum + (inv.total || 0), 0);
        console.log(`[Zoho Dashboard] [ORG:${organization_id}] Calculated invoice revenue: ${invoiceRevenueTotal} from ${validInvoices.length} valid invoices (out of ${invoices.length} total)`);

        // Fallback for Profit & Loss if API fails (e.g. Code 57 Not Authorized)
        if (!plData) {
            console.warn(`[Zoho Dashboard] [ORG:${organization_id}] P&L Report failed, attempting manual calculation fallback...`);
            try {
                const manualPL = await getFinanceDataInternal(organization_id as string, from, to);
                // Transform manual data to match report structure partially for the summary
                plData = {
                    profit_and_loss: {
                        net_profit_loss: manualPL.net_profit,
                        currency_code: manualPL.currency_code,
                        income_accounts: [{ account_name: 'Total Revenue (Manual)', amount: manualPL.revenue_total }],
                        expense_accounts: [{ account_name: 'Total Expenses (Manual)', amount: manualPL.expenses_total }]
                    },
                    manual: true
                };
            } catch (err: any) {
                console.error(`[Zoho Dashboard] [ORG:${organization_id}] Manual P&L fallback also failed:`, err.message);
            }
        }

        // Attempt Aging reports via API or Manual Fallback
        const token = await getAccessToken();
        const agingParams: any = {};
        if (from) agingParams.from_date = from;
        if (to) agingParams.to_date = to;

        let arData = await fetchZohoReport('agingofreceivables', organization_id as string, agingParams);
        if (!arData) {
            console.warn(`[Zoho Dashboard] Standard AR Aging failed, using manual calculation.`);
            const manual = await fetchManualAging('receivables', organization_id as string, token!);
            if (manual) arData = { aging_of_receivables: manual };
        }

        let apData = await fetchZohoReport('agingofpayables', organization_id as string, agingParams);
        if (!apData) {
            console.warn(`[Zoho Dashboard] Standard AP Aging failed, using manual calculation.`);
            const manual = await fetchManualAging('payables', organization_id as string, token!);
            if (manual) apData = { aging_of_payables: manual };
        }

        // Helper to recursively find accounts in nested structures (for array-based reports)
        const findAccountsRecursive = (transactions: any[]): any[] => {
            let accounts: any[] = [];
            if (!transactions || !Array.isArray(transactions)) return accounts;
            
            transactions.forEach(item => {
                // If it's a leaf account (has account_name or similar)
                if (item.account_name || (item.name && item.account_id)) {
                    accounts.push({
                        account_name: item.account_name || item.name,
                        amount: item.amount !== undefined ? item.amount : (item.total || 0),
                        balance: item.balance !== undefined ? item.balance : (item.total || 0),
                        code: item.account_code || ''
                    });
                }
                // If it has sub-transactions, recurse
                if (item.account_transactions && item.account_transactions.length > 0) {
                    accounts = accounts.concat(findAccountsRecursive(item.account_transactions));
                }
            });
            return accounts;
        };

        // Process profit and loss to get revenue breakdown and charges
        const processPL = (data: any, invoiceRevenue?: number) => {
            if (!data || !data.profit_and_loss) return {};
            
            let allAccounts: any[] = [];
            let netProfit = 0;
            let grossMargin = 0;

            if (Array.isArray(data.profit_and_loss)) {
                allAccounts = findAccountsRecursive(data.profit_and_loss);
                const netProfitSection = data.profit_and_loss.find((s: any) => 
                    s.name?.toLowerCase().includes('net') || s.name?.toLowerCase().includes('perte')
                );
                netProfit = netProfitSection ? netProfitSection.total : 0;
                
                const grossSection = data.profit_and_loss.find((s: any) => 
                    s.name?.toLowerCase().includes('brut') || s.name?.toLowerCase().includes('gross')
                );
                grossMargin = grossSection ? grossSection.total : 0;
            } else {
                const pl = data.profit_and_loss;
                allAccounts = [...(pl.income_accounts || []), ...(pl.expense_accounts || [])];
                netProfit = pl.net_profit_loss || 0;
                grossMargin = pl.gross_profit || 0;
            }

            const revenueByService: any = {
                'Livres (7010)': 0,
                'Visa (7062)': 0,
                'Langue (7061)': 0,
                'Billetterie (7070)': 0,
                'Autres': 0
            };

            let totalRevenue = invoiceRevenue !== undefined ? invoiceRevenue : 0;
            let totalCharges = 0;

            const chargesByNature: any = {
                'Loyer (6220)': 0,
                'Salaires (4220)': 0,
                'Fournitures (6047/54)': 0,
                'Autres': 0
            };

            allAccounts.forEach((acc: any) => {
                const name = (acc.account_name || acc.name || '').toLowerCase();
                const code = acc.account_code || acc.code || '';
                const amount = acc.amount !== undefined ? acc.amount : (acc.total || 0);

                const isRevenue = code.startsWith('7') || name.includes('produit') || name.includes('vente') || name.includes('commission');
                const isExpense = code.startsWith('6') || code.startsWith('422') || name.includes('charge') || name.includes('achat') || name.includes('loyer') || name.includes('salaire');

                if (isRevenue) {
                    if (invoiceRevenue === undefined) totalRevenue += amount;
                    
                    // Categorization based on OHADA prefixes or Keywords
                    // 701 = Ventes de marchandises (Livres)
                    // 706 = Prestations de services (Visa / Langue)
                    // 707 = Commissions / Ventes marchandises (Billetterie)
                    
                    const isPrincipalOrg = organization_id === '873088744' || organization_id === (process.env.ZOHO_ORG_IDS || '').split(',')[0].trim();

                    if (code.startsWith('701') || name.includes('livre')) {
                        revenueByService['Livres (7010)'] += amount;
                    } else if (code.startsWith('7062') || name.includes('visa')) {
                        revenueByService['Visa (7062)'] += amount;
                    } else if (code.startsWith('7061') || name.includes('langue') || name.includes('cours')) {
                        revenueByService['Langue (7061)'] += amount;
                    } else if (code.startsWith('707') || name.includes('billet') || name.includes('commission')) {
                        revenueByService['Billetterie (7070)'] += amount;
                    } else if (code === '70' || code === '706' || code === '7060') {
                        // For Eazy Visa, generic sales/services usually map to Visa if no other match
                        if (isPrincipalOrg || name.includes('service') || name.includes('vente')) {
                             revenueByService['Visa (7062)'] += amount;
                        } else {
                             revenueByService['Autres'] += amount;
                        }
                    } else {
                        revenueByService['Autres'] += amount;
                    }
                } else if (isExpense) {
                    totalCharges += Math.abs(amount); 
                    
                    if (code.startsWith('622') || name.includes('loyer') || name.includes('location')) {
                        chargesByNature['Loyer (6220)'] += amount;
                    } else if (code.startsWith('422') || code.startsWith('66') || name.includes('salaire') || name.includes('rémunération')) {
                        chargesByNature['Salaires (4220)'] += amount;
                    } else if (code.startsWith('6047') || code.startsWith('6054') || code.startsWith('6011') || name.includes('fourniture')) {
                        chargesByNature['Fournitures (6047/54)'] += amount;
                    } else {
                        chargesByNature['Autres'] += amount;
                    }
                }
            });

            // If using invoice revenue, sync net profit
            if (invoiceRevenue !== undefined) {
                netProfit = totalRevenue - totalCharges;
            }

            return {
                totalRevenue,
                totalCharges,
                netProfit,
                grossMargin,
                revenueByService,
                chargesByNature
            };
        };

        // Process balance sheet for Cash & Bank
        const processBS = (data: any) => {
            if (!data || !data.balance_sheet) return {};
            
            let allAccounts: any[] = [];
            if (Array.isArray(data.balance_sheet)) {
                allAccounts = findAccountsRecursive(data.balance_sheet);
            } else {
                const assets = data.balance_sheet.assets || [];
                assets.forEach((cat: any) => {
                    if (cat.accounts) allAccounts = allAccounts.concat(cat.accounts);
                });
            }

            const cashAccounts: any = [];
            let totalCash = 0;

            allAccounts.forEach((acc: any) => {
                const name = acc.account_name || acc.name || '';
                const code = acc.account_code || acc.code || '';
                const balance = acc.balance !== undefined ? acc.balance : (acc.total || 0);

                const isCashBank = code.startsWith('5') || name.toLowerCase().includes('caisse') || name.toLowerCase().includes('banque') || name.toLowerCase().includes('wave');
                
                if (isCashBank) {
                    totalCash += balance;
                    cashAccounts.push({
                        name: name,
                        balance: balance,
                        code: code || name.match(/\d+/)?.[0] || ''
                    });
                }
            });

            return { totalCash, cashAccounts };
        };

        // Fetch revenue by product (uses valid invoice IDs already fetched)
        const validInvoiceIds = validInvoices.map((inv: any) => inv.invoice_id).filter(Boolean);
        let revenueByProduct: { name: string; total: number; quantity: number }[] = [];
        try {
            revenueByProduct = await getRevenueByProduct(organization_id as string, validInvoiceIds, from, to);
        } catch (err: any) {
            console.warn('[Zoho Dashboard] Revenue by product failed:', err.message);
        }

        const financeData = {
            summary: processPL(plData, invoiceRevenueTotal),
            liquidity: processBS(bsData),
            agingReceivables: arData?.aging_of_receivables?.aging_details || [],
            agingPayables: apData?.aging_of_payables?.aging_details || [],
            revenueByProduct,
            period: { from, to },
            currency: plData?.profit_and_loss?.currency_code || 'XOF'
        };

        return res.json(successResponse(financeData));

    } catch (error: any) {
        console.error('Finance Dashboard Error:', error);
        return res.status(500).json(errorResponse('FINANCE_DASHBOARD_ERROR', 'Failed to fetch full dashboard data'));
    }
};

export const getFinanceSummary = async (req: Request, res: Response) => {
  try {
    let { organization_id, from, to } = req.query;

    // Default Org ID from ENV if not provided
    if (!organization_id && process.env.ZOHO_ORG_IDS) {
        const ids = process.env.ZOHO_ORG_IDS.split(',');
        organization_id = ids[0].trim();
    }

    if (!organization_id) {
      return res.status(400).json(errorResponse('VALIDATION', 'organization_id is required'));
    }

    // Default Dates: First day of current month to Today
    if (!from || !to) {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        
        if (!from) from = firstDay.toISOString().split('T')[0];
        if (!to) to = now.toISOString().split('T')[0];
    }
    
    const data = await getFinanceDataInternal(organization_id as string, from, to);
    return res.json(successResponse(data));

  } catch (error: any) {
    console.error('Zoho API Error:', error?.response?.data || error.message);
    return res.status(500).json(errorResponse('ZOHO_API_ERROR', 'Failed to fetch finance summary'));
  }
};

export const getBilletterieFinanceSummary = async (req: Request, res: Response) => {
  try {
    let { from, to } = req.query;

    // Billetterie activity is spread across orgs:
    // 1. Main Org (873088744): Account 7072 (Commissions)
    // 2. Eazy Voyage Org (910367975): Account 7070 (Commission sur Billet d'avion)
    const orgIds = ['873088744', '910367975'];

    // Default Dates
    if (!from || !to) {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        if (!from) from = firstDay.toISOString().split('T')[0];
        if (!to) to = now.toISOString().split('T')[0];
    }

    console.log(`[Billetterie Finance] Fetching from orgs ${orgIds.join(', ')}, from=${from}, to=${to}`);

    const config = getZohoConfig();
    const token = await getAccessToken();
    const headers = { Authorization: `Zoho-oauthtoken ${token}` };

    let totalRevenue = 0;
    let totalExpenses = 0;
    let totalInvoiceCount = 0;
    let currency_code = 'XOF';

    for (const orgId of orgIds) {
        console.log(`[Billetterie Finance] Scanning Org ${orgId}...`);

        // Fetch all invoices for this org in date range (paginated)
        let invPage = 1;
        let invHasMore = true;
        while (invHasMore && invPage <= 10) {
            try {
                const resp = await axios.get(`${config.apiBase}/books/v3/invoices`, {
                    headers,
                    params: { organization_id: orgId, date_start: from, date_end: to, page: invPage, per_page: 200 },
                    timeout: 15000
                });
                const items: any[] = resp.data.invoices || [];
                for (const inv of items) {
                    if (inv.status !== 'void' && inv.status !== 'draft') {
                        totalRevenue += Number(inv.total || 0);
                        totalInvoiceCount++;
                        if (inv.currency_code && currency_code === 'XOF') currency_code = inv.currency_code;
                    }
                }
                invHasMore = resp.data.page_context?.has_more_page || false;
                console.log(`[Billetterie Finance] Org ${orgId} inv page ${invPage}: ${items.length} items`);
                invPage++;
            } catch (err: any) {
                console.warn(`[Billetterie Finance] Org ${orgId} invoices page ${invPage} failed:`, err.message);
                invHasMore = false;
            }
        }

        // Fetch expenses for this org
        try {
            let expPage = 1;
            let expHasMore = true;
            while (expHasMore && expPage <= 5) {
                const expResp = await axios.get(`${config.apiBase}/books/v3/expenses`, {
                    headers,
                    params: { organization_id: orgId, date_start: from, date_end: to, page: expPage, per_page: 200 },
                    timeout: 15000
                });
                const expItems: any[] = expResp.data.expenses || [];
                for (const exp of expItems) {
                    if (exp.status !== 'void') {
                        totalExpenses += Number(exp.total || 0);
                    }
                }
                expHasMore = expResp.data.page_context?.has_more_page || false;
                expPage++;
            }
        } catch (err: any) {
            console.warn(`[Billetterie Finance] Org ${orgId} expenses failed:`, err.message);
        }
    }

    console.log(`[Billetterie Finance] Done: revenue=${totalRevenue}, expenses=${totalExpenses}, invoices=${totalInvoiceCount}`);

    const revenue_total = totalRevenue;
    const expenses_total = totalExpenses;

    return res.json(successResponse({
        revenue_total,
        expenses_total,
        net_profit: revenue_total - expenses_total,
        invoice_count: totalInvoiceCount,
        currency_code,
        note: revenue_total > 0
            ? `Revenus agrégés sur ${totalInvoiceCount} factures (orgs Billetterie)`
            : 'Aucune facture billetterie trouvée sur la période'
    }));
  } catch (error: any) {
    console.error('Billetterie Finance Error:', error);
    return res.status(500).json(errorResponse('BILLETTERIE_FINANCE_ERROR', 'Failed to fetch billetterie finance data'));
  }
};
