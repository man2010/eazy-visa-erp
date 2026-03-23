const axios = require('axios');
require('dotenv').config();

const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN_BILLETTERIE?.trim();
const apiBase = 'https://api.hubapi.com';

async function explore() {
    if (!token) {
        console.error('Missing HUBSPOT_PRIVATE_APP_TOKEN_BILLETTERIE');
        return;
    }

    const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    try {
        // 1. Check total deals
        console.log('--- Checking Deals ---');
        const dealsResp = await axios.post(`${apiBase}/crm/v3/objects/deals/search`, {
            filterGroups: [],
            limit: 5
        }, { headers });
        console.log('Total Deals:', dealsResp.data.total);
        if (dealsResp.data.results.length > 0) {
            console.log('Sample Deal Properties:', Object.keys(dealsResp.data.results[0].properties));
        }

        // 2. Check total contacts
        console.log('\n--- Checking Contacts ---');
        const contactsResp = await axios.post(`${apiBase}/crm/v3/objects/contacts/search`, {
            filterGroups: [],
            limit: 5
        }, { headers });
        console.log('Total Contacts:', contactsResp.data.total);

        // 3. Check for specific properties like 'destination'
        if (contactsResp.data.results.length > 0) {
            const props = contactsResp.data.results[0].properties;
            console.log('Sample Contact "destination":', props.destination);
            console.log('Sample Contact "createdate":', props.createdate);
        }

    } catch (err) {
        console.error('Error:', err.response?.data || err.message);
    }
}

explore();
