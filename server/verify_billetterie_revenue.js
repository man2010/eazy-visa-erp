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

        // 1. Get P&L for total revenue
        const plResp = await axios.get('https://www.zohoapis.com/books/v3/reports/profitandloss', {
            headers,
            params: { organization_id: orgId, from_date: from, to_date: to }
        });

        console.log('--- Profit & Loss ---');
        const incomeCat = plResp.data.profitandloss.report_categories.find(c => c.category_name === 'Income');
        console.log('Total Income:', incomeCat?.total);

        // 2. Scan invoices for account 7072
        console.log('\n--- Scanning Invoices for Account 7072 ---');
        const invResp = await axios.get('https://www.zohoapis.com/books/v3/invoices', {
            headers,
            params: { organization_id: orgId, date_start: from, date_end: to, per_page: 200 }
        });

        const invoices = invResp.data.invoices || [];
        console.log(`Checking ${invoices.length} invoices...`);

        let billetterieTotal = 0;
        for (const inv of invoices) {
            const details = await axios.get(`https://www.zohoapis.com/books/v3/invoices/${inv.invoice_id}`, {
                headers,
                params: { organization_id: orgId }
            });
            const lines = details.data.invoice.line_items || [];
            lines.forEach(l => {
                if (String(l.account_code) === '7072' || (l.account_name && l.account_name.toLowerCase().includes('billet'))) {
                    console.log(`Found Billetterie Item in ${inv.invoice_number}: ${l.item_total}`);
                    billetterieTotal += Number(l.item_total || 0);
                }
            });
        }

        console.log('\nFinal Billetterie Total (Calc):', billetterieTotal);

    } catch (err) {
        console.error('Error:', err.response?.data || err.message);
    }
}

verify();
