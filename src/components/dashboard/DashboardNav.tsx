import { Button } from "@/components/ui/button";
import { LogOut, LayoutGrid, Sparkles } from "lucide-react";

interface DashboardNavProps {
  role: string | null;
  onSignOut: () => void;
  activeView: "dashboard" | "ai";
  onViewChange: (view: "dashboard" | "ai") => void;
  userEmail: string;
}

const DashboardNav = ({ onSignOut, activeView, onViewChange, role, userEmail }: DashboardNavProps) => {
  const getRoleDisplay = (role: string) => {
    return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <header className="sticky top-0 z-20 border-b bg-card/95 backdrop-blur-md shadow-soft">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg">VGG</span>
          </div>
          <div className="hidden md:block">
            <h2 className="font-semibold text-sm text-foreground">VGG Holdings</h2>
            {role && (
              <p className="text-xs text-muted-foreground">
                {getRoleDisplay(role)} • {userEmail}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex-1"></div>
        
        <Button 
          variant="outline" 
          onClick={onSignOut} 
          className="gap-2 h-10 border-2 hover:border-primary/50 hover:bg-primary/5 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </Button>
      </div>
    </header>
  );
};

export default DashboardNav;
