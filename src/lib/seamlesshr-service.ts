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

/**
 * Fetch all employees from Seamless HR
 */
export async function getSeamlessHREmployees(): Promise<SeamlessHREmployee[]> {
  const data = await fetchSeamlessHRData<any>('/v1/employees');
  
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
 * Fetch departments from Seamless HR
 */
export async function getSeamlessHRDepartments(): Promise<any> {
  return fetchSeamlessHRData('/v1/companies/departments?company_name=Integration Company');
}

/**
 * Fetch branches from Seamless HR
 */
export async function getSeamlessHRBranches(): Promise<any> {
  return fetchSeamlessHRData('/v1/companies/branches?company_name=Integration Company');
}

/**
 * Fetch job roles from Seamless HR
 */
export async function getSeamlessHRJobRoles(): Promise<any> {
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