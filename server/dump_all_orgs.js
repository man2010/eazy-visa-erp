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

const findAccountsRecursive = (transactions) => {
    let accounts = [];
    if (!transactions || !Array.isArray(transactions)) return accounts;

    transactions.forEach(item => {
        if (item.account_name || (item.name && item.account_id)) {
            accounts.push({
                name: (item.account_name || item.name || ''),
                amount: item.amount !== undefined ? item.amount : (item.total || 0),
                code: item.account_code || ''
            });
        }
        if (item.account_transactions && item.account_transactions.length > 0) {
            accounts = accounts.concat(findAccountsRecursive(item.account_transactions));
        }
    });
    return accounts;
};

async function debugAll() {
    try {
        const token = await getAccessToken();
        const orgIds = (env.ZOHO_ORG_IDS || '').split(',').map(id => id.trim()).filter(id => id);

        const now = new Date();
        const from = '2025-01-01';
        const to = now.toISOString().split('T')[0];

        let reportData = {};

        for (const orgId of orgIds) {
            console.log(`Fetching P&L for Org ${orgId}...`);
            try {
                const response = await axios.get(`${config.apiBase}/books/v3/reports/profitandloss`, {
                    headers: { Authorization: `Zoho-oauthtoken ${token}` },
                    params: { organization_id: orgId, from_date: from, to_date: to }
                });

                const report = response.data.profit_and_loss;
                const flattened = Array.isArray(report) ? findAccountsRecursive(report) : [...(report.income_accounts || []), ...(report.expense_accounts || [])];

                reportData[orgId] = flattened.filter(acc => acc.amount !== 0);
            } catch (e) {
                console.error(`Org ${orgId} failed:`, e.response?.data || e.message);
            }
        }

        fs.writeFileSync('all_org_accounts.json', JSON.stringify(reportData, null, 2));
        console.log(`Dumped all org accounts to all_org_accounts.json`);

    } catch (err) {
        console.error('Debug failed:', err.message);
    }
}

debugAll();
