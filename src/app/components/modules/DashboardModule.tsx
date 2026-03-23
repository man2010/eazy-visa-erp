import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Users,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Briefcase
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getDashboardOverview } from '../../../api/client';

import { DateRangePicker } from '../ui/date-range-picker';
import { DateRange } from 'react-day-picker';

const COLORS = ['#10b981', '#f59e0b', '#8b5cf6', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const iconMap: any = {
  ShoppingCart,
  TrendingUp,
  Briefcase,
  Activity,
  CheckCircle,
  AlertCircle,
  Clock
};

const formatTimeAgo = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMins = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMins < 60) return `Il y a ${diffInMins} min`;
  if (diffInHours < 24) return `Il y a ${diffInHours} h`;
  if (diffInDays === 1) return `Hier`;
  if (diffInDays < 7) return `Il y a ${diffInDays} jours`;

  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
};

export function DashboardModule() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kpi, setKpi] = useState<any>(null);

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

        const data = await getDashboardOverview({
          from,
          to
        });
        setKpi(data);
        setError(null);
      } catch (err) {
        console.error("Dashboard API Error", err);
        setError("Données indisponibles");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  const stats = [
    {
      title: "Chiffre d'affaires (CA)",
      value: kpi ? `${kpi.revenue_total?.toLocaleString()} XOF` : '-',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Ventes',
      value: kpi ? kpi.monthly_sales_count : '-',
      icon: ShoppingCart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Dépenses totales',
      value: kpi ? `${kpi.expenses_total?.toLocaleString()} XOF` : '-',
      icon: TrendingUp,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
  ];

  const departmentChartData = kpi?.department_breakdown ?
    Object.entries(kpi.department_breakdown).map(([name, value]) => ({
      name: name.toUpperCase(),
      value: value as number
    })) : [];

  const revenueVsExpensesData = kpi ? [
    { name: 'Actuel', revenus: kpi.revenue_total, depenses: kpi.expenses_total }
  ] : [];

  if (error && !kpi) {
    return <div className="p-6 text-red-500">Erreur de chargement: {error}</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Tableau de bord
          </h1>
          <p className="text-gray-600">Vue d'ensemble de votre entreprise</p>
        </div>
        <DateRangePicker date={dateRange} setDate={setDateRange} />
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-white to-gray-50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                      <h3 className="text-2xl mb-1">
                        {loading ? '...' : stat.value}
                      </h3>
                      {/* <p className="text-sm text-green-600">{stat.change}</p> */}
                    </div>
                    <motion.div
                      className={`${stat.bgColor} ${stat.color} p-3 rounded-xl shadow-md`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <Icon className="w-6 h-6" />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Note: Charts are kept as visualization demos or need Historical API */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Revenus vs Dépenses</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueVsExpensesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenus" fill="#3b82f6" name="Revenus" />
                  <Bar dataKey="depenses" fill="#ef4444" name="Dépenses" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Répartition par département</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={departmentChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {departmentChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Calls per Owner Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.55 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Nombre d'appels par commercial</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nom</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Appels</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Won</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Taux</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400">Chargement des données...</td></tr>
                  ) : kpi?.owner_stats?.length > 0 ? (
                    kpi.owner_stats.map((stat: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-700">{stat.name}</td>
                        <td className="px-6 py-4 text-slate-600 font-medium bg-slate-50/50">
                          <span className="text-emerald-600">{stat.calls_connected || 0}</span>
                          <span className="text-slate-300 mx-1">/</span>
                          <span className="text-slate-400">{stat.calls_total || 0}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{stat.won}</td>
                        <td className="px-6 py-4 text-slate-600">{stat.total}</td>
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
                    <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400">Aucune donnée disponible.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activities kept for visual balance (mocked or need support API integration for specific list) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Activités récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {kpi?.recent_activities?.length > 0 ? (
                kpi.recent_activities.map((activity: any, index: number) => {
                  const Icon = iconMap[activity.icon] || Activity;
                  return (
                    <motion.div
                      key={index}
                      className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                      whileHover={{ x: 5 }}
                    >
                      <div className={`${activity.color} mt-1`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-700">{activity.text}</p>
                        <p className="text-xs text-gray-500">{formatTimeAgo(activity.date)}</p>
                      </div>
                    </motion.div>
                  );
                })
              ) : loading ? (
                <p className="text-center text-slate-400 py-4">Chargement des activités...</p>
              ) : (
                <p className="text-center text-slate-400 py-4">Aucune activité récente.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}