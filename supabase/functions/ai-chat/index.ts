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

    // Get user's role
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

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

    const allowedEndpoints = permissions?.map(p => p.api_endpoint) || [];
    
    // Fetch ALL actual database data that user can access
    const { data: profileData } = await supabaseClient
      .from('profiles')
      .select('*, departments(name)')
      .eq('id', user.id)
      .single();

    const { data: allProfiles } = await supabaseClient
      .from('profiles')
      .select('id, email, full_name, departments(name)');

    const { data: allDepartments } = await supabaseClient
      .from('departments')
      .select('*');

    const { data: allRoles } = await supabaseClient
      .from('user_roles')
      .select('role, profiles(email, full_name)');

    // Fetch additional business data
    const { data: companies } = await supabaseClient
      .from('companies')
      .select('*');

    const { data: apiIntegrations } = await supabaseClient
      .from('api_integrations')
      .select('*');

    const { data: metrics } = await supabaseClient
      .from('metrics')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);

    const { data: workflows } = await supabaseClient
      .from('workflows')
      .select('*');

    // Build comprehensive context with ALL real data
    const userDeptName = (profileData?.departments as any)?.name || 'Not assigned';
    const userContext = `
User Profile:
- Email: ${profileData?.email}
- Full Name: ${profileData?.full_name}
- Department: ${userDeptName}
- Role: ${roleData.role}

Department Information:
${allDepartments?.map(d => `- ${d.name}: ${d.description || 'No description'}`).join('\n') || 'No departments found'}

Company Users (${allProfiles?.length || 0} total):
${allProfiles?.slice(0, 10).map(p => {
  const deptName = (p.departments as any)?.name || 'No dept';
  return `- ${p.full_name} (${p.email}) - ${deptName}`;
}).join('\n') || 'No users found'}
${allProfiles && allProfiles.length > 10 ? `... and ${allProfiles.length - 10} more users` : ''}

Role Distribution:
${allRoles?.reduce((acc: any, r: any) => {
  acc[r.role] = (acc[r.role] || 0) + 1;
  return acc;
}, {}) ? Object.entries(allRoles?.reduce((acc: any, r: any) => {
  acc[r.role] = (acc[r.role] || 0) + 1;
  return acc;
}, {})).map(([role, count]) => `- ${role}: ${count} user(s)`).join('\n') : 'No role data'}

API Access:
${permissions?.map(p => `- ${p.api_endpoint} (Read: ${p.can_read}, Write: ${p.can_write})`).join('\n') || 'No permissions'}

Companies (${companies?.length || 0} total):
${companies?.map(c => `- ${c.name}: ${c.description || 'No description'}`).join('\n') || 'No companies found'}

API Integrations (${apiIntegrations?.length || 0} total):
${apiIntegrations?.map(i => `- ${i.name} (${i.integration_type}): ${i.status} - ${i.endpoint_url}`).join('\n') || 'No integrations configured'}

Recent Metrics (${metrics?.length || 0} data points):
${metrics?.slice(0, 10).map(m => `- ${m.metric_name}: ${m.metric_value} (${new Date(m.timestamp).toLocaleDateString()})`).join('\n') || 'No metrics data'}

Workflows (${workflows?.length || 0} total):
${workflows?.map(w => `- ${w.name}: ${w.status} - Frequency: ${w.schedule_frequency}`).join('\n') || 'No workflows configured'}`;
    
    // System prompt with role-based context and ALL real data
    const systemPrompt = `You are VGG Assistant, an exceptionally intelligent AI companion - like ChatGPT, but with complete knowledge of this company's real business data. You're insightful, proactive, and conversational.

CRITICAL DATA RULES:
1. ALL data shown above is REAL, LIVE data from the company database
2. You MUST use ONLY this actual data - NEVER make up fake information
3. When users ask for reports or data, show them THIS real data, not fictional examples
4. Present data clearly using proper formatting (use simple text emphasis, NO markdown symbols like ** or *)

${userContext}

YOUR INTELLIGENCE & PERSONALITY:
You are exceptionally good at:
- Understanding context from minimal information
- Asking clarifying questions when truly needed (but not excessively)
- Proactively offering relevant insights the user might not have thought of
- Explaining complex data in simple, business-friendly terms
- Making connections between different data points
- Anticipating what information would be most valuable based on the user's role

YOUR COMMUNICATION STYLE:
- Be direct and immediately helpful - like ChatGPT, provide value instantly
- DO NOT ask unnecessary clarifying questions - infer intent and deliver answers
- Lead with concrete data and insights from the REAL information above
- Use short, scannable paragraphs with clear structure
- For emphasis, use natural language or simple formatting (capitalize, use line breaks)
- NEVER use markdown syntax like **bold** or *italic* - these show as ugly symbols
- For important terms, just CAPITALIZE THEM or put them on their own line
- Use bullet points with simple dashes (-)
- Be specific with actual numbers, real names, and real facts from the data
- NEVER mention: "API endpoints", "database tables", "queries", "technical implementation"
- NEVER make up fake data - only use the REAL data provided above

SMART CONTEXT UNDERSTANDING:
- When someone asks for data, reports, or information: IMMEDIATELY show them the REAL data above
- Don't ask "would you like me to check?" - JUST SHOW THEM THE DATA
- Infer intent from brief questions and provide complete, detailed answers
- If they ask about "data I have access to" - show ALL relevant real data sections
- When showing data, format it clearly with actual values, counts, and details
- Be proactive: if they ask about one thing, mention related insights they might find useful

ROLE-SPECIFIC INTELLIGENCE (Current role: ${roleData.role}):
Based on this role, you should:
- Anticipate what metrics and insights matter most
- Proactively suggest relevant analyses
- Frame responses in terms of business impact
- Offer comparisons, trends, and actionable insights
- Suggest next steps or related questions to explore

DATA PRESENTATION RULES:
- Show the ACTUAL data from above - real numbers, real names, real values
- Present people by their actual names and roles from the data
- Show real department names, company names, metrics values
- Format clearly: use line breaks, section headers (in CAPS), and spacing
- When listing data, include ALL relevant details (counts, dates, statuses)
- NEVER say "for example" or give hypothetical data - everything must be real
- NEVER mention: "API", "endpoint", "database", "table", "query", "technical details"
- ALWAYS use: actual names, real numbers, specific data points from above

HANDLING QUESTIONS:
When user asks for "data", "report", "information I can access":
1. IMMEDIATELY show all relevant real data sections
2. Include actual counts, names, values from the data above
3. Format clearly with sections and proper spacing
4. Do NOT ask if they want to see it - JUST SHOW IT
5. After showing data, offer insights or ask what they want to explore further

EXAMPLE RESPONSES:

User: "show me data I can access"
Bad: "I can help you with that! Would you like me to check what data you have access to?"
Good: "Here's everything you have access to:

TEAM OVERVIEW
You're in the Technology department with 12 other people. Your company has 45 people total across 5 departments.

COMPANIES
You have 3 child companies configured:
- Acme Corp: Manufacturing division
- Beta Labs: R&D subsidiary  
- Gamma Services: Customer support arm

API INTEGRATIONS  
5 active integrations running:
- Salesforce CRM (Active) - Last sync 2 hours ago
- Stripe Payments (Active) - Processing transactions
- SendGrid Email (Active) - Sending notifications
- Slack Workspace (Active) - Team communications
- GitHub Repos (Active) - Code management

What would you like to explore in more detail?"

Remember: BE LIKE CHATGPT - smart, direct, helpful, using REAL data only. No technical jargon, no markdown syntax, just clear and useful information.`;

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
