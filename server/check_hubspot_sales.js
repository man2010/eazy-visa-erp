const axios = require('axios');
const fs = require('fs');
const path = require('path');

function loadEnv() {
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) return {};
    const content = fs.readFileSync(envPath, 'utf8');
    const config = {};
    content.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            config[parts[0].trim()] = parts[1].trim();
        }
    });
    return config;
}

const env = loadEnv();

async function checkHubSpot() {
    try {
        const token = env.HUBSPOT_PRIVATE_APP_TOKEN;
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

        console.log(`[HubSpot Check] From ${new Date(firstDay).toISOString()}`);

        const filterGroups = [{
            filters: [
                { propertyName: 'dealstage', operator: 'EQ', value: 'closedwon' },
                { propertyName: 'closedate', operator: 'GTE', value: firstDay.toString() }
            ]
        }];

        const response = await axios.post('https://api.hubapi.com/crm/v3/objects/deals/search', {
            filterGroups,
            limit: 100
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log(`HubSpot Won Deals this month: ${response.data.total}`);

    } catch (err) {
        console.error('HubSpot Check failed:', err.response?.data || err.message);
    }
}

checkHubSpot();
