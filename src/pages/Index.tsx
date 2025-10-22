import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BarChart3, Shield, Zap } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <nav className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-white font-bold">CD</span>
            </div>
            <span className="font-bold text-xl">Corporate Dashboard</span>
          </div>
          <Button onClick={() => navigate("/auth")} variant="outline">
            Sign In
          </Button>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Role-Based Analytics Platform
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100">
            Secure, intelligent dashboards tailored to your role. Access the insights you need with AI-powered assistance.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
            <Button onClick={() => navigate("/auth")} size="lg" className="gap-2 text-lg px-8">
              Get Started <ArrowRight className="h-5 w-5" />
            </Button>
            <Button onClick={() => navigate("/auth")} variant="outline" size="lg" className="text-lg px-8">
              View Demo
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-20">
            {[
              {
                icon: Shield,
                title: "Role-Based Access",
                description: "Secure permissions ensure users only see what they're authorized to access",
              },
              {
                icon: BarChart3,
                title: "Real-Time Analytics",
                description: "Live dashboards with metrics tailored to your department and role",
              },
              {
                icon: Zap,
                title: "AI Assistant",
                description: "Query your data naturally with an AI that respects your permissions",
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="p-6 rounded-xl bg-card shadow-soft hover:shadow-medium transition-all animate-in fade-in slide-in-from-bottom-4 duration-1000"
                  style={{ animationDelay: `${300 + index * 100}ms` }}
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4 mx-auto">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
