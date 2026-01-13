-- Fix function search path warnings
CREATE OR REPLACE FUNCTION public.get_event_interested_count(_event_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.event_interests
  WHERE event_id = _event_id
$$;

CREATE OR REPLACE FUNCTION public.generate_slug(name TEXT, city TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  base_slug := lower(regexp_replace(name, '[^a-zA-Z0-9\s]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  
  final_slug := base_slug;
  
  WHILE EXISTS (SELECT 1 FROM public.mosques WHERE slug = final_slug) LOOP
    counter := counter + 1;
    IF counter = 1 THEN
      final_slug := base_slug || '-' || lower(regexp_replace(city, '\s+', '-', 'g'));
    ELSE
      final_slug := base_slug || '-' || lower(regexp_replace(city, '\s+', '-', 'g')) || '-' || counter;
    END IF;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix the permissive INSERT policy for mosque_admins (claims)
-- Replace the overly permissive policy with a more restrictive one
DROP POLICY IF EXISTS "Anyone can submit a claim" ON public.mosque_admins;

CREATE POLICY "Authenticated users can submit claims"
  ON public.mosque_admins FOR INSERT
  TO authenticated
  WITH CHECK (
    -- User can only submit a claim if they haven't already claimed this mosque
    NOT EXISTS (
      SELECT 1 FROM public.mosque_admins ma
      WHERE ma.mosque_id = mosque_id
      AND (ma.user_id = auth.uid() OR ma.claimant_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
      AND ma.status IN ('pending', 'approved')
    )
  );