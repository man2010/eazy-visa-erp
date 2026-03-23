const axios = require('axios');

async function verify() {
    try {
        console.log('--- Verifying Finance Dashboard Endpoint ---');
        const response = await axios.get('http://localhost:5000/api/zoho/finance/dashboard', {
            params: { organization_id: '910367975' }
        });

        const data = response.data;
        if (data.success === true) {
            console.log('SUCCESS: API returned data.');
            console.log('Aging Receivables:', JSON.stringify(data.data.agingReceivables, null, 2));
            console.log('Aging Payables:', JSON.stringify(data.data.agingPayables, null, 2));
        } else {
            console.log('FAILED: API returned error:', data.error?.message || 'Unknown error');
        }
    } catch (error) {
        console.error('Connection Failed:', error.message);
    }
}

verify();
