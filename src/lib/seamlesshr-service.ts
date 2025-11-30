/**
 * Service for interacting with Seamless HR API
 */

const SEAMLESSHR_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/seamlesshr-api`;
const DEFAULT_COMPANY = 'Integration Company';

export interface SeamlessHREmployee {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  other_names?: string;
  email: string;
  phone_number?: string;
  gender?: string;
  department?: string;
  job_role?: string;
  position?: string;
  status: string;
  employment_date?: string;
  hireDate?: string;
  is_active?: boolean;
  is_exited?: boolean;
  company_id?: string;
  [key: string]: any;
}

export interface SeamlessHRResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface SeamlessHRDepartment {
  id: number;
  name: string;
  description?: string;
  tag?: string;
  parent?: string;
  hod?: string;
  department_code?: string;
  is_regional?: boolean;
  [key: string]: any;
}

export interface SeamlessHRJobRole {
  id: number;
  name: string;
  description?: string;
  job_family?: string;
  department?: string;
  job_role_code?: string;
  pay_grades?: string[];
  [key: string]: any;
}

export interface SeamlessHRLeavePolicy {
  id: number;
  name: string;
  description?: string;
  config?: {
    is_splitable?: boolean;
    is_accrued?: boolean;
    is_prorated?: boolean;
    is_public?: boolean;
    eligible_gender?: string;
    pay_type?: string;
    is_tied_to_allowance?: number;
  };
  [key: string]: any;
}

export interface SeamlessHRLeaveRequest {
  id: number;
  start_date: string;
  end_date: string;
  status: string;
  resumption_date?: string;
  recall_date?: string | null;
  reason?: string | null;
  employee?: SeamlessHREmployee;
  leave_policy?: SeamlessHRLeavePolicy;
  [key: string]: any;
}

export interface SeamlessHRLeaveBalance {
  label: string;
  balance: {
    days_taken: number;
    days_left: number;
    total_balance: number;
    available_balance: number;
  };
  employee?: SeamlessHREmployee;
}

export interface SeamlessHRPerformanceCycle {
  id: number;
  title: string;
  description?: string;
  appraisal_year: string;
  start_date: string;
  end_date: string;
  mode?: string;
  performance_mode?: string;
  [key: string]: any;
}

/**
 * Fetch data from Seamless HR API
 */
export async function fetchSeamlessHRData<T>(endpoint: string): Promise<T> {
  try {
    console.log('Fetching Seamless HR data:', endpoint);
    
    const response = await fetch(SEAMLESSHR_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ endpoint }),
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

// ==================== EMPLOYEE ENDPOINTS ====================

/**
 * Fetch all employees from Seamless HR
 * @param params Query parameters for filtering employees
 */
export async function getSeamlessHREmployees(params?: {
  company?: string;
  date?: string;
  limit?: number;
  status?: string;
  can_login?: boolean;
  employment_date?: [string, string];
  exit_status?: boolean;
  exit_date?: [string, string];
  page?: number;
}): Promise<SeamlessHREmployee[]> {
  const queryParams = new URLSearchParams();
  
  if (params?.company) queryParams.append('company', params.company);
  if (params?.date) queryParams.append('date', params.date);
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.status) queryParams.append('status', params.status);
  if (params?.can_login !== undefined) queryParams.append('can_login', params.can_login.toString());
  if (params?.employment_date) {
    queryParams.append('employment_date[]', params.employment_date[0]);
    queryParams.append('employment_date[]', params.employment_date[1]);
  }
  if (params?.exit_status !== undefined) queryParams.append('exit_status', params.exit_status.toString());
  if (params?.exit_date) {
    queryParams.append('exit_date[]', params.exit_date[0]);
    queryParams.append('exit_date[]', params.exit_date[1]);
  }
  if (params?.page) queryParams.append('page', params.page.toString());
  
  const endpoint = `/v1/employees${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const data = await fetchSeamlessHRData<any>(endpoint);
  
  // Transform the API response to match our interface
  if (Array.isArray(data)) {
    return data;
  } else if (data.data && Array.isArray(data.data)) {
    return data.data;
  } else if (data.employees && Array.isArray(data.employees)) {
    return data.employees;
  }
  
  return [];
}

/**
 * Get a single employee by staff ID
 */
export async function getSeamlessHREmployee(staffId: string): Promise<SeamlessHREmployee | null> {
  try {
    const data = await fetchSeamlessHRData<any>(`/v1/employees/${staffId}`);
    return data.data || data;
  } catch (error) {
    console.error('Failed to get employee:', error);
    return null;
  }
}

/**
 * Get employee birthdays
 */
