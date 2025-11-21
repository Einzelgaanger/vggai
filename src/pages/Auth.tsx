import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DEMO_USERS } from "@/lib/seed-demo-users";
import { Building2, User, ArrowRight, Shield } from "lucide-react";
import vggLogo from "@/assets/vgg-logo.jpeg";
import { Badge } from "@/components/ui/badge";

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

  const getRoleColor = (role: string) => {
    if (['ceo', 'cto', 'cfo'].includes(role)) {
      return 'bg-primary/10 text-primary border-primary/20';
    }
    if (role.includes('manager')) {
      return 'bg-accent/10 text-accent border-accent/20';
    }
    if (role.includes('developer') || role.includes('engineer')) {
      return 'bg-primary/10 text-primary border-primary/20';
    }
    if (role.includes('hr')) {
      return 'bg-success/10 text-success border-success/20';
    }
    if (role.includes('sales')) {
      return 'bg-accent/10 text-accent border-accent/20';
    }
    if (role.includes('marketing')) {
      return 'bg-success/10 text-success border-success/20';
    }
    return 'bg-muted text-muted-foreground border-border';
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <Card className="shadow-lg border">
          <CardHeader className="space-y-4 pb-6 pt-8">
            <div className="flex items-center justify-center mb-2">
              <div className="bg-primary/10 p-4 rounded-2xl border border-primary/20">
                <img 
                  src={vggLogo} 
                  alt="VGG Logo" 
                  className="h-14 w-14 object-contain rounded-xl"
                />
              </div>
            </div>
            <div className="text-center space-y-2">
              <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
                VGG Holdings Portal
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Enterprise dashboard for multi-company management
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="px-8 pb-8">
            {/* Info Banner */}
            <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold text-foreground">
                  Access to Child Companies
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                  <span className="w-2 h-2 bg-success rounded-full mr-1.5 animate-pulse" />
                  Seamless HR (Live)
                </Badge>
                <Badge variant="outline">
                  <span className="w-2 h-2 bg-primary rounded-full mr-1.5" />
                  Kleva HR
                </Badge>
                <Badge variant="outline">
                  <span className="w-2 h-2 bg-primary rounded-full mr-1.5" />
                  WorkflowHR
                </Badge>
                <Badge variant="outline">
                  <span className="w-2 h-2 bg-accent rounded-full mr-1.5" />
                  PayStackHR
                </Badge>
                <Badge variant="outline">
                  <span className="w-2 h-2 bg-accent rounded-full mr-1.5" />
                  TalentHub
                </Badge>
                <Badge variant="outline">
                  <span className="w-2 h-2 bg-success rounded-full mr-1.5" />
                  PeopleCore
                </Badge>
              </div>
            </div>

            {/* Role Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-2">
              {filteredUsers.map((user, index) => (
                <Card 
                  key={user.email}
                  className="group cursor-pointer border hover:border-primary hover:shadow-md transition-all duration-300"
                  onClick={() => handleRoleSelect(user)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={`${getRoleColor(user.role)} p-3 rounded-xl border`}>
                        <User className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base mb-1 truncate text-foreground">
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
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {user.accessibleCompanies.map((company) => (
                              <span 
                                key={company}
                                className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-md border border-primary/20"
                              >
                                {company}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="mt-3 flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                          <span>Access Dashboard</span>
                          <ArrowRight className="h-3 w-3" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8 text-center">
              <p className="text-xs text-muted-foreground">
                Demo environment • Select any role to access the dashboard
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
