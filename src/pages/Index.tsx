import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BarChart3, Shield, Zap } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-soft">
              <span className="text-primary-foreground fredoka-bold text-base">CD</span>
            </div>
            <span className="fredoka-semibold text-xl text-foreground">Corporate Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => navigate("/admin")} variant="ghost" size="sm" className="fredoka-regular text-xs">
              Admin
            </Button>
            <Button onClick={() => navigate("/auth")} variant="outline" className="fredoka-medium">
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="py-16 md:py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl fredoka-bold text-foreground animate-fade-in">
              Role-Based Analytics Platform
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto fredoka-regular animate-slide-up">
              Secure, intelligent dashboards tailored to your role. Access the insights you need with AI-powered assistance.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Button onClick={() => navigate("/auth")} size="lg" className="gap-2 fredoka-semibold shadow-medium hover:shadow-strong transition-all">
                Get Started <ArrowRight className="w-5 h-5" />
              </Button>
              <Button onClick={() => navigate("/auth")} variant="outline" size="lg" className="fredoka-medium">
                View Demo
              </Button>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  className="bg-card border border-border rounded-lg p-6 shadow-soft hover:shadow-medium transition-all animate-slide-up"
                  style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="fredoka-semibold text-xl text-card-foreground mb-2">{feature.title}</h3>
                  <p className="fredoka-regular text-sm text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
