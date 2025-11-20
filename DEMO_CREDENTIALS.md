# VGG AI Demo User Credentials

**Last Updated:** November 20, 2024

## 🔐 Important Notes

- All demo accounts use the pattern: `Demo2024![ROLE]`
- Email confirmation is disabled for easier testing
- These are test accounts - not for production use
- Credentials can be regenerated via Admin Dashboard

---

## 👥 VGG Holdings Users

### Executive Leadership

| Name | Email | Password | Role |
|------|-------|----------|------|
| Sarah Johnson | ceo@vgg.demo | Demo2024!CEO | CEO |
| Michael Chen | cto@vgg.demo | Demo2024!CTO | CTO |
| Emily Rodriguez | cfo@vgg.demo | Demo2024!CFO | CFO |

### Management

| Name | Email | Password | Role |
|------|-------|----------|------|
| David Thompson | hr.manager@vgg.demo | Demo2024!HR | HR Manager |
| Lisa Wang | eng.manager@vgg.demo | Demo2024!ENG | Engineering Manager |

### Development & Analytics

| Name | Email | Password | Role |
|------|-------|----------|------|
| James Martinez | senior.dev@vgg.demo | Demo2024!DEV | Senior Developer |
| Ana Silva | analyst@vgg.demo | Demo2024!DATA | Data Analyst |

---

## 🏢 TechCorp Users

### Executive Leadership

| Name | Email | Password | Role |
|------|-------|----------|------|
| Robert Kim | ceo@techcorp.demo | Demo2024!CEO2 | CEO |
| Jennifer Lee | cto@techcorp.demo | Demo2024!CTO2 | CTO |

### Management

| Name | Email | Password | Role |
|------|-------|----------|------|
| Tom Anderson | sales.manager@techcorp.demo | Demo2024!SALES | Sales Manager |

---

## 📊 Access Levels by Role

### CEO
- Full system access
- All company data
- User management
- Credential management
- API configuration

### CTO
- Technical operations
- API credentials
- Integration management
- System configuration

### CFO
- Financial data
- Budget reports
- Revenue metrics

### HR Manager
- Employee data
- HR metrics
- Team management

### Engineering Manager
- Development metrics
- Team performance
- Project status

### Senior Developer
- Development dashboards
- Code metrics
- Project data

### Data Analyst
- Analytics dashboards
- Data visualization
- Report generation

### Sales Manager
- Sales pipelines
- Revenue tracking
- Team performance

---

## 🚀 Quick Start

1. Navigate to [your-app-url]/auth
2. Use any email/password combination from above
3. Access role-specific dashboard

## 🔄 Regenerating Users

If you need to recreate all demo users:

1. Go to Admin Dashboard (`/admin/dashboard`)
2. Click "Delete Test Users" to remove existing demo accounts
3. Click "Create Demo Users" to generate fresh accounts
4. Download credentials using the "Download Credentials" button

## 🛠️ Admin Dashboard Access

To access admin features, log in as:
- **CEO** (ceo@vgg.demo)
- **CTO** (cto@vgg.demo)

Then navigate to `/admin/dashboard`

---

## ⚙️ Supabase Auth Settings

For easier testing, ensure these settings are configured:

1. Go to Lovable Cloud → Auth Settings
2. Disable "Confirm email" for instant login
3. Set Site URL to your preview/production URL
4. Add redirect URLs for all environments

---

## 🔒 Security Notes

- These credentials are for **DEMO/TESTING ONLY**
- Never use in production
- Rotate regularly
- Use strong passwords for real users
- Enable email confirmation for production

---

## 📝 Password Pattern

All passwords follow this pattern:
```
Demo2024![ROLE_ABBREVIATION]
```

Examples:
- CEO → Demo2024!CEO
- CTO → Demo2024!CTO
- HR Manager → Demo2024!HR
- Data Analyst → Demo2024!DATA

---

## 🆘 Troubleshooting

### Can't Login?
- Check if email confirmation is disabled
- Verify user exists in Auth
- Check password is correct (case-sensitive)

### Missing Dashboard Access?
- Verify role assignment in user_roles table
- Check company access in user_company_access table
- Ensure companies exist

### No Data Showing?
- Check API credentials are configured
- Verify role has permissions
- Check company selection

---

**For support, check the Admin Dashboard or contact your system administrator.**
