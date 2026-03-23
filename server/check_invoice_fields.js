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
            config[parts[0].trim()] = parts[1].trim();
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

async function checkSubtotal() {
    try {
        const response = await axios.post(`${config.accountsUrl}/oauth/v2/token`, null, {
            params: {
                refresh_token: config.refreshToken,
                client_id: config.clientId,
                client_secret: config.clientSecret,
                grant_type: 'refresh_token',
            },
        });
        const token = response.data.access_token;
        const orgId = '873088744'; // The one with invoices

        const invRes = await axios.get(`${config.apiBase}/books/v3/invoices`, {
            headers: { Authorization: `Zoho-oauthtoken ${token}` },
            params: { organization_id: orgId, per_page: 5 }
        });

        const inv = invRes.data.invoices[0];
        console.log('Invoice Keys:', Object.keys(inv));
        console.log('Sample Invoice:', {
            total: inv.total,
            sub_total: inv.sub_total,
            balance: inv.balance
        });

    } catch (err) {
        console.error(err.message);
    }
}

checkSubtotal();
