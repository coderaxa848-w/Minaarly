

## Server-Side Performance Optimization Plan

### Problem Summary
- 1,716 mosques in Supabase, all with coordinates
- Web MapPage currently uses mock data (needs to be connected to Supabase)
- Loading all mosques causes performance issues on mobile

---

### Part 1: Database Functions (Improved from RN Dev's Proposal)

#### 1.1 Bounding Box Query Function (Improved)
Your dev's version is good, but I'll add:
- `STABLE` modifier for better query planning
- `SECURITY DEFINER` for RLS compatibility
- Optional filters for madhab/facilities

```sql
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
```

#### 1.2 Nearby Mosques Function (Fixed & Improved)
Your dev's version has a bug - `HAVING` without `GROUP BY`. Here's the corrected version using a subquery:

```sql
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
```

**Improvements over original:**
- Fixed HAVING clause bug (moved to WHERE with subquery)
- Added `LEAST(1.0, GREATEST(-1.0, ...))` to prevent acos domain errors
- Added `STABLE` for query optimization
- Added `SECURITY DEFINER` for RLS compatibility

#### 1.3 Spatial Index for Fast Queries
```sql
CREATE INDEX IF NOT EXISTS idx_mosques_lat_lng 
ON mosques (latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_mosques_madhab
ON mosques (madhab)
WHERE madhab IS NOT NULL;
```

#### 1.4 Search Function (Bonus)
For searching mosques by name, city, or postcode:

```sql
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
```

---

### Part 2: Update Handoff Document

Update `docs/HANDOFF_REACT_NATIVE.md` with:
- New function signatures and usage examples
- Sample queries for viewport-based loading
- Caching recommendations

---

### Part 3: Fix Web MapPage (Connect to Supabase)

Update `src/pages/MapPage.tsx` to:
1. Use real Supabase data instead of mock data
2. Implement viewport-based loading for web
3. Add loading states

---

### Implementation Files

| Action | File | Description |
|--------|------|-------------|
| Create | Database migration | 3 functions + 2 indexes |
| Update | `docs/HANDOFF_REACT_NATIVE.md` | Add new function docs |
| Update | `src/pages/MapPage.tsx` | Connect to Supabase |

---

### Function Usage Examples for RN Dev

**Viewport-based loading:**
```typescript
const { data } = await supabase.rpc('get_mosques_in_bounds', {
  min_lat: 51.4,
  max_lat: 51.6,
  min_lng: -0.3,
  max_lng: 0.1,
  limit_count: 100
});
```

**Near me with radius:**
```typescript
const { data } = await supabase.rpc('get_nearby_mosques', {
  user_lat: 51.5074,
  user_lng: -0.1278,
  radius_miles: 5,
  limit_count: 50
});
```

**Search:**
```typescript
const { data } = await supabase.rpc('search_mosques', {
  search_term: 'London',
  limit_count: 20
});
```

---

### Performance Impact

| Metric | Before | After |
|--------|--------|-------|
| Initial API call | All 1,716 mosques | ~30-50 nearby |
| Payload size | ~500KB | ~15KB |
| Query time | ~200ms | ~20ms |
| Map markers | 1,716 | 10-50 clustered |

---

### Key Fixes to RN Dev's SQL

1. **HAVING bug**: Original used `HAVING` without `GROUP BY` - fixed with `CROSS JOIN LATERAL`
2. **acos domain error**: Added bounds checking to prevent NaN when coordinates are identical
3. **Performance**: Added `STABLE` modifier so Postgres can optimize repeated calls
4. **Security**: Added `SECURITY DEFINER` so functions work with RLS policies

