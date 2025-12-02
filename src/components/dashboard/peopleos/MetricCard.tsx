import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  onClick?: () => void;
  className?: string;
}

export function MetricCard({
  label,
  value,
  change,
  trend = 'neutral',
  onClick,
  className,
}: MetricCardProps) {
  return (
    <Card
      className={cn(
        "transition-all hover:border-primary/50",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="pt-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-bold">{value}</p>
            {change && trend !== 'neutral' && (
              <div className={cn(
                "flex items-center gap-1 text-sm font-medium",
                trend === 'up' ? "text-green-600" : "text-red-600"
              )}>
                {trend === 'up' ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>{change}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

