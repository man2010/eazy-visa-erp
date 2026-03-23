const axios = require('axios');
const fs = require('fs');
const path = require('path');

const envPath = 'c:\\Users\\21623\\Downloads\\dashboard-project-main\\dashboard-project-main\\server\\.env';
const content = fs.readFileSync(envPath, 'utf8');
const env = {};
content.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        env[parts[0].trim()] = parts[1].trim();
    }
});

const hubspotToken = env.HUBSPOT_PRIVATE_APP_TOKEN;

async function run() {
    try {
        const response = await axios.post('https://api.hubapi.com/crm/v3/objects/deals/search', {
            filterGroups: [{
                filters: [{
                    propertyName: 'dealname',
                    operator: 'CONTAINS_TOKEN',
                    value: 'billet'
                }]
            }],
            limit: 10,
            properties: ['dealname', 'amount', 'dealstage', 'pipeline']
        }, {
            headers: { Authorization: `Bearer ${hubspotToken}` }
        });

        fs.writeFileSync('billetterie_deals.json', JSON.stringify(response.data.results, null, 2));
        console.log(`Found ${response.data.total} deals. Saved to billetterie_deals.json`);

    } catch (err) {
        console.error('Error:', err.response?.data || err.message);
    }
}

run();
