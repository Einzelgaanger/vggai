# People Information System - Excel Import Template

This document defines the standardized Excel template for importing employee and company data from subsidiaries that do not use SeamlessHR or KlevaHR.

---

## Quick Start Guide

1. Download the template structure below
2. Create an Excel workbook with the sheets listed
3. Fill in data following the column specifications
4. Save as `.xlsx` format
5. Upload to the system for import

---

## Excel Workbook Structure

The workbook should contain **6 sheets**:

| Sheet # | Sheet Name | Purpose |
|---------|------------|---------|
| 1 | Company_Info | Company/subsidiary metadata |
| 2 | Employees | Core employee records |
| 3 | Departments | Department structure |
| 4 | Job_Roles | Job roles and positions |
| 5 | Leave_Records | Leave/time-off data |
| 6 | Attendance | Attendance records |

---

## Sheet 1: Company_Info

Basic information about the subsidiary company.

| Column | Field Name | Data Type | Required | Description | Example |
|--------|------------|-----------|----------|-------------|---------|
| A | company_name | Text | Yes | Official company name | "Acme Holdings Ltd" |
| B | company_code | Text | Yes | Unique company identifier | "ACME001" |
| C | description | Text | No | Brief company description | "Manufacturing subsidiary" |
| D | industry | Text | No | Industry sector | "Manufacturing" |
| E | headquarters_location | Text | No | Main office location | "Lagos, Nigeria" |
| F | date_established | Date | No | Company founding date (YYYY-MM-DD) | "2015-03-20" |
| G | tax_id | Text | No | Tax identification number | "TIN123456789" |
| H | registration_number | Text | No | Corporate registration number | "RC123456" |
| I | contact_email | Email | No | Primary contact email | "info@acme.com" |
| J | contact_phone | Text | No | Primary contact phone | "+234 801 234 5678" |
| K | website | URL | No | Company website | "https://acme.com" |
| L | parent_company | Text | No | Parent company name | "VGG Holdings" |
| M | reporting_currency | Text | No | Default currency | "NGN" |
| N | fiscal_year_end | Text | No | Fiscal year end month | "December" |

---

## Sheet 2: Employees (Main Sheet)

Core employee data - this is the primary data sheet.

### Basic Information

| Column | Field Name | Data Type | Required | Description | Example |
|--------|------------|-----------|----------|-------------|---------|
| A | employee_code | Text | Yes | Unique employee ID | "EMP001" |
| B | first_name | Text | Yes | Legal first name | "Adebayo" |
| C | last_name | Text | Yes | Legal surname | "Okonkwo" |
| D | other_names | Text | No | Middle/other names | "Chukwu" |
| E | email | Email | Yes | Work email address | "adebayo.okonkwo@company.com" |
| F | personal_email | Email | No | Personal email | "adebayo@gmail.com" |
| G | phone_number | Text | No | Primary phone | "+234 801 234 5678" |
| H | alternative_phone | Text | No | Secondary phone | "+234 802 345 6789" |

### Demographics

| Column | Field Name | Data Type | Required | Description | Example |
|--------|------------|-----------|----------|-------------|---------|
| I | gender | Text | Yes | Gender | "Male" / "Female" / "Other" |
| J | date_of_birth | Date | No | Birth date (YYYY-MM-DD) | "1985-06-15" |
| K | marital_status | Text | No | Marital status | "Single" / "Married" / "Divorced" / "Widowed" |
| L | nationality | Text | No | Nationality | "Nigerian" |
| M | state_of_origin | Text | No | State of origin | "Lagos" |
| N | local_government | Text | No | LGA | "Ikeja" |

### Address Information

| Column | Field Name | Data Type | Required | Description | Example |
|--------|------------|-----------|----------|-------------|---------|
| O | residential_address | Text | No | Home address | "123 Main Street, Ikeja" |
| P | city | Text | No | City | "Lagos" |
| Q | state | Text | No | State | "Lagos State" |
| R | country | Text | No | Country | "Nigeria" |
| S | postal_code | Text | No | Postal/ZIP code | "100001" |

### Employment Details

