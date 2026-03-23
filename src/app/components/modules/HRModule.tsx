import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Users,
    Search,
    Plus,
    Edit,
    Trash2,
    Filter,
    Download,
    UserPlus,
    Building2,
    Calendar,
    Mail,
    Phone,
    Briefcase,
    TrendingUp,
    X
} from 'lucide-react';
import { employeeApi } from '../../../api/employees';
import type { Employee, EmployeeFormData } from '../../../types/employee.types';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { AttendanceUpload } from '../AttendanceUpload';

export function HRModule() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

    // Charger les employés
    useEffect(() => {
        loadEmployees();
    }, []);

    // Filtrer les employés
    useEffect(() => {
        let filtered = [...employees];

        // Filtre par recherche
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(emp =>
                emp.firstName.toLowerCase().includes(query) ||
                emp.lastName.toLowerCase().includes(query) ||
                emp.email.toLowerCase().includes(query) ||
                emp.position.toLowerCase().includes(query)
            );
        }

        // Filtre par département
        if (selectedDepartment !== 'all') {
            filtered = filtered.filter(emp => emp.department === selectedDepartment);
        }

        // Filtre par statut
        if (selectedStatus !== 'all') {
            filtered = filtered.filter(emp => emp.status === selectedStatus);
        }

        setFilteredEmployees(filtered);
    }, [searchQuery, selectedDepartment, selectedStatus, employees]);

    const loadEmployees = async () => {
        try {
            setLoading(true);
            const data = await employeeApi.getAllEmployees();
            setEmployees(data);
            setFilteredEmployees(data);
        } catch (error) {
            toast.error('Erreur lors du chargement des employés');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEmployee = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) return;

        try {
            await employeeApi.deleteEmployee(id);
            toast.success('Employé supprimé avec succès');
            loadEmployees();
        } catch (error) {
            toast.error('Erreur lors de la suppression');
            console.error(error);
        }
    };

    const getDepartmentColor = (dept: string) => {
        const colors: Record<string, string> = {
            admin: 'from-purple-500 to-pink-500',
            it: 'from-blue-500 to-cyan-500',
            marketing: 'from-orange-500 to-red-500',
            finance: 'from-green-500 to-emerald-500',
            hr: 'from-yellow-500 to-orange-500',
            ticketing: 'from-indigo-500 to-purple-500',
            visa: 'from-pink-500 to-rose-500',
            commercial: 'from-teal-500 to-green-500',
        };
        return colors[dept] || 'from-gray-500 to-gray-600';
    };

    const getDepartmentLabel = (dept: string) => {
        const labels: Record<string, string> = {
            admin: 'Administration',
            it: 'IT',
            marketing: 'Marketing',
            finance: 'Finance',
            hr: 'RH',
            ticketing: 'Billetterie',
            visa: 'Visa',
            commercial: 'Commercial',
        };
        return labels[dept] || dept;
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            active: 'bg-green-500',
            on_leave: 'bg-orange-500',
            training: 'bg-blue-500',
            inactive: 'bg-gray-500',
        };
        return colors[status] || 'bg-gray-500';
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            active: 'Actif',
            on_leave: 'En congé',
            training: 'En formation',
            inactive: 'Inactif',
        };
        return labels[status] || status;
    };

    // Statistiques
    const stats = {
        total: employees.length,
        active: employees.filter(e => e.status === 'active').length,
        onLeave: employees.filter(e => e.status === 'on_leave').length,
        training: employees.filter(e => e.status === 'training').length,
    };

    const departmentStats = employees.reduce((acc, emp) => {
        acc[emp.department] = (acc[emp.department] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement des employés...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-full">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Gestion des Employés
                    </h1>
                    <p className="text-gray-600 mt-1">Gérez les employés actifs de votre entreprise</p>
                </div>
                <Button
                    onClick={() => setShowAddModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Ajouter un employé
                </Button>
            </motion.div>

            {/* Attendance Upload Section */}
            <AttendanceUpload />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Employés</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Actifs</p>
                            <p className="text-3xl font-bold text-green-600 mt-1">{stats.active}</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">En Congé</p>
                            <p className="text-3xl font-bold text-orange-600 mt-1">{stats.onLeave}</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">En Formation</p>
                            <p className="text-3xl font-bold text-blue-600 mt-1">{stats.training}</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                            <Briefcase className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Rechercher un employé..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Department Filter */}
                    <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">Tous les départements</option>
                        <option value="admin">Administration</option>
                        <option value="it">IT</option>
                        <option value="marketing">Marketing</option>
                        <option value="finance">Finance</option>
                        <option value="hr">RH</option>
                        <option value="ticketing">Billetterie</option>
                        <option value="visa">Visa</option>
                        <option value="commercial">Commercial</option>
                    </select>

                    {/* Status Filter */}
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">Tous les statuts</option>
                        <option value="active">Actif</option>
                        <option value="on_leave">En congé</option>
                        <option value="training">En formation</option>
                        <option value="inactive">Inactif</option>
                    </select>
                </div>
            </motion.div>

            {/* Employee Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Employé
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Poste
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Département
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Contact
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Date d'embauche
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Statut
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            <AnimatePresence>
                                {filteredEmployees.map((employee, index) => (
                                    <motion.tr
                                        key={employee.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 bg-gradient-to-br ${getDepartmentColor(employee.department)} rounded-full flex items-center justify-center text-white font-semibold shadow-lg`}>
                                                    {employee.photoUrl ? (
                                                        <img src={employee.photoUrl} alt={employee.firstName} className="w-10 h-10 rounded-full object-cover" />
                                                    ) : (
                                                        `${employee.firstName[0]}${employee.lastName[0]}`
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">
                                                        {employee.firstName} {employee.lastName}
                                                    </p>
                                                    <p className="text-sm text-gray-500">{employee.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="text-sm text-gray-900">{employee.position}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getDepartmentColor(employee.department)}`}>
                                                {getDepartmentLabel(employee.department)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm">
                                                <div className="flex items-center gap-1 text-gray-600">
                                                    <Mail className="w-3 h-3" />
                                                    <span className="text-xs">{employee.email}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-gray-600 mt-1">
                                                    <Phone className="w-3 h-3" />
                                                    <span className="text-xs">{employee.phone}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="text-sm text-gray-900">
                                                {new Date(employee.hireDate).toLocaleDateString('fr-FR')}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(employee.status)}`}>
                                                {getStatusLabel(employee.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setEditingEmployee(employee)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Modifier"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteEmployee(employee.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>

                    {filteredEmployees.length === 0 && (
                        <div className="text-center py-12">
                            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">Aucun employé trouvé</p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {(showAddModal || editingEmployee) && (
                    <EmployeeFormModal
                        employee={editingEmployee}
                        onClose={() => {
                            setShowAddModal(false);
                            setEditingEmployee(null);
                        }}
                        onSuccess={() => {
                            loadEmployees();
                            setShowAddModal(false);
                            setEditingEmployee(null);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// Employee Form Modal Component
interface EmployeeFormModalProps {
    employee: Employee | null;
    onClose: () => void;
    onSuccess: () => void;
}

function EmployeeFormModal({ employee, onClose, onSuccess }: EmployeeFormModalProps) {
    const [formData, setFormData] = useState<EmployeeFormData>({
        firstName: employee?.firstName || '',
        lastName: employee?.lastName || '',
        email: employee?.email || '',
        phone: employee?.phone || '',
        position: employee?.position || '',
        department: employee?.department || 'it',
        hireDate: employee?.hireDate || new Date().toISOString().split('T')[0],
        status: employee?.status || 'active',
        photoUrl: employee?.photoUrl || '',
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (employee) {
                await employeeApi.updateEmployee(employee.id, formData);
                toast.success('Employé mis à jour avec succès');
            } else {
                await employeeApi.createEmployee(formData);
                toast.success('Employé créé avec succès');
            }
            onSuccess();
        } catch (error) {
            toast.error('Erreur lors de l\'enregistrement');
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
                <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex items-center justify-between rounded-t-2xl">
                    <h2 className="text-2xl font-bold">
                        {employee ? 'Modifier l\'employé' : 'Ajouter un employé'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Prénom *
                            </label>
                            <Input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                required
                                placeholder="Jean"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Nom *
                            </label>
                            <Input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                required
                                placeholder="Dupont"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Email *
                            </label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                placeholder="jean.dupont@company.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Téléphone *
                            </label>
                            <Input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                required
                                placeholder="+33 6 12 34 56 78"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Poste *
                            </label>
                            <Input
                                type="text"
                                value={formData.position}
                                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                required
                                placeholder="Développeur Full Stack"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Département *
                            </label>
                            <select
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="admin">Administration</option>
                                <option value="it">IT</option>
                                <option value="marketing">Marketing</option>
                                <option value="finance">Finance</option>
                                <option value="hr">RH</option>
                                <option value="ticketing">Billetterie</option>
                                <option value="visa">Visa</option>
                                <option value="commercial">Commercial</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Date d'embauche *
                            </label>
                            <Input
                                type="date"
                                value={formData.hireDate}
                                onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Statut *
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="active">Actif</option>
                                <option value="on_leave">En congé</option>
                                <option value="training">En formation</option>
                                <option value="inactive">Inactif</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-gray-200">
                        <Button
                            type="button"
                            onClick={onClose}
                            variant="outline"
                            className="flex-1"
                            disabled={submitting}
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                            disabled={submitting}
                        >
                            {submitting ? 'Enregistrement...' : employee ? 'Mettre à jour' : 'Créer'}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}
