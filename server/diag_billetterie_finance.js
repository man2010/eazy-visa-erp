/**
 * Diagnostic: Test the billetterie finance endpoint and show raw invoice data
 * Run: node diag_billetterie_finance.js
 */
require('dotenv').config();
const axios = require('axios');

const API_BASE = process.env.ZOHO_API_BASE || 'https://www.zohoapis.com';
const ACCOUNTS_URL = process.env.ZOHO_ACCOUNTS_URL || 'https://accounts.zoho.com';

async function getToken() {
    const resp = await axios.post(`${ACCOUNTS_URL}/oauth/v2/token`, null, {
        params: {
            refresh_token: process.env.ZOHO_REFRESH_TOKEN,
            client_id: process.env.ZOHO_CLIENT_ID,
            client_secret: process.env.ZOHO_CLIENT_SECRET,
            grant_type: 'refresh_token'
        },
        timeout: 15000
    });
    return resp.data.access_token;
}

async function main() {
    const token = await getToken();
    const headers = { Authorization: `Zoho-oauthtoken ${token}` };

    // Date range: Feb 2026
    const from = '2026-02-01';
    const to = '2026-02-27';
    const orgIds = ['873088744', '910367975'];

    for (const orgId of orgIds) {
        console.log(`\n====== ORG ${orgId} ======`);

        // Step 1: fetch first page of invoices (list)
        const listResp = await axios.get(`${API_BASE}/books/v3/invoices`, {
            headers,
            params: { organization_id: orgId, date_start: from, date_end: to, page: 1, per_page: 10 },
            timeout: 15000
        });
        const invoices = listResp.data.invoices || [];
        console.log(`[List] Found ${invoices.length} invoices. Page context:`, listResp.data.page_context);

        if (invoices.length === 0) {
            console.log('No invoices found in this date range.');
            continue;
        }

        // Show first invoice list fields
        const firstInv = invoices[0];
        console.log('\n[Sample Invoice from list - keys available]:');
        console.log('  invoice_id:', firstInv.invoice_id);
        console.log('  invoice_number:', firstInv.invoice_number);
        console.log('  date:', firstInv.date);
        console.log('  status:', firstInv.status);
        console.log('  total:', firstInv.total);
        console.log('  has line_items in list?', Array.isArray(firstInv.line_items), 'count:', (firstInv.line_items || []).length);

        // Step 2: fetch detail for first invoice
        console.log(`\n[Detail] Fetching invoice ${firstInv.invoice_id} detail...`);
        const detailResp = await axios.get(`${API_BASE}/books/v3/invoices/${firstInv.invoice_id}`, {
            headers,
            params: { organization_id: orgId },
            timeout: 15000
        });
        const detail = detailResp.data.invoice;
        const lineItems = detail?.line_items || [];
        console.log(`[Detail] Line items count: ${lineItems.length}`);
        lineItems.forEach((li, idx) => {
            console.log(`  Line ${idx + 1}: name="${li.name || li.item_name}", account_code="${li.account_code || 'N/A'}", account_name="${li.account_name || 'N/A'}", item_total=${li.item_total}, line_total=${li.line_total}`);
        });

        // Step 3: Try a broader approach - fetch ALL invoices totals without filtering by line items
        console.log(`\n[Direct Total] Summing all valid invoice totals for org ${orgId}...`);
        let directTotal = 0;
        let allInvCount = 0;
        let page = 1;
        let hasMore = true;
        while (hasMore && page <= 5) {
            const pageResp = await axios.get(`${API_BASE}/books/v3/invoices`, {
                headers,
                params: { organization_id: orgId, date_start: from, date_end: to, page, per_page: 200 },
                timeout: 15000
            });
            const items = pageResp.data.invoices || [];
            items.forEach(inv => {
                if (inv.status !== 'void' && inv.status !== 'draft') {
                    directTotal += Number(inv.total || 0);
                    allInvCount++;
                }
            });
            hasMore = pageResp.data.page_context?.has_more_page || false;
            page++;
        }
        console.log(`[Direct Total] Org ${orgId}: ${allInvCount} valid invoices = ${directTotal} XOF`);
    }

    // Also test calling the actual endpoint
    console.log('\n====== Calling actual /api/billetterie/finance endpoint ======');
    try {
        const apiResp = await axios.get('http://localhost:5000/api/billetterie/finance', {
            params: { from, to },
            timeout: 30000
        });
        console.log('Response:', JSON.stringify(apiResp.data, null, 2));
    } catch (err) {
        console.error('API call failed:', err.response?.data || err.message);
    }
}

main().catch(console.error);