| Column | Field Name | Data Type | Required | Description | Example |
|--------|------------|-----------|----------|-------------|---------|
| T | department | Text | Yes | Department name | "Engineering" |
| U | department_code | Text | No | Department code | "ENG" |
| V | job_role | Text | Yes | Job title/role | "Senior Software Engineer" |
| W | job_role_code | Text | No | Job role code | "SSE001" |
| X | position | Text | No | Position/level | "Senior" |
| Y | grade_level | Text | No | Grade/band level | "Grade 5" |
| Z | employment_type | Text | Yes | Employment type | "Full-time" / "Part-time" / "Contract" / "Intern" |
| AA | contract_type | Text | No | Contract classification | "Permanent" / "Fixed-term" / "Temporary" |
| AB | contract_start_date | Date | No | Contract start (YYYY-MM-DD) | "2020-01-01" |
| AC | contract_end_date | Date | No | Contract end (YYYY-MM-DD) | "2024-12-31" |

### Dates & Status

| Column | Field Name | Data Type | Required | Description | Example |
|--------|------------|-----------|----------|-------------|---------|
| AD | employment_date | Date | Yes | Hire/start date (YYYY-MM-DD) | "2020-03-15" |
| AE | confirmation_date | Date | No | Confirmation date | "2020-06-15" |
| AF | probation_end_date | Date | No | End of probation | "2020-06-15" |
| AG | status | Text | Yes | Employment status | "active" / "inactive" / "suspended" / "on_leave" |
| AH | is_active | Boolean | Yes | Currently active? | "TRUE" / "FALSE" |
| AI | exit_date | Date | No | Last working day | "2024-01-31" |
| AJ | exit_reason | Text | No | Reason for exit | "Resignation" / "Termination" / "Retirement" / "Redundancy" |
| AK | is_exited | Boolean | No | Has left company? | "TRUE" / "FALSE" |

### Location & Reporting

| Column | Field Name | Data Type | Required | Description | Example |
|--------|------------|-----------|----------|-------------|---------|
| AL | branch | Text | Yes | Work location/branch | "Lagos HQ" |
| AM | branch_code | Text | No | Branch code | "LG001" |
| AN | cost_center | Text | No | Cost center | "CC-ENG-001" |
| AO | reporting_manager | Text | No | Manager's employee code | "EMP002" |
| AP | reporting_manager_name | Text | No | Manager's full name | "John Doe" |
| AQ | work_schedule | Text | No | Schedule type | "FULLTIME" / "ROTATIONAL" / "SHIFT" |
| AR | work_hours_per_week | Number | No | Weekly hours | 40 |

### Identification & Documents

| Column | Field Name | Data Type | Required | Description | Example |
|--------|------------|-----------|----------|-------------|---------|
| AS | national_id | Text | No | National ID number | "NIN123456789" |
| AT | passport_number | Text | No | Passport number | "A12345678" |
| AU | passport_expiry | Date | No | Passport expiry date | "2030-12-31" |
| AV | drivers_license | Text | No | Driver's license | "DL123456" |
| AW | tax_id | Text | No | Tax identification | "TIN123456" |
| AX | pension_number | Text | No | Pension/retirement ID | "PEN123456" |
| AY | pension_fund_admin | Text | No | PFA name | "ARM Pension" |
| AZ | nhf_number | Text | No | NHF number | "NHF123456" |

### Bank & Payment

| Column | Field Name | Data Type | Required | Description | Example |
|--------|------------|-----------|----------|-------------|---------|
| BA | bank_name | Text | No | Bank name | "First Bank" |
| BB | bank_account_number | Text | No | Account number | "0123456789" |
| BC | bank_account_name | Text | No | Account holder name | "Adebayo Okonkwo" |
| BD | bank_branch | Text | No | Bank branch | "Victoria Island" |
| BE | bank_sort_code | Text | No | Sort code | "011151003" |
| BF | payment_method | Text | No | Payment method | "Bank Transfer" / "Cash" / "Cheque" |

### Compensation

