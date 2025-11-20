# Authentication Flow & Usage Guide

## 🔐 **Auth Flow Changes**

### **✅ NO CHANGES to the Authentication Flow Itself**

The authentication process remains **exactly the same**:
- Users still sign up/sign in the same way
- Same email/password authentication
- Same Supabase Auth system
- Same session management

### **⚠️ BUT: Role System Has Changed**

The role system was migrated from **enum-based** to **table-based**:

**Old System (Enum)**:
```sql
-- Roles were stored as enum values
user_roles.role = 'ceo'::app_role
```

**New System (Table)**:
```sql
-- Roles are now in a roles table
user_roles.role_id → roles.id
roles.name = 'ceo'
```

---

## 📋 **How to Use the System**

### **Step 1: Run Database Migrations**

**IMPORTANT**: You must run the migrations in order:

```bash
# 1. First, ensure all previous migrations are applied
supabase migration up

# 2. Apply the new role system migration (if not already done)
# This is: 20251112063653_8077779c-bf2b-41f1-baa0-e43a97bf85cc.sql

# 3. Apply the new API credentials migration
# This is: 20251112070000_add_api_credentials.sql
```

**Or in Supabase Dashboard**:
1. Go to SQL Editor
2. Run migrations in order (check the timestamps)
3. Make sure `20251112063653_*` runs before `20251112070000_*`

---

### **Step 2: Set Up Roles (One-Time Setup)**

After migration, you need to **create the roles in the database**:

```sql
-- Insert all roles into the roles table
INSERT INTO public.roles (name, description) VALUES
  ('ceo', 'Chief Executive Officer'),
  ('cto', 'Chief Technology Officer'),
  ('cfo', 'Chief Financial Officer'),
  ('hr_manager', 'HR Manager'),
  ('hr_coordinator', 'HR Coordinator'),
  ('engineering_manager', 'Engineering Manager'),
  ('senior_developer', 'Senior Developer'),
  ('junior_developer', 'Junior Developer'),
  ('product_manager', 'Product Manager'),
  ('sales_manager', 'Sales Manager'),
  ('sales_representative', 'Sales Representative'),
  ('marketing_manager', 'Marketing Manager'),
  ('marketing_specialist', 'Marketing Specialist'),
  ('finance_manager', 'Finance Manager'),
  ('accountant', 'Accountant'),
  ('operations_manager', 'Operations Manager'),
  ('support_manager', 'Support Manager'),
  ('support_agent', 'Support Agent'),
  ('data_analyst', 'Data Analyst'),
  ('it_administrator', 'IT Administrator')
ON CONFLICT (name) DO NOTHING;
```

---

### **Step 3: Migrate Existing Users (If You Have Any)**

If you have existing users with enum-based roles, migrate them:

```sql
-- Migrate existing user roles from enum to table-based
INSERT INTO public.user_roles (user_id, role_id)
SELECT 
  ur.user_id,
  r.id
FROM public.user_roles ur
JOIN public.roles r ON r.name = ur.role::text
WHERE ur.role_id IS NULL
ON CONFLICT (user_id, role_id) DO NOTHING;
```

**Note**: The migration should handle this, but verify it worked.

---

### **Step 4: Update the User Creation Trigger (IMPORTANT)**

**✅ AUTOMATIC**: A migration file has been created to fix this: `20251112080000_fix_user_trigger.sql`

**If you need to run it manually**:
```sql
-- The migration file contains the updated trigger function
-- It will automatically use the roles table instead of enum
```

**What it does**:
- Updates `handle_new_user()` function to use `roles` table
- Looks up role by name and uses `role_id` instead of enum
- Handles cases where role doesn't exist (fallback to junior_developer)

---

## 🚀 **How to Use the System**

### **For End Users (Regular Users)**

**Nothing changes!** Users still:

1. **Sign Up**:
   - Go to `/auth`
   - Enter email and password
   - Click "Sign Up"
   - Role is automatically assigned based on email

2. **Sign In**:
   - Go to `/auth`
   - Enter email and password
   - Click "Sign In"
   - Redirected to dashboard

3. **Use Dashboard**:
   - See role-specific metrics
   - Use AI Assistant (with role-based API access)
   - Everything works automatically

---

### **For Admins (CEO/CTO)**

**New Features Available**:

1. **Configure API Credentials**:
   - Go to Dashboard → Integrations Tab
   - Click "API Credentials" section
   - Add credentials for each role
   - Test credentials before saving

2. **Configure API Endpoints**:
   - Go to Dashboard → Integrations Tab
   - Click "Role-Based API Access" section
   - Create API endpoints
   - Grant/revoke access per role
   - Set read/write permissions

3. **Manage API Integrations**:
   - Go to Dashboard → Integrations Tab
   - Click "API Integrations" section
   - Add external API integrations
   - Store credentials securely

---

## 🔍 **Troubleshooting**

### **Issue: "Role not found" or "Cannot access dashboard"**

**Solution**:
1. Check if roles exist in `roles` table:
   ```sql
   SELECT * FROM roles;
   ```

2. Check if user has a role assigned:
   ```sql
   SELECT u.email, r.name as role_name
   FROM auth.users u
   LEFT JOIN user_roles ur ON u.id = ur.user_id
   LEFT JOIN roles r ON ur.role_id = r.id
   WHERE u.email = 'user@example.com';
   ```

3. If user has no role, assign one:
   ```sql
   -- Get role_id
   SELECT id FROM roles WHERE name = 'ceo';
   
   -- Assign role
   INSERT INTO user_roles (user_id, role_id)
   VALUES (
     (SELECT id FROM auth.users WHERE email = 'user@example.com'),
     (SELECT id FROM roles WHERE name = 'ceo')
   );
   ```

---

### **Issue: "Cannot see API Credentials section"**

**Solution**:
- Only CEO and CTO can see this section
- Verify your role:
  ```sql
  SELECT r.name 
  FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = 'your-user-id';
  ```

---

### **Issue: "AI Assistant not fetching data"**

**Solution**:
1. Check if credentials are configured:
   - Go to Integrations → API Credentials
   - Verify credentials exist for your role

2. Check if endpoints are configured:
   - Go to Integrations → Role-Based API Access
   - Verify your role has access to endpoints

3. Check browser console for errors
4. Check Supabase function logs

---

## 📝 **Quick Start Checklist**

- [ ] Run all database migrations
- [ ] Insert roles into `roles` table
- [ ] Update `handle_new_user()` trigger function
- [ ] Migrate existing users (if any)
- [ ] Test sign up with test email
- [ ] Verify role assignment works
- [ ] Login as CEO/CTO
- [ ] Configure API credentials
- [ ] Configure API endpoints
- [ ] Test AI Assistant

---

## 🎯 **Summary**

**What Changed**:
- ✅ Role system: enum → table-based
- ✅ New API credential management
- ✅ New role-based API access control

**What Stayed the Same**:
- ✅ Authentication flow (sign up/sign in)
- ✅ User experience
- ✅ Dashboard structure
- ✅ AI Assistant UI

**What You Need to Do**:
1. Run migrations
2. Set up roles table
3. Update trigger function
4. Start using the new features!

---

**Need Help?** Check the `ENHANCEMENTS_DETAILED.md` file for more information.

