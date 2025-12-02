# SeamlessHR Complete API Endpoints - Updated

## Overview

All SeamlessHR API endpoints from the updated documentation have been integrated. This includes employee management, contract types, departments, and job roles with full CRUD operations.

## ✅ All Endpoints Added

### Employee Endpoints

| Endpoint | Method | Function | Status |
|----------|--------|----------|--------|
| Get All Employees | GET | `getSeamlessHREmployees(params?)` | ✅ |
| Get Birthdays | GET | `getSeamlessHRBirthdays(params?)` | ✅ |
| Get Single Employee | GET | `getSeamlessHREmployeeById(staffId)` | ✅ |
| Add Employee | POST | `addSeamlessHREmployee(employeeData)` | ✅ |
| Update Employee | POST | `updateSeamlessHREmployee(staffId, employeeData)` | ✅ |
| Get Holidays | GET | `getSeamlessHRHolidays(params?)` | ✅ |
| Activate Employee | POST | `activateSeamlessHREmployee(employeeCode)` | ✅ NEW |
| Deactivate Employee | POST | `deactivateSeamlessHREmployee(employeeCode)` | ✅ NEW |
| Exit Employee | POST | `exitSeamlessHREmployee(employeeCode, data)` | ✅ NEW |

### Contract Types

| Endpoint | Method | Function | Status |
|----------|--------|----------|--------|
| Create Contract Type | POST | `createSeamlessHRContractType(data)` | ✅ NEW |
| Get All Contract Types | GET | `getSeamlessHRContractTypes(params)` | ✅ NEW |
| Get Contract Type | GET | `getSeamlessHRContractType(name, company)` | ✅ NEW |

### Departments

| Endpoint | Method | Function | Status |
|----------|--------|----------|--------|
| Get Departments | GET | `getSeamlessHRDepartments(company)` | ✅ UPDATED |
| Create Department | POST | `createSeamlessHRDepartment(data)` | ✅ NEW |
| Update Department | PATCH | `updateSeamlessHRDepartment(name, data)` | ✅ NEW |
| Delete Department | DELETE | `deleteSeamlessHRDepartment(name, company)` | ✅ NEW |

### Job Roles

| Endpoint | Method | Function | Status |
|----------|--------|----------|--------|
| Get Job Roles | GET | `getSeamlessHRJobRoles(company)` | ✅ UPDATED |
| Create Job Role | POST | `createSeamlessHRJobRole(data)` | ✅ NEW |
| Update Job Role | PATCH | `updateSeamlessHRJobRole(name, data)` | ✅ NEW |

## 📝 Usage Examples

### Contract Types

```typescript
import {
  createSeamlessHRContractType,
  getSeamlessHRContractTypes,
  getSeamlessHRContractType
} from '@/lib/seamlesshr-service';

// Create a contract type
await createSeamlessHRContractType({
  contract_type_name: 'Intern',
  contract_type_description: 'Contract type for interns',
  company: 'SeamlessHR',
  contract_type_expiry: 1,
  time_extension: 0,
  approval_workflow: 'Contract Extension'
});

// Get all contract types
const contractTypes = await getSeamlessHRContractTypes({ company: 'SeamlessHR' });

// Get specific contract type
const contractType = await getSeamlessHRContractType('Intern', 'SeamlessHR');
```

### Employee Actions

```typescript
import {
  activateSeamlessHREmployee,
  deactivateSeamlessHREmployee,
  exitSeamlessHREmployee
} from '@/lib/seamlesshr-service';

// Activate employee
await activateSeamlessHREmployee('Employee001');

// Deactivate employee
await deactivateSeamlessHREmployee('Employee001');

// Exit employee
await exitSeamlessHREmployee('Employee001', {
  exit_date: '2024-02-01',
  exit_remark: 'Can be rehired'
});
```

### Departments

```typescript
import {
  getSeamlessHRDepartments,
  createSeamlessHRDepartment,
  updateSeamlessHRDepartment,
  deleteSeamlessHRDepartment
} from '@/lib/seamlesshr-service';

// Get all departments
const departments = await getSeamlessHRDepartments('SeamlessHR');

// Create department
await createSeamlessHRDepartment({
  name: 'Beta',
  tag: 'department',
  description: 'Beta department',
  parent: 'Alpha',
  hod: 'EMPLOYEE002',
  department_code: 'BD123',
  is_regional: false,
  company: 'SeamlessHR'
});

// Update department
await updateSeamlessHRDepartment('Beta Department', {
  name: 'Beta',
  tag: 'department',
  description: 'Updated Beta department',
  company: 'SeamlessHR'
});

// Delete department
await deleteSeamlessHRDepartment('Beta Department', 'SeamlessHR');
```

### Job Roles

```typescript
import {
  getSeamlessHRJobRoles,
  createSeamlessHRJobRole,
  updateSeamlessHRJobRole
} from '@/lib/seamlesshr-service';

// Get all job roles
const jobRoles = await getSeamlessHRJobRoles('SeamlessHR');

// Create job role
await createSeamlessHRJobRole({
  name: 'Beta Director',
  description: 'Director Beta department',
  job_family: 'All',
  department: 'Beta department',
  pay_grades: ['Deputy Manager', 'General Manager', 'Manager'],
  company: 'SeamlessHR'
});

// Update job role
await updateSeamlessHRJobRole('Beta Director', {
  name: 'Beta Director',
  description: 'Updated Director Beta department',
  job_family: 'All',
  department: 'Beta department',
  pay_grades: ['General Manager', 'Manager'],
  company: 'SeamlessHR'
});
```

## 🔧 Technical Updates

### Edge Function
- ✅ Updated to support **PATCH** and **DELETE** methods
- ✅ All requests use sandbox URL: `https://api-sandbox.seamlesshr.app`

### Database
- ✅ All endpoints added to `api_endpoints` table
- ✅ All endpoints use sandbox URL
- ✅ CEO and HR Manager have full access to all endpoints

### TypeScript
- ✅ All functions have proper TypeScript interfaces
- ✅ Full type safety for all parameters
- ✅ Comprehensive JSDoc documentation

## 📊 Endpoint Summary

**Total Endpoints**: 20
- **GET**: 8 endpoints
- **POST**: 9 endpoints
- **PATCH**: 2 endpoints
- **DELETE**: 1 endpoint

## 🎯 Role Permissions

- **CEO**: Full access to all endpoints (read & write)
- **HR Manager**: Full access to all endpoints (read & write)
- **Other roles**: Based on existing permissions

## 🚀 Migration

Run the migration to add all endpoints:
```bash
# Migration file: supabase/migrations/20251122000003_add_all_seamlesshr_endpoints.sql
```

## ✅ All URLs Updated

All endpoints now use the **sandbox URL**:
- ✅ `https://api-sandbox.seamlesshr.app/v1/...`

## 📝 Notes

1. **URL Encoding**: Department and job role names are automatically URL-encoded when passed as path parameters
2. **Company Parameter**: Most endpoints require a `company` parameter
3. **Error Handling**: All functions include proper error handling
4. **Type Safety**: Full TypeScript support with interfaces for all request/response types

All endpoints are ready to use! 🎉

