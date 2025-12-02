import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { useState } from "react";

interface InteractiveChartProps {
  type: 'bar' | 'pie' | 'line' | 'area';
  data: {
    labels: string[];
    datasets: Array<{
      label?: string;
      data: number[];
      backgroundColor?: string[];
    }>;
  };
  onSegmentClick?: (segment: { label: string; value: number }) => void;
  aiInsight?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function InteractiveChart({
  type,
  data,
  onSegmentClick,
  aiInsight,
}: InteractiveChartProps) {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  // Transform data for Recharts
  const chartData = data.labels.map((label, index) => ({
    name: label,
    value: data.datasets[0].data[index],
  }));

  const handleClick = (entry: any) => {
    if (onSegmentClick) {
      onSegmentClick({ label: entry.name, value: entry.value });
    }
  };

  if (type === 'bar') {
    return (
      <div className="space-y-4">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} onClick={handleClick}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background border rounded-lg p-3 shadow-lg">
                      <p className="font-semibold">{payload[0].payload.name}</p>
                      <p className="text-primary">
                        {payload[0].name}: {payload[0].value}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="value"
              fill="#0088FE"
              onMouseEnter={(entry) => setHoveredSegment(entry.name)}
              onMouseLeave={() => setHoveredSegment(null)}
              className="cursor-pointer"
            />
          </BarChart>
        </ResponsiveContainer>
        {aiInsight && (
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 text-sm text-muted-foreground cursor-help">
                  <Info className="h-4 w-4 text-primary" />
                  <span>AI Insight: {aiInsight}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>AI-driven insight based on current data trends</p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        )}
      </div>
    );
  }

  if (type === 'pie') {
    return (
      <div className="space-y-4">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              onClick={handleClick}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredSegment(entry.name)}
                  onMouseLeave={() => setHoveredSegment(null)}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        {aiInsight && (
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 text-sm text-muted-foreground cursor-help">
                  <Info className="h-4 w-4 text-primary" />
                  <span>AI Insight: {aiInsight}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>AI-driven insight based on current data trends</p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        )}
      </div>
    );
  }

  return null;
}

