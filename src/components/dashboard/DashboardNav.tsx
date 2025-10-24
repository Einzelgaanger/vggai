import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface DashboardNavProps {
  role: string | null;
  onSignOut: () => void;
}

const DashboardNav = ({ onSignOut }: DashboardNavProps) => {
  return (
    <header className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex h-16 items-center gap-4 px-6">
        <SidebarTrigger className="-ml-2" />
        <div className="flex-1" />
        <Button variant="ghost" onClick={onSignOut} className="gap-2 h-9">
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </Button>
      </div>
    </header>
  );
};

export default DashboardNav;
