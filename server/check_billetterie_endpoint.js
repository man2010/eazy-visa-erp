const axios = require('axios');

async function checkBilletterie() {
    try {
        const res = await axios.get('http://localhost:5000/api/billetterie/commercial?from=2026-02-01&to=2026-02-28');
        console.log('--- Billetterie Commercial ---');
        console.log('Status:', res.status);
        console.log('Data:', JSON.stringify(res.data.data, null, 2));
    } catch (err) {
        console.error('Billetterie Error:', err.response?.data || err.message);
    }
}

checkBilletterie();
