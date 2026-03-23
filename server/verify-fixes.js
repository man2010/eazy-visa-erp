const axios = require('axios');

async function testFixes() {
    const baseUrl = 'http://localhost:5000';
    const orgId = '873088744';

    console.log('--- Verifying API Fixes ---');

    console.log('\n1. Testing Zoho Finance Dashboard (Recursive Processing)...');
    try {
        const res = await axios.get(`${baseUrl}/api/zoho/finance/dashboard`, {
            params: {
                organization_id: orgId,
                from: '2023-01-01',
                to: '2026-12-31'
            }
        });
        console.log('[OK] Finance Dashboard fetched.');
        require('fs').writeFileSync('verify_result.json', JSON.stringify(res.data, null, 2));
        console.log('Detailed result saved to verify_result.json');
    } catch (e) {
        console.error('[FAIL] Finance Summary failed:', e.response?.data || e.message);
    }

    console.log('\n2. Testing HubSpot Sales Summary (Retries & Delays)...');
    try {
        const res = await axios.get(`${baseUrl}/api/hubspot/sales/summary`);
        console.log('[OK] Sales Summary fetched.');
    } catch (e) {
        console.error('[FAIL] Sales Summary failed:', e.response?.data || e.message);
    }

    console.log('\n3. Testing Dashboard Overview...');
    try {
        const res = await axios.get(`${baseUrl}/api/dashboard/overview`, { params: { organization_id: orgId } });
        console.log('[OK] Dashboard Overview fetched.');
    } catch (e) {
        console.error('[FAIL] Dashboard Overview failed:', e.response?.data || e.message);
    }
}

testFixes();
