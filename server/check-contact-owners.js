const axios = require('axios');
require('dotenv').config();

async function checkContactOwners() {
    const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
    if (!token) {
        console.error("Missing Token");
        return;
    }
    const headers = { Authorization: `Bearer ${token}` };
    const config = { apiBase: 'https://api.hubapi.com' };

    try {
        // 1. Fetch Active Owners to map names
        console.log("Fetching Active Owners...");
        const ownersRes = await axios.get(`${config.apiBase}/crm/v3/owners/`, { headers });
        const owners = ownersRes.data.results || [];
        const ownerMap = {};
        owners.forEach(o => ownerMap[o.id] = `${o.firstName} ${o.lastName}`);

        console.log(`Active Owners Count: ${Object.keys(ownerMap).length}`);

        // 2. Fetch Contacts (sample 100) and check owners
        console.log("\nFetching Contacts (limit 100)...");
        const contactsRes = await axios.post(
            `${config.apiBase}/crm/v3/objects/contacts/search`,
            {
                filterGroups: [], // No filter, get all recent
                properties: ['hubspot_owner_id', 'lifecyclestage'],
                limit: 100
            },
            { headers }
        );

        const contacts = contactsRes.data.results || [];
        console.log(`Fetched ${contactsRes.data.total} contacts (analyzing first ${contacts.length}).`);

        const ownerCounts = {};

        contacts.forEach(c => {
            const ownerId = c.properties.hubspot_owner_id || 'unassigned';
            if (!ownerCounts[ownerId]) {
                ownerCounts[ownerId] = {
                    count: 0,
                    name: ownerMap[ownerId] || `Unknown/Inactive (${ownerId})`,
                    stages: {}
                };
            }
            ownerCounts[ownerId].count++;

            const stage = c.properties.lifecyclestage || 'unknown';
            if (!ownerCounts[ownerId].stages[stage]) ownerCounts[ownerId].stages[stage] = 0;
            ownerCounts[ownerId].stages[stage]++;
        });

        console.log("\n--- Contact Ownership Distribution ---");
        Object.keys(ownerCounts).forEach(id => {
            const data = ownerCounts[id];
            console.log(`Owner: ${data.name}`);
            console.log(`  Total Contacts: ${data.count}`);
            console.log(`  Stages: ${JSON.stringify(data.stages)}`);
        });

    } catch (e) {
        console.error("Error:", e.message);
        if (e.response) console.error(JSON.stringify(e.response.data));
    }
}

checkContactOwners();
