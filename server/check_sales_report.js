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

async function checkSalesReport() {
    try {
        const token = await getAccessToken();
        const orgId = '873088744';

        const now = new Date();
        const from = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
        const to = now.toISOString().split('T')[0];

        console.log(`Fetching Sales by Item for Org ${orgId}...`);
        const response = await axios.get(`${config.apiBase}/books/v3/reports/salesbyitem`, {
            headers: { Authorization: `Zoho-oauthtoken ${token}` },
            params: { organization_id: orgId, from_date: from, to_date: to }
        });

        const report = response.data.sales_by_item;
        console.log('Report structure:', Object.keys(report || {}));

        if (Array.isArray(report)) {
            report.forEach(row => {
                if (row.item_name) {
                    console.log(`- ${row.item_name}: ${row.sales_amount}`);
                }
            });
        } else if (report && report.items) {
            report.items.forEach(item => {
                console.log(`- ${item.item_name}: ${item.sales_amount}`);
            });
        }

    } catch (err) {
        console.error('Debug failed:', err.response?.data || err.message);
    }
}

checkSalesReport();
