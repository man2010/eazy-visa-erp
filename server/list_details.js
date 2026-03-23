const axios = require('axios');
const fs = require('fs');
const path = require('path');

const envPath = 'c:\\Users\\21623\\Downloads\\dashboard-project-main\\dashboard-project-main\\server\\.env';
const content = fs.readFileSync(envPath, 'utf8');
const env = {};
content.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        env[parts[0].trim()] = parts[1].trim();
    }
});

const zohoConfig = {
    apiBase: env.ZOHO_API_BASE || 'https://www.zohoapis.com',
    accountsUrl: env.ZOHO_ACCOUNTS_URL || 'https://accounts.zoho.com',
    clientId: env.ZOHO_CLIENT_ID,
    clientSecret: env.ZOHO_CLIENT_SECRET,
    refreshToken: env.ZOHO_REFRESH_TOKEN,
};

const hubspotToken = env.HUBSPOT_PRIVATE_APP_TOKEN;

async function getZohoToken() {
    const response = await axios.post(`${zohoConfig.accountsUrl}/oauth/v2/token`, null, {
        params: {
            refresh_token: zohoConfig.refreshToken,
            client_id: zohoConfig.clientId,
            client_secret: zohoConfig.clientSecret,
            grant_type: 'refresh_token',
        },
    });
    return response.data.access_token;
}

async function run() {
    try {
        // Zoho
        const zToken = await getZohoToken();
        console.log('--- ZOHO ORGANIZATIONS ---');
        const zRes = await axios.get(`${zohoConfig.apiBase}/books/v3/organizations`, {
            headers: { Authorization: `Zoho-oauthtoken ${zToken}` }
        });
        zRes.data.organizations.forEach(o => {
            console.log(`[Zoho] ID: ${o.organization_id} | Name: ${o.name}`);
        });

        // HubSpot
        console.log('\n--- HUBSPOT PIPELINES ---');
        const hRes = await axios.get('https://api.hubapi.com/crm/v3/pipelines/deals', {
            headers: { Authorization: `Bearer ${hubspotToken}` }
        });
        hRes.data.results.forEach(p => {
            console.log(`[HubSpot] ID: ${p.id} | Label: ${p.label}`);
        });

    } catch (err) {
        console.error('Error:', err.response?.data || err.message);
    }
}

run();
