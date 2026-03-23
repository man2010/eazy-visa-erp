const axios = require('axios');
const fs = require('fs');

const envPath = 'c:\\Users\\21623\\Downloads\\dashboard-project-main\\dashboard-project-main\\server\\.env';
const content = fs.readFileSync(envPath, 'utf8');
const env = {};
content.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        env[parts[0].trim()] = parts[1].trim();
    }
});

async function debugInvoices() {
    const orgId = '910367975'; // Eazy Voyage
    const token = env.ZOHO_REFRESH_TOKEN; // Wait, need access token

    // I will use a script that uses the existing auth logic or just run a temporary edit on the controller to log data
    console.log('I will add a log to the controller to see the line items.');
}

// Better: create a standalone script that refreshes token
async function getAccessToken() {
    const response = await axios.post('https://accounts.zoho.com/oauth/v2/token', null, {
        params: {
            refresh_token: env.ZOHO_REFRESH_TOKEN,
            client_id: env.ZOHO_CLIENT_ID,
            client_secret: env.ZOHO_CLIENT_SECRET,
            grant_type: 'refresh_token',
        }
    });
    return response.data.access_token;
}

async function run() {
    try {
        const token = await getAccessToken();
        const orgId = '910367975';
        const headers = { Authorization: `Zoho-oauthtoken ${token}` };

        console.log(`Fetching 5 invoices from Org ${orgId}...`);
        const resp = await axios.get(`https://www.zohoapis.com/books/v3/invoices`, {
            headers,
            params: { organization_id: orgId, per_page: 5 }
        });

        const invoices = resp.data.invoices || [];
        for (const inv of invoices) {
            console.log(`\nInvoice ${inv.invoice_number} (${inv.invoice_id}):`);
            const details = await axios.get(`https://www.zohoapis.com/books/v3/invoices/${inv.invoice_id}`, {
                headers,
                params: { organization_id: orgId }
            });
            const lineItems = details.data.invoice.line_items || [];
            lineItems.forEach(item => {
                console.log(`  - Account: ${item.account_name}, Code: ${item.account_code}, ID: ${item.account_id}, Total: ${item.item_total}`);
            });
        }
    } catch (err) {
        console.error('Error:', err.response?.data || err.message);
    }
}

run();
