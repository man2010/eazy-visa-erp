// Types pour le système de pointage des employés
export interface AttendanceEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // ISO format: "2026-01-27"
  checkIn: string | null; // "08:30"
  checkOut: string | null; // "17:30"
  totalHours: number; // Nombre total d'heures
  paidBreak: number; // Pause rémunérée en heures
  unpaidBreak: number; // Pause non rémunérée en heures
  overtime: number; // Heures supplémentaires
  payableHours: number; // Heures payables
  status: 'present' | 'absent' | 'weekend' | 'leave' | 'half_day' | 'late';
  shift: string; // Ex: "Shift Normal (08:00 - 18:00)"
  location?: string; // Emplacement
  notes?: string; // Notes additionnelles
}

export interface AttendanceSummary {
  employeeId: string;
  employeeName: string;
  period: string; // "2026-01" pour janvier 2026
  totalDaysPresent: number;
  totalDaysAbsent: number;
  totalDaysWeekend: number;
  totalHoursWorked: number;
  totalOvertimeHours: number;
  averageHoursPerDay: number;
  lateCount: number;
  entries: AttendanceEntry[];
}

export interface AttendanceStats {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  averageWorkHours: number;
  totalOvertimeThisMonth: number;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  entriesProcessed: number;
  employeesAffected: string[];
  errors?: string[];
}
