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

async function testReport() {
    try {
        const token = await getAccessToken();
        console.log(`--- Testing Zoho P&L Report for ${config.orgIds.length} Orgs ---`);

        for (const orgId of config.orgIds) {
            console.log(`\n--- Testing Org ${orgId} ---`);
            const url = `${config.apiBase}/books/v3/reports/profitandloss`;
            try {
                const res = await axios.get(url, {
                    headers: { Authorization: `Zoho-oauthtoken ${token}` },
                    params: {
                        organization_id: orgId,
                        from_date: '2024-01-01',
                        to_date: '2024-12-31'
                    }
                });
                console.log(`[OK]   Org ${orgId} -> Successfully fetched P&L`);
            } catch (error) {
                const code = error.response?.data?.code;
                const msg = error.response?.data?.message;
                console.log(`[FAIL] Org ${orgId} -> Code: ${code}, Message: ${msg}`);
            }
        }
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

testReport();
