import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";
import { Activity, TrendingUp } from "lucide-react";

interface Metric {
  id: string;
  metric_type: string;
  metric_value: number;
  metric_unit: string;
  recorded_at: string;
}

interface RealtimeMetricsChartProps {
  companyId?: string;
  metricType: string;
  title: string;
  description?: string;
  chartType?: "line" | "area";
}

const RealtimeMetricsChart = ({ 
  companyId, 
  metricType, 
  title, 
  description,
  chartType = "line" 
}: RealtimeMetricsChartProps) => {
  const [data, setData] = useState<Array<{ time: string; value: number }>>([]);
  const [latestValue, setLatestValue] = useState<number>(0);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let channel: RealtimeChannel;

    const fetchInitialData = async () => {
      const query = supabase
        .from('metrics')
        .select('*')
        .eq('metric_type', metricType)
        .order('recorded_at', { ascending: false })
        .limit(20);

      if (companyId) {
        query.eq('company_id', companyId);
      }

      const { data: metrics, error } = await query;

      if (error) {
        console.error('Error fetching metrics:', error);
        return;
      }

      if (metrics && metrics.length > 0) {
        const chartData = metrics
          .reverse()
          .map((m: Metric) => ({
            time: new Date(m.recorded_at).toLocaleTimeString(),
            value: Number(m.metric_value),
          }));
        
        setData(chartData);
        setLatestValue(Number(metrics[0].metric_value));
      }
    };

    const setupRealtimeSubscription = () => {
      channel = supabase
        .channel('metrics-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'metrics',
            filter: `metric_type=eq.${metricType}`,
          },
          (payload) => {
            console.log('New metric received:', payload);
            setIsLive(true);
            
            const newMetric = payload.new as Metric;
            const newDataPoint = {
              time: new Date(newMetric.recorded_at).toLocaleTimeString(),
              value: Number(newMetric.metric_value),
            };

            setData((prev) => {
              const updated = [...prev, newDataPoint];
              // Keep last 20 data points
              return updated.slice(-20);
            });
            
            setLatestValue(Number(newMetric.metric_value));

            // Reset live indicator after 2 seconds
            setTimeout(() => setIsLive(false), 2000);
          }
        )
        .subscribe();
    };

    fetchInitialData();
    setupRealtimeSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [companyId, metricType]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {title}
              {isLive && (
                <span className="flex items-center gap-1 text-sm font-normal text-green-600">
                  <Activity className="h-3 w-3 animate-pulse" />
                  Live
                </span>
              )}
            </CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{latestValue.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Real-time
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          {chartType === "area" ? (
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.3}
                strokeWidth={2}
                name={metricType}
              />
            </AreaChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                name={metricType}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default RealtimeMetricsChart;

