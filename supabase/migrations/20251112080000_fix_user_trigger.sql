-- Fix the handle_new_user trigger function to use roles table instead of enum
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  role_name TEXT;
  role_id_val UUID;
  dept_id uuid;
BEGIN
  -- Determine role name based on email
  role_name := CASE 
    WHEN NEW.email = 'ceo@company.com' THEN 'ceo'
    WHEN NEW.email = 'cto@company.com' THEN 'cto'
    WHEN NEW.email = 'cfo@company.com' THEN 'cfo'
    WHEN NEW.email = 'hr.manager@company.com' THEN 'hr_manager'
    WHEN NEW.email = 'hr.coord@company.com' THEN 'hr_coordinator'
    WHEN NEW.email = 'eng.manager@company.com' THEN 'engineering_manager'
    WHEN NEW.email = 'senior.dev@company.com' THEN 'senior_developer'
    WHEN NEW.email = 'dev@company.com' THEN 'junior_developer'
    WHEN NEW.email = 'product@company.com' THEN 'product_manager'
    WHEN NEW.email = 'sales.manager@company.com' THEN 'sales_manager'
    WHEN NEW.email = 'sales.rep@company.com' THEN 'sales_representative'
    WHEN NEW.email = 'marketing.manager@company.com' THEN 'marketing_manager'
    WHEN NEW.email = 'marketing.spec@company.com' THEN 'marketing_specialist'
    WHEN NEW.email = 'finance.manager@company.com' THEN 'finance_manager'
    WHEN NEW.email = 'accountant@company.com' THEN 'accountant'
    WHEN NEW.email = 'ops.manager@company.com' THEN 'operations_manager'
    WHEN NEW.email = 'support.manager@company.com' THEN 'support_manager'
    WHEN NEW.email = 'support.agent@company.com' THEN 'support_agent'
    WHEN NEW.email = 'analyst@company.com' THEN 'data_analyst'
    WHEN NEW.email = 'it.admin@company.com' THEN 'it_administrator'
    ELSE 'junior_developer'
  END;

  -- Get role_id from roles table
  SELECT id INTO role_id_val FROM roles WHERE name = role_name LIMIT 1;
  
  -- If role doesn't exist, use junior_developer as fallback
  IF role_id_val IS NULL THEN
    SELECT id INTO role_id_val FROM roles WHERE name = 'junior_developer' LIMIT 1;
  END IF;

  -- Get appropriate department
  SELECT id INTO dept_id FROM departments WHERE name = 'Technology' LIMIT 1;

  -- Insert profile (if it doesn't exist)
  INSERT INTO public.profiles (id, email, full_name, department_id)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), dept_id)
  ON CONFLICT (id) DO NOTHING;

  -- Assign role using role_id (if not already assigned)
  INSERT INTO public.user_roles (user_id, role_id)
  VALUES (NEW.id, role_id_val)
  ON CONFLICT (user_id, role_id) DO NOTHING;

  RETURN NEW;
END;
$$;

