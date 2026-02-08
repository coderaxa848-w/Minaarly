-- Add column to track data source
ALTER TABLE public.mosques 
ADD COLUMN muslims_in_britain_data boolean DEFAULT false;

-- Set all existing mosques as sourced from Muslims In Britain
UPDATE public.mosques SET muslims_in_britain_data = true;