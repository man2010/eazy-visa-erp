const axios = require('axios');

async function checkEndpoint() {
    try {
        const res = await axios.get('http://localhost:5000/api/hubspot/sales/summary?from=2026-02-01&to=2026-02-28');
        console.log('Status:', res.status);
        console.log('Data keys:', Object.keys(res.data.data || {}));
        console.log('Total Contacts:', res.data.data?.total_contacts_count);
        console.log('Owner Stats Count:', res.data.data?.owner_stats?.length);
        if (res.data.data?.owner_stats?.length > 0) {
            console.log('First Owner Sample:', res.data.data.owner_stats[0]);
        }
    } catch (err) {
        console.error('Endpoint Error:', err.response?.data || err.message);
    }
}

checkEndpoint();
