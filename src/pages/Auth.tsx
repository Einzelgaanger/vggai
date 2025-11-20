import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DEMO_USERS } from "@/lib/seed-demo-users";
import { Building2, User } from "lucide-react";
import vggLogo from "@/assets/vgg-logo.jpeg";

interface MockUser {
  email: string;
  fullName: string;
  role: string;
  company: string;
  accessibleCompanies?: string[];
}

const Auth = () => {
  const navigate = useNavigate();
  const [selectedCompany, setSelectedCompany] = useState<string>("");

  useEffect(() => {
    // Check if already "logged in"
    const mockUser = localStorage.getItem('mockUser');
    if (mockUser) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleRoleSelect = (user: MockUser) => {
    // Store mock user in localStorage
    localStorage.setItem('mockUser', JSON.stringify({
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      company: user.company,
      accessibleCompanies: user.accessibleCompanies || [],
      id: `mock-${user.role}-${user.company}` // Generate a mock ID
    }));
    
    navigate("/dashboard");
  };

  // All users work for VGG Holdings
  const companies = ['VGG Holdings'];
  const filteredUsers = DEMO_USERS;

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-5xl shadow-xl border-0">
        <CardHeader className="space-y-4 pb-8">
          <div className="flex items-center justify-center mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
              <img 
                src={vggLogo} 
                alt="VGG Logo" 
                className="h-20 w-20 object-contain rounded-2xl relative z-10 shadow-lg"
              />
            </div>
          </div>
          <CardTitle className="text-3xl text-center font-bold tracking-tight">
            VGG Holdings Portal
          </CardTitle>
          <CardDescription className="text-center text-base px-4">
            Select your role to access child company data
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <div className="mb-8 p-4 bg-primary/5 rounded-xl border border-primary/10">
            <p className="text-sm text-foreground/80 text-center">
              <span className="font-semibold text-primary">VGG Holdings</span> employees • Access to child companies:
              <span className="block mt-3 flex items-center justify-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-success/10 text-success rounded-full text-xs font-medium">
                  <span className="w-2 h-2 bg-success rounded-full"></span>
                  Seamless HR (Live)
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary/10 text-secondary rounded-full text-xs font-medium">
                  <span className="w-2 h-2 bg-secondary rounded-full"></span>
                  Kleva HR (Mock)
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary/10 text-secondary rounded-full text-xs font-medium">
                  <span className="w-2 h-2 bg-secondary rounded-full"></span>
                  WorkflowHR (Mock)
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary/10 text-secondary rounded-full text-xs font-medium">
                  <span className="w-2 h-2 bg-secondary rounded-full"></span>
                  PayStackHR (Mock)
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary/10 text-secondary rounded-full text-xs font-medium">
                  <span className="w-2 h-2 bg-secondary rounded-full"></span>
                  TalentHub (Mock)
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary/10 text-secondary rounded-full text-xs font-medium">
                  <span className="w-2 h-2 bg-secondary rounded-full"></span>
                  PeopleCore (Mock)
                </span>
              </span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[55vh] overflow-y-auto pr-2">
            {filteredUsers.map((user, index) => (
              <Card 
                key={user.email}
                className="group cursor-pointer hover-lift border transition-all duration-300 hover:border-primary/50 hover:bg-primary/5"
                onClick={() => handleRoleSelect(user)}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="bg-gradient-to-br from-primary to-accent p-3 rounded-xl group-hover:scale-110 transition-transform">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base mb-1 truncate">
                        {user.fullName}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {user.role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5" />
                        <span>{user.company}</span>
                      </div>
                      {user.accessibleCompanies && user.accessibleCompanies.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {user.accessibleCompanies.map((company) => (
                            <span 
                              key={company}
                              className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-md"
                            >
                              {company}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Demo environment • Select any role to access the dashboard
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
