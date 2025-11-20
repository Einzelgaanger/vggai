/**
 * Mock data for Kleva HR (until real API credentials are available)
 */

export const KLEVA_MOCK_EMPLOYEES = [
  {
    id: 'kleva-001',
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice.johnson@kleva.com',
    department: 'Engineering',
    position: 'Senior Software Engineer',
    status: 'Active',
    hireDate: '2022-03-15',
  },
  {
    id: 'kleva-002',
    firstName: 'Bob',
    lastName: 'Williams',
    email: 'bob.williams@kleva.com',
    department: 'Sales',
    position: 'Sales Manager',
    status: 'Active',
    hireDate: '2021-07-22',
  },
  {
    id: 'kleva-003',
    firstName: 'Carol',
    lastName: 'Brown',
    email: 'carol.brown@kleva.com',
    department: 'HR',
    position: 'HR Coordinator',
    status: 'Active',
    hireDate: '2023-01-10',
  },
  {
    id: 'kleva-004',
    firstName: 'David',
    lastName: 'Miller',
    email: 'david.miller@kleva.com',
    department: 'Marketing',
    position: 'Marketing Specialist',
    status: 'Active',
    hireDate: '2022-11-05',
  },
  {
    id: 'kleva-005',
    firstName: 'Eva',
    lastName: 'Davis',
    email: 'eva.davis@kleva.com',
    department: 'Finance',
    position: 'Financial Analyst',
    status: 'Active',
    hireDate: '2021-05-18',
  },
];

export const KLEVA_MOCK_METRICS = {
  totalEmployees: KLEVA_MOCK_EMPLOYEES.length,
  activeEmployees: KLEVA_MOCK_EMPLOYEES.filter(e => e.status === 'Active').length,
  departments: [...new Set(KLEVA_MOCK_EMPLOYEES.map(e => e.department))].length,
  averageTenure: '1.8 years',
};

export const KLEVA_MOCK_LEAVE_DATA = {
  pendingRequests: 3,
  approvedRequests: 12,
  totalLeaveDays: 145,
};

export const KLEVA_MOCK_PERFORMANCE_DATA = {
  averageRating: 4.2,
  completedReviews: 4,
  pendingReviews: 1,
};

export const KLEVA_MOCK_PAYROLL_DATA = {
  totalPayroll: 125000,
  averageSalary: 25000,
  currency: 'USD',
};

/**
 * Get mock employee data for Kleva HR
 */
export function getKlevaMockEmployees() {
  return Promise.resolve(KLEVA_MOCK_EMPLOYEES);
}

/**
 * Get mock employee count for Kleva HR
 */
export function getKlevaMockEmployeeCount() {
  return Promise.resolve(KLEVA_MOCK_EMPLOYEES.length);
}

/**
 * Get mock metrics for Kleva HR
 */
export function getKlevaMockMetrics() {
  return Promise.resolve(KLEVA_MOCK_METRICS);
}
