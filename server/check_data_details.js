const fs = require('fs');
const coa = JSON.parse(fs.readFileSync('c:\\Users\\21623\\Downloads\\dashboard-project-main\\dashboard-project-main\\server\\chart_of_accounts.json', 'utf8'));

console.log('Searching for 7070 in all orgs:');
for (const orgId in coa) {
    const acc = coa[orgId].find(a => a.code === '7070' || a.name.includes('7070'));
    if (acc) {
        console.log(`Org ${orgId}:`, acc);
    }
}

// Also check the HubSpot data to see if n1_quelle_est_votre_destination_habituelle has values
const axios = require('axios');
const envPath = 'c:\\Users\\21623\\Downloads\\dashboard-project-main\\dashboard-project-main\\server\\.env';
const content = fs.readFileSync(envPath, 'utf8');
const env = {};
content.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        env[parts[0].trim()] = parts[1].trim();
    }
});

const hubspotToken = env.HUBSPOT_PRIVATE_APP_TOKEN_BILLETTERIE;

async function checkContacts() {
    try {
        const response = await axios.post('https://api.hubapi.com/crm/v3/objects/contacts/search', {
            filterGroups: [{
                filters: [
                    { propertyName: 'n1_quelle_est_votre_destination_habituelle', operator: 'HAS_PROPERTY' }
                ]
            }],
            properties: ['n1_quelle_est_votre_destination_habituelle', 'destination'],
            limit: 10
        }, {
            headers: { Authorization: `Bearer ${hubspotToken}` }
        });
        console.log('\nContacts found with n1_quelle_est_votre_destination_habituelle:', response.data.total);
        if (response.data.results.length > 0) {
            console.log('Sample data:');
            response.data.results.forEach(c => {
                console.log(`- n1: ${c.properties.n1_quelle_est_votre_destination_habituelle}, destination: ${c.properties.destination}`);
            });
        }
    } catch (err) {
        console.error('HubSpot Error:', err.response?.data || err.message);
    }
}

checkContacts();
