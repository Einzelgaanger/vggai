import { Button } from "@/components/ui/button";
import { LogOut, Menu } from "lucide-react";

interface DashboardNavProps {
  role: string | null;
  onSignOut: () => void;
}

const DashboardNav = ({ role, onSignOut }: DashboardNavProps) => {
  const getRoleDisplay = (role: string) => {
    return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <nav className="border-b bg-card shadow-soft">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-lg">CD</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">Corporate Dashboard</h1>
                {role && (
                  <p className="text-sm text-muted-foreground">
                    {getRoleDisplay(role)}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
            <Button variant="outline" onClick={onSignOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNav;
