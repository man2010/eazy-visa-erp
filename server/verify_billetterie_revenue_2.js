const axios = require('axios');
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

        // Get P&L
        const plResp = await axios.get('https://www.zohoapis.com/books/v3/reports/profitandloss', {
            headers,
            params: { organization_id: orgId, from_date: from, to_date: to }
        });

        const pl = plResp.data.profitandloss;
        console.log('--- Profit & Loss Structure Check ---');
        if (pl.report_categories) {
            pl.report_categories.forEach(cat => {
                console.log(`Category: ${cat.category_name}, Total: ${cat.total}`);
                if (cat.category_name === 'Income') {
                    cat.sub_categories?.forEach(sub => {
                        sub.accounts?.forEach(acc => {
                            if (acc.account_code === '7072' || acc.account_name.toLowerCase().includes('billet')) {
                                console.log(` >> MATCH: ${acc.account_name} (${acc.account_code}) = ${acc.amount}`);
                            }
                        });
                    });
                }
            });
        } else {
            console.log('No report_categories found in plot. Keys:', Object.keys(pl));
        }

    } catch (err) {
        console.error('Error:', err.response?.data || err.message);
    }
}

verify();
