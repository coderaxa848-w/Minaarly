-- Rewrite get_nearby_mosques to include all new columns
DROP FUNCTION IF EXISTS public.get_nearby_mosques(double precision, double precision, double precision, integer);

CREATE OR REPLACE FUNCTION public.get_nearby_mosques(
  user_lat double precision, 
  user_lng double precision, 
  radius_miles double precision DEFAULT 5, 
  limit_count integer DEFAULT 50
)
RETURNS TABLE(
  id uuid, name text, slug text, address text, city text, 
  postcode text, latitude double precision, longitude double precision, 
  madhab text, facilities text[], phone text, email text, website text,
  capacity integer, has_womens_section boolean, usage_type text,
  is_multi_faith boolean, management text, social_links jsonb,
  contact_page text, distance_miles double precision
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    m.id, m.name, m.slug, m.address, m.city, m.postcode,
    m.latitude, m.longitude, m.madhab, m.facilities,
    m.phone, m.email, m.website,
    m.capacity, m.has_womens_section, m.usage_type,
    m.is_multi_faith, m.management, m.social_links,
    m.contact_page,
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

-- Update search_mosques to include address in search
CREATE OR REPLACE FUNCTION public.search_mosques(
  search_term text, 
  limit_count integer DEFAULT 20
)
RETURNS SETOF mosques
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT *
  FROM mosques
  WHERE (
    name ILIKE '%' || search_term || '%'
    OR city ILIKE '%' || search_term || '%'
    OR postcode ILIKE '%' || search_term || '%'
    OR address ILIKE '%' || search_term || '%'
  )
  AND latitude IS NOT NULL
  AND longitude IS NOT NULL
  ORDER BY 
    CASE WHEN name ILIKE search_term || '%' THEN 0 ELSE 1 END,
    name
  LIMIT limit_count;
$$;