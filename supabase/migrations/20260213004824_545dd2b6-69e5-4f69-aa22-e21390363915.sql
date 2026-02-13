
-- Step 1: Add event_organizer to app_role enum (must be committed separately)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'event_organizer';
