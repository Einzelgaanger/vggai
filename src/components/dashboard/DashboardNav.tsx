import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, MessageSquare } from "lucide-react";

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
    <header className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
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
        
        <div className="flex-1 flex justify-center">
          <div className="inline-flex rounded-lg border bg-muted p-1">
            <Button
              variant={activeView === "dashboard" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onViewChange("dashboard")}
              className="gap-2 rounded-md"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
            <Button
              variant={activeView === "ai" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onViewChange("ai")}
              className="gap-2 rounded-md"
            >
              <MessageSquare className="h-4 w-4" />
              AI Assistant
            </Button>
          </div>
        </div>
        
        <Button variant="ghost" onClick={onSignOut} className="gap-2 h-9">
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </Button>
      </div>
    </header>
  );
};

export default DashboardNav;
