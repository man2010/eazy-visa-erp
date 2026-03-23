const axios = require('axios');
require('dotenv').config();

const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
console.log('Using Token:', token ? token.substring(0, 10) + '...' : 'MISSING');

async function test() {
    try {
        const res = await axios.post('https://api.hubapi.com/crm/v3/objects/contacts/search', {
            filterGroups: [],
            limit: 5
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('Regular HubSpot Contacts:', res.data.total);
    } catch (err) {
        console.error('Error:', err.response?.data || err.message);
    }
}

test();
