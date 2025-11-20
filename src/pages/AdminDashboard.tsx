import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LogOut, Shield } from "lucide-react";
import { AdminPanel } from "@/components/dashboard/AdminPanel";
import { DemoUserManager } from "@/components/admin/DemoUserManager";

interface MockUser {
  email: string;
  fullName: string;
  role: string;
  company: string;
  id: string;
}

const AdminDashboard = () => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkMockUser = () => {
      const mockUserStr = localStorage.getItem('mockUser');
      
      if (!mockUserStr) {
        toast.error("Please login to access admin dashboard");
        navigate("/auth");
        return;
      }

      try {
        const mockUser = JSON.parse(mockUserStr) as MockUser;
        
        // Only allow CEO and CTO access
        if (!['ceo', 'cto'].includes(mockUser.role)) {
          toast.error("Access denied. Admin privileges required.");
          navigate("/dashboard");
          return;
        }
        
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg fredoka-regular text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b bg-card/80 backdrop-blur-sm shadow-soft">
        <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-soft">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="fredoka-semibold text-sm text-foreground">Admin Portal</h2>
              <p className="fredoka-regular text-xs text-muted-foreground">
                {user?.fullName} ({user?.role.toUpperCase()})
              </p>
            </div>
          </div>
          
          <div className="flex-1" />
          
          <Button variant="ghost" onClick={handleSignOut} className="gap-2 h-9 fredoka-medium">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-6 max-w-7xl space-y-6">
        <DemoUserManager />
        <AdminPanel />
      </main>
    </div>
  );
};

export default AdminDashboard;