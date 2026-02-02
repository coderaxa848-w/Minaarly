-- Allow platform admins to view all user profiles
CREATE POLICY "Platform admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Delete all Shia mosques
DELETE FROM public.mosques WHERE madhab = 'Shia';