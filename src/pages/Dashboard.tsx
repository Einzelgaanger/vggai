import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import DashboardNav from "@/components/dashboard/DashboardNav";
import DashboardContent from "@/components/dashboard/DashboardContent";
import AIAssistant from "@/components/dashboard/AIAssistant";

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
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
      <main className="container mx-auto p-6 max-w-7xl">
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
