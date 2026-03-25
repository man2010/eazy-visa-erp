export interface MockUser {
  email: string;
  password: string;
  name: string;
  role: string;
  department: 'it' | 'marketing' | 'finance' | 'hr' | 'ticketing' | 'visa' | 'commercial' | 'admin';
  avatar?: string;
}

export const mockUsers: MockUser[] = [
  // Admin - accès à tout
  {
    email: 'admin@erp.com',
    password: 'admin123',
    name: 'Mouhamed Moudjitaba Diallo',
    role: 'Directeur Général',
    department: 'admin',
  },
  // IT Department
  {
    email: 'it@erp.com',
    password: 'it123',
    name: 'Razina Idi Mani',
    role: 'Responsable IT',
    department: 'it',
  },
  // Marketing Department
  {
    email: 'marketing@erp.com',
    password: 'marketing123',
    name: 'Ndeye Fatou Hann',
    role: 'Directrice Marketing',
    department: 'marketing',
  },
  // Finance Department
  {
    email: 'finance@erp.com',
    password: 'finance123',
    name: 'Ahmadou Diouf',
    role: 'Comptable',
    department: 'finance',
  },
  // HR Department
  {
    email: 'rh@erp.com',
    password: 'rh123',
    name: 'Yvon Bertran Gopele',
    role: 'Responsable RH',
    department: 'hr',
  },
  // Ticketing/Support Department
  {
    email: 'support@erp.com',
    password: 'support123',
    name: 'Sophie Ndiaye',
    role: 'Chef Support Client',
    department: 'ticketing',
  },
  // Visa Department
  {
    email: 'visa@erp.com',
    password: 'visa123',
    name: 'Mariama Sall',
    role: 'Chargée Visa',
    department: 'visa',
  },
  // Commercial Department
  {
    email: 'commercial@erp.com',
    password: 'commercial123',
    name: 'Yan',
    role: 'Directeur Commercial',
    department: 'commercial',
  },
];

export const validateLogin = (email: string, password: string): MockUser | null => {
  const user = mockUsers.find(u => u.email === email && u.password === password);
  return user || null;
};
