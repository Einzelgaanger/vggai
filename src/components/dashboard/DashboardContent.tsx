import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChildCompanySelector } from "./ChildCompanySelector";
import EmbeddingsManager from "./EmbeddingsManager";
import RealtimeMetricsChart from "./RealtimeMetricsChart";
import CompanyManagement from "./CompanyManagement";
import APIIntegrationManager from "./APIIntegrationManager";
import { APICredentialManager } from "./APICredentialManager";
import RoleAPIAccessManager from "./RoleAPIAccessManager";
import WorkflowAutomation from "./WorkflowAutomation";
import APIDataMetrics from "./APIDataMetrics";
import AIAssistant from "./AIAssistant";
import { WebsiteScraper } from "./WebsiteScraper";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, BarChart3, Brain, Building2, Plug, GitBranch } from "lucide-react";
import CEOOverview from "./overview/CEOOverview";
import CEOAnalytics from "./analytics/CEOAnalytics";

interface DashboardContentProps {
  role: string | null;
  userEmail: string;
  fullName: string;
  accessibleCompanies: string[];
}

const DashboardContent = ({ role, userEmail, fullName, accessibleCompanies }: DashboardContentProps) => {
  // Session persistence for last selected company
  const [selectedChildCompany, setSelectedChildCompany] = useState<string>(() => {
    const lastViewed = sessionStorage.getItem('lastViewedCompany');
    return lastViewed && accessibleCompanies.includes(lastViewed) 
      ? lastViewed 
      : accessibleCompanies[0] || 'Seamless HR';
  });

  // Remember last viewed company during session
  useEffect(() => {
    sessionStorage.setItem('lastViewedCompany', selectedChildCompany);
  }, [selectedChildCompany]);

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

  const getRoleIcon = (role: string | null) => {
    if (!role) return TrendingUp;
    if (['ceo', 'cto', 'cfo'].includes(role)) return TrendingUp;
    if (role.includes('manager')) return BarChart3;
    if (role.includes('developer') || role.includes('engineer')) return Brain;
    return BarChart3;
  };

  const RoleIcon = getRoleIcon(role);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="animate-slide-up">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <RoleIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">
                  {role && getRoleWelcome(role)}
                </h1>
                <p className="text-muted-foreground mt-1">
                  Welcome back, <span className="font-medium text-foreground">{fullName}</span>
                </p>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            VGG Holdings
          </Badge>
        </div>
      </div>

      {/* Child Company Selector */}
      <ChildCompanySelector 
        selectedCompany={selectedChildCompany}
        onCompanyChange={setSelectedChildCompany}
        accessibleCompanies={accessibleCompanies}
      />

      {/* Main Tabs - Aligned with User Journey */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 bg-muted/50 p-1.5 h-auto gap-1">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger 
            value="company-analytics"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Company Analytics</span>
          </TabsTrigger>
          {(role === 'ceo' || role === 'cto') && (
            <>
              <TabsTrigger 
                value="group-analytics"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2"
              >
                <Building2 className="w-4 h-4" />
                <span className="hidden sm:inline">Group Analytics</span>
              </TabsTrigger>
              <TabsTrigger 
                value="group-performance"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Group Performance</span>
              </TabsTrigger>
              <TabsTrigger 
                value="integrations"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2"
              >
                <Plug className="w-4 h-4" />
                <span className="hidden sm:inline">Integrations</span>
              </TabsTrigger>
              <TabsTrigger 
                value="workflows"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2"
              >
                <GitBranch className="w-4 h-4" />
                <span className="hidden sm:inline">Workflows</span>
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <div className="mt-6">
          {/* Overview Tab - Group-wide metrics */}
          <TabsContent value="overview" className="space-y-6 animate-fade-in mt-0">
            <CEOOverview childCompany={selectedChildCompany} />
          </TabsContent>

          {/* Company Analytics Tab - Deep-dive into specific subsidiary */}
          <TabsContent value="company-analytics" className="space-y-6 animate-fade-in mt-0">
            <CEOAnalytics childCompany={selectedChildCompany} />
          </TabsContent>

          {(role === 'ceo' || role === 'cto') && (
            <>
              {/* Group Analytics Tab - Cross-company analytics */}
              <TabsContent value="group-analytics" className="space-y-6 animate-fade-in mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <RealtimeMetricsChart
                    metricType="revenue"
                    title="Group Revenue Stream"
                    description="Real-time revenue across all entities"
                    chartType="area"
                  />
                  <RealtimeMetricsChart
                    metricType="users"
                    title="Group Workforce Growth"
                    description="Employee count across group"
                    chartType="line"
                  />
                  <RealtimeMetricsChart
                    metricType="performance"
                    title="Group Performance"
                    description="Consolidated performance metrics"
                    chartType="line"
                  />
                  <RealtimeMetricsChart
                    metricType="engagement"
                    title="Group Engagement"
                    description="Engagement metrics across entities"
                    chartType="area"
                  />
                </div>
              </TabsContent>

              {/* Group Performance Tab - Performance comparisons */}
              <TabsContent value="group-performance" className="space-y-6 animate-fade-in mt-0">
                <CompanyManagement role={role} />
              </TabsContent>

              <TabsContent value="integrations" className="space-y-6 animate-fade-in mt-0">
                <APIIntegrationManager role={role} />
                <APICredentialManager />
                <RoleAPIAccessManager role={role} />
                <WebsiteScraper />
              </TabsContent>

              <TabsContent value="workflows" className="space-y-6 animate-fade-in mt-0">
                <WorkflowAutomation />
              </TabsContent>
            </>
          )}
        </div>
      </Tabs>
    </div>
  );
};

export default DashboardContent;
