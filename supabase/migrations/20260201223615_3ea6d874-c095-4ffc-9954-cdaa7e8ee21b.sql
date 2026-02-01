-- Create spatial index for fast bounding box queries
CREATE INDEX IF NOT EXISTS idx_mosques_lat_lng 
ON mosques (latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Create madhab index for filtering
CREATE INDEX IF NOT EXISTS idx_mosques_madhab
ON mosques (madhab)
WHERE madhab IS NOT NULL;

-- Function 1: Get mosques within a bounding box (viewport-based loading)
CREATE OR REPLACE FUNCTION get_mosques_in_bounds(
  min_lat DOUBLE PRECISION,
  max_lat DOUBLE PRECISION,
  min_lng DOUBLE PRECISION,
  max_lng DOUBLE PRECISION,
  filter_madhab TEXT DEFAULT NULL,
  limit_count INTEGER DEFAULT 100
)
RETURNS SETOF mosques
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT *
  FROM mosques
  WHERE latitude BETWEEN min_lat AND max_lat
    AND longitude BETWEEN min_lng AND max_lng
    AND latitude IS NOT NULL
    AND longitude IS NOT NULL
    AND (filter_madhab IS NULL OR madhab = filter_madhab)
  ORDER BY name
  LIMIT limit_count;
$$;

-- Function 2: Get nearby mosques with distance calculation (Near Me feature)
CREATE OR REPLACE FUNCTION get_nearby_mosques(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_miles DOUBLE PRECISION DEFAULT 5,
  limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  address TEXT,
  city TEXT,
  postcode TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  madhab TEXT,
  facilities TEXT[],
  distance_miles DOUBLE PRECISION
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    m.id, m.name, m.slug, m.address, m.city, m.postcode,
    m.latitude, m.longitude, m.madhab, m.facilities,
    calculated.distance_miles
  FROM mosques m
  CROSS JOIN LATERAL (
    SELECT (3959 * acos(
      LEAST(1.0, GREATEST(-1.0,
        cos(radians(user_lat)) * cos(radians(m.latitude)) *
        cos(radians(m.longitude) - radians(user_lng)) +
        sin(radians(user_lat)) * sin(radians(m.latitude))
      ))
    )) AS distance_miles
  ) calculated
  WHERE m.latitude IS NOT NULL 
    AND m.longitude IS NOT NULL
    AND calculated.distance_miles <= radius_miles
  ORDER BY calculated.distance_miles
  LIMIT limit_count;
$$;

-- Function 3: Search mosques by name, city, or postcode
CREATE OR REPLACE FUNCTION search_mosques(
  search_term TEXT,
  limit_count INTEGER DEFAULT 20
)
RETURNS SETOF mosques
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT *
  FROM mosques
  WHERE (
    name ILIKE '%' || search_term || '%'
    OR city ILIKE '%' || search_term || '%'
    OR postcode ILIKE '%' || search_term || '%'
  )
  AND latitude IS NOT NULL
  AND longitude IS NOT NULL
  ORDER BY 
    CASE WHEN name ILIKE search_term || '%' THEN 0 ELSE 1 END,
    name
  LIMIT limit_count;
$$;