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
    <header className="sticky top-0 z-20 border-b bg-card backdrop-blur supports-[backdrop-filter]:bg-card/95">
      <div className="flex h-16 items-center gap-4 px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">CD</span>
          </div>
          <div>
            <h2 className="text-sm font-semibold">Corporate Dashboard</h2>
            {role && (
              <p className="text-xs text-muted-foreground">
                {getRoleDisplay(role)} • {userEmail}
              </p>
            )}
          </div>
        </div>
        
        <nav className="flex-1 flex justify-center gap-2">
          <button
            onClick={() => onViewChange("dashboard")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeView === "dashboard"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="text-sm font-medium">Dashboard</span>
          </button>
          <button
            onClick={() => onViewChange("ai")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeView === "ai"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">AI Assistant</span>
          </button>
        </nav>
        
        <Button variant="ghost" onClick={onSignOut} className="gap-2 h-9">
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </Button>
      </div>
    </header>
  );
};

export default DashboardNav;
