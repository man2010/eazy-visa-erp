import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
    Plane,
    TrendingUp,
    DollarSign,
    Users,
    MapPin,
    Calendar,
    ArrowUpRight,
    PieChart as PieChartIcon,
    BarChart3
} from 'lucide-react';
import { getBilletterieFinance, getBilletterieCommercial } from '../../../api/client';
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
    Legend
} from 'recharts';

import { DateRangePicker } from '../ui/date-range-picker';
import { DateRange } from 'react-day-picker';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function BilletterieModule() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [financeData, setFinanceData] = useState<any>(null);
    const [commercialData, setCommercialData] = useState<any>(null);

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

                const formatLocalDate = (d: Date) => {
                    const year = d.getFullYear();
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                };

                const fromDate = dateRange?.from ? formatLocalDate(dateRange.from) : undefined;
                const toDate = dateRange?.to ? formatLocalDate(dateRange.to) : undefined;

                const [finance, commercial] = await Promise.all([
                    getBilletterieFinance({ from: fromDate, to: toDate }),
                    getBilletterieCommercial({ from: fromDate, to: toDate })
                ]);

                setFinanceData(finance);
                setCommercialData(commercial);
                setError(null);

                if ((commercial as any).dealPermissionError) {
                    setError("Accès restreint aux données commerciales (HubSpot).");
                }

            } catch (err: any) {
                console.error("Billetterie Data Error", err);
                setError("Certaines données sont indisponibles");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [dateRange]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: financeData?.currency_code || 'XOF',
            maximumFractionDigits: 0
        }).format(value);
    };

    if (loading && !financeData) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error && !financeData) {
        return (
            <div className="p-8 flex flex-col items-center justify-center min-h-[400px] text-slate-500 gap-4">
                <p>{error}</p>
                <p className="text-xs text-slate-400 max-w-md text-center">
                    Note: L'accès aux données Zoho pour l'organisation Biileterie est peut-être restreint ou le compte est désactivé.
                </p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <Plane className="w-8 h-8 text-blue-600" /> Billetterie Aérienne
                    </h1>
                    <p className="text-slate-500 flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4" /> Suivi financier et commercial en temps réel
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <DateRangePicker date={dateRange} setDate={setDateRange} />
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Chiffre d'Affaires", value: financeData?.revenue_total, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Marge Brute', value: financeData?.net_profit, icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Clients Billetterie', value: commercialData?.customers, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Deals HubSpot', value: commercialData?.deals, icon: ArrowUpRight, color: 'text-amber-600', bg: 'bg-amber-50' }
                ].map((kpi, i) => (
                    <Card key={i} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
                                    <h3 className="text-2xl font-bold mt-1">
                                        {typeof kpi.value === 'number' ?
                                            (kpi.label.includes('Deals') || kpi.label.includes('Clients') ? kpi.value : formatCurrency(kpi.value))
                                            : '---'}
                                    </h3>
                                </div>
                                <div className={`${kpi.bg} ${kpi.color} p-3 rounded-xl`}>
                                    <kpi.icon className="w-6 h-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Destinations */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-blue-600" /> Top Destinations
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px] w-full">
                            {commercialData?.topDestinations?.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={commercialData.topDestinations}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {commercialData.topDestinations.map((_: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-400">
                                    Aucune donnée de destination
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Financial Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-emerald-600" /> Performance Financière
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[
                                    { name: 'Revenue', value: financeData?.revenue_total || 0 },
                                    { name: 'Dépenses', value: financeData?.expenses_total || 0 },
                                    { name: 'Marge', value: financeData?.net_profit || 0 }
                                ]}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" stroke="#64748b" />
                                    <YAxis hide />
                                    <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={60}>
                                        <Cell fill="#10b981" />
                                        <Cell fill="#ef4444" />
                                        <Cell fill="#3b82f6" />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
