import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, DollarSign, Activity, Target } from "lucide-react";
import { fetchAPIData, extractMetric } from "@/lib/api-service";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Metric {
  label: string;
  value: string | number;
  change: string;
  icon: typeof DollarSign;
  color: string;
  apiPath?: string; // Path to extract from API data
  endpointName?: string; // Which endpoint to fetch from
  format?: (value: any) => string; // Format function
}

interface APIDataMetricsProps {
  role: string | null;
  userEmail: string;
}

const APIDataMetrics = ({ role, userEmail }: APIDataMetricsProps) => {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiData, setApiData] = useState<Record<string, any>>({});

  useEffect(() => {
    loadMetrics();
  }, [role]);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch API data
      const data = await fetchAPIData(user.id);
      if (data) {
        setApiData(data);
      }

      // Get role-specific metric definitions
      const metricDefinitions = getMetricDefinitions(role);
      
      // Process metrics with real API data
      const processedMetrics = await processMetrics(metricDefinitions, data || {});
      setMetrics(processedMetrics);
    } catch (error) {
      console.error('Error loading metrics:', error);
      // Fallback to empty metrics
      setMetrics([]);
    } finally {
      setLoading(false);
    }
  };

  const getMetricDefinitions = (role: string | null): Omit<Metric, 'value' | 'change'>[] => {
    // Define which metrics each role should see and where to get them from API
    const roleMetrics: Record<string, Omit<Metric, 'value' | 'change'>[]> = {
      ceo: [
        { label: "Total Employees", icon: Users, color: "text-blue-600", apiPath: "data.total_employees", endpointName: "employees" },
        { label: "Active Employees", icon: Users, color: "text-green-600", apiPath: "data.active_employees", endpointName: "employees" },
        { label: "Departments", icon: Target, color: "text-purple-600", apiPath: "data.departments.length", endpointName: "departments" },
        { label: "Open Positions", icon: Activity, color: "text-orange-600", apiPath: "data.open_positions", endpointName: "recruitment" },
      ],
      hr_manager: [
        { label: "Total Employees", icon: Users, color: "text-green-600", apiPath: "data.total", endpointName: "employees" },
        { label: "Open Positions", icon: Activity, color: "text-blue-600", apiPath: "data.open_positions", endpointName: "recruitment" },
        { label: "Departments", icon: Target, color: "text-purple-600", apiPath: "data.departments.length", endpointName: "departments" },
      ],
      cfo: [
        { label: "Total Employees", icon: Users, color: "text-blue-600", apiPath: "data.total", endpointName: "employees" },
        { label: "Payroll Cost", icon: DollarSign, color: "text-green-600", apiPath: "data.total_payroll", endpointName: "payroll" },
      ],
      // Add more role definitions as needed
    };

    return roleMetrics[role || ''] || [];
  };

  const processMetrics = async (
    definitions: Omit<Metric, 'value' | 'change'>[],
    data: Record<string, any>
  ): Promise<Metric[]> => {
    return definitions.map(def => {
      let value: number | string = 0;
      
      if (def.endpointName && data[def.endpointName]) {
        if (def.apiPath) {
          value = extractMetric(data[def.endpointName], def.apiPath);
        } else {
          // Try to extract from common paths
          value = extractMetric(data[def.endpointName], 'data.total') ||
                  extractMetric(data[def.endpointName], 'total') ||
                  extractMetric(data[def.endpointName], 'count') ||
                  0;
        }
      }

      // Format value
      let formattedValue = value;
      if (typeof value === 'number') {
        if (def.label.toLowerCase().includes('revenue') || def.label.toLowerCase().includes('cost')) {
          formattedValue = `$${(value / 1000).toFixed(1)}K`;
        } else if (def.label.toLowerCase().includes('percent') || def.label.toLowerCase().includes('%')) {
          formattedValue = `${value}%`;
        } else {
          formattedValue = value.toLocaleString();
        }
      }

      return {
        ...def,
        value: formattedValue,
        change: "+0%", // TODO: Calculate from historical data
      };
    });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
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
        <p>No metrics available</p>
        <p className="text-sm">Configure API endpoints and credentials to see data</p>
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
            className="p-6 shadow-soft hover:shadow-medium transition-all border border-border animate-slide-up"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <p className="fredoka-medium text-sm text-muted-foreground">{metric.label}</p>
                <p className="fredoka-bold text-3xl text-foreground">{metric.value}</p>
                <p className={`fredoka-semibold text-sm ${metric.color}`}>{metric.change}</p>
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

