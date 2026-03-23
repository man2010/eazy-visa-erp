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
        const response = await axios.get('https://api.hubapi.com/crm/v3/properties/contacts', {
            headers: { Authorization: `Bearer ${hubspotToken}` }
        });

        const properties = response.data.results.map(p => ({
            name: p.name,
            label: p.label,
            type: p.type,
            fieldType: p.fieldType
        }));

        fs.writeFileSync('hubspot_contact_props.json', JSON.stringify(properties, null, 2));
        console.log('Saved to hubspot_contact_props.json');

    } catch (err) {
        console.error('Error:', err.response?.data || err.message);
    }
}

run();
