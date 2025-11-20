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
        { label: "Total Employees", icon: Users, color: "text-blue-600" },
        { label: "Active Employees", icon: Users, color: "text-green-600" },
        { label: "Departments", icon: Target, color: "text-purple-600" },
        { label: "Open Positions", icon: Activity, color: "text-orange-600" },
      ],
      cto: [
        { label: "Total Employees", icon: Users, color: "text-blue-600" },
        { label: "Active Employees", icon: Users, color: "text-green-600" },
        { label: "Departments", icon: Target, color: "text-purple-600" },
      ],
      hr_manager: [
        { label: "Total Employees", icon: Users, color: "text-green-600" },
        { label: "Active Employees", icon: Users, color: "text-blue-600" },
        { label: "Departments", icon: Target, color: "text-purple-600" },
        { label: "Open Positions", icon: Activity, color: "text-orange-600" },
      ],
      cfo: [
        { label: "Total Employees", icon: Users, color: "text-blue-600" },
        { label: "Active Employees", icon: Users, color: "text-green-600" },
      ],
      data_analyst: [
        { label: "Total Employees", icon: Users, color: "text-blue-600" },
        { label: "Departments", icon: Target, color: "text-purple-600" },
      ],
    };

    return roleMetrics[role || ''] || [
      { label: "Total Employees", icon: Users, color: "text-blue-600" },
      { label: "Active Employees", icon: Users, color: "text-green-600" },
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-16" />
          </Card>
        ))}
      </div>
    );
  }

  if (metrics.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No metrics available for {childCompany}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card 
            key={index} 
            className="p-6 hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <p className="text-3xl font-bold">{metric.value}</p>
                <p className={`text-sm ${metric.color}`}>{metric.change}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default APIDataMetrics;
