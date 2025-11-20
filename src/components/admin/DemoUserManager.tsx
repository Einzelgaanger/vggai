import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Users, Trash2, Plus, Download, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DEMO_USERS, seedDemoUsers, getDemoCredentials } from "@/lib/seed-demo-users";
import { supabase } from "@/integrations/supabase/client";

export function DemoUserManager() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [results, setResults] = useState<{
    success: string[];
    errors: { email: string; error: string }[];
  } | null>(null);
  const { toast } = useToast();

  const handleSeedUsers = async () => {
    if (!confirm("This will create new demo users. Continue?")) {
      return;
    }

    setIsSeeding(true);
    setResults(null);

    try {
      const seedResults = await seedDemoUsers();
      setResults(seedResults);

      if (seedResults.success.length > 0) {
        toast({
          title: "Success",
          description: `Created ${seedResults.success.length} demo users`,
        });
      }

      if (seedResults.errors.length > 0) {
        toast({
          title: "Warning",
          description: `${seedResults.errors.length} users failed to create`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to seed users",
        variant: "destructive",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleDeleteTestUsers = async () => {
    if (!confirm("⚠️ WARNING: This will delete ALL test users with @vgg.demo or @techcorp.demo emails. This action cannot be undone. Continue?")) {
      return;
    }

    setIsDeleting(true);
    
    try {
      // Get all profiles with demo emails
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email')
        .or('email.like.%@vgg.demo,email.like.%@techcorp.demo');

      if (!profiles || profiles.length === 0) {
        toast({
          title: "Info",
          description: "No test users found to delete",
        });
        setIsDeleting(false);
        return;
      }

      // Note: Due to CASCADE delete, deleting from profiles will NOT delete auth users
      // We need to use Supabase Admin API to delete auth users
      // For now, just inform the user to manually delete via Supabase dashboard
      
      let deletedCount = 0;
      const errors: string[] = [];

      for (const profile of profiles) {
        // Delete user_company_access
        await supabase
          .from('user_company_access')
          .delete()
          .eq('user_id', profile.id);

        // Delete user_roles
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', profile.id);

        // Delete profile
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', profile.id);

        if (error) {
          errors.push(profile.email);
        } else {
          deletedCount++;
        }
      }

      toast({
        title: "Partial Success",
        description: `Deleted ${deletedCount} user profiles. Auth users must be deleted from the backend.`,
      });

      setResults({
        success: [`Deleted ${deletedCount} user profiles`],
        errors: errors.map(email => ({ email, error: "Auth user still exists" }))
      });

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete users",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const downloadCredentials = () => {
    const credentials = getDemoCredentials();
    const content = `# VGG AI Demo User Credentials\n\nGenerated: ${new Date().toISOString()}\n\n` +
      credentials.map(c => 
        `## ${c.name} (${c.role})\n` +
        `- Email: ${c.email}\n` +
        `- Password: ${c.password}\n` +
        `- Company: ${c.company}\n`
      ).join('\n');

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'demo-credentials.md';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded",
      description: "Credentials saved to demo-credentials.md",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Demo User Management</CardTitle>
              <CardDescription>Create and manage demo users for testing</CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={downloadCredentials}
              disabled={isSeeding || isDeleting}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Credentials
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteTestUsers}
              disabled={isSeeding || isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? "Deleting..." : "Delete Test Users"}
            </Button>
            <Button
              onClick={handleSeedUsers}
              disabled={isSeeding || isDeleting}
            >
              <Plus className="h-4 w-4 mr-2" />
              {isSeeding ? "Creating..." : "Create Demo Users"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Demo users will be created with @vgg.demo and @techcorp.demo emails. 
            Make sure email confirmation is disabled in auth settings for easier testing.
          </AlertDescription>
        </Alert>

        <div>
          <h3 className="font-semibold mb-2">Demo Users to Create ({DEMO_USERS.length})</h3>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Company</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {DEMO_USERS.map((user) => (
                  <TableRow key={user.email}>
                    <TableCell className="font-medium">{user.fullName}</TableCell>
                    <TableCell className="font-mono text-sm">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{user.role}</Badge>
                    </TableCell>
                    <TableCell>{user.company}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {results && (
          <div className="space-y-2">
            {results.success.length > 0 && (
              <Alert>
                <AlertDescription>
                  <strong>✓ Success:</strong> {results.success.length} users created
                </AlertDescription>
              </Alert>
            )}
            {results.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertDescription>
                  <strong>✗ Errors:</strong>
                  <ul className="list-disc list-inside mt-2">
                    {results.errors.map((err, i) => (
                      <li key={i} className="text-sm">
                        {err.email}: {err.error}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          <p className="font-semibold mb-2">Password Format:</p>
          <p className="font-mono">Demo2024![ROLE]</p>
          <p className="mt-2">Example: ceo@vgg.demo / Demo2024!CEO</p>
        </div>
      </CardContent>
    </Card>
  );
}
