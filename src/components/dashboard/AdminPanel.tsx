import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Shield, User, Database, RefreshCw } from "lucide-react";

interface UserData {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

interface APIPermission {
  id: string;
  role: string;
  api_endpoint: string;
  can_read: boolean;
  can_write: boolean;
}

const AVAILABLE_ROLES = [
  'ceo', 'cto', 'cfo', 'hr_manager', 'hr_coordinator', 
  'engineering_manager', 'senior_developer', 'junior_developer',
  'product_manager', 'sales_manager', 'sales_representative',
  'marketing_manager', 'marketing_specialist', 'finance_manager',
  'accountant', 'operations_manager', 'support_manager',
  'support_agent', 'data_analyst', 'it_administrator'
];

const API_ENDPOINTS = [
  '/companies',
  '/api-integrations',
  '/metrics',
  '/workflows',
  '/departments',
  '/profiles',
  '/resource-permissions'
];

export function AdminPanel() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [permissions, setPermissions] = useState<APIPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all users with their roles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name');

      if (profilesError) throw profilesError;

      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combine users with their roles
      const usersWithRoles = profilesData?.map(profile => ({
        ...profile,
        role: rolesData?.find(r => r.user_id === profile.id)?.role || 'No role'
      })) || [];

      setUsers(usersWithRoles);

      // Fetch all API permissions
      const { data: permissionsData, error: permissionsError } = await supabase
        .from('api_permissions')
        .select('*');

      if (permissionsError) throw permissionsError;

      setPermissions(permissionsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      // Delete existing role
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Insert new role
      const { error } = await supabase
        .from('user_roles')
        .insert([{ user_id: userId, role: newRole as any }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User role updated successfully"
      });

      fetchData();
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive"
      });
    }
  };

  const togglePermission = async (role: string, endpoint: string, permissionType: 'can_read' | 'can_write', currentValue: boolean) => {
    try {
      const existing = permissions.find(p => p.role === role && p.api_endpoint === endpoint);

      if (existing) {
        const { error } = await supabase
          .from('api_permissions')
          .update({ [permissionType]: !currentValue })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('api_permissions')
          .insert([{
            role: role as any,
            api_endpoint: endpoint,
            [permissionType]: true,
            [permissionType === 'can_read' ? 'can_write' : 'can_read']: false
          }]);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Permission updated successfully"
      });

      fetchData();
    } catch (error) {
      console.error('Error updating permission:', error);
      toast({
        title: "Error",
        description: "Failed to update permission",
        variant: "destructive"
      });
    }
  };

  const getRolePermissions = (role: string) => {
    return permissions.filter(p => p.role === role);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-primary" />
        <div>
          <h2 className="text-3xl fredoka-bold text-foreground">Admin Panel</h2>
          <p className="text-muted-foreground fredoka-regular">Manage users, roles, and API access</p>
        </div>
      </div>

      {/* Users and Roles Section */}
      <Card className="animate-slide-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 fredoka-semibold">
            <User className="w-5 h-5" />
            Users & Roles
          </CardTitle>
          <CardDescription className="fredoka-regular">View and manage user roles</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="fredoka-medium">User</TableHead>
                <TableHead className="fredoka-medium">Email</TableHead>
                <TableHead className="fredoka-medium">Current Role</TableHead>
                <TableHead className="fredoka-medium">Change Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="fredoka-regular">{user.full_name}</TableCell>
                  <TableCell className="fredoka-regular text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="fredoka-medium">
                      {user.role.replace(/_/g, ' ').toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(value) => updateUserRole(user.id, value)}
                    >
                      <SelectTrigger className="w-[200px] fredoka-regular">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_ROLES.map((role) => (
                          <SelectItem key={role} value={role} className="fredoka-regular">
                            {role.replace(/_/g, ' ').toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* API Permissions Section */}
      <Card className="animate-slide-up animation-delay-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 fredoka-semibold">
            <Database className="w-5 h-5" />
            API Access Permissions
          </CardTitle>
          <CardDescription className="fredoka-regular">
            Configure which API endpoints each role can access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm fredoka-medium text-foreground mb-2 block">Select Role to Configure</label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full max-w-md fredoka-regular">
                <SelectValue placeholder="Choose a role..." />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_ROLES.map((role) => (
                  <SelectItem key={role} value={role} className="fredoka-regular">
                    {role.replace(/_/g, ' ').toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedRole && (
            <div className="mt-6">
              <h4 className="text-lg fredoka-semibold mb-4 text-foreground">
                Permissions for {selectedRole.replace(/_/g, ' ').toUpperCase()}
              </h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="fredoka-medium">API Endpoint</TableHead>
                    <TableHead className="fredoka-medium text-center">Read Access</TableHead>
                    <TableHead className="fredoka-medium text-center">Write Access</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {API_ENDPOINTS.map((endpoint) => {
                    const permission = getRolePermissions(selectedRole).find(
                      p => p.api_endpoint === endpoint
                    );
                    return (
                      <TableRow key={endpoint}>
                        <TableCell className="fredoka-medium">{endpoint}</TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={permission?.can_read || false}
                            onCheckedChange={() =>
                              togglePermission(selectedRole, endpoint, 'can_read', permission?.can_read || false)
                            }
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={permission?.can_write || false}
                            onCheckedChange={() =>
                              togglePermission(selectedRole, endpoint, 'can_write', permission?.can_write || false)
                            }
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={fetchData} variant="outline" className="fredoka-medium">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
      </div>
    </div>
  );
}