import { supabase } from "@/integrations/supabase/client";

interface APICredential {
  credential_name: string;
  api_endpoint: string;
  auth_type: string;
  credentials: {
    bearer_token?: string;
    api_key?: string;
    api_secret?: string;
    client_id?: string;
    client_secret?: string;
  };
}

interface APIEndpoint {
  endpoint_name: string;
  endpoint_url: string;
  method: string;
  category: string;
}

/**
 * Fetches data from external APIs based on user's role and permissions
 */
export async function fetchAPIData(userId: string, endpointName?: string) {
  try {
    // Get user's API credentials
    const { data: credentials, error: credError } = await supabase
      .rpc('get_user_api_credentials', { user_id: userId });

    if (credError) {
      console.error('Error fetching credentials:', credError);
      return null;
    }

    // Get accessible endpoints
    const { data: endpoints, error: endpointError } = await supabase
      .rpc('get_user_api_access', { user_id: userId });

    if (endpointError) {
      console.error('Error fetching endpoints:', endpointError);
      return null;
    }

    // Filter by endpoint name if provided
    const targetEndpoints = endpointName
      ? endpoints?.filter((e: any) => e.endpoint_name === endpointName) || []
      : endpoints || [];

    const apiData: Record<string, any> = {};

    // Fetch data from each accessible endpoint
    for (const endpoint of targetEndpoints) {
      if (endpoint.method !== 'GET') continue;

      // Find matching credential
      const credential = credentials?.find((cred: APICredential) => {
        const endpointUrl = endpoint.endpoint_url.toLowerCase();
        const credEndpoint = cred.api_endpoint.toLowerCase();
        return endpointUrl.startsWith(credEndpoint) || credEndpoint.startsWith(endpointUrl);
      });

      if (!credential) {
        console.log(`No credential found for ${endpoint.endpoint_name}`);
        continue;
      }

      // Build headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Apply authentication
      if (credential.auth_type === 'bearer' && credential.credentials.bearer_token) {
        headers['Authorization'] = `Bearer ${credential.credentials.bearer_token}`;
      } else if (credential.auth_type === 'api_key') {
        if (credential.credentials.api_key) {
          headers['X-API-Key'] = credential.credentials.api_key;
        }
        if (credential.credentials.api_secret) {
          headers['X-API-Secret'] = credential.credentials.api_secret;
        }
      } else if (credential.auth_type === 'client_credentials' || credential.auth_type === 'seamlesshr') {
        // SeamlessHR uses x-client-id and x-client-secret headers
        if (credential.credentials.client_id) {
          headers['x-client-id'] = credential.credentials.client_id;
        }
        if (credential.credentials.client_secret) {
          headers['x-client-secret'] = credential.credentials.client_secret;
        }
      }

      try {
        const response = await fetch(endpoint.endpoint_url, {
          method: 'GET',
          headers,
        });

        if (response.ok) {
          const data = await response.json();
          apiData[endpoint.endpoint_name] = data;
        } else {
          console.error(`API call failed for ${endpoint.endpoint_name}: ${response.status}`);
        }
      } catch (error) {
        console.error(`Error fetching ${endpoint.endpoint_name}:`, error);
      }
    }

    return apiData;
  } catch (error) {
    console.error('Error in fetchAPIData:', error);
    return null;
  }
}

/**
 * Fetches specific metric from API data
 */
export function extractMetric(apiData: any, path: string): number | string {
  if (!apiData) return 0;
  
  const keys = path.split('.');
  let value = apiData;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return 0;
    }
  }
  
  return value || 0;
}

/**
 * Calculates percentage change (mock for now, should use historical data)
 */
export function calculateChange(current: number, previous: number = 0): string {
  if (previous === 0) return "+0%";
  const change = ((current - previous) / previous) * 100;
  return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
}

