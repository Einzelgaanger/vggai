# KlevaHR Integration Guide

## 📋 **Status Update**

**✅ API Documentation Now Available!**

As of December 2025, KlevaHR has provided API documentation and access. Integration can now proceed.

---

## 🔑 **Access Information**

### **Postman Collection**
- **Link**: https://api.postman.com/collections/971406-7ff12c3b-0f1f-4b1c-b05d-4644ea7d4ff0?access_key=PMAT-REDACTED
- **Purpose**: Complete API structure and flow documentation
- **Environments**: Test, UAT, and Production all follow the same structure

### **Authentication**
- **Method**: API Key-based authentication
- **Status**: API key will be shared privately by KlevaHR team
- **Contact**: Opeyemi Ogunsawo (oogunsawo@swifta.com)

### **Environments**
- **Test/UAT**: Can proceed with API keys (no IP whitelisting required initially)
- **Production**: Will require IP whitelisting (coordinate with KlevaHR team)

---

## 👥 **Key Contacts**

| Name | Role | Email | Responsibility |
|------|------|-------|----------------|
| **Opeyemi Ogunsawo** | ERP Implementation Consultant | oogunsawo@swifta.com | Main contact for API access and keys |
| **Oluchi Ndukwe** | KlevaHR Team | ondukwe@swifta.com | IP whitelisting and production setup |
| **Modupe Aladeojebi** | CTO | mladejebi@swifta.com | Technical oversight |
| **Femi Odeyemi** | Head of Sales Operations | fodeyemi@swifta.com | Business coordination |

---

## 🚀 **Integration Steps**

### **Phase 1: Preparation (Week 1)**

1. **Access Postman Collection**
   - Import the Postman collection link into Postman
   - Study all available endpoints
   - Understand request/response structures
   - Note authentication requirements

2. **Request API Key**
   - Email Opeyemi Ogunsawo (oogunsawo@swifta.com)
   - Request API key for Test/UAT environment
   - API key will be shared privately
   - Store securely (use environment variables, never commit to code)

3. **Identify Required Endpoints**
   - Review Postman collection for endpoints needed
   - Map to our data requirements:
     - Employee data
     - Department data
     - Attendance data
     - Leave data
     - Performance data
     - Payroll data (if available)

### **Phase 2: Implementation (Week 2-3)**

1. **Create Service File**
   ```typescript
   // src/lib/kleva-service.ts
   // Similar structure to seamlesshr-service.ts
   ```

   **Key Functions to Implement:**
   - `getKlevaHREmployees(params?)` - Get employee list
   - `getKlevaHRDepartments()` - Get departments
   - `getKlevaHRAttendance(params?)` - Get attendance records
   - `getKlevaHRLeaveRequests(params?)` - Get leave requests
   - `getKlevaHRPerformance(params?)` - Get performance data
   - (Add more based on Postman collection)

2. **Create Edge Function**
   ```typescript
   // supabase/functions/kleva-api/index.ts
   // Similar structure to seamlesshr-api/index.ts
   ```

   **Key Features:**
   - Handle API key authentication
   - Proxy requests to KlevaHR API
   - Support Test, UAT, and Production environments
   - Error handling and retry logic
   - Rate limiting

3. **Create TypeScript Interfaces**
   ```typescript
   // Based on Postman collection response structures
   export interface KlevaHREmployee {
     // Define based on actual API response
   }
   
   export interface KlevaHRDepartment {
     // Define based on actual API response
   }
   // ... etc
   ```

### **Phase 3: Database Setup (Week 3)**

1. **Add Endpoints to Database**
   ```sql
   -- Add KlevaHR endpoints to api_endpoints table
   -- Based on Postman collection
   ```

2. **Add Credentials**
   ```sql
   -- Add API key to api_credentials table
   -- Link to appropriate roles
   ```

3. **Set Up Permissions**
   ```sql
   -- Configure role_api_permissions
   -- Define which roles can access which endpoints
   ```

### **Phase 4: Testing (Week 4)**

1. **Test with Test Environment**
   - Test all endpoints
   - Verify data structure
   - Test error handling
   - Validate authentication

2. **Test with UAT Environment**
   - Repeat tests in UAT
   - Verify data consistency
   - Test edge cases

3. **Integration Testing**
   - Test with frontend components
   - Verify data flow
   - Test role-based access

