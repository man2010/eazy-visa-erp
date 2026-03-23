import { Request, Response } from 'express';
import axios from 'axios';
import { successResponse, errorResponse } from '../utils/apiResponse';

// Regular HubSpot account (General)
const getHubSpotConfig = () => ({
    apiBase: process.env.HUBSPOT_API_BASE || 'https://api.hubapi.com',
    accessToken: process.env.HUBSPOT_PRIVATE_APP_TOKEN?.trim()
});

const getHubSpotHeaders = () => {
  const config = getHubSpotConfig();
  if (!config.accessToken) throw new Error('Missing HUBSPOT_PRIVATE_APP_TOKEN');
  return {
    Authorization: `Bearer ${config.accessToken}`,
    'Content-Type': 'application/json',
  };
};

// Billetterie HubSpot account (Dedicated EU)
const getHubSpotBilletterieConfig = () => ({
    apiBase: 'https://api.hubapi.com', // Most pat-eu1 tokens work on standard base
    accessToken: process.env.HUBSPOT_PRIVATE_APP_TOKEN_BILLETTERIE?.trim()
});

const getHubSpotBilletterieHeaders = () => {
  const config = getHubSpotBilletterieConfig();
  if (!config.accessToken) throw new Error('Missing HUBSPOT_PRIVATE_APP_TOKEN_BILLETTERIE');
  return {
    Authorization: `Bearer ${config.accessToken}`,
    'Content-Type': 'application/json',
  };
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const hubspotRequest = async (method: 'get' | 'post', url: string, data: any = null, headers: any, params: any = {}, retries = 5) => {
    let lastError: any;
    for (let i = 0; i < retries; i++) {
        try {
            const config: any = { headers, params };
            if (method === 'post') {
                return await axios.post(url, data, config);
            } else {
                return await axios.get(url, config);
            }
        } catch (error: any) {
            lastError = error;
            const status = error.response?.status;
            const errorData = error.response?.data;
            
            // Handle HubSpot Rate Limit (SECONDLY)
            if (status === 429 || (errorData?.category === 'RATE_LIMIT' && errorData?.policyName === 'SECONDLY')) {
                const waitTime = Math.pow(2, i) * 1000 + Math.random() * 1000;
                console.warn(`[HubSpot API] Rate limit hit (Retry ${i+1}/${retries}). Waiting ${Math.round(waitTime)}ms...`);
                await delay(waitTime);
                continue;
            }
            
            // Re-throw if not a rate limit or after final retry
            throw error;
        }
    }
    throw lastError;
};

const getOwners = async () => {
    const config = getHubSpotConfig();
    try {
        const headers = getHubSpotHeaders();
        console.log(`[HubSpot] Fetching owners using token: ${config.accessToken?.substring(0, 10)}...`);
        // Use allSettled to avoid failing if archived owners are inaccessible
        const results = await Promise.allSettled([
            hubspotRequest('get', `${config.apiBase}/crm/v3/owners/`, null, headers),
            hubspotRequest('get', `${config.apiBase}/crm/v3/owners/?archived=true`, null, headers)
        ]);
        
        const active = results[0].status === 'fulfilled' ? results[0].value.data.results || [] : [];
        const archived = results[1].status === 'fulfilled' ? results[1].value.data.results || [] : [];
        
        if (results[0].status === 'rejected') {
            const err: any = results[0].reason;
            console.error("HubSpot Active Owners Error:", err.message);
        }

        console.log(`[HubSpot] Owners fetched: Active=${active.length}, Archived=${archived.length}`);
        return [...active, ...archived];
    } catch (error: any) {
        console.error("HubSpot Owners Critical Error:", error.message);
        return [];
    }
};

const getCallsCount = async (filters: any[]) => {
    const config = getHubSpotConfig();
    try {
        const response: any = await hubspotRequest(
            'post',
            `${config.apiBase}/crm/v3/objects/calls/search`,
            {
                filterGroups: [{ filters }],
                limit: 1
            },
            getHubSpotHeaders()
        );
        return response.data.total || 0;
    } catch (error: any) {
        console.error("HubSpot Calls Count Error:", error.message);
        return 0;
    }
}

const searchHubSpot = async (objectType: string, filters: any[], properties: string[] = []) => {
    const config = getHubSpotConfig();
    try {
      console.log(`[HubSpot] Searching ${objectType} with ${filters.length} filters...`);
      const response: any = await hubspotRequest(
        'post',
        `${config.apiBase}/crm/v3/objects/${objectType}/search`,
        {
          filterGroups: [{ filters }],
          properties,
          limit: 100,
        },
        getHubSpotHeaders()
      );
      console.log(`[HubSpot] ${objectType} search result: ${response.data.total}`);
      return response.data;
    } catch (error: any) {
      const errorData = error?.response?.data;
      if (errorData?.category === 'MISSING_SCOPES') {
        console.warn(`HubSpot Search (${objectType}): Missing scopes. Please add necessary permissions to your Private App.`);
        return { total: 0, results: [] };
      }
      console.error(`HubSpot Search Error (${objectType}):`, errorData || error.message);
      throw error;
    }
  };
  
const getPipelineValue = async (filters: any[]) => {
    let hasMore = true;
    let after = undefined;
    let totalValue = 0;
    let pages = 0;
    const config = getHubSpotConfig();
    while (hasMore && pages < 5) {
        const response: any = await hubspotRequest(
            'post',
            `${config.apiBase}/crm/v3/objects/deals/search`,
            {
                filterGroups: [{ filters }],
                properties: ['amount'],
                limit: 100,
                after
            },
            getHubSpotHeaders()
        );
        const deals = response.data.results || [];
        deals.forEach((deal: any) => {
            if (deal.properties.amount) totalValue += Number(deal.properties.amount);
        });
        if (response.data.paging && response.data.paging.next) {
            after = response.data.paging.next.after;
        } else {
            hasMore = false;
        }
        pages++;
        if (hasMore) await delay(300); // Moderate delay between pages
    }
    return totalValue;
}

export const getSalesDataInternal = async (from?: any, to?: any) => {
    console.log(`[HubSpot] getSalesDataInternal called with from=${from}, to=${to}`);

    // Prepare date filters (Creation Date for contacts/deals)
    let dateFilters: any[] = [];
    if (from && to) {
        // Parse date strings as local midnight to avoid timezone shift
        const fromDate = new Date(from as string);
        fromDate.setHours(0, 0, 0, 0);
        const fromTs = fromDate.getTime();

        const toDate = new Date(to as string);
        toDate.setHours(23, 59, 59, 999); // Include the full end day
        const toTs = toDate.getTime();

        dateFilters.push({ propertyName: 'createdate', operator: 'BETWEEN', highValue: String(toTs), value: String(fromTs) });
    }

    // Prepare call date filters (hs_createdate for calls)
    let callDateFilters: any[] = [];
    if (from && to) {
        const fromDate = new Date(from as string);
        fromDate.setHours(0, 0, 0, 0);
        const fromTs = fromDate.getTime();

        const toDate = new Date(to as string);
        toDate.setHours(23, 59, 59, 999);
        const toTs = toDate.getTime();

        callDateFilters.push({ propertyName: 'hs_createdate', operator: 'BETWEEN', highValue: String(toTs), value: String(fromTs) });
    }

    console.log(`[HubSpot] dateFilters: ${JSON.stringify(dateFilters)}`);
    console.log(`[HubSpot] callDateFilters: ${JSON.stringify(callDateFilters)}`);

    // 1-7. Global Metrics
    const totalContactsResult = await searchHubSpot('contacts', [
        ...dateFilters
    ]).catch(() => ({ total: 0 }));
    console.log(`[HubSpot] totalContactsResult.total = ${(totalContactsResult as any).total}`);
    await delay(500);

    const offCycleResult = await searchHubSpot('contacts', [
        { propertyName: 'hs_lead_status', operator: 'EQ', value: 'a abandonné' },
        ...dateFilters
    ]).catch(() => ({ total: 0 }));
    await delay(500);

    const customerResult = await searchHubSpot('contacts', [
        { propertyName: 'lifecyclestage', operator: 'EQ', value: 'customer' },
        ...dateFilters
    ]).catch(() => ({ total: 0 }));
    await delay(500);

    const weekly_calls_count = await getCallsCount([...callDateFilters]);
    console.log(`[HubSpot] weekly_calls_count = ${weekly_calls_count}`);
    await delay(500);
    
    // Fetch global calls for the selected period with properties to determine connectivity
    let daily_calls_total = 0;
    let daily_calls_connected = 0;
    
    try {
        const globalCallsRes: any = await hubspotRequest(
            'post',
            `${getHubSpotConfig().apiBase}/crm/v3/objects/calls/search`,
            {
                filterGroups: [{ filters: [...callDateFilters] }],
                properties: ['hs_call_result', 'hs_call_status', 'hs_call_disposition'],
                limit: 100
            },
            getHubSpotHeaders()
        );
        daily_calls_total = globalCallsRes.data.total || 0;
        const sampleCalls = globalCallsRes.data.results || [];
        
        const dispositionMap: Record<string, number> = {};
        sampleCalls.forEach((c: any) => {
            const d = c.properties.hs_call_disposition || 'NO_ID';
            dispositionMap[d] = (dispositionMap[d] || 0) + 1;
        });

        let sampleConnected = 0;
        const CONNECTED_ID = 'f240bbac-87c9-4f6e-bf70-924b57d47db7'; 
        
        sampleCalls.forEach((c: any) => {
            const disp = c.properties.hs_call_disposition || '';
            const res = (c.properties.hs_call_result || '').toLowerCase().trim();
            
            if (disp === CONNECTED_ID || res === 'connecté' || res === 'connected') {
                sampleConnected++;
            }
        });
        
        if (sampleCalls.length > 0) {
            daily_calls_connected = Math.round(daily_calls_total * (sampleConnected / sampleCalls.length));
        }
    } catch (err) {
        console.warn("Global daily calls error");
    }
    await delay(500);

    const wonResult = await searchHubSpot('deals', [
        ...dateFilters,
        { propertyName: 'hs_is_closed_won', operator: 'EQ', value: 'true' }
    ]).catch(() => ({ total: 0 }));
    await delay(500);

    const total_contacts_count = totalContactsResult.total;
    const off_cycle_count = offCycleResult.total;
    const customer_count = customerResult.total;
    const wonCount = wonResult.total;

    const total_contacts_in_pipeline = total_contacts_count + customer_count;
    const win_rate = total_contacts_in_pipeline > 0 
        ? (customer_count / total_contacts_in_pipeline) * 100 
        : 0;

    // 8. Process Owner Performance (Optimized)
    const owners = await getOwners();
    const activeOwners = owners.filter((o: any) => !o.archived);
    
    // Process in smaller batches to avoid hitting rate limits while being much faster
    const owner_stats: any[] = [];
    const BATCH_SIZE = 5;
    
    for (let i = 0; i < activeOwners.length; i += BATCH_SIZE) {
        const batch = activeOwners.slice(i, i + BATCH_SIZE);
        const batchPromises = batch.map(async (owner: any) => {
            try {
                const [totalRes, wonRes, callsRes] = await Promise.all([
                    searchHubSpot('contacts', [
                        { propertyName: 'hubspot_owner_id', operator: 'EQ', value: owner.id },
                        ...dateFilters
                    ]).catch(() => ({ total: 0 })),
                    searchHubSpot('contacts', [
                        { propertyName: 'hubspot_owner_id', operator: 'EQ', value: owner.id },
                        { propertyName: 'lifecyclestage', operator: 'EQ', value: 'customer' },
                        ...dateFilters
                    ]).catch(() => ({ total: 0 })),
                    hubspotRequest(
                        'post',
                        `${getHubSpotConfig().apiBase}/crm/v3/objects/calls/search`,
                        {
                            filterGroups: [{
                                filters: [
                                    { propertyName: 'hubspot_owner_id', operator: 'EQ', value: owner.id },
                                    ...callDateFilters
                                ]
                            }],
                            properties: ['hs_call_result', 'hs_call_disposition'],
                            limit: 100 
                        },
                        getHubSpotHeaders()
                    ).catch(() => ({ data: { results: [], total: 0 } }))
                ]);

                const calls = (callsRes as any).data.results || [];
                const owner_calls_total = (callsRes as any).data.total || 0;
                
                let connectedCount = 0;
                const CONNECTED_ID = 'f240bbac-87c9-4f6e-bf70-924b57d47db7';
                calls.forEach((call: any) => {
                    const disp = call.properties.hs_call_disposition || '';
                    const res = (call.properties.hs_call_result || '').toLowerCase().trim();
                    if (disp === CONNECTED_ID || res === 'connecté' || res === 'connected') {
                        connectedCount++;
                    }
                });
                
                let owner_calls_connected = 0;
                if (owner_calls_total > calls.length && calls.length > 0) {
                    owner_calls_connected = Math.round(owner_calls_total * (connectedCount / calls.length));
                } else {
                    owner_calls_connected = connectedCount;
                }

                return {
                    name: `${owner.firstName} ${owner.lastName}`,
                    won: (wonRes as any).total,
                    lost: (totalRes as any).total - (wonRes as any).total,
                    total: (totalRes as any).total,
                    calls_total: owner_calls_total,
                    calls_connected: owner_calls_connected,
                    calls_not_connected: Math.max(0, owner_calls_total - owner_calls_connected),
                    win_rate: (totalRes as any).total > 0 ? ((wonRes as any).total / (totalRes as any).total) * 100 : 0
                };
            } catch (err: any) {
                console.error(`Error for owner ${owner.id}:`, err.message);
                return null;
            }
        });

        const batchResults = await Promise.all(batchPromises);
        batchResults.forEach(r => { if (r) owner_stats.push(r); });
        
        if (i + BATCH_SIZE < activeOwners.length) await delay(1000); // Wait between batches
    }
    
    // Sort by Total Descending
    owner_stats.sort((a, b) => b.total - a.total);

    return {
      total_contacts_count,
      off_cycle_count,
      weekly_calls_count,
      daily_calls_total,
      daily_calls_connected,
      daily_calls_not_connected: Math.max(0, daily_calls_total - daily_calls_connected),
      win_rate,
      won_count: wonCount, 
      owner_stats
    };
}


export const getSalesSummary = async (req: Request, res: Response) => {
  try {
    let { from, to } = req.query; 

    // Default Dates: Start from 3 years ago to capture historical data (e.g. 2024)
    if (!from || !to) {
        const now = new Date();
        const firstDay = new Date(now.getFullYear() - 3, 0, 1);
        if (!from) from = firstDay.toISOString().split('T')[0];
        if (!to) to = now.toISOString().split('T')[0];
    }

    const data = await getSalesDataInternal(from, to);
    return res.json(successResponse(data));
  } catch (error: any) {
    return res.status(500).json(errorResponse('HUBSPOT_API_ERROR', error.message));
  }
};

export const getSupportSummary = async (req: Request, res: Response) => {
    try {
        let { from, to } = req.query;

        // Default Dates
        if (!from || !to) {
            const now = new Date();
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            if (!from) from = firstDay.toISOString().split('T')[0];
            if (!to) to = now.toISOString().split('T')[0];
        }

        let dateFilters: any[] = [];
        if (from && to) {
            const fromTs = new Date(from as string).getTime();
            const toTs = new Date(to as string).getTime() + (24 * 60 * 60 * 1000);
            dateFilters.push({ propertyName: 'createdate', operator: 'BETWEEN', highValue: toTs, value: fromTs });
        }

        const openTicketsResult = await searchHubSpot('tickets', [
             { propertyName: 'closed_date', operator: 'NOT_HAS_PROPERTY' }
        ]);
        
        await delay(500);

        const resolvedFilters = [
            ...dateFilters,
            { propertyName: 'closed_date', operator: 'HAS_PROPERTY' }
        ];
        const resolvedTicketsResult = await searchHubSpot('tickets', resolvedFilters);
        
        await delay(500);

        const open_tickets_count = openTicketsResult.total;
        const resolved_tickets_count = resolvedTicketsResult.total;
        
        const resolutionTimeResult = await searchHubSpot('tickets', resolvedFilters, ['createdate', 'closed_date']);
        let totalTimeMs = 0;
        let count = 0;
        resolutionTimeResult.results.forEach((ticket: any) => {
            if (ticket.properties.closed_date && ticket.properties.createdate) {
                const diff = new Date(ticket.properties.closed_date).getTime() - new Date(ticket.properties.createdate).getTime();
                totalTimeMs += diff;
                count++;
            }
        });
        
        const avg_resolution_time_hours = count > 0 ? (totalTimeMs / count) / (1000 * 60 * 60) : 0;

        return res.json(successResponse({
            open_tickets_count,
            resolved_tickets_count,
            avg_resolution_time_hours
        }));

    } catch (error: any) {
        return res.status(500).json(errorResponse('HUBSPOT_API_ERROR', error.message));
    }
}
export const getRecentHubSpotActivities = async () => {
    try {
        const [dealsRes, ticketsRes] = await Promise.all([
            searchHubSpot('deals', [], ['dealname', 'amount']),
            searchHubSpot('tickets', [], ['subject', 'content'])
        ]);

        const activities: any[] = [];

        const deals = dealsRes.results || [];
        deals.forEach((deal: any) => {
            activities.push({
                id: deal.id,
                type: 'deal',
                text: `Opportunité: ${deal.properties.dealname || 'Deal sans nom'} - ${deal.properties.amount || 0} XOF`,
                date: deal.createdAt,
                color: 'text-blue-600',
                icon: 'Briefcase'
            });
        });

        const tickets = ticketsRes.results || [];
        tickets.forEach((ticket: any) => {
            activities.push({
                id: ticket.id,
                type: 'ticket',
                text: `Ticket Support: ${ticket.properties.subject || 'Sans sujet'}`,
                date: ticket.createdAt,
                color: 'text-purple-600',
                icon: 'Activity'
            });
        });

        return activities;
    } catch (err: any) {
        console.error("HubSpot Recent Activities Error:", err.message);
        return [];
    }
}

const searchHubSpotBilletterie = async (objectType: string, filters: any[], properties: string[] = []) => {
    try {
        const config = getHubSpotBilletterieConfig();
        const headers = getHubSpotBilletterieHeaders();
        const response: any = await hubspotRequest(
            'post',
            `${config.apiBase}/crm/v3/objects/${objectType}/search`,
            {
                filterGroups: [{ filters }],
                properties,
                limit: 100,
            },
            headers
        );
        return response.data;
    } catch (error: any) {
        const errorData = error?.response?.data;
        if (errorData?.category === 'MISSING_SCOPES') {
            console.warn(`HubSpot Billetterie Search (${objectType}): Missing scopes.`);
            return { total: 0, results: [] };
        }
        console.error(`HubSpot Billetterie Search Error (${objectType}):`, errorData || error.message);
        return { total: 0, results: [] };
    }
};

export const getBilletterieCommercialSummary = async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query;

    // Prepare date filters
    let dateFilters: any[] = [];
    if (from && to) {
        const fromDate = new Date(from as string);
        fromDate.setHours(0, 0, 0, 0);
        const fromTs = fromDate.getTime();

        const toDate = new Date(to as string);
        toDate.setHours(23, 59, 59, 999);
        const toTs = toDate.getTime();

        dateFilters.push({ propertyName: 'createdate', operator: 'BETWEEN', highValue: String(toTs), value: String(fromTs) });
    }

    // 1. Billetterie Contacts — using the dedicated EU HubSpot account
    let billetterieContacts: any = { total: 0, results: [] };
    try {
        billetterieContacts = await searchHubSpotBilletterie('contacts', [...dateFilters]);
    } catch (err: any) {
        console.warn('[Billetterie] Contacts fetch fail:', err.message);
    }

    // 2. Deals in period
    let billetterieDeals: any = { total: 0, results: [] };
    let dealPermissionError = false;
    try {
        billetterieDeals = await searchHubSpotBilletterie('deals', [...dateFilters]);
        // searchHubSpotBilletterie returns { total: 0, results: [] } on MISSING_SCOPES but we need to know it failed
    } catch (err: any) {
        if (err.response?.data?.category === 'MISSING_SCOPES') {
            dealPermissionError = true;
        }
    }

    // 3. Top Destinations (from contacts)
    let topDestinations: { name: string; value: number }[] = [];
    try {
        const config = getHubSpotBilletterieConfig();
        const billetterieHeaders = getHubSpotBilletterieHeaders();
        const destinationContacts: any = await hubspotRequest(
            'post',
            `${config.apiBase}/crm/v3/objects/contacts/search`,
            {
                filterGroups: [{
                    filters: [
                        { propertyName: 'n1_quelle_est_votre_destination_habituelle', operator: 'HAS_PROPERTY' },
                        ...dateFilters
                    ]
                }],
                properties: ['n1_quelle_est_votre_destination_habituelle', 'destination'],
                limit: 100
            },
            billetterieHeaders
        );

        const destinationsMap: Record<string, number> = {};
        (destinationContacts.data.results || []).forEach((c: any) => {
            const d = c.properties.n1_quelle_est_votre_destination_habituelle || c.properties.destination;
            if (d) {
                // Handle comma separated destinations if any
                const parts = d.split(/[,&]/).map((s: string) => s.trim()).filter(Boolean);
                parts.forEach((p: string) => {
                    destinationsMap[p] = (destinationsMap[p] || 0) + 1;
                });
            }
        });

        topDestinations = Object.entries(destinationsMap)
            .map(([name, count]) => ({ name, value: count }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    } catch (destErr: any) {
        console.warn('[Billetterie] Could not fetch destinations:', destErr.message);
    }

    return res.json(successResponse({
        customers: (billetterieContacts as any).total || 0,
        deals: (billetterieDeals as any).total || 0,
        dealPermissionError,
        topDestinations,
        period: { from, to }
    }));
  } catch (error: any) {
    console.error('Billetterie Commercial Error:', error);
    return res.status(500).json(errorResponse('BILLETTERIE_COMMERCIAL_ERROR', 'Failed to fetch billetterie commercial data'));
  }
};
