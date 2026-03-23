const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

async function diagnose() {
    const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
    if (!token) {
        console.error("Missing HUBSPOT_PRIVATE_APP_TOKEN");
        return;
    }

    const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    const results = {
        activeOwners: [],
        archivedOwners: [],
        deals: [],
        errors: []
    };

    try {
        console.log("1. Fetching Active Owners...");
        try {
            const ownersRes = await axios.get('https://api.hubapi.com/crm/v3/owners/', { headers });
            results.activeOwners = ownersRes.data.results || [];
            console.log(`✓ Found ${results.activeOwners.length} active owners.`);
        } catch (e) {
            console.error("✗ Error fetching active owners:", e.message);
            results.errors.push({ step: "activeOwners", error: e.message, data: e.response?.data });
        }

        console.log("2. Fetching Archived Owners (using ?archived=true)...");
        try {
            const archivedRes = await axios.get('https://api.hubapi.com/crm/v3/owners/?archived=true', { headers });
            results.archivedOwners = archivedRes.data.results || [];
            console.log(`✓ Found ${results.archivedOwners.length} archived owners.`);
        } catch (e) {
            console.error("✗ Error fetching archived owners:", e.message);
            results.errors.push({ step: "archivedOwners", error: e.message, data: e.response?.data });
        }

        console.log("3. Fetching Deals...");
        try {
            const dealsRes = await axios.post('https://api.hubapi.com/crm/v3/objects/deals/search', {
                limit: 100,
                properties: ['hubspot_owner_id', 'dealname']
            }, { headers });
            results.deals = dealsRes.data.results || [];
            console.log(`✓ Fetched ${results.deals.length} deals.`);
        } catch (e) {
            console.error("✗ Error fetching deals:", e.message);
            results.errors.push({ step: "deals", error: e.message, data: e.response?.data });
        }

    } catch (error) {
        console.error("Global Error during diagnosis:", error.message);
        results.errors.push({ step: "global", error: error.message });
    }

    fs.writeFileSync('hubspot-diag-results-detailed.json', JSON.stringify(results, null, 2));
    console.log("Detailed diagnosis results saved to hubspot-diag-results-detailed.json");
}

diagnose();
