CREATE POLICY "Platform admins can update mosques"
ON public.mosques
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));