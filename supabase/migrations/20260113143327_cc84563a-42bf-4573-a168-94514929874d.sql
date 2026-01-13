-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'mosque_admin', 'user');

-- Create enum for event categories
CREATE TYPE public.event_category AS ENUM (
  'halaqa', 'quran_class', 'youth', 'sisters', 
  'community', 'lecture', 'jummah', 'fundraiser', 'iftar', 'other'
);

-- Create enum for claim status
CREATE TYPE public.claim_status AS ENUM ('pending', 'approved', 'rejected');

-- Create enum for claimant role
CREATE TYPE public.claimant_role AS ENUM ('imam', 'committee_member', 'volunteer', 'other');

-- ============================================
-- TABLES
-- ============================================

-- Mosques table
CREATE TABLE public.mosques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  postcode TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  county TEXT,
  latitude FLOAT8,
  longitude FLOAT8,
  description TEXT,
  facilities TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  madhab TEXT,
  phone TEXT,
  website TEXT,
  email TEXT,
  background_image_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Iqamah times table
CREATE TABLE public.iqamah_times (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mosque_id UUID REFERENCES public.mosques(id) ON DELETE CASCADE NOT NULL,
  fajr TEXT,
  dhuhr TEXT,
  asr TEXT,
  maghrib TEXT,
  isha TEXT,
  jummah TEXT,
  use_api_times BOOLEAN DEFAULT true,
  last_updated TIMESTAMPTZ DEFAULT now(),
  UNIQUE(mosque_id)
);

