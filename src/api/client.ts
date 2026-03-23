
import axios from 'axios';

const API_BASE = 'https://eazy-visa-erp.onrender.com/api';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for consistent error handling or data unpacking
client.interceptors.response.use(
  (response) => {
    // If backend uses standard { success: true, data: ... } wrapper
    if (response.data && response.data.success) {
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    // Handle error gracefully
    console.error('API call failed:', error);
    return Promise.reject(error);
  }
);

export const getDashboardOverview = async (params: { organization_id?: string; from?: string; to?: string }) => {
  return client.get('/dashboard/overview', { params });
};


export const getFinanceSummary = async (params: { organization_id: string; from?: string; to?: string }) => {
  return client.get('/zoho/finance/summary', { params });
};

export const getFinanceDashboard = async (params: { organization_id: string; from?: string; to?: string }) => {
  return client.get('/zoho/finance/dashboard', { params });
};

export const getSalesSummary = async (params: { from?: string; to?: string }) => {
  return client.get('/hubspot/sales/summary', { params });
};


export const getSupportSummary = async (params: { from?: string; to?: string }) => {
  return client.get('/hubspot/support/summary', { params });
};

export const getBilletterieFinance = async (params: { from?: string; to?: string }) => {
  return client.get('/billetterie/finance', { params });
};

export const getBilletterieCommercial = async (params: { from?: string; to?: string }) => {
  return client.get('/billetterie/commercial', { params });
};
