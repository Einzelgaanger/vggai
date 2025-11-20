import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, Plus, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface APIEndpoint {
  id: string;
  name: string;
  endpoint_url: string;
  method: string;
  description: string | null;
  category: string | null;
  requires_auth: boolean;
}

interface Role {
  id: string;
  name: string;
  description: string | null;
}

interface RolePermission {
  id: string;
  role_id: string;
  api_endpoint_id: string;
  has_access: boolean;
  roles: { name: string } | null;
  api_endpoints: APIEndpoint | null;
}

interface RoleAPIAccessManagerProps {
  role: string | null;
}

const RoleAPIAccessManager = ({ role }: RoleAPIAccessManagerProps) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([]);
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [newEndpoint, setNewEndpoint] = useState({
    name: "",
    endpoint_url: "",
    method: "GET",
    description: "",
    category: "",
    requires_auth: true,
  });

  // Only show for CEOs and CTOs
  if (!role || !['ceo', 'cto'].includes(role)) {
    return null;
  }

  useEffect(() => {
    fetchRoles();
    fetchEndpoints();
    fetchPermissions();
  }, []);

  useEffect(() => {
    if (selectedRole) {
      fetchPermissions();
    }
  }, [selectedRole]);

  const fetchRoles = async () => {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('name');

    if (!error && data) {
      setRoles(data);
      if (data.length > 0 && !selectedRole) {
        setSelectedRole(data[0].id);
      }
    }
  };

  const fetchEndpoints = async () => {
    const { data, error } = await supabase
      .from('api_endpoints')
      .select('*')
      .order('name');

    if (!error && data) {
      setEndpoints(data);
    }
  };

  const fetchPermissions = async () => {
    const { data, error } = await supabase
      .from('role_api_permissions')
      .select('*, roles(name), api_endpoints(*)')
      .eq('role_id', selectedRole)
      .order('created_at');

    if (!error && data) {
      setPermissions(data as any);
    }
  };

  const handleCreateEndpoint = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase
      .from('api_endpoints')
      .insert([newEndpoint]);

    if (error) {
      console.error('Error creating endpoint:', error);
      toast.error("Failed to create endpoint");
      return;
    }

    toast.success("Endpoint created successfully!");
    setIsOpen(false);
    setNewEndpoint({
      name: "",
      endpoint_url: "",
      method: "GET",
      description: "",
      category: "",
      requires_auth: true,
    });
    fetchEndpoints();
  };

  const handleTogglePermission = async (endpointId: string, currentPermission: RolePermission | undefined) => {
    if (currentPermission) {
      // Update existing permission
      const { error } = await supabase
        .from('role_api_permissions')
        .update({
          has_access: !currentPermission.has_access,
        })
        .eq('id', currentPermission.id);

      if (error) {
        console.error('Error updating permission:', error);
        toast.error("Failed to update permission");
        return;
      }
    } else {
      // Create new permission
      const { error } = await supabase
        .from('role_api_permissions')
        .insert([{
          role_id: selectedRole,
          api_endpoint_id: endpointId,
          has_access: true,
        }]);

      if (error) {
        console.error('Error creating permission:', error);
        toast.error("Failed to create permission");
        return;
      }
    }

    fetchPermissions();
  };

  const handleDeletePermission = async (permissionId: string) => {
    const { error } = await supabase
      .from('role_api_permissions')
      .delete()
      .eq('id', permissionId);

    if (error) {
      console.error('Error deleting permission:', error);
      toast.error("Failed to delete permission");
      return;
    }

    toast.success("Permission removed");
    fetchPermissions();
  };

  const getPermissionForEndpoint = (endpointId: string) => {
    return permissions.find(p => p.api_endpoint_id === endpointId);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Role-Based API Access</CardTitle>
              <CardDescription>Configure which APIs each role can access</CardDescription>
            </div>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Endpoint
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add API Endpoint</DialogTitle>
                <DialogDescription>
                  Define a new API endpoint that roles can access
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateEndpoint} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="endpoint_name">Endpoint Name</Label>
                  <Input
                    id="endpoint_name"
                    value={newEndpoint.name}
                    onChange={(e) => setNewEndpoint({ ...newEndpoint, name: e.target.value })}
                    placeholder="Sales Data API"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endpoint_url">Endpoint URL</Label>
                  <Input
                    id="endpoint_url"
                    type="url"
                    value={newEndpoint.endpoint_url}
                    onChange={(e) => setNewEndpoint({ ...newEndpoint, endpoint_url: e.target.value })}
                    placeholder="https://api.example.com/v1/sales"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="method">HTTP Method</Label>
                    <Select
                      value={newEndpoint.method}
                      onValueChange={(value) => setNewEndpoint({ ...newEndpoint, method: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="PATCH">PATCH</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={newEndpoint.category}
                      onChange={(e) => setNewEndpoint({ ...newEndpoint, category: e.target.value })}
                      placeholder="sales, finance, hr"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newEndpoint.description}
                    onChange={(e) => setNewEndpoint({ ...newEndpoint, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <Button type="submit" className="w-full">Create Endpoint</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Select Role</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedRole && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">
                API Endpoints for {roles.find(r => r.id === selectedRole)?.name}
              </h3>
              {endpoints.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No endpoints configured</p>
                  <p className="text-sm">Add endpoints to configure role access</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {endpoints.map((endpoint) => {
                    const permission = getPermissionForEndpoint(endpoint.id);
                    return (
                      <div
                        key={endpoint.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{endpoint.name}</h4>
                            <Badge variant="outline">{endpoint.method}</Badge>
                            {endpoint.category && (
                              <Badge variant="secondary">{endpoint.category}</Badge>
                            )}
                            {permission?.has_access ? (
                              <Badge variant="default" className="gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Has Access
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="gap-1">
                                <XCircle className="h-3 w-3" />
                                No Access
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{endpoint.endpoint_url}</p>
                          {endpoint.description && (
                            <p className="text-xs text-muted-foreground">{endpoint.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant={permission?.has_access ? "outline" : "default"}
                            size="sm"
                            onClick={() => handleTogglePermission(endpoint.id, permission)}
                          >
                            {permission?.has_access ? "Revoke" : "Grant"}
                          </Button>
                          {permission && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeletePermission(permission.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RoleAPIAccessManager;

