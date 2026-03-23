import { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Clock, Calendar as CalendarIcon, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Button } from './ui/button';

interface EmployeeStats {
    employeeId: string;
    employeeName: string;
    totalDays: number;
    presentDays: number;
    lateDays: number;
    totalLateMinutes: number;
    averageLateMinutes: number;
    totalHoursWorked: number;
    totalOvertimeMinutes: number;
    totalEarlyDepartureMinutes: number;
    absenteeismRate: number;
    hourlyRate: number;
}

interface AttendanceResponse {
    success: boolean;
    data: {
        summary: EmployeeStats[];
        records: any[];
    };
}

export function AttendanceUpload() {
    const [uploading, setUploading] = useState(false);
    const [stats, setStats] = useState<EmployeeStats[] | null>(null);
    const [dragActive, setDragActive] = useState(false);

    const handleFileUpload = async (file: File) => {
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const response = await fetch('http://localhost:5000/api/attendance/upload', {
                method: 'POST',
                body: formData,
            });

            const result: AttendanceResponse = await response.json();

            if (result.success) {
                setStats(result.data.summary);
                toast.success('Rapport de présence traité avec succès');
            } else {
                toast.error('Erreur lors du traitement du fichier');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Erreur de connexion au serveur');
        } finally {
            setUploading(false);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
        }
    };

    return (
        <div className="space-y-6">
            {/* Upload Area */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative border-2 border-dashed rounded-2xl p-8 transition-all ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white hover:border-blue-400'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleChange}
                    accept=".xls,.xlsx"
                />
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        {uploading ? (
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Upload className="w-8 h-8" />
                        )}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Importer les présences</h3>
                        <p className="text-gray-500 mt-1">Glissez-déposez votre fichier Excel (.xls, .xlsx) ici</p>
                    </div>
                    <Button variant="outline" className="mt-2">
                        Parcourir les fichiers
                    </Button>
                </div>
            </motion.div>

            {/* Stats Display */}
            <AnimatePresence>
                {stats && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                Résumes de Présence du mois
                            </h3>
                            <Button variant="ghost" size="sm" onClick={() => setStats(null)}>
                                Effacer
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {stats.map((emp) => (
                                <motion.div
                                    key={emp.employeeId}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 leading-tight">{emp.employeeName}</p>
                                                <p className="text-xs text-gray-500">{emp.employeeId}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-gray-50 rounded-lg p-2">
                                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                                <CalendarIcon className="w-3 h-3" />
                                                <span>Présences</span>
                                            </div>
                                            <p className="font-bold text-gray-900">{emp.presentDays} jours</p>
                                        </div>
                                        <div className={`rounded-lg p-2 ${emp.absenteeismRate > 5 ? 'bg-red-50' : 'bg-green-50'}`}>
                                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                                <AlertCircle className="w-3 h-3" />
                                                <span>Taux Absent.</span>
                                            </div>
                                            <p className={`font-bold ${emp.absenteeismRate > 5 ? 'text-red-600' : 'text-green-600'}`}>
                                                {emp.absenteeismRate || 0}%
                                            </p>
                                        </div>
                                        <div className="bg-blue-50 rounded-lg p-2">
                                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                                <Clock className="w-3 h-3 text-blue-600" />
                                                <span>Heures Supp.</span>
                                            </div>
                                            <p className="font-bold text-blue-700">
                                                {((emp.totalOvertimeMinutes || 0) / 60).toFixed(1)}h
                                            </p>
                                        </div>
                                        <div className="bg-orange-50 rounded-lg p-2">
                                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                                <Clock className="w-3 h-3 text-orange-600" />
                                                <span>Dép. Anticipé</span>
                                            </div>
                                            <p className="font-bold text-orange-700">
                                                {((emp.totalEarlyDepartureMinutes || 0) / 60).toFixed(1)}h
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-2 col-span-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-500">Total travaillé (net)</span>
                                                <span className="font-bold text-gray-900">{(emp.totalHoursWorked || 0).toFixed(1)}h</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
