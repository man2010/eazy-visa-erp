import * as XLSX from 'xlsx';
import { format, parse, differenceInMinutes, isSaturday } from 'date-fns';
import fs from 'fs';

// Simulation of logic from attendanceController.ts
const employeeLocations: Record<string, 'Senegal' | 'Niger'> = {
  'EAZY2': 'Niger',
};

const SHIFT_START_TIME = '08:00';

function formatExcelTime(value: any): string {
  const numValue = Number(value);
  if (!isNaN(numValue)) {
    const timePart = numValue % 1;
    const totalMinutes = Math.round(timePart * 24 * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
  return value?.toString() || '';
}

function adjustTime(timeStr: string, hours: number): string {
  const formattedTime = formatExcelTime(timeStr);
  if (!formattedTime || !formattedTime.includes(':')) return formattedTime;
  try {
    const [h, m] = formattedTime.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m, 0, 0);
    date.setHours(date.getHours() + hours);
    return format(date, 'HH:mm');
  } catch {
    return formattedTime;
  }
}

function checkIsLate(arrivalTime: string, shiftStart: string): boolean {
  if (!arrivalTime || !shiftStart) return false;
  return arrivalTime > shiftStart;
}

function getLateMinutes(arrivalTime: string, shiftStart: string): number {
  if (!arrivalTime || !shiftStart) return 0;
  try {
    const arrival = parse(arrivalTime, 'HH:mm', new Date());
    const start = parse(shiftStart, 'HH:mm', new Date());
    const diff = differenceInMinutes(arrival, start);
    return diff > 0 ? diff : 0;
  } catch {
    return 0;
  }
}

const testFile = 'c:/Users/21623/Downloads/dashboard-project-main/dashboard-project-main/Attendance/Attendance_entries_EAZY2_Razina Idi MANI (2).xls';

if (fs.existsSync(testFile)) {
  const buffer = fs.readFileSync(testFile);
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  const rows = data.slice(1);
  console.log(`Processing ${rows.length} rows from ${testFile}`);

  rows.forEach((row, i) => {
    if (!row[0] || !row[2]) return;
    const employeeId = row[0].toString();
    const employeeName = row[1]?.toString() || '';
    const dateStr = row[2]?.toString() || '';
    const arrivalStr = row[3]?.toString() || '';
    const status = row[19]?.toString() || '';

    if (status === 'Présent' || status === 'Present') {
        const location = employeeLocations[employeeId] || 'Senegal';
        const offset = location === 'Senegal' ? -1 : 0;
        const arrivalSenegal = adjustTime(arrivalStr, offset);
        const isLate = checkIsLate(arrivalSenegal, SHIFT_START_TIME);
        const lateMins = isLate ? getLateMinutes(arrivalSenegal, SHIFT_START_TIME) : 0;

        // Simulation du plafonnement
        const attendanceDate = parse(dateStr, 'yyyy-MM-dd', new Date());
        const isSat = isSaturday(attendanceDate);
        let capTime = '18:00';
        if (isSat) {
            const hour = parseInt(arrivalSenegal.split(':')[0]);
            capTime = hour <= 8 ? '14:00' : '15:00';
        }

        const departureStr = row[4]?.toString() || '';
        let departureSenegal = adjustTime(departureStr, offset);
        const originalDeparture = departureSenegal;
        
        if (departureSenegal > capTime) {
            departureSenegal = capTime;
        }

        console.log(`Row ${i+1}: ${employeeName} | Date: ${dateStr} | Arr: ${arrivalSenegal} | Dep Orig: ${originalDeparture} | Dep Cap: ${departureSenegal} | Room for: ${capTime}`);
    }
  });
} else {
  console.error('Test file not found');
}
