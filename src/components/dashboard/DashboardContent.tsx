import { Card } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, DollarSign, Activity, Target } from "lucide-react";

interface DashboardContentProps {
  role: string | null;
  userEmail: string;
}

const DashboardContent = ({ role, userEmail }: DashboardContentProps) => {
  // Mock analytics data - in real app, this would come from APIs based on permissions
  const getAnalyticsForRole = (role: string) => {
    const baseMetrics = [
      { label: "Total Revenue", value: "$124,500", change: "+12.5%", icon: DollarSign, color: "text-green-600" },
      { label: "Active Users", value: "1,245", change: "+8.2%", icon: Users, color: "text-blue-600" },
      { label: "Performance", value: "94.2%", change: "+2.1%", icon: Activity, color: "text-purple-600" },
      { label: "Goals Met", value: "87%", change: "+5.3%", icon: Target, color: "text-orange-600" },
    ];

    // Customize metrics based on role
    if (role.includes('ceo') || role.includes('cfo')) {
      return baseMetrics;
    } else if (role.includes('sales')) {
      return [
        { label: "Sales Target", value: "$85,000", change: "+15%", icon: Target, color: "text-green-600" },
        { label: "Deals Closed", value: "32", change: "+8", icon: TrendingUp, color: "text-blue-600" },
        { label: "Pipeline Value", value: "$450K", change: "+22%", icon: DollarSign, color: "text-purple-600" },
        { label: "Conversion Rate", value: "24%", change: "+3%", icon: Activity, color: "text-orange-600" },
      ];
    } else if (role.includes('developer') || role.includes('engineering')) {
      return [
        { label: "Deployments", value: "42", change: "+12", icon: Activity, color: "text-green-600" },
        { label: "Code Quality", value: "A+", change: "Stable", icon: Target, color: "text-blue-600" },
        { label: "Open Issues", value: "18", change: "-5", icon: BarChart3, color: "text-purple-600" },
        { label: "Uptime", value: "99.9%", change: "0%", icon: TrendingUp, color: "text-orange-600" },
      ];
    } else if (role.includes('hr')) {
      return [
        { label: "Employees", value: "156", change: "+8", icon: Users, color: "text-green-600" },
        { label: "Satisfaction", value: "4.2/5", change: "+0.3", icon: Activity, color: "text-blue-600" },
        { label: "Open Positions", value: "12", change: "+3", icon: Target, color: "text-purple-600" },
        { label: "Retention", value: "92%", change: "+2%", icon: TrendingUp, color: "text-orange-600" },
      ];
    }
    
    return baseMetrics;
  };

  const metrics = role ? getAnalyticsForRole(role) : [];

  const getRoleWelcome = (role: string) => {
    if (role.includes('ceo')) return "Executive Overview";
    if (role.includes('cfo')) return "Financial Dashboard";
    if (role.includes('cto')) return "Technology Overview";
    if (role.includes('sales')) return "Sales Performance";
    if (role.includes('developer') || role.includes('engineering')) return "Engineering Dashboard";
    if (role.includes('hr')) return "HR Analytics";
    if (role.includes('marketing')) return "Marketing Metrics";
    if (role.includes('support')) return "Support Dashboard";
    return "Your Dashboard";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {role && getRoleWelcome(role)}
        </h2>
        <p className="text-muted-foreground mt-1">
          Welcome back, {userEmail}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="p-6 shadow-soft hover:shadow-medium transition-shadow">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                  <p className="text-3xl font-bold">{metric.value}</p>
                  <p className={`text-sm font-medium ${metric.color}`}>{metric.change}</p>
                </div>
                <div className={`p-3 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10`}>
                  <Icon className={`h-6 w-6 ${metric.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-6 shadow-soft">
        <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { action: "Dashboard accessed", time: "Just now", status: "active" },
            { action: "Report generated", time: "10 minutes ago", status: "complete" },
            { action: "Data synced", time: "1 hour ago", status: "complete" },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
              <div>
                <p className="font-medium">{activity.action}</p>
                <p className="text-sm text-muted-foreground">{activity.time}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                activity.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {activity.status}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default DashboardContent;
