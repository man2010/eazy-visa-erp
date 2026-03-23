import { Request, Response } from 'express';

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
  hourlyRate?: number;
}

// Données réelles des employés depuis Zoho People
const mockEmployees: Employee[] = [
  {
    id: 'EAZY1',
    firstName: 'Ndeye Fatou',
    lastName: 'HANN',
    email: 'mrketing.eazyvisa@gmail.com',
    phone: '763191794',
    position: 'Service Marketing et Communication',
    department: 'marketing',
    hireDate: '2025-06-02',
    status: 'active',
    photoUrl: 'https://contacts.zoho.com/file?ID=896901983&fs=thumb',
    hourlyRate: 2500
  },
  {
    id: 'EAZY2',
    firstName: 'Razina Idi',
    lastName: 'MANI',
    email: 'manirazinaidi99.ev@gmail.com',
    phone: '',
    position: 'Informaticienne',
    department: 'it',
    hireDate: '2025-01-16',
    status: 'active',
    photoUrl: 'https://contacts.zoho.com/file?ID=896958128&fs=thumb',
    hourlyRate: 3000
  },
  {
    id: 'EAZY6',
    firstName: 'Yvon-Osias Bertrand',
    lastName: 'GOPELE',
    email: 'managereazyvisa.ev@gmail.com',
    phone: '',
    position: 'Direction',
    department: 'hr',
    hireDate: '2025-08-01',
    status: 'active',
    photoUrl: 'https://contacts.zoho.com/file?ID=896787588&fs=thumb',
    hourlyRate: 5000
  },
  {
    id: 'EAZY11',
    firstName: 'Deborah Dorcas',
    lastName: 'AGBODJOGBE',
    email: 'servicevente.eazyvisa1@gmail.com',
    phone: '',
    position: 'Service Commercial et Vente',
    department: 'commercial',
    hireDate: '2025-09-01',
    status: 'active',
    photoUrl: 'https://contacts.zoho.com/file?ID=897745850&fs=thumb'
  },
  {
    id: 'EAZY14',
    firstName: 'Khadidjatou',
    lastName: 'KANE',
    email: 'eazyvisaassistante@gmail.com',
    phone: '',
    position: 'Assistante',
    department: 'admin',
    hireDate: '2025-09-08',
    status: 'active',
    photoUrl: 'https://contacts.zoho.com/file?ID=896968731&fs=thumb'
  },
  {
    id: 'EAZY15',
    firstName: 'Gallo',
    lastName: 'DIALLO',
    email: 'serviceclient.eazyvisa@gmail.com',
    phone: '',
    position: 'Commerciale',
    department: 'commercial',
    hireDate: '2025-09-15',
    status: 'active',
    photoUrl: 'viewPhoto?filename=2071078000000052002'
  },
  {
    id: 'EAZY17',
    firstName: 'Ahmadou',
    lastName: 'DIOUF',
    email: 'compta.eazyvisa@gmail.com',
    phone: '221-770289712',
    position: 'Comptable',
    department: 'finance',
    hireDate: '2025-10-15',
    status: 'active',
    photoUrl: 'https://contacts.zoho.com/file?ID=902973203&fs=thumb'
  },
  {
    id: 'EAZY18',
    firstName: 'MOUHAMADOU MANSOUR',
    lastName: 'BALDÉ',
    email: 'mansourbalde2010@gmail.com',
    phone: '221-773168671',
    position: 'Service informatique',
    department: 'it',
    hireDate: '2025-11-03',
    status: 'active',
    photoUrl: 'https://contacts.zoho.com/file?ID=906172662&fs=thumb'
  },
  {
    id: 'EAZY19',
    firstName: 'MOUHAMED',
    lastName: 'PAM',
    email: 'mouhamedpam215@gmail.com',
    phone: '221-778735950',
    position: 'Service Commercial et Vente',
    department: 'commercial',
    hireDate: '2025-11-03',
    status: 'active',
    photoUrl: 'https://contacts.zoho.com/file?ID=906059984&fs=thumb'
  },
  {
    id: 'EAZY21',
    firstName: 'Sophie',
    lastName: 'NDIAYE',
    email: 'sophiendiaye27@gmail.com',
    phone: '221-706058475',
    position: 'Service client',
    department: 'commercial',
    hireDate: '2025-11-03',
    status: 'active',
    photoUrl: 'https://contacts.zoho.com/file?ID=906162263&fs=thumb'
  },
  {
    id: 'EAZY22',
    firstName: 'Regine',
    lastName: 'NGONO NYOBE',
    email: 'agent.eazyvisa@gmail.com',
    phone: '',
    position: 'Agent Comptoirs',
    department: 'ticketing',
    hireDate: '2025-12-01',
    status: 'active',
    photoUrl: 'https://contacts.zoho.com/file?ID=907765568&fs=thumb'
  },
  {
    id: 'EAZY23',
    firstName: 'Mariane Binta Yandé',
    lastName: 'NDIAYE',
    email: 'communitymanager.eazyvisa@gmail.com',
    phone: '',
    position: 'Community Manager',
    department: 'marketing',
    hireDate: '2025-11-24',
    status: 'active',
    photoUrl: 'https://contacts.zoho.com/file?ID=907831636&fs=thumb'
  },
  {
    id: 'EAZY24',
    firstName: 'Mariama',
    lastName: 'SALL',
    email: 'chargervisa.eazyvisa1@gmail.com',
    phone: '',
    position: 'Chargé Visa',
    department: 'visa',
    hireDate: '2025-11-24',
    status: 'active',
    photoUrl: 'https://contacts.zoho.com/file?ID=907831850&fs=thumb'
  },
  {
    id: 'EAZY25',
    firstName: 'Ndeye Oumou Kantome',
    lastName: 'FALL',
    email: 'commercial.eazyvisa@gmail.com',
    phone: '',
    position: 'Responsable vente',
    department: 'commercial',
    hireDate: '2025-12-01',
    status: 'active',
    photoUrl: 'https://contacts.zoho.com/file?ID=909054160&fs=thumb'
  },
  {
    id: 'EAZY26',
    firstName: 'Mareme',
    lastName: 'NDIAYE',
    email: 'eazyvisa.agent3@gmail.com',
    phone: '',
    position: 'Agent Comptoirs',
    department: 'ticketing',
    hireDate: '2025-12-01',
    status: 'active',
    photoUrl: 'https://contacts.zoho.com/file?ID=908783394&fs=thumb'
  },
  {
    id: 'EAZY27',
    firstName: 'Fatou Julie',
    lastName: 'CISSE',
    email: 'commercialfatou.eazyvisa@gmail.com',
    phone: '',
    position: 'Commerciale',
    department: 'commercial',
    hireDate: '2025-12-24',
    status: 'active',
    photoUrl: 'https://contacts.zoho.com/file?ID=910344191&fs=thumb'
  },
  {
    id: 'EAZY28',
    firstName: 'Caprice Katia',
    lastName: 'MBOUNGOU',
    email: 'prestataire2.eazyvisa@gmail.com',
    phone: '',
    position: 'Commerciale',
    department: 'commercial',
    hireDate: '2025-12-31',
    status: 'inactive',
    photoUrl: 'https://static.zohocdn.com/zohopeople/people2/images/userg_inactive.1610d5086ab01932bcab3b0903b1edc6.png'
  },
  {
    id: 'EAZY29',
    firstName: 'Ibrahima',
    lastName: 'CISSE',
    email: 'prestataire1.eazyvisa@gmail.com',
    phone: '',
    position: 'Commerciale',
    department: 'commercial',
    hireDate: '2025-12-31',
    status: 'active',
    photoUrl: 'viewPhoto?filename=2071078000000098001',
    hourlyRate: 2000
  }
];

