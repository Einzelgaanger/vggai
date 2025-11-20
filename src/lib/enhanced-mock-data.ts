/**
 * Enhanced mock data for multiple child companies
 * Used when real API integrations are not available
 */

export interface MockEmployee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  status: string;
  hireDate: string;
  gender?: string;
  branch?: string;
  contractType?: string;
  tenure?: number;
}

export interface CompanyMockData {
  name: string;
  employees: MockEmployee[];
  metrics: {
    totalEmployees: number;
    activeEmployees: number;
    departments: number;
    branches: number;
    avgTenure: number;
    maleCount: number;
    femaleCount: number;
    fullTimeCount: number;
    contractCount: number;
  };
  analytics: {
    departmentData: Array<{ name: string; count: number; change?: string }>;
    branchData: Array<{ name: string; value: number }>;
    genderData: Array<{ name: string; value: number }>;
    tenureData: Array<{ range: string; count: number }>;
  };
  performance: {
    avgPerformanceScore: number;
    topPerformers: number;
    needsImprovement: number;
    revenuePerEmployee?: number;
    customerSatisfaction?: number;
  };
}

// Kleva HR Mock Data
const klevaEmployees: MockEmployee[] = [
  {
    id: "kleva-001",
    firstName: "Adebayo",
    lastName: "Okonkwo",
    email: "adebayo.okonkwo@kleva.demo",
    department: "Engineering",
    position: "Senior Software Engineer",
    status: "active",
    hireDate: "2020-03-15",
    gender: "Male",
    branch: "Lagos HQ",
    contractType: "Full-time",
    tenure: 4.5
  },
  {
    id: "kleva-002",
    firstName: "Chioma",
    lastName: "Nwankwo",
    email: "chioma.nwankwo@kleva.demo",
    department: "Product",
    position: "Product Manager",
    status: "active",
    hireDate: "2019-07-20",
    gender: "Female",
    branch: "Lagos HQ",
    contractType: "Full-time",
    tenure: 5.3
  },
  {
    id: "kleva-003",
    firstName: "Ibrahim",
    lastName: "Yusuf",
    email: "ibrahim.yusuf@kleva.demo",
    department: "Engineering",
    position: "DevOps Engineer",
    status: "active",
    hireDate: "2021-01-10",
    gender: "Male",
    branch: "Abuja",
    contractType: "Full-time",
    tenure: 3.8
  },
  {
    id: "kleva-004",
    firstName: "Fatima",
    lastName: "Mohammed",
    email: "fatima.mohammed@kleva.demo",
    department: "Marketing",
    position: "Marketing Manager",
    status: "active",
    hireDate: "2018-11-05",
    gender: "Female",
    branch: "Lagos HQ",
    contractType: "Full-time",
    tenure: 6.0
  },
  {
    id: "kleva-005",
    firstName: "Emeka",
    lastName: "Okoro",
    email: "emeka.okoro@kleva.demo",
    department: "Sales",
    position: "Sales Representative",
    status: "active",
    hireDate: "2022-02-14",
    gender: "Male",
    branch: "Port Harcourt",
    contractType: "Contract",
    tenure: 2.7
  },
  {
    id: "kleva-006",
    firstName: "Amina",
    lastName: "Hassan",
    email: "amina.hassan@kleva.demo",
    department: "Human Resources",
    position: "HR Coordinator",
    status: "active",
    hireDate: "2020-09-01",
    gender: "Female",
    branch: "Lagos HQ",
    contractType: "Full-time",
    tenure: 4.1
  },
  {
    id: "kleva-007",
    firstName: "Oluwaseun",
    lastName: "Adeyemi",
    email: "oluwaseun.adeyemi@kleva.demo",
    department: "Finance",
    position: "Accountant",
    status: "active",
    hireDate: "2021-06-18",
    gender: "Male",
    branch: "Lagos HQ",
    contractType: "Full-time",
    tenure: 3.4
  },
  {
    id: "kleva-008",
    firstName: "Blessing",
    lastName: "Eze",
    email: "blessing.eze@kleva.demo",
    department: "Operations",
    position: "Operations Manager",
    status: "active",
    hireDate: "2019-04-22",
    gender: "Female",
    branch: "Abuja",
    contractType: "Full-time",
    tenure: 5.5
  }
];

