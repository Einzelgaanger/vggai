import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Zap, Plus, Trash2, Play, Pause } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Workflow {
  id: string;
  name: string;
  description: string | null;
  trigger_type: string;
  is_active: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
}

const WorkflowAutomation = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    trigger_type: "schedule",
    trigger_config: { schedule: "0 * * * *" }, // hourly
    actions: [{ type: "sync_data", config: {} }],
  });

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching workflows:', error);
      return;
    }

    setWorkflows(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    const { error } = await supabase
      .from('workflows')
      .insert([{ ...formData, created_by: user.id }]);

    if (error) {
      console.error('Error creating workflow:', error);
      toast.error("Failed to create workflow");
      return;
    }

    toast.success("Workflow created successfully!");
    setIsOpen(false);
    setFormData({
      name: "",
      description: "",
      trigger_type: "schedule",
      trigger_config: { schedule: "0 * * * *" },
      actions: [{ type: "sync_data", config: {} }],
    });
    fetchWorkflows();
  };

  const toggleWorkflow = async (id: string, currentState: boolean) => {
    const { error } = await supabase
      .from('workflows')
      .update({ is_active: !currentState })
      .eq('id', id);

    if (error) {
      console.error('Error updating workflow:', error);
      toast.error("Failed to update workflow");
      return;
    }

    toast.success(`Workflow ${!currentState ? 'activated' : 'paused'}`);
    fetchWorkflows();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this workflow?")) {
      return;
    }

    const { error } = await supabase
      .from('workflows')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting workflow:', error);
      toast.error("Failed to delete workflow");
      return;
    }

    toast.success("Workflow deleted successfully");
    fetchWorkflows();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Automation Workflows</CardTitle>
              <CardDescription>Automate data sync and reporting tasks</CardDescription>
            </div>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Workflow
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Automation Workflow</DialogTitle>
                <DialogDescription>
                  Set up automated tasks to run on a schedule or trigger
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Workflow Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Daily Revenue Sync"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Syncs revenue data from all companies daily"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trigger_type">Trigger Type</Label>
                  <Select
                    value={formData.trigger_type}
                    onValueChange={(value) => setFormData({ ...formData, trigger_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="schedule">Scheduled (Cron)</SelectItem>
                      <SelectItem value="event">Event-based</SelectItem>
                      <SelectItem value="webhook">Webhook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.trigger_type === "schedule" && (
                  <div className="space-y-2">
                    <Label htmlFor="schedule">Schedule (Cron Expression)</Label>
                    <Input
                      id="schedule"
                      value={formData.trigger_config.schedule}
                      onChange={(e) => setFormData({
                        ...formData,
                        trigger_config: { schedule: e.target.value }
                      })}
                      placeholder="0 * * * * (hourly)"
                    />
                    <p className="text-xs text-muted-foreground">
                      Examples: "0 * * * *" (hourly), "0 0 * * *" (daily), "0 0 * * 0" (weekly)
                    </p>
                  </div>
                )}
                <Button type="submit" className="w-full">Create Workflow</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {workflows.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Zap className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No workflows configured</p>
            <p className="text-sm">Create your first automation workflow</p>
          </div>
        ) : (
          <div className="space-y-3">
            {workflows.map((workflow) => (
              <div
                key={workflow.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{workflow.name}</h3>
                    <Badge variant={workflow.is_active ? "default" : "secondary"}>
                      {workflow.is_active ? "Active" : "Paused"}
                    </Badge>
                    <Badge variant="outline">{workflow.trigger_type}</Badge>
                  </div>
                  {workflow.description && (
                    <p className="text-sm text-muted-foreground mb-2">{workflow.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {workflow.last_run_at && (
                      <span>Last run: {new Date(workflow.last_run_at).toLocaleString()}</span>
                    )}
                    {workflow.next_run_at && (
                      <span>Next run: {new Date(workflow.next_run_at).toLocaleString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleWorkflow(workflow.id, workflow.is_active)}
                  >
                    {workflow.is_active ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(workflow.id)}
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

export default WorkflowAutomation;
