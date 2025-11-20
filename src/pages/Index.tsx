import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  ArrowRight, 
  BarChart3, 
  Shield, 
  Zap, 
  Building2, 
  Users, 
  Lock, 
  TrendingUp,
  CheckCircle2,
  Database,
  Brain,
  Globe
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import vggLogo from "@/assets/vgg-logo.jpeg";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Role-based access control with granular permissions ensuring data security at every level",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20"
    },
    {
      icon: BarChart3,
      title: "Real-Time Analytics",
      description: "Live dashboards with comprehensive metrics tailored to your department and responsibilities",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/20"
    },
    {
      icon: Brain,
      title: "AI-Powered Insights",
      description: "Intelligent assistant that understands your role and provides contextual, permission-aware insights",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20"
    },
    {
      icon: Building2,
      title: "Multi-Company Management",
      description: "Seamlessly manage and monitor multiple child companies from a unified parent dashboard",
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/20"
    },
    {
      icon: Database,
      title: "API Integration",
      description: "Connect with external systems and automate data synchronization across your organization",
      color: "text-cyan-600",
      bgColor: "bg-cyan-50 dark:bg-cyan-950/20"
    },
    {
      icon: Lock,
      title: "Compliance Ready",
      description: "Built with enterprise compliance standards in mind, ensuring data governance and audit trails",
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950/20"
    },
  ];

  const stats = [
    { value: "99.9%", label: "Uptime" },
    { value: "256-bit", label: "Encryption" },
    { value: "24/7", label: "Support" },
    { value: "ISO 27001", label: "Certified" },
  ];

  const benefits = [
    "Centralized data management across all subsidiaries",
    "Role-based access with granular permission controls",
    "Real-time analytics and reporting dashboards",
    "AI-powered insights and recommendations",
    "Seamless API integrations with existing systems",
    "Enterprise-grade security and compliance"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/10 blur-md rounded-lg"></div>
                <img 
                  src={vggLogo} 
                  alt="VGG Logo" 
                  className="h-10 w-10 object-contain rounded-lg relative z-10 shadow-md"
                />
              </div>
              <div>
                <span className="font-semibold text-lg text-foreground">VGG Holdings</span>
                <p className="text-xs text-muted-foreground hidden sm:block">Enterprise Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => navigate("/admin")} 
                variant="ghost" 
                size="sm"
                className="hidden sm:flex"
              >
                Admin Portal
              </Button>
              <Button 
                onClick={() => navigate("/auth")} 
                size="sm"
                className="gap-2"
              >
                Sign In
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 lg:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Globe className="w-4 h-4" />
              <span>Enterprise-Grade Platform</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Unified Dashboard for
              <span className="block mt-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Multi-Company Management
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Streamline operations, monitor performance, and gain actionable insights across all your subsidiaries with our comprehensive enterprise platform powered by AI.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                onClick={() => navigate("/auth")} 
                size="lg" 
                className="gap-2 text-base px-8 h-12 shadow-lg hover:shadow-xl transition-all"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button 
                onClick={() => navigate("/auth")} 
                variant="outline" 
                size="lg"
                className="text-base px-8 h-12 border-2"
              >
                Schedule Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 mt-12 border-t">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-24 bg-muted/30">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Enterprise Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage and monitor your organization effectively
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index}
                  className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg group"
                >
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <h3 className="font-semibold text-xl text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:py-24">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Why Choose VGG Holdings Portal?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Our platform is designed to give you complete visibility and control over your multi-company operations, with enterprise-grade security and AI-powered insights.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-foreground">{benefit}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Button 
                  onClick={() => navigate("/auth")} 
                  size="lg"
                  className="gap-2"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 border-2 border-primary/20">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">Real-Time Monitoring</div>
                      <div className="text-sm text-muted-foreground">Live updates across all companies</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                      <Users className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">Team Collaboration</div>
                      <div className="text-sm text-muted-foreground">Role-based access and permissions</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">AI-Powered Analytics</div>
                      <div className="text-sm text-muted-foreground">Intelligent insights and recommendations</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-24 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Transform Your Operations?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join leading enterprises using VGG Holdings Portal to streamline their multi-company management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate("/auth")} 
              size="lg"
              className="gap-2 px-8 h-12 text-base"
            >
              Get Started Now
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button 
              onClick={() => navigate("/admin")} 
              variant="outline" 
              size="lg"
              className="px-8 h-12 text-base border-2"
            >
              Admin Access
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-12">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/10 blur-md rounded-lg"></div>
                <img 
                  src={vggLogo} 
                  alt="VGG Logo" 
                  className="h-8 w-8 object-contain rounded-lg relative z-10"
                />
              </div>
              <span className="font-semibold text-foreground">VGG Holdings</span>
            </div>
            <p className="text-sm text-muted-foreground text-center md:text-right">
              © {new Date().getFullYear()} VGG Holdings. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
