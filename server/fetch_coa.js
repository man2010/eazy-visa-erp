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

async function fetchChartOfAccounts() {
    try {
        const token = await getAccessToken();
        const orgIds = (env.ZOHO_ORG_IDS || '').split(',').map(id => id.trim()).filter(id => id);

        let allAccountsData = {};

        for (const orgId of orgIds) {
            console.log(`Fetching Chart of Accounts for Org ${orgId}...`);
            try {
                const response = await axios.get(`${config.apiBase}/books/v3/chartofaccounts`, {
                    headers: { Authorization: `Zoho-oauthtoken ${token}` },
                    params: { organization_id: orgId }
                });

                const accounts = response.data.chartofaccounts || [];
                allAccountsData[orgId] = accounts.map(acc => ({
                    name: acc.account_name,
                    code: acc.account_code,
                    type: acc.account_type
                }));
            } catch (e) {
                console.error(`Org ${orgId} failed:`, e.response?.data || e.message);
            }
        }

        fs.writeFileSync('chart_of_accounts.json', JSON.stringify(allAccountsData, null, 2));
        console.log(`Dumped COA to chart_of_accounts.json`);

    } catch (err) {
        console.error('Debug failed:', err.message);
    }
}

fetchChartOfAccounts();
