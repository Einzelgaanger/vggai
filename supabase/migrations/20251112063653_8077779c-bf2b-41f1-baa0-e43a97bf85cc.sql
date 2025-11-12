-- Create roles table for dynamic role management
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create api_endpoints table
CREATE TABLE IF NOT EXISTS public.api_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  endpoint_url TEXT NOT NULL,
  method TEXT NOT NULL DEFAULT 'GET',
  description TEXT,
  category TEXT,
  requires_auth BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create role_api_permissions table (replaces api_permissions)
CREATE TABLE IF NOT EXISTS public.role_api_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE NOT NULL,
  api_endpoint_id UUID REFERENCES public.api_endpoints(id) ON DELETE CASCADE NOT NULL,
  has_access BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role_id, api_endpoint_id)
);

-- Update user_roles to reference roles table instead of enum
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE public.user_roles DROP COLUMN IF EXISTS role;
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_unique UNIQUE(user_id, role_id);

-- Enable RLS
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_api_permissions ENABLE ROW LEVEL SECURITY;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = $1
      AND r.name IN ('ceo', 'admin', 'cto')
  );
$$;

-- Create function to get user's accessible API endpoints
CREATE OR REPLACE FUNCTION public.get_user_api_access(user_id UUID)
RETURNS TABLE (
  endpoint_id UUID,
  endpoint_name TEXT,
  endpoint_url TEXT,
  method TEXT,
  category TEXT,
  requires_auth BOOLEAN
)
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT
    ae.id,
    ae.name,
    ae.endpoint_url,
    ae.method,
    ae.category,
    ae.requires_auth
  FROM public.api_endpoints ae
  JOIN public.role_api_permissions rap ON ae.id = rap.api_endpoint_id
  JOIN public.user_roles ur ON rap.role_id = ur.role_id
  WHERE ur.user_id = $1
    AND rap.has_access = true;
$$;

-- Create function to get user's roles
CREATE OR REPLACE FUNCTION public.get_user_roles(user_id UUID)
RETURNS TABLE (
  role_id UUID,
  role_name TEXT,
  role_description TEXT
)
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    r.id,
    r.name,
    r.description
  FROM public.roles r
  JOIN public.user_roles ur ON r.id = ur.role_id
  WHERE ur.user_id = $1;
$$;

-- RLS Policies for roles
CREATE POLICY "Admins can manage all roles"
  ON public.roles FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Users can view all roles"
  ON public.roles FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for api_endpoints
CREATE POLICY "Admins can manage all API endpoints"
  ON public.api_endpoints FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Users can view API endpoints they have access to"
  ON public.api_endpoints FOR SELECT
  TO authenticated
  USING (
    public.is_admin(auth.uid()) OR
    EXISTS (
      SELECT 1
      FROM public.role_api_permissions rap
      JOIN public.user_roles ur ON rap.role_id = ur.role_id
      WHERE ur.user_id = auth.uid()
        AND rap.api_endpoint_id = api_endpoints.id
        AND rap.has_access = true
    )
  );

-- RLS Policies for role_api_permissions
CREATE POLICY "Admins can manage role permissions"
  ON public.role_api_permissions FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Users can view permissions"
  ON public.role_api_permissions FOR SELECT
  TO authenticated
  USING (true);

-- Migrate existing data from old structure to new
INSERT INTO public.roles (name, description)
VALUES 
  ('ceo', 'Chief Executive Officer'),
  ('cto', 'Chief Technology Officer'),
  ('cfo', 'Chief Financial Officer'),
  ('hr_manager', 'HR Manager'),
  ('hr_coordinator', 'HR Coordinator'),
  ('engineering_manager', 'Engineering Manager'),
  ('senior_developer', 'Senior Developer'),
  ('junior_developer', 'Junior Developer'),
  ('product_manager', 'Product Manager'),
  ('sales_manager', 'Sales Manager'),
  ('sales_representative', 'Sales Representative'),
  ('marketing_manager', 'Marketing Manager'),
  ('marketing_specialist', 'Marketing Specialist'),
  ('finance_manager', 'Finance Manager'),
  ('accountant', 'Accountant'),
  ('operations_manager', 'Operations Manager'),
  ('support_manager', 'Support Manager'),
  ('support_agent', 'Support Agent'),
  ('data_analyst', 'Data Analyst'),
  ('it_administrator', 'IT Administrator'),
  ('admin', 'System Administrator')
ON CONFLICT (name) DO NOTHING;

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON public.roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_role_api_permissions_updated_at
  BEFORE UPDATE ON public.role_api_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();