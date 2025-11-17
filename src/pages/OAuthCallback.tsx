import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function OAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Get URL parameters
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');

    // Call edge function to handle OAuth callback
    const handleCallback = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/oauth-callback?${params.toString()}`,
          {
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
            }
          }
        );

        // The edge function returns HTML that handles postMessage
        // This page just needs to exist for the OAuth redirect
        
      } catch (err) {
        console.error('OAuth callback error:', err);
        // Redirect back to dashboard on error
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    };

    if (code || error) {
      handleCallback();
    }
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Completing authorization...</p>
      </div>
    </div>
  );
}
