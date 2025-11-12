import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import DashboardNav from "@/components/dashboard/DashboardNav";
import DashboardContent from "@/components/dashboard/DashboardContent";
import AIAssistant from "@/components/dashboard/AIAssistant";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<"dashboard" | "ai">("dashboard");
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      // Get user role using the new structure
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('roles (name)')
        .eq('user_id', session.user.id)
        .limit(1)
        .single();

      if (roleData && (roleData as any).roles) {
        setUserRole((roleData as any).roles.name);
      }

      setLoading(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
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
        role={userRole} 
        onSignOut={handleSignOut}
        activeView={activeView}
        onViewChange={setActiveView}
        userEmail={user?.email || ""}
      />
      <main className="container mx-auto p-6 max-w-7xl">
        {activeView === "dashboard" ? (
          <DashboardContent role={userRole} userEmail={user?.email || ""} />
        ) : (
          <AIAssistant role={userRole} userEmail={user?.email || ""} />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
