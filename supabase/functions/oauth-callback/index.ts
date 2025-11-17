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
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state'); // credential ID
    const error = url.searchParams.get('error');

    if (error) {
      return new Response(
        `<html>
          <body>
            <h1>Authorization Failed</h1>
            <p>Error: ${error}</p>
            <script>
              window.opener?.postMessage({ type: 'oauth-error', error: '${error}' }, '*');
              window.close();
            </script>
          </body>
        </html>`,
        { headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
      );
    }

    if (!code || !state) {
      throw new Error('Missing authorization code or state');
    }

    // Create admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the pending credential config
    const { data: credential, error: credError } = await supabaseAdmin
      .from('api_credentials')
      .select('*')
      .eq('id', state)
      .single();

    if (credError || !credential) {
      throw new Error('Invalid state parameter or credential not found');
    }

    const oauthConfig = credential.credentials as any;

    // Exchange authorization code for access token
    const tokenResponse = await fetch(oauthConfig.token_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: oauthConfig.client_id,
        client_secret: oauthConfig.client_secret,
        redirect_uri: oauthConfig.redirect_uri
      })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      throw new Error('Failed to exchange authorization code for token');
    }

    const tokens = await tokenResponse.json();

    // Update credential with tokens
    const { error: updateError } = await supabaseAdmin
      .from('api_credentials')
      .update({
        credential_name: credential.credential_name.replace('_oauth_pending', ''),
        credentials: {
          ...oauthConfig,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_type: tokens.token_type,
          expires_in: tokens.expires_in,
          expires_at: Date.now() + (tokens.expires_in * 1000),
          status: 'connected'
        },
        is_active: true,
        last_tested_at: new Date().toISOString()
      })
      .eq('id', state);

    if (updateError) {
      throw updateError;
    }

    // Return success page that notifies parent window
    return new Response(
      `<html>
        <head>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              padding: 2rem;
              border-radius: 1rem;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              text-align: center;
            }
            h1 { color: #10b981; margin: 0 0 1rem 0; }
            p { color: #6b7280; margin: 0; }
            .checkmark {
              width: 80px;
              height: 80px;
              border-radius: 50%;
              display: block;
              stroke-width: 2;
              stroke: #10b981;
              stroke-miterlimit: 10;
              margin: 10% auto;
              box-shadow: inset 0px 0px 0px #10b981;
              animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;
            }
            .checkmark__circle {
              stroke-dasharray: 166;
              stroke-dashoffset: 166;
              stroke-width: 2;
              stroke-miterlimit: 10;
              stroke: #10b981;
              fill: none;
              animation: stroke .6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
            }
            .checkmark__check {
              transform-origin: 50% 50%;
              stroke-dasharray: 48;
              stroke-dashoffset: 48;
              animation: stroke .3s cubic-bezier(0.65, 0, 0.45, 1) .8s forwards;
            }
            @keyframes stroke {
              100% { stroke-dashoffset: 0; }
            }
            @keyframes scale {
              0%, 100% { transform: none; }
              50% { transform: scale3d(1.1, 1.1, 1); }
            }
            @keyframes fill {
              100% { box-shadow: inset 0px 0px 0px 30px #10b981; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
              <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
              <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
            <h1>Authorization Successful!</h1>
            <p>You can close this window now.</p>
          </div>
          <script>
            window.opener?.postMessage({ type: 'oauth-success' }, '*');
            setTimeout(() => window.close(), 2000);
          </script>
        </body>
      </html>`,
      { headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
    );

  } catch (error) {
    console.error('OAuth callback error:', error);
    return new Response(
      `<html>
        <body>
          <h1>Authorization Failed</h1>
          <p>${error instanceof Error ? error.message : 'Unknown error occurred'}</p>
          <script>
            window.opener?.postMessage({ 
              type: 'oauth-error', 
              error: '${error instanceof Error ? error.message : 'Unknown error'}' 
            }, '*');
            setTimeout(() => window.close(), 3000);
          </script>
        </body>
      </html>`,
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'text/html' } 
      }
    );
  }
});