export async function getSeamlessHRBirthdays(filterBy: 'today' | 'this-month' = 'this-month'): Promise<any> {
  return fetchSeamlessHRData(`/v1/employees/birthdays?filterBy=${filterBy}`);
}

/**
 * Get employee holidays
 */
export async function getSeamlessHRHolidays(params?: {
  filterBy?: 'today' | 'this-week' | 'this-month' | 'till-year-end';
  employee_code?: string;
}): Promise<any> {
  const queryParams = new URLSearchParams();
  if (params?.filterBy) queryParams.append('filterBy', params.filterBy);
  if (params?.employee_code) queryParams.append('employee_code', params.employee_code);
  
  const endpoint = `/v1/employees/holidays${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return fetchSeamlessHRData(endpoint);
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

// ==================== COMPANY/DEPARTMENT ENDPOINTS ====================

/**
 * Fetch departments from Seamless HR
 */
export async function getSeamlessHRDepartments(company: string = DEFAULT_COMPANY): Promise<SeamlessHRDepartment[]> {
  const data = await fetchSeamlessHRData<any>(`/v1/companies/departments?company=${encodeURIComponent(company)}`);
  
  if (Array.isArray(data)) {
    return data;
  } else if (data.data && Array.isArray(data.data)) {
    return data.data;
  }
  
  return [];
}

/**
 * Fetch branches from Seamless HR
 * Note: Branches endpoint not found in official API documentation
 */
export async function getSeamlessHRBranches(company: string = DEFAULT_COMPANY): Promise<any> {
  return fetchSeamlessHRData(`/v1/companies/branches?company=${encodeURIComponent(company)}`);
}

/**
 * Fetch job roles from Seamless HR
 */
export async function getSeamlessHRJobRoles(company: string = DEFAULT_COMPANY): Promise<SeamlessHRJobRole[]> {
  const data = await fetchSeamlessHRData<any>(`/v1/companies/job_roles?company=${encodeURIComponent(company)}`);
  
  if (Array.isArray(data)) {
    return data;
  } else if (data.data && Array.isArray(data.data)) {
    return data.data;
  }
  
  return [];
}

/**
 * Get all contract types
 */
export async function getSeamlessHRContractTypes(company: string = DEFAULT_COMPANY): Promise<any> {
  return fetchSeamlessHRData(`/v1/employees/contract-types?company=${encodeURIComponent(company)}`);
}

/**
 * Get specific contract type
 */
export async function getSeamlessHRContractType(contractTypeName: string, company: string = DEFAULT_COMPANY): Promise<any> {
  return fetchSeamlessHRData(`/v1/employees/contract-types/${encodeURIComponent(contractTypeName)}?company=${encodeURIComponent(company)}`);
}

// ==================== LEAVE ENDPOINTS ====================

/**
 * Get employee leave balance
 */
export async function getSeamlessHRLeaveBalance(params: {
  leave_type: string;
  company: string;
  employee_code: string;
  year?: string;
}): Promise<SeamlessHRLeaveBalance> {
  const queryParams = new URLSearchParams();
  queryParams.append('leave_type', params.leave_type);
  queryParams.append('company', params.company);
  queryParams.append('employee_code', params.employee_code);
  if (params.year) queryParams.append('year', params.year);
  
  const data = await fetchSeamlessHRData<any>(`/v1/leave/balance?${queryParams.toString()}`);
  return data.data || data;
}

/**
 * Fetch leave requests from Seamless HR
 */
export async function getSeamlessHRLeaveRequests(params?: {
  company?: string;
  status?: 'PENDING' | 'ON LEAVE' | 'UPCOMING LEAVE' | 'ON LEAVE TODAY';
  employee_code?: string;
}): Promise<SeamlessHRLeaveRequest[]> {
  const queryParams = new URLSearchParams();
  const company = params?.company || DEFAULT_COMPANY;
  
  queryParams.append('company', company);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.employee_code) queryParams.append('employee_code', params.employee_code);
  
  const data = await fetchSeamlessHRData<any>(`/v1/leave/requests?${queryParams.toString()}`);
  
  if (Array.isArray(data)) {
    return data;
  } else if (data.data && Array.isArray(data.data)) {
    return data.data;
  }
  
  return [];
}

/**
 * Fetch leave policies from Seamless HR
 */
export async function getSeamlessHRLeavePolicies(params?: {
  company?: string;
  sort?: 'asc' | 'desc';
  search?: string;
  gender?: string;
}): Promise<SeamlessHRLeavePolicy[]> {
  const queryParams = new URLSearchParams();
  const company = params?.company || DEFAULT_COMPANY;
  
  queryParams.append('company', company);
  if (params?.sort) queryParams.append('sort', params.sort);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.gender) queryParams.append('gender', params.gender);
  
  const data = await fetchSeamlessHRData<any>(`/v1/leave/policies?${queryParams.toString()}`);
  
  if (Array.isArray(data)) {
    return data;
  } else if (data.data && Array.isArray(data.data)) {
    return data.data;
  }
  
  return [];
}

/**
 * Get employees on leave
 */
export async function getSeamlessHREmployeesOnLeave(params: {
  company: string;
  department?: string;
  department_tag?: 'department' | 'directorate' | 'division' | 'unit';
  date_range?: 'today' | 'yesterday' | 'this_week' | 'last_week' | 'next_week' | 'this_month' | 'last_month' | 'next_month';
}): Promise<any> {
  const queryParams = new URLSearchParams();
  queryParams.append('company', params.company);
  if (params.department) queryParams.append('department', params.department);
  if (params.department_tag) queryParams.append('department_tag', params.department_tag);
  if (params.date_range) queryParams.append('date_range', params.date_range);
  
  const data = await fetchSeamlessHRData<any>(`/v1/leave/employees-on-leave?${queryParams.toString()}`);
  return data.data || data;
}

// ==================== PERFORMANCE ENDPOINTS ====================

/**
 * Fetch performance cycles from Seamless HR
 */
export async function getSeamlessHRPerformanceCycles(params?: {
  q?: string;
  company_name?: string;
  appraisal_year?: string;
  start_date_from?: string;
  start_date_to?: string;
}): Promise<SeamlessHRPerformanceCycle[]> {
  const queryParams = new URLSearchParams();
  const companyName = params?.company_name || DEFAULT_COMPANY;
  
  if (params?.q) queryParams.append('q', params.q);
  queryParams.append('company_name', companyName);
  if (params?.appraisal_year) queryParams.append('appraisal_year', params.appraisal_year);
  if (params?.start_date_from) queryParams.append('start_date_from', params.start_date_from);
  if (params?.start_date_to) queryParams.append('start_date_to', params.start_date_to);
  
  const data = await fetchSeamlessHRData<any>(`/v1/performance/cycles?${queryParams.toString()}`);
  
  if (Array.isArray(data)) {
    return data;
  } else if (data.data && Array.isArray(data.data)) {
    return data.data;
  }
  
  return [];
}

/**
 * Fetch performance periods from Seamless HR
 */
export async function getSeamlessHRPerformancePeriods(params: {
  appraisal_cycle: string;
  company_name: string;
}): Promise<any> {
  const queryParams = new URLSearchParams();
  queryParams.append('appraisal_cycle', params.appraisal_cycle);
  queryParams.append('company_name', params.company_name);
  
  return fetchSeamlessHRData(`/v1/performance/periods?${queryParams.toString()}`);
}

/**
 * Alias for performance cycles (backward compatibility)
 */
export async function getSeamlessHRPerformanceData(): Promise<any> {
  return getSeamlessHRPerformanceCycles({ company_name: DEFAULT_COMPANY });
}

// ==================== PAYROLL ENDPOINTS ====================

/**
 * Fetch payroll ledger transactions from Seamless HR
 * @param label - Payroll cycle label (e.g., "June 2024")
 * @param entity - Company name
 * @param batch - Batch number (defaults to 1)
 * @param group_by - Group results by: employee | cost_center | branch
 * @param q - Filter by specific cost_center or branch (when group_by is set)
 */
export async function getSeamlessHRPayrollData(params?: {
  label?: string;
  entity?: string;
  batch?: number;
  group_by?: 'employee' | 'cost_center' | 'branch';
  q?: string;
}): Promise<any> {
  const queryParams = new URLSearchParams();
  const label = params?.label || 'June 2024';
  const entity = params?.entity || DEFAULT_COMPANY;
  const batch = params?.batch || 1;
  
  queryParams.append('label', label);
  queryParams.append('entity', entity);
  queryParams.append('batch', batch.toString());
  if (params?.group_by) queryParams.append('group_by', params.group_by);
  if (params?.q) queryParams.append('q', params.q);
  
  return fetchSeamlessHRData(`/v1/payroll/ledger-transactions?${queryParams.toString()}`);
}

// ==================== ATTENDANCE ENDPOINTS ====================

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
 * Alias for leave requests (backward compatibility)
 * @deprecated Use getSeamlessHRLeaveRequests instead
 */
export async function getSeamlessHRLeaveData(): Promise<any> {
  return getSeamlessHRLeaveRequests({ status: 'ON LEAVE' });
}