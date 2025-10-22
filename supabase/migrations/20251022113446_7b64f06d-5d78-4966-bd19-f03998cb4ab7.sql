-- Function to assign role based on email when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role app_role;
  dept_id uuid;
BEGIN
  -- Determine role based on email
  user_role := CASE 
    WHEN NEW.email = 'ceo@company.com' THEN 'ceo'::app_role
    WHEN NEW.email = 'cto@company.com' THEN 'cto'::app_role
    WHEN NEW.email = 'cfo@company.com' THEN 'cfo'::app_role
    WHEN NEW.email = 'hr.manager@company.com' THEN 'hr_manager'::app_role
    WHEN NEW.email = 'hr.coord@company.com' THEN 'hr_coordinator'::app_role
    WHEN NEW.email = 'eng.manager@company.com' THEN 'engineering_manager'::app_role
    WHEN NEW.email = 'senior.dev@company.com' THEN 'senior_developer'::app_role
    WHEN NEW.email = 'dev@company.com' THEN 'junior_developer'::app_role
    WHEN NEW.email = 'product@company.com' THEN 'product_manager'::app_role
    WHEN NEW.email = 'sales.manager@company.com' THEN 'sales_manager'::app_role
    WHEN NEW.email = 'sales.rep@company.com' THEN 'sales_representative'::app_role
    WHEN NEW.email = 'marketing.manager@company.com' THEN 'marketing_manager'::app_role
    WHEN NEW.email = 'marketing.spec@company.com' THEN 'marketing_specialist'::app_role
    WHEN NEW.email = 'finance.manager@company.com' THEN 'finance_manager'::app_role
    WHEN NEW.email = 'accountant@company.com' THEN 'accountant'::app_role
    WHEN NEW.email = 'ops.manager@company.com' THEN 'operations_manager'::app_role
    WHEN NEW.email = 'support.manager@company.com' THEN 'support_manager'::app_role
    WHEN NEW.email = 'support.agent@company.com' THEN 'support_agent'::app_role
    WHEN NEW.email = 'analyst@company.com' THEN 'data_analyst'::app_role
    WHEN NEW.email = 'it.admin@company.com' THEN 'it_administrator'::app_role
    ELSE 'junior_developer'::app_role
  END;

  -- Get appropriate department
  SELECT id INTO dept_id FROM departments WHERE name = 'Technology' LIMIT 1;

  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name, department_id)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), dept_id);

  -- Assign role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);

  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();