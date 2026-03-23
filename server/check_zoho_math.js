const axios = require('axios');
const fs = require('fs');
const path = require('path');

function loadEnv() {
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) return {};
    const content = fs.readFileSync(envPath, 'utf8');
    const config = {};
    content.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim().replace(/^"(.*)"$/, '$1');
            config[key] = value;
        }
    });
    return config;
}

const env = loadEnv();

const config = {
    apiBase: env.ZOHO_API_BASE || 'https://www.zohoapis.com',
    accountsUrl: env.ZOHO_ACCOUNTS_URL || 'https://accounts.zoho.com',
    clientId: env.ZOHO_CLIENT_ID,
    clientSecret: env.ZOHO_CLIENT_SECRET,
    refreshToken: env.ZOHO_REFRESH_TOKEN,
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

async function runDetailedDebug() {
    try {
        const token = await getAccessToken();
        const orgIds = (env.ZOHO_ORG_IDS || '').split(',').map(id => id.trim()).filter(id => id);

        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const today = now.toISOString().split('T')[0];

        console.log(`[Period Check] Target Month: ${now.getMonth() + 1}/${now.getFullYear()} (${firstDay} to ${today})`);

        let grandRevenue = 0;
        let grandExpenses = 0;
        let grandInvoiceCount = 0;

        for (const orgId of orgIds) {
            console.log(`\n=== Organization ${orgId} ===`);

            // Invoices
            const invRes = await axios.get(`${config.apiBase}/books/v3/invoices`, {
                headers: { Authorization: `Zoho-oauthtoken ${token}` },
                params: { organization_id: orgId, date_start: firstDay, date_end: today, per_page: 200 }
            });
            const invoices = invRes.data.invoices || [];
            const valid = invoices.filter(i => i.status !== 'void' && i.status !== 'draft');
            const rev = valid.reduce((sum, i) => sum + i.total, 0);

            console.log(`- Invoices (This Month): ${invoices.length} found, ${valid.length} valid`);
            console.log(`- Revenue (This Month): ${rev.toLocaleString()} XOF`);

            // Expenses
            const expRes = await axios.get(`${config.apiBase}/books/v3/expenses`, {
                headers: { Authorization: `Zoho-oauthtoken ${token}` },
                params: { organization_id: orgId, date_start: firstDay, date_end: today, per_page: 200 }
            });
            const expenses = expRes.data.expenses || [];
            const exp = expenses.reduce((sum, i) => sum + i.total, 0);

            console.log(`- Expenses (This Month): ${expenses.length} found`);
            console.log(`- Expenses Total: ${exp.toLocaleString()} XOF`);

            grandRevenue += rev;
            grandExpenses += exp;
            grandInvoiceCount += valid.length;
        }

        console.log(`\n=== GRAND TOTALS (Aggregated) ===`);
        console.log(`Total Revenue: ${grandRevenue.toLocaleString()} XOF`);
        console.log(`Total Expenses: ${grandExpenses.toLocaleString()} XOF`);
        console.log(`Total Sales Count: ${grandInvoiceCount}`);

    } catch (err) {
        console.error('Debug failed:', err.response?.data || err.message);
    }
}

runDetailedDebug();
