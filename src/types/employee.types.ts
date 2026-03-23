export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: 'admin' | 'it' | 'marketing' | 'finance' | 'hr' | 'ticketing' | 'visa' | 'commercial';
  hireDate: string;
  status: 'active' | 'on_leave' | 'training' | 'inactive';
  photoUrl?: string;
}

export interface EmployeeFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  hireDate: string;
  status: string;
  photoUrl?: string;
}

export interface EmployeeResponse {
  success: boolean;
  data?: Employee | Employee[];
  count?: number;
  message?: string;
  error?: string;
}