| Column | Field Name | Data Type | Required | Description | Example |
|--------|------------|-----------|----------|-------------|---------|
| BG | basic_salary | Number | No | Monthly basic salary | 500000 |
| BH | gross_salary | Number | No | Monthly gross salary | 650000 |
| BI | currency | Text | No | Salary currency | "NGN" |
| BJ | pay_grade | Text | No | Pay grade/band | "L5" |
| BK | salary_effective_date | Date | No | Salary effective from | "2024-01-01" |
| BL | housing_allowance | Number | No | Housing allowance | 75000 |
| BM | transport_allowance | Number | No | Transport allowance | 50000 |
| BN | meal_allowance | Number | No | Meal allowance | 25000 |
| BO | other_allowances | Number | No | Other allowances total | 0 |

### Emergency Contact

| Column | Field Name | Data Type | Required | Description | Example |
|--------|------------|-----------|----------|-------------|---------|
| BP | emergency_contact_name | Text | No | Emergency contact name | "Jane Okonkwo" |
| BQ | emergency_contact_relationship | Text | No | Relationship | "Spouse" / "Parent" / "Sibling" |
| BR | emergency_contact_phone | Text | No | Emergency phone | "+234 803 456 7890" |
| BS | emergency_contact_address | Text | No | Emergency contact address | "456 Other Street, Lagos" |

### Next of Kin

| Column | Field Name | Data Type | Required | Description | Example |
|--------|------------|-----------|----------|-------------|---------|
| BT | next_of_kin_name | Text | No | Next of kin name | "Jane Okonkwo" |
| BU | next_of_kin_relationship | Text | No | Relationship | "Spouse" |
| BV | next_of_kin_phone | Text | No | Next of kin phone | "+234 803 456 7890" |
| BW | next_of_kin_address | Text | No | Next of kin address | "456 Other Street, Lagos" |

### Education & Qualifications

| Column | Field Name | Data Type | Required | Description | Example |
|--------|------------|-----------|----------|-------------|---------|
| BX | highest_qualification | Text | No | Highest education | "Bachelor's Degree" |
| BY | institution | Text | No | Institution name | "University of Lagos" |
| BZ | course_of_study | Text | No | Field of study | "Computer Science" |
| CA | graduation_year | Number | No | Year of graduation | 2010 |
| CB | professional_certifications | Text | No | Certifications (comma-separated) | "PMP, AWS Solutions Architect" |

### System Access

| Column | Field Name | Data Type | Required | Description | Example |
|--------|------------|-----------|----------|-------------|---------|
| CC | can_login | Boolean | No | Can access HR system? | "TRUE" / "FALSE" |
| CD | system_role | Text | No | System access level | "Employee" / "Manager" / "HR Admin" |
| CE | last_login | DateTime | No | Last system login | "2024-01-15 09:30:00" |

### Custom Fields

| Column | Field Name | Data Type | Required | Description | Example |
|--------|------------|-----------|----------|-------------|---------|
| CF | custom_field_1 | Text | No | Custom field 1 | Any value |
| CG | custom_field_2 | Text | No | Custom field 2 | Any value |
| CH | custom_field_3 | Text | No | Custom field 3 | Any value |
| CI | notes | Text | No | Additional notes | "Relocated from Abuja branch" |

---

## Sheet 3: Departments

Department/organizational structure data.

| Column | Field Name | Data Type | Required | Description | Example |
|--------|------------|-----------|----------|-------------|---------|
| A | department_code | Text | Yes | Unique department code | "ENG001" |
| B | department_name | Text | Yes | Department name | "Engineering" |
| C | description | Text | No | Department description | "Software development team" |
| D | department_tag | Text | No | Category tag | "department" / "directorate" / "division" / "unit" |
| E | parent_department | Text | No | Parent department code | "TECH001" |
| F | head_of_department | Text | No | HOD employee code | "EMP001" |
| G | head_of_department_name | Text | No | HOD full name | "John Doe" |
| H | is_regional | Boolean | No | Regional department? | "TRUE" / "FALSE" |
| I | location | Text | No | Primary location | "Lagos HQ" |
| J | cost_center | Text | No | Cost center code | "CC-ENG" |
| K | budget_code | Text | No | Budget allocation code | "BUD-ENG-2024" |
| L | created_date | Date | No | Department created date | "2018-01-01" |
| M | is_active | Boolean | Yes | Currently active? | "TRUE" / "FALSE" |

