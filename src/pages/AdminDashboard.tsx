import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LogOut, Shield } from "lucide-react";
import { AdminPanel } from "@/components/dashboard/AdminPanel";
import { DemoUserManager } from "@/components/admin/DemoUserManager";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import vggLogo from "@/assets/vgg-logo.jpeg";

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
          <Skeleton className="h-96 w-full" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-md shadow-sm">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/10 blur-md rounded-lg"></div>
                <img 
                  src={vggLogo} 
                  alt="VGG Logo" 
                  className="h-10 w-10 object-contain rounded-lg relative z-10 shadow-md"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-base text-foreground">Admin Portal</h2>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
                    {user?.role.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {user?.fullName}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                onClick={handleSignOut} 
                size="sm"
                className="gap-2 border-2 hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 rounded-xl border-2 border-primary/10 p-6 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/10 blur-md rounded-lg"></div>
                <img 
                  src={vggLogo} 
                  alt="VGG Logo" 
                  className="h-8 w-8 object-contain rounded-lg relative z-10"
                />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Administration Center</h1>
            </div>
            <p className="text-muted-foreground">
              Manage users, roles, permissions, and system configurations
            </p>
          </div>

          <DemoUserManager />
          <AdminPanel />
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
