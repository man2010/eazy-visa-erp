import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
    FileCheck2,
    FileWarning,
    Clock,
    Globe,
    Building2,
    Users,
    Search,
    Filter,
    ChevronDown,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Eye,
    CalendarDays,
    TrendingUp,
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────
type PaymentStatus = 'full' | 'partial' | 'pending';
type ProcessingStatus = 'admission_pending' | 'auslandportal' | 'embassy' | 'completed';

interface VisaClient {
    id: string;
    name: string;
    nationality: string;
    destination: string;
    visaType: string;
    paymentStatus: PaymentStatus;
    processingStatus: ProcessingStatus;
    amountTotal: number;
    amountPaid: number;
    submissionDate: string;
    counselor: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_CLIENTS: VisaClient[] = [
    { id: 'V-001', name: 'Aminata Diallo', nationality: 'Sénégalaise', destination: 'Allemagne', visaType: 'Étudiant', paymentStatus: 'full', processingStatus: 'auslandportal', amountTotal: 450000, amountPaid: 450000, submissionDate: '2026-01-15', counselor: 'Fatou N.' },
    { id: 'V-002', name: 'Moussa Koné', nationality: 'Guinéenne', destination: 'Canada', visaType: 'Travail', paymentStatus: 'partial', processingStatus: 'embassy', amountTotal: 380000, amountPaid: 190000, submissionDate: '2026-01-18', counselor: 'Ibrahim S.' },
    { id: 'V-003', name: 'Mariam Traoré', nationality: 'Malienne', destination: 'France', visaType: 'Famille', paymentStatus: 'full', processingStatus: 'embassy', amountTotal: 320000, amountPaid: 320000, submissionDate: '2026-01-22', counselor: 'Fatou N.' },
    { id: 'V-004', name: 'Ousmane Bah', nationality: 'Guinéenne', destination: 'Allemagne', visaType: 'Étudiant', paymentStatus: 'partial', processingStatus: 'admission_pending', amountTotal: 500000, amountPaid: 250000, submissionDate: '2026-01-25', counselor: 'Kader M.' },
    { id: 'V-005', name: 'Kadiatou Sow', nationality: 'Sénégalaise', destination: 'USA', visaType: 'Touriste', paymentStatus: 'full', processingStatus: 'completed', amountTotal: 280000, amountPaid: 280000, submissionDate: '2025-12-10', counselor: 'Ibrahim S.' },
    { id: 'V-006', name: 'Ibrahima Camara', nationality: 'Guinéenne', destination: 'Allemagne', visaType: 'Étudiant', paymentStatus: 'full', processingStatus: 'auslandportal', amountTotal: 450000, amountPaid: 450000, submissionDate: '2026-02-01', counselor: 'Kader M.' },
    { id: 'V-007', name: 'Fatoumata Barry', nationality: 'Malienne', destination: 'Belgique', visaType: 'Famille', paymentStatus: 'partial', processingStatus: 'admission_pending', amountTotal: 350000, amountPaid: 100000, submissionDate: '2026-02-05', counselor: 'Fatou N.' },
    { id: 'V-008', name: 'Seydou Touré', nationality: 'Ivoirienne', destination: 'Canada', visaType: 'Immigration', paymentStatus: 'full', processingStatus: 'embassy', amountTotal: 620000, amountPaid: 620000, submissionDate: '2026-02-08', counselor: 'Ibrahim S.' },
    { id: 'V-009', name: 'Aïcha Diop', nationality: 'Sénégalaise', destination: 'Allemagne', visaType: 'Étudiant', paymentStatus: 'partial', processingStatus: 'auslandportal', amountTotal: 480000, amountPaid: 240000, submissionDate: '2026-02-10', counselor: 'Kader M.' },
    { id: 'V-010', name: 'Lamine Sylla', nationality: 'Guinéenne', destination: 'France', visaType: 'Travail', paymentStatus: 'full', processingStatus: 'admission_pending', amountTotal: 360000, amountPaid: 360000, submissionDate: '2026-02-12', counselor: 'Fatou N.' },
    { id: 'V-011', name: 'Mariame Coulibaly', nationality: 'Malienne', destination: 'UK', visaType: 'Étudiant', paymentStatus: 'partial', processingStatus: 'embassy', amountTotal: 540000, amountPaid: 270000, submissionDate: '2026-02-14', counselor: 'Ibrahim S.' },
    { id: 'V-012', name: 'Alpha Baldé', nationality: 'Guinéenne', destination: 'Allemagne', visaType: 'Étudiant', paymentStatus: 'full', processingStatus: 'auslandportal', amountTotal: 450000, amountPaid: 450000, submissionDate: '2026-02-16', counselor: 'Kader M.' },
    { id: 'V-013', name: 'Oumou Kourouma', nationality: 'Ivoirienne', destination: 'Canada', visaType: 'Travail', paymentStatus: 'partial', processingStatus: 'admission_pending', amountTotal: 400000, amountPaid: 200000, submissionDate: '2026-02-18', counselor: 'Fatou N.' },
    { id: 'V-014', name: 'Mamadou Ly', nationality: 'Sénégalaise', destination: 'France', visaType: 'Famille', paymentStatus: 'full', processingStatus: 'completed', amountTotal: 310000, amountPaid: 310000, submissionDate: '2025-11-20', counselor: 'Ibrahim S.' },
    { id: 'V-015', name: 'Ndeye Faye', nationality: 'Sénégalaise', destination: 'UK', visaType: 'Touriste', paymentStatus: 'partial', processingStatus: 'embassy', amountTotal: 290000, amountPaid: 145000, submissionDate: '2026-02-20', counselor: 'Kader M.' },
];

const MONTHLY_DATA = [
    { mois: 'Sep', dossiers: 8, encaissé: 2400000 },
    { mois: 'Oct', dossiers: 11, encaissé: 3800000 },
    { mois: 'Nov', dossiers: 14, encaissé: 5100000 },
    { mois: 'Déc', dossiers: 10, encaissé: 3600000 },
    { mois: 'Jan', dossiers: 16, encaissé: 6200000 },
    { mois: 'Fév', dossiers: 12, encaissé: 4850000 },
];

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<ProcessingStatus, { label: string; color: string; bg: string; icon: any; dot: string }> = {
    admission_pending: { label: "Demande d'admission en cours", color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: Clock, dot: 'bg-amber-500' },
    auslandportal: { label: 'En cours – Auslandportal', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: Globe, dot: 'bg-blue-500' },
    embassy: { label: "En cours – Ambassade", color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200', icon: Building2, dot: 'bg-purple-500' },
    completed: { label: 'Dossier finalisé', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: CheckCircle2, dot: 'bg-emerald-500' },
};

const PAYMENT_CONFIG: Record<PaymentStatus, { label: string; color: string; bg: string; icon: any }> = {
    full: { label: 'Paiement complet', color: 'text-emerald-700', bg: 'bg-emerald-100', icon: CheckCircle2 },
    partial: { label: 'Paiement partiel', color: 'text-orange-700', bg: 'bg-orange-100', icon: AlertCircle },
    pending: { label: 'Non payé', color: 'text-red-700', bg: 'bg-red-100', icon: FileWarning },
};

const PIE_COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'];
const BAR_COLORS = { dossiers: '#3b82f6', encaissé: '#10b981' };

function formatCFA(v: number) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(v);
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, color, bg, delay = 0 }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
        >
            <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
                <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
                            <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
                            {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
                        </div>
                        <div className={`${bg} p-3 rounded-2xl`}>
                            <Icon className={`w-6 h-6 ${color}`} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

// ─── Client Row ───────────────────────────────────────────────────────────────
function ClientRow({ client, index }: { client: VisaClient; index: number }) {
    const [expanded, setExpanded] = useState(false);
    const proc = STATUS_CONFIG[client.processingStatus];
    const pay = PAYMENT_CONFIG[client.paymentStatus];
    const ProcIcon = proc.icon;
    const progress = Math.round((client.amountPaid / client.amountTotal) * 100);

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.04 }}
            className="border border-slate-100 rounded-xl bg-white overflow-hidden hover:border-slate-200 transition-all"
        >
            <button
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-slate-50/70 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>

