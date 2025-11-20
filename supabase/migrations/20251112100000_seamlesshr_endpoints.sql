-- Add SeamlessHR API endpoints
-- Based on SeamlessHR API documentation: https://docs.seamlesshr.com

-- Insert SeamlessHR API endpoints
INSERT INTO public.api_endpoints (name, endpoint_url, method, description, category, requires_auth)
VALUES
  -- Employees endpoints
  ('employees', 'https://api.seamlesshr.com/v1/employees', 'GET', 'Get all employees', 'employees', true),
  ('employee_by_id', 'https://api.seamlesshr.com/v1/employees/{id}', 'GET', 'Get employee by ID', 'employees', true),
  ('employee_create', 'https://api.seamlesshr.com/v1/employees', 'POST', 'Create new employee', 'employees', true),
  ('employee_update', 'https://api.seamlesshr.com/v1/employees/{id}', 'PUT', 'Update employee', 'employees', true),
  
  -- Departments endpoints
  ('departments', 'https://api.seamlesshr.com/v1/departments', 'GET', 'Get all departments', 'departments', true),
  ('department_by_id', 'https://api.seamlesshr.com/v1/departments/{id}', 'GET', 'Get department by ID', 'departments', true),
  
  -- Recruitment endpoints
  ('recruitment', 'https://api.seamlesshr.com/v1/recruitment/jobs', 'GET', 'Get all job postings', 'recruitment', true),
  ('applications', 'https://api.seamlesshr.com/v1/recruitment/applications', 'GET', 'Get all applications', 'recruitment', true),
  
  -- Payroll endpoints
  ('payroll', 'https://api.seamlesshr.com/v1/payroll', 'GET', 'Get payroll information', 'payroll', true),
  ('payroll_summary', 'https://api.seamlesshr.com/v1/payroll/summary', 'GET', 'Get payroll summary', 'payroll', true),
  
  -- Attendance endpoints
  ('attendance', 'https://api.seamlesshr.com/v1/attendance', 'GET', 'Get attendance records', 'attendance', true),
  ('attendance_summary', 'https://api.seamlesshr.com/v1/attendance/summary', 'GET', 'Get attendance summary', 'attendance', true),
  
  -- Performance endpoints
  ('performance_reviews', 'https://api.seamlesshr.com/v1/performance/reviews', 'GET', 'Get performance reviews', 'performance', true),
  ('performance_goals', 'https://api.seamlesshr.com/v1/performance/goals', 'GET', 'Get performance goals', 'performance', true),
  
  -- Leave endpoints
  ('leave_requests', 'https://api.seamlesshr.com/v1/leave/requests', 'GET', 'Get leave requests', 'leave', true),
  ('leave_balance', 'https://api.seamlesshr.com/v1/leave/balance', 'GET', 'Get leave balances', 'leave', true)
ON CONFLICT (name) DO NOTHING;

-- Grant access to roles based on their needs
-- CEO: Access to everything
DO $$
DECLARE
  ceo_role_id UUID;
  endpoint_record RECORD;
BEGIN
  SELECT id INTO ceo_role_id FROM public.roles WHERE name = 'ceo';
  
  FOR endpoint_record IN SELECT id FROM public.api_endpoints WHERE name IN (
    'employees', 'departments', 'recruitment', 'payroll', 'payroll_summary', 
    'attendance_summary', 'performance_reviews'
  )
  LOOP
    INSERT INTO public.role_api_permissions (role_id, api_endpoint_id, has_access, can_read, can_write)
    VALUES (ceo_role_id, endpoint_record.id, true, true, true)
    ON CONFLICT (role_id, api_endpoint_id) DO UPDATE SET has_access = true, can_read = true, can_write = true;
  END LOOP;
END $$;

-- HR Manager: Access to employees, departments, recruitment, leave
DO $$
DECLARE
  hr_role_id UUID;
  endpoint_record RECORD;
BEGIN
  SELECT id INTO hr_role_id FROM public.roles WHERE name = 'hr_manager';
  
  FOR endpoint_record IN SELECT id FROM public.api_endpoints WHERE name IN (
    'employees', 'employee_by_id', 'employee_create', 'employee_update',
    'departments', 'recruitment', 'applications', 'leave_requests', 'leave_balance',
    'attendance', 'performance_reviews'
  )
  LOOP
    INSERT INTO public.role_api_permissions (role_id, api_endpoint_id, has_access, can_read, can_write)
    VALUES (hr_role_id, endpoint_record.id, true, true, true)
    ON CONFLICT (role_id, api_endpoint_id) DO UPDATE SET has_access = true, can_read = true, can_write = true;
  END LOOP;
END $$;

-- CFO: Access to payroll and financial data
DO $$
DECLARE
  cfo_role_id UUID;
  endpoint_record RECORD;
BEGIN
  SELECT id INTO cfo_role_id FROM public.roles WHERE name = 'cfo';
  
  FOR endpoint_record IN SELECT id FROM public.api_endpoints WHERE name IN (
    'employees', 'payroll', 'payroll_summary', 'attendance_summary'
  )
  LOOP
    INSERT INTO public.role_api_permissions (role_id, api_endpoint_id, has_access, can_read, can_write)
    VALUES (cfo_role_id, endpoint_record.id, true, true, false)
    ON CONFLICT (role_id, api_endpoint_id) DO UPDATE SET has_access = true, can_read = true, can_write = false;
  END LOOP;
END $$;

-- CTO: Access to employees and departments (for team management)
DO $$
DECLARE
  cto_role_id UUID;
  endpoint_record RECORD;
BEGIN
  SELECT id INTO cto_role_id FROM public.roles WHERE name = 'cto';
  
  FOR endpoint_record IN SELECT id FROM public.api_endpoints WHERE name IN (
    'employees', 'departments', 'attendance_summary', 'performance_goals'
  )
  LOOP
    INSERT INTO public.role_api_permissions (role_id, api_endpoint_id, has_access, can_read, can_write)
    VALUES (cto_role_id, endpoint_record.id, true, true, false)
    ON CONFLICT (role_id, api_endpoint_id) DO UPDATE SET has_access = true, can_read = true, can_write = false;
  END LOOP;
END $$;

