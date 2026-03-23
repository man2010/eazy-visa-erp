
import express from 'express';
import { getFinanceSummary, getFinanceDashboardData } from '../controllers/zohoController';

const router = express.Router();

router.get('/finance/summary', getFinanceSummary);
router.get('/finance/dashboard', getFinanceDashboardData);

export default router;
