// Test de connectivité API depuis Node.js
// Ce script teste si Node.js peut atteindre les APIs HubSpot et Zoho

const axios = require('axios');
const dns = require('dns').promises;

const DOMAINS = [
    'api.hubapi.com',
    'accounts.zoho.eu',
    'www.zohoapis.eu'
];

const ENDPOINTS = [
    { name: 'HubSpot API', url: 'https://api.hubapi.com' },
    { name: 'Zoho Accounts EU', url: 'https://accounts.zoho.eu' },
    { name: 'Zoho APIs EU', url: 'https://www.zohoapis.eu' }
];

async function testDNS() {
    console.log('\n=== Test 1: Résolution DNS ===');
    for (const domain of DOMAINS) {
        try {
            const addresses = await dns.resolve4(domain);
            console.log(`✓ ${domain}: ${addresses.join(', ')}`);
        } catch (error) {
            console.error(`✗ ${domain}: ÉCHEC - ${error.code || error.message}`);
        }
    }
}

async function testHTTPS() {
    console.log('\n=== Test 2: Requêtes HTTPS ===');
    for (const endpoint of ENDPOINTS) {
        try {
            const response = await axios.get(endpoint.url, {
                timeout: 10000,
                validateStatus: () => true // Accepter tous les codes de statut
            });
            console.log(`✓ ${endpoint.name}: HTTP ${response.status}`);
        } catch (error) {
            if (error.code === 'ENOTFOUND') {
                console.error(`✗ ${endpoint.name}: DNS non résolu (ENOTFOUND)`);
            } else if (error.code === 'ETIMEDOUT') {
                console.error(`✗ ${endpoint.name}: Timeout - connexion bloquée`);
            } else if (error.code === 'ECONNREFUSED') {
                console.error(`✗ ${endpoint.name}: Connexion refusée`);
            } else {
                console.error(`✗ ${endpoint.name}: ${error.code || error.message}`);
            }
        }
    }
}

async function testWithAuth() {
    console.log('\n=== Test 3: Requêtes authentifiées ===');

    // Charger les variables d'environnement
    require('dotenv').config();

    const hubspotToken = process.env.HUBSPOT_PRIVATE_APP_TOKEN;

    if (hubspotToken) {
        try {
            const response = await axios.get('https://api.hubapi.com/crm/v3/objects/contacts', {
                headers: {
                    'Authorization': `Bearer ${hubspotToken}`,
                    'Content-Type': 'application/json'
                },
                params: { limit: 1 },
                timeout: 10000
            });
            console.log(`✓ HubSpot API (authentifié): HTTP ${response.status} - ${response.data.results?.length || 0} contacts`);
        } catch (error) {
            if (error.response) {
                console.error(`✗ HubSpot API: HTTP ${error.response.status} - ${error.response.data?.message || 'Erreur API'}`);
            } else {
                console.error(`✗ HubSpot API: ${error.code || error.message}`);
            }
        }
    } else {
        console.log('⚠ Token HubSpot non configuré - test ignoré');
    }
}

async function runDiagnostics() {
    console.log('=== Diagnostic de connectivité API - Node.js ===');
    console.log(`Node.js version: ${process.version}`);
    console.log(`Plateforme: ${process.platform}`);

    await testDNS();
    await testHTTPS();
    await testWithAuth();

    console.log('\n=== Fin du diagnostic ===\n');
}

runDiagnostics().catch(console.error);
