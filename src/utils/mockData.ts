import { Employee, Department } from '../types/employee';

export const departments: Department[] = [
  { id: '1', name: 'Engineering', color: '#3b82f6' },
  { id: '2', name: 'Marketing', color: '#10b981' },
  { id: '3', name: 'Sales', color: '#f59e0b' },
  { id: '4', name: 'HR', color: '#ef4444' },
  { id: '5', name: 'Finance', color: '#8b5cf6' },
  { id: '6', name: 'Operations', color: '#06b6d4' },
];

export const mockEmployees: Employee[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    phone: '+1 (555) 123-4567',
    position: 'Senior Software Engineer',
    department: 'Engineering',
    salary: 95000,
    startDate: '2022-03-15',
    status: 'active',
    address: '123 Main St, San Francisco, CA 94102',
    emergencyContact: 'Jane Doe',
    emergencyPhone: '+1 (555) 987-6543',
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@company.com',
    phone: '+1 (555) 234-5678',
    position: 'Marketing Manager',
    department: 'Marketing',
    salary: 78000,
    startDate: '2021-11-08',
    status: 'active',
    address: '456 Oak Ave, Los Angeles, CA 90028',
    emergencyContact: 'Mike Johnson',
    emergencyPhone: '+1 (555) 876-5432',
  },
  {
    id: '3',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@company.com',
    phone: '+1 (555) 345-6789',
    position: 'Sales Representative',
    department: 'Sales',
    salary: 65000,
    startDate: '2023-01-20',
    status: 'active',
    address: '789 Pine St, New York, NY 10001',
    emergencyContact: 'Lisa Chen',
    emergencyPhone: '+1 (555) 765-4321',
  },
  {
    id: '4',
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily.davis@company.com',
    phone: '+1 (555) 456-7890',
    position: 'HR Specialist',
    department: 'HR',
    salary: 58000,
    startDate: '2022-07-12',
    status: 'active',
    address: '321 Elm St, Chicago, IL 60601',
    emergencyContact: 'Robert Davis',
    emergencyPhone: '+1 (555) 654-3210',
  },
  {
    id: '5',
    firstName: 'David',
    lastName: 'Wilson',
    email: 'david.wilson@company.com',
    phone: '+1 (555) 567-8901',
    position: 'Financial Analyst',
    department: 'Finance',
    salary: 72000,
    startDate: '2021-09-05',
    status: 'inactive',
    address: '654 Maple Dr, Austin, TX 73301',
    emergencyContact: 'Rachel Wilson',
    emergencyPhone: '+1 (555) 543-2109',
  },
];

export const getEmployeeById = (id: string): Employee | undefined => {
  return mockEmployees.find(emp => emp.id === id);
};

export const getDepartmentColor = (departmentName: string): string => {
  const dept = departments.find(d => d.name === departmentName);
  return dept?.color || '#6b7280';
};