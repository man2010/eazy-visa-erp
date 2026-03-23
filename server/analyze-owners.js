const fs = require('fs');

try {
    const rawData = fs.readFileSync('hubspot-diag-results.json');
    const data = JSON.parse(rawData);

    const owners = data.owners || [];
    const deals = data.deals || [];

    const ownerIds = new Set(owners.map(o => o.id));
    const missingOwners = new Set();
    const dealsWithMissingOwners = [];

    deals.forEach(deal => {
        const ownerId = deal.properties.hubspot_owner_id;
        if (ownerId && !ownerIds.has(ownerId)) {
            missingOwners.add(ownerId);
            dealsWithMissingOwners.push({
                deal: deal.properties.dealname,
                ownerId: ownerId
            });
        }
    });

    console.log("Analysis of hubspot-diag-results.json:");
    console.log(`Total Owners Fetched: ${owners.length}`);
    console.log(`Total Deals Checked: ${deals.length}`);
    console.log(`Unique Missing Owner IDs: ${missingOwners.size}`);

    if (missingOwners.size > 0) {
        console.log("Missing Owner IDs:", Array.from(missingOwners));
        console.log("Sample Deals with missing owners:");
        dealsWithMissingOwners.slice(0, 5).forEach(d => console.log(` - ${d.deal} (ID: ${d.ownerId})`));
    } else {
        console.log("All deal owners are present in the owners list!");
    }

} catch (e) {
    console.error("Error reading/parsing file:", e.message);
}
