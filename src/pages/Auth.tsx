import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DEMO_USERS } from "@/lib/seed-demo-users";
import { Building2, User } from "lucide-react";

interface MockUser {
  email: string;
  fullName: string;
  role: string;
  company: string;
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
      id: `mock-${user.role}-${user.company}` // Generate a mock ID
    }));
    
    navigate("/dashboard");
  };

  // Group users by company
  const companies = [...new Set(DEMO_USERS.map(u => u.company))];
  const filteredUsers = selectedCompany 
    ? DEMO_USERS.filter(u => u.company === selectedCompany)
    : DEMO_USERS;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/lovable-uploads/b5ced8c0-5733-4c8c-8bdb-b84a20c6e5cd.png" 
              alt="VGG Logo" 
              className="h-16 w-16 object-contain"
            />
          </div>
          <CardTitle className="text-2xl text-center">
            Demo Login
          </CardTitle>
          <CardDescription className="text-center">
            Select a role to demo the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Company Filter */}
          <div className="mb-6">
            <Label className="mb-2 block">Filter by Company</Label>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedCompany === "" ? "default" : "outline"}
                onClick={() => setSelectedCompany("")}
                size="sm"
              >
                All Companies
              </Button>
              {companies.map((company) => (
                <Button
                  key={company}
                  variant={selectedCompany === company ? "default" : "outline"}
                  onClick={() => setSelectedCompany(company)}
                  size="sm"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  {company}
                </Button>
              ))}
            </div>
          </div>

          {/* User Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto">
            {filteredUsers.map((user) => (
              <Card 
                key={user.email}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleRoleSelect(user)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">
                        {user.fullName}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-1">
                        {user.role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {user.company}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-4 text-center text-xs text-muted-foreground">
            <p>This is a demo environment. Click any role to access the dashboard.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
