import express from 'express';
import { getBilletterieFinanceSummary } from '../controllers/zohoController';
import { getBilletterieCommercialSummary } from '../controllers/hubspotController';

const router = express.Router();

// GET /api/billetterie/summary
// Specialized endpoints are used instead of a single aggregate to allow better frontend loading states

// Separate endpoints are cleaner for the frontend to fetch in parallel
router.get('/finance', getBilletterieFinanceSummary);
router.get('/commercial', getBilletterieCommercialSummary);

export default router;
