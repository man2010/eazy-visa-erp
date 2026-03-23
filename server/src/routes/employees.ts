import { Router } from 'express';
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeesByDepartment,
  searchEmployees
} from '../controllers/employeeController';

const router = Router();

// Routes pour les employés
router.get('/employees', getAllEmployees);
router.get('/employees/search', searchEmployees);
router.get('/employees/department/:department', getEmployeesByDepartment);
router.get('/employees/:id', getEmployeeById);
router.post('/employees', createEmployee);
router.put('/employees/:id', updateEmployee);
router.delete('/employees/:id', deleteEmployee);

export default router;
