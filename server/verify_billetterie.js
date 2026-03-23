const axios = require('axios');
const API_BASE = 'http://localhost:5000/api';

async function verify() {
    console.log('--- Verifying Billetterie API ---');
    try {
        const finance = await axios.get(`${API_BASE}/billetterie/finance`);
        console.log('✅ Finance Endpoint OK:', finance.data.success);
        console.log('Data:', JSON.stringify(finance.data.data, null, 2));

        const commercial = await axios.get(`${API_BASE}/billetterie/commercial`);
        console.log('\n✅ Commercial Endpoint OK:', commercial.data.success);
        console.log('Data:', JSON.stringify(commercial.data.data, null, 2));

    } catch (err) {
        console.error('❌ Verification Failed:', err.response?.data || err.message);
    }
}

verify();
