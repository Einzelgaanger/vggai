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
    const { integration_id } = await req.json();
    
    if (!integration_id) {
      return new Response(JSON.stringify({ error: 'integration_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase clients
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify user has permissions
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get integration details
    const { data: integration, error: integrationError } = await supabaseAdmin
      .from('api_integrations')
      .select('*')
      .eq('id', integration_id)
      .single();

    if (integrationError || !integration) {
      return new Response(JSON.stringify({ error: 'Integration not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Starting sync for integration:', integration.integration_name);

    // Simulate API call to external endpoint
    // In production, you would actually call the external API here
    try {
      const response = await fetch(integration.endpoint_url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add auth headers based on integration.auth_type
        },
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const externalData = await response.json();
      console.log('Fetched data from external API:', externalData);

      // Transform and save data as metrics
      // This is a simplified example - adapt to your actual data structure
      if (Array.isArray(externalData) || typeof externalData === 'object') {
        const metricsToInsert = [];

        // Example: Parse revenue data
        if (externalData.revenue) {
          metricsToInsert.push({
            company_id: integration.company_id,
            metric_type: 'revenue',
            metric_value: externalData.revenue,
            metric_unit: '$',
            metadata: { source: integration.integration_name },
          });
        }

        // Example: Parse user count
        if (externalData.users) {
          metricsToInsert.push({
            company_id: integration.company_id,
            metric_type: 'users',
            metric_value: externalData.users,
            metric_unit: 'count',
            metadata: { source: integration.integration_name },
          });
        }

        if (metricsToInsert.length > 0) {
          const { error: insertError } = await supabaseAdmin
            .from('metrics')
            .insert(metricsToInsert);

          if (insertError) {
            console.error('Error inserting metrics:', insertError);
            throw insertError;
          }

          console.log(`Inserted ${metricsToInsert.length} metrics`);
        }
      }

      // Update last sync time
      await supabaseAdmin
        .from('api_integrations')
        .update({ last_sync_at: new Date().toISOString() })
        .eq('id', integration_id);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Sync completed successfully',
          metrics_inserted: 2, // Example count
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (apiError) {
      console.error('API sync error:', apiError);
      return new Response(
        JSON.stringify({
          error: 'Failed to sync with external API',
          details: apiError instanceof Error ? apiError.message : 'Unknown error',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (e) {
    console.error('Sync API error:', e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
