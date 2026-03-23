const axios = require('axios');
require('dotenv').config();

// Mock successResponse and errorResponse
const successResponse = (data) => ({ success: true, data });
const errorResponse = (code, message) => ({ success: false, code, message });

const getHubSpotConfig = () => ({
    apiBase: process.env.HUBSPOT_API_BASE || 'https://api.hubapi.com',
    accessToken: process.env.HUBSPOT_PRIVATE_APP_TOKEN
});

const getHubSpotHeaders = () => ({
    Authorization: `Bearer ${getHubSpotConfig().accessToken}`,
    'Content-Type': 'application/json',
});

const hubspotRequest = async (method, url, data, headers) => {
    if (method === 'post') return await axios.post(url, data, { headers });
    return await axios.get(url, { headers });
};

const searchHubSpot = async (objectType, filters, properties = []) => {
    const config = getHubSpotConfig();
    const response = await hubspotRequest(
        'post',
        `${config.apiBase}/crm/v3/objects/${objectType}/search`,
        { filterGroups: [{ filters }], properties, limit: 100 },
        getHubSpotHeaders()
    );
    return response.data;
};

async function debug() {
    const from = '2026-02-01';
    const to = '2026-02-28';

    console.log(`Testing with date range: ${from} to ${to}`);

    const fromDate = new Date(from);
    fromDate.setHours(0, 0, 0, 0);
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);

    const dateFilters = [{
        propertyName: 'createdate',
        operator: 'BETWEEN',
        highValue: String(toDate.getTime()),
        value: String(fromDate.getTime())
    }];

    try {
        const contacts = await searchHubSpot('contacts', dateFilters);
        console.log('Contacts found:', contacts.total);

        const won = await searchHubSpot('deals', [
            ...dateFilters,
            { propertyName: 'hs_is_closed_won', operator: 'EQ', value: 'true' }
        ]);
        console.log('Won deals:', won.total);

    } catch (err) {
        console.error('Error:', err.response?.data || err.message);
    }
}

debug();
