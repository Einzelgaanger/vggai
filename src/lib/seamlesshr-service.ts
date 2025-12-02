/**
 * Service for interacting with Seamless HR API
 */

const SEAMLESSHR_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/seamlesshr-api`;

export interface SeamlessHREmployee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  status: string;
  hireDate: string;
  [key: string]: any;
}

export interface SeamlessHRResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Fetch data from Seamless HR API
 */
export async function fetchSeamlessHRData<T>(endpoint: string, options?: { method?: string; body?: unknown }): Promise<T> {
  try {
    console.log('Fetching Seamless HR data:', endpoint, options?.method || 'GET');
    
    const response = await fetch(SEAMLESSHR_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ 
        endpoint,
        method: options?.method || 'GET',
        body: options?.body,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Seamless HR API error:', errorData);
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Seamless HR data received:', data);
    return data as T;
  } catch (error) {
    console.error('Failed to fetch from Seamless HR:', error);
    throw error;
  }
}

/**
 * Helper function to calculate percentage change
 */
export function calculatePercentageChange(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? '+100%' : '0%';
  const change = ((current - previous) / previous) * 100;
  return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
}

/**
 * Helper function to format employee name
 */
export function formatEmployeeName(employee: SeamlessHREmployee | any): string {
  if (employee.firstName && employee.lastName) {
    return `${employee.firstName} ${employee.lastName}`.trim();
  }
  if (employee.name) {
    return employee.name;
  }
  if (employee.employeeCode) {
    return employee.employeeCode;
  }
  return 'Unknown Employee';
}

/**
 * Helper function to calculate tenure from hire date
 */
export function calculateTenure(hireDate: string | Date): string {
  if (!hireDate) return 'N/A';
  try {
    const hire = typeof hireDate === 'string' ? new Date(hireDate) : hireDate;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - hire.getTime());
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365);
    
    if (diffYears < 1) {
      const diffMonths = diffYears * 12;
      return `${Math.floor(diffMonths)} months`;
    }
    return `${diffYears.toFixed(1)} years`;
  } catch {
    return 'N/A';
  }
}

/**
 * Get All Employees Query Parameters
 */
export interface GetEmployeesParams {
  company?: string; // Optional company filter
  date?: string; // Filter by date employee was created (format: YYYY-MM-DD)
  limit?: number; // Limit records (default: 10)
  status?: 'active' | 'inactive'; // Filter by status
  can_login?: boolean; // Filter by employees that can login
  employment_date?: string[]; // Filter by employment date range e.g ['2025-02-01', '2025-03-31']
  exit_status?: boolean; // Filter by exit status
  exit_date?: string[]; // Filter by exit date range e.g ['2025-02-01', '2025-03-31']
  page?: number; // Page number (default: 1)
}

/**
 * Fetch all employees from Seamless HR with optional filters
 * 
 * @param params Query parameters for filtering employees
 * @returns Array of employees
 * 
 * @example
 * // Get all employees with default settings
 * const employees = await getSeamlessHREmployees();
 * 
 * @example
 * // Get active employees with pagination
 * const employees = await getSeamlessHREmployees({
 *   status: 'active',
 *   limit: 50,
 *   page: 1
 * });
 */
export async function getSeamlessHREmployees(params?: GetEmployeesParams): Promise<SeamlessHREmployee[]> {
  // Build query string
  const queryParams = new URLSearchParams();
  
  if (params?.company) {
    queryParams.append('company', params.company);
  }
  
  if (params?.date) {
    queryParams.append('date', params.date);
  }
  
  if (params?.limit !== undefined) {
    queryParams.append('limit', params.limit.toString());
  }
  
  if (params?.status) {
    queryParams.append('status', params.status);
  }
  
  if (params?.can_login !== undefined) {
    queryParams.append('can_login', params.can_login.toString());
  }
  
  if (params?.employment_date && params.employment_date.length > 0) {
    params.employment_date.forEach(date => {
      queryParams.append('employment_date[]', date);
    });
  }
  
  if (params?.exit_status !== undefined) {
    queryParams.append('exit_status', params.exit_status.toString());
  }
  
  if (params?.exit_date && params.exit_date.length > 0) {
    params.exit_date.forEach(date => {
      queryParams.append('exit_date[]', date);
    });
  }
  
  if (params?.page !== undefined) {
    queryParams.append('page', params.page.toString());
  }
  
  const endpoint = `/v1/employees${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const data = await fetchSeamlessHRData<SeamlessHREmployee[] | { data: SeamlessHREmployee[]; employees: SeamlessHREmployee[] }>(endpoint);
  
  // Transform the API response to match our interface
  if (Array.isArray(data)) {
    return data;
  } else if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as { data: SeamlessHREmployee[] }).data)) {
    return (data as { data: SeamlessHREmployee[] }).data;
  } else if (data && typeof data === 'object' && 'employees' in data && Array.isArray((data as { employees: SeamlessHREmployee[] }).employees)) {
    return (data as { employees: SeamlessHREmployee[] }).employees;
  }
  
  return [];
}

