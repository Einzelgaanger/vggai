import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Eye, EyeOff, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { OAuthFlow } from "./OAuthFlow";

interface Role {
  id: string;
  name: string;
}

interface Company {
  id: string;
  name: string;
}

interface Credential {
  id: string;
  role_id: string;
  company_id: string | null;
  credential_name: string;
  api_endpoint: string;
  auth_type: 'bearer' | 'api_key' | 'oauth';
  is_active: boolean;
  last_tested_at: string | null;
  roles: { name: string };
  companies?: { name: string };
}

interface APICredentialManagerProps {
  selectedCompanyId?: string | null;
}

export function APICredentialManager({ selectedCompanyId }: APICredentialManagerProps) {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [testing, setTesting] = useState<Record<string, boolean>>({});
  const [newCredential, setNewCredential] = useState({
    role_id: '',
    company_id: '',
    credential_name: '',
    api_endpoint: '',
    auth_type: 'bearer' as 'bearer' | 'api_key' | 'oauth',
    bearer_token: '',
    api_key: '',
    api_secret: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [selectedCompanyId]);

  const fetchData = async () => {
    // Fetch roles
    const { data: rolesData } = await supabase
      .from('roles')
      .select('id, name')
      .order('name');
    
    if (rolesData) setRoles(rolesData);

    // Fetch companies
    const { data: companiesData } = await supabase
      .from('companies')
      .select('id, name')
      .eq('is_active', true)
      .order('name');
    
    if (companiesData) setCompanies(companiesData);

    // Fetch credentials
    let query = supabase
      .from('api_credentials')
      .select(`
        *,
        roles (name),
        companies (name)
      `)
      .order('credential_name');

    if (selectedCompanyId) {
      query = query.eq('company_id', selectedCompanyId);
    }

    const { data: credsData } = await query;
    if (credsData) setCredentials(credsData as any);
  };

  const handleCreate = async () => {
    if (!newCredential.role_id || !newCredential.credential_name || !newCredential.api_endpoint) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    let credentialsData: any = {};
    
    if (newCredential.auth_type === 'bearer') {
      if (!newCredential.bearer_token) {
        toast({
          title: "Error",
          description: "Bearer token is required",
          variant: "destructive"
        });
        return;
      }
      credentialsData = { token: newCredential.bearer_token };
    } else if (newCredential.auth_type === 'api_key') {
      if (!newCredential.api_key) {
        toast({
          title: "Error",
          description: "API key is required",
          variant: "destructive"
        });
        return;
      }
      credentialsData = {
        api_key: newCredential.api_key,
        api_secret: newCredential.api_secret || null
      };
    }

    const { error } = await supabase
      .from('api_credentials')
      .insert({
        role_id: newCredential.role_id,
        company_id: newCredential.company_id || selectedCompanyId || null,
        credential_name: newCredential.credential_name,
        api_endpoint: newCredential.api_endpoint,
        auth_type: newCredential.auth_type,
        credentials: credentialsData,
        is_active: true
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create credential",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Credential created successfully"
      });
      setIsDialogOpen(false);
      setNewCredential({
        role_id: '',
        company_id: '',
        credential_name: '',
        api_endpoint: '',
        auth_type: 'bearer',
        bearer_token: '',
        api_key: '',
        api_secret: ''
      });
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('api_credentials')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete credential",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Credential deleted successfully"
      });
      fetchData();
    }
  };

  const testCredential = async (credential: Credential) => {
    setTesting({ ...testing, [credential.id]: true });

    try {
      // Simple test: try to fetch from the endpoint
      const response = await fetch(credential.api_endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(credential.auth_type === 'bearer' && {
            'Authorization': `Bearer ${(credential as any).credentials.token}`
          }),
          ...(credential.auth_type === 'api_key' && {
            'X-API-Key': (credential as any).credentials.api_key
          })
        }
      });

      const success = response.ok;

      // Update last_tested_at
      await supabase
        .from('api_credentials')
        .update({ last_tested_at: new Date().toISOString() })
        .eq('id', credential.id);

      toast({
        title: success ? "Test Successful" : "Test Failed",
        description: success 
          ? "Credential is working correctly" 
          : `Failed with status ${response.status}`,
        variant: success ? "default" : "destructive"
      });

      fetchData();
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Could not connect to the API endpoint",
        variant: "destructive"
      });
    } finally {
      setTesting({ ...testing, [credential.id]: false });
    }
  };

  const toggleShowSecret = (id: string) => {
    setShowSecrets({ ...showSecrets, [id]: !showSecrets[id] });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>API Credentials</CardTitle>
          <CardDescription>
            Manage API credentials for each role to access external data sources
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Credential
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add API Credential</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Role *</Label>
                <Select
                  value={newCredential.role_id}
                  onValueChange={(value) => setNewCredential({ ...newCredential, role_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Company</Label>
                <Select
                  value={newCredential.company_id || selectedCompanyId || ''}
                  onValueChange={(value) => setNewCredential({ ...newCredential, company_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a company (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Companies</SelectItem>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Credential Name *</Label>
                <Input
                  value={newCredential.credential_name}
                  onChange={(e) => setNewCredential({ ...newCredential, credential_name: e.target.value })}
                  placeholder="e.g., Salesforce Production API"
                />
              </div>

              <div className="space-y-2">
                <Label>API Endpoint *</Label>
                <Input
                  value={newCredential.api_endpoint}
                  onChange={(e) => setNewCredential({ ...newCredential, api_endpoint: e.target.value })}
                  placeholder="https://api.example.com"
                />
              </div>

              <div className="space-y-2">
                <Label>Authentication Type *</Label>
                <Select
                  value={newCredential.auth_type}
                  onValueChange={(value: any) => setNewCredential({ ...newCredential, auth_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bearer">Bearer Token</SelectItem>
                    <SelectItem value="api_key">API Key</SelectItem>
                    <SelectItem value="oauth">OAuth 2.0</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newCredential.auth_type === 'bearer' && (
                <div className="space-y-2">
                  <Label>Bearer Token *</Label>
                  <Input
                    type="password"
                    value={newCredential.bearer_token}
                    onChange={(e) => setNewCredential({ ...newCredential, bearer_token: e.target.value })}
                    placeholder="Enter bearer token"
                  />
                </div>
              )}

              {newCredential.auth_type === 'api_key' && (
                <>
                  <div className="space-y-2">
                    <Label>API Key *</Label>
                    <Input
                      type="password"
                      value={newCredential.api_key}
                      onChange={(e) => setNewCredential({ ...newCredential, api_key: e.target.value })}
                      placeholder="Enter API key"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>API Secret (Optional)</Label>
                    <Input
                      type="password"
                      value={newCredential.api_secret}
                      onChange={(e) => setNewCredential({ ...newCredential, api_secret: e.target.value })}
                      placeholder="Enter API secret if required"
                    />
                  </div>
                </>
              )}

              {newCredential.auth_type === 'oauth' ? (
                <div className="pt-4">
                  <OAuthFlow
                    roleId={newCredential.role_id}
                    credentialName={newCredential.credential_name}
                    apiEndpoint={newCredential.api_endpoint}
                    onSuccess={() => {
                      setIsDialogOpen(false);
                      fetchData();
                    }}
                  />
                </div>
              ) : (
                <Button onClick={handleCreate} className="w-full">
                  Create Credential
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Endpoint</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Tested</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {credentials.map((cred) => (
              <TableRow key={cred.id}>
                <TableCell className="font-medium">{cred.credential_name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{cred.roles.name}</Badge>
                </TableCell>
                <TableCell>
                  {cred.companies?.name ? (
                    <Badge variant="secondary">{cred.companies.name}</Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">All Companies</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                  {cred.api_endpoint}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{cred.auth_type}</Badge>
                </TableCell>
                <TableCell>
                  {cred.is_active ? (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      Inactive
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {cred.last_tested_at 
                    ? new Date(cred.last_tested_at).toLocaleString()
                    : 'Never'
                  }
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testCredential(cred)}
                      disabled={testing[cred.id]}
                    >
                      {testing[cred.id] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Test'
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(cred.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
