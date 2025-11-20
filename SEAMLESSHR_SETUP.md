# SeamlessHR API Integration Setup Guide

## 📋 **Overview**

This guide will help you set up SeamlessHR API integration for your production system.

## 🔑 **Test Credentials**

```
x-client-id: ee23f0c5-bcdd-4aa2-bd2e-fe349bae96b0
x-client-secret: 975f7244978300e5b69849a1846ccf3bd56f1fa1d1385985da454045daee49a1
```

## 📚 **API Documentation**

- **Base URL**: `https://api.seamlesshr.com/v1`
- **Documentation**: https://docs.seamlesshr.com/reference/introduction#/

## 🚀 **Setup Steps**

### **Step 1: Run Database Migration**

The SeamlessHR endpoints have been added via migration:
```bash
# Migration file: supabase/migrations/20251112100000_seamlesshr_endpoints.sql
```

This migration:
- ✅ Adds all SeamlessHR API endpoints
- ✅ Grants access to roles (CEO, HR Manager, CFO, CTO)
- ✅ Sets up read/write permissions

### **Step 2: Add SeamlessHR Credentials**

1. **Login as Admin** (CEO or CTO)
2. Go to **Dashboard → Integrations → API Credentials**
3. Click **"Add Credential"**
4. Fill in:
   - **Role**: Select the role (e.g., CEO, HR Manager)
   - **Credential Name**: `SeamlessHR API`
   - **API Endpoint**: `https://api.seamlesshr.com/v1`
   - **Auth Type**: Select `client_credentials` or `seamlesshr`
   - **Client ID**: `ee23f0c5-bcdd-4aa2-bd2e-fe349bae96b0`
   - **Client Secret**: `975f7244978300e5b69849a1846ccf3bd56f1fa1d1385985da454045daee49a1`
5. Click **"Create Credential"**

### **Step 3: Grant Role Access**

1. Go to **Admin Dashboard → API Permissions**
2. For each role, toggle on the SeamlessHR endpoints they need:
   - **CEO**: All endpoints
   - **HR Manager**: Employees, Departments, Recruitment, Leave
   - **CFO**: Payroll, Employees
   - **CTO**: Employees, Departments

### **Step 4: Test the Integration**

1. **Login as a user with the configured role**
2. Go to **Dashboard → Overview**
3. You should see metrics pulled from SeamlessHR API
4. Go to **AI Assistant**
5. Ask: "What employees do we have?"
6. AI should fetch and analyze data from SeamlessHR

## 📊 **Available Endpoints**

### **Employees**
- `GET /v1/employees` - Get all employees
- `GET /v1/employees/{id}` - Get employee by ID
- `POST /v1/employees` - Create employee
- `PUT /v1/employees/{id}` - Update employee

### **Departments**
- `GET /v1/departments` - Get all departments
- `GET /v1/departments/{id}` - Get department by ID

### **Recruitment**
- `GET /v1/recruitment/jobs` - Get job postings
- `GET /v1/recruitment/applications` - Get applications

### **Payroll**
- `GET /v1/payroll` - Get payroll information
- `GET /v1/payroll/summary` - Get payroll summary

### **Attendance**
- `GET /v1/attendance` - Get attendance records
- `GET /v1/attendance/summary` - Get attendance summary

### **Performance**
- `GET /v1/performance/reviews` - Get performance reviews
- `GET /v1/performance/goals` - Get performance goals

### **Leave**
- `GET /v1/leave/requests` - Get leave requests
- `GET /v1/leave/balance` - Get leave balances

## 🔧 **How It Works**

### **Authentication**
SeamlessHR uses header-based authentication:
```
x-client-id: <your-client-id>
x-client-secret: <your-client-secret>
```

### **Data Flow**
1. User logs in → Gets role
2. System fetches user's API credentials for that role
3. System fetches accessible endpoints for that role
4. For each endpoint:
   - Matches credential to endpoint
   - Adds authentication headers
   - Fetches data from SeamlessHR API
5. Data is displayed in dashboard or used by AI

### **Role-Based Access**
- Each role has different endpoint access
- Credentials are stored per role
- Permissions control read/write access

## ✅ **Verification Checklist**

- [ ] Migration ran successfully
- [ ] SeamlessHR endpoints visible in Admin Panel
- [ ] Credentials added for at least one role
- [ ] Role permissions granted
- [ ] Dashboard shows data from SeamlessHR
- [ ] AI Assistant can access SeamlessHR data
- [ ] No hardcoded data in dashboard

## 🐛 **Troubleshooting**

### **"No credential found"**
- Check that credentials are added for the user's role
- Verify credential's `api_endpoint` matches SeamlessHR base URL
- Check credential is active

### **"API call failed: 401"**
- Verify client_id and client_secret are correct
- Check credentials are stored correctly
- Test credentials manually with curl/Postman

### **"No data showing"**
- Check role has endpoint permissions granted
- Verify endpoints are accessible
- Check browser console for errors
- Check Supabase function logs

## 📝 **Next Steps**

1. **Add Production Credentials**: Replace test credentials with production ones
2. **Configure More Roles**: Add credentials for all roles that need access
3. **Customize Metrics**: Update `APIDataMetrics.tsx` to show role-specific metrics
4. **Add More Endpoints**: Add any additional SeamlessHR endpoints you need

## 🎯 **Production Checklist**

- [ ] Replace test credentials with production credentials
- [ ] Enable credential encryption (pending feature)
- [ ] Set up error monitoring
- [ ] Configure rate limiting
- [ ] Add retry logic for failed API calls
- [ ] Set up logging and analytics

