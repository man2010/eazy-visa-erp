const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const token = process.env.ZOHO_REFRESH_TOKEN;
const clientId = process.env.ZOHO_CLIENT_ID;
const secret = process.env.ZOHO_CLIENT_SECRET;
const orgId = '873088744';

async function verify() {
    try {
        const tResp = await axios.post('https://accounts.zoho.com/oauth/v2/token', null, {
            params: {
                refresh_token: token,
                client_id: clientId,
                client_secret: secret,
                grant_type: 'refresh_token'
            }
        });
        const accessToken = tResp.data.access_token;
        const headers = { Authorization: `Zoho-oauthtoken ${accessToken}` };

        const from = '2026-02-01';
        const to = '2026-02-25';

        const plResp = await axios.get('https://www.zohoapis.com/books/v3/reports/profitandloss', {
            headers,
            params: { organization_id: orgId, from_date: from, to_date: to }
        });

        fs.writeFileSync('zoho_pl_raw.json', JSON.stringify(plResp.data, null, 2));
        console.log('P&L data dumped to zoho_pl_raw.json');

    } catch (err) {
        console.error('Error:', err.response?.data || err.message);
    }
}

verify();
