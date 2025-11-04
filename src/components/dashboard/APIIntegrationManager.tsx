import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plug, Plus, Trash2, RefreshCw, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface APIIntegration {
  id: string;
  company_id: string;
  integration_name: string;
  integration_type: string;
  endpoint_url: string;
  sync_frequency: string;
  is_active: boolean;
  last_sync_at: string | null;
  companies: { name: string } | null;
}

interface APIIntegrationManagerProps {
  role: string | null;
}

const APIIntegrationManager = ({ role }: APIIntegrationManagerProps) => {
  const [integrations, setIntegrations] = useState<APIIntegration[]>([]);
  const [companies, setCompanies] = useState<Array<{ id: string; name: string }>>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    company_id: "",
    integration_name: "",
    integration_type: "rest",
    endpoint_url: "",
    auth_type: "bearer",
    sync_frequency: "hourly",
  });

  // Only show for CEOs and CTOs
  if (!role || !['ceo', 'cto'].includes(role)) {
    return null;
  }

  useEffect(() => {
    fetchIntegrations();
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    const { data, error } = await supabase
      .from('companies')
      .select('id, name')
      .eq('is_active', true);

    if (!error && data) {
      setCompanies(data);
    }
  };

  const fetchIntegrations = async () => {
    const { data, error } = await supabase
      .from('api_integrations')
      .select('*, companies(name)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching integrations:', error);
      return;
    }

    setIntegrations(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase
      .from('api_integrations')
      .insert([formData]);

    if (error) {
      console.error('Error creating integration:', error);
      toast.error("Failed to create integration");
      return;
    }

    toast.success("Integration created successfully!");
    setIsOpen(false);
    setFormData({
      company_id: "",
      integration_name: "",
      integration_type: "rest",
      endpoint_url: "",
      auth_type: "bearer",
      sync_frequency: "hourly",
    });
    fetchIntegrations();
  };

  const handleSync = async (id: string) => {
    toast.info("Starting sync...");
    
    const { error } = await supabase.functions.invoke('sync-api', {
      body: { integration_id: id }
    });

    if (error) {
      toast.error("Sync failed: " + error.message);
      return;
    }

    toast.success("Sync completed successfully!");
    fetchIntegrations();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this integration?")) {
      return;
    }

    const { error } = await supabase
      .from('api_integrations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting integration:', error);
      toast.error("Failed to delete integration");
      return;
    }

    toast.success("Integration deleted successfully");
    fetchIntegrations();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plug className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>API Integrations</CardTitle>
              <CardDescription>Connect to external APIs and data sources</CardDescription>
            </div>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Integration
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add API Integration</DialogTitle>
                <DialogDescription>
                  Connect to an external API to sync data automatically
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Select
                      value={formData.company_id}
                      onValueChange={(value) => setFormData({ ...formData, company_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select company" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="integration_name">Integration Name</Label>
                    <Input
                      id="integration_name"
                      value={formData.integration_name}
                      onChange={(e) => setFormData({ ...formData, integration_name: e.target.value })}
                      placeholder="Salesforce API"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="integration_type">Integration Type</Label>
                    <Select
                      value={formData.integration_type}
                      onValueChange={(value) => setFormData({ ...formData, integration_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rest">REST API</SelectItem>
                        <SelectItem value="graphql">GraphQL</SelectItem>
                        <SelectItem value="webhook">Webhook</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sync_frequency">Sync Frequency</Label>
                    <Select
                      value={formData.sync_frequency}
                      onValueChange={(value) => setFormData({ ...formData, sync_frequency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realtime">Real-time</SelectItem>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endpoint_url">Endpoint URL</Label>
                  <Input
                    id="endpoint_url"
                    type="url"
                    value={formData.endpoint_url}
                    onChange={(e) => setFormData({ ...formData, endpoint_url: e.target.value })}
                    placeholder="https://api.example.com/v1/data"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Create Integration</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {integrations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Plug className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No integrations configured</p>
            <p className="text-sm">Add your first API integration to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {integrations.map((integration) => (
              <div
                key={integration.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{integration.integration_name}</h3>
                    <Badge variant={integration.is_active ? "default" : "secondary"}>
                      {integration.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline">{integration.integration_type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {(integration.companies as any)?.name || "Unknown Company"}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {integration.sync_frequency}
                    </span>
                    {integration.last_sync_at && (
                      <span>
                        Last sync: {new Date(integration.last_sync_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSync(integration.id)}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(integration.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default APIIntegrationManager;
