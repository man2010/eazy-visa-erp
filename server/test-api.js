const axios = require('axios');

async function testApi() {
    // Test Zoho
    try {
        console.log('Testing ZOHO (/api/finance/summary)...');
        const resZoho = await axios.get('http://localhost:5000/api/finance/summary?organization_id=910367975');
        console.log('✅ Zoho Success:', resZoho.data.success);
    } catch (error) {
        console.log('❌ Zoho Failed:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
    }

    // Test HubSpot
    try {
        console.log('\nTesting HUBSPOT (/api/sales/summary)...');
        const resHub = await axios.get('http://localhost:5000/api/sales/summary');
        console.log('✅ HubSpot Success:', resHub.data.success);
    } catch (error) {
        console.log('❌ HubSpot Failed:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
    }
}

testApi();
