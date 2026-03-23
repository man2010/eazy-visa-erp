// Force DNS resolution before starting server
// This helps when Node.js has stale DNS cache

const dns = require('dns');
const { promisify } = require('util');
const resolve4 = promisify(dns.resolve4);

const CRITICAL_DOMAINS = [
    'api.hubapi.com',
    'accounts.zoho.com',
    'www.zohoapis.com'
];

async function warmupDNS() {
    console.log('🔍 Pre-warming DNS cache...');

    for (const domain of CRITICAL_DOMAINS) {
        try {
            const addresses = await resolve4(domain);
            console.log(`  ✓ ${domain}: ${addresses[0]}`);
        } catch (error) {
            console.error(`  ✗ ${domain}: ${error.code || error.message}`);
            console.error(`\n⚠️  WARNING: Cannot resolve ${domain}. Server may fail to start.\n`);
        }
    }

    console.log('✅ DNS warmup complete\n');
}

// Run DNS warmup, then start server
warmupDNS()
    .then(() => {
        // Load ts-node to handle TypeScript files
        require('ts-node/register');
        // Now require the actual server
        require('./server.ts');
    })
    .catch((error) => {
        console.error('❌ DNS warmup failed:', error);
        process.exit(1);
    });
