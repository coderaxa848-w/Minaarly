
-- Enable RLS on backup table and add deny-all policy (it's just a backup)
ALTER TABLE public.mosques_backup_20260212 ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins only" ON public.mosques_backup_20260212 FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
