import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Mail } from "lucide-react";
import { toast } from "sonner";

// Hardcoded admin credentials
const ADMIN_EMAIL = "admin@vgg.com";
const ADMIN_PASSWORD = "VGGAdmin2024!";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simple hardcoded authentication
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      localStorage.setItem("admin_authenticated", "true");
      toast.success("Admin login successful");
      navigate("/admin/dashboard");
    } else {
      toast.error("Invalid admin credentials");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-primary flex items-center justify-center shadow-elegant">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl fredoka-bold text-foreground">Admin Portal</h1>
          <p className="text-muted-foreground fredoka-regular">
            Data Administrator Access Only
          </p>
        </div>

        <Card className="shadow-elegant border-border animate-slide-up animation-delay-200">
          <CardHeader>
            <CardTitle className="fredoka-semibold">Sign In</CardTitle>
            <CardDescription className="fredoka-regular">
              Enter your admin credentials to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm fredoka-medium text-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="admin@vgg.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 fredoka-regular"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm fredoka-medium text-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 fredoka-regular"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full fredoka-semibold"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button
            variant="link"
            onClick={() => navigate("/")}
            className="fredoka-regular text-muted-foreground"
          >
            ← Back to main site
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;