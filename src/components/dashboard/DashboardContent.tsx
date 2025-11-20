import { useState } from "react";
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
import CEOOverview from "./overview/CEOOverview";
import CEOAnalytics from "./analytics/CEOAnalytics";

interface DashboardContentProps {
  role: string | null;
  userEmail: string;
  fullName: string;
  accessibleCompanies: string[];
}

const DashboardContent = ({ role, userEmail, fullName, accessibleCompanies }: DashboardContentProps) => {
  const [selectedChildCompany, setSelectedChildCompany] = useState<string>(
    accessibleCompanies[0] || 'Seamless HR'
  );
  // All metrics are now fetched from APIs via APIDataMetrics component
  // No hardcoded data - everything comes from real API endpoints

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
        <h2 className="text-3xl font-bold text-foreground tracking-tight">
          {role && getRoleWelcome(role)}
        </h2>
        <p className="text-muted-foreground mt-2">
          Welcome back, {fullName} • VGG Holdings
        </p>
      </div>

      {/* Child Company Selector */}
      <ChildCompanySelector 
        selectedCompany={selectedChildCompany}
        onCompanyChange={setSelectedChildCompany}
        accessibleCompanies={accessibleCompanies}
      />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 bg-muted/50 p-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="ai">AI Assistant</TabsTrigger>
          {(role === 'ceo' || role === 'cto') && (
            <>
              <TabsTrigger value="companies">Child Companies</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
              <TabsTrigger value="workflows">Workflows</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-4 animate-fade-in">
          {role === 'ceo' ? (
            <CEOOverview childCompany={selectedChildCompany} />
          ) : (
            <APIDataMetrics role={role} userEmail={userEmail} childCompany={selectedChildCompany} />
          )}
        </TabsContent>

        <TabsContent value="ai" className="space-y-4 animate-fade-in">
          <AIAssistant role={role} userEmail={userEmail} selectedCompanyId={selectedChildCompany} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4 animate-fade-in">
          {role === 'ceo' ? (
            <CEOAnalytics childCompany={selectedChildCompany} />
          ) : (
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
          )}
        </TabsContent>

        {(role === 'ceo' || role === 'cto') && (
          <>
            <TabsContent value="companies">
              <CompanyManagement role={role} />
            </TabsContent>

            <TabsContent value="integrations" className="space-y-4">
              <APIIntegrationManager role={role} />
              <APICredentialManager />
              <RoleAPIAccessManager role={role} />
            </TabsContent>

            <TabsContent value="workflows">
              <WorkflowAutomation />
            </TabsContent>

            <TabsContent value="ai">
              <EmbeddingsManager role={role} />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default DashboardContent;
