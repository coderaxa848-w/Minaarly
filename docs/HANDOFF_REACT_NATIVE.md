# Minaarly - React Native Mobile App Handoff Document

> **Last Updated:** January 2025  
> **Project:** Minaarly - UK Mosque Finder

---

## Overview

This document summarizes the backend infrastructure and data available for the React Native mobile application. The web platform (React + Vite) shares the same Supabase backend.

---

## Supabase Project Details

| Key | Value |
|-----|-------|
| **Project ID** | `jiwhlklaicnzyifdwbah` |
| **API URL** | `https://jiwhlklaicnzyifdwbah.supabase.co` |
| **Anon Key** | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppd2hsa2xhaWNuenlpZmR3YmFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwNjQ0MDgsImV4cCI6MjA4MzY0MDQwOH0.Z4vkZfXdEktXbQIt_doei_tUZWRtxD6368Gqg0hpQjM` |

---

## Database Tables

### 1. `mosques` - Main Mosque Data ✅ POPULATED (1,706+ records)

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `name` | text | Mosque name |
| `slug` | text | URL-friendly unique identifier |
| `address` | text | Street address |
| `city` | text | City name |
| `county` | text | County/region (nullable) |
| `postcode` | text | UK postcode |
| `latitude` | float | GPS latitude |
| `longitude` | float | GPS longitude |
| `description` | text | About the mosque (nullable) |
| `facilities` | text[] | Array: `womens_area`, `parking`, `wudu`, etc. |
| `languages` | text[] | Languages spoken |
| `madhab` | text | Islamic school: `Deobandi`, `Barelvi`, `Salafi`, `Shia`, null |
| `phone` | text | Contact phone (nullable) |
| `email` | text | Contact email (nullable) |
| `website` | text | Website URL (nullable) |
| `background_image_url` | text | Hero image URL (nullable) |
| `is_verified` | boolean | Verification status (default: false) |
| `created_at` | timestamp | Creation timestamp |
| `updated_at` | timestamp | Last update timestamp |

**RLS Policies:**
- ✅ SELECT: Public read access (no auth required)
- 🔒 UPDATE: Mosque admins only
- 🔒 INSERT/DELETE: Platform admins only

---

### 2. `iqamah_times` - Prayer Times

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `mosque_id` | uuid | FK to mosques |
| `fajr` | text | Fajr iqamah time (e.g., "05:30") |
| `dhuhr` | text | Dhuhr iqamah time |
| `asr` | text | Asr iqamah time |
| `maghrib` | text | Maghrib iqamah time |
| `isha` | text | Isha iqamah time |
| `jummah` | text | Friday prayer time |
| `use_api_times` | boolean | Whether to use external API times |
| `last_updated` | timestamp | Last update |

---

### 3. `events` - Mosque Events

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `mosque_id` | uuid | FK to mosques |
| `title` | text | Event title |
| `description` | text | Event description |
| `event_date` | date | Event date |
| `start_time` | time | Start time |
| `end_time` | time | End time (nullable) |
| `category` | enum | `halaqa`, `quran_class`, `youth`, `sisters`, `community`, `lecture`, `jummah`, `fundraiser`, `iftar`, `other` |
| `topic` | text | Event topic |
| `guest_speaker` | text | Speaker name |
| `image_url` | text | Event image |
| `is_recurring` | boolean | Recurring flag |
| `is_archived` | boolean | Archive flag |

---

### 4. `saved_mosques` - User Favorites (Auth Required)

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `user_id` | uuid | User ID |
| `mosque_id` | uuid | FK to mosques |
| `created_at` | timestamp | When saved |

---

### 5. `event_interests` - User Event RSVP (Auth Required)

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `event_id` | uuid | FK to events |
| `user_id` | uuid | User ID |
| `created_at` | timestamp | When marked interested |

---

### 6. `profiles` - User Profiles (Auto-created on signup)

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Same as auth.users.id |
| `full_name` | text | User's full name |
| `email` | text | User's email |
| `created_at` | timestamp | Creation timestamp |

---

## Sample Queries

### Fetch All Mosques (for map)
```typescript
const { data } = await supabase
  .from('mosques')
  .select('id, name, slug, city, postcode, latitude, longitude, madhab, facilities')
  .not('latitude', 'is', null);
```

### Fetch Single Mosque with Prayer Times
```typescript
const { data } = await supabase
  .from('mosques')
  .select(`
    *,
    iqamah_times (*)
  `)
  .eq('slug', 'mosque-slug')
  .single();
```

### Search Mosques by City
```typescript
const { data } = await supabase
  .from('mosques')
  .select('*')
  .ilike('city', `%${searchTerm}%`)
  .limit(50);
```

### Fetch Upcoming Events for a Mosque
```typescript
const { data } = await supabase
  .from('events')
  .select('*')
  .eq('mosque_id', mosqueId)
  .gte('event_date', new Date().toISOString().split('T')[0])
  .order('event_date', { ascending: true });
