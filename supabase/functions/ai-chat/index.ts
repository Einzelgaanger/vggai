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
    
    // System prompt with role-based context
    const systemPrompt = `You are an AI assistant for a corporate dashboard system. 
The user has the role: ${roleData.role}
They have access to the following API endpoints: ${allowedEndpoints.join(', ')}

When answering questions:
1. Only provide information about data they have access to
2. If they ask about restricted data, politely inform them it's not available for their role
3. Be professional, concise, and helpful
4. Provide insights based on the analytics they can access

Available endpoints explain what data the user can query:
- /api/analytics/company-overview: Company-wide metrics and KPIs
- /api/analytics/financial-metrics: Revenue, expenses, profit margins
- /api/analytics/employee-stats: Headcount, turnover, satisfaction
- /api/analytics/sales-performance: Sales data, quotas, conversions
- /api/analytics/tech-metrics: System performance, deployments, bugs
- /api/analytics/project-status: Project timelines and completion
- /api/analytics/team-performance: Team productivity metrics
- /api/analytics/budget-overview: Budget allocations and spending
- /api/analytics/expense-reports: Detailed expense tracking
- /api/analytics/recruitment-metrics: Hiring pipeline and time-to-hire
- /api/analytics/performance-reviews: Employee review data
- /api/analytics/product-metrics: Product usage and adoption
- /api/analytics/user-engagement: User activity metrics
- /api/analytics/pipeline-metrics: Sales pipeline health
- /api/analytics/marketing-metrics: Campaign performance
- /api/analytics/campaign-performance: Individual campaign results
- /api/analytics/operations-metrics: Operational efficiency
- /api/analytics/efficiency-stats: Process efficiency data
- /api/analytics/support-metrics: Support team performance
- /api/analytics/ticket-stats: Ticket volume and resolution
- /api/analytics/data-insights: Advanced analytics
- /api/analytics/reporting: Custom report generation
- /api/analytics/system-health: Infrastructure health
- /api/analytics/security-metrics: Security incidents and audits`;

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