---

## Sheet 4: Job_Roles

Job roles and position definitions.

| Column | Field Name | Data Type | Required | Description | Example |
|--------|------------|-----------|----------|-------------|---------|
| A | job_role_code | Text | Yes | Unique role code | "SSE001" |
| B | job_role_name | Text | Yes | Role title | "Senior Software Engineer" |
| C | description | Text | No | Role description | "Leads development projects" |
| D | department | Text | No | Associated department | "Engineering" |
| E | department_code | Text | No | Department code | "ENG001" |
| F | job_family | Text | No | Job family/category | "Technology" |
| G | grade_level | Text | No | Grade/band | "L5" |
| H | pay_grade_min | Number | No | Minimum salary range | 400000 |
| I | pay_grade_max | Number | No | Maximum salary range | 700000 |
| J | currency | Text | No | Currency | "NGN" |
| K | reports_to_role | Text | No | Reporting role | "Engineering Manager" |
| L | direct_reports | Number | No | Number of direct reports | 3 |
| M | is_management | Boolean | No | Management position? | "TRUE" / "FALSE" |
| N | is_active | Boolean | Yes | Currently active? | "TRUE" / "FALSE" |
| O | required_qualifications | Text | No | Required education | "Bachelor's in CS or related" |
| P | required_experience_years | Number | No | Min years experience | 5 |
| Q | key_responsibilities | Text | No | Main responsibilities | "Code review, architecture decisions" |

---

## Sheet 5: Leave_Records

Employee leave/time-off records.

| Column | Field Name | Data Type | Required | Description | Example |
|--------|------------|-----------|----------|-------------|---------|
| A | leave_id | Text | Yes | Unique leave record ID | "LV-2024-001" |
| B | employee_code | Text | Yes | Employee code | "EMP001" |
| C | employee_name | Text | No | Employee full name | "Adebayo Okonkwo" |
| D | leave_type | Text | Yes | Type of leave | "Annual" / "Sick" / "Maternity" / "Paternity" / "Study" / "Compassionate" |
| E | start_date | Date | Yes | Leave start date | "2024-02-01" |
| F | end_date | Date | Yes | Leave end date | "2024-02-05" |
| G | days_requested | Number | Yes | Number of days | 5 |
| H | days_approved | Number | No | Days approved | 5 |
| I | status | Text | Yes | Request status | "PENDING" / "APPROVED" / "REJECTED" / "CANCELLED" / "ON LEAVE" |
| J | reason | Text | No | Leave reason | "Family vacation" |
| K | resumption_date | Date | No | Expected return date | "2024-02-06" |
| L | actual_resumption_date | Date | No | Actual return date | "2024-02-06" |
| M | recall_date | Date | No | If recalled, recall date | "" |
| N | recall_reason | Text | No | Reason for recall | "" |
| O | approved_by | Text | No | Approver employee code | "EMP002" |
| P | approved_by_name | Text | No | Approver name | "Manager Name" |
| Q | approval_date | Date | No | Date approved | "2024-01-25" |
| R | request_date | Date | No | Date requested | "2024-01-20" |
| S | is_half_day | Boolean | No | Half-day leave? | "FALSE" |
| T | half_day_type | Text | No | Morning/afternoon | "AM" / "PM" |
| U | attachment_url | Text | No | Supporting document URL | "https://..." |
| V | year | Number | Yes | Leave year | 2024 |
| W | notes | Text | No | Additional notes | "" |

---

## Sheet 6: Attendance

Daily attendance records.

