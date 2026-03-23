const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Basic env parser since we are in a script
function loadEnv() {
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) return {};
    const content = fs.readFileSync(envPath, 'utf8');
    const config = {};
    content.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length === 2) {
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
    console.log(`[Debug] Refreshing token...`);
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

async function debugData() {
    try {
        const token = await getAccessToken();
        const orgIds = (env.ZOHO_ORG_IDS || '').split(',');

        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const today = now.toISOString().split('T')[0];

        console.log(`[Debug] Testing Period: ${firstDay} to ${today}`);

        for (const orgId of orgIds) {
            const trimmedOrgId = orgId.trim();
            if (!trimmedOrgId) continue;

            console.log(`\n--- Checking Organization: ${trimmedOrgId} ---`);

            // 1. Check Invoices
            try {
                const invRes = await axios.get(`${config.apiBase}/books/v3/invoices`, {
                    headers: { Authorization: `Zoho-oauthtoken ${token}` },
                    params: { organization_id: trimmedOrgId, date_start: firstDay, date_end: today, per_page: 200 }
                });
                const invoices = invRes.data.invoices || [];
                console.log(`Invoices found: ${invoices.length}`);
                if (invoices.length > 0) {
                    console.log(`Example Status: ${invoices[0].status}, Total: ${invoices[0].total}`);
                    const valid = invoices.filter(i => i.status !== 'void' && i.status !== 'draft');
                    console.log(`Valid Invoices (Non-draft/void): ${valid.length}`);
                    const totalRev = valid.reduce((sum, i) => sum + i.total, 0);
                    console.log(`Total Revenue: ${totalRev}`);
                }
            } catch (e) {
                console.error(`Error fetching invoices for ${trimmedOrgId}:`, e.response?.data || e.message);
            }

            // 2. Check Expenses
            try {
                const expRes = await axios.get(`${config.apiBase}/books/v3/expenses`, {
                    headers: { Authorization: `Zoho-oauthtoken ${token}` },
                    params: { organization_id: trimmedOrgId, date_start: firstDay, date_end: today, per_page: 200 }
                });
                const expenses = expRes.data.expenses || [];
                console.log(`Expenses found: ${expenses.length}`);
                if (expenses.length > 0) {
                    console.log(`Example Description: ${expenses[0].description}, Total: ${expenses[0].total}`);
                    const totalExp = expenses.reduce((sum, i) => sum + i.total, 0);
                    console.log(`Total Expenses: ${totalExp}`);
                }
            } catch (e) {
                console.error(`Error fetching expenses for ${trimmedOrgId}:`, e.response?.data || e.message);
            }
        }
    } catch (err) {
        console.error('Debug failed:', err.message);
    }
}

debugData();