// WorkflowHR Mock Data
const workflowEmployees: MockEmployee[] = [
  {
    id: "workflow-001",
    firstName: "Tunde",
    lastName: "Bakare",
    email: "tunde.bakare@workflow.demo",
    department: "Technology",
    position: "Chief Technology Officer",
    status: "active",
    hireDate: "2017-01-15",
    gender: "Male",
    branch: "Lagos HQ",
    contractType: "Full-time",
    tenure: 7.8
  },
  {
    id: "workflow-002",
    firstName: "Ngozi",
    lastName: "Okeke",
    email: "ngozi.okeke@workflow.demo",
    department: "Customer Success",
    position: "Customer Success Lead",
    status: "active",
    hireDate: "2020-05-10",
    gender: "Female",
    branch: "Lagos HQ",
    contractType: "Full-time",
    tenure: 4.5
  },
  {
    id: "workflow-003",
    firstName: "Chukwudi",
    lastName: "Nnamdi",
    email: "chukwudi.nnamdi@workflow.demo",
    department: "Technology",
    position: "Lead Developer",
    status: "active",
    hireDate: "2019-03-20",
    gender: "Male",
    branch: "Port Harcourt",
    contractType: "Full-time",
    tenure: 5.6
  },
  {
    id: "workflow-004",
    firstName: "Aisha",
    lastName: "Bello",
    email: "aisha.bello@workflow.demo",
    department: "Product Design",
    position: "UX Designer",
    status: "active",
    hireDate: "2021-08-15",
    gender: "Female",
    branch: "Lagos HQ",
    contractType: "Full-time",
    tenure: 3.2
  },
  {
    id: "workflow-005",
    firstName: "Kelechi",
    lastName: "Onyeka",
    email: "kelechi.onyeka@workflow.demo",
    department: "Sales",
    position: "Account Executive",
    status: "active",
    hireDate: "2022-01-10",
    gender: "Male",
    branch: "Abuja",
    contractType: "Contract",
    tenure: 2.8
  },
  {
    id: "workflow-006",
    firstName: "Zainab",
    lastName: "Ibrahim",
    email: "zainab.ibrahim@workflow.demo",
    department: "Human Resources",
    position: "Talent Acquisition Lead",
    status: "active",
    hireDate: "2020-11-01",
    gender: "Female",
    branch: "Lagos HQ",
    contractType: "Full-time",
    tenure: 4.0
  }
];

// PayStackHR Mock Data
const paystackEmployees: MockEmployee[] = [
  {
    id: "paystack-001",
    firstName: "Babajide",
    lastName: "Afolabi",
    email: "babajide.afolabi@paystack.demo",
    department: "Finance",
    position: "Chief Financial Officer",
    status: "active",
    hireDate: "2018-02-01",
    gender: "Male",
    branch: "Lagos HQ",
    contractType: "Full-time",
    tenure: 6.7
  },
  {
    id: "paystack-002",
    firstName: "Oluwatoyin",
    lastName: "Adewale",
    email: "oluwatoyin.adewale@paystack.demo",
    department: "Compliance",
    position: "Compliance Manager",
    status: "active",
    hireDate: "2019-06-15",
    gender: "Female",
    branch: "Lagos HQ",
    contractType: "Full-time",
    tenure: 5.3
  },
  {
    id: "paystack-003",
    firstName: "Ahmed",
    lastName: "Musa",
    email: "ahmed.musa@paystack.demo",
    department: "Finance",
    position: "Senior Accountant",
    status: "active",
    hireDate: "2020-09-10",
    gender: "Male",
    branch: "Abuja",
    contractType: "Full-time",
    tenure: 4.1
  },
  {
    id: "paystack-004",
    firstName: "Funmilayo",
    lastName: "Johnson",
    email: "funmilayo.johnson@paystack.demo",
    department: "Treasury",
    position: "Treasury Analyst",
    status: "active",
    hireDate: "2021-04-20",
    gender: "Female",
    branch: "Lagos HQ",
    contractType: "Full-time",
    tenure: 3.5
  },
  {
    id: "paystack-005",
    firstName: "Victor",
    lastName: "Adekunle",
    email: "victor.adekunle@paystack.demo",
    department: "Operations",
    position: "Financial Operations Lead",
    status: "active",
    hireDate: "2019-12-01",
    gender: "Male",
    branch: "Lagos HQ",
    contractType: "Full-time",
    tenure: 4.9
  }
];

