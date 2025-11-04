import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    console.error('OpenAI API error:', error);
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
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create client with user's auth to verify permissions
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user is admin
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    // Only CEOs and CTOs can generate embeddings
    if (!roleData || !['ceo', 'cto'].includes(roleData.role)) {
      return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Starting embedding generation...');

    // Clear old embeddings
    await supabaseAdmin
      .from('document_embeddings')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    let totalEmbeddings = 0;

    // Generate embeddings for profiles
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('*, departments(name)');

    if (profiles) {
      console.log(`Processing ${profiles.length} profiles...`);
      for (const profile of profiles) {
        const deptName = (profile.departments as any)?.name || 'No department';
        const content = `User Profile: ${profile.full_name} (${profile.email})
Department: ${deptName}
ID: ${profile.id}`;

        const embedding = await generateEmbedding(content);
        
        await supabaseAdmin
          .from('document_embeddings')
          .insert({
            content,
            embedding: `[${embedding.join(',')}]`,
            metadata: {
              type: 'profile',
              email: profile.email,
              full_name: profile.full_name,
              department: deptName,
            },
            source_table: 'profiles',
            source_id: profile.id,
          });
        
        totalEmbeddings++;
      }
    }

    // Generate embeddings for departments
    const { data: departments } = await supabaseAdmin
      .from('departments')
      .select('*');

    if (departments) {
      console.log(`Processing ${departments.length} departments...`);
      for (const dept of departments) {
        const content = `Department: ${dept.name}
Description: ${dept.description || 'No description'}
ID: ${dept.id}`;

        const embedding = await generateEmbedding(content);
        
        await supabaseAdmin
          .from('document_embeddings')
          .insert({
            content,
            embedding: `[${embedding.join(',')}]`,
            metadata: {
              type: 'department',
              name: dept.name,
              description: dept.description,
            },
            source_table: 'departments',
            source_id: dept.id,
          });
        
        totalEmbeddings++;
      }
    }

    // Generate embeddings for roles
    const { data: userRoles } = await supabaseAdmin
      .from('user_roles')
      .select('*, profiles(email, full_name)');

    if (userRoles) {
      console.log(`Processing ${userRoles.length} user roles...`);
      const roleGroups: Record<string, string[]> = {};
      
      for (const ur of userRoles) {
        if (!roleGroups[ur.role]) {
          roleGroups[ur.role] = [];
        }
        const profile = ur.profiles as any;
        roleGroups[ur.role].push(`${profile?.full_name} (${profile?.email})`);
      }

      for (const [role, users] of Object.entries(roleGroups)) {
        const content = `Role: ${role}
Users with this role: ${users.join(', ')}
Total count: ${users.length}`;

        const embedding = await generateEmbedding(content);
        
        await supabaseAdmin
          .from('document_embeddings')
          .insert({
            content,
            embedding: `[${embedding.join(',')}]`,
            metadata: {
              type: 'role_summary',
              role,
              user_count: users.length,
            },
            source_table: 'user_roles',
            source_id: null,
          });
        
        totalEmbeddings++;
      }
    }

    console.log(`Successfully generated ${totalEmbeddings} embeddings`);

    return new Response(
      JSON.stringify({
        success: true,
        embeddings_created: totalEmbeddings,
        message: 'Embeddings generated successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (e) {
    console.error('Generate embeddings error:', e);
    return new Response(
      JSON.stringify({ 
        error: e instanceof Error ? e.message : 'Unknown error',
        details: e instanceof Error ? e.stack : undefined,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
