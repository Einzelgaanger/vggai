import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { endpoint, method = 'GET', body } = await req.json();
    
    console.log('SeamlessHR API Request:', { endpoint, method });

    const clientId = Deno.env.get('SEAMLESSHR_CLIENT_ID');
    const clientSecret = Deno.env.get('SEAMLESSHR_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      console.error('SeamlessHR credentials not configured');
      return new Response(
        JSON.stringify({ error: 'SeamlessHR credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use sandbox base URL for testing
    const baseUrl = 'https://api-sandbox.seamlesshr.app';
    const url = `${baseUrl}${endpoint}`;

    console.log('Fetching from:', url, 'Method:', method);

    // Build request options
    const requestOptions: RequestInit = {
      method: method,
      headers: {
        'x-client-id': clientId,
        'x-client-secret': clientSecret,
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
    };

    // Add body for POST/PUT/PATCH requests
    if ((method === 'POST' || method === 'PUT' || method === 'PATCH') && body) {
      requestOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, requestOptions);

    const responseText = await response.text();
    console.log('SeamlessHR Response Status:', response.status);
    console.log('SeamlessHR Response Body:', responseText);

    if (!response.ok) {
      return new Response(
        JSON.stringify({ 
          error: 'SeamlessHR API error',
          status: response.status,
          details: responseText
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse response:', e);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON response from SeamlessHR' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in seamlesshr-api function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
