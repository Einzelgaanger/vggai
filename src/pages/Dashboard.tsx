import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import DashboardNav from "@/components/dashboard/DashboardNav";
import DashboardContent from "@/components/dashboard/DashboardContent";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface MockUser {
  email: string;
  fullName: string;
  role: string;
  company: string;
  id: string;
  accessibleCompanies?: string[];
}

const Dashboard = () => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkMockUser = () => {
      const mockUserStr = localStorage.getItem('mockUser');
      
      if (!mockUserStr) {
        navigate("/auth");
        return;
      }

      try {
        const mockUser = JSON.parse(mockUserStr) as MockUser;
        setUser(mockUser);
      } catch (error) {
        navigate("/auth");
      } finally {
        setLoading(false);
      }
    };

    checkMockUser();
  }, [navigate]);

  const handleSignOut = () => {
    localStorage.removeItem('mockUser');
    toast.success("Signed out successfully");
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-background/95 backdrop-blur-md">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </div>
        <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-5 w-96" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-24 mb-4" />
                    <Skeleton className="h-8 w-32 mb-2" />
                    <Skeleton className="h-4 w-20" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav 
        role={user?.role || null} 
        onSignOut={handleSignOut}
        activeView="dashboard"
        onViewChange={() => {}}
        userEmail={user?.email || ""}
      />
      <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <DashboardContent
          role={user?.role || null} 
          userEmail={user?.email || ""} 
          fullName={user?.fullName || ""}
          accessibleCompanies={user?.accessibleCompanies || ['Seamless HR']}
        />
      </main>
    </div>
  );
};

export default Dashboard;
