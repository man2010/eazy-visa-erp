const axios = require('axios');
require('dotenv').config();

const config = {
    apiBase: process.env.ZOHO_API_BASE || 'https://www.zohoapis.com',
    accountsUrl: process.env.ZOHO_ACCOUNTS_URL || 'https://accounts.zoho.com',
    clientId: process.env.ZOHO_CLIENT_ID,
    clientSecret: process.env.ZOHO_CLIENT_SECRET,
    refreshToken: process.env.ZOHO_REFRESH_TOKEN,
    orgIds: process.env.ZOHO_ORG_IDS?.split(',').map(id => id.trim()) || []
};

async function getAccessToken() {
    const response = await axios.post(`${config.accountsUrl}/oauth/v2/token`, null, {
        params: {
            refresh_token: config.refreshToken,
            client_id: config.clientId,
            client_secret: config.clientSecret,
            grant_type: 'refresh_token',
        },
    });
    return response.data.access_token;
}

// Based on search, 'aging_by' might be required as 'invoice_date' or 'due_date'
const endpoints = [
    'customeraging',
    'vendoraging',
    'customer_aging',
    'vendor_aging',
    'aged_receivables',
    'aged_payables',
    'aging/customer',
    'aging/vendor',
    'profitandloss'
];

async function probe() {
    try {
        const token = await getAccessToken();
        const orgId = config.orgIds[0];
        console.log(`--- Probing Zoho Reports for Org: ${orgId} ---`);

        for (const endpoint of endpoints) {
            const url = `${config.apiBase}/books/v3/reports/${endpoint}`;
            const queryParams = {
                organization_id: orgId
            };

            // For aging reports, test with aging_by
            if (endpoint.includes('aging')) {
                queryParams.aging_by = 'due_date'; // or 'invoice_date'
            }

            try {
                const res = await axios.get(url, {
                    headers: { Authorization: `Zoho-oauthtoken ${token}` },
                    params: queryParams
                });
                console.log(`[OK]   ${endpoint} -> Status: ${res.status}`);
            } catch (error) {
                const msg = error.response?.data?.message || error.message;
                const code = error.response?.data?.code;
                console.log(`[FAIL] ${endpoint} -> ${msg} (Code: ${code}) URL: ${url}`);
            }
        }
    } catch (error) {
        console.error('Probe failed:', error.message);
    }
}

probe();