// TalentHub Mock Data
const talenthubEmployees: MockEmployee[] = [
  {
    id: "talent-001",
    firstName: "Nneka",
    lastName: "Okafor",
    email: "nneka.okafor@talenthub.demo",
    department: "Recruitment",
    position: "Head of Talent",
    status: "active",
    hireDate: "2018-08-15",
    gender: "Female",
    branch: "Lagos HQ",
    contractType: "Full-time",
    tenure: 6.2
  },
  {
    id: "talent-002",
    firstName: "Chinedu",
    lastName: "Obi",
    email: "chinedu.obi@talenthub.demo",
    department: "Recruitment",
    position: "Senior Recruiter",
    status: "active",
    hireDate: "2020-02-20",
    gender: "Male",
    branch: "Lagos HQ",
    contractType: "Full-time",
    tenure: 4.7
  },
  {
    id: "talent-003",
    firstName: "Ifeoma",
    lastName: "Chukwu",
    email: "ifeoma.chukwu@talenthub.demo",
    department: "Onboarding",
    position: "Onboarding Specialist",
    status: "active",
    hireDate: "2021-05-01",
    gender: "Female",
    branch: "Abuja",
    contractType: "Full-time",
    tenure: 3.4
  },
  {
    id: "talent-004",
    firstName: "Segun",
    lastName: "Oladipo",
    email: "segun.oladipo@talenthub.demo",
    department: "Training",
    position: "Learning & Development Lead",
    status: "active",
    hireDate: "2019-09-15",
    gender: "Male",
    branch: "Lagos HQ",
    contractType: "Full-time",
    tenure: 5.1
  }
];

// PeopleCore Mock Data
const peoplecoreEmployees: MockEmployee[] = [
  {
    id: "people-001",
    firstName: "Uche",
    lastName: "Nwosu",
    email: "uche.nwosu@peoplecore.demo",
    department: "Operations",
    position: "Chief Operations Officer",
    status: "active",
    hireDate: "2017-05-10",
    gender: "Male",
    branch: "Lagos HQ",
    contractType: "Full-time",
    tenure: 7.5
  },
  {
    id: "people-002",
    firstName: "Yetunde",
    lastName: "Ogunleye",
    email: "yetunde.ogunleye@peoplecore.demo",
    department: "Quality Assurance",
    position: "QA Manager",
    status: "active",
    hireDate: "2019-11-20",
    gender: "Female",
    branch: "Lagos HQ",
    contractType: "Full-time",
    tenure: 5.0
  },
  {
    id: "people-003",
    firstName: "Musa",
    lastName: "Abdullahi",
    email: "musa.abdullahi@peoplecore.demo",
    department: "Logistics",
    position: "Logistics Coordinator",
    status: "active",
    hireDate: "2020-07-15",
    gender: "Male",
    branch: "Kano",
    contractType: "Full-time",
    tenure: 4.3
  },
  {
    id: "people-004",
    firstName: "Chiamaka",
    lastName: "Nnamani",
    email: "chiamaka.nnamani@peoplecore.demo",
    department: "Customer Service",
    position: "Customer Service Lead",
    status: "active",
    hireDate: "2021-03-01",
    gender: "Female",
    branch: "Port Harcourt",
    contractType: "Full-time",
    tenure: 3.6
  }
];

