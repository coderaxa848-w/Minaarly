
-- Step 1: Backup current mosques
CREATE TABLE IF NOT EXISTS public.mosques_backup_20260212 AS SELECT * FROM public.mosques;

-- Step 2: Delete orphaned related data
DELETE FROM public.event_interests;
DELETE FROM public.events;
DELETE FROM public.iqamah_times;
DELETE FROM public.saved_mosques;
DELETE FROM public.mosque_admins;
DELETE FROM public.community_events WHERE mosque_id IS NOT NULL;

-- Step 3: Truncate mosques with CASCADE
TRUNCATE public.mosques CASCADE;

-- Step 4: Add new columns
ALTER TABLE public.mosques
ADD COLUMN IF NOT EXISTS denomination TEXT,
ADD COLUMN IF NOT EXISTS established TEXT,
ADD COLUMN IF NOT EXISTS wudu_facilities TEXT,
ADD COLUMN IF NOT EXISTS womens_wudu TEXT,
ADD COLUMN IF NOT EXISTS iftar_facilities TEXT,
ADD COLUMN IF NOT EXISTS parking_type TEXT,
ADD COLUMN IF NOT EXISTS parking_availability TEXT,
ADD COLUMN IF NOT EXISTS wheelchair_prayer_hall BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS wheelchair_wudu BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS wheelchair_parking BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS tarawih_rakah TEXT,
ADD COLUMN IF NOT EXISTS tarawih_type TEXT,
ADD COLUMN IF NOT EXISTS qiyamul_layl TEXT;
