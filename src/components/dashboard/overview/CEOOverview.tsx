import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Users, TrendingUp, DollarSign, Calendar, Building2, UserCheck, Clock, Award } from "lucide-react";
import { getSeamlessHREmployees } from "@/lib/seamlesshr-service";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface CEOOverviewProps {
  childCompany: string;
}

interface MetricCard {
  title: string;
  value: string | number;
  change?: string;
  icon: any;
  trend?: "up" | "down" | "neutral";
  description?: string;
}

const CEOOverview = ({ childCompany }: CEOOverviewProps) => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<MetricCard[]>([]);

  useEffect(() => {
    loadCEOMetrics();
  }, [childCompany]);

  const loadCEOMetrics = async () => {
    setLoading(true);
    try {
      if (childCompany === "Seamless HR") {
        const employees = await getSeamlessHREmployees();
        
        // Calculate comprehensive metrics
        const totalEmployees = employees.length;
        const activeEmployees = employees.filter(emp => !emp.exit_status).length;
        const departments = [...new Set(employees.map(emp => emp.department))].length;
        const branches = [...new Set(employees.map(emp => emp.branch))].length;
        
        // Calculate average tenure
        const avgTenure = employees.reduce((sum, emp) => {
          const tenureMatch = emp.tenure_on_grade?.match(/(\d+)\s*years/);
          return sum + (tenureMatch ? parseInt(tenureMatch[1]) : 0);
        }, 0) / employees.length;

        // Gender distribution
        const maleCount = employees.filter(emp => emp.sex?.toLowerCase() === 'male').length;
        const femaleCount = employees.filter(emp => emp.sex?.toLowerCase() === 'female').length;

        // Contract types
        const fullTimeCount = employees.filter(emp => emp.contract_type?.toLowerCase() === 'full time').length;
        const confirmedCount = employees.filter(emp => emp.confirmation_status?.toLowerCase() === 'confirmed').length;

        const metricsData: MetricCard[] = [
          {
            title: "Total Workforce",
            value: totalEmployees,
            change: "+8.2%",
            icon: Users,
            trend: "up",
            description: "Active employees"
          },
          {
            title: "Active Employees",
            value: activeEmployees,
            change: `${((activeEmployees/totalEmployees)*100).toFixed(1)}%`,
            icon: UserCheck,
            trend: "up",
            description: "Currently employed"
          },
          {
            title: "Departments",
            value: departments,
            icon: Building2,
            description: "Operating units"
          },
          {
            title: "Office Locations",
            value: branches,
            icon: Building2,
            description: "Branch offices"
          },
          {
            title: "Average Tenure",
            value: `${avgTenure.toFixed(1)} yrs`,
            icon: Clock,
            trend: "up",
            description: "Employee retention"
          },
          {
            title: "Gender Diversity",
            value: `${maleCount}/${femaleCount}`,
            icon: Users,
            description: "Male/Female ratio"
          },
          {
            title: "Full-Time Staff",
            value: `${((fullTimeCount/totalEmployees)*100).toFixed(0)}%`,
            icon: Award,
            trend: "up",
            description: "Contract stability"
          },
          {
            title: "Confirmed Staff",
            value: confirmedCount,
            change: `${((confirmedCount/totalEmployees)*100).toFixed(0)}%`,
            icon: UserCheck,
            trend: "up",
            description: "Permanent employees"
          }
        ];

        setMetrics(metricsData);
      } else {
        // Kleva HR - Mock data
        const mockMetrics: MetricCard[] = [
          {
            title: "Total Workforce",
            value: 245,
            change: "+12.3%",
            icon: Users,
            trend: "up",
            description: "Active employees"
          },
          {
            title: "Revenue Growth",
            value: "₦45.2M",
            change: "+18.5%",
            icon: TrendingUp,
            trend: "up",
            description: "This quarter"
          },
          {
            title: "Operating Margin",
            value: "32.4%",
            change: "+2.1%",
            icon: DollarSign,
            trend: "up",
            description: "Profit margin"
          },
          {
            title: "Customer Retention",
            value: "94.5%",
            change: "+1.2%",
            icon: Award,
            trend: "up",
            description: "Year over year"
          }
        ];
        setMetrics(mockMetrics);
      }
    } catch (error) {
      console.error('Failed to load CEO metrics:', error);
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-32" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card 
              key={index} 
              className="p-6 hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {metric.title}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-bold text-foreground">
                      {metric.value}
                    </h3>
                    {metric.change && (
                      <span className={`text-sm font-medium ${
                        metric.trend === 'up' ? 'text-green-600 dark:text-green-400' : 
                        metric.trend === 'down' ? 'text-red-600 dark:text-red-400' : 
                        'text-muted-foreground'
                      }`}>
                        {metric.change}
                      </span>
                    )}
                  </div>
                  {metric.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {metric.description}
                    </p>
                  )}
                </div>
                <div className="ml-4">
                  <div className={`p-3 rounded-lg ${
                    metric.trend === 'up' ? 'bg-green-100 dark:bg-green-900/20' :
                    metric.trend === 'down' ? 'bg-red-100 dark:bg-red-900/20' :
                    'bg-primary/10'
                  }`}>
                    <Icon className={`h-5 w-5 ${
                      metric.trend === 'up' ? 'text-green-600 dark:text-green-400' :
                      metric.trend === 'down' ? 'text-red-600 dark:text-red-400' :
                      'text-primary'
                    }`} />
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default CEOOverview;
