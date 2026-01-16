# Minaarly Database Schema

> Last Updated: January 2025

## Overview

The application uses Supabase (PostgreSQL) with Row-Level Security (RLS) for data protection.

**Project ID:** `jiwhlklaicnzyifdwbah`

---

## Tables

### 1. `mosques`
Main table storing mosque information.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| name | text | No | - | Mosque name |
| slug | text | No | - | URL-friendly identifier |
| address | text | No | - | Street address |
| city | text | No | - | City name |
| county | text | Yes | - | County/region |
| postcode | text | No | - | UK postcode |
| latitude | double precision | Yes | - | GPS latitude |
| longitude | double precision | Yes | - | GPS longitude |
| description | text | Yes | - | About the mosque |
| facilities | text[] | Yes | '{}' | Array of facility codes |
| languages | text[] | Yes | '{}' | Languages spoken |
| madhab | text | Yes | - | Islamic school of thought |
| phone | text | Yes | - | Contact phone |
| email | text | Yes | - | Contact email |
| website | text | Yes | - | Website URL |
| background_image_url | text | Yes | - | Hero image URL |
| is_verified | boolean | Yes | false | Verification status |
| created_at | timestamptz | Yes | now() | Creation timestamp |
| updated_at | timestamptz | Yes | now() | Last update timestamp |

**RLS Policies:**
- ✅ SELECT: Anyone can view mosques
- ✅ UPDATE: Mosque admins can update their mosque
- ✅ INSERT: Platform admins only
- ✅ DELETE: Platform admins only

---

### 2. `iqamah_times`
Prayer times for each mosque.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| mosque_id | uuid | No | - | Foreign key to mosques |
| fajr | text | Yes | - | Fajr prayer time |
| dhuhr | text | Yes | - | Dhuhr prayer time |
| asr | text | Yes | - | Asr prayer time |
| maghrib | text | Yes | - | Maghrib prayer time |
| isha | text | Yes | - | Isha prayer time |
| jummah | text | Yes | - | Friday prayer time |
| use_api_times | boolean | Yes | true | Use external API for times |
| last_updated | timestamptz | Yes | now() | Last update timestamp |

**RLS Policies:**
- ✅ SELECT: Anyone can view
- ✅ INSERT/UPDATE: Mosque admins for their mosque
- ✅ ALL: Platform admins

---

### 3. `events`
Mosque events and activities.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| mosque_id | uuid | No | - | Foreign key to mosques |
| title | text | No | - | Event title |
| description | text | Yes | - | Event description |
| event_date | date | No | - | Event date |
| start_time | time | No | - | Start time |
| end_time | time | Yes | - | End time |
| category | event_category | Yes | 'other' | Event type |
| topic | text | Yes | - | Event topic |
| guest_speaker | text | Yes | - | Speaker name |
| image_url | text | Yes | - | Event image |
| is_recurring | boolean | Yes | false | Recurring event flag |
| is_archived | boolean | Yes | false | Archive flag |
| created_at | timestamptz | Yes | now() | Creation timestamp |

**RLS Policies:**
- ✅ SELECT: Anyone can view non-archived events
- ✅ SELECT: Mosque admins can view all their events
- ✅ INSERT/UPDATE/DELETE: Mosque admins for their events
- ✅ ALL: Platform admins

---

### 4. `event_interests`
Tracks user interest in events.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| event_id | uuid | No | - | Foreign key to events |
| user_id | uuid | No | - | User ID |
| created_at | timestamptz | Yes | now() | Creation timestamp |

**RLS Policies:**
- ✅ SELECT: Anyone can view
- ✅ INSERT: Users can add their own interest
- ✅ DELETE: Users can remove their own interest

---

### 5. `saved_mosques`
User's saved/favorite mosques.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| user_id | uuid | No | - | User ID |
| mosque_id | uuid | No | - | Foreign key to mosques |
| created_at | timestamptz | Yes | now() | Creation timestamp |

**RLS Policies:**
- ✅ SELECT: Users can view their saved mosques
- ✅ INSERT: Users can save mosques
- ✅ DELETE: Users can unsave mosques

---

### 6. `profiles`
User profile information (created automatically on signup).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | - | Primary key (matches auth.users.id) |
| full_name | text | Yes | - | User's full name |
| email | text | Yes | - | User's email |
| created_at | timestamptz | Yes | now() | Creation timestamp |

**RLS Policies:**
- ✅ SELECT: Users can view their own profile
- ✅ UPDATE: Users can update their own profile

---

### 7. `user_roles`
Role-based access control.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| user_id | uuid | No | - | User ID |
| role | app_role | No | - | Role enum value |

**RLS Policies:**
- ✅ SELECT: Users can view their own roles
- ✅ ALL: Platform admins can manage roles

---

### 8. `mosque_admins`
Mosque claim/admin requests.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| mosque_id | uuid | No | - | Foreign key to mosques |
| user_id | uuid | Yes | - | User ID (if registered) |
| status | claim_status | Yes | 'pending' | Claim status |
| claimant_name | text | Yes | - | Claimant's name |
| claimant_email | text | Yes | - | Claimant's email |
| claimant_phone | text | Yes | - | Claimant's phone |
| claimant_role | claimant_role | Yes | - | Role at mosque |
| notes | text | Yes | - | Additional notes |
| created_at | timestamptz | Yes | now() | Creation timestamp |

**RLS Policies:**
- ✅ SELECT: Users can view their own admin status
- ✅ SELECT: Platform admins can view all claims
- ✅ INSERT: Authenticated users can submit claims (with duplicate check)
- ✅ UPDATE/DELETE: Platform admins only

---

## Enums

### `app_role`
```sql
'admin' | 'moderator' | 'user'
```

### `event_category`
```sql
'lecture' | 'class' | 'youth' | 'sisters' | 'jummah' | 
'community' | 'iftar' | 'fundraiser' | 'other'
```

### `claim_status`
```sql
'pending' | 'approved' | 'rejected'
```

### `claimant_role`
```sql
'imam' | 'board_member' | 'volunteer' | 'staff' | 'other'
```

---

## Database Functions

### `has_role(user_id, role)`
Checks if a user has a specific role. Used in RLS policies.

### `is_mosque_admin(user_id, mosque_id)`
Checks if a user is an approved admin for a specific mosque.

### `get_event_interested_count(event_id)`
Returns the count of interested users for an event.

### `handle_new_user()`
Trigger function that creates a profile and assigns 'user' role on signup.

### `generate_slug(name, city)`
Generates a unique URL slug for a mosque.

### `update_updated_at()`
Trigger function to update `updated_at` timestamp on row changes.

---

## Storage Buckets

| Bucket | Public | Purpose |
|--------|--------|---------|
| mosque-images | Yes | Mosque photos and backgrounds |
| event-images | Yes | Event promotional images |

---

## Geocoding

Mosques use UK postcodes for location. The `latitude` and `longitude` fields are populated using the **Postcodes.io API** (free, no key required).

**API Endpoint:** `https://api.postcodes.io/postcodes/{postcode}`
