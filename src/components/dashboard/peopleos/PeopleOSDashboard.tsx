import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, BarChart3, Users, Building2, Download, Filter, Info } from "lucide-react";
import { OverviewTab } from "./OverviewTab";
import { CompanyAnalyticsTab } from "./CompanyAnalyticsTab";
import { GroupAnalyticsTab } from "./GroupAnalyticsTab";
import { GroupPerformanceTab } from "./GroupPerformanceTab";
import { FilterPanel } from "./FilterPanel";
import { ExportDialog } from "./ExportDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PeopleOSDashboardProps {
  role: string | null;
  userEmail: string;
  fullName: string;
}

export function PeopleOSDashboard({ role, userEmail, fullName }: PeopleOSDashboardProps) {
  const [selectedCompany, setSelectedCompany] = useState<string>("ManCo");
  const [companies, setCompanies] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    dateRange: null as { start: string; end: string } | null,
    entity: null as string | null,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Load last viewed company from session storage
  useEffect(() => {
    const lastCompany = sessionStorage.getItem('lastViewedCompany');
    if (lastCompany) {
      setSelectedCompany(lastCompany);
    }
  }, []);

  // Save selected company to session storage
  useEffect(() => {
    if (selectedCompany) {
      sessionStorage.setItem('lastViewedCompany', selectedCompany);
    }
  }, [selectedCompany]);

  // Fetch accessible companies based on role
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        // For Exec roles: all companies
        // For HR: associated entity companies
        // For Employee: their company only
        if (role === 'ceo' || role === 'cfo' || role === 'cto') {
          const { data } = await supabase
            .from('companies')
            .select('name')
            .eq('is_active', true)
            .order('name');
          
          if (data) {
            const companyNames = data.map(c => c.name);
            setCompanies(companyNames);
            if (!selectedCompany && companyNames.length > 0) {
              setSelectedCompany(companyNames[0]);
            }
          }
        } else if (role?.includes('hr')) {
          // HR sees their associated entities
          try {
            const { data } = await supabase
              .from('companies')
              .select('name')
              .eq('is_active', true)
              .order('name')
              .limit(5); // Limit for HR roles
            
            if (data) {
              const companyNames = data.map(c => c.name);
              setCompanies(companyNames);
              if (!selectedCompany && companyNames.length > 0) {
                setSelectedCompany(companyNames[0]);
              }
            }
          } catch (error) {
            console.error('Error fetching HR companies:', error);
            setCompanies(['ManCo']);
          }
        } else {
          // Employee sees only their company
          setCompanies(['ManCo']);
          setSelectedCompany('ManCo');
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
        // Fallback to default
        setCompanies(['ManCo']);
      }
    };

    fetchCompanies();
  }, [role, userEmail]);

  // Determine data scope based on role
  const getDataScope = () => {
    if (role === 'ceo' || role === 'cfo' || role === 'cto') {
      return 'org-wide';
    } else if (role?.includes('hr')) {
      return 'entity';
    } else {
      return 'personal';
    }
  };

  const handleCompanyChange = (company: string) => {
    setSelectedCompany(company);
    // If on overview, switch to company analytics when company is selected
    if (activeTab === 'overview') {
      setActiveTab('company-analytics');
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // If clicking on a company in overview, switch to company analytics
    if (value === 'company-analytics' && selectedCompany) {
      // Already handled
    }
  };

  const dataScope = getDataScope();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            People Information System
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, <span className="font-medium text-foreground">{fullName}</span>
            {dataScope === 'org-wide' && (
              <Badge variant="outline" className="ml-2">Organization-wide View</Badge>
            )}
            {dataScope === 'entity' && (
              <Badge variant="outline" className="ml-2">Entity View</Badge>
            )}
            {dataScope === 'personal' && (
              <Badge variant="outline" className="ml-2">Personal View</Badge>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExport(true)}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Company Selector */}
      {companies.length > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Company:</label>
              <Select value={selectedCompany} onValueChange={handleCompanyChange}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company} value={company}>
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCompany === 'ManCo' && (
                <Badge variant="outline" className="bg-primary/10">
                  Default
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <FilterPanel
          filters={filters}
          onFiltersChange={setFilters}
          onClose={() => setShowFilters(false)}
          dataScope={dataScope}
        />
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1.5 h-auto gap-1">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger 
            value="company-analytics"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2"
          >
            <Building2 className="w-4 h-4" />
            <span>Company Analytics</span>
          </TabsTrigger>
          <TabsTrigger 
            value="group-analytics"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Group Analytics</span>
          </TabsTrigger>
          <TabsTrigger 
            value="group-performance"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2"
          >
            <Users className="w-4 h-4" />
            <span>Group Performance</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="overview" className="space-y-6 animate-fade-in mt-0">
            <OverviewTab
              role={role}
              selectedCompany={selectedCompany}
              filters={filters}
              dataScope={dataScope}
              onCompanyClick={handleCompanyChange}
            />
          </TabsContent>

          <TabsContent value="company-analytics" className="space-y-6 animate-fade-in mt-0">
            <CompanyAnalyticsTab
              role={role}
              selectedCompany={selectedCompany}
              filters={filters}
              dataScope={dataScope}
            />
          </TabsContent>

          <TabsContent value="group-analytics" className="space-y-6 animate-fade-in mt-0">
            <GroupAnalyticsTab
              role={role}
              filters={filters}
              dataScope={dataScope}
            />
          </TabsContent>

          <TabsContent value="group-performance" className="space-y-6 animate-fade-in mt-0">
            <GroupPerformanceTab
              role={role}
              filters={filters}
              dataScope={dataScope}
            />
          </TabsContent>
        </div>
      </Tabs>

      {/* Export Dialog */}
      <ExportDialog
        open={showExport}
        onOpenChange={setShowExport}
        activeTab={activeTab}
        selectedCompany={selectedCompany}
      />
    </div>
  );
}

