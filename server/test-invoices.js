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

async function testInvoices() {
    try {
        const token = await getAccessToken();
        console.log(`--- Testing Zoho Invoices for Org ${config.orgId} ---`);

        const url = `${config.apiBase}/books/v3/invoices`;
        const res = await axios.get(url, {
            headers: { Authorization: `Zoho-oauthtoken ${token}` },
            params: { organization_id: config.orgId, status: 'unpaid', per_page: 200 }
        });

        console.log(`Success! Found ${res.data.invoices?.length || 0} unpaid invoices.`);
        if (res.data.invoices?.length > 0) {
            console.log('Sample Invoice:', JSON.stringify(res.data.invoices[0], null, 2));
        }
    } catch (error) {
        console.error('Failed to fetch invoices:', error.response?.data || error.message);
    }
}

testInvoices();
