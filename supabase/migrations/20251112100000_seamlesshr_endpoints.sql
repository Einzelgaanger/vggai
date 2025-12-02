-- Complete SeamlessHR API endpoints migration
-- All endpoints with sandbox URLs and role permissions
-- Based on SeamlessHR API documentation: https://docs.seamlesshr.com

-- Insert all SeamlessHR API endpoints (using sandbox URL)
INSERT INTO public.api_endpoints (name, endpoint_url, method, description, category, requires_auth)
VALUES
  -- Employee endpoints
  ('employees_all', 'https://api-sandbox.seamlesshr.app/v1/employees', 'GET', 'Get all employees with filters (company, date, limit, status, can_login, employment_date, exit_status, exit_date, page)', 'employees', true),
  ('employees_birthdays', 'https://api-sandbox.seamlesshr.app/v1/employees/birthdays', 'GET', 'Get employee birthdays filtered by today, this-month', 'employees', true),
  ('employee_by_staff_id', 'https://api-sandbox.seamlesshr.app/v1/employees/{staff_id}', 'GET', 'Get single employee details by staff_id', 'employees', true),
  ('employee_add', 'https://api-sandbox.seamlesshr.app/v1/employees', 'POST', 'Add a new employee to the system', 'employees', true),
  ('employee_update_by_staff_id', 'https://api-sandbox.seamlesshr.app/v1/employees/{staff_id}', 'POST', 'Update employee details by staff_id', 'employees', true),
  ('employees_holidays', 'https://api-sandbox.seamlesshr.app/v1/employees/holidays', 'GET', 'Get holidays filtered by today, this-week, this-month, till-year-end', 'employees', true),
  
  -- Contract Types
  ('contract_types_create', 'https://api-sandbox.seamlesshr.app/v1/employees/contract-types', 'POST', 'Create a new contract type', 'employees', true),
  ('contract_types_all', 'https://api-sandbox.seamlesshr.app/v1/employees/contract-types', 'GET', 'Get all contract types for a company', 'employees', true),
  ('contract_type_get', 'https://api-sandbox.seamlesshr.app/v1/employees/contract-types/{contract_type_name}', 'GET', 'Get a specific contract type by name', 'employees', true),
  
  -- Employee Actions
  ('employee_activate', 'https://api-sandbox.seamlesshr.app/v1/employees/activate/{employee_code}', 'POST', 'Activate an employee', 'employees', true),
  ('employee_deactivate', 'https://api-sandbox.seamlesshr.app/v1/employees/deactivate/{employee_code}', 'POST', 'Deactivate an employee', 'employees', true),
  ('employee_exit', 'https://api-sandbox.seamlesshr.app/v1/employees/exit/{employee_code}', 'POST', 'Exit an employee from the organization', 'employees', true),
  
  -- Departments (CRUD operations)
  ('departments_get', 'https://api-sandbox.seamlesshr.app/v1/companies/departments', 'GET', 'Get all company departments', 'departments', true),
  ('department_create', 'https://api-sandbox.seamlesshr.app/v1/companies/departments', 'POST', 'Create a new department', 'departments', true),
  ('department_update', 'https://api-sandbox.seamlesshr.app/v1/companies/departments/{department_name}', 'PATCH', 'Update a department', 'departments', true),
  ('department_delete', 'https://api-sandbox.seamlesshr.app/v1/companies/departments/{department_name}', 'DELETE', 'Delete a department', 'departments', true),
  
  -- Job Roles (CRUD operations)
  ('job_roles_get', 'https://api-sandbox.seamlesshr.app/v1/companies/job_roles', 'GET', 'Get all company job roles', 'job_roles', true),
  ('job_role_create', 'https://api-sandbox.seamlesshr.app/v1/companies/job_roles', 'POST', 'Create a new job role', 'job_roles', true),
  ('job_role_update', 'https://api-sandbox.seamlesshr.app/v1/companies/job_roles/{job_role_name}', 'PATCH', 'Update a job role', 'job_roles', true),
  
  -- Recruitment endpoints
  ('recruitment', 'https://api-sandbox.seamlesshr.app/v1/recruitment/jobs', 'GET', 'Get all job postings', 'recruitment', true),
  ('applications', 'https://api-sandbox.seamlesshr.app/v1/recruitment/applications', 'GET', 'Get all applications', 'recruitment', true),
  
  -- Payroll endpoints
  ('payroll', 'https://api-sandbox.seamlesshr.app/v1/payroll', 'GET', 'Get payroll information', 'payroll', true),
  ('payroll_summary', 'https://api-sandbox.seamlesshr.app/v1/payroll/summary', 'GET', 'Get payroll summary', 'payroll', true),
  
  -- Attendance endpoints
  ('attendance', 'https://api-sandbox.seamlesshr.app/v1/attendances', 'GET', 'Get attendance records with query parameters (page, perPage, search, scheduleType, dateType, startDate, endDate)', 'attendance', true),
  ('attendance_summary', 'https://api-sandbox.seamlesshr.app/v1/attendance/summary', 'GET', 'Get attendance summary', 'attendance', true),
  
  -- Performance endpoints
  ('performance_reviews', 'https://api-sandbox.seamlesshr.app/v1/performance/reviews', 'GET', 'Get performance reviews', 'performance', true),
  ('performance_goals', 'https://api-sandbox.seamlesshr.app/v1/performance/goals', 'GET', 'Get performance goals', 'performance', true),
  
  -- Leave endpoints
  ('leave_requests', 'https://api-sandbox.seamlesshr.app/v1/leave/requests', 'GET', 'Get leave requests', 'leave', true),
  ('leave_balance', 'https://api-sandbox.seamlesshr.app/v1/leave/balance', 'GET', 'Get leave balances', 'leave', true)
