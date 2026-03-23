const axios = require('axios');
require('dotenv').config();

const config = {
    apiBase: process.env.ZOHO_API_BASE || 'https://www.zohoapis.com',
    accountsUrl: process.env.ZOHO_ACCOUNTS_URL || 'https://accounts.zoho.com',
    clientId: process.env.ZOHO_CLIENT_ID,
    clientSecret: process.env.ZOHO_CLIENT_SECRET,
    refreshToken: process.env.ZOHO_REFRESH_TOKEN,
    orgId: process.env.ZOHO_ORG_IDS?.split(',')[0].trim()
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

const endpointsToTest = [
    'customeraging',
    'vendoraging',
    'receivablesaging',
    'payablesaging',
    'ar_aging_summary',
    'ap_aging_summary',
    'ar_aging_details',
    'ap_aging_details',
    'arinvoiceaging',
    'apbillaging',
    'customer_aging_summary',
    'vendor_aging_summary',
    'aging_summary'
];

async function probe() {
    try {
        const token = await getAccessToken();
        console.log('--- Started Zoho Probing ---');

        for (const endpoint of endpointsToTest) {
            try {
                const url = `${config.apiBase}/books/v3/reports/${endpoint}`;
                const res = await axios.get(url, {
                    headers: { Authorization: `Zoho-oauthtoken ${token}` },
                    params: { organization_id: config.orgId, from_date: '2024-01-01', to_date: '2024-12-31' }
                });
                console.log(`[SUCCESS] ${endpoint}`);
            } catch (error) {
                const msg = error.response?.data?.message || error.message;
                const code = error.response?.data?.code;
                console.log(`[FAILED]  ${endpoint} -> ${msg} (Code: ${code})`);
            }
        }
        console.log('--- Finished Zoho Probing ---');
    } catch (error) {
        console.error('Probe failed:', error.message);
    }
}

probe();
