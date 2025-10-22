-- Create departments table
CREATE TABLE IF NOT EXISTS public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM (
  'ceo',
  'cto',
  'cfo',
  'hr_manager',
  'hr_coordinator',
  'engineering_manager',
  'senior_developer',
  'junior_developer',
  'product_manager',
  'sales_manager',
  'sales_representative',
  'marketing_manager',
  'marketing_specialist',
  'finance_manager',
  'accountant',
  'operations_manager',
  'support_manager',
  'support_agent',
  'data_analyst',
  'it_administrator'
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  department_id uuid REFERENCES public.departments(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create API permissions table
CREATE TABLE IF NOT EXISTS public.api_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role public.app_role NOT NULL,
  api_endpoint text NOT NULL,
  can_read boolean DEFAULT true,
  can_write boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(role, api_endpoint)
);

-- Enable RLS
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_permissions ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- RLS Policies for departments
CREATE POLICY "Everyone can view departments"
  ON public.departments FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view own role"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for api_permissions
CREATE POLICY "Authenticated users can view permissions"
  ON public.api_permissions FOR SELECT
  TO authenticated
  USING (true);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert departments
INSERT INTO public.departments (name, description) VALUES
  ('Executive', 'C-level executives and leadership'),
  ('Technology', 'Engineering and IT teams'),
  ('Human Resources', 'HR and people operations'),
  ('Sales', 'Sales and business development'),
  ('Marketing', 'Marketing and communications'),
  ('Finance', 'Finance and accounting'),
  ('Operations', 'Operations and logistics'),
  ('Support', 'Customer support'),
  ('Analytics', 'Data and analytics');

-- Insert API permissions for different roles
-- CEO has access to everything
INSERT INTO public.api_permissions (role, api_endpoint, can_read, can_write) VALUES
  ('ceo', '/api/analytics/company-overview', true, true),
  ('ceo', '/api/analytics/financial-metrics', true, true),
  ('ceo', '/api/analytics/employee-stats', true, true),
  ('ceo', '/api/analytics/sales-performance', true, true);

-- CTO permissions
INSERT INTO public.api_permissions (role, api_endpoint, can_read, can_write) VALUES
  ('cto', '/api/analytics/tech-metrics', true, true),
  ('cto', '/api/analytics/project-status', true, true),
  ('cto', '/api/analytics/team-performance', true, false);

-- CFO permissions
INSERT INTO public.api_permissions (role, api_endpoint, can_read, can_write) VALUES
  ('cfo', '/api/analytics/financial-metrics', true, true),
  ('cfo', '/api/analytics/budget-overview', true, true),
  ('cfo', '/api/analytics/expense-reports', true, true);

-- HR permissions
INSERT INTO public.api_permissions (role, api_endpoint, can_read, can_write) VALUES
  ('hr_manager', '/api/analytics/employee-stats', true, true),
  ('hr_manager', '/api/analytics/recruitment-metrics', true, true),
  ('hr_manager', '/api/analytics/performance-reviews', true, true),
  ('hr_coordinator', '/api/analytics/employee-stats', true, false),
  ('hr_coordinator', '/api/analytics/recruitment-metrics', true, false);

-- Engineering permissions
INSERT INTO public.api_permissions (role, api_endpoint, can_read, can_write) VALUES
  ('engineering_manager', '/api/analytics/tech-metrics', true, true),
  ('engineering_manager', '/api/analytics/project-status', true, true),
  ('senior_developer', '/api/analytics/tech-metrics', true, false),
  ('senior_developer', '/api/analytics/project-status', true, false),
  ('junior_developer', '/api/analytics/project-status', true, false);

-- Product permissions
INSERT INTO public.api_permissions (role, api_endpoint, can_read, can_write) VALUES
  ('product_manager', '/api/analytics/product-metrics', true, true),
  ('product_manager', '/api/analytics/user-engagement', true, true);

-- Sales permissions
INSERT INTO public.api_permissions (role, api_endpoint, can_read, can_write) VALUES
  ('sales_manager', '/api/analytics/sales-performance', true, true),
  ('sales_manager', '/api/analytics/pipeline-metrics', true, true),
  ('sales_representative', '/api/analytics/sales-performance', true, false);

-- Marketing permissions
INSERT INTO public.api_permissions (role, api_endpoint, can_read, can_write) VALUES
  ('marketing_manager', '/api/analytics/marketing-metrics', true, true),
  ('marketing_manager', '/api/analytics/campaign-performance', true, true),
  ('marketing_specialist', '/api/analytics/campaign-performance', true, false);

-- Finance permissions
INSERT INTO public.api_permissions (role, api_endpoint, can_read, can_write) VALUES
  ('finance_manager', '/api/analytics/financial-metrics', true, true),
  ('finance_manager', '/api/analytics/budget-overview', true, true),
  ('accountant', '/api/analytics/expense-reports', true, false);

-- Operations permissions
INSERT INTO public.api_permissions (role, api_endpoint, can_read, can_write) VALUES
  ('operations_manager', '/api/analytics/operations-metrics', true, true),
  ('operations_manager', '/api/analytics/efficiency-stats', true, true);

-- Support permissions
INSERT INTO public.api_permissions (role, api_endpoint, can_read, can_write) VALUES
  ('support_manager', '/api/analytics/support-metrics', true, true),
  ('support_manager', '/api/analytics/ticket-stats', true, true),
  ('support_agent', '/api/analytics/ticket-stats', true, false);

-- Analytics permissions
INSERT INTO public.api_permissions (role, api_endpoint, can_read, can_write) VALUES
  ('data_analyst', '/api/analytics/data-insights', true, true),
  ('data_analyst', '/api/analytics/reporting', true, true);

-- IT permissions
INSERT INTO public.api_permissions (role, api_endpoint, can_read, can_write) VALUES
  ('it_administrator', '/api/analytics/system-health', true, true),
  ('it_administrator', '/api/analytics/security-metrics', true, true);