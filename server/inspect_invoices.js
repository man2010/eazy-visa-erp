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

async function inspectInvoices() {
    try {
        const token = await getAccessToken();
        const orgId = '873088744';

        console.log(`Fetching invoices for Org ${orgId}...`);
        const response = await axios.get(`${config.apiBase}/books/v3/invoices`, {
            headers: { Authorization: `Zoho-oauthtoken ${token}` },
            params: { organization_id: orgId, per_page: 20 }
        });

        const invoices = response.data.invoices || [];

        for (const inv of invoices.slice(0, 5)) {
            console.log(`\nInvoice ${inv.invoice_number} (Customer: ${inv.customer_name})`);

            // Need to fetch individual invoice to see line items
            const details = await axios.get(`${config.apiBase}/books/v3/invoices/${inv.invoice_id}`, {
                headers: { Authorization: `Zoho-oauthtoken ${token}` },
                params: { organization_id: orgId }
            });

            const lineItems = details.data.invoice.line_items || [];
            lineItems.forEach(item => {
                console.log(`- Item: ${item.name} | Description: ${item.description} | Total: ${item.item_total}`);
            });
        }

    } catch (err) {
        console.error('Debug failed:', err.response?.data || err.message);
    }
}

inspectInvoices();
