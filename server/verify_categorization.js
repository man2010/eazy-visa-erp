const fs = require('fs');

const allAccounts = JSON.parse(fs.readFileSync('all_org_accounts.json', 'utf8'));

const revenueByService = {
    'Livres (7010)': 0,
    'Visa (7062)': 0,
    'Langue (7061)': 0,
    'Billetterie (7070)': 0,
    'Autres': 0
};

const chargesByNature = {
    'Loyer (6220)': 0,
    'Salaires (4220)': 0,
    'Fournitures (6047/54)': 0,
    'Autres': 0
};

function processAccounts(orgId, accounts) {
    accounts.forEach((acc) => {
        const name = (acc.name || acc.account_name || '').toLowerCase();
        const code = acc.code || acc.account_code || '';
        const amount = acc.amount !== undefined ? acc.amount : (acc.total || 0);

        const isRevenue = code.startsWith('7') || name.includes('produit') || name.includes('vente') || name.includes('commission');
        const isExpense = code.startsWith('6') || code.startsWith('422') || name.includes('charge') || name.includes('achat') || name.includes('loyer') || name.includes('salaire');

        if (isRevenue) {
            const isPrincipalOrg = orgId === '873088744';

            if (code.startsWith('701') || name.includes('livre')) {
                revenueByService['Livres (7010)'] += amount;
            } else if (code.startsWith('7062') || name.includes('visa')) {
                revenueByService['Visa (7062)'] += amount;
            } else if (code.startsWith('7061') || name.includes('langue') || name.includes('cours')) {
                revenueByService['Langue (7061)'] += amount;
            } else if (code.startsWith('707') || name.includes('billet') || name.includes('commission')) {
                revenueByService['Billetterie (7070)'] += amount;
            } else if (code === '70' || code === '706' || code === '7060') {
                if (isPrincipalOrg || name.includes('service') || name.includes('vente')) {
                    revenueByService['Visa (7062)'] += amount;
                } else {
                    revenueByService['Autres'] += amount;
                }
            } else {
                revenueByService['Autres'] += amount;
            }
        } else if (isExpense) {
            if (code.startsWith('622') || name.includes('loyer') || name.includes('location')) {
                chargesByNature['Loyer (6220)'] += amount;
            } else if (code.startsWith('422') || code.startsWith('66') || name.includes('salaire') || name.includes('rémunération')) {
                chargesByNature['Salaires (4220)'] += amount;
            } else if (code.startsWith('6047') || code.startsWith('6054') || code.startsWith('6011') || name.includes('fourniture')) {
                chargesByNature['Fournitures (6047/54)'] += amount;
            } else {
                chargesByNature['Autres'] += Math.abs(amount);
            }
        }
    });
}

// Process all orgs
Object.entries(allAccounts).forEach(([orgId, accounts]) => processAccounts(orgId, accounts));

console.log('--- Final Revenue Breakdown ---');
console.log(JSON.stringify(revenueByService, null, 2));

console.log('--- Final Charges Breakdown ---');
console.log(JSON.stringify(chargesByNature, null, 2));
