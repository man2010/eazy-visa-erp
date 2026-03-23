const axios = require('axios');
require('dotenv').config();

const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN;

async function test() {
    try {
        const res = await axios.get('https://api.hubapi.com/crm/v3/owners/', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log('Owners found:', res.data.results?.length);
    } catch (err) {
        console.error('Error:', err.response?.data || err.message);
    }
}

test();
