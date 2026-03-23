import * as XLSX from 'xlsx';
import path from 'path';

const filePath = 'c:/Users/21623/Downloads/dashboard-project-main/dashboard-project-main/Attendance/Attendance_entries_EAZY1_Ndeye Fatou HANN.xls';

try {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  console.log('Sheet Name:', sheetName);
  console.log('First 10 rows:');
  console.log(JSON.stringify(data.slice(0, 10), null, 2));
} catch (error) {
  console.error('Error reading Excel:', error);
}
