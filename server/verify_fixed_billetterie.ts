import { Request, Response } from 'express';
import { getBilletterieCommercialSummary } from './src/controllers/hubspotController';
import { getBilletterieFinanceSummary } from './src/controllers/zohoController';
import dotenv from 'dotenv';
dotenv.config();

const mockRes = () => {
    const res: any = {};
    res.status = (code: number) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data: any) => {
        console.log("RESPONSE DATA:", JSON.stringify(data, null, 2));
        return res;
    };
    return res;
};

async function run() {
    console.log("=== Verifying Commercial Summary ===");
    const reqComm: any = { query: { from: '2024-01-01', to: '2024-12-31' } };
    await getBilletterieCommercialSummary(reqComm as Request, mockRes());
    
    console.log("=== Verifying Finance Summary ===");
    const reqFin: any = { query: { from: '2024-01-01', to: '2024-12-31' } };
    await getBilletterieFinanceSummary(reqFin as Request, mockRes());
}

run().catch(console.error);
