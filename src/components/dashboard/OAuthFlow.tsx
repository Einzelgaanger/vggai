import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink, Loader2 } from "lucide-react";

interface OAuthFlowProps {
  roleId: string;
  credentialName: string;
  apiEndpoint: string;
  onSuccess: () => void;
}

export function OAuthFlow({ roleId, credentialName, apiEndpoint, onSuccess }: OAuthFlowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthConfig, setOauthConfig] = useState({
    client_id: "",
    client_secret: "",
    authorization_url: "",
    token_url: "",
    redirect_uri: `${window.location.origin}/oauth/callback`,
    scope: ""
  });
  const { toast } = useToast();

  const initiateOAuthFlow = async () => {
    if (!oauthConfig.client_id || !oauthConfig.authorization_url) {
      toast({
        title: "Error",
        description: "Client ID and Authorization URL are required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Store OAuth config temporarily in database
      const { data: tempConfig, error: configError } = await supabase
        .from('api_credentials')
        .insert({
          role_id: roleId,
          credential_name: `${credentialName}_oauth_pending`,
          api_endpoint: apiEndpoint,
          auth_type: 'oauth',
          credentials: {
            ...oauthConfig,
            status: 'pending'
          },
          is_active: false
        })
        .select()
        .single();

      if (configError) throw configError;

      // Build OAuth URL
      const state = tempConfig.id; // Use credential ID as state for security
      const params = new URLSearchParams({
        client_id: oauthConfig.client_id,
        redirect_uri: oauthConfig.redirect_uri,
        response_type: 'code',
        scope: oauthConfig.scope,
        state
      });

      const authUrl = `${oauthConfig.authorization_url}?${params.toString()}`;

      // Open OAuth provider in new window
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      const oauthWindow = window.open(
        authUrl,
        'OAuth Authorization',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Listen for OAuth callback
      const handleMessage = async (event: MessageEvent) => {
        if (event.data.type === 'oauth-success') {
          window.removeEventListener('message', handleMessage);
          setIsOpen(false);
          setLoading(false);
          toast({
            title: "Success",
            description: "OAuth connection established successfully"
          });
          onSuccess();
        } else if (event.data.type === 'oauth-error') {
          window.removeEventListener('message', handleMessage);
          setLoading(false);
          toast({
            title: "Error",
            description: event.data.error || "OAuth authorization failed",
            variant: "destructive"
          });
        }
      };

      window.addEventListener('message', handleMessage);

      // Check if window was closed without completing
      const checkClosed = setInterval(() => {
        if (oauthWindow?.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
          setLoading(false);
        }
      }, 1000);

    } catch (error) {
      console.error('Error initiating OAuth:', error);
      toast({
        title: "Error",
        description: "Failed to start OAuth flow",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="outline">
        <ExternalLink className="h-4 w-4 mr-2" />
        Connect with OAuth
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Configure OAuth 2.0</DialogTitle>
            <DialogDescription>
              Enter your OAuth provider details to establish a secure connection.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="client-id">Client ID *</Label>
              <Input
                id="client-id"
                value={oauthConfig.client_id}
                onChange={(e) => setOauthConfig({ ...oauthConfig, client_id: e.target.value })}
                placeholder="Enter your OAuth client ID"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-secret">Client Secret *</Label>
              <Input
                id="client-secret"
                type="password"
                value={oauthConfig.client_secret}
                onChange={(e) => setOauthConfig({ ...oauthConfig, client_secret: e.target.value })}
                placeholder="Enter your OAuth client secret"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="auth-url">Authorization URL *</Label>
              <Input
                id="auth-url"
                value={oauthConfig.authorization_url}
                onChange={(e) => setOauthConfig({ ...oauthConfig, authorization_url: e.target.value })}
                placeholder="https://provider.com/oauth/authorize"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="token-url">Token URL *</Label>
              <Input
                id="token-url"
                value={oauthConfig.token_url}
                onChange={(e) => setOauthConfig({ ...oauthConfig, token_url: e.target.value })}
                placeholder="https://provider.com/oauth/token"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="redirect-uri">Redirect URI (Read-only)</Label>
              <Input
                id="redirect-uri"
                value={oauthConfig.redirect_uri}
                readOnly
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Configure this URL in your OAuth provider settings
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scope">Scope</Label>
              <Input
                id="scope"
                value={oauthConfig.scope}
                onChange={(e) => setOauthConfig({ ...oauthConfig, scope: e.target.value })}
                placeholder="read write profile (space-separated)"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={initiateOAuthFlow} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Authorize
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
