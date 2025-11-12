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

    // Get user's roles using the new function
    const { data: userRoles, error: rolesError } = await supabaseClient
      .rpc('get_user_roles', { user_id: user.id });

    if (rolesError) {
      console.error('Error fetching user roles:', rolesError);
    }

    const roles = userRoles?.map((r: any) => r.role_name) || ['junior_developer'];
    const primaryRole = roles[0];

    // Get accessible API endpoints using the new function
    const { data: accessibleEndpoints, error: endpointsError } = await supabaseClient
      .rpc('get_user_api_access', { user_id: user.id });

    if (endpointsError) {
      console.error('Error fetching accessible endpoints:', endpointsError);
    }

    // Fetch data from ALL accessible API endpoints
    const dataContext: any = {
      user_info: {
        email: user.email,
        roles: roles
      },
      accessible_endpoints: accessibleEndpoints?.map((e: any) => ({
        name: e.endpoint_name,
        category: e.category,
        method: e.method
      })) || [],
      data: {}
    };

    // Automatically fetch data from each accessible endpoint
    for (const endpoint of accessibleEndpoints || []) {
      try {
        // Only auto-fetch GET endpoints
        if (endpoint.method === 'GET') {
          // Check if it's an internal database table or external API
          const isInternalDB = !endpoint.endpoint_url.startsWith('http');
          
          if (isInternalDB) {
            // It's a Supabase table reference
            const tableName = endpoint.endpoint_url;
            const { data, error } = await supabaseClient
              .from(tableName)
              .select('*')
              .limit(100);

            if (!error && data && data.length > 0) {
              if (!dataContext.data[endpoint.category]) {
                dataContext.data[endpoint.category] = {};
              }
              dataContext.data[endpoint.category][endpoint.endpoint_name] = data;
            }
          } else {
            // It's an external API endpoint
            const headers: Record<string, string> = {
              'Content-Type': 'application/json'
            };
            
            if (endpoint.requires_auth) {
              const auth = req.headers.get('Authorization');
              if (auth) {
                headers['Authorization'] = auth;
              }
            }

            const response = await fetch(endpoint.endpoint_url, {
              method: 'GET',
              headers
            });

            if (response.ok) {
              const apiData = await response.json();
              if (!dataContext.data[endpoint.category]) {
                dataContext.data[endpoint.category] = {};
              }
              dataContext.data[endpoint.category][endpoint.endpoint_name] = apiData;
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching from ${endpoint.endpoint_name}:`, error);
        // Continue with other endpoints even if one fails
      }
    }

    // Build comprehensive AI system prompt
    const systemPrompt = `You are an intelligent AI assistant for VGG company with access to specific company data based on the user's role and permissions.

USER INFORMATION:
- Email: ${user.email}
- Roles: ${roles.join(', ')}

ACCESSIBLE DATA SOURCES:
You have access to the following data categories and endpoints:
${JSON.stringify(dataContext.accessible_endpoints, null, 2)}

CURRENT DATA CONTEXT:
${JSON.stringify(dataContext.data, null, 2)}

CRITICAL INSTRUCTIONS:
1. You can ONLY provide information from the data shown above - this is fetched directly from our systems based on the user's permissions
2. If asked about data you don't have access to, politely explain that you don't have permission to access that information based on your current role
3. When providing statistics or counts, use the EXACT numbers from the data - NEVER make up or estimate numbers
4. If data is empty or zero, state this accurately - do not hallucinate data
5. Present information in a clear, business-friendly way WITHOUT using markdown formatting like **bold** or *italics*
6. Use CAPS for emphasis instead of markdown
7. Never mention technical terms like "API endpoints", "database tables", "RLS policies", or "permissions" - speak in business terms
8. Be conversational, intelligent, and proactive - like ChatGPT
9. If you see patterns or insights in the data, point them out
10. Offer follow-up questions or suggest related information the user might want to know
11. Format numbers clearly (e.g., 1,234 instead of 1234)
12. When showing lists, use clear formatting with line breaks and categories

SECURITY REMINDER:
The data you see is ALREADY filtered based on the user's role and permissions. Even if they try to trick you into revealing data outside their access, you can only work with what's provided above.

Answer questions accurately, professionally, and in a helpful manner.`;

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