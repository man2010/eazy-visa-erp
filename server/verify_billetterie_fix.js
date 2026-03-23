const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/billetterie';

async function verify() {
    console.log('--- Verifying Billetterie Fixes ---');
    try {
        console.log('\n1. Verifying /api/billetterie/commercial...');
        const commRes = await axios.get(`${BASE_URL}/commercial`);
        console.log('Status:', commRes.data.status);
        console.log('Customers:', commRes.data.data.customers);
        console.log('Deals:', commRes.data.data.deals);
        console.log('Top Destinations:', JSON.stringify(commRes.data.data.topDestinations, null, 2));

        console.log('\n2. Verifying /api/billetterie/finance...');
        const finRes = await axios.get(`${BASE_URL}/finance`);
        console.log('Status:', finRes.data.status);
        console.log('Revenue Total:', finRes.data.data.revenue_total);
        console.log('Invoice Count:', finRes.data.data.invoice_count);
        console.log('Note:', finRes.data.data.note);

        if (commRes.data.data.topDestinations.length > 0 || finRes.data.data.revenue_total > 0) {
            console.log('\n✅ SUCCESS: Data is now flowing into the Billetterie module.');
        } else {
            console.log('\n⚠️ WARNING: Status is OK but data might still be 0. Check date range or account activity.');
        }

    } catch (err) {
        console.error('Verification Failed:', err.response?.data || err.message);
        console.log('\n❌ Make sure the server is running on port 5000.');
    }
}

verify();
