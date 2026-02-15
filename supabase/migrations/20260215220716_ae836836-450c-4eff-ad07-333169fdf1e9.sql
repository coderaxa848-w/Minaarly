
-- Step 1: Delete existing test rows
DELETE FROM public.masjid_salah_times_weekly;

-- Step 2: Rename table
ALTER TABLE public.masjid_salah_times_weekly RENAME TO masjid_salah_times_monthly;

-- Step 3: Rename column
ALTER TABLE public.masjid_salah_times_monthly RENAME COLUMN weekly_times TO monthly_times;

-- Step 4: Drop unused columns
ALTER TABLE public.masjid_salah_times_monthly DROP COLUMN IF EXISTS week_start_date;
ALTER TABLE public.masjid_salah_times_monthly DROP COLUMN IF EXISTS weekly_payload_hash;

-- Step 5: Add new columns
ALTER TABLE public.masjid_salah_times_monthly ADD COLUMN IF NOT EXISTS madhab_preference text;
ALTER TABLE public.masjid_salah_times_monthly ADD COLUMN IF NOT EXISTS special_dates jsonb;

-- Step 6: Add unique constraint
ALTER TABLE public.masjid_salah_times_monthly ADD CONSTRAINT uq_masjid_month_year UNIQUE (masjid_id, month, year);

-- Step 7: Drop old wide-open RLS policies
DROP POLICY IF EXISTS "Authenticated can read masjid salah weekly" ON public.masjid_salah_times_monthly;
DROP POLICY IF EXISTS "Authenticated can write masjid salah weekly" ON public.masjid_salah_times_monthly;

-- Step 8: Create tightened RLS policies
CREATE POLICY "Anyone can view prayer times"
  ON public.masjid_salah_times_monthly
  FOR SELECT
  USING (true);

CREATE POLICY "Mosque admins can insert prayer times"
  ON public.masjid_salah_times_monthly
  FOR INSERT
  WITH CHECK (
    is_mosque_admin(auth.uid(), masjid_id)
    OR has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Mosque admins can update prayer times"
  ON public.masjid_salah_times_monthly
  FOR UPDATE
  USING (
    is_mosque_admin(auth.uid(), masjid_id)
    OR has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Mosque admins can delete prayer times"
  ON public.masjid_salah_times_monthly
  FOR DELETE
  USING (
    is_mosque_admin(auth.uid(), masjid_id)
    OR has_role(auth.uid(), 'admin'::app_role)
  );

-- Step 9: Add month and year columns to masjid_salah_uploads
ALTER TABLE public.masjid_salah_uploads ADD COLUMN IF NOT EXISTS month smallint;
ALTER TABLE public.masjid_salah_uploads ADD COLUMN IF NOT EXISTS year smallint;

-- Step 10: Create temp-uploads storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('temp-uploads', 'temp-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Step 11: Storage RLS policies for temp-uploads
CREATE POLICY "Public can read temp uploads"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'temp-uploads');

CREATE POLICY "Authenticated users can upload to temp-uploads"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'temp-uploads' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete from temp-uploads"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'temp-uploads' AND auth.role() = 'authenticated');
