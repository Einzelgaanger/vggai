import { Card } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, DollarSign, Activity, Target } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmbeddingsManager from "./EmbeddingsManager";
import RealtimeMetricsChart from "./RealtimeMetricsChart";
import CompanyManagement from "./CompanyManagement";
import APIIntegrationManager from "./APIIntegrationManager";
import WorkflowAutomation from "./WorkflowAutomation";
import { AdminPanel } from "./AdminPanel";

interface DashboardContentProps {
  role: string | null;
  userEmail: string;
}

const DashboardContent = ({ role, userEmail }: DashboardContentProps) => {
  const getAnalyticsForRole = (role: string | null) => {
    switch (role) {
      case "ceo":
        return [
          { label: "Company Revenue", value: "$5.2M", change: "+18.5%", icon: DollarSign, color: "text-green-600" },
          { label: "Total Employees", value: "234", change: "+12.0%", icon: Users, color: "text-blue-600" },
          { label: "Profit Margin", value: "24.5%", change: "+2.1%", icon: TrendingUp, color: "text-purple-600" },
          { label: "Active Projects", value: "47", change: "+8.5%", icon: Activity, color: "text-orange-600" },
          { label: "Department Performance", value: "94%", change: "+5.2%", icon: Target, color: "text-green-600" },
          { label: "Employee Satisfaction", value: "87%", change: "+3.1%", icon: Users, color: "text-blue-600" },
        ];
      case "cto":
        return [
          { label: "System Uptime", value: "99.9%", change: "+0.1%", icon: TrendingUp, color: "text-green-600" },
          { label: "Tech Team Size", value: "45", change: "+8.0%", icon: Users, color: "text-blue-600" },
          { label: "Active Projects", value: "23", change: "+15.0%", icon: Activity, color: "text-purple-600" },
          { label: "Infrastructure Cost", value: "$45K", change: "-5.2%", icon: DollarSign, color: "text-orange-600" },
          { label: "Code Quality Score", value: "92%", change: "+4.5%", icon: Target, color: "text-green-600" },
          { label: "Security Incidents", value: "0", change: "0%", icon: Activity, color: "text-blue-600" },
        ];
      case "cfo":
        return [
          { label: "Revenue", value: "$5.2M", change: "+18.5%", icon: DollarSign, color: "text-green-600" },
          { label: "Operating Costs", value: "$3.1M", change: "+8.2%", icon: DollarSign, color: "text-blue-600" },
          { label: "Cash Flow", value: "$890K", change: "+12.5%", icon: TrendingUp, color: "text-purple-600" },
          { label: "Budget Utilization", value: "78%", change: "+5.0%", icon: Activity, color: "text-orange-600" },
          { label: "Cost per Employee", value: "$85K", change: "+2.1%", icon: Users, color: "text-green-600" },
          { label: "ROI", value: "34%", change: "+6.8%", icon: Target, color: "text-blue-600" },
        ];
      case "hr_manager":
        return [
          { label: "Total Employees", value: "234", change: "+12.0%", icon: Users, color: "text-green-600" },
          { label: "Open Positions", value: "18", change: "+5.0%", icon: Activity, color: "text-blue-600" },
          { label: "Employee Turnover", value: "8.5%", change: "-2.1%", icon: TrendingUp, color: "text-purple-600" },
          { label: "Avg. Time to Hire", value: "28 days", change: "-5 days", icon: Activity, color: "text-orange-600" },
          { label: "Training Hours", value: "1,240", change: "+18.5%", icon: Users, color: "text-green-600" },
          { label: "Employee Satisfaction", value: "87%", change: "+3.1%", icon: Target, color: "text-blue-600" },
        ];
      case "hr_coordinator":
        return [
          { label: "Active Recruitments", value: "12", change: "+4.0%", icon: Activity, color: "text-green-600" },
          { label: "Interviews Scheduled", value: "45", change: "+22.5%", icon: Users, color: "text-blue-600" },
          { label: "Onboarding Tasks", value: "23", change: "+8.0%", icon: Activity, color: "text-purple-600" },
          { label: "Employee Records Updated", value: "156", change: "+12.5%", icon: TrendingUp, color: "text-orange-600" },
        ];
      case "engineering_manager":
        return [
          { label: "Team Size", value: "28", change: "+6.0%", icon: Users, color: "text-green-600" },
          { label: "Sprint Velocity", value: "85", change: "+12.5%", icon: TrendingUp, color: "text-blue-600" },
          { label: "Active Sprints", value: "4", change: "0%", icon: Activity, color: "text-purple-600" },
          { label: "Code Review Time", value: "4.2h", change: "-1.2h", icon: Activity, color: "text-orange-600" },
          { label: "Bug Resolution Rate", value: "94%", change: "+5.5%", icon: Target, color: "text-green-600" },
          { label: "Team Productivity", value: "92%", change: "+4.2%", icon: Users, color: "text-blue-600" },
        ];
      case "senior_developer":
        return [
          { label: "Code Commits", value: "245", change: "+28.5%", icon: Activity, color: "text-green-600" },
          { label: "Pull Requests", value: "56", change: "+18.2%", icon: TrendingUp, color: "text-blue-600" },
          { label: "Code Reviews Done", value: "89", change: "+22.3%", icon: Users, color: "text-purple-600" },
          { label: "Bugs Fixed", value: "124", change: "+15.5%", icon: Activity, color: "text-orange-600" },
          { label: "Lines of Code", value: "12.4K", change: "+18.2%", icon: Target, color: "text-green-600" },
          { label: "Mentoring Hours", value: "34", change: "+12.5%", icon: Users, color: "text-blue-600" },
        ];
      case "junior_developer":
        return [
          { label: "Code Commits", value: "156", change: "+22.5%", icon: Activity, color: "text-green-600" },
          { label: "Pull Requests", value: "34", change: "+15.2%", icon: TrendingUp, color: "text-blue-600" },
          { label: "Bugs Fixed", value: "67", change: "+18.3%", icon: Activity, color: "text-purple-600" },
          { label: "Code Reviews", value: "45", change: "+12.5%", icon: Users, color: "text-orange-600" },
          { label: "Learning Modules", value: "12", change: "+8.0%", icon: Target, color: "text-green-600" },
          { label: "Pair Programming", value: "28h", change: "+15.5%", icon: Users, color: "text-blue-600" },
        ];
      case "product_manager":
        return [
          { label: "Active Features", value: "34", change: "+12.0%", icon: Activity, color: "text-green-600" },
          { label: "User Feedback", value: "234", change: "+45.5%", icon: Users, color: "text-blue-600" },
          { label: "Feature Adoption", value: "78%", change: "+8.2%", icon: TrendingUp, color: "text-purple-600" },
          { label: "Sprint Goals Met", value: "92%", change: "+5.5%", icon: Activity, color: "text-orange-600" },
          { label: "Product Roadmap Items", value: "67", change: "+15.0%", icon: Target, color: "text-green-600" },
          { label: "Customer Satisfaction", value: "4.5/5", change: "+0.3", icon: Users, color: "text-blue-600" },
        ];
      case "sales_manager":
        return [
          { label: "Total Sales", value: "$1.2M", change: "+24.5%", icon: DollarSign, color: "text-green-600" },
          { label: "Team Quota Achievement", value: "108%", change: "+12.5%", icon: TrendingUp, color: "text-blue-600" },
          { label: "Active Deals", value: "45", change: "+18.0%", icon: Activity, color: "text-purple-600" },
          { label: "Team Size", value: "12", change: "+2.0%", icon: Users, color: "text-orange-600" },
          { label: "Avg Deal Size", value: "$45K", change: "+8.5%", icon: DollarSign, color: "text-green-600" },
          { label: "Win Rate", value: "34%", change: "+5.2%", icon: Target, color: "text-blue-600" },
        ];
      case "sales_representative":
        return [
          { label: "Personal Sales", value: "$340K", change: "+28.5%", icon: DollarSign, color: "text-green-600" },
          { label: "Quota Achievement", value: "112%", change: "+15.2%", icon: TrendingUp, color: "text-blue-600" },
          { label: "Active Leads", value: "67", change: "+22.0%", icon: Users, color: "text-purple-600" },
          { label: "Closed Deals", value: "23", change: "+18.5%", icon: Activity, color: "text-orange-600" },
          { label: "Avg Deal Size", value: "$42K", change: "+8.2%", icon: DollarSign, color: "text-green-600" },
          { label: "Pipeline Value", value: "$890K", change: "+34.5%", icon: Target, color: "text-blue-600" },
        ];
      case "marketing_manager":
        return [
          { label: "Campaign ROI", value: "340%", change: "+45.5%", icon: TrendingUp, color: "text-green-600" },
          { label: "Lead Generation", value: "1,234", change: "+28.2%", icon: Users, color: "text-blue-600" },
          { label: "Marketing Budget", value: "$120K", change: "+5.0%", icon: DollarSign, color: "text-purple-600" },
          { label: "Active Campaigns", value: "12", change: "+4.0%", icon: Activity, color: "text-orange-600" },
          { label: "Conversion Rate", value: "4.8%", change: "+1.2%", icon: Target, color: "text-green-600" },
          { label: "Brand Awareness", value: "78%", change: "+8.5%", icon: Users, color: "text-blue-600" },
        ];
      case "marketing_specialist":
        return [
          { label: "Content Created", value: "89", change: "+34.5%", icon: Activity, color: "text-green-600" },
          { label: "Social Engagement", value: "45.2K", change: "+28.5%", icon: Users, color: "text-blue-600" },
          { label: "Email Open Rate", value: "34.5%", change: "+5.2%", icon: TrendingUp, color: "text-purple-600" },
          { label: "Campaign Performance", value: "92%", change: "+8.5%", icon: Activity, color: "text-orange-600" },
          { label: "Lead Quality Score", value: "8.4/10", change: "+0.8", icon: Target, color: "text-green-600" },
          { label: "SEO Rankings", value: "Top 10: 67", change: "+12", icon: Users, color: "text-blue-600" },
        ];
      case "finance_manager":
        return [
          { label: "Budget Oversight", value: "$3.2M", change: "+8.5%", icon: DollarSign, color: "text-green-600" },
          { label: "Cost Savings", value: "$240K", change: "+18.5%", icon: TrendingUp, color: "text-blue-600" },
          { label: "Financial Reports", value: "34", change: "+12.0%", icon: Activity, color: "text-purple-600" },
          { label: "Audit Compliance", value: "100%", change: "0%", icon: Target, color: "text-orange-600" },
          { label: "Forecasting Accuracy", value: "94%", change: "+4.5%", icon: Activity, color: "text-green-600" },
          { label: "Department Budgets", value: "12", change: "0%", icon: Users, color: "text-blue-600" },
        ];
      case "accountant":
        return [
          { label: "Invoices Processed", value: "234", change: "+22.5%", icon: Activity, color: "text-green-600" },
          { label: "Expense Reports", value: "156", change: "+18.2%", icon: DollarSign, color: "text-blue-600" },
          { label: "Reconciliations", value: "89", change: "+12.5%", icon: TrendingUp, color: "text-purple-600" },
          { label: "Accuracy Rate", value: "99.8%", change: "+0.2%", icon: Activity, color: "text-orange-600" },
          { label: "Processing Time", value: "2.4 days", change: "-0.5 days", icon: Target, color: "text-green-600" },
          { label: "Outstanding Items", value: "12", change: "-8", icon: Users, color: "text-blue-600" },
        ];
      case "operations_manager":
        return [
          { label: "Process Efficiency", value: "92%", change: "+8.5%", icon: TrendingUp, color: "text-green-600" },
          { label: "Active Operations", value: "45", change: "+12.0%", icon: Activity, color: "text-blue-600" },
          { label: "Cost Reduction", value: "$180K", change: "+24.5%", icon: DollarSign, color: "text-purple-600" },
          { label: "Team Productivity", value: "94%", change: "+5.5%", icon: Users, color: "text-orange-600" },
          { label: "SLA Compliance", value: "98%", change: "+3.2%", icon: Target, color: "text-green-600" },
          { label: "Operational Issues", value: "8", change: "-12", icon: Activity, color: "text-blue-600" },
        ];
      case "support_manager":
        return [
          { label: "Tickets Resolved", value: "1,234", change: "+18.5%", icon: Activity, color: "text-green-600" },
          { label: "Avg Response Time", value: "2.4h", change: "-0.8h", icon: TrendingUp, color: "text-blue-600" },
          { label: "Customer Satisfaction", value: "94%", change: "+5.5%", icon: Users, color: "text-purple-600" },
          { label: "Team Size", value: "18", change: "+2.0%", icon: Users, color: "text-orange-600" },
          { label: "First Contact Resolution", value: "78%", change: "+8.2%", icon: Target, color: "text-green-600" },
          { label: "Escalation Rate", value: "12%", change: "-4.5%", icon: Activity, color: "text-blue-600" },
        ];
      case "support_agent":
        return [
          { label: "Tickets Handled", value: "156", change: "+22.5%", icon: Activity, color: "text-green-600" },
          { label: "Avg Response Time", value: "1.8h", change: "-0.5h", icon: TrendingUp, color: "text-blue-600" },
          { label: "Customer Rating", value: "4.8/5", change: "+0.3", icon: Users, color: "text-purple-600" },
          { label: "Resolution Rate", value: "92%", change: "+8.5%", icon: Target, color: "text-orange-600" },
          { label: "Follow-ups", value: "34", change: "+12.0%", icon: Activity, color: "text-green-600" },
          { label: "Knowledge Base Updates", value: "23", change: "+15.0%", icon: Users, color: "text-blue-600" },
        ];
      case "data_analyst":
        return [
          { label: "Reports Generated", value: "67", change: "+24.5%", icon: Activity, color: "text-green-600" },
          { label: "Data Insights", value: "145", change: "+34.5%", icon: TrendingUp, color: "text-blue-600" },
          { label: "Dashboards Active", value: "23", change: "+12.0%", icon: Activity, color: "text-purple-600" },
          { label: "Data Quality Score", value: "96%", change: "+4.5%", icon: Target, color: "text-orange-600" },
          { label: "Analysis Requests", value: "89", change: "+18.5%", icon: Users, color: "text-green-600" },
          { label: "Predictive Models", value: "12", change: "+5.0%", icon: Activity, color: "text-blue-600" },
        ];
      case "it_administrator":
        return [
          { label: "System Uptime", value: "99.95%", change: "+0.05%", icon: TrendingUp, color: "text-green-600" },
          { label: "Support Tickets", value: "234", change: "+18.5%", icon: Activity, color: "text-blue-600" },
          { label: "Avg Resolution Time", value: "3.2h", change: "-0.8h", icon: TrendingUp, color: "text-purple-600" },
          { label: "Active Users", value: "234", change: "+12.0%", icon: Users, color: "text-orange-600" },
          { label: "Security Patches", value: "45", change: "+22.0%", icon: Activity, color: "text-green-600" },
          { label: "Infrastructure Health", value: "98%", change: "+3.5%", icon: Target, color: "text-blue-600" },
        ];
      default:
        return [
          { label: "Total Revenue", value: "$1.2M", change: "+12.5%", icon: DollarSign, color: "text-green-600" },
          { label: "Active Users", value: "2,345", change: "+5.2%", icon: Users, color: "text-blue-600" },
          { label: "Conversion Rate", value: "3.24%", change: "+0.8%", icon: TrendingUp, color: "text-purple-600" },
          { label: "Tasks Completed", value: "89", change: "+15.3%", icon: Activity, color: "text-orange-600" },
        ];
    }
  };

  const metrics = getAnalyticsForRole(role);

  const getRoleWelcome = (role: string | null) => {
    const roleNames: Record<string, string> = {
      ceo: "Executive Overview",
      cto: "Technology Leadership Dashboard",
      cfo: "Financial Analytics Dashboard",
      hr_manager: "HR Management Dashboard",
      hr_coordinator: "HR Coordination Center",
      engineering_manager: "Engineering Team Dashboard",
      senior_developer: "Senior Developer Dashboard",
      junior_developer: "Developer Dashboard",
      product_manager: "Product Management Hub",
      sales_manager: "Sales Leadership Dashboard",
      sales_representative: "Sales Performance Dashboard",
      marketing_manager: "Marketing Strategy Dashboard",
      marketing_specialist: "Marketing Analytics Dashboard",
      finance_manager: "Finance Management Dashboard",
      accountant: "Accounting Dashboard",
      operations_manager: "Operations Dashboard",
      support_manager: "Support Management Dashboard",
      support_agent: "Support Agent Dashboard",
      data_analyst: "Data Analytics Dashboard",
      it_administrator: "IT Administration Dashboard",
    };
    return role ? roleNames[role] || "Your Dashboard" : "Your Dashboard";
  };

  return (
    <div className="space-y-6">
      <div className="animate-slide-up">
        <h2 className="text-3xl fredoka-bold text-foreground">
          {role && getRoleWelcome(role)}
        </h2>
        <p className="fredoka-regular text-muted-foreground mt-2">
          Welcome back, {userEmail}
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 bg-muted/50">
          <TabsTrigger value="overview" className="fredoka-medium">Overview</TabsTrigger>
          <TabsTrigger value="analytics" className="fredoka-medium">Analytics</TabsTrigger>
          {(role === 'ceo' || role === 'cto') && (
            <>
              <TabsTrigger value="companies" className="fredoka-medium">Companies</TabsTrigger>
              <TabsTrigger value="integrations" className="fredoka-medium">Integrations</TabsTrigger>
              <TabsTrigger value="workflows" className="fredoka-medium">Workflows</TabsTrigger>
              <TabsTrigger value="ai" className="fredoka-medium">AI</TabsTrigger>
              <TabsTrigger value="admin" className="fredoka-medium">Admin</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-4 animate-fade-in">
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
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RealtimeMetricsChart
              metricType="revenue"
              title="Revenue Stream"
              description="Real-time revenue metrics"
              chartType="area"
            />
            <RealtimeMetricsChart
              metricType="users"
              title="User Growth"
              description="Active users in real-time"
              chartType="line"
            />
            <RealtimeMetricsChart
              metricType="performance"
              title="System Performance"
              description="Performance metrics"
              chartType="line"
            />
            <RealtimeMetricsChart
              metricType="engagement"
              title="User Engagement"
              description="Engagement metrics"
              chartType="area"
            />
          </div>
        </TabsContent>

        {(role === 'ceo' || role === 'cto') && (
          <>
            <TabsContent value="companies">
              <CompanyManagement role={role} />
            </TabsContent>

            <TabsContent value="integrations">
              <APIIntegrationManager role={role} />
            </TabsContent>

            <TabsContent value="workflows">
              <WorkflowAutomation />
            </TabsContent>

            <TabsContent value="ai">
              <EmbeddingsManager role={role} />
            </TabsContent>

            <TabsContent value="admin">
              <AdminPanel />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default DashboardContent;