// Simuler une base de données en mémoire
export let employees: Employee[] = mockEmployees.map(emp => ({
  ...emp,
  hourlyRate: emp.hourlyRate // Taux par défaut si non défini -> supprimé
}));

export const getAllEmployees = async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: employees,
      count: employees.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des employés',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const employee = employees.find(emp => emp.id === id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employé non trouvé'
      });
    }

    res.json({
      success: true,
      data: employee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'employé',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const createEmployee = async (req: Request, res: Response) => {
  try {
    const newEmployee: Employee = {
      id: (employees.length + 1).toString(),
      ...req.body,
      photoUrl: req.body.photoUrl || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
      hourlyRate: req.body.hourlyRate || 2500
    };

    employees.push(newEmployee);

    res.status(201).json({
      success: true,
      message: 'Employé créé avec succès',
      data: newEmployee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'employé',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const index = employees.findIndex(emp => emp.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Employé non trouvé'
      });
    }

    employees[index] = {
      ...employees[index],
      ...req.body,
      id // Garder l'ID original
    };

    res.json({
      success: true,
      message: 'Employé mis à jour avec succès',
      data: employees[index]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'employé',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const index = employees.findIndex(emp => emp.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Employé non trouvé'
      });
    }

    const deletedEmployee = employees[index];
    employees = employees.filter(emp => emp.id !== id);

    res.json({
      success: true,
      message: 'Employé supprimé avec succès',
      data: deletedEmployee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'employé',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getEmployeesByDepartment = async (req: Request, res: Response) => {
  try {
    const { department } = req.params;
    const filteredEmployees = employees.filter(emp => emp.department === department);

    res.json({
      success: true,
      data: filteredEmployees,
      count: filteredEmployees.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des employés par département',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const searchEmployees = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.json({
        success: true,
        data: employees,
        count: employees.length
      });
    }

    const searchTerm = q.toLowerCase();
    const filteredEmployees = employees.filter(emp =>
      emp.firstName.toLowerCase().includes(searchTerm) ||
      emp.lastName.toLowerCase().includes(searchTerm) ||
      emp.email.toLowerCase().includes(searchTerm) ||
      emp.position.toLowerCase().includes(searchTerm) ||
      emp.department.toLowerCase().includes(searchTerm)
    );

    res.json({
      success: true,
      data: filteredEmployees,
      count: filteredEmployees.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche d\'employés',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getDepartmentBreakdownInternal = () => {
  return employees.reduce((acc, emp) => {
    acc[emp.department] = (acc[emp.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
};
