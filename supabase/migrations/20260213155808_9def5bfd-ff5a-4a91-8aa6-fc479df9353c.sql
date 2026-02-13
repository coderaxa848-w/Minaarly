
-- 1. Add columns to events
ALTER TABLE events ALTER COLUMN mosque_id DROP NOT NULL;
ALTER TABLE events
  ADD COLUMN submitted_by uuid,
  ADD COLUMN source text DEFAULT 'mosque_admin',
  ADD COLUMN status text DEFAULT 'approved',
  ADD COLUMN custom_location text,
  ADD COLUMN postcode text,
  ADD COLUMN organizer_name text,
  ADD COLUMN organizer_email text,
  ADD COLUMN organizer_phone text,
  ADD COLUMN audience text,
  ADD COLUMN latitude double precision,
  ADD COLUMN longitude double precision,
  ADD COLUMN admin_notes text;

-- 2. Backfill existing events
UPDATE events SET source = 'mosque_admin', status = 'approved'
WHERE source IS NULL;

-- 3a. Update the 5 already-synced rows with community_events metadata
UPDATE events e
SET
  submitted_by = ce.user_id,
  source = CASE WHEN is_event_organizer(ce.user_id) THEN 'community_organiser' ELSE 'user' END,
  status = ce.status,
  custom_location = ce.custom_location,
  postcode = ce.postcode,
  organizer_name = ce.organizer_name,
  organizer_email = ce.organizer_email,
  organizer_phone = ce.organizer_phone,
  audience = ce.audience::text,
  latitude = ce.latitude,
  longitude = ce.longitude,
  admin_notes = ce.admin_notes
FROM community_events ce
WHERE e.title = ce.title
  AND e.event_date = ce.event_date
  AND COALESCE(e.mosque_id::text, '') = COALESCE(ce.mosque_id::text, '')
  AND e.submitted_by IS NULL;

-- 3b. Migrate remaining community_events into events (with dedup)
INSERT INTO events (
  mosque_id, title, description, event_date, start_time, end_time,
  category, submitted_by, source, status, custom_location, postcode,
  organizer_name, organizer_email, organizer_phone, audience,
  latitude, longitude, admin_notes, image_url, created_at
)
SELECT
  ce.mosque_id,
  ce.title,
  ce.description,
  ce.event_date,
  ce.start_time,
  ce.end_time,
  CASE
    WHEN ce.category IS NOT NULL AND ce.category::text != 'other'
      THEN ce.category
    ELSE (CASE ce.event_type::text
      WHEN 'quran' THEN 'quran_class'
      WHEN 'lecture' THEN 'lecture'
      WHEN 'fundraiser' THEN 'fundraiser'
      WHEN 'iftar' THEN 'iftar'
      WHEN 'community' THEN 'community'
      WHEN 'youth' THEN 'youth'
      ELSE 'other'
    END)::event_category
  END,
  ce.user_id,
  CASE
    WHEN is_event_organizer(ce.user_id) THEN 'community_organiser'
    ELSE 'user'
  END,
  ce.status,
  ce.custom_location,
  ce.postcode,
  ce.organizer_name,
  ce.organizer_email,
  ce.organizer_phone,
  ce.audience::text,
  ce.latitude,
  ce.longitude,
  ce.admin_notes,
  ce.image_url,
  ce.created_at
FROM community_events ce
WHERE NOT EXISTS (
  SELECT 1 FROM events e
  WHERE e.title = ce.title
    AND e.event_date = ce.event_date
    AND COALESCE(e.mosque_id::text, '') = COALESCE(ce.mosque_id::text, '')
);

-- 4. Drop sync triggers and function
DROP TRIGGER IF EXISTS trg_sync_community_event_to_events ON community_events;
DROP TRIGGER IF EXISTS sync_community_event ON community_events;
DROP FUNCTION IF EXISTS sync_community_event_to_events();

-- 5. Update rate-limit function
CREATE OR REPLACE FUNCTION public.can_submit_community_event(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public' AS $$
  SELECT
    CASE
      WHEN public.is_event_organizer(_user_id) THEN true
      ELSE (
        SELECT COUNT(*) < 1
        FROM public.events
        WHERE submitted_by = _user_id
          AND source = 'user'
          AND created_at > now() - interval '7 days'
      )
    END
$$;

-- 6. Update RLS policies
DROP POLICY IF EXISTS "Anyone can view non-archived events" ON events;
DROP POLICY IF EXISTS "Mosque admins can view all their events" ON events;

CREATE POLICY "Anyone can view approved events"
ON events FOR SELECT USING (
  status = 'approved' AND (is_archived = false OR is_archived IS NULL)
);

CREATE POLICY "Users can view their own submissions"
ON events FOR SELECT USING (submitted_by = auth.uid());

CREATE POLICY "Mosque admins can view all their mosque events"
ON events FOR SELECT USING (
  mosque_id IS NOT NULL AND is_mosque_admin(auth.uid(), mosque_id)
);

CREATE POLICY "Users can submit events"
ON events FOR INSERT WITH CHECK (auth.uid() = submitted_by);
