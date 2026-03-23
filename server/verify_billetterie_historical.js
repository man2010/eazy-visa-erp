const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/billetterie';

async function verify() {
    console.log('--- Verifying Billetterie Fixes (Historical Data) ---');
    try {
        const from = '2024-01-01';
        const to = '2026-12-31';

        console.log(`\nVerifying /api/billetterie/finance?from=${from}&to=${to}...`);
        const finRes = await axios.get(`${BASE_URL}/finance`, {
            params: { from, to }
        });
        console.log('Status:', finRes.data.status);
        console.log('Revenue Total:', finRes.data.data.revenue_total);
        console.log('Invoice Count Scanned:', finRes.data.data.invoice_count);
        console.log('Note:', finRes.data.data.note);

        if (finRes.data.data.revenue_total > 0) {
            console.log('\n✅ SUCCESS: Historical financial data found.');
        } else {
            console.log('\n⚠️ No financial data found even in historical range. Check if account 7070/7072 has entries in Zoho Books.');
        }

    } catch (err) {
        console.error('Verification Failed:', err.response?.data || err.message);
    }
}

verify();