/**
 * Get employee count from Seamless HR
 */
export async function getSeamlessHREmployeeCount(): Promise<number> {
  try {
    const employees = await getSeamlessHREmployees();
    return employees.length;
  } catch (error) {
    console.error('Failed to get employee count:', error);
    return 0;
  }
}

/**
 * Fetch departments from Seamless HR (legacy - use getSeamlessHRDepartments(company) instead)
 * @deprecated Use getSeamlessHRDepartments(company) instead
 */
export async function getSeamlessHRDepartmentsLegacy(): Promise<unknown> {
  return fetchSeamlessHRData('/v1/companies/departments?company_name=Integration Company');
}

/**
 * Fetch branches from Seamless HR
 */
export async function getSeamlessHRBranches(): Promise<any> {
  return fetchSeamlessHRData('/v1/companies/branches?company_name=Integration Company');
}

/**
 * Fetch job roles from Seamless HR (legacy - use getSeamlessHRJobRoles(company) instead)
 * @deprecated Use getSeamlessHRJobRoles(company) instead
 */
export async function getSeamlessHRJobRolesLegacy(): Promise<unknown> {
  return fetchSeamlessHRData('/v1/companies/job-roles?company_name=Integration Company');
}

/**
 * Fetch company info from Seamless HR
 */
export async function getSeamlessHRCompanyInfo(): Promise<any> {
  return fetchSeamlessHRData('/v1/companies?company_name=Integration Company');
}

/**
 * Fetch leave requests from Seamless HR
 */
export async function getSeamlessHRLeaveData(): Promise<any> {
  return fetchSeamlessHRData('/v1/leave/requests?company=Integration Company&status=ON LEAVE');
}

/**
 * Fetch performance cycles from Seamless HR
 */
export async function getSeamlessHRPerformanceData(): Promise<any> {
  return fetchSeamlessHRData('/v1/performance/cycles?company_name=Integration Company');
}

/**
 * Fetch payroll data from Seamless HR
 */
export async function getSeamlessHRPayrollData(): Promise<any> {
  return fetchSeamlessHRData('/v1/payroll?company_name=Integration Company');
}

/**
 * Attendance Record Interface
 */
export interface SeamlessHRAttendanceRecord {
  firstName: string;
  lastName: string;
  employeeCode: string;
  attendanceId: string | null;
  scheduleType: 'ROTATIONAL' | 'FULLTIME';
  setClockInDateTime: string;
  setClockOutDateTime: string;
  clockInDateTime: string | null;
  clockOutDateTime: string | null;
  breakStartTime: string | null;
  breakEndTime: string | null;
  clockInSource: string;
  clockOutSource: string;
  punctualityStatus: string;
}

export interface SeamlessHRAttendanceResponse {
  message: string;
  data: SeamlessHRAttendanceRecord[];
}

