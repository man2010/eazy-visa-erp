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

const candidateNames = [
    'agingofreceivables',
    'customeraging',
    'receivablesaging',
    'arinvoiceaging',
    'agingofpayables',
    'vendoraging',
    'payablesaging',
    'apbillaging',
    'receivableaging',
    'payableaging',
    'agedreceivables',
    'agedpayables',
    'customeraging_summary',
    'vendoraging_summary'
];

async function probe() {
    try {
        const token = await getAccessToken();
        console.log(`--- Probing Zoho Reports for ORG ${config.orgId} ---`);

        for (const name of candidateNames) {
            const url = `${config.apiBase}/books/v3/reports/${name}`;
            try {
                const res = await axios.get(url, {
                    headers: { Authorization: `Zoho-oauthtoken ${token}` },
                    params: { organization_id: config.orgId }
                });
                console.log(`[OK]   ${name}: Success`);
            } catch (error) {
                const code = error.response?.data?.code;
                const msg = error.response?.data?.message;
                console.log(`[FAIL] ${name}: Code ${code}, Message: ${msg}`);
            }
        }
    } catch (error) {
        console.error('Probe failed:', error.message);
    }
}

probe();