-- Events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mosque_id UUID REFERENCES public.mosques(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  guest_speaker TEXT,
  topic TEXT,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  category public.event_category DEFAULT 'other',
  image_url TEXT,
  is_recurring BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Event interests junction table
CREATE TABLE public.event_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Saved mosques junction table
CREATE TABLE public.saved_mosques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mosque_id UUID REFERENCES public.mosques(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(mosque_id, user_id)
);

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Mosque admins table (for claim verification workflow)
CREATE TABLE public.mosque_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mosque_id UUID REFERENCES public.mosques(id) ON DELETE CASCADE NOT NULL,
  status public.claim_status DEFAULT 'pending',
  claimant_name TEXT,
  claimant_email TEXT,
  claimant_role public.claimant_role,
  claimant_phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_mosques_slug ON public.mosques(slug);
CREATE INDEX idx_mosques_city ON public.mosques(city);
CREATE INDEX idx_mosques_coordinates ON public.mosques(latitude, longitude);
CREATE INDEX idx_events_mosque_id ON public.events(mosque_id);
CREATE INDEX idx_events_date ON public.events(event_date);
CREATE INDEX idx_events_archived ON public.events(is_archived);
CREATE INDEX idx_event_interests_event_id ON public.event_interests(event_id);
CREATE INDEX idx_saved_mosques_user_id ON public.saved_mosques(user_id);
CREATE INDEX idx_mosque_admins_mosque_id ON public.mosque_admins(mosque_id);
CREATE INDEX idx_mosque_admins_status ON public.mosque_admins(status);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to check if user has a specific role (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user is approved mosque admin
CREATE OR REPLACE FUNCTION public.is_mosque_admin(_user_id UUID, _mosque_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.mosque_admins
    WHERE user_id = _user_id
      AND mosque_id = _mosque_id
      AND status = 'approved'
  )
$$;

-- Function to get event interested count
CREATE OR REPLACE FUNCTION public.get_event_interested_count(_event_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.event_interests
  WHERE event_id = _event_id
$$;

-- Function to generate unique slug
CREATE OR REPLACE FUNCTION public.generate_slug(name TEXT, city TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Convert to lowercase, replace spaces with hyphens, remove special chars
  base_slug := lower(regexp_replace(name, '[^a-zA-Z0-9\s]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  
  final_slug := base_slug;
  
  -- Check for collision
  WHILE EXISTS (SELECT 1 FROM public.mosques WHERE slug = final_slug) LOOP
    counter := counter + 1;
    IF counter = 1 THEN
      -- First collision: append city
      final_slug := base_slug || '-' || lower(regexp_replace(city, '\s+', '-', 'g'));
    ELSE
      -- Subsequent collisions: append number
      final_slug := base_slug || '-' || lower(regexp_replace(city, '\s+', '-', 'g')) || '-' || counter;
    END IF;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Function to handle new user signup (create profile)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at on mosques
CREATE TRIGGER mosques_updated_at
  BEFORE UPDATE ON public.mosques
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Auto-update last_updated on iqamah_times
CREATE TRIGGER iqamah_times_updated
  BEFORE UPDATE ON public.iqamah_times
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Create profile and assign role on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.mosques ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iqamah_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_mosques ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mosque_admins ENABLE ROW LEVEL SECURITY;

-- MOSQUES POLICIES
CREATE POLICY "Anyone can view mosques"
  ON public.mosques FOR SELECT
  USING (true);

CREATE POLICY "Mosque admins can update their mosque"
  ON public.mosques FOR UPDATE
  TO authenticated
  USING (public.is_mosque_admin(auth.uid(), id));

CREATE POLICY "Platform admins can insert mosques"
  ON public.mosques FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Platform admins can delete mosques"
  ON public.mosques FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- IQAMAH TIMES POLICIES
CREATE POLICY "Anyone can view iqamah times"
  ON public.iqamah_times FOR SELECT
  USING (true);

CREATE POLICY "Mosque admins can insert iqamah times"
  ON public.iqamah_times FOR INSERT
  TO authenticated
  WITH CHECK (public.is_mosque_admin(auth.uid(), mosque_id));

CREATE POLICY "Mosque admins can update iqamah times"
  ON public.iqamah_times FOR UPDATE
  TO authenticated
  USING (public.is_mosque_admin(auth.uid(), mosque_id));

CREATE POLICY "Platform admins can manage all iqamah times"
  ON public.iqamah_times FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- EVENTS POLICIES
CREATE POLICY "Anyone can view non-archived events"
  ON public.events FOR SELECT
  USING (is_archived = false);

CREATE POLICY "Mosque admins can view all their events"
  ON public.events FOR SELECT
  TO authenticated
  USING (public.is_mosque_admin(auth.uid(), mosque_id));

CREATE POLICY "Mosque admins can insert events"
  ON public.events FOR INSERT
  TO authenticated
  WITH CHECK (public.is_mosque_admin(auth.uid(), mosque_id));

CREATE POLICY "Mosque admins can update their events"
  ON public.events FOR UPDATE
  TO authenticated
  USING (public.is_mosque_admin(auth.uid(), mosque_id));

CREATE POLICY "Mosque admins can delete their events"
  ON public.events FOR DELETE
  TO authenticated
  USING (public.is_mosque_admin(auth.uid(), mosque_id));

CREATE POLICY "Platform admins can manage all events"
  ON public.events FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- EVENT INTERESTS POLICIES
CREATE POLICY "Anyone can view event interests"
  ON public.event_interests FOR SELECT
  USING (true);

CREATE POLICY "Users can add their own interest"
  ON public.event_interests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own interest"
  ON public.event_interests FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- SAVED MOSQUES POLICIES
CREATE POLICY "Users can view their saved mosques"
  ON public.saved_mosques FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save mosques"
  ON public.saved_mosques FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave mosques"
  ON public.saved_mosques FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- PROFILES POLICIES
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- USER ROLES POLICIES (access via security definer function only)
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Platform admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- MOSQUE ADMINS POLICIES
CREATE POLICY "Users can view their own admin status"
  ON public.mosque_admins FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR claimant_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Anyone can submit a claim"
  ON public.mosque_admins FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Platform admins can view all claims"
  ON public.mosque_admins FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Platform admins can update claims"
  ON public.mosque_admins FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Platform admins can delete claims"
  ON public.mosque_admins FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));