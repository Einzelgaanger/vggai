# VGG Platform Architecture

## Overview

This platform is designed for **VGG Holdings (Parent Company)** to monitor and manage data from multiple **child companies**.

## Company Structure

```
VGG Holdings (Parent Company)
├── All users work here
└── Accesses data from:
    ├── Seamless HR (Child Company - Live API)
    └── Kleva HR (Child Company - Mock Data)
```

## Key Concepts

### 1. Parent Company (VGG Holdings)
- ALL users are VGG Holdings employees
- Users have different roles (CEO, CTO, HR Manager, etc.)
- Users are NOT employees of child companies

### 2. Child Companies
- **Seamless HR**: Live API integration with real credentials
- **Kleva HR**: Mock data (credentials not yet available)
- Future child companies can be added

### 3. Data Access Pattern
```
User logs in → Selects child company → Views child company data based on role
```

## User Flow

1. **Authentication**: Demo login (no real auth for now)
2. **Company Selection**: User selects which child company to view
3. **Data Display**: Dashboard shows data from selected child company
4. **Role-Based Access**: User's role determines what data they can see

## Database Structure

### Users & Roles
- `profiles`: User information (all VGG employees)
- `roles`: Available roles (CEO, CTO, HR Manager, etc.)
- `user_roles`: Links users to their roles

### Child Companies
- `companies`: Child companies (Seamless HR, Kleva HR, etc.)
- `api_endpoints`: API endpoints for each child company
- `api_credentials`: Credentials for accessing child company APIs
- `role_api_permissions`: Which roles can access which endpoints

### Access Control
- **NOT** user-to-company mapping (users don't belong to companies)
- **IS** role-to-endpoint mapping (roles determine API access)
- Users select which child company to view
- Role determines what they can see from that company

## Demo Users

All demo users work for **VGG Holdings** and have different access levels to child companies:

- **CEO/CTO/CFO**: Access to all child companies
- **HR Manager**: Access to all child companies (HR data focus)
- **Engineering Manager**: Access to Kleva HR (tech focus)
- **Sales Manager**: Access to Seamless HR only
- **Operations Manager**: Access to Seamless HR only

## API Integration

### Seamless HR (Live)
- **Type**: Real API connection
- **Auth**: Client credentials OAuth 2.0
- **Endpoint**: `https://api.seamlesshr.com/v1`
- **Data**: Real employee, payroll, attendance data

### Kleva HR (Mock)
- **Type**: Hardcoded mock data
- **Reason**: Credentials not yet available
- **Data**: Sample data for demo purposes

## Components

### ChildCompanySelector
- Dropdown to select which child company to view
- Shows accessible companies based on user's `accessibleCompanies` array
- Indicates if data is live or mock

### DashboardContent
- Main dashboard interface
- Receives `selectedChildCompany` prop
- Filters data based on selected child company

### APIDataMetrics
- Displays metrics from selected child company
- Fetches data from appropriate APIs
- Role-based filtering of what metrics to show

### AIAssistant
- AI chat interface
- Context includes selected child company
- Can query data from child company APIs

## Future Implementation

### When Kleva HR Credentials Arrive
1. Add real credentials to `api_credentials` table
2. Update API service to use live endpoint
3. Remove mock data logic
4. No code changes needed - just configuration

### Adding New Child Companies
1. Add company to `companies` table
2. Configure API endpoints in `api_endpoints`
3. Add credentials in `api_credentials`
4. Set up role permissions in `role_api_permissions`
5. Update `accessibleCompanies` for relevant users

## Security Notes

- All API credentials should be encrypted
- RLS policies ensure users only see permitted data
- Role-based access at API endpoint level
- No auth required for demo (remove for production)

## Next Steps

1. **Connect to Seamless HR**: Use real API credentials
2. **Mock Kleva HR data**: Create sample data structure
3. **Add filtering**: Filter API responses by selected child company
4. **Update AI context**: Include child company in AI queries
5. **Test all roles**: Verify access patterns work correctly
