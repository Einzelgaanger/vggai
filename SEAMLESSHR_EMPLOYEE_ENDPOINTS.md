# SeamlessHR Employee Endpoints - Complete Guide

## Overview

All SeamlessHR employee-related API endpoints have been added to the system. This includes GET, POST operations for managing employees.

## Added Endpoints

### 1. Get All Employees
**Endpoint**: `GET /v1/employees`  
**Function**: `getSeamlessHREmployees(params?)`

**Query Parameters**:
- `company` (string, optional) - Filter by company
- `date` (string, optional) - Filter by creation date (YYYY-MM-DD)
- `limit` (number, optional, default: 10) - Limit records
- `status` ('active' | 'inactive', optional) - Filter by status
- `can_login` (boolean, optional) - Filter by login capability
- `employment_date` (string[], optional) - Filter by employment date range
- `exit_status` (boolean, optional) - Filter by exit status
- `exit_date` (string[], optional) - Filter by exit date range
- `page` (number, optional, default: 1) - Page number

**Example**:
```typescript
import { getSeamlessHREmployees } from '@/lib/seamlesshr-service';

// Get all active employees
const employees = await getSeamlessHREmployees({
  status: 'active',
  limit: 50,
  page: 1
});

// Get employees with employment date filter
const employees = await getSeamlessHREmployees({
  employment_date: ['2025-02-01', '2025-03-31'],
  status: 'active'
});
```

---

### 2. Get Employee Birthdays
**Endpoint**: `GET /v1/employees/birthdays`  
**Function**: `getSeamlessHRBirthdays(params?)`

**Query Parameters**:
- `filterBy` ('today' | 'this-month', optional, default: 'this-month')

**Example**:
```typescript
import { getSeamlessHRBirthdays } from '@/lib/seamlesshr-service';

// Get birthdays for this month
const birthdays = await getSeamlessHRBirthdays();

// Get birthdays for today
const birthdays = await getSeamlessHRBirthdays({ filterBy: 'today' });
```

---

### 3. Get Single Employee
**Endpoint**: `GET /v1/employees/{staff_id}`  
**Function**: `getSeamlessHREmployeeById(staffId)`

**Path Parameters**:
- `staff_id` (string, required) - Employee staff ID

**Example**:
```typescript
import { getSeamlessHREmployeeById } from '@/lib/seamlesshr-service';

const employee = await getSeamlessHREmployeeById('EMP001');
```

---

### 4. Add Employee
**Endpoint**: `POST /v1/employees`  
**Function**: `addSeamlessHREmployee(employeeData)`

**Required Fields**:
- `email` (string) - Employee email
- `first_name` (string) - First name
- `last_name` (string) - Last name
- `phone_number` (string) - Phone number
- `region` (string) - Region
- `job_role` (string) - Job role
- `pay_grade` (string) - Pay grade
- `start_date` (string) - Start date (format: DD-MM-YYYY)

**Optional Fields**:
- `entity` (string, default: "Company") - Company name
- `employee_code` (string) - Employee code
- `other_names` (string) - Other names
- `mobile_code` (string) - Country dialing code
- `gender` (string) - Gender
- `contract_type` (string) - Contract type
- `branch` (string) - Branch
- `cost_center` (string) - Cost center
- `gross_salary` (string) - Gross salary (required if payroll module subscribed)
- `end_date` (string | null) - End date (required if contract_type has end date)
- `line_manager` (string) - Line manager staff ID
- `remarks` (string) - Remarks

**Example**:
```typescript
import { addSeamlessHREmployee } from '@/lib/seamlesshr-service';

const newEmployee = await addSeamlessHREmployee({
  email: 'john.doe@company.com',
  first_name: 'John',
  last_name: 'Doe',
  phone_number: '08033442549',
  mobile_code: '+234',
  region: 'Lagos',
  job_role: 'Software Engineer',
  pay_grade: 'Grade 5',
  start_date: '17-10-2024',
  gender: 'Male',
  contract_type: 'Full Time',
  branch: 'Lagos'
});
```

