const axios = require('axios');
require('dotenv').config();
const fs = require('fs');

const config = {
    apiBase: process.env.ZOHO_API_BASE || 'https://www.zohoapis.com',
    accountsUrl: process.env.ZOHO_ACCOUNTS_URL || 'https://accounts.zoho.com',
    clientId: process.env.ZOHO_CLIENT_ID,
    clientSecret: process.env.ZOHO_CLIENT_SECRET,
    refreshToken: process.env.ZOHO_REFRESH_TOKEN,
    orgId: '873088744'
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

async function diagnose() {
    try {
        const token = await getAccessToken();
        console.log(`--- Fetching Reports & Invoices for ORG ${config.orgId} ---`);

        // P&L
        const plUrl = `${config.apiBase}/books/v3/reports/profitandloss`;
        const plRes = await axios.get(plUrl, {
            headers: { Authorization: `Zoho-oauthtoken ${token}` },
            params: {
                organization_id: config.orgId,
                from_date: '2023-01-01',
                to_date: '2026-12-31'
            }
        });
        fs.writeFileSync('diag_pl_873.json', JSON.stringify(plRes.data, null, 2));

        // Invoices
        const invUrl = `${config.apiBase}/books/v3/invoices`;
        const invRes = await axios.get(invUrl, {
            headers: { Authorization: `Zoho-oauthtoken ${token}` },
            params: {
                organization_id: config.orgId,
                from_date: '2023-01-01',
                to_date: '2026-12-31',
                per_page: 200
            }
        });
        fs.writeFileSync('diag_inv_873.json', JSON.stringify(invRes.data, null, 2));

        console.log('Diagnostic files written: diag_pl_873.json, diag_inv_873.json');

        const pl = plRes.data.profit_and_loss;
        console.log('P&L Type:', Array.isArray(pl) ? 'ARRAY' : 'OBJECT');

        const invoices = invRes.data.invoices || [];
        console.log('Total Invoices:', invoices.length);
        const revenue = invoices.reduce((sum, inv) => sum + (inv.status !== 'void' && inv.status !== 'draft' ? inv.total : 0), 0);
        console.log('Calculated Invoice Revenue (Sum of totals):', revenue);

    } catch (error) {
        console.error('Diagnosis failed:', error.response?.data || error.message);
    }
}

diagnose();
