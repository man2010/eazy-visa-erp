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
        const response = await axios.get('https://api.hubapi.com/crm/v3/properties/contacts/degree', {
            headers: { Authorization: `Bearer ${hubspotToken}` }
        });

        fs.writeFileSync('degree_prop.json', JSON.stringify(response.data, null, 2));
        console.log('Saved to degree_prop.json');

    } catch (err) {
        console.error('Error:', err.response?.data || err.message);
    }
}

run();
