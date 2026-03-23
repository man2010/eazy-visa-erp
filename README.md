# Dashboard 360 - KPI Integration & Cleanup

This project is a React-based dashboard integrating real-time financial and sales data from **Zoho Books** and **HubSpot**. 
It features a Node.js/Express backend that aggregates data to provide key performance indicators (KPIs) for the Overview, Finance, Sales, and Support modules.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Zoho Books Account (Client ID, Secret, Organization ID)
- HubSpot Private App Token

### 1. Backend Setup (`server/`)

The backend handles authentication and data aggregation.

```bash
cd server
npm install
cp .env.example .env
# Edit .env and fill in your ZOHO & HUBSPOT credentials
npm run build
npm start
```

**Environment Variables (`.env`)**:
- `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`: From Zoho Developer Console.
- `ZOHO_ORG_IDS`: Comma-separated list of Organization IDs (multi-org supported). The first ID is used as default.
- `HUBSPOT_PRIVATE_APP_TOKEN`: Private App Token with CRM scopes (`crm.objects.contacts.read`, `crm.objects.deals.read`, `crm.tickets.read`).
- `PORT`: 5000 (default).

### 2. Frontend Setup (`/`)

The frontend displays the KPIs and charts.

```bash
# Root directory
npm install
npm run dev
```

The frontend talks to `http://localhost:5000` by default.

---

## 📅 Default Date Logic
If `from` and `to` parameters are not provided, the API defaults to:
- **from**: Start of the current month (`YYYY-MM-01`).
- **to**: Current date (Today).
- **Zoho Filter**: The `from`/`to` range filters based on **Invoice Date** (`invoice_date`).

## 📊 Endpoints & KPI Mappings

| Module | KPI Label | Source System | API Endpoint | Logic / Filter |
| :--- | :--- | :--- | :--- | :--- |
| **Finance** | Revenus totaux | Zoho Books | `/api/finance/summary` | Sum of `invoice.total` (Status != void/draft). Filtered by `invoice_date`. |
| **Finance** | Dépenses | Zoho Books | `/api/finance/summary` | Sum of `expense.total`. |
| **Finance** | Profit net | Zoho Books | `/api/finance/summary` | Revenue - Expenses (all in Organization currency). |
| **Finance** | Impayés | Zoho Books | `/api/finance/summary` | Sum of `invoice.balance` where > 0. |
| **Sales** | Leads actifs | HubSpot | `/api/sales/summary` | `lifecyclestage` IN [lead, subscriber, mql, sql, opportunity]. |
| **Sales** | Opportunités | HubSpot | `/api/sales/summary` | Deals where `hs_is_closed` = false. |
| **Sales** | Pipeline | HubSpot | `/api/sales/summary` | Sum of Amount of open deals. |
| **Sales** | Win Rate | HubSpot | `/api/sales/summary` | (Won / (Won + Lost)) * 100. |
| **Support** | Tickets ouverts | HubSpot | `/api/support/summary` | Tickets without `closed_date`. |
| **Support** | Temps moy. | HubSpot | `/api/support/summary` | Avg `closed_date` - `createdate` for resolved tickets. |

**Aggregated Dashboard**:
- **Endpoint**: `/api/dashboard/overview`
- **Returns**: Combined metrics from Finance and Sales for the dashboard widgets.

## 🧹 Modules Removed
To streamline the dashboard, the following unused modules were **removed**:
- HR Module
- Marketing Module
- IT Module
- Visa Module

## 🛠 Tech Stack
- **Frontend**: React, Vite, TailwindCSS, Recharts, Lucide Icons, Axios.
- **Backend**: Node.js, Express, TypeScript, Axios (with caching for Zoho tokens).

## ⚠️ Notes
- **Currency**: All Finance amounts are calculated and returned in the Organization's base currency (included in response `currency_code`).
- **Data Availability**: Detailed lists (e.g., invoice rows) are placeholders pointing to the source ERPs.
- **Error Handling**: If an API is unreachable, the frontend displays "Données indisponibles" without crashing.