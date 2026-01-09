import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { getSeamlessHREmployees } from "@/lib/seamlesshr-service";
import { getCompanyMockData } from "@/lib/enhanced-mock-data";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import DataAvailabilityAlert from "../DataAvailabilityAlert";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface CEOAnalyticsProps {
  childCompany: string;
}

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'];

const CEOAnalytics = ({ childCompany }: CEOAnalyticsProps) => {
  const [loading, setLoading] = useState(true);
  const [departmentData, setDepartmentData] = useState<any[]>([]);
  const [branchData, setBranchData] = useState<any[]>([]);
  const [genderData, setGenderData] = useState<any[]>([]);
  const [tenureData, setTenureData] = useState<any[]>([]);
  const [dataAvailable, setDataAvailable] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [childCompany]);

  const loadAnalytics = async () => {
    setLoading(true);
    setDataAvailable(true);
    try {
      if (childCompany === "Seamless HR") {
        const employees = await getSeamlessHREmployees();

        // Department distribution
        const deptCount: Record<string, number> = {};
        employees.forEach(emp => {
          const dept = emp.department || 'Unknown';
          deptCount[dept] = (deptCount[dept] || 0) + 1;
        });
        const deptData = Object.entries(deptCount).map(([name, value]) => ({ name, value }));
        setDepartmentData(deptData);

        // Branch distribution
        const branchCount: Record<string, number> = {};
        employees.forEach(emp => {
          const branch = emp.branch || 'Unknown';
          branchCount[branch] = (branchCount[branch] || 0) + 1;
        });
        const brData = Object.entries(branchCount).map(([name, value]) => ({ name, value }));
        setBranchData(brData);

        // Gender distribution
        const genderCount: Record<string, number> = { Male: 0, Female: 0, Other: 0 };
        employees.forEach(emp => {
          const gender = emp.sex?.toLowerCase();
          if (gender === 'male') genderCount.Male++;
          else if (gender === 'female') genderCount.Female++;
          else genderCount.Other++;
        });
        const genData = Object.entries(genderCount)
          .filter(([_, value]) => value > 0)
          .map(([name, value]) => ({ name, value }));
        setGenderData(genData);

        // Tenure distribution
        const tenureBuckets: Record<string, number> = {
          '0-2 years': 0,
          '3-5 years': 0,
          '6-10 years': 0,
          '11+ years': 0
        };
        employees.forEach(emp => {
          const tenureMatch = emp.tenure_on_grade?.match(/(\d+)\s*years/);
          if (tenureMatch) {
            const years = parseInt(tenureMatch[1]);
            if (years <= 2) tenureBuckets['0-2 years']++;
            else if (years <= 5) tenureBuckets['3-5 years']++;
            else if (years <= 10) tenureBuckets['6-10 years']++;
            else tenureBuckets['11+ years']++;
          }
        });
        const tenData = Object.entries(tenureBuckets).map(([name, value]) => ({ name, value }));
        setTenureData(tenData);

      } else {
        // Use enhanced mock data for other companies
        const mockData = getCompanyMockData(childCompany);
        
        if (mockData) {
          setDepartmentData(
            mockData.analytics.departmentData.map(d => ({ name: d.name, value: d.count }))
          );
          setBranchData(mockData.analytics.branchData);
          setGenderData(mockData.analytics.genderData);
          setTenureData(
            mockData.analytics.tenureData.map(t => ({ name: t.range, value: t.count }))
          );
        } else {
          // Fallback generic mock data
          setDepartmentData([
            { name: 'Engineering', value: 45 },
            { name: 'Sales', value: 32 },
            { name: 'Marketing', value: 28 },
            { name: 'HR', value: 15 },
            { name: 'Finance', value: 18 },
          ]);
          setBranchData([
            { name: 'Lagos', value: 120 },
            { name: 'Abuja', value: 80 },
            { name: 'Port Harcourt', value: 45 },
          ]);
          setGenderData([
            { name: 'Male', value: 145 },
            { name: 'Female', value: 100 },
          ]);
          setTenureData([
            { name: '0-2 years', value: 85 },
            { name: '3-5 years', value: 95 },
            { name: '6-10 years', value: 50 },
            { name: '11+ years', value: 15 },
          ]);
        }
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
      setDataAvailable(false);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const exportChartData = () => {
    try {
      const data = {
        company: childCompany,
        department: departmentData,
        branch: branchData,
        gender: genderData,
        tenure: tenureData
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_${childCompany.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Analytics data exported successfully');
    } catch (error) {
      toast.error('Failed to export analytics');
    }
  };

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-64 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!dataAvailable && (
        <DataAvailabilityAlert 
          message={`Analytics data is not available for ${childCompany}. Please check your data sources or try a different company.`}
          onRetry={loadAnalytics}
        />
      )}
      
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={exportChartData}>
          <Download className="w-4 h-4 mr-2" />
          Export Analytics
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Department Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Workforce by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Branch Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Workforce by Location</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={branchData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {branchData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Gender Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Gender Diversity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {genderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Tenure Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Employee Tenure Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={tenureData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

export default CEOAnalytics;
