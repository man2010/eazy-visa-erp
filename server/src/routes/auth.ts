import express from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const router = express.Router();

const ZOHO_AUTH_URL = 'https://accounts.zoho.com/oauth/v2/auth';
const ZOHO_TOKEN_URL = 'https://accounts.zoho.com/oauth/v2/token';

const TOKENS_FILE = path.join(__dirname, '../../tokens.json');

// Redirect to Zoho Consent Page
router.get('/zoho', (req, res) => {
  const { ZOHO_CLIENT_ID, ZOHO_REDIRECT_URI } = process.env;
  
  if (!ZOHO_CLIENT_ID || !ZOHO_REDIRECT_URI) {
    return res.status(500).json({ error: 'Missing environment variables' });
  }

  // Adjust scope as needed. Adding commonly used scopes for Books.
  const scope = 'ZohoBooks.fullaccess.all'; 
  const redirectUrl = `${ZOHO_AUTH_URL}?scope=${scope}&client_id=${ZOHO_CLIENT_ID}&response_type=code&access_type=offline&redirect_uri=${ZOHO_REDIRECT_URI}&prompt=consent`;

  res.redirect(redirectUrl);
});

// Callback to handle the code and get tokens
router.get('/callback', async (req, res) => {
  const code = req.query.code as string;
  const { ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REDIRECT_URI } = process.env;

  if (!code) {
    return res.status(400).send('No code provided');
  }

  try {
    const params = new URLSearchParams();
    params.append('code', code);
    params.append('client_id', ZOHO_CLIENT_ID || '');
    params.append('client_secret', ZOHO_CLIENT_SECRET || '');
    params.append('redirect_uri', ZOHO_REDIRECT_URI || '');
    params.append('grant_type', 'authorization_code');

    const response = await axios.post(ZOHO_TOKEN_URL, params);
    
    const tokens = response.data;
    
    if (tokens.error) {
         throw new Error(JSON.stringify(tokens));
    }

    // Save tokens to file (for demo purposes. In prod, use DB)
    fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2));

    console.log('Tokens acquired and saved.');
    res.send(`
      <h1>Intégration Réussie !</h1>
      <p>Vous êtes maintenant connecté à Zoho Books.</p>
      <p>Vous pouvez fermer cette fenêtre et retourner sur le Dashboard.</p>
    `);

  } catch (error: any) {
    console.error('Error exchanging token:', error.response?.data || error.message);
    res.status(500).send(`Error connecting to Zoho: ${JSON.stringify(error.response?.data || error.message)}`);
  }
});

// Endpoint to get the saved token (for the frontend to use)
router.get('/token', (req, res) => {
   if (fs.existsSync(TOKENS_FILE)) {
       const tokens = JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf-8'));
       res.json(tokens);
   } else {
       res.status(404).json({ error: 'No tokens found. Authenticate first.' });
   }
});

export default router;
