# SeamlessHR Attendance Records API - Usage Guide

## Overview

The attendance records endpoint allows you to retrieve attendance data for all employees with flexible filtering options.

**Endpoint**: `GET /v1/attendances`  
**Base URL**: `https://api-sandbox.seamlesshr.app`

## Quick Start

```typescript
import { getSeamlessHRAttendanceRecords } from '@/lib/seamlesshr-service';

// Get first page with default settings (10 records)
const records = await getSeamlessHRAttendanceRecords();
console.log(records.data); // Array of attendance records
```

## Query Parameters

### Basic Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number of results |
| `perPage` | number | 10 | Number of records per page |
| `search` | string | - | Filter by employee name (matches first or last name) |

### Schedule Type Filter

| Parameter | Type | Options | Description |
|-----------|------|---------|-------------|
| `scheduleType` | string | `'ROTATIONAL'` or `'FULLTIME'` | Filter by schedule type |

### Date Filtering

| Parameter | Type | Options | Description |
|-----------|------|---------|-------------|
| `dateType` | string | `'week'`, `'month'`, `'custom'` | Type of date filter |
| `startDate` | string | - | Required when `dateType` is `'custom'` (format: `YYYY-MM-DD`) |
| `endDate` | string | - | Required when `dateType` is `'custom'` (format: `YYYY-MM-DD`) |

**Date Type Behavior:**
- `'week'`: Returns records from start to end of current week
- `'month'`: Returns records from start to end of current month
- `'custom'`: Requires `startDate` and `endDate` parameters

## Usage Examples

### Example 1: Get Default Records

```typescript
// Get first 10 records
const response = await getSeamlessHRAttendanceRecords();
console.log(response.message); // "Successfully fetched attendance records"
console.log(response.data.length); // 10 (or less)
```

### Example 2: Pagination

```typescript
// Get page 2 with 20 records per page
const response = await getSeamlessHRAttendanceRecords({
  page: 2,
  perPage: 20
});
```

### Example 3: Search by Employee Name

```typescript
// Search for employees named "John"
const response = await getSeamlessHRAttendanceRecords({
  search: 'John'
});
```

### Example 4: Filter by Schedule Type

```typescript
// Get only full-time employees
const response = await getSeamlessHRAttendanceRecords({
  scheduleType: 'FULLTIME'
});

// Get only rotational employees
const response = await getSeamlessHRAttendanceRecords({
  scheduleType: 'ROTATIONAL'
});
```

### Example 5: Get Current Week Records

```typescript
// Get attendance records for current week
const response = await getSeamlessHRAttendanceRecords({
  dateType: 'week'
});
```

### Example 6: Get Current Month Records

```typescript
// Get attendance records for current month
const response = await getSeamlessHRAttendanceRecords({
  dateType: 'month'
});
```

### Example 7: Custom Date Range

```typescript
// Get records for a specific date range
const response = await getSeamlessHRAttendanceRecords({
  dateType: 'custom',
  startDate: '2024-01-01',
  endDate: '2024-01-31'
});
```

### Example 8: Combined Filters

```typescript
// Get full-time employees named "John" for current month, page 1, 50 per page
const response = await getSeamlessHRAttendanceRecords({
  search: 'John',
  scheduleType: 'FULLTIME',
  dateType: 'month',
  page: 1,
  perPage: 50
});
```

## Response Structure

```typescript
interface SeamlessHRAttendanceResponse {
  message: string;
  data: SeamlessHRAttendanceRecord[];
}

interface SeamlessHRAttendanceRecord {
  firstName: string;
  lastName: string;
  employeeCode: string;
  attendanceId: string | null;
  scheduleType: 'ROTATIONAL' | 'FULLTIME';
  setClockInDateTime: string; // ISO 8601 format
  setClockOutDateTime: string; // ISO 8601 format
  clockInDateTime: string | null; // ISO 8601 format or null
  clockOutDateTime: string | null; // ISO 8601 format or null
  breakStartTime: string | null; // ISO 8601 format or null
  breakEndTime: string | null; // ISO 8601 format or null
  clockInSource: string; // e.g., "AUTO"
  clockOutSource: string; // e.g., "AUTO"
  punctualityStatus: string; // e.g., "ABSENT", "ON_TIME", "LATE"
}
```

## Example Response

```json
{
  "message": "Successfully fetched attendance record",
  "data": [
    {
      "firstName": "Adeoye",
      "lastName": "Michael",
      "employeeCode": "Adeoye",
      "attendanceId": "0122",
      "scheduleType": "FULLTIME",
      "setClockInDateTime": "2024-11-26T09:00:00.000Z",
      "setClockOutDateTime": "2024-11-26T17:00:00.000Z",
      "clockInDateTime": null,
      "clockOutDateTime": null,
      "breakStartTime": null,
      "breakEndTime": null,
      "clockInSource": "AUTO",
      "clockOutSource": "AUTO",
      "punctualityStatus": "ABSENT"
    }
  ]
}
```

## Error Handling

```typescript
try {
  const response = await getSeamlessHRAttendanceRecords({
    dateType: 'custom',
    startDate: '2024-01-01',
    endDate: '2024-01-31'
  });
  
  console.log(`Found ${response.data.length} attendance records`);
} catch (error) {
  if (error instanceof Error) {
    console.error('Error fetching attendance:', error.message);
    // Error: startDate and endDate are required when dateType is "custom"
  }
}
```

## Integration with Dashboard

The attendance endpoint is automatically available through:
1. **API Integration Manager** - Can be configured as an endpoint
2. **AI Assistant** - Can query attendance data if user has access
3. **Custom Components** - Use the service function directly

## Role-Based Access

The attendance endpoint is accessible to:
- **CEO**: Full access
- **HR Manager**: Full access
- **CFO**: Read-only access (attendance summary)
- **CTO**: Read-only access (attendance summary)

## Migration

Run the migration to update the endpoint URL:

```bash
# The migration file: supabase/migrations/20251122000000_update_attendance_endpoint.sql
# Updates the attendance endpoint to use the correct URL: /v1/attendances
```

## Notes

- All date/time fields are in ISO 8601 format (UTC)
- `null` values indicate that the action hasn't occurred yet (e.g., no clock-in)
- `punctualityStatus` can be: `"ABSENT"`, `"ON_TIME"`, `"LATE"`, etc.
- The API uses sandbox URL: `https://api-sandbox.seamlesshr.app`
- Authentication uses `x-client-id` and `x-client-secret` headers

