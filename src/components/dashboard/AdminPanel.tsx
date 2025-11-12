import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Shield, User, Database, RefreshCw, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UserData {
  id: string;
  email: string;
  full_name: string;
  roles: { id: string; name: string }[];
}

interface Role {
  id: string;
  name: string;
  description: string;
}

interface APIEndpoint {
  id: string;
  name: string;
  endpoint_url: string;
  method: string;
  category: string;
}

interface RolePermission {
  role_id: string;
  api_endpoint_id: string;
  has_access: boolean;
}

export function AdminPanel() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([]);
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedRole) {
      fetchPermissions(selectedRole);
    }
  }, [selectedRole]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch all roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select('*')
        .order('name');

      if (rolesError) throw rolesError;
      setRoles(rolesData || []);

      // Fetch users with their roles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .order('email');

      if (profilesError) throw profilesError;

      // Fetch user roles
      const { data: userRolesData, error: userRolesError } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          role_id,
          roles (id, name)
        `);

      if (userRolesError) throw userRolesError;

      // Combine users with their roles
      const usersWithRoles = profilesData?.map(profile => ({
        ...profile,
        roles: userRolesData
          ?.filter((ur: any) => ur.user_id === profile.id)
          .map((ur: any) => ({ id: ur.roles.id, name: ur.roles.name })) || []
      })) || [];

      setUsers(usersWithRoles);

      // Fetch API endpoints
      const { data: endpointsData, error: endpointsError } = await supabase
        .from('api_endpoints')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (endpointsError) throw endpointsError;
      setEndpoints(endpointsData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch admin data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async (roleId: string) => {
    const { data, error } = await supabase
      .from('role_api_permissions')
      .select('*')
      .eq('role_id', roleId);

    if (error) {
      console.error('Error fetching permissions:', error);
    } else {
      setPermissions(data || []);
    }
  };

  const updateUserRole = async (userId: string, roleId: string) => {
    try {
      // Check if user already has this role
      const user = users.find(u => u.id === userId);
      if (user?.roles.some(r => r.id === roleId)) {
        toast({
          title: "Info",
          description: "User already has this role",
        });
        return;
      }

      // Add the new role
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role_id: roleId });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Role assigned successfully",
      });
      
      fetchData();
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: "Failed to assign role",
        variant: "destructive",
      });
    }
  };

  const removeUserRole = async (userId: string, roleId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role_id', roleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Role removed successfully",
      });
      
      fetchData();
    } catch (error) {
      console.error('Error removing role:', error);
      toast({
        title: "Error",
        description: "Failed to remove role",
        variant: "destructive",
      });
    }
  };

  const togglePermission = async (endpointId: string, currentAccess: boolean) => {
    if (!selectedRole) return;

    try {
      const { error } = await supabase
        .from('role_api_permissions')
        .upsert({
          role_id: selectedRole,
          api_endpoint_id: endpointId,
          has_access: !currentAccess
        }, {
          onConflict: 'role_id,api_endpoint_id'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Permission updated successfully",
      });
      
      fetchPermissions(selectedRole);
    } catch (error) {
      console.error('Error updating permission:', error);
      toast({
        title: "Error",
        description: "Failed to update permission",
        variant: "destructive",
      });
    }
  };

  const hasPermission = (endpointId: string) => {
    return permissions.find(p => p.api_endpoint_id === endpointId)?.has_access || false;
  };

  const groupedEndpoints = endpoints.reduce((acc, endpoint) => {
    const category = endpoint.category || 'Uncategorized';
    if (!acc[category]) acc[category] = [];
    acc[category].push(endpoint);
    return acc;
  }, {} as Record<string, APIEndpoint[]>);

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

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="permissions">API Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 fredoka-semibold">
                <User className="w-5 h-5" />
                Users & Roles
              </CardTitle>
              <CardDescription className="fredoka-regular">
                Manage user roles - assign and remove roles from users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="fredoka-medium">Email</TableHead>
                    <TableHead className="fredoka-medium">Name</TableHead>
                    <TableHead className="fredoka-medium">Roles</TableHead>
                    <TableHead className="fredoka-medium">Assign Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="fredoka-regular text-muted-foreground">{user.email}</TableCell>
                      <TableCell className="fredoka-regular">{user.full_name}</TableCell>
                      <TableCell>
                        <div className="flex gap-2 flex-wrap">
                          {user.roles.length > 0 ? (
                            user.roles.map((role) => (
                              <Badge key={role.id} variant="secondary" className="fredoka-medium capitalize">
                                {role.name.replace(/_/g, ' ')}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0 ml-1 hover:text-destructive"
                                  onClick={() => removeUserRole(user.id, role.id)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">No roles</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select onValueChange={(value) => updateUserRole(user.id, value)}>
                          <SelectTrigger className="w-[200px] fredoka-regular">
                            <SelectValue placeholder="Select role..." />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role.id} value={role.id} className="fredoka-regular capitalize">
                                {role.name.replace(/_/g, ' ')}
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
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 fredoka-semibold">
                <Database className="w-5 h-5" />
                Role API Permissions
              </CardTitle>
              <CardDescription className="fredoka-regular">
                Configure which API endpoints each role can access
              </CardDescription>
              <div className="mt-4">
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-full max-w-md fredoka-regular">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id} className="fredoka-regular capitalize">
                        {role.name.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {selectedRole ? (
                <div className="space-y-6">
                  {Object.entries(groupedEndpoints).map(([category, categoryEndpoints]) => (
                    <div key={category}>
                      <h3 className="text-lg fredoka-semibold mb-3 capitalize text-foreground">{category}</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="fredoka-medium">Endpoint Name</TableHead>
                            <TableHead className="fredoka-medium">URL</TableHead>
                            <TableHead className="fredoka-medium">Method</TableHead>
                            <TableHead className="fredoka-medium text-center">Access</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {categoryEndpoints.map((endpoint) => (
                            <TableRow key={endpoint.id}>
                              <TableCell className="fredoka-regular">{endpoint.name}</TableCell>
                              <TableCell className="text-sm text-muted-foreground max-w-xs truncate fredoka-regular">
                                {endpoint.endpoint_url}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs fredoka-medium">
                                  {endpoint.method}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <Switch
                                  checked={hasPermission(endpoint.id)}
                                  onCheckedChange={() => togglePermission(endpoint.id, hasPermission(endpoint.id))}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8 fredoka-regular">
                  Select a role to manage its API permissions
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={fetchData} variant="outline" className="fredoka-medium">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
      </div>
    </div>
  );
}