-- Add services column to mosques table
ALTER TABLE mosques
ADD COLUMN services TEXT[] DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN mosques.services IS 
  'Services offered by the mosque: nikkah, hall_booking, immigration_advice, counselling, funeral, or custom text';