```

### Save/Unsave Mosque (Authenticated)
```typescript
// Save
await supabase.from('saved_mosques').insert({
  user_id: user.id,
  mosque_id: mosqueId
});

// Unsave
await supabase.from('saved_mosques').delete()
  .eq('user_id', user.id)
  .eq('mosque_id', mosqueId);
```

---

## Authentication

The project uses Supabase Auth with email/password. Magic link and social auth can be enabled.

```typescript
// Sign up
await supabase.auth.signUp({ email, password, options: { data: { full_name } } });

// Sign in
await supabase.auth.signInWithPassword({ email, password });

// Get current user
const { data: { user } } = await supabase.auth.getUser();

// Sign out
await supabase.auth.signOut();
```

---

## Storage Buckets

| Bucket | Public | Purpose |
|--------|--------|---------|
| `mosque-images` | ✅ Yes | Mosque photos and backgrounds |
| `event-images` | ✅ Yes | Event promotional images |

---

## Database Functions

| Function | Description |
|----------|-------------|
| `generate_slug(name, city)` | Generates unique URL slugs |
| `has_role(user_id, role)` | Checks user role (`admin`, `mosque_admin`, `user`) |
| `is_mosque_admin(user_id, mosque_id)` | Checks if user manages a mosque |
| `get_event_interested_count(event_id)` | Returns RSVP count |
| `get_mosques_in_bounds(...)` | **NEW** Viewport-based loading for maps |
| `get_nearby_mosques(...)` | **NEW** Near Me with distance calculation |
| `search_mosques(...)` | **NEW** Search by name, city, postcode |

---

## 🚀 Performance Optimization Functions (NEW)

These functions are critical for mobile performance. **Do NOT load all mosques at once.**

### 1. Viewport-Based Loading (for map panning)
```typescript
const { data } = await supabase.rpc('get_mosques_in_bounds', {
  min_lat: 51.4,
  max_lat: 51.6,
  min_lng: -0.3,
  max_lng: 0.1,
  filter_madhab: null,  // optional: 'Deobandi', 'Barelvi', etc.
  limit_count: 100
});
```

### 2. Near Me (with distance in miles)
```typescript
const { data } = await supabase.rpc('get_nearby_mosques', {
  user_lat: 51.5074,
  user_lng: -0.1278,
  radius_miles: 5,
  limit_count: 50
});
// Returns: { ...mosque, distance_miles: 0.34 }
```

### 3. Search
```typescript
const { data } = await supabase.rpc('search_mosques', {
  search_term: 'London',
  limit_count: 20
});
```

### Performance Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                        APP STARTUP                          │
├─────────────────────────────────────────────────────────────┤
│  1. Get user location                                       │
│  2. Call get_nearby_mosques(lat, lng, 5, 50)               │
│  3. Show map with clustered markers (~30-50 mosques)       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     USER PANS MAP                           │
├─────────────────────────────────────────────────────────────┤
│  1. Debounce (wait 300ms)                                   │
│  2. Get map bounds (min/max lat/lng)                        │
│  3. Call get_mosques_in_bounds(bounds)                     │
│  4. Merge with existing (dedupe by id)                      │
│  5. Update clustered markers                                │
└─────────────────────────────────────────────────────────────┘
```

### Caching Strategy
- Cache by region key: `${Math.floor(lat*10)}_${Math.floor(lng*10)}`
- TTL: 5 minutes for nearby, 15 minutes for bounds queries
- Use React Query or similar for automatic caching

---

## Key Notes for Mobile Implementation

1. **Coordinates Available**: All 1,706+ mosques have latitude/longitude for map display
2. **Madhab Filtering**: Use `madhab` field for filtering (Deobandi, Barelvi, Salafi, Shia, or null)
3. **Facilities**: Array field, check with `.contains(['womens_area'])`
4. **Slugs**: Use `slug` field for deep linking, not `id`
5. **Public Data**: Mosque list and details require no authentication
6. **User Features**: Saving mosques and event RSVP require authentication
7. **Images**: Some mosques have `background_image_url`, provide fallback

---

## Status Summary

| Feature | Status |
|---------|--------|
| Mosque Data | ✅ 1,716 mosques imported (~78% of 2,189 total) |
| Remaining Data | ⏳ 473 mosques pending (lines 1719-2189 of CSV) |
| Coordinates | ✅ All imported mosques have lat/lng |
| Prayer Times | ⏳ Mosque admins to populate |
| Events | ⏳ Mosque admins to create |
| Authentication | ✅ Configured |
| User Roles | ✅ Implemented |
| Storage | ✅ Configured |

---

## Contact

For questions about the backend, refer to:
- `docs/DATABASE.md` - Full schema documentation
- `docs/API.md` - API patterns
- `docs/SETUP.md` - Environment setup
