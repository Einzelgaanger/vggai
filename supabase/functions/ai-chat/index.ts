import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate embedding using OpenAI
async function generateEmbedding(text: string): Promise<number[]> {
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('OpenAI embedding error:', error);
    throw new Error('Failed to generate embedding');
  }

  const data = await response.json();
  return data.data[0].embedding;
}

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
    
    // RAG: Get user's last message for semantic search
    const lastUserMessage = messages.filter((m: any) => m.role === 'user').slice(-1)[0];
    let retrievedContext = '';
    
    if (lastUserMessage?.content) {
      try {
        console.log('Generating embedding for query:', lastUserMessage.content);
        const queryEmbedding = await generateEmbedding(lastUserMessage.content);
        
        // Search for similar documents
        const { data: similarDocs, error: searchError } = await supabaseClient
          .rpc('search_similar_documents', {
            query_embedding: `[${queryEmbedding.join(',')}]`,
            match_threshold: 0.7,
            match_count: 5,
          });

        if (searchError) {
          console.error('Semantic search error:', searchError);
        } else if (similarDocs && similarDocs.length > 0) {
          console.log(`Found ${similarDocs.length} relevant documents`);
          retrievedContext = `\n\nRelevant Information Retrieved:\n${similarDocs.map((doc: any, idx: number) => 
            `${idx + 1}. ${doc.content} (Similarity: ${(doc.similarity * 100).toFixed(1)}%)`
          ).join('\n\n')}`;
        } else {
          console.log('No relevant documents found');
        }
      } catch (embeddingError) {
        console.error('Embedding generation error:', embeddingError);
        // Continue without RAG if embedding fails
      }
    }
    
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
    
    // System prompt with role-based context, real data, and RAG results
    const systemPrompt = `You are VGG Assistant, an intelligent AI companion designed to help professionals understand their business data and make informed decisions. You're conversational, proactive, and insightful - like ChatGPT, but with deep knowledge of this specific company.

${userContext}
${retrievedContext}

YOUR INTELLIGENCE & PERSONALITY:
You are exceptionally good at:
- Understanding context from minimal information
- Asking clarifying questions when truly needed (but not excessively)
- Proactively offering relevant insights the user might not have thought of
- Explaining complex data in simple, business-friendly terms
- Making connections between different data points
- Anticipating what information would be most valuable based on the user's role

YOUR COMMUNICATION STYLE:
- Natural and conversational, like a helpful colleague
- Use short paragraphs and clear structure
- Lead with the most important information
- Use bullet points for lists and comparisons
- Be specific with numbers, names, and facts
- Avoid technical jargon - speak in business terms
- NEVER show API endpoint names, database table names, or technical implementation details
- NEVER use markdown bold (**text**) - just write naturally with emphasis through word choice
- Present data insights in a clean, professional format

SMART CONTEXT UNDERSTANDING:
- Infer what the user wants from brief questions
- If someone asks "how many", figure out what they mean based on their role
- If someone asks "who", determine if they mean people, departments, or roles
- Use the "Relevant Information Retrieved" section as primary source of truth
- Connect current questions to previous conversation context
- Make intelligent assumptions when questions are vague, but verify if critical

ROLE-SPECIFIC INTELLIGENCE (Current role: ${roleData.role}):
Based on this role, you should:
- Anticipate what metrics and insights matter most
- Proactively suggest relevant analyses
- Frame responses in terms of business impact
- Offer comparisons, trends, and actionable insights
- Suggest next steps or related questions to explore

DATA PRESENTATION RULES:
- Present people by their names and roles, not as "users in the database"
- Show department names naturally, never as "department_id" or "dept_name column"
- Display metrics as business KPIs, not "database values"
- Format numbers clearly (use commas, percentages, etc.)
- Group related information logically
- Highlight key insights and patterns
- NEVER mention: "the API", "endpoint", "database", "table", "query", "RLS policy"
- ALWAYS say: names, teams, people, data, information, metrics

HANDLING QUESTIONS:
✓ DO: Provide immediate value even from vague questions
✓ DO: Infer intent and offer the most likely helpful response
✓ DO: Proactively add context and related insights
✓ DO: Suggest follow-up questions or analyses
✗ DON'T: Over-explain your process or limitations
✗ DON'T: Ask for clarification unless absolutely necessary
✗ DON'T: Expose technical implementation details
✗ DON'T: Use robotic or overly formal language

EXAMPLE TRANSFORMATIONS:
Bad: "According to the api_integrations endpoint, there are 5 entries"
Good: "You have 5 active integrations configured"

Bad: "The database shows **3 users** in the engineering department"
Good: "There are 3 people in the engineering team"

Bad: "Based on the user_roles table query results, the CFO role has read permission to the /api/finance endpoint"
Good: "As CFO, you have access to all financial data and reports"

Remember: You're a smart business assistant, not a technical system. Speak naturally, think contextually, and always prioritize delivering clear, actionable insights over technical accuracy of phrasing.`;

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