---

### 5. Update Employee
**Endpoint**: `POST /v1/employees/{staff_id}`  
**Function**: `updateSeamlessHREmployee(staffId, employeeData)`

**Path Parameters**:
- `staff_id` (string, required) - Employee staff ID

**Body Parameters** (all optional):
- `staffId` (string) - Only required if changing staff ID
- `email` (string)
- `first_name` (string)
- `last_name` (string)
- `other_names` (string)
- `phone` (string)
- `marital_status` (string)
- `religion` (string)
- `date_of_birth` (string)
- `ethnic_group` (string)
- `alternate_email` (string)
- `alternate_phone` (string)
- `place_of_birth` (string)
- `supervisor` (string) - Staff ID of line manager
- `location` (string) - Branch (must exist on system)
- `employment_date` (string) - Format: Y-m-d
- `gender` (string)
- `contract_type` (string) - If has expiry, end_date (Y-m-d) becomes required
- `region` (string)
- `pay_grade` (string)
- `cost_center` (string)

**Example**:
```typescript
import { updateSeamlessHREmployee } from '@/lib/seamlesshr-service';

const updated = await updateSeamlessHREmployee('EMP001', {
  email: 'newemail@company.com',
  first_name: 'John',
  last_name: 'Smith',
  phone: '08012345678'
});
```

---

### 6. Get Holidays
**Endpoint**: `GET /v1/employees/holidays`  
**Function**: `getSeamlessHRHolidays(params?)`

**Query Parameters**:
- `filterBy` ('today' | 'this-week' | 'this-month' | 'till-year-end', optional, default: 'today')
- `employee_code` (string, optional, default: 'Employee001')

**Example**:
```typescript
import { getSeamlessHRHolidays } from '@/lib/seamlesshr-service';

// Get holidays for today
const holidays = await getSeamlessHRHolidays();

// Get holidays for this month for specific employee
const holidays = await getSeamlessHRHolidays({
  filterBy: 'this-month',
  employee_code: 'EMP001'
});
```

---

## Database Endpoints

All endpoints have been added to the `api_endpoints` table:
- `employees_all` - Get all employees
- `employees_birthdays` - Get birthdays
- `employee_by_staff_id` - Get single employee
- `employee_add` - Add employee
- `employee_update_by_staff_id` - Update employee
- `employees_holidays` - Get holidays

## Role Permissions

- **CEO**: Full access to all endpoints (read & write)
- **HR Manager**: Full access to all endpoints (read & write)
- **Other roles**: Based on existing permissions

## Edge Function Updates

The `seamlesshr-api` edge function has been updated to support:
- GET requests (existing)
- POST requests (new) - for adding and updating employees

## TypeScript Interfaces

All functions include proper TypeScript interfaces:
- `GetEmployeesParams` - For filtering employees
- `GetBirthdaysParams` - For filtering birthdays
- `AddEmployeeRequest` - For adding employees
- `UpdateEmployeeRequest` - For updating employees
- `GetHolidaysParams` - For filtering holidays

## Usage in Components

You can now use these functions in your React components:

```typescript
import { 
  getSeamlessHREmployees,
  getSeamlessHREmployeeById,
  addSeamlessHREmployee,
  updateSeamlessHREmployee,
  getSeamlessHRBirthdays,
  getSeamlessHRHolidays
} from '@/lib/seamlesshr-service';

// In your component
const MyComponent = () => {
  const [employees, setEmployees] = useState([]);
  
  useEffect(() => {
    getSeamlessHREmployees({ status: 'active', limit: 50 })
      .then(setEmployees)
      .catch(console.error);
  }, []);
  
  // ... rest of component
};
```

## Migration

Run the migration to add endpoints to database:
```bash
# Migration file: supabase/migrations/20251122000002_add_employee_endpoints.sql
```

All endpoints are ready to use! 🚀

