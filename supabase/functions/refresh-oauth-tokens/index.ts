import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get all OAuth credentials that need refresh (expiring in next 5 minutes)
    const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000);
    
    const { data: credentials, error: fetchError } = await supabaseAdmin
      .from('api_credentials')
      .select('*')
      .eq('auth_type', 'oauth')
      .eq('is_active', true);

    if (fetchError) {
      throw fetchError;
    }

    const refreshResults = {
      total: credentials?.length || 0,
      refreshed: 0,
      failed: 0,
      errors: [] as string[]
    };

    if (!credentials || credentials.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No OAuth credentials to refresh', ...refreshResults }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process each credential
    for (const credential of credentials) {
      try {
        const oauthConfig = credential.credentials as any;
        
        // Check if token needs refresh
        if (!oauthConfig.expires_at || oauthConfig.expires_at > fiveMinutesFromNow) {
          continue; // Token still valid
        }

        if (!oauthConfig.refresh_token) {
          refreshResults.errors.push(`Credential ${credential.id}: No refresh token available`);
          refreshResults.failed++;
          continue;
        }

        // Refresh the token
        const tokenResponse = await fetch(oauthConfig.token_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: oauthConfig.refresh_token,
            client_id: oauthConfig.client_id,
            client_secret: oauthConfig.client_secret
          })
        });

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          refreshResults.errors.push(`Credential ${credential.id}: ${errorText}`);
          refreshResults.failed++;
          
          // Mark credential as inactive if refresh fails
          await supabaseAdmin
            .from('api_credentials')
            .update({ 
              is_active: false,
              credentials: {
                ...oauthConfig,
                status: 'refresh_failed',
                last_error: errorText
              }
            })
            .eq('id', credential.id);
          
          continue;
        }

        const tokens = await tokenResponse.json();

        // Update credential with new tokens
        const { error: updateError } = await supabaseAdmin
          .from('api_credentials')
          .update({
            credentials: {
              ...oauthConfig,
              access_token: tokens.access_token,
              refresh_token: tokens.refresh_token || oauthConfig.refresh_token, // Keep old if not provided
              token_type: tokens.token_type,
              expires_in: tokens.expires_in,
              expires_at: Date.now() + (tokens.expires_in * 1000),
              status: 'connected',
              last_refreshed: new Date().toISOString()
            },
            last_tested_at: new Date().toISOString()
          })
          .eq('id', credential.id);

        if (updateError) {
          refreshResults.errors.push(`Credential ${credential.id}: ${updateError.message}`);
          refreshResults.failed++;
        } else {
          refreshResults.refreshed++;
        }

      } catch (error) {
        console.error(`Error refreshing credential ${credential.id}:`, error);
        refreshResults.errors.push(
          `Credential ${credential.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
        refreshResults.failed++;
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Token refresh completed',
        ...refreshResults,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in refresh-oauth-tokens:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
