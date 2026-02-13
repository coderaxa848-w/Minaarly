
-- 1. Create event_organizer_profiles table
CREATE TABLE public.event_organizer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  display_name text NOT NULL,
  org_type text NOT NULL DEFAULT 'individual',
  bio text,
  social_instagram text,
  social_twitter text,
  social_website text,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.event_organizer_profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS policies
CREATE POLICY "Users can view their own organizer profile"
  ON public.event_organizer_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own organizer application"
  ON public.event_organizer_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all organizer profiles"
  ON public.event_organizer_profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update organizer profiles"
  ON public.event_organizer_profiles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete organizer profiles"
  ON public.event_organizer_profiles FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can view approved organizer profiles"
  ON public.event_organizer_profiles FOR SELECT
  USING (status = 'approved');

-- 4. Trigger for updated_at
CREATE TRIGGER update_event_organizer_profiles_updated_at
  BEFORE UPDATE ON public.event_organizer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- 5. is_event_organizer function
CREATE OR REPLACE FUNCTION public.is_event_organizer(_user_id uuid)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.event_organizer_profiles eop ON eop.user_id = ur.user_id
    WHERE ur.user_id = _user_id
      AND ur.role = 'event_organizer'
      AND eop.status = 'approved'
  )
$$;

-- 6. can_submit_community_event function
CREATE OR REPLACE FUNCTION public.can_submit_community_event(_user_id uuid)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public
AS $$
  SELECT 
    CASE 
      WHEN public.is_event_organizer(_user_id) THEN true
      ELSE (
        SELECT COUNT(*) < 1
        FROM public.community_events
        WHERE user_id = _user_id
          AND created_at > now() - interval '7 days'
      )
    END
$$;
