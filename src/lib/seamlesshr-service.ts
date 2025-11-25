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
  return fetchSeamlessHRData('/v1/companies/departments');
}

/**
 * Fetch branches from Seamless HR
 */
export async function getSeamlessHRBranches(): Promise<any> {
  return fetchSeamlessHRData('/v1/companies/branches');
}

/**
 * Fetch job roles from Seamless HR
 */
export async function getSeamlessHRJobRoles(): Promise<any> {
  return fetchSeamlessHRData('/v1/companies/job-roles');
}

/**
 * Fetch company info from Seamless HR
 */
export async function getSeamlessHRCompanyInfo(): Promise<any> {
  return fetchSeamlessHRData('/v1/companies');
}

/**
 * Fetch leave requests from Seamless HR
 */
export async function getSeamlessHRLeaveData(): Promise<any> {
  return fetchSeamlessHRData('/v1/leave-requests');
}

/**
 * Fetch performance cycles from Seamless HR
 */
export async function getSeamlessHRPerformanceData(): Promise<any> {
  return fetchSeamlessHRData('/v1/performance/cycles');
}

/**
 * Fetch payroll data from Seamless HR
 */
export async function getSeamlessHRPayrollData(): Promise<any> {
  return fetchSeamlessHRData('/v1/payroll');
}
