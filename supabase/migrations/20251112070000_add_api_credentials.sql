-- Create table for API credentials (role-based)
CREATE TABLE IF NOT EXISTS public.api_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE NOT NULL,
  credential_name TEXT NOT NULL,
  api_endpoint TEXT NOT NULL,
  auth_type TEXT NOT NULL DEFAULT 'bearer', -- 'bearer', 'api_key', 'oauth'
  credentials JSONB NOT NULL DEFAULT '{}'::jsonb, -- Encrypted credentials stored here
  is_active BOOLEAN DEFAULT true,
  last_tested_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role_id, credential_name)
);

-- Add can_read and can_write to role_api_permissions if they don't exist
ALTER TABLE public.role_api_permissions 
  ADD COLUMN IF NOT EXISTS can_read BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS can_write BOOLEAN DEFAULT false;

-- Enable RLS
ALTER TABLE public.api_credentials ENABLE ROW LEVEL SECURITY;

-- RLS Policies for api_credentials
CREATE POLICY "Admins can manage all API credentials"
  ON public.api_credentials FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Users can view credentials for their roles"
  ON public.api_credentials FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role_id = api_credentials.role_id
    )
  );

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_api_credentials_role_id ON public.api_credentials(role_id);
CREATE INDEX IF NOT EXISTS idx_api_credentials_is_active ON public.api_credentials(is_active) WHERE is_active = true;

-- Trigger for updated_at
CREATE TRIGGER update_api_credentials_updated_at
BEFORE UPDATE ON public.api_credentials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to get credentials for a user's role
CREATE OR REPLACE FUNCTION public.get_user_api_credentials(user_id UUID)
RETURNS TABLE (
  credential_id UUID,
  credential_name TEXT,
  api_endpoint TEXT,
  auth_type TEXT,
  credentials JSONB
)
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    ac.id,
    ac.credential_name,
    ac.api_endpoint,
    ac.auth_type,
    ac.credentials
  FROM public.api_credentials ac
  JOIN public.user_roles ur ON ac.role_id = ur.role_id
  WHERE ur.user_id = $1
    AND ac.is_active = true;
$$;