/**
 * Attendance Query Parameters
 */
export interface AttendanceQueryParams {
  page?: number; // Defaults to 1
  perPage?: number; // Defaults to 10
  search?: string; // Filter by employee name
  scheduleType?: 'ROTATIONAL' | 'FULLTIME'; // Filter by schedule type
  dateType?: 'week' | 'month' | 'custom'; // Filter by date type
  startDate?: string; // Required when dateType is 'custom' (format: YYYY-MM-DD)
  endDate?: string; // Required when dateType is 'custom' (format: YYYY-MM-DD)
}

/**
 * Fetch attendance records from Seamless HR
 * 
 * @param params Query parameters for filtering attendance records
 * @returns Attendance records response
 * 
 * @example
 * // Get first page with default settings
 * const records = await getSeamlessHRAttendanceRecords();
 * 
 * @example
 * // Get records for current week
 * const records = await getSeamlessHRAttendanceRecords({ dateType: 'week' });
 * 
 * @example
 * // Get records for a custom date range
 * const records = await getSeamlessHRAttendanceRecords({
 *   dateType: 'custom',
 *   startDate: '2024-01-01',
 *   endDate: '2024-01-31',
 *   perPage: 50
 * });
 * 
 * @example
 * // Search for specific employee
 * const records = await getSeamlessHRAttendanceRecords({
 *   search: 'John Doe',
 *   scheduleType: 'FULLTIME'
 * });
 */
