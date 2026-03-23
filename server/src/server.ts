import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// 1. Load Environment Variables
dotenv.config();

// 2. Import Routes
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

app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/api/zoho', zohoRoutes);
app.use('/api/hubspot', hubspotRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/billetterie', billetterieRoutes);

app.get('/', (req, res) => {
  res.send('Dashboard Backend is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});