import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// 1. Load Environment Variables FIRST
// Try multiple paths to find .env
const envPaths = [
    path.resolve(__dirname, '../.env'),        // Standard ts-node src/server.ts
    path.resolve(__dirname, '../../.env'),     // Nested?
    path.resolve(process.cwd(), '.env'),       // Running from server/
    path.resolve(process.cwd(), 'server/.env') // Running from root
];

// Load .env before importing any other files that might use process.env
let envLoaded = false;
for (const p of envPaths) {
    if (fs.existsSync(p)) {
        dotenv.config({ path: p });
        console.log(`✅ Loaded .env from: ${p}`);
        envLoaded = true;
        break;
    }
}

if (!envLoaded) {
    console.error('❌ CRITICAL: Could not find .env file! Checked:', envPaths);
}

// 2. Import Routes (now that ENV is loaded)
import authRoutes from './routes/auth';
import zohoRoutes from './routes/zoho';
import hubspotRoutes from './routes/hubspot';
import dashboardRoutes from './routes/dashboard';
import employeeRoutes from './routes/employees';
import attendanceRoutes from './routes/attendanceRoutes';
import billetterieRoutes from './routes/billetterie';

console.log('--- ENV DEBUG ---');
console.log('ZOHO_API_BASE:', process.env.ZOHO_API_BASE);
console.log('ZOHO_ORG_IDS:', process.env.ZOHO_ORG_IDS ? 'Found' : 'Missing');
console.log('-----------------');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); // Allow frontend to connect
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/api/zoho', zohoRoutes);    // Exposes /api/zoho/finance/summary
app.use('/api/hubspot', hubspotRoutes); // Exposes /api/hubspot/sales/summary, /api/hubspot/support/summary
app.use('/api/dashboard', dashboardRoutes);
app.use('/api', employeeRoutes); // Exposes /api/employees/*
app.use('/api/attendance', attendanceRoutes);
app.use('/api/billetterie', billetterieRoutes);

app.get('/', (req, res) => {
  res.send('Dashboard Backend is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
