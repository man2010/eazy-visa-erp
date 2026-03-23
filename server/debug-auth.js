const axios = require('axios');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

// 1. Load .env
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log(`✅ Loaded .env from: ${envPath}`);
} else {
    console.error(`❌ .env file not found at: ${envPath}`);
    process.exit(1);
}

// 2. config
const config = {
    accountsUrl: process.env.ZOHO_ACCOUNTS_URL,
    clientId: process.env.ZOHO_CLIENT_ID,
    clientSecret: process.env.ZOHO_CLIENT_SECRET,
    refreshToken: process.env.ZOHO_REFRESH_TOKEN,
};

console.log('--- CONFIG CHECK ---');
console.log('Accounts URL:', config.accountsUrl);
console.log('Client ID:', config.clientId ? 'Present' : 'MISSING');
console.log('Client Secret:', config.clientSecret ? 'Present' : 'MISSING');
console.log('Refresh Token:', config.refreshToken ? 'Present' : 'MISSING');
console.log('--------------------');

// 3. Test Auth
async function testAuth() {
    try {
        console.log('🔄 Attempting to refresh token...');
        const url = `${config.accountsUrl}/oauth/v2/token`;
        const params = new URLSearchParams();
        params.append('refresh_token', config.refreshToken);
        params.append('client_id', config.clientId);
        params.append('client_secret', config.clientSecret);
        params.append('grant_type', 'refresh_token');

        const response = await axios.post(url, params);

        if (response.data.access_token) {
            console.log('✅ SUCCESS! Access Token retrieved.');
            console.log('Token (first 10 chars):', response.data.access_token.substring(0, 10) + '...');
        } else {
            console.error('❌ FAILED to get access token. Response:', response.data);
        }

    } catch (error) {
        console.error('❌ ERROR calling Zoho Auth:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Message:', error.message);
        }
    }
}

testAuth();
