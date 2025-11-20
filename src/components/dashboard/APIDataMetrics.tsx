import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Users, Activity, Target } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getSeamlessHREmployeeCount } from "@/lib/seamlesshr-service";
import { getKlevaMockEmployeeCount, getKlevaMockMetrics } from "@/lib/kleva-mock-data";
import { toast } from "sonner";

interface Metric {
  label: string;
  value: string | number;
  change: string;
  icon: any;
  color: string;
}

interface APIDataMetricsProps {
  role: string | null;
  userEmail: string;
  childCompany?: string;
}

const APIDataMetrics = ({ role, userEmail, childCompany = 'Seamless HR' }: APIDataMetricsProps) => {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, [role, childCompany]);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      console.log('Loading metrics for:', childCompany);

      let companyMetrics: any = {};

      if (childCompany === 'Seamless HR') {
        const employeeCount = await getSeamlessHREmployeeCount();
        companyMetrics = {
          totalEmployees: employeeCount,
          activeEmployees: employeeCount,
          departments: 5,
          openPositions: 3,
        };
      } else if (childCompany === 'Kleva HR') {
        companyMetrics = await getKlevaMockMetrics();
      }

      const metricDefinitions = getMetricDefinitions(role);
      const processedMetrics = processMetrics(metricDefinitions, companyMetrics);
      setMetrics(processedMetrics);
    } catch (error) {
      console.error('Error loading metrics:', error);
      toast.error(`Failed to load data from ${childCompany}`);
      setMetrics([]);
    } finally {
      setLoading(false);
    }
  };

  const getMetricDefinitions = (role: string | null): Omit<Metric, 'value' | 'change'>[] => {
    const roleMetrics: Record<string, Omit<Metric, 'value' | 'change'>[]> = {
      ceo: [
        { label: "Total Employees", icon: Users, color: "text-primary" },
        { label: "Active Employees", icon: Users, color: "text-success" },
        { label: "Departments", icon: Target, color: "text-accent" },
        { label: "Open Positions", icon: Activity, color: "text-secondary" },
      ],
      cto: [
        { label: "Total Employees", icon: Users, color: "text-primary" },
        { label: "Active Employees", icon: Users, color: "text-success" },
        { label: "Departments", icon: Target, color: "text-accent" },
      ],
      hr_manager: [
        { label: "Total Employees", icon: Users, color: "text-success" },
        { label: "Active Employees", icon: Users, color: "text-primary" },
        { label: "Departments", icon: Target, color: "text-accent" },
        { label: "Open Positions", icon: Activity, color: "text-secondary" },
      ],
      cfo: [
        { label: "Total Employees", icon: Users, color: "text-primary" },
        { label: "Active Employees", icon: Users, color: "text-success" },
      ],
      data_analyst: [
        { label: "Total Employees", icon: Users, color: "text-primary" },
        { label: "Departments", icon: Target, color: "text-accent" },
      ],
    };

    return roleMetrics[role || ''] || [
      { label: "Total Employees", icon: Users, color: "text-primary" },
      { label: "Active Employees", icon: Users, color: "text-success" },
    ];
  };

  const processMetrics = (
    definitions: Omit<Metric, 'value' | 'change'>[],
    companyMetrics: any
  ): Metric[] => {
    const metricMap: Record<string, any> = {
      "Total Employees": companyMetrics.totalEmployees || 0,
      "Active Employees": companyMetrics.activeEmployees || 0,
      "Departments": companyMetrics.departments || 0,
      "Open Positions": companyMetrics.openPositions || 0,
    };

    return definitions.map(def => ({
      ...def,
      value: metricMap[def.label] || 0,
      change: "+0%",
    }));
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6 border-2">
            <Skeleton className="h-12 w-12 rounded-xl mb-4" />
            <Skeleton className="h-4 w-28 mb-2" />
            <Skeleton className="h-8 w-20 mb-2" />
            <Skeleton className="h-4 w-16" />
          </Card>
        ))}
      </div>
    );
  }

  if (metrics.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-4">
          <Users className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-lg font-semibold text-foreground mb-2">No metrics available</p>
        <p className="text-sm text-muted-foreground">Waiting for data from {childCompany}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card 
            key={index} 
            className="group hover-lift bg-gradient-to-br from-card to-primary/5 border-2 border-border hover:border-primary/30 transition-all"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                <p className="text-3xl font-bold text-foreground tracking-tight">{metric.value}</p>
                <p className={`text-sm font-semibold ${metric.color}`}>
                  {metric.change}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default APIDataMetrics;
