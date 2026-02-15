-- Drop old weekly constraints that don't apply to monthly data
ALTER TABLE public.masjid_salah_times_monthly DROP CONSTRAINT masjid_salah_times_weekly_source_check;
ALTER TABLE public.masjid_salah_times_monthly DROP CONSTRAINT masjid_salah_times_weekly_weekly_times_days_check;

-- Add updated source constraint including ai_extracted
ALTER TABLE public.masjid_salah_times_monthly ADD CONSTRAINT masjid_salah_times_monthly_source_check 
  CHECK (source = ANY (ARRAY['manual'::text, 'upload'::text, 'parsed_upload'::text, 'ai_extracted'::text]));

-- Add a more appropriate check for monthly data (at least 1 day, up to 31)
ALTER TABLE public.masjid_salah_times_monthly ADD CONSTRAINT masjid_salah_times_monthly_days_check 
  CHECK (
    jsonb_typeof(monthly_times) = 'object' 
    AND jsonb_typeof(monthly_times -> 'days') = 'array' 
    AND jsonb_array_length(monthly_times -> 'days') >= 1 
    AND jsonb_array_length(monthly_times -> 'days') <= 31
  );