export async function getSeamlessHRAttendanceRecords(
  params?: AttendanceQueryParams
): Promise<SeamlessHRAttendanceResponse> {
  // Build query string
  const queryParams = new URLSearchParams();
  
  if (params?.page !== undefined) {
    queryParams.append('page', params.page.toString());
  }
  
  if (params?.perPage !== undefined) {
    queryParams.append('perPage', params.perPage.toString());
  }
  
  if (params?.search) {
    queryParams.append('search', params.search);
  }
  
  if (params?.scheduleType) {
    queryParams.append('scheduleType', params.scheduleType);
  }
  
  if (params?.dateType) {
    queryParams.append('dateType', params.dateType);
    
    if (params.dateType === 'custom') {
      if (!params.startDate || !params.endDate) {
        throw new Error('startDate and endDate are required when dateType is "custom"');
      }
      queryParams.append('startDate', params.startDate);
      queryParams.append('endDate', params.endDate);
    }
  }
  
  // Build endpoint with query parameters
  const endpoint = `/v1/attendances${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const data = await fetchSeamlessHRData<SeamlessHRAttendanceResponse>(endpoint);
  
  // Handle response structure
  if (data && typeof data === 'object') {
    // If response already has the expected structure
    if ('message' in data && 'data' in data) {
      return data as SeamlessHRAttendanceResponse;
    }
    // If data is directly the array
    if (Array.isArray(data)) {
      return {
        message: 'Successfully fetched attendance records',
        data: data as SeamlessHRAttendanceRecord[],
      };
    }
    // If data is nested
    if ('data' in data && Array.isArray((data as { data: unknown[]; message?: string }).data)) {
      const nestedData = data as { data: SeamlessHRAttendanceRecord[]; message?: string };
      return {
        message: nestedData.message || 'Successfully fetched attendance records',
        data: nestedData.data,
      };
    }
  }
  
  return {
    message: 'Successfully fetched attendance records',
    data: [],
  };
}

/**
 * Get Employee Birthdays Query Parameters
 */
export interface GetBirthdaysParams {
  filterBy?: 'today' | 'this-month'; // Filter by time period (default: 'this-month')
}

/**
 * Get employee birthdays from Seamless HR
 * 
 * @param params Query parameters for filtering birthdays
 * @returns Employee birthdays data
 * 
 * @example
 * // Get birthdays for this month
 * const birthdays = await getSeamlessHRBirthdays();
 * 
 * @example
 * // Get birthdays for today
 * const birthdays = await getSeamlessHRBirthdays({ filterBy: 'today' });
 */
export async function getSeamlessHRBirthdays(params?: GetBirthdaysParams): Promise<unknown> {
  const queryParams = new URLSearchParams();
  
  if (params?.filterBy) {
    queryParams.append('filterBy', params.filterBy);
  }
  
  const endpoint = `/v1/employees/birthdays${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return fetchSeamlessHRData(endpoint);
}

/**
 * Get single employee by staff ID
 * 
 * @param staffId The staff ID of the employee
 * @returns Employee data
 * 
 * @example
 * const employee = await getSeamlessHREmployeeById('EMP001');
 */
export async function getSeamlessHREmployeeById(staffId: string): Promise<SeamlessHREmployee | null> {
  try {
    const data = await fetchSeamlessHRData<SeamlessHREmployee | { data: SeamlessHREmployee }>(`/v1/employees/${staffId}`);
    
    if (data && typeof data === 'object') {
      if ('data' in data) {
        return (data as { data: SeamlessHREmployee }).data;
      }
      return data as SeamlessHREmployee;
    }
    
    return null;
  } catch (error) {
    console.error(`Failed to get employee ${staffId}:`, error);
    return null;
  }
}

/**
 * Add Employee Request Body
 */
export interface AddEmployeeRequest {
  entity?: string; // Company name (default: "Company")
  employee_code?: string; // Employee code
  email: string; // Employee email (required)
  first_name: string; // First name (required)
  last_name: string; // Last name (required)
  other_names?: string; // Other names
  mobile_code?: string; // Country dialing code (required)
  phone_number: string; // Phone number (required)
  gender?: string; // Gender
  contract_type?: string; // Contract type (e.g., "Full Time")
  region: string; // Region (required)
  branch?: string; // Branch
  job_role: string; // Job role (required)
  cost_center?: string; // Cost center
  pay_grade: string; // Pay grade (required)
  gross_salary?: string; // Gross salary (required if payroll module subscribed)
  start_date: string; // Start date (required, format: DD-MM-YYYY)
  end_date?: string | null; // End date (required if contract_type has end date)
  line_manager?: string; // Line manager staff ID
  remarks?: string; // Remarks
}

/**
 * Add a new employee to Seamless HR
 * 
 * @param employeeData Employee data to create
 * @returns Created employee data
 * 
 * @example
 * const newEmployee = await addSeamlessHREmployee({
 *   email: 'john.doe@company.com',
 *   first_name: 'John',
 *   last_name: 'Doe',
 *   phone_number: '08033442549',
 *   mobile_code: '+234',
 *   region: 'Lagos',
 *   job_role: 'Software Engineer',
 *   pay_grade: 'Grade 5',
 *   start_date: '17-10-2024'
 * });
 */
export async function addSeamlessHREmployee(employeeData: AddEmployeeRequest): Promise<unknown> {
  return fetchSeamlessHRData('/v1/employees', {
    method: 'POST',
    body: employeeData,
  });
}

/**
 * Update Employee Request Body
 */
export interface UpdateEmployeeRequest {
  staffId?: string; // Only required if changing staff ID
  email?: string;
  first_name?: string;
  last_name?: string;
  other_names?: string;
  phone?: string;
  marital_status?: string;
  religion?: string;
  date_of_birth?: string;
  ethnic_group?: string;
  alternate_email?: string;
  alternate_phone?: string;
  place_of_birth?: string;
  supervisor?: string; // Staff ID of line manager/supervisor
  location?: string; // Branch (must exist on system)
  employment_date?: string; // Format: Y-m-d
  gender?: string;
  contract_type?: string; // If has expiry, end_date (Y-m-d) becomes required
  region?: string;
  pay_grade?: string;
  cost_center?: string;
}

/**
 * Update an employee in Seamless HR
 * 
 * @param staffId The staff ID of the employee to update
 * @param employeeData Employee data to update
 * @returns Updated employee data
 * 
 * @example
 * const updated = await updateSeamlessHREmployee('EMP001', {
 *   email: 'newemail@company.com',
 *   first_name: 'John',
 *   last_name: 'Smith'
 * });
 */
export async function updateSeamlessHREmployee(staffId: string, employeeData: UpdateEmployeeRequest): Promise<unknown> {
  return fetchSeamlessHRData(`/v1/employees/${staffId}`, {
    method: 'POST',
    body: employeeData,
  });
}

/**
 * Get Holidays Query Parameters
 */
export interface GetHolidaysParams {
  filterBy?: 'today' | 'this-week' | 'this-month' | 'till-year-end'; // Filter by time period (default: 'today')
  employee_code?: string; // Employee code (default: 'Employee001')
}

/**
 * Get holidays from Seamless HR
 * 
 * @param params Query parameters for filtering holidays
 * @returns Holidays data
 * 
 * @example
 * // Get holidays for today
 * const holidays = await getSeamlessHRHolidays();
 * 
 * @example
 * // Get holidays for this month for specific employee
 * const holidays = await getSeamlessHRHolidays({
 *   filterBy: 'this-month',
 *   employee_code: 'EMP001'
 * });
 */
export async function getSeamlessHRHolidays(params?: GetHolidaysParams): Promise<unknown> {
  const queryParams = new URLSearchParams();
  
  if (params?.filterBy) {
    queryParams.append('filterBy', params.filterBy);
  }
  
  if (params?.employee_code) {
    queryParams.append('employee_code', params.employee_code);
  }
  
  const endpoint = `/v1/employees/holidays${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return fetchSeamlessHRData(endpoint);
}

// ============================================================================
// CONTRACT TYPES
// ============================================================================

/**
 * Create Contract Type Request
 */
export interface CreateContractTypeRequest {
  contract_type_name: string; // Required
  contract_type_description: string; // Required
  company?: string; // Default: "SeamlessHR"
  contract_type_expiry?: number; // Default: 1
  time_extension?: number; // Default: 0
  approval_workflow?: string; // Default: "Contract Extension"
}

/**
 * Create a new contract type
 */
export async function createSeamlessHRContractType(data: CreateContractTypeRequest): Promise<unknown> {
  return fetchSeamlessHRData('/v1/employees/contract-types', {
    method: 'POST',
    body: data,
  });
}

/**
 * Get All Contract Types Query Parameters
 */
export interface GetContractTypesParams {
  company: string; // Required
}

/**
 * Get all contract types for a company
 */
export async function getSeamlessHRContractTypes(params: GetContractTypesParams): Promise<unknown> {
  const queryParams = new URLSearchParams();
  queryParams.append('company', params.company);
  
  const endpoint = `/v1/employees/contract-types?${queryParams.toString()}`;
  return fetchSeamlessHRData(endpoint);
}

/**
 * Get a specific contract type by name
 */
export async function getSeamlessHRContractType(contractTypeName: string, company: string): Promise<unknown> {
  const queryParams = new URLSearchParams();
  queryParams.append('company', company);
  
  const endpoint = `/v1/employees/contract-types/${contractTypeName}?${queryParams.toString()}`;
  return fetchSeamlessHRData(endpoint);
}

// ============================================================================
// EMPLOYEE ACTIONS
// ============================================================================

/**
 * Activate an employee
 */
export async function activateSeamlessHREmployee(employeeCode: string): Promise<unknown> {
  return fetchSeamlessHRData(`/v1/employees/activate/${employeeCode}`, {
    method: 'POST',
  });
}

/**
 * Deactivate an employee
 */
export async function deactivateSeamlessHREmployee(employeeCode: string): Promise<unknown> {
  return fetchSeamlessHRData(`/v1/employees/deactivate/${employeeCode}`, {
    method: 'POST',
  });
}

/**
 * Exit Employee Request
 */
export interface ExitEmployeeRequest {
  exit_date: string; // Required (format: YYYY-MM-DD)
  exit_remark: string; // Required
}

/**
 * Exit an employee from the organization
 */
export async function exitSeamlessHREmployee(employeeCode: string, data: ExitEmployeeRequest): Promise<unknown> {
  return fetchSeamlessHRData(`/v1/employees/exit/${employeeCode}`, {
    method: 'POST',
    body: data,
  });
}

// ============================================================================
// DEPARTMENTS
// ============================================================================

/**
 * Get all company departments
 */
export async function getSeamlessHRDepartments(company: string): Promise<unknown> {
  const queryParams = new URLSearchParams();
  queryParams.append('company', company);
  
  const endpoint = `/v1/companies/departments?${queryParams.toString()}`;
  return fetchSeamlessHRData(endpoint);
}

/**
 * Create Department Request
 */
export interface CreateDepartmentRequest {
  name: string; // Required
  tag: string; // Required (default: "department")
  description?: string;
  parent?: string;
  hod?: string; // Head of Department employee code
  department_code?: string;
  is_regional?: boolean; // Default: false
  company: string; // Required
}

/**
 * Create a new department
 */
export async function createSeamlessHRDepartment(data: CreateDepartmentRequest): Promise<unknown> {
  return fetchSeamlessHRData('/v1/companies/departments', {
    method: 'POST',
    body: data,
  });
}

/**
 * Update Department Request
 */
export interface UpdateDepartmentRequest {
  name: string; // Required
  tag: string; // Required
  description?: string;
  parent_id?: number;
  hod?: string;
  department_code?: string;
  is_regional?: boolean;
  company?: string;
}

/**
 * Update a department
 */
export async function updateSeamlessHRDepartment(departmentName: string, data: UpdateDepartmentRequest): Promise<unknown> {
  return fetchSeamlessHRData(`/v1/companies/departments/${encodeURIComponent(departmentName)}`, {
    method: 'PATCH',
    body: data,
  });
}

/**
 * Delete a department
 */
export async function deleteSeamlessHRDepartment(departmentName: string, company: string): Promise<unknown> {
  const queryParams = new URLSearchParams();
  queryParams.append('company', company);
  
  return fetchSeamlessHRData(`/v1/companies/departments/${encodeURIComponent(departmentName)}?${queryParams.toString()}`, {
    method: 'DELETE',
  });
}

// ============================================================================
// JOB ROLES
// ============================================================================

/**
 * Get all company job roles
 */
export async function getSeamlessHRJobRoles(company: string): Promise<unknown> {
  const queryParams = new URLSearchParams();
  queryParams.append('company', company);
  
  const endpoint = `/v1/companies/job_roles?${queryParams.toString()}`;
  return fetchSeamlessHRData(endpoint);
}

/**
 * Create Job Role Request
 */
export interface CreateJobRoleRequest {
  name: string; // Required
  description: string; // Required
  job_family: string; // Required
  department: string; // Required
  job_role_code?: string;
  pay_grades: string[]; // Required - array of pay grade names
  company?: string;
}

/**
 * Create a new job role
 */
export async function createSeamlessHRJobRole(data: CreateJobRoleRequest): Promise<unknown> {
  return fetchSeamlessHRData('/v1/companies/job_roles', {
    method: 'POST',
    body: data,
  });
}

/**
 * Update Job Role Request
 */
export interface UpdateJobRoleRequest {
  name: string; // Required
  description: string; // Required
  job_family: string; // Required
  department: string; // Required
  job_role_code?: string;
  pay_grades: string[]; // Required
  company: string; // Required
}

/**
 * Update a job role
 */
export async function updateSeamlessHRJobRole(jobRoleName: string, data: UpdateJobRoleRequest): Promise<unknown> {
  return fetchSeamlessHRData(`/v1/companies/job_roles/${encodeURIComponent(jobRoleName)}`, {
    method: 'PATCH',
    body: data,
  });
}