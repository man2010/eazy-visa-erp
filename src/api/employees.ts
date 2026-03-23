import type { Employee, EmployeeFormData, EmployeeResponse } from '../types/employee.types';

const API_BASE_URL = 'http://localhost:5000/api';

export const employeeApi = {
  // Récupérer tous les employés
  getAllEmployees: async (): Promise<Employee[]> => {
    const response = await fetch(`${API_BASE_URL}/employees`);
    const data: EmployeeResponse = await response.json();
    if (!data.success || !Array.isArray(data.data)) {
      throw new Error(data.message || 'Erreur lors de la récupération des employés');
    }
    return data.data;
  },

  // Récupérer un employé par ID
  getEmployeeById: async (id: string): Promise<Employee> => {
    const response = await fetch(`${API_BASE_URL}/employees/${id}`);
    const data: EmployeeResponse = await response.json();
    if (!data.success || !data.data || Array.isArray(data.data)) {
      throw new Error(data.message || 'Employé non trouvé');
    }
    return data.data;
  },

  // Créer un nouvel employé
  createEmployee: async (employeeData: EmployeeFormData): Promise<Employee> => {
    const response = await fetch(`${API_BASE_URL}/employees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(employeeData),
    });
    const data: EmployeeResponse = await response.json();
    if (!data.success || !data.data || Array.isArray(data.data)) {
      throw new Error(data.message || 'Erreur lors de la création de l\'employé');
    }
    return data.data;
  },

  // Mettre à jour un employé
  updateEmployee: async (id: string, employeeData: Partial<EmployeeFormData>): Promise<Employee> => {
    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(employeeData),
    });
    const data: EmployeeResponse = await response.json();
    if (!data.success || !data.data || Array.isArray(data.data)) {
      throw new Error(data.message || 'Erreur lors de la mise à jour de l\'employé');
    }
    return data.data;
  },

  // Supprimer un employé
  deleteEmployee: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
      method: 'DELETE',
    });
    const data: EmployeeResponse = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Erreur lors de la suppression de l\'employé');
    }
  },

  // Rechercher des employés
  searchEmployees: async (query: string): Promise<Employee[]> => {
    const response = await fetch(`${API_BASE_URL}/employees/search?q=${encodeURIComponent(query)}`);
    const data: EmployeeResponse = await response.json();
    if (!data.success || !Array.isArray(data.data)) {
      throw new Error(data.message || 'Erreur lors de la recherche');
    }
    return data.data;
  },

  // Filtrer par département
  getEmployeesByDepartment: async (department: string): Promise<Employee[]> => {
    const response = await fetch(`${API_BASE_URL}/employees/department/${department}`);
    const data: EmployeeResponse = await response.json();
    if (!data.success || !Array.isArray(data.data)) {
      throw new Error(data.message || 'Erreur lors du filtrage');
    }
    return data.data;
  },
};
