-- Grant CEO access to ALL API endpoints
-- This ensures CEO has full access to all data points

DO $$
DECLARE
  ceo_role_id UUID;
  endpoint_record RECORD;
BEGIN
  -- Get CEO role ID
  SELECT id INTO ceo_role_id FROM public.roles WHERE name = 'ceo';
  
  -- If CEO role doesn't exist, exit
  IF ceo_role_id IS NULL THEN
    RAISE NOTICE 'CEO role not found';
    RETURN;
  END IF;
  
  -- Grant access to ALL existing endpoints
  FOR endpoint_record IN SELECT id FROM public.api_endpoints
  LOOP
    INSERT INTO public.role_api_permissions (role_id, api_endpoint_id, has_access, can_read, can_write)
    VALUES (ceo_role_id, endpoint_record.id, true, true, true)
    ON CONFLICT (role_id, api_endpoint_id) 
    DO UPDATE SET 
      has_access = true, 
      can_read = true, 
      can_write = true;
  END LOOP;
  
  RAISE NOTICE 'Granted CEO access to all % endpoints', (SELECT COUNT(*) FROM public.api_endpoints);
END $$;

-- Create a function to automatically grant CEO access to new endpoints
CREATE OR REPLACE FUNCTION public.grant_ceo_access_to_endpoint()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  ceo_role_id UUID;
BEGIN
  -- Get CEO role ID
  SELECT id INTO ceo_role_id FROM public.roles WHERE name = 'ceo';
  
  -- If CEO role exists, grant access to the new endpoint
  IF ceo_role_id IS NOT NULL THEN
    INSERT INTO public.role_api_permissions (role_id, api_endpoint_id, has_access, can_read, can_write)
    VALUES (ceo_role_id, NEW.id, true, true, true)
    ON CONFLICT (role_id, api_endpoint_id) 
    DO UPDATE SET 
      has_access = true, 
      can_read = true, 
      can_write = true;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically grant CEO access when new endpoints are added
DROP TRIGGER IF EXISTS auto_grant_ceo_endpoint_access ON public.api_endpoints;
CREATE TRIGGER auto_grant_ceo_endpoint_access
  AFTER INSERT ON public.api_endpoints
  FOR EACH ROW
  EXECUTE FUNCTION public.grant_ceo_access_to_endpoint();

-- Also update the get_user_api_access function to ensure CEO gets all endpoints
-- This function already exists, so we'll update it to prioritize CEO access
CREATE OR REPLACE FUNCTION public.get_user_api_access(p_user_id UUID, p_company_id UUID DEFAULT NULL)
RETURNS TABLE (
  endpoint_id UUID,
  endpoint_name TEXT,
  endpoint_url TEXT,
  method TEXT,
  category TEXT,
  requires_auth BOOLEAN,
  company_id UUID
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is CEO
  IF EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = p_user_id
      AND r.name = 'ceo'
  ) THEN
    -- CEO gets ALL endpoints (respecting company_id filter if provided)
    RETURN QUERY
    SELECT DISTINCT
      ae.id,
      ae.name,
      ae.endpoint_url,
      ae.method,
      ae.category,
      ae.requires_auth,
      ae.company_id
    FROM public.api_endpoints ae
    WHERE (
      p_company_id IS NULL 
      OR ae.company_id IS NULL 
      OR ae.company_id = p_company_id
    );
  ELSE
    -- Other roles get endpoints based on permissions
    RETURN QUERY
    SELECT DISTINCT
      ae.id,
      ae.name,
      ae.endpoint_url,
      ae.method,
      ae.category,
      ae.requires_auth,
      ae.company_id
    FROM public.api_endpoints ae
    JOIN public.role_api_permissions rap ON ae.id = rap.api_endpoint_id
    JOIN public.user_roles ur ON rap.role_id = ur.role_id
    LEFT JOIN public.user_company_access uca ON ur.user_id = uca.user_id
      AND ae.company_id = uca.company_id
    WHERE ur.user_id = p_user_id
      AND rap.has_access = true
      AND (
        p_company_id IS NULL OR ae.company_id = p_company_id
      )
      AND (
        ae.company_id IS NULL OR uca.user_id IS NOT NULL
      );
  END IF;
END;
$$;

