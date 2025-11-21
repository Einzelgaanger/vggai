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
      return 'from-purple-600 to-indigo-600';
    }
    if (role.includes('manager')) {
      return 'from-blue-600 to-cyan-600';
    }
    if (role.includes('developer') || role.includes('engineer')) {
      return 'from-indigo-600 to-purple-600';
    }
    if (role.includes('hr')) {
      return 'from-pink-600 to-rose-600';
    }
    if (role.includes('sales')) {
      return 'from-orange-600 to-amber-600';
    }
    if (role.includes('marketing')) {
      return 'from-emerald-600 to-teal-600';
    }
    return 'from-slate-600 to-slate-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-blue-950 dark:via-indigo-950 dark:to-purple-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Colorful background pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.05]" />
      
      {/* Colorful decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-400/15 rounded-full blur-3xl" />

      <div className="w-full max-w-6xl relative z-10">
        <Card className="shadow-2xl border-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
          <CardHeader className="space-y-4 pb-6 pt-6">
            <div className="flex items-center justify-center mb-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-indigo-500/30 blur-2xl rounded-full animate-pulse" />
                <div className="relative bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-100 dark:from-blue-900/50 dark:via-purple-900/50 dark:to-indigo-900/50 p-3 rounded-2xl shadow-lg border-2 border-blue-200/50 dark:border-blue-700/50">
                  <img 
                    src={vggLogo} 
                    alt="VGG Logo" 
                    className="h-14 w-14 object-contain rounded-xl"
                  />
                </div>
              </div>
            </div>
            <div className="text-center space-y-2">
              <CardTitle className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                VGG Holdings Portal
              </CardTitle>
              <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
                Enterprise dashboard for multi-company management
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="px-8 pb-8">
            {/* Info Banner */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-100 via-purple-100 to-indigo-100 dark:from-blue-900/40 dark:via-purple-900/40 dark:to-indigo-900/40 rounded-xl border-2 border-blue-200/50 dark:border-blue-700/30">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                  Access to Child Companies
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-700 font-medium">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-1.5 animate-pulse" />
                  Seamless HR (Live)
                </Badge>
                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-700">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-1.5" />
                  Kleva HR
                </Badge>
                <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-700">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-1.5" />
                  WorkflowHR
                </Badge>
                <Badge variant="outline" className="bg-indigo-100 text-indigo-700 border-indigo-300 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-700">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full mr-1.5" />
                  PayStackHR
                </Badge>
                <Badge variant="outline" className="bg-pink-100 text-pink-700 border-pink-300 dark:bg-pink-950/40 dark:text-pink-400 dark:border-pink-700">
                  <span className="w-2 h-2 bg-pink-500 rounded-full mr-1.5" />
                  TalentHub
                </Badge>
                <Badge variant="outline" className="bg-cyan-100 text-cyan-700 border-cyan-300 dark:bg-cyan-950/40 dark:text-cyan-400 dark:border-cyan-700">
                  <span className="w-2 h-2 bg-cyan-500 rounded-full mr-1.5" />
                  PeopleCore
                </Badge>
              </div>
            </div>

            {/* Role Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
              {filteredUsers.map((user, index) => (
                <Card 
                  key={user.email}
                  className="group cursor-pointer border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  onClick={() => handleRoleSelect(user)}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={`bg-gradient-to-br ${getRoleColor(user.role)} p-3 rounded-xl group-hover:scale-110 transition-transform shadow-lg ring-2 ring-white/50`}>
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base mb-1 truncate text-slate-900 dark:text-slate-100">
                          {user.fullName}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                          {user.role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-500">
                          <Building2 className="h-3.5 w-3.5" />
                          <span>{user.company}</span>
                        </div>
                        {user.accessibleCompanies && user.accessibleCompanies.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {user.accessibleCompanies.map((company) => (
                              <span 
                                key={company}
                                className="text-[10px] px-2 py-0.5 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 rounded-md border border-blue-200 dark:border-blue-800"
                              >
                                {company}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="mt-3 flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
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
              <p className="text-xs text-slate-500 dark:text-slate-500">
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
