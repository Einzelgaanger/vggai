import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InteractiveChart } from "./InteractiveChart";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Info, Loader2 } from "lucide-react";
import { getSeamlessHREmployees, getSeamlessHRAttendanceRecords } from "@/lib/seamlesshr-service";
import { supabase } from "@/integrations/supabase/client";

interface GroupAnalyticsTabProps {
  role: string | null;
  filters: {
    dateRange: { start: string; end: string } | null;
    entity: string | null;
  };
  dataScope: 'org-wide' | 'entity' | 'personal';
}

export function GroupAnalyticsTab({
  role,
  filters,
  dataScope,
}: GroupAnalyticsTabProps) {
  const [loading, setLoading] = useState(true);
  const [companyComparison, setCompanyComparison] = useState<{ label: string; value: number }[]>([]);
  const [attritionComparison, setAttritionComparison] = useState<{ label: string; value: number }[]>([]);
  const [departmentComparison, setDepartmentComparison] = useState<{ label: string; value: number }[]>([]);

  // Business leaders cannot compare metrics with other companies
  const canCompareCompanies = dataScope === 'org-wide';

  useEffect(() => {
    if (canCompareCompanies) {
      loadGroupData();
    } else {
      loadDepartmentComparison();
    }
  }, [canCompareCompanies, filters]);

  const loadGroupData = async () => {
    setLoading(true);
    try {
      // Fetch all companies
      const { data: companies } = await supabase
        .from('companies')
        .select('name, id')
        .eq('is_active', true);

      if (!companies || companies.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch employees for each company
      const companyData: { label: string; value: number }[] = [];
      const attritionData: { label: string; value: number }[] = [];

      for (const company of companies) {
        try {
          const employees = await getSeamlessHREmployees({
            company: company.name,
            status: 'active',
            limit: 1000,
          });

          companyData.push({
            label: company.name,
            value: employees.length,
          });

          // Get attrition for this company
          try {
            const attendance = await getSeamlessHRAttendanceRecords({
              dateType: 'month',
              perPage: 50,
            });

            if (attendance?.data && attendance.data.length > 0) {
              const absentCount = attendance.data.filter((a: any) => 
                a.punctualityStatus === 'ABSENT'
              ).length;
              const attritionRate = (absentCount / attendance.data.length) * 100;
              attritionData.push({
                label: company.name,
                value: attritionRate,
              });
            }
          } catch (attError) {
            console.warn(`Could not fetch attendance for ${company.name}:`, attError);
            attritionData.push({
              label: company.name,
              value: 0,
            });
          }
        } catch (empError) {
          console.warn(`Could not fetch employees for ${company.name}:`, empError);
        }
      }

      setCompanyComparison(companyData);
      setAttritionComparison(attritionData);

      // Load department comparison
      await loadDepartmentComparison();
    } catch (error) {
      console.error('Error loading group data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDepartmentComparison = async () => {
    try {
      // Fetch all employees to get department distribution
      const employees = await getSeamlessHREmployees({
        status: 'active',
        limit: 1000,
      });

      const deptMap = new Map<string, number>();
      employees.forEach((emp: any) => {
        const dept = emp.department || emp.departmentName || 'Unknown';
        deptMap.set(dept, (deptMap.get(dept) || 0) + 1);
      });

      const deptDist = Array.from(deptMap.entries())
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);

      setDepartmentComparison(deptDist);
    } catch (error) {
      console.error('Error loading department comparison:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!canCompareCompanies) {
    return (
      <div className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Company comparison is only available for organization-wide views. 
            You can compare metrics across departments within your subsidiary.
          </AlertDescription>
        </Alert>

        {/* Department Comparison (available for all) */}
        <Card>
          <CardHeader>
            <CardTitle>Department Comparison</CardTitle>
            <CardDescription>Workforce distribution across departments</CardDescription>
          </CardHeader>
          <CardContent>
            {departmentComparison.length > 0 ? (
              <InteractiveChart
                type="bar"
                data={{
                  labels: departmentComparison.map(d => d.label),
                  datasets: [{
                    label: 'Employees',
                    data: departmentComparison.map(d => d.value),
                  }],
                }}
                aiInsight={`${departmentComparison[0]?.label || 'Top department'} has ${departmentComparison[0]?.value || 0} employees, representing the largest department.`}
              />
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No department data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Group Analytics</h2>
        <p className="text-muted-foreground">
          Compare workforce metrics across companies and departments
        </p>
      </div>

      {/* Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Company Comparison</CardTitle>
            <CardDescription>Workforce size across subsidiaries</CardDescription>
          </CardHeader>
          <CardContent>
            {companyComparison.length > 0 ? (
              <InteractiveChart
                type="bar"
                data={{
                  labels: companyComparison.map(c => c.label),
                  datasets: [{
                    label: 'Workforce',
                    data: companyComparison.map(c => c.value),
                  }],
                }}
                aiInsight={`${companyComparison[0]?.label || 'Top company'} leads with ${companyComparison[0]?.value || 0} employees.`}
              />
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No company data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attrition Comparison</CardTitle>
            <CardDescription>Monthly attrition rates by company</CardDescription>
          </CardHeader>
          <CardContent>
            {attritionComparison.length > 0 ? (
              <InteractiveChart
                type="bar"
                data={{
                  labels: attritionComparison.map(a => a.label),
                  datasets: [{
                    label: 'Attrition %',
                    data: attritionComparison.map(a => a.value),
                  }],
                }}
                aiInsight={`${attritionComparison.reduce((min, a) => a.value < min.value ? a : min, attritionComparison[0])?.label || 'Company'} shows lowest attrition.`}
              />
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No attrition data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Department Comparison (available for all) */}
      <Card>
        <CardHeader>
          <CardTitle>Department Comparison</CardTitle>
          <CardDescription>Workforce distribution across departments</CardDescription>
        </CardHeader>
        <CardContent>
          {departmentComparison.length > 0 ? (
            <InteractiveChart
              type="bar"
              data={{
                labels: departmentComparison.map(d => d.label),
                datasets: [{
                  label: 'Employees',
                  data: departmentComparison.map(d => d.value),
                }],
              }}
              aiInsight={`${departmentComparison[0]?.label || 'Top department'} and ${departmentComparison[1]?.label || 'second department'} represent the largest departments.`}
            />
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              No department data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

