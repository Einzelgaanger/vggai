import { supabase } from "@/integrations/supabase/client";

// All demo users are VGG Holdings employees
// They can access data from child companies: Seamless HR, Kleva HR, WorkflowHR, PayStackHR, TalentHub, PeopleCore
export const DEMO_USERS = [
  {
    email: "ceo@vgg.demo",
    password: "Demo2024!CEO",
    fullName: "Sarah Johnson",
    role: "ceo",
    company: "VGG Holdings",
    accessibleCompanies: ['Seamless HR', 'Kleva HR', 'WorkflowHR', 'PayStackHR', 'TalentHub', 'PeopleCore']
  },
  {
    email: "cto@vgg.demo",
    password: "Demo2024!CTO",
    fullName: "Michael Chen",
    role: "cto",
    company: "VGG Holdings",
    accessibleCompanies: ['Seamless HR', 'Kleva HR', 'WorkflowHR', 'PayStackHR', 'TalentHub', 'PeopleCore']
  },
  {
    email: "cfo@vgg.demo",
    password: "Demo2024!CFO",
    fullName: "Emily Rodriguez",
    role: "cfo",
    company: "VGG Holdings",
    accessibleCompanies: ['Seamless HR', 'Kleva HR', 'WorkflowHR', 'PayStackHR', 'TalentHub', 'PeopleCore']
  },
  {
    email: "hr.manager@vgg.demo",
    password: "Demo2024!HR",
    fullName: "David Thompson",
    role: "hr_manager",
    company: "VGG Holdings",
    accessibleCompanies: ['Seamless HR', 'Kleva HR', 'WorkflowHR', 'TalentHub', 'PeopleCore']
  },
  {
    email: "eng.manager@vgg.demo",
    password: "Demo2024!ENG",
    fullName: "Lisa Wang",
    role: "engineering_manager",
    company: "VGG Holdings",
    accessibleCompanies: ['Kleva HR', 'WorkflowHR', 'PeopleCore']
  },
  {
    email: "senior.dev@vgg.demo",
    password: "Demo2024!DEV",
    fullName: "James Martinez",
    role: "senior_developer",
    company: "VGG Holdings",
    accessibleCompanies: ['Kleva HR', 'WorkflowHR']
  },
  {
    email: "analyst@vgg.demo",
    password: "Demo2024!DATA",
    fullName: "Ana Silva",
    role: "data_analyst",
    company: "VGG Holdings",
    accessibleCompanies: ['Seamless HR', 'Kleva HR', 'WorkflowHR', 'PayStackHR', 'TalentHub']
  },
  {
    email: "sales.manager@vgg.demo",
    password: "Demo2024!SALES",
    fullName: "Tom Anderson",
    role: "sales_manager",
    company: "VGG Holdings",
    accessibleCompanies: ['Seamless HR', 'WorkflowHR', 'PeopleCore']
  },
  {
    email: "finance.manager@vgg.demo",
    password: "Demo2024!FINANCE",
    fullName: "Jennifer White",
    role: "finance_manager",
    company: "VGG Holdings",
    accessibleCompanies: ['Seamless HR', 'Kleva HR', 'PayStackHR', 'PeopleCore']
  },
  {
    email: "ops.manager@vgg.demo",
    password: "Demo2024!OPS",
    fullName: "Robert Garcia",
    role: "operations_manager",
    company: "VGG Holdings",
    accessibleCompanies: ['Seamless HR', 'WorkflowHR', 'PeopleCore']
  }
];

export const DEFAULT_PASSWORD = "demo123";

/**
 * Seeds demo users for testing
 */
export async function seedDemoUsers() {
  const results = {
    success: [] as string[],
    errors: [] as { email: string; error: string }[]
  };

  console.log("Starting demo user seeding...");

  for (const user of DEMO_USERS) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: user.fullName
          }
        }
      });

      if (authError) {
        results.errors.push({ email: user.email, error: authError.message });
        console.error(`Error creating ${user.email}:`, authError);
        continue;
      }

      if (!authData.user) {
        results.errors.push({ email: user.email, error: "No user returned" });
        continue;
      }

      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('name', user.company)
        .single();

      if (companyError || !company) {
        const { data: newCompany, error: createCompanyError } = await supabase
          .from('companies')
          .insert({
            name: user.company,
            description: `Demo company - ${user.company}`,
            is_active: true
          })
          .select('id')
          .single();

        if (createCompanyError) {
          results.errors.push({ 
            email: user.email, 
            error: `Failed to create company: ${createCompanyError.message}` 
          });
          continue;
        }
      }

      const { data: role } = await supabase
        .from('roles')
        .select('id')
        .eq('name', user.role)
        .single();

      if (!role) {
        results.errors.push({ email: user.email, error: `Role ${user.role} not found` });
        continue;
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role_id: role.id
        });

      if (roleError) {
        results.errors.push({ 
          email: user.email, 
          error: `Failed to assign role: ${roleError.message}` 
        });
        continue;
      }

      const { data: companyData } = await supabase
        .from('companies')
        .select('id')
        .eq('name', user.company)
        .single();

      if (companyData) {
        const { error: companyAccessError } = await supabase
          .from('user_company_access')
          .insert({
            user_id: authData.user.id,
            company_id: companyData.id,
            role_id: role.id
          });

        if (companyAccessError) {
          results.errors.push({ 
            email: user.email, 
            error: `Failed to link to company: ${companyAccessError.message}` 
          });
          continue;
        }
      }

      results.success.push(user.email);
      console.log(`✓ Created user: ${user.email}`);
    } catch (error) {
      results.errors.push({ 
        email: user.email, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      console.error(`Error with ${user.email}:`, error);
    }
  }

  return results;
}

/**
 * Gets credential documentation for demo users
 */
export function getDemoCredentials() {
  return DEMO_USERS.map(u => ({
    email: u.email,
    password: u.password,
    role: u.role,
    company: u.company,
    name: u.fullName
  }));
}
