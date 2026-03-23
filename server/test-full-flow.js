const axios = require('axios');

async function testFullFlow() {
    try {
        console.log('🔍 Testing /api/finance/summary...\n');

        const response = await axios.get('http://localhost:5000/api/finance/summary', {
            params: {
                organization_id: '910367975'
            }
        });

        console.log('✅ SUCCESS!');
        console.log('Response:', JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.log('❌ FAILED\n');

        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Response Data:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.log('No response received');
            console.log('Error:', error.message);
        } else {
            console.log('Error:', error.message);
        }
    }
}

testFullFlow();
