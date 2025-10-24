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
    
    // Fetch actual database data based on role
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

    // Build comprehensive context with real data
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
${permissions?.map(p => `- ${p.api_endpoint} (Read: ${p.can_read}, Write: ${p.can_write})`).join('\n') || 'No permissions'}`;
    
    // System prompt with role-based context and real data
    const systemPrompt = `You are an AI assistant for a corporate dashboard system with access to real company data.

${userContext}

Your capabilities:
1. Answer questions about company data, users, departments, and roles
2. Provide insights based on the user's role and permissions
3. Explain what data the user has access to
4. Help with analytics and reporting based on available data
5. Be professional, accurate, and helpful

Important guidelines:
- You have access to REAL data from the database shown above
- Only discuss data the user has permission to access
- Be specific and use actual numbers/names from the data
- If asked about data not in your context, explain what you do have access to
- Suggest relevant insights based on the role: ${roleData.role}

When the user asks about metrics or analytics, provide specific information based on the data above.`;

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
