/**
 * Role-specific mock data variations
 * Different roles see different types of data and metrics
 */

import { getCompanyMockData } from "./enhanced-mock-data";

export interface RoleSpecificMetric {
  title: string;
  value: string | number;
  change?: string;
  icon: string;
  trend?: "up" | "down" | "neutral";
  description?: string;
}

/**
 * Get role-specific metrics for a company
 */
export function getRoleSpecificMetrics(role: string, company: string): RoleSpecificMetric[] {
  const mockData = getCompanyMockData(company);
  
  if (!mockData) {
    return getDefaultMetrics(role);
  }

  const { metrics, performance } = mockData;

  switch (role) {
    case "ceo":
    case "cto":
    case "cfo":
      return [
        {
          title: "Total Employees",
          value: metrics.totalEmployees,
          change: "+8%",
          icon: "Users",
          trend: "up",
          description: "Active workforce"
        },
        {
          title: "Departments",
          value: metrics.departments,
          icon: "Building2",
          description: "Active departments"
        },
        {
          title: "Revenue/Employee",
          value: `$${(performance.revenuePerEmployee! / 1000).toFixed(0)}K`,
          change: "+12%",
          icon: "DollarSign",
          trend: "up",
          description: "Productivity metric"
        },
        {
          title: "Performance Score",
          value: performance.avgPerformanceScore.toFixed(1),
          change: "+0.2",
          icon: "Star",
          trend: "up",
          description: "Team performance"
        },
        {
          title: "Customer Satisfaction",
          value: `${performance.customerSatisfaction}%`,
          change: "+3%",
          icon: "Award",
          trend: "up",
          description: "CSAT score"
        }
      ];

    case "hr_manager":
    case "hr_coordinator":
      return [
        {
          title: "Total Headcount",
          value: metrics.totalEmployees,
          change: "+5%",
          icon: "Users",
          trend: "up",
          description: "Total workforce"
        },
        {
          title: "Active Staff",
          value: metrics.activeEmployees,
          icon: "UserCheck",
          description: "Currently employed"
        },
        {
          title: "Avg. Tenure",
          value: `${metrics.avgTenure} yrs`,
          icon: "Calendar",
          description: "Employee retention"
        },
        {
          title: "Full-time Staff",
          value: `${Math.round((metrics.fullTimeCount / metrics.totalEmployees) * 100)}%`,
          icon: "Briefcase",
          description: "Employment stability"
        },
        {
          title: "Gender Balance",
          value: `${Math.round((metrics.maleCount / metrics.totalEmployees) * 100)}:${Math.round((metrics.femaleCount / metrics.totalEmployees) * 100)}`,
          icon: "Users",
          description: "M:F ratio"
        },
        {
          title: "Top Performers",
          value: performance.topPerformers,
          icon: "Star",
          trend: "up",
          description: "Exceeding expectations"
        }
      ];

    case "sales_manager":
    case "sales_representative":
      return [
        {
          title: "Sales Team Size",
          value: Math.ceil(metrics.totalEmployees * 0.25), // Estimate 25% in sales
          icon: "Users",
          description: "Sales personnel"
        },
        {
          title: "Revenue/Employee",
          value: `$${(performance.revenuePerEmployee! / 1000).toFixed(0)}K`,
          change: "+15%",
          icon: "DollarSign",
          trend: "up",
          description: "Sales efficiency"
        },
        {
          title: "Customer Satisfaction",
          value: `${performance.customerSatisfaction}%`,
          change: "+4%",
          icon: "Award",
          trend: "up",
          description: "Customer feedback"
        },
        {
          title: "Team Performance",
          value: performance.avgPerformanceScore.toFixed(1),
          change: "+0.3",
          icon: "Star",
          trend: "up",
          description: "Sales team rating"
        }
      ];

    case "finance_manager":
    case "accountant":
      return [
        {
          title: "Total Payroll",
          value: `$${((metrics.totalEmployees * 65000) / 1000000).toFixed(1)}M`,
          icon: "DollarSign",
          description: "Annual payroll"
        },
        {
          title: "Avg. Compensation",
          value: "$65K",
          icon: "DollarSign",
          description: "Per employee"
        },
        {
          title: "Full-time Staff",
          value: metrics.fullTimeCount,
          icon: "Briefcase",
          description: "Permanent employees"
        },
        {
          title: "Contract Staff",
          value: metrics.contractCount,
          icon: "Clock",
          description: "Contract workers"
        },
        {
          title: "Revenue/Employee",
          value: `$${(performance.revenuePerEmployee! / 1000).toFixed(0)}K`,
          change: "+12%",
          icon: "TrendingUp",
          trend: "up",
          description: "Productivity"
        }
      ];

    case "operations_manager":
      return [
        {
          title: "Operations Team",
          value: Math.ceil(metrics.totalEmployees * 0.3), // Estimate 30% in ops
          icon: "Users",
          description: "Operations staff"
        },
        {
          title: "Locations",
          value: metrics.branches,
          icon: "Building2",
          description: "Active offices"
        },
        {
          title: "Efficiency Score",
          value: performance.avgPerformanceScore.toFixed(1),
          change: "+0.2",
          icon: "Star",
          trend: "up",
          description: "Operational performance"
        },
        {
          title: "Customer Satisfaction",
          value: `${performance.customerSatisfaction}%`,
          icon: "Award",
          description: "Service quality"
        }
      ];

    case "engineering_manager":
    case "senior_developer":
    case "junior_developer":
      return [
        {
          title: "Engineering Team",
          value: Math.ceil(metrics.totalEmployees * 0.35), // Estimate 35% in engineering
          icon: "Users",
          description: "Technical staff"
        },
        {
          title: "Departments",
          value: Math.ceil(metrics.departments * 0.4), // Estimate engineering departments
          icon: "Building2",
          description: "Tech departments"
        },
        {
          title: "Performance Score",
          value: performance.avgPerformanceScore.toFixed(1),
          change: "+0.3",
          icon: "Star",
          trend: "up",
          description: "Team performance"
        },
        {
          title: "Avg. Tenure",
          value: `${metrics.avgTenure} yrs`,
          icon: "Calendar",
          description: "Team stability"
        }
      ];

    case "data_analyst":
      return [
        {
          title: "Data Points",
          value: metrics.totalEmployees * 15,
          icon: "Database",
          description: "Active data points"
        },
        {
          title: "Departments Tracked",
          value: metrics.departments,
          icon: "Building2",
          description: "Data sources"
        },
        {
          title: "Performance Score",
          value: performance.avgPerformanceScore.toFixed(1),
          icon: "Star",
          description: "Overall rating"
        },
        {
          title: "Data Quality",
          value: "95%",
          change: "+2%",
          icon: "CheckCircle",
          trend: "up",
          description: "Accuracy score"
        }
      ];

    default:
      return getDefaultMetrics(role);
  }
}

/**
 * Default metrics for roles not specifically handled
 */
function getDefaultMetrics(role: string): RoleSpecificMetric[] {
  return [
    {
      title: "Team Members",
      value: 24,
      icon: "Users",
      description: "Your team"
    },
    {
      title: "Active Projects",
      value: 8,
      change: "+2",
      icon: "Briefcase",
      trend: "up",
      description: "Ongoing work"
    },
    {
      title: "Performance",
      value: 4.2,
      change: "+0.3",
      icon: "Star",
      trend: "up",
      description: "Team rating"
    },
    {
      title: "Completion Rate",
      value: "87%",
      change: "+5%",
      icon: "CheckCircle",
      trend: "up",
      description: "Task completion"
    }
  ];
}