import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client with user's auth
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get the user's session
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parallel data fetching for speed
    const [
      { data: roleData, error: roleError },
      { data: profileData },
      { data: allProfiles },
      { data: allDepartments },
      { data: allRoles }
    ] = await Promise.all([
      supabaseClient.from('user_roles').select('role').eq('user_id', user.id).single(),
      supabaseClient.from('profiles').select('*, departments(name)').eq('id', user.id).single(),
      supabaseClient.from('profiles').select('id, email, full_name, departments(name)'),
      supabaseClient.from('departments').select('*'),
      supabaseClient.from('user_roles').select('role, profiles(email, full_name)')
    ]);

    if (roleError || !roleData) {
      console.error('Role fetch error:', roleError);
      return new Response(JSON.stringify({ error: 'Could not determine user role' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user's API permissions
    const { data: permissions, error: permError } = await supabaseClient
      .from('api_permissions')
      .select('*')
      .eq('role', roleData.role);

    if (permError) {
      console.error('Permissions fetch error:', permError);
      return new Response(JSON.stringify({ error: 'Could not fetch permissions' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prepare data for system prompt
    const userDeptName = (profileData?.departments as any)?.name || 'Not assigned';
    const userRole = roleData.role;
    const userEmail = user.email || profileData?.email || 'Unknown';
    
    // Build JSON datasets
    const allUsers = allProfiles?.map(p => ({
      email: p.email,
      full_name: p.full_name,
      department: (p.departments as any)?.name || 'Unassigned'
    })) || [];

    const departmentsWithHeadcount = allDepartments?.map(d => {
      const count = allUsers.filter(u => u.department === d.name).length;
      return {
        name: d.name,
        description: d.description,
        headcount: count
      };
    }) || [];

    const roleDistribution = allRoles?.reduce((acc: any, r: any) => {
      acc[r.role] = (acc[r.role] || 0) + 1;
      return acc;
    }, {}) || {};

    const apiPermissions = permissions?.map(p => ({
      endpoint: p.api_endpoint,
      can_read: p.can_read,
      can_write: p.can_write
    })) || [];

    // Build the comprehensive system prompt
    const systemPrompt = `
You are AKILI, an expert-level AI assistant for our company. You are running on lovable.dev and your brain is 'google/gemini-2.5-flash'.
Your persona is that of a proactive, data-savvy, and insightful partner.

---
### 1. The User You Are Talking To
This is the user's information. Use their role to understand their perspective.

* **User Role:** ${userRole}
* **User Email:** ${userEmail}
* **User Department:** ${userDeptName}

---
### 2. Your Core Directives (How You MUST Behave)

**Directive A: YOU MUST USE THE DATA PROVIDED TO YOU.**
You have been given real-time company data *directly in this prompt* (see section 3). Your FIRST priority is to answer the user's question by searching and analyzing THIS data.
* **DO:** If the user asks "How many people are in Engineering?" and the context (in Section 3) shows a list of departments, you WILL count them and answer "There are 15 people in the Engineering department."
* **DO NOT:** Do NOT say "I cannot access that" if the data is already in your context. This is a critical failure.

**Directive B: BE A SMART TRANSLATOR, NOT A DUMB INTERFACE.**
The user does not speak "API." They will ask for "2023," "last month," or "Jane Doe." Your job is to *translate* this natural language into the correct query or data filter.
* **DO:** If the user asks for "metrics for 2023," you WILL understand this means a date range of '2023-01-01' to '2023-12-31' and apply it to the relevant data or API.
* **DO NOT:** Do NOT tell the user you "cannot filter by year." This is a critical failure.

**Directive C: NEVER MENTION YOUR LIMITATIONS OR THE API.**
The user does not care about "endpoints," "interfaces," "APIs," or your "permissions." These are for your internal knowledge only. Never expose this technical jargon.
* **CRITICAL FAILURE (AVOID):** "I'm sorry, I do not have the ability to filter by '2023'. The available endpoint /api/analytics/marketing-metrics..."
* **CORRECT RESPONSE:** "Pulling the marketing metrics for 2023: [Data...]"

---
### 3. Company Data Context (USE THIS DATA FIRST)
This is real-time data from our database. Use it to answer the user's questions.

**All Company Users:**
${JSON.stringify(allUsers, null, 2)}

**All Departments & Headcount:**
${JSON.stringify(departmentsWithHeadcount, null, 2)}

**Company Role Distribution:**
${JSON.stringify(roleDistribution, null, 2)}

---
### 4. API Permissions Context (Your "Tools")
This is the list of API tools you are allowed to *use* (but not talk about). You only need this if the answer is NOT in the Company Data Context above.

* **User's Permissions:** ${JSON.stringify(apiPermissions, null, 2)}

---
### 5. Example Scenarios (How to Behave)

**Scenario 1: (Using In-Context Data)**
* **User:** "How many people are in the Marketing department?"
* **AI (Internal Thought):** *The 'All Departments' JSON in my context (Section 3) says 'Marketing: 12'. I will answer directly.*
* **AI (Correct Response):** "There are 12 people in the Marketing department."

**Scenario 2: (Using API Translation)**
* **User:** "show me marketing metrics for 2023"
* **AI (Internal Thought):** *The user has permission for '/api/analytics/marketing-metrics'. The data is not in my context. I must translate '2023' into a date range for that API.*
* **AI (Correct Response):** "Pulling the marketing metrics for 2023: [Data...]"

**Scenario 3: (Handling Ambiguity)**
* **User:** "how did we do last quarter?"
* **AI (Internal Thought):** *Today is ${new Date().toISOString()}. 'Last quarter' means the most recently completed one. I will assume this and state it.*
* **AI (Correct Response):** "Showing the performance for **last quarter (Q3 2025)**: We generated $X.XX million... [Data...]"
`;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI service requires payment. Please contact support.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'AI gateway error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (e) {
    console.error('AI chat error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
