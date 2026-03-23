const axios = require('axios');
require('dotenv').config();

async function checkCallResults() {
    const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
    if (!token) return;

    try {
        console.log("Fetching recent calls to check 'hs_call_result' values...");
        const response = await axios.post(
            `https://api.hubapi.com/crm/v3/objects/calls/search`,
            {
                filterGroups: [],
                properties: ['hs_call_result', 'hs_call_status', 'hs_call_body', 'hubspot_owner_id'],
                limit: 20
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const calls = response.data.results || [];
        console.log(`Fetched ${calls.length} calls.`);

        const resultsCount = {};
        calls.forEach(c => {
            const res = c.properties.hs_call_result || 'MISSING';
            const status = c.properties.hs_call_status || 'MISSING';
            console.log(`- Call ID: ${c.id}: Status=${status}, Result=${res}`);

            if (!resultsCount[res]) resultsCount[res] = 0;
            resultsCount[res]++;
        });

        console.log("\nDistribution of hs_call_result:");
        console.log(JSON.stringify(resultsCount, null, 2));

    } catch (e) {
        console.error(e.message);
    }
}

checkCallResults();