### **Phase 5: Production Setup (When Ready)**

1. **Coordinate IP Whitelisting**
   - Contact Oluchi Ndukwe (ondukwe@swifta.com)
   - Provide Supabase Edge Function public IP addresses
   - Wait for confirmation

2. **Update Production Credentials**
   - Add production API key
   - Update environment variables
   - Test production connection

---

## 📊 **Expected Data Structure**

Based on the Postman collection, you should expect:

### **Employee Data**
- Employee IDs
- Names (first, last)
- Email addresses
- Department assignments
- Job roles/positions
- Employment dates
- Status (active/inactive)

### **Department Data**
- Department IDs
- Department names
- Hierarchical structure (if applicable)

### **Attendance Data**
- Employee attendance records
- Clock in/out times
- Attendance status
- Date ranges

### **Leave Data**
- Leave requests
- Leave balances
- Leave types
- Approval status

---

## 🔧 **Technical Implementation Details**

### **API Key Authentication**

```typescript
// Example authentication header
headers: {
  'Authorization': `Bearer ${apiKey}`,
  // OR
  'X-API-Key': apiKey,
  // Check Postman collection for exact format
}
```

### **Base URL Structure**

```typescript
// Likely structure (verify in Postman collection)
const KLEVAHR_BASE_URL = {
  test: 'https://test-api.klevahr.com',
  uat: 'https://uat-api.klevahr.com',
  production: 'https://api.klevahr.com'
};
```

### **Error Handling**

```typescript
// Implement similar to SeamlessHR
// Handle rate limits
// Handle authentication errors
// Handle data validation errors
```

---

## ⚠️ **Important Notes**

1. **API Key Security**
   - Never commit API keys to code
   - Use environment variables
   - Store in Supabase secrets for edge functions
   - Rotate keys periodically

2. **IP Whitelisting**
   - Required for Production only
   - Test/UAT can proceed without it
   - Coordinate with KlevaHR team when ready

3. **Rate Limiting**
   - Implement rate limiting in edge function
   - Respect API rate limits
   - Add retry logic with exponential backoff

4. **Data Normalization**
   - KlevaHR data structure may differ from SeamlessHR
   - Create transformation layer to normalize data
   - Ensure consistent format for frontend

5. **Environment Management**
   - Use different API keys for Test/UAT/Production
   - Update edge function to support environment switching
   - Test thoroughly in each environment

---

## 📝 **Checklist**

### **Before Starting:**
- [ ] Access Postman collection
- [ ] Request API key from Opeyemi Ogunsawo
- [ ] Study API structure
- [ ] ] Identify all required endpoints

### **During Implementation:**
- [ ] Create `kleva-service.ts`
- [ ] Create `kleva-api` edge function
- [ ] Create TypeScript interfaces
- [ ] Add endpoints to database
- [ ] Add credentials to database
- [ ] Set up role permissions

### **Testing:**
- [ ] Test all endpoints in Test environment
- [ ] Test all endpoints in UAT environment
- [ ] Verify data structure matches expectations
- [ ] Test error handling
- [ ] Test authentication
- [ ] Integration test with frontend

### **Production:**
- [ ] Coordinate IP whitelisting
- [ ] Add production API key
- [ ] Test production connection
- [ ] Monitor API health
- [ ] Document any issues

---

## 🆘 **Troubleshooting**

### **API Key Issues**
- Contact Opeyemi Ogunsawo for key reset
- Verify key is correctly stored in environment variables
- Check key format matches Postman collection

### **IP Whitelisting Issues**
- Contact Oluchi Ndukwe for IP whitelisting
- Verify Supabase Edge Function IP addresses
- Check firewall rules

### **Data Structure Issues**
- Refer to Postman collection for expected structure
- Compare with actual API responses
- Update TypeScript interfaces if needed

---

## 📞 **Support**

For technical issues:
- **API Access**: Opeyemi Ogunsawo (oogunsawo@swifta.com)
- **IP Whitelisting**: Oluchi Ndukwe (ondukwe@swifta.com)
- **Technical Questions**: Modupe Aladeojebi (mladejebi@swifta.com)

---

**Last Updated**: December 2025  
**Status**: Ready for Integration  
**Next Step**: Request API key and access Postman collection

