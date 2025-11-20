-- Multi-Company Full Implementation Migration

-- Add company_id to api_credentials
ALTER TABLE api_credentials 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;

-- Update unique constraint for api_credentials
ALTER TABLE api_credentials
DROP CONSTRAINT IF EXISTS api_credentials_role_id_credential_name_key;

ALTER TABLE api_credentials
DROP CONSTRAINT IF EXISTS api_credentials_unique;

ALTER TABLE api_credentials
ADD CONSTRAINT api_credentials_unique 
UNIQUE(role_id, company_id, credential_name);

-- Add company_id to api_endpoints
ALTER TABLE api_endpoints
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;

-- Update unique constraint for api_endpoints
ALTER TABLE api_endpoints
DROP CONSTRAINT IF EXISTS api_endpoints_name_key;

ALTER TABLE api_endpoints
DROP CONSTRAINT IF EXISTS api_endpoints_unique;

ALTER TABLE api_endpoints
ADD CONSTRAINT api_endpoints_unique
UNIQUE(company_id, name);

-- Add company_id to role_api_permissions
ALTER TABLE role_api_permissions
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;

-- Update unique constraint for role_api_permissions
ALTER TABLE role_api_permissions
DROP CONSTRAINT IF EXISTS role_api_permissions_role_id_api_endpoint_id_key;

ALTER TABLE role_api_permissions
DROP CONSTRAINT IF EXISTS role_api_permissions_unique;

ALTER TABLE role_api_permissions
ADD CONSTRAINT role_api_permissions_unique
UNIQUE(role_id, company_id, api_endpoint_id);

-- Create user_company_access table
CREATE TABLE IF NOT EXISTS user_company_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, company_id, role_id)
);

-- Enable RLS on user_company_access
ALTER TABLE user_company_access ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_company_access
CREATE POLICY "Users can view their own company access"
  ON user_company_access FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage company access"
  ON user_company_access FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('ceo', 'cto')
    )
  );

-- Update get_user_api_credentials to accept company_id
CREATE OR REPLACE FUNCTION get_user_api_credentials(
  p_user_id UUID,
  p_company_id UUID DEFAULT NULL
)
RETURNS TABLE (
  credential_id UUID,
  credential_name TEXT,
  api_endpoint TEXT,
  auth_type TEXT,
  credentials JSONB,
  is_active BOOLEAN,
  company_id UUID
)
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT
    ac.id,
    ac.credential_name,
    ac.api_endpoint,
    ac.auth_type,
    ac.credentials,
    ac.is_active,
    ac.company_id
  FROM api_credentials ac
  JOIN user_roles ur ON ac.role_id = ur.role_id
  LEFT JOIN user_company_access uca ON ur.user_id = uca.user_id
    AND ac.company_id = uca.company_id
  WHERE ur.user_id = p_user_id
    AND ac.is_active = true
    AND (
      p_company_id IS NULL OR ac.company_id = p_company_id
    )
    AND (
      ac.company_id IS NULL OR uca.user_id IS NOT NULL
    );
$$;

-- Update get_user_api_access to accept company_id
CREATE OR REPLACE FUNCTION get_user_api_access(
  p_user_id UUID,
  p_company_id UUID DEFAULT NULL
)
RETURNS TABLE (
  endpoint_id UUID,
  endpoint_name TEXT,
  endpoint_url TEXT,
  method TEXT,
  category TEXT,
  requires_auth BOOLEAN,
  company_id UUID
)
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT
    ae.id,
    ae.name,
    ae.endpoint_url,
    ae.method,
    ae.category,
    ae.requires_auth,
    ae.company_id
  FROM api_endpoints ae
  JOIN role_api_permissions rap ON ae.id = rap.api_endpoint_id
  JOIN user_roles ur ON rap.role_id = ur.role_id
  LEFT JOIN user_company_access uca ON ur.user_id = uca.user_id
    AND ae.company_id = uca.company_id
  WHERE ur.user_id = p_user_id
    AND rap.has_access = true
    AND (
      p_company_id IS NULL OR ae.company_id = p_company_id
    )
    AND (
      ae.company_id IS NULL OR uca.user_id IS NOT NULL
    );
$$;

-- Create get_user_companies function
CREATE OR REPLACE FUNCTION get_user_companies(p_user_id UUID)
RETURNS TABLE (
  company_id UUID,
  company_name TEXT,
  company_description TEXT,
  role_id UUID,
  role_name TEXT,
  role_description TEXT
)
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT
    c.id,
    c.name,
    c.description,
    r.id,
    r.name,
    r.description
  FROM companies c
  JOIN user_company_access uca ON c.id = uca.company_id
  JOIN roles r ON uca.role_id = r.id
  WHERE uca.user_id = p_user_id
    AND c.is_active = true
  ORDER BY c.name, r.name;
$$;

-- Create trigger for updated_at on user_company_access
CREATE TRIGGER update_user_company_access_updated_at
  BEFORE UPDATE ON user_company_access
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();