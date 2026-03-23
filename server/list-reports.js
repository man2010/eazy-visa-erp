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

async function listReports() {
    try {
        const token = await getAccessToken();
        console.log(`--- Listing Zoho Reports for ORG ${config.orgId} ---`);

        const url = `${config.apiBase}/books/v3/reports`;
        const res = await axios.get(url, {
            headers: { Authorization: `Zoho-oauthtoken ${token}` },
            params: {
                organization_id: config.orgId,
                JSONString: '{}'
            }
        });

        if (res.data && res.data.reports) {
            console.log('Available Reports:');
            res.data.reports.forEach(r => {
                console.log(`- ${r.report_name} (Type: ${r.report_type})`);
            });
        } else {
            console.log('No reports found in response or unexpected format:', JSON.stringify(res.data, null, 2));
        }
    } catch (error) {
        console.error('Failed to list reports:', error.response?.data || error.message);
    }
}

listReports();