// Generate analytics from employee data
const generateAnalytics = (employees: MockEmployee[]) => {
  const deptCounts: Record<string, number> = {};
  const branchCounts: Record<string, number> = {};
  const genderCounts: Record<string, number> = {};
  const tenureCounts = { "0-1": 0, "1-3": 0, "3-5": 0, "5+": 0 };

  let maleCount = 0;
  let femaleCount = 0;
  let fullTimeCount = 0;
  let contractCount = 0;
  let totalTenure = 0;

  employees.forEach((emp) => {
    // Department
    deptCounts[emp.department] = (deptCounts[emp.department] || 0) + 1;

    // Branch
    if (emp.branch) {
      branchCounts[emp.branch] = (branchCounts[emp.branch] || 0) + 1;
    }

    // Gender
    if (emp.gender) {
      genderCounts[emp.gender] = (genderCounts[emp.gender] || 0) + 1;
      if (emp.gender === "Male") maleCount++;
      if (emp.gender === "Female") femaleCount++;
    }

    // Contract Type
    if (emp.contractType === "Full-time") fullTimeCount++;
    if (emp.contractType === "Contract") contractCount++;

    // Tenure
    if (emp.tenure !== undefined) {
      totalTenure += emp.tenure;
      if (emp.tenure < 1) tenureCounts["0-1"]++;
      else if (emp.tenure < 3) tenureCounts["1-3"]++;
      else if (emp.tenure < 5) tenureCounts["3-5"]++;
      else tenureCounts["5+"]++;
    }
  });

  const avgTenure = employees.length > 0 ? totalTenure / employees.length : 0;

  return {
    metrics: {
      totalEmployees: employees.length,
      activeEmployees: employees.filter((e) => e.status === "active").length,
      departments: Object.keys(deptCounts).length,
      branches: Object.keys(branchCounts).length,
      avgTenure: Math.round(avgTenure * 10) / 10,
      maleCount,
      femaleCount,
      fullTimeCount,
      contractCount,
    },
    analytics: {
      departmentData: Object.entries(deptCounts).map(([name, count]) => ({
        name,
        count,
        change: "+5%", // Mock change
      })),
      branchData: Object.entries(branchCounts).map(([name, value]) => ({
        name,
        value,
      })),
      genderData: Object.entries(genderCounts).map(([name, value]) => ({
        name,
        value,
      })),
      tenureData: [
        { range: "0-1 years", count: tenureCounts["0-1"] },
        { range: "1-3 years", count: tenureCounts["1-3"] },
        { range: "3-5 years", count: tenureCounts["3-5"] },
        { range: "5+ years", count: tenureCounts["5+"] },
      ],
    },
  };
};

// Build complete company mock data
export const COMPANY_MOCK_DATA: Record<string, CompanyMockData> = {
  "Kleva HR": {
    name: "Kleva HR",
    employees: klevaEmployees,
    ...generateAnalytics(klevaEmployees),
    performance: {
      avgPerformanceScore: 4.2,
      topPerformers: 3,
      needsImprovement: 1,
      revenuePerEmployee: 125000,
      customerSatisfaction: 92,
    },
  },
  "WorkflowHR": {
    name: "WorkflowHR",
    employees: workflowEmployees,
    ...generateAnalytics(workflowEmployees),
    performance: {
      avgPerformanceScore: 4.5,
      topPerformers: 2,
      needsImprovement: 0,
      revenuePerEmployee: 180000,
      customerSatisfaction: 95,
    },
  },
  "PayStackHR": {
    name: "PayStackHR",
    employees: paystackEmployees,
    ...generateAnalytics(paystackEmployees),
    performance: {
      avgPerformanceScore: 4.3,
      topPerformers: 2,
      needsImprovement: 1,
      revenuePerEmployee: 210000,
      customerSatisfaction: 89,
    },
  },
  "TalentHub": {
    name: "TalentHub",
    employees: talenthubEmployees,
    ...generateAnalytics(talenthubEmployees),
    performance: {
      avgPerformanceScore: 4.4,
      topPerformers: 2,
      needsImprovement: 0,
      revenuePerEmployee: 95000,
      customerSatisfaction: 93,
    },
  },
  "PeopleCore": {
    name: "PeopleCore",
    employees: peoplecoreEmployees,
    ...generateAnalytics(peoplecoreEmployees),
    performance: {
      avgPerformanceScore: 4.1,
      topPerformers: 1,
      needsImprovement: 1,
      revenuePerEmployee: 110000,
      customerSatisfaction: 88,
    },
  },
};

/**
 * Get mock data for a specific company
 */
export function getCompanyMockData(companyName: string): CompanyMockData | null {
  return COMPANY_MOCK_DATA[companyName] || null;
}

/**
 * Get all available mock companies
 */
export function getAllMockCompanies(): string[] {
  return Object.keys(COMPANY_MOCK_DATA);
}