ON CONFLICT (name) DO UPDATE SET
  endpoint_url = EXCLUDED.endpoint_url,
  description = EXCLUDED.description,
  method = EXCLUDED.method;

-- Grant CEO access to ALL endpoints (CEO gets everything automatically via trigger, but ensuring here)
DO $$
DECLARE
  ceo_role_id UUID;
  endpoint_record RECORD;
BEGIN
  SELECT id INTO ceo_role_id FROM public.roles WHERE name = 'ceo';
  
  IF ceo_role_id IS NOT NULL THEN
    -- Grant access to ALL endpoints
    FOR endpoint_record IN SELECT id FROM public.api_endpoints
    LOOP
      INSERT INTO public.role_api_permissions (role_id, api_endpoint_id, has_access, can_read, can_write)
      VALUES (ceo_role_id, endpoint_record.id, true, true, true)
      ON CONFLICT (role_id, api_endpoint_id) 
      DO UPDATE SET has_access = true, can_read = true, can_write = true;
    END LOOP;
  END IF;
END $$;

-- HR Manager: Access to employees, departments, recruitment, leave, contract types, job roles
DO $$
DECLARE
  hr_role_id UUID;
  endpoint_record RECORD;
BEGIN
  SELECT id INTO hr_role_id FROM public.roles WHERE name = 'hr_manager';
  
  IF hr_role_id IS NOT NULL THEN
    FOR endpoint_record IN SELECT id FROM public.api_endpoints 
    WHERE name IN (
      -- Employees
      'employees_all', 'employees_birthdays', 'employee_by_staff_id', 'employee_add', 
      'employee_update_by_staff_id', 'employees_holidays',
      -- Contract Types
      'contract_types_create', 'contract_types_all', 'contract_type_get',
      -- Employee Actions
      'employee_activate', 'employee_deactivate', 'employee_exit',
      -- Departments
      'departments_get', 'department_create', 'department_update', 'department_delete',
      -- Job Roles
      'job_roles_get', 'job_role_create', 'job_role_update',
      -- Recruitment
      'recruitment', 'applications',
      -- Leave
      'leave_requests', 'leave_balance',
      -- Attendance
      'attendance',
      -- Performance
      'performance_reviews'
    )
    LOOP
      INSERT INTO public.role_api_permissions (role_id, api_endpoint_id, has_access, can_read, can_write)
      VALUES (hr_role_id, endpoint_record.id, true, true, true)
      ON CONFLICT (role_id, api_endpoint_id) 
      DO UPDATE SET has_access = true, can_read = true, can_write = true;
    END LOOP;
  END IF;
END $$;

-- CFO: Access to payroll and financial data
DO $$
DECLARE
  cfo_role_id UUID;
  endpoint_record RECORD;
BEGIN
  SELECT id INTO cfo_role_id FROM public.roles WHERE name = 'cfo';
  
  IF cfo_role_id IS NOT NULL THEN
    FOR endpoint_record IN SELECT id FROM public.api_endpoints 
    WHERE name IN (
      'employees_all', 'payroll', 'payroll_summary', 'attendance_summary'
    )
    LOOP
      INSERT INTO public.role_api_permissions (role_id, api_endpoint_id, has_access, can_read, can_write)
      VALUES (cfo_role_id, endpoint_record.id, true, true, false)
      ON CONFLICT (role_id, api_endpoint_id) 
      DO UPDATE SET has_access = true, can_read = true, can_write = false;
    END LOOP;
  END IF;
END $$;

-- CTO: Access to employees and departments (for team management)
DO $$
DECLARE
  cto_role_id UUID;
  endpoint_record RECORD;
BEGIN
  SELECT id INTO cto_role_id FROM public.roles WHERE name = 'cto';
  
  IF cto_role_id IS NOT NULL THEN
    FOR endpoint_record IN SELECT id FROM public.api_endpoints 
    WHERE name IN (
      'employees_all', 'departments_get', 'attendance_summary', 'performance_goals'
    )
    LOOP
      INSERT INTO public.role_api_permissions (role_id, api_endpoint_id, has_access, can_read, can_write)
      VALUES (cto_role_id, endpoint_record.id, true, true, false)
      ON CONFLICT (role_id, api_endpoint_id) 
      DO UPDATE SET has_access = true, can_read = true, can_write = false;
    END LOOP;
  END IF;
END $$;
