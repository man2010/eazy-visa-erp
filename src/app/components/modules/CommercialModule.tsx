import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  ShoppingCart,
  Users,
  Target,
  TrendingUp,
  Phone,
  AlertTriangle,
} from 'lucide-react';
import { getSalesSummary } from '../../../api/client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend
} from 'recharts';

import { DateRangePicker } from '../ui/date-range-picker';
import { DateRange } from 'react-day-picker';

export function CommercialModule() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const now = new Date();
    return {
      from: new Date(now.getFullYear(), now.getMonth(), 1),
      to: new Date(now.getFullYear(), now.getMonth() + 1, 0)
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

        console.log(`[CommercialModule] Fetching with from=${from}, to=${to}`);
        const result = await getSalesSummary({ from, to });
        setData(result);
        setError(null);
      } catch (err) {
        console.error("Sales API Error", err);
        setError("Données indisponibles");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  if (error && !data) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2 font-bold text-slate-800">Commercial</h1>
          <p className="text-gray-600 font-medium">Performance des ventes & activités</p>
        </div>
        <DateRangePicker date={dateRange} setDate={setDateRange} />
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="shadow-sm border-none bg-white">
          <CardContent className="p-6">
            <div className="flex flex-col gap-2">
              <div className="bg-blue-50 text-blue-600 p-2 rounded-lg w-fit">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Nouveaux Contacts</p>
              <h3 className="text-2xl font-bold text-slate-800">
                {loading ? '...' : data?.total_contacts_count?.toLocaleString() ?? 0}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-white">
          <CardContent className="p-6">
            <div className="flex flex-col gap-2">
              <div className="bg-orange-50 text-orange-600 p-2 rounded-lg w-fit">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Hors Cible</p>
              <h3 className="text-2xl font-bold text-slate-800">
                {loading ? '...' : data?.off_cycle_count?.toLocaleString() ?? 0}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-white">
          <CardContent className="p-6">
            <div className="flex flex-col gap-2">
              <div className="bg-cyan-50 text-cyan-600 p-2 rounded-lg w-fit">
                <Phone className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Appels</p>
              <h3 className="text-2xl font-bold text-slate-800">
                {loading ? '...' : data?.weekly_calls_count?.toLocaleString() ?? 0}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-white">
          <CardContent className="p-6">
            <div className="flex flex-col gap-2">
              <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg w-fit">
                <Phone className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Appels Connectés</p>
              <h3 className="text-2xl font-bold text-slate-800">
                {loading ? '...' : data?.daily_calls_connected?.toLocaleString() ?? 0}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-white">
          <CardContent className="p-6">
            <div className="flex flex-col gap-2">
              <div className="bg-rose-50 text-rose-600 p-2 rounded-lg w-fit">
                <Phone className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Non Connectés</p>
              <h3 className="text-2xl font-bold text-slate-800">
                {loading ? '...' : data?.daily_calls_not_connected?.toLocaleString() ?? 0}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-white">
          <CardContent className="p-6">
            <div className="flex flex-col gap-2">
              <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg w-fit">
                <TrendingUp className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Taux Conv.</p>
              <h3 className="text-2xl font-bold text-slate-800">
                {loading ? '...' : `${data?.win_rate?.toFixed(1) ?? 0}%`}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart Card */}
        <Card className="shadow-md border-none bg-white overflow-hidden">
          <CardHeader className="border-b border-slate-50">
            <CardTitle className="text-lg font-bold text-slate-800">Performance par Commercial</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[400px]">
              {loading ? (
                <div className="h-full flex items-center justify-center text-slate-400">Chargement du graphique...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.owner_stats || []} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      interval={0}
                      height={80}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <YAxis tick={{ fill: '#64748b', fontSize: 12 }} unit="%" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      cursor={{ fill: '#f8fafc' }}
                    />
                    <Legend verticalAlign="top" height={36} />
                    <Bar
                      dataKey="win_rate"
                      name="Taux de Conversion (%)"
                      radius={[4, 4, 0, 0]}
                      barSize={40}
                    >
                      {(data?.owner_stats || []).map((_entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Stats Table */}
        <Card className="shadow-md border-none bg-white overflow-hidden">
          <CardHeader className="border-b border-slate-50">
            <CardTitle className="text-lg font-bold text-slate-800">Détails par Propriétaire</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase">
                  <tr>
                    <th className="px-6 py-4">Nom</th>
                    <th className="px-6 py-4">Won</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4">Appels</th>
                    <th className="px-6 py-4">Connectés</th>
                    <th className="px-6 py-4">Taux Conv.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400">Chargement des données...</td></tr>
                  ) : data?.owner_stats?.length > 0 ? (
                    data.owner_stats.map((stat: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-700">{stat.name}</td>
                        <td className="px-6 py-4 text-slate-600">{stat.won}</td>
                        <td className="px-6 py-4 text-slate-600">{stat.total}</td>
                        <td className="px-6 py-4 text-slate-600">{stat.calls_total}</td>
                        <td className="px-6 py-4 text-slate-600">
                          <span className="text-emerald-600 font-medium">{stat.calls_connected}</span>
                          <span className="text-slate-300 mx-1">/</span>
                          <span className="text-slate-400">{stat.calls_total}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${stat.win_rate > 50 ? 'bg-green-100 text-green-700' :
                            stat.win_rate > 20 ? 'bg-blue-100 text-blue-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                            {stat.win_rate.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400">Aucune donnée disponible</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-500">
        <p className="font-medium">Les données sont synchronisées en temps réel avec HubSpot CRM.</p>
        <p className="text-sm mt-1">Dernière mise à jour : {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
}

