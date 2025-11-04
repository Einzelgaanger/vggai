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
    <header className="sticky top-0 z-20 border-b bg-card/80 backdrop-blur-sm shadow-soft">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-soft">
            <span className="text-primary-foreground fredoka-bold text-base">CD</span>
          </div>
          <div className="hidden md:block">
            <h2 className="fredoka-semibold text-sm text-foreground">Corporate Dashboard</h2>
            {role && (
              <p className="fredoka-regular text-xs text-muted-foreground">
                {getRoleDisplay(role)} • {userEmail}
              </p>
            )}
          </div>
        </div>
        
        <nav className="flex-1 flex justify-center gap-2">
          <button
            onClick={() => onViewChange("dashboard")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all fredoka-medium text-sm ${
              activeView === "dashboard"
                ? "bg-primary text-primary-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
          <button
            onClick={() => onViewChange("ai")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all fredoka-medium text-sm ${
              activeView === "ai"
                ? "bg-primary text-primary-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">AI Assistant</span>
          </button>
        </nav>
        
        <Button variant="ghost" onClick={onSignOut} className="gap-2 h-9 fredoka-medium">
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </Button>
      </div>
    </header>
  );
};

export default DashboardNav;
