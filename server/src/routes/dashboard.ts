import express, { Request, Response } from 'express';
import { getFinanceDataInternal, getAggregateFinanceData, getRecentZohoActivities } from '../controllers/zohoController';
import { getSalesDataInternal, getRecentHubSpotActivities } from '../controllers/hubspotController';
import { getDepartmentBreakdownInternal } from '../controllers/employeeController';
import { successResponse, errorResponse } from '../utils/apiResponse';

const router = express.Router();

router.get('/overview', async (req: Request, res: Response) => {
    try {
        const { organization_id, from, to } = req.query;

        // organization_id is now optional. If missing or 'all', we aggregate.

        // Parallel execution for performance
        const [finance, sales, deptBreakdown, zohoActivities, hubspotActivities] = await Promise.all([
            (organization_id && organization_id !== 'all') ? 
                getFinanceDataInternal(organization_id as string, from, to) : 
                getAggregateFinanceData(from, to),
            getSalesDataInternal(from, to),
            getDepartmentBreakdownInternal(),
            getRecentZohoActivities(),
            getRecentHubSpotActivities()
        ]);

        const recent_activities = [...zohoActivities, ...hubspotActivities]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 10);

        const responseData = {
            revenue_total: finance.revenue_total,
            expenses_total: finance.expenses_total,
            unpaid_total: finance.unpaid_total,
            invoice_count: finance.invoice_count,
            monthly_sales_count: finance.invoice_count, // Use Zoho validated count
            win_rate: sales.win_rate,
            department_breakdown: deptBreakdown,
            recent_activities,
            owner_stats: sales.owner_stats
        };
        
        return res.json(successResponse(responseData));
        
    } catch (e: any) {
        console.error("Overview Error:", e);
        res.status(500).json(errorResponse("OVERVIEW_ERROR", e.message || "Failed to fetch overview"));
    }
});

export default router;
