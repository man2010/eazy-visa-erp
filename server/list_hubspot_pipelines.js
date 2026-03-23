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
        const response = await axios.get('https://api.hubapi.com/crm/v3/pipelines/deals', {
            headers: { Authorization: `Bearer ${hubspotToken}` }
        });

        const pipelines = response.data.results;
        const output = pipelines.map(p => ({
            id: p.id,
            label: p.label,
            stages: p.stages.map(s => ({ id: s.id, label: s.label }))
        }));

        fs.writeFileSync('hubspot_pipelines.json', JSON.stringify(output, null, 2));
        console.log('Saved to hubspot_pipelines.json');

    } catch (err) {
        console.error('Error:', err.response?.data || err.message);
    }
}

run();
