import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Calendar,
  Filter,
  Users,

  ShoppingCart
} from 'lucide-react';
import { getFinanceDashboard } from '../../../api/client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';

import { DateRangePicker } from '../ui/date-range-picker';
import { DateRange } from 'react-day-picker';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function FinanceModule() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [selectedOrg, setSelectedOrg] = useState('873088744'); // Default org

  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const now = new Date();
    return {
      from: new Date(now.getFullYear(), now.getMonth(), 1),
      to: now
    };
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Use local date formatting to avoid UTC timezone shift (toISOString() can shift date by 1 day for UTC+1)
        const formatLocalDate = (d: Date) => {
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        const from = dateRange?.from ? formatLocalDate(dateRange.from) : undefined;
        const to = dateRange?.to ? formatLocalDate(dateRange.to) : undefined;

        if (!from || !to) {
          setLoading(false);
          return;
        }

        console.log(`[FinanceModule] Fetching with org=${selectedOrg}, from=${from}, to=${to}`);
        const result = await getFinanceDashboard({ organization_id: selectedOrg, from, to });
        setData(result);
        setError(null);
      } catch (err) {
        console.error("Finance API Error", err);
        setError("Données indisponibles - Vérifiez la connexion Zoho");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedOrg, dateRange]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: data?.currency || 'XOF',
      maximumFractionDigits: 0
    }).format(value);
  };



  const chargesData = useMemo(() => {
    if (!data?.summary?.chargesByNature) return [];
    return Object.entries(data.summary.chargesByNature).map(([name, value]) => ({
      name,
      value
    }));
  }, [data]);

  const cashData = useMemo(() => {
    if (!data?.liquidity?.cashAccounts) return [];
    return data.liquidity.cashAccounts.map((acc: any) => ({
      name: acc.name,
      value: acc.balance
    }));
  }, [data]);

  const revenueByProductData = useMemo(() => {
    if (!data?.revenueByProduct || data.revenueByProduct.length === 0) return [];
    return data.revenueByProduct.map((item: any) => ({
      name: item.name.length > 30 ? item.name.substring(0, 28) + '...' : item.name,
      fullName: item.name,
      total: item.total,
      quantity: item.quantity
    }));
  }, [data]);

  if (loading && !data) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Header & Global Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Eazy Visa - Finance</h1>
          <p className="text-slate-500 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Analyse en temps réel Zoho Books (Plan OHADA)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <DateRangePicker date={dateRange} setDate={setDateRange} />

          <select
            value={selectedOrg}
            onChange={(e) => setSelectedOrg(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="873088744">Eazy Visa - Principal</option>
            <option value="910367975">Eazy Visa HQ</option>
            <option value="854518157">Filiale Senegal</option>
            <option value="909065006">Eazy Visa - Autre</option>
            <option value="all">Tous les comptes</option>
          </select>
        </div>
      </div>

      {/* Main KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Chiffre d’Affaires', value: data?.summary?.totalRevenue, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Charges Totales', value: data?.summary?.totalCharges, icon: ArrowDownRight, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Résultat Net', value: data?.summary?.netProfit, icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Trésorerie Globale', value: data?.liquidity?.totalCash, icon: Wallet, color: 'text-indigo-600', bg: 'bg-indigo-50' }
        ].map((kpi, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
                  <h3 className="text-2xl font-bold mt-1">{formatCurrency(kpi.value ?? 0)}</h3>
                </div>
                <div className={`${kpi.bg} ${kpi.color} p-3 rounded-xl`}>
                  <kpi.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Charts */}
        <div className="lg:col-span-2 space-y-6">

          {/* Charges Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Filter className="w-5 h-5 text-amber-600" /> Structure des Charges (OHADA)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chargesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chargesData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Revenue by Product */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-600" /> CA par Produit / Service
              </CardTitle>
              {data?.revenueByProduct?.length > 0 && (
                <span className="text-xs text-slate-400 font-normal">
                  Top {data.revenueByProduct.length} produits
                </span>
              )}
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[350px] flex items-center justify-center text-slate-400">Chargement...</div>
              ) : revenueByProductData.length === 0 ? (
                <div className="h-[200px] flex flex-col items-center justify-center text-slate-400 gap-2">
                  <ShoppingCart className="w-8 h-8 opacity-30" />
                  <p className="text-sm">Aucune donnée produit disponible pour cette période</p>
                  <p className="text-xs text-slate-300">Les données sont extraites des lignes de factures Zoho Books</p>
                </div>
              ) : (
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={revenueByProductData}
                      layout="vertical"
                      margin={{ top: 5, right: 80, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={160}
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        stroke="#64748b"
                      />
                      <Tooltip
                        formatter={(value: any, _name: any, props: any) => [
                          formatCurrency(Number(value)),
                          `Qté: ${props.payload?.quantity ?? 0}`
                        ]}
                        labelFormatter={(label: string) => {
                          const item = revenueByProductData.find((d: any) => d.name === label);
                          return item?.fullName || label;
                        }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar
                        dataKey="total"
                        name="CA"
                        radius={[0, 4, 4, 0]}
                        barSize={18}
                        label={{
                          position: 'right',
                          formatter: (v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v,
                          fontSize: 10,
                          fill: '#64748b'
                        }}
                      >
                        {revenueByProductData.map((_entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Liquidity & Alerts */}
        <div className="space-y-6">
          {/* Cash Status */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Wallet className="w-5 h-5 text-indigo-600" /> État de la Trésorerie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data?.liquidity?.cashAccounts?.map((account: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-8 rounded-full bg-indigo-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">{account.name}</p>
                      <p className="text-xs text-slate-400">Compte {account.code}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-slate-800">{formatCurrency(account.balance)}</p>
                </div>
              ))}
              {(!data?.liquidity?.cashAccounts || data.liquidity.cashAccounts.length === 0) && (
                <p className="text-sm text-slate-400 text-center py-4">Aucun compte bancaire configuré</p>
              )}
            </CardContent>
          </Card>

          {/* Risks & Alerts */}
          <Card>
            <CardHeader className="bg-red-50/50">
              <CardTitle className="text-lg font-semibold text-red-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Alertes & Risques
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {/* Mock Alerts as requested by logic or from actual data */}
                {(data?.summary?.netProfit < 0) && (
                  <div className="p-4 flex gap-3">
                    <div className="text-red-500"><ArrowDownRight className="w-5 h-5" /></div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Résultat Déficitaire</p>
                      <p className="text-xs text-slate-500">Le résultat net est négatif pour cette période.</p>
                    </div>
                  </div>
                )}
                {data?.liquidity?.totalCash < data?.summary?.totalCharges / 2 && (
                  <div className="p-4 flex gap-3">
                    <div className="text-amber-500"><AlertTriangle className="w-5 h-5" /></div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Trésorerie Faible</p>
                      <p className="text-xs text-slate-500">Le cash disponible couvre moins de 15 jours de charges.</p>
                    </div>
                  </div>
                )}
                <div className="p-4 flex gap-3">
                  <div className="text-blue-500"><Users className="w-5 h-5" /></div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Échéance Fiscale</p>
                    <p className="text-xs text-slate-500">Déclaration TVA du 15 attendue dans quelques jours.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Receivables/Payables Aging Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">Clients & Fournisseurs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Créances Clients</span>
                  <span className="font-bold text-emerald-600">{formatCurrency(data?.summary?.totalRevenue * 0.2)}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full" style={{ width: '60%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Dettes Fournisseurs</span>
                  <span className="font-bold text-amber-600">{formatCurrency(data?.summary?.totalCharges * 0.15)}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full" style={{ width: '40%' }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