                {/* Name + ID */}
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{client.name}</p>
                    <p className="text-xs text-slate-400">{client.id} · {client.destination} · {client.visaType}</p>
                </div>

                {/* Payment badge */}
                <span className={`hidden sm:inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${pay.bg} ${pay.color}`}>
                    <pay.icon className="w-3.5 h-3.5" />
                    {pay.label}
                </span>

                {/* Processing badge */}
                <span className={`hidden md:inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${proc.bg} ${proc.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${proc.dot} animate-pulse`} />
                    {proc.label}
                </span>

                <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-100 pt-4">
                            <div>
                                <p className="text-xs text-slate-400">Nationalité</p>
                                <p className="text-sm font-medium">{client.nationality}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Conseiller</p>
                                <p className="text-sm font-medium">{client.counselor}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Date de soumission</p>
                                <p className="text-sm font-medium">{new Date(client.submissionDate).toLocaleDateString('fr-FR')}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Montant</p>
                                <p className="text-sm font-medium">{formatCFA(client.amountPaid)} / {formatCFA(client.amountTotal)}</p>
                            </div>
                            {/* Progress bar */}
                            <div className="col-span-2 md:col-span-4">
                                <div className="flex justify-between text-xs text-slate-400 mb-1">
                                    <span>Paiement encaissé</span>
                                    <span className="font-medium text-slate-600">{progress}%</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                    <motion.div
                                        className={`h-2 rounded-full ${progress === 100 ? 'bg-emerald-500' : 'bg-amber-400'}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 0.6, delay: 0.1 }}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function VisaModule() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterPayment, setFilterPayment] = useState<PaymentStatus | 'all'>('all');
    const [filterStatus, setFilterStatus] = useState<ProcessingStatus | 'all'>('all');

    // ── Derived stats ──────────────────────────────────────────────────────────
    const stats = useMemo(() => {
        const total = MOCK_CLIENTS.length;
        const fullPaid = MOCK_CLIENTS.filter(c => c.paymentStatus === 'full').length;
        const partialPaid = MOCK_CLIENTS.filter(c => c.paymentStatus === 'partial').length;
        const admissionPending = MOCK_CLIENTS.filter(c => c.processingStatus === 'admission_pending').length;
        const auslandportal = MOCK_CLIENTS.filter(c => c.processingStatus === 'auslandportal').length;
        const embassy = MOCK_CLIENTS.filter(c => c.processingStatus === 'embassy').length;
        const totalRevenue = MOCK_CLIENTS.reduce((s, c) => s + c.amountPaid, 0);
        const expectedRevenue = MOCK_CLIENTS.reduce((s, c) => s + c.amountTotal, 0);
        const remainingBalance = expectedRevenue - totalRevenue;

        return { total, fullPaid, partialPaid, admissionPending, auslandportal, embassy, totalRevenue, expectedRevenue, remainingBalance };
    }, []);

    const pieData = [
        { name: 'Paiement complet', value: stats.fullPaid },
        { name: 'Paiement partiel', value: stats.partialPaid },
        { name: 'Auslandportal', value: stats.auslandportal },
        { name: 'Ambassade', value: stats.embassy },
    ];

    // ── Filtered clients ───────────────────────────────────────────────────────
    const filteredClients = useMemo(() => {
        return MOCK_CLIENTS.filter(c => {
            const matchesSearch =
                c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.destination.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesPayment = filterPayment === 'all' || c.paymentStatus === filterPayment;
            const matchesStatus = filterStatus === 'all' || c.processingStatus === filterStatus;
            return matchesSearch && matchesPayment && matchesStatus;
        });
    }, [searchQuery, filterPayment, filterStatus]);

    return (
        <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50/30 min-h-screen">

            {/* ── Header ── */}
            <motion.div
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <FileCheck2 className="w-5 h-5 text-white" />
                        </div>
                        Accompagnement Visa
                    </h1>
                    <p className="text-slate-500 mt-1 flex items-center gap-2">
                        <CalendarDays className="w-4 h-4" />
                        Suivi des dossiers en temps réel · <span className="font-medium text-slate-600">{stats.total} dossiers actifs</span>
                    </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                    Données simulées — mis à jour le {new Date().toLocaleDateString('fr-FR')}
                </div>
            </motion.div>

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <StatCard
                    label="Paiement complet"
                    value={stats.fullPaid}
                    sub={`${Math.round((stats.fullPaid / stats.total) * 100)}% des dossiers`}
                    icon={FileCheck2}
                    color="text-emerald-600"
                    bg="bg-emerald-50"
                    delay={0.05}
                />
                <StatCard
                    label="Paiement partiel"
                    value={stats.partialPaid}
                    sub={`Reste dû : ${formatCFA(stats.remainingBalance)}`}
                    icon={FileWarning}
                    color="text-orange-500"
                    bg="bg-orange-50"
                    delay={0.1}
                />
                <StatCard
                    label="Admission en cours"
                    value={stats.admissionPending}
                    sub="En attente de réponse"
                    icon={Clock}
                    color="text-amber-600"
                    bg="bg-amber-50"
                    delay={0.15}
                />
                <StatCard
                    label="Via Auslandportal"
                    value={stats.auslandportal}
                    sub="En traitement portail All."
                    icon={Globe}
                    color="text-blue-600"
                    bg="bg-blue-50"
                    delay={0.2}
                />
                <StatCard
                    label="Via Ambassade"
                    value={stats.embassy}
                    sub="En traitement ambassade"
                    icon={Building2}
                    color="text-purple-600"
                    bg="bg-purple-50"
                    delay={0.25}
                />
            </div>

            {/* ── Revenue Summary Banner ── */}
            <motion.div
                className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 rounded-2xl p-5 text-white shadow-xl"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
            >
                <div className="grid grid-cols-3 gap-6">
                    <div>
                        <p className="text-blue-200 text-xs font-medium uppercase tracking-wide">Total encaissé</p>
                        <p className="text-2xl font-bold mt-1">{formatCFA(stats.totalRevenue)}</p>
                    </div>
                    <div>
                        <p className="text-blue-200 text-xs font-medium uppercase tracking-wide">Chiffre d'affaires attendu</p>
                        <p className="text-2xl font-bold mt-1">{formatCFA(stats.expectedRevenue)}</p>
                    </div>
                    <div>
                        <p className="text-blue-200 text-xs font-medium uppercase tracking-wide">Solde restant dû</p>
                        <p className="text-2xl font-bold mt-1 text-amber-300">{formatCFA(stats.remainingBalance)}</p>
                    </div>
                </div>
                <div className="mt-4">
                    <div className="flex justify-between text-xs text-blue-200 mb-1">
                        <span>Taux d'encaissement</span>
                        <span>{Math.round((stats.totalRevenue / stats.expectedRevenue) * 100)}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                        <motion.div
                            className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-300"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.round((stats.totalRevenue / stats.expectedRevenue) * 100)}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                        />
                    </div>
                </div>
            </motion.div>

            {/* ── Charts Row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Répartition des statuts */}
                <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-700">
                            <TrendingUp className="w-4 h-4 text-blue-500" /> Répartition des statuts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[260px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value">
                                        {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                                    </Pie>
                                    <Tooltip formatter={(v) => [`${v} dossier(s)`, '']} />
                                    <Legend iconType="circle" iconSize={8} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Activité mensuelle */}
                <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-700">
                            <CalendarDays className="w-4 h-4 text-purple-500" /> Activité mensuelle
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[260px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={MONTHLY_DATA} barGap={4}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="mois" stroke="#94a3b8" fontSize={12} tickLine={false} />
                                    <YAxis yAxisId="left" orientation="left" stroke="#94a3b8" fontSize={11} tickLine={false} />
                                    <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                                    <Tooltip formatter={(v, n) => n === 'dossiers' ? [`${v} dossiers`, 'Dossiers'] : [formatCFA(Number(v)), 'Encaissé']} />
                                    <Bar yAxisId="left" dataKey="dossiers" fill={BAR_COLORS.dossiers} radius={[4, 4, 0, 0]} barSize={18} />
                                    <Bar yAxisId="right" dataKey="encaissé" fill={BAR_COLORS.encaissé} radius={[4, 4, 0, 0]} barSize={18} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ── Client List ── */}
            <Card className="border-0 shadow-sm">
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-700">
                            <Users className="w-4 h-4 text-blue-500" /> Liste des dossiers
                            <span className="ml-1 bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{filteredClients.length}</span>
                        </CardTitle>

                        {/* Filters */}
                        <div className="flex flex-wrap gap-2">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Rechercher..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 w-44"
                                />
                            </div>

                            {/* Payment filter */}
                            <div className="relative">
                                <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                <select
                                    value={filterPayment}
                                    onChange={e => setFilterPayment(e.target.value as any)}
                                    className="pl-8 pr-7 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 appearance-none bg-white"
                                >
                                    <option value="all">Tout paiement</option>
                                    <option value="full">Complet</option>
                                    <option value="partial">Partiel</option>
                                </select>
                            </div>

                            {/* Processing filter */}
                            <div className="relative">
                                <Eye className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                <select
                                    value={filterStatus}
                                    onChange={e => setFilterStatus(e.target.value as any)}
                                    className="pl-8 pr-7 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 appearance-none bg-white"
                                >
                                    <option value="all">Tout statut</option>
                                    <option value="admission_pending">Admission en cours</option>
                                    <option value="auslandportal">Auslandportal</option>
                                    <option value="embassy">Ambassade</option>
                                    <option value="completed">Finalisé</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {filteredClients.length === 0 ? (
                            <div className="text-center py-12 text-slate-400">
                                <Search className="w-10 h-10 mx-auto mb-2 opacity-40" />
                                <p>Aucun dossier ne correspond à votre recherche</p>
                            </div>
                        ) : (
                            filteredClients.map((client, i) => (
                                <ClientRow key={client.id} client={client} index={i} />
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
