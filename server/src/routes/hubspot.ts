
import express from 'express';
import { getSalesSummary, getSupportSummary } from '../controllers/hubspotController';

const router = express.Router();

router.get('/sales/summary', getSalesSummary);
router.get('/support/summary', getSupportSummary);

export default router;
