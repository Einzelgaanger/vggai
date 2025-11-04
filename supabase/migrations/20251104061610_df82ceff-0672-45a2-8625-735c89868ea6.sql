-- Create table for company metrics (for multi-company support)
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  api_endpoint TEXT,
  api_key_encrypted TEXT, -- Store encrypted API keys
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for real-time metrics
CREATE TABLE IF NOT EXISTS public.metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL, -- 'revenue', 'users', 'performance', etc.
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT, -- '$', '%', 'count', etc.
  metadata JSONB DEFAULT '{}'::jsonb,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for API integrations
CREATE TABLE IF NOT EXISTS public.api_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  integration_name TEXT NOT NULL,
  integration_type TEXT NOT NULL, -- 'rest', 'graphql', 'webhook'
  endpoint_url TEXT NOT NULL,
  auth_type TEXT, -- 'bearer', 'api_key', 'oauth'
  auth_credentials JSONB, -- Store encrypted credentials
  sync_frequency TEXT DEFAULT 'hourly', -- 'realtime', 'hourly', 'daily'
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for automation workflows
CREATE TABLE IF NOT EXISTS public.workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL, -- 'schedule', 'event', 'webhook'
  trigger_config JSONB NOT NULL,
  actions JSONB NOT NULL, -- Array of actions to execute
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for fine-grained permissions
CREATE TABLE IF NOT EXISTS public.resource_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  resource_type TEXT NOT NULL, -- 'company', 'metric', 'integration', 'workflow'
  resource_id UUID NOT NULL,
  permission_level TEXT NOT NULL, -- 'read', 'write', 'admin', 'none'
  granted_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, resource_type, resource_id)
);

-- Enable RLS on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies
CREATE POLICY "CEOs and CTOs can manage companies"
ON public.companies FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'ceo') OR 
  public.has_role(auth.uid(), 'cto')
);

CREATE POLICY "Users can view companies based on permissions"
ON public.companies FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'ceo') OR 
  public.has_role(auth.uid(), 'cto') OR
  EXISTS (
    SELECT 1 FROM public.resource_permissions
    WHERE user_id = auth.uid()
    AND resource_type = 'company'
    AND resource_id = companies.id
    AND permission_level IN ('read', 'write', 'admin')
  )
);

-- RLS Policies for metrics
CREATE POLICY "Users can view metrics for accessible companies"
ON public.metrics FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'ceo') OR 
  public.has_role(auth.uid(), 'cto') OR
  EXISTS (
    SELECT 1 FROM public.resource_permissions
    WHERE user_id = auth.uid()
    AND resource_type = 'company'
    AND resource_id = metrics.company_id
    AND permission_level IN ('read', 'write', 'admin')
  )
);

CREATE POLICY "Admins can insert metrics"
ON public.metrics FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'ceo') OR 
  public.has_role(auth.uid(), 'cto') OR
  EXISTS (
    SELECT 1 FROM public.resource_permissions
    WHERE user_id = auth.uid()
    AND resource_type = 'company'
    AND resource_id = metrics.company_id
    AND permission_level IN ('write', 'admin')
  )
);

-- RLS Policies for API integrations
CREATE POLICY "Admins can manage API integrations"
ON public.api_integrations FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'ceo') OR 
  public.has_role(auth.uid(), 'cto')
);

-- RLS Policies for workflows
CREATE POLICY "Users can view their workflows"
ON public.workflows FOR SELECT
TO authenticated
USING (
  created_by = auth.uid() OR
  public.has_role(auth.uid(), 'ceo') OR 
  public.has_role(auth.uid(), 'cto')
);

CREATE POLICY "Users can create workflows"
ON public.workflows FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their workflows"
ON public.workflows FOR UPDATE
TO authenticated
USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'ceo'));

-- RLS Policies for resource permissions
CREATE POLICY "Admins can manage all permissions"
ON public.resource_permissions FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'ceo') OR 
  public.has_role(auth.uid(), 'cto')
);

CREATE POLICY "Users can view their own permissions"
ON public.resource_permissions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_metrics_company_id ON public.metrics(company_id);
CREATE INDEX IF NOT EXISTS idx_metrics_recorded_at ON public.metrics(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_type ON public.metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_resource_permissions_user ON public.resource_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_permissions_resource ON public.resource_permissions(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_workflows_next_run ON public.workflows(next_run_at) WHERE is_active = true;

-- Enable realtime for metrics
ALTER PUBLICATION supabase_realtime ADD TABLE public.metrics;

-- Trigger for updated_at
CREATE TRIGGER update_companies_updated_at
BEFORE UPDATE ON public.companies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_api_integrations_updated_at
BEFORE UPDATE ON public.api_integrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workflows_updated_at
BEFORE UPDATE ON public.workflows
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();