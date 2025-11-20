# Data Fetching Verification Guide

## 🔍 **How to Verify Data is Being Pulled Correctly**

### **1. AI Assistant Data Fetching**

#### **What Should Happen**:
1. User asks AI a question
2. AI function:
   - Gets user's role
   - Gets user's API credentials for that role
   - Gets accessible API endpoints for that role
   - Fetches data from each accessible endpoint using credentials
   - Includes data in AI context
   - AI responds based on that data

#### **How to Verify**:

**Step 1: Check Browser Console**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Ask AI a question
4. Look for logs like:
   ```
   Using credential Salesforce API for endpoint Get Sales Data
   Successfully fetched data from Get Sales Data: 150 items
   ```

**Step 2: Check Supabase Function Logs**
1. Go to Supabase Dashboard
2. Navigate to Edge Functions → ai-chat
3. Check Logs tab
4. Look for:
   - Credential matching logs
   - API fetch success/failure
   - Data structure logs

**Step 3: Test with Real API**
1. Configure a test API endpoint (e.g., JSONPlaceholder)
2. Add credential for a role
3. Grant that role access to the endpoint
4. Ask AI: "What data do you have access to?"
5. AI should mention the data from your API

---

### **2. Dashboard Data Fetching**

#### **What Should Happen**:
1. Dashboard loads
2. Shows role-specific metrics (hardcoded for now)
3. Charts fetch from `metrics` table (if data exists)
4. Real-time updates via Supabase subscriptions

#### **How to Verify**:

**Step 1: Check Metrics Table**
```sql
-- Check if metrics exist
SELECT * FROM metrics 
ORDER BY recorded_at DESC 
LIMIT 10;
```

**Step 2: Check Browser Console**
1. Open DevTools → Console
2. Look for:
   - "Error fetching metrics" (if no data)
   - "New metric received" (if real-time working)

**Step 3: Test Real-time Updates**
1. Insert a test metric:
   ```sql
   INSERT INTO metrics (metric_type, metric_value, metric_unit)
   VALUES ('revenue', 1000, '$');
   ```
2. Chart should update automatically

---

## 🐛 **Common Issues & Fixes**

### **Issue 1: "No credential found for endpoint"**

**Cause**: 
- No credential configured for the role
- Credential endpoint URL doesn't match API endpoint URL

**Fix**:
1. Go to Dashboard → Integrations → API Credentials
2. Add credential for the role
3. Make sure credential's `api_endpoint` matches or is a base URL of the API endpoint
4. Example:
   - Credential: `https://api.example.com/v1`
   - API Endpoint: `https://api.example.com/v1/sales` ✅ (matches)
   - API Endpoint: `https://other-api.com/data` ❌ (doesn't match)

---

### **Issue 2: "API call failed: 401"**

**Cause**: 
- Invalid credentials
- Expired token
- Wrong authentication method

**Fix**:
1. Test credential in API Credentials section
2. Verify token/key is correct
3. Check if token needs refresh (OAuth)

---

### **Issue 3: "No accessible endpoints"**

**Cause**: 
- Role has no permissions granted
- Endpoints not configured

**Fix**:
1. Go to Admin Dashboard → API Permissions
2. Toggle on endpoints for the role
3. Or use Role-Based API Access Manager in main dashboard

---

### **Issue 4: AI Says "I don't have access"**

**Cause**: 
- Role has no API credentials
- Role has no endpoint permissions
- Credentials don't match endpoints

**Fix**:
1. Check Admin Dashboard → API Permissions
2. Verify role has endpoints enabled
3. Verify role has credentials configured
4. Check credential endpoint matches API endpoint

---

## ✅ **Verification Checklist**

### **For AI Assistant**:
- [ ] User has a role assigned
- [ ] Role has API credentials configured
- [ ] Role has API endpoints with access granted
- [ ] Credential endpoint matches API endpoint URL
- [ ] Credentials are valid (test them)
- [ ] API endpoint is accessible (test manually)
- [ ] Browser console shows successful fetches
- [ ] AI mentions data from APIs in responses

### **For Dashboard**:
- [ ] Metrics table has data (or shows empty state)
- [ ] Charts render (even if empty)
- [ ] Real-time subscription works (if metrics exist)
- [ ] Role-specific metrics display correctly
- [ ] No console errors

---

## 🧪 **Test Scenarios**

### **Test 1: Basic API Fetch**
1. Create test endpoint: `https://jsonplaceholder.typicode.com/posts`
2. Add credential: Bearer token (not needed for this API)
3. Grant role access
4. Ask AI: "What posts do you see?"
5. **Expected**: AI lists posts from API

### **Test 2: Multiple Endpoints**
1. Configure 2-3 endpoints for a role
2. Ask AI: "What data sources do you have?"
3. **Expected**: AI mentions all accessible endpoints

### **Test 3: Role Isolation**
1. Configure different endpoints for CEO vs Developer
2. Login as CEO, ask about data
3. Login as Developer, ask about same data
4. **Expected**: Different responses based on role access

### **Test 4: No Access**
1. Create role with no credentials/endpoints
2. Ask AI: "What data do you have?"
3. **Expected**: AI says it has no access to data

---

## 📊 **Debugging Commands**

### **Check User's Credentials**:
```sql
SELECT * FROM api_credentials ac
JOIN user_roles ur ON ac.role_id = ur.role_id
WHERE ur.user_id = 'USER_ID_HERE';
```

### **Check User's Endpoint Access**:
```sql
SELECT ae.name, ae.endpoint_url, rap.has_access
FROM api_endpoints ae
JOIN role_api_permissions rap ON ae.id = rap.api_endpoint_id
JOIN user_roles ur ON rap.role_id = ur.role_id
WHERE ur.user_id = 'USER_ID_HERE' AND rap.has_access = true;
```

### **Check All Permissions**:
```sql
SELECT 
  r.name as role_name,
  ae.name as endpoint_name,
  rap.has_access,
  rap.can_read,
  rap.can_write
FROM role_api_permissions rap
JOIN roles r ON rap.role_id = r.id
JOIN api_endpoints ae ON rap.api_endpoint_id = ae.id
ORDER BY r.name, ae.name;
```

---

## 🎯 **Summary**

**AI Data Fetching**:
- ✅ Fetches credentials based on role
- ✅ Matches credentials to endpoints
- ✅ Makes authenticated API calls
- ✅ Includes data in AI context
- ⚠️ Logs errors for debugging

**Dashboard Data Fetching**:
- ✅ Shows role-specific metrics
- ✅ Fetches from metrics table
- ✅ Real-time updates work
- ⚠️ Needs data in metrics table for charts

**Admin Interface**:
- ✅ Shows all roles
- ✅ Shows all endpoints
- ✅ Toggle switches for each role-endpoint combination
- ✅ Updates permissions correctly