| Column | Field Name | Data Type | Required | Description | Example |
|--------|------------|-----------|----------|-------------|---------|
| A | attendance_id | Text | No | Unique attendance ID | "ATT-2024-001" |
| B | employee_code | Text | Yes | Employee code | "EMP001" |
| C | employee_name | Text | No | Employee name | "Adebayo Okonkwo" |
| D | date | Date | Yes | Attendance date | "2024-01-15" |
| E | schedule_type | Text | No | Schedule type | "FULLTIME" / "ROTATIONAL" |
| F | scheduled_clock_in | Time | No | Expected clock-in time | "09:00" |
| G | scheduled_clock_out | Time | No | Expected clock-out time | "17:00" |
| H | actual_clock_in | Time | No | Actual clock-in time | "08:55" |
| I | actual_clock_out | Time | No | Actual clock-out time | "17:30" |
| J | clock_in_source | Text | No | How clocked in | "Biometric" / "Mobile" / "Web" / "Manual" |
| K | clock_out_source | Text | No | How clocked out | "Biometric" / "Mobile" / "Web" / "Manual" |
| L | break_start | Time | No | Break start time | "12:00" |
| M | break_end | Time | No | Break end time | "13:00" |
| N | break_duration_minutes | Number | No | Total break (minutes) | 60 |
| O | hours_worked | Number | No | Hours worked | 8.5 |
| P | overtime_hours | Number | No | Overtime hours | 0.5 |
| Q | punctuality_status | Text | No | Punctuality | "On Time" / "Late" / "Early" / "Absent" |
| R | attendance_status | Text | Yes | Status | "Present" / "Absent" / "Leave" / "Holiday" / "Weekend" |
| S | late_minutes | Number | No | Minutes late | 0 |
| T | early_departure_minutes | Number | No | Early departure (min) | 0 |
| U | location | Text | No | Work location | "Lagos HQ" |
| V | work_from_home | Boolean | No | Remote work? | "FALSE" |
| W | notes | Text | No | Additional notes | "" |

---

## Data Validation Rules

### Required Fields Priority

**Must Have (Critical):**
- Employee: employee_code, first_name, last_name, email, gender, department, job_role, employment_type, employment_date, status, is_active, branch

**Should Have (Important):**
- Employee: phone_number, date_of_birth, contract_type, grade_level, reporting_manager

**Nice to Have (Optional):**
- All other fields

### Field Format Standards

| Field Type | Format | Example |
|------------|--------|---------|
| Date | YYYY-MM-DD | 2024-01-15 |
| Time | HH:MM (24-hour) | 09:00, 17:30 |
| DateTime | YYYY-MM-DD HH:MM:SS | 2024-01-15 09:30:00 |
| Boolean | TRUE/FALSE | TRUE |
| Email | Standard email format | user@company.com |
| Phone | Include country code | +234 801 234 5678 |
| Currency | Number only | 500000 |

### Dropdown Values

**Gender:**
- Male
- Female
- Other

**Employment Type:**
- Full-time
- Part-time
- Contract
- Intern

**Contract Type:**
- Permanent
- Fixed-term
- Temporary

**Employment Status:**
- active
- inactive
- suspended
- on_leave
- terminated

**Leave Status:**
- PENDING
- APPROVED
- REJECTED
- CANCELLED
- ON LEAVE

**Leave Types:**
- Annual
- Sick
- Maternity
- Paternity
- Study
- Compassionate
- Unpaid

**Attendance Status:**
- Present
- Absent
- Leave
- Holiday
- Weekend

---

## Sample Data Row (Employees Sheet)

```
employee_code: EMP001
first_name: Adebayo
last_name: Okonkwo
other_names: Chukwu
email: adebayo.okonkwo@company.com
personal_email: adebayo@gmail.com
phone_number: +234 801 234 5678
gender: Male
date_of_birth: 1985-06-15
marital_status: Married
department: Engineering
job_role: Senior Software Engineer
employment_type: Full-time
contract_type: Permanent
employment_date: 2020-03-15
status: active
is_active: TRUE
branch: Lagos HQ
cost_center: CC-ENG-001
reporting_manager: EMP002
basic_salary: 500000
currency: NGN
```

---

## Import Checklist

Before uploading your Excel file, verify:

- [ ] All required fields are populated
- [ ] Dates are in YYYY-MM-DD format
- [ ] Employee codes are unique
- [ ] Department names match across sheets
- [ ] Email addresses are valid and unique
- [ ] Status values match allowed options
- [ ] Numbers are plain numbers (no currency symbols)
- [ ] Boolean fields use TRUE/FALSE only
- [ ] No empty rows between data rows
- [ ] Sheet names match exactly as specified

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-12-05 | Initial template based on SeamlessHR structure |

---

## Support

For questions about the template or import process, contact your system administrator.
