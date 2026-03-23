const fs = require('fs');
const props = JSON.parse(fs.readFileSync('c:\\Users\\21623\\Downloads\\dashboard-project-main\\dashboard-project-main\\server\\hubspot_billetterie_props.json', 'utf8'));

const destinationProps = props.filter(p => p.label.toLowerCase().includes('destination') || p.name.toLowerCase().includes('destination'));
console.log('Destination related properties:');
console.log(JSON.stringify(destinationProps, null, 2));

const coa = JSON.parse(fs.readFileSync('c:\\Users\\21623\\Downloads\\dashboard-project-main\\dashboard-project-main\\server\\chart_of_accounts.json', 'utf8'));
const ubaOrg = '873088744';
const accounts707 = coa[ubaOrg].filter(a => a.code.startsWith('707') || a.name.toLowerCase().includes('707'));
console.log('\n707 related accounts in Org 873088744:');
console.log(JSON.stringify(accounts707, null, 2));
