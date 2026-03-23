const axios = require('axios');
require('dotenv').config();

async function checkActiveOwnersDeals() {
    const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };

    try {
        // 1. Get Active Owners
        console.log("Fetching active owners...");
        const ownersRes = await axios.get('https://api.hubapi.com/crm/v3/owners/', { headers });
        const activeOwners = ownersRes.data.results || [];
        const activeOwnerIds = activeOwners.map(o => o.id);

        console.log(`Active Owners: ${activeOwners.length}`);
        activeOwners.forEach(o => console.log(` - ${o.firstName} ${o.lastName} (${o.id})`));

        // 2. Search for deals for these owners (excluding Moudjtaba 499969438 to see if others exist)
        const otherOwnerIds = activeOwnerIds.filter(id => id !== '499969438');

        if (otherOwnerIds.length === 0) {
            console.log("No other active owners found.");
            return;
        }

        console.log("Searching for deals owned by OTHER active owners...");
        const dealsRes = await axios.post('https://api.hubapi.com/crm/v3/objects/deals/search', {
            filterGroups: [{
                filters: [{
                    propertyName: 'hubspot_owner_id',
                    operator: 'IN',
                    values: otherOwnerIds
                }]
            }],
            limit: 10
        }, { headers });

        const deals = dealsRes.data.results || [];
        console.log(`Found ${dealsRes.data.total} deals detected for other active owners.`);

        if (deals.length > 0) {
            console.log("Sample deals:");
            deals.forEach(d => console.log(` - ${d.properties.dealname} (Owner: ${d.properties.hubspot_owner_id})`));
        } else {
            console.log("Conclusion: Other active owners have NO deals.");
        }

    } catch (e) {
        console.error(e.message);
        if (e.response) console.error(JSON.stringify(e.response.data));
    }
}

checkActiveOwnersDeals();
