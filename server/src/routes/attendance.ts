import express from 'express';
import multer from 'multer';
import {
  uploadAttendanceCSV,
  getAllAttendance,
  getEmployeeSummary,
  getAttendanceStats,
  addAttendanceEntry,
  updateAttendanceEntry,
  deleteAttendanceEntry
} from '../controllers/attendanceController';

const router = express.Router();

// Configuration de Multer pour l'upload de fichiers
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Routes
router.post('/upload', upload.single('file'), uploadAttendanceCSV);
router.get('/', getAllAttendance);
router.get('/stats', getAttendanceStats);
router.get('/summary/:employeeId', getEmployeeSummary);
router.post('/entry', addAttendanceEntry);
router.put('/entry/:id', updateAttendanceEntry);
router.delete('/entry/:id', deleteAttendanceEntry);

export default router;
