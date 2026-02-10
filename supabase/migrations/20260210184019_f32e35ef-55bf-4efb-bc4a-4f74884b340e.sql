
-- Create enums
CREATE TYPE public.community_event_type AS ENUM ('quran', 'lecture', 'talk', 'workshop', 'fundraiser', 'iftar', 'community', 'youth', 'other');
CREATE TYPE public.event_audience AS ENUM ('brothers_only', 'sisters_only', 'mixed');

-- Create community_events table
CREATE TABLE public.community_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  title TEXT NOT NULL,
  description TEXT,
  organizer_name TEXT NOT NULL,
  organizer_email TEXT,
  organizer_phone TEXT,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  event_type community_event_type NOT NULL DEFAULT 'other',
  audience event_audience NOT NULL DEFAULT 'mixed',
  is_at_mosque BOOLEAN NOT NULL DEFAULT false,
  mosque_id UUID REFERENCES public.mosques(id),
  custom_location TEXT,
  postcode TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  category public.event_category DEFAULT 'other',
  image_url TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;

-- SELECT: users see own, admins see all
CREATE POLICY "Users can view their own community events"
  ON public.community_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all community events"
  ON public.community_events FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- INSERT: any authenticated user
CREATE POLICY "Authenticated users can submit community events"
  ON public.community_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: admins only
CREATE POLICY "Admins can update community events"
  ON public.community_events FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- DELETE: admins only
CREATE POLICY "Admins can delete community events"
  ON public.community_events FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));
