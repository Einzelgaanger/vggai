import { Button } from "@/components/ui/button";
import { LogOut, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import vggLogo from "@/assets/vgg-logo.jpeg";

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

  const getRoleBadgeColor = (role: string) => {
    if (['ceo', 'cto', 'cfo'].includes(role)) {
      return 'bg-primary/10 text-primary border-primary/20';
    }
    if (role.includes('manager')) {
      return 'bg-accent/10 text-accent border-accent/20';
    }
    return 'bg-secondary/10 text-secondary border-secondary/20';
  };

  return (
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
            <div className="hidden md:block">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-base text-foreground">VGG Holdings</h2>
                {role && (
                  <Badge 
                    variant="outline" 
                    className={`text-xs font-medium ${getRoleBadgeColor(role)}`}
                  >
                    {getRoleDisplay(role)}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[200px]">
                {userEmail}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm"
              className="hidden sm:flex relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
            </Button>
            <Button 
              variant="outline" 
              onClick={onSignOut} 
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
  );
};

export default DashboardNav;
