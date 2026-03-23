import * as XLSX from 'xlsx';
import path from 'path';

const filePath = 'c:/Users/21623/Downloads/dashboard-project-main/dashboard-project-main/Attendance/Attendance_entries_EAZY1_Ndeye Fatou HANN.xls';

try {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  console.log('Sheet Name:', sheetName);
  const row1 = data[0];
  const row2 = data[1];
  
  console.log('Headers (Row 1):');
  row1.forEach((cell, i) => console.log(`${i}: ${cell}`));
  
  console.log('Data (Row 2):');
  row2.forEach((cell, i) => console.log(`${i}: ${cell}`));

} catch (error) {
  console.error('Error reading Excel:', error);
}
