-- Fix PUBLIC_DATA_EXPOSURE: Restrict profile visibility
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Profiles são visíveis para todos" ON public.profiles;

-- Create policy: Users can only view their own profile (including email)
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (id = auth.uid());

-- Create policy: Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));