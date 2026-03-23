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
            sorts: [{ propertyName: 'createdate', direction: 'DESCENDING' }],
            limit: 10,
            properties: ['dealname', 'amount', 'dealtype', 'pipeline', 'dealstage']
        }, {
            headers: { Authorization: `Bearer ${hubspotToken}` }
        });

        fs.writeFileSync('recent_deals.json', JSON.stringify(response.data.results, null, 2));
        console.log('Saved to recent_deals.json');

    } catch (err) {
        console.error('Error:', err.response?.data || err.message);
    }
}

run();
