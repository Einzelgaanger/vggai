import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Shield } from "lucide-react";
import { AdminPanel } from "@/components/dashboard/AdminPanel";
import { toast } from "sonner";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is authenticated
    const isAuthenticated = localStorage.getItem("admin_authenticated");
    if (!isAuthenticated) {
      toast.error("Please login to access admin dashboard");
      navigate("/admin");
    } else {
      setLoading(false);
    }
  }, [navigate]);

  const handleSignOut = () => {
    localStorage.removeItem("admin_authenticated");
    toast.success("Signed out successfully");
    navigate("/admin");
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
                Data Administrator
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

      <main className="container mx-auto p-6 max-w-7xl">
        <AdminPanel />
      </main>
    </div>
  );
};

export default AdminDashboard;