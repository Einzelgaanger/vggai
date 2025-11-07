-- Allow admins (CEO/CTO) to manage user roles
CREATE POLICY "Admins can view all user roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'ceo'::app_role) OR has_role(auth.uid(), 'cto'::app_role));

CREATE POLICY "Admins can insert user roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'ceo'::app_role) OR has_role(auth.uid(), 'cto'::app_role));

CREATE POLICY "Admins can update user roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'ceo'::app_role) OR has_role(auth.uid(), 'cto'::app_role));

CREATE POLICY "Admins can delete user roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'ceo'::app_role) OR has_role(auth.uid(), 'cto'::app_role));

-- Allow admins to manage API permissions
CREATE POLICY "Admins can insert API permissions"
ON public.api_permissions
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'ceo'::app_role) OR has_role(auth.uid(), 'cto'::app_role));

CREATE POLICY "Admins can update API permissions"
ON public.api_permissions
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'ceo'::app_role) OR has_role(auth.uid(), 'cto'::app_role));

CREATE POLICY "Admins can delete API permissions"
ON public.api_permissions
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'ceo'::app_role) OR has_role(auth.uid(), 'cto'::app_role));