# Minaarly API & Backend Integration

> Last Updated: January 2025

## Supabase Client

### Import
```typescript
import { supabase } from '@/integrations/supabase/client';
```

### Connection Details
- **Project ID:** `jiwhlklaicnzyifdwbah`
- **API URL:** `https://jiwhlklaicnzyifdwbah.supabase.co`

---

## Authentication

### Sign Up
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      full_name: 'John Doe'
    }
  }
});
```

### Sign In
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});
```

### Sign Out
```typescript
await supabase.auth.signOut();
```

### Get Current User
```typescript
const { data: { user } } = await supabase.auth.getUser();
```

### Listen to Auth Changes
```typescript
supabase.auth.onAuthStateChange((event, session) => {
  console.log(event, session);
});
```

---

## Database Operations

### Mosques

**Fetch all mosques with coordinates:**
```typescript
const { data, error } = await supabase
  .from('mosques')
  .select('*')
  .not('latitude', 'is', null)
  .not('longitude', 'is', null);
```

**Fetch mosque by slug with details:**
```typescript
const { data, error } = await supabase
  .from('mosques')
  .select(`
    *,
    iqamah_times(*),
    events(*)
  `)
  .eq('slug', 'mosque-slug')
  .single();
```

**Search mosques by city:**
```typescript
const { data, error } = await supabase
  .from('mosques')
  .select('*')
  .ilike('city', '%london%');
```

### Iqamah Times

**Get prayer times for a mosque:**
```typescript
const { data, error } = await supabase
  .from('iqamah_times')
  .select('*')
  .eq('mosque_id', mosqueId)
  .single();
```

**Update prayer times (mosque admin only):**
```typescript
const { error } = await supabase
  .from('iqamah_times')
  .update({
    fajr: '05:30',
    dhuhr: '13:00',
    asr: '16:30',
    maghrib: '18:45',
    isha: '20:00'
  })
  .eq('mosque_id', mosqueId);
```

### Events

**Get upcoming events for a mosque:**
```typescript
const { data, error } = await supabase
  .from('events')
  .select('*')
  .eq('mosque_id', mosqueId)
  .eq('is_archived', false)
  .gte('event_date', new Date().toISOString().split('T')[0])
  .order('event_date', { ascending: true });
```

**Get events by category:**
```typescript
const { data, error } = await supabase
  .from('events')
  .select('*')
  .eq('category', 'lecture')
  .eq('is_archived', false);
```

### Saved Mosques

**Save a mosque:**
```typescript
const { error } = await supabase
  .from('saved_mosques')
  .insert({
    user_id: userId,
    mosque_id: mosqueId
  });
```

**Check if mosque is saved:**
```typescript
const { data } = await supabase
  .from('saved_mosques')
  .select('id')
  .eq('user_id', userId)
  .eq('mosque_id', mosqueId)
  .single();

const isSaved = !!data;
```

**Remove saved mosque:**
```typescript
const { error } = await supabase
  .from('saved_mosques')
  .delete()
  .eq('user_id', userId)
  .eq('mosque_id', mosqueId);
```

### Event Interests

**Mark interest in an event:**
```typescript
const { error } = await supabase
  .from('event_interests')
  .insert({
    event_id: eventId,
    user_id: userId
  });
```

**Get interest count:**
```typescript
const { data, error } = await supabase
  .rpc('get_event_interested_count', { _event_id: eventId });
```

---

## Database Functions (RPC)

### Check User Role
```typescript
const { data: isAdmin } = await supabase
  .rpc('has_role', { 
    _user_id: userId, 
    _role: 'admin' 
  });
```

### Check Mosque Admin
```typescript
const { data: isMosqueAdmin } = await supabase
  .rpc('is_mosque_admin', { 
    _user_id: userId, 
    _mosque_id: mosqueId 
  });
```

---

## File Storage

### Upload Mosque Image
```typescript
const { data, error } = await supabase.storage
  .from('mosque-images')
  .upload(`${mosqueId}/${fileName}`, file, {
    cacheControl: '3600',
    upsert: false
  });
```

### Get Public URL
```typescript
const { data } = supabase.storage
  .from('mosque-images')
  .getPublicUrl(`${mosqueId}/${fileName}`);

const imageUrl = data.publicUrl;
```

### Upload Event Image
```typescript
const { data, error } = await supabase.storage
  .from('event-images')
  .upload(`${eventId}/${fileName}`, file);
```

---

## Edge Functions

### Geocode Postcode (To Be Implemented)

**Purpose:** Convert UK postcodes to lat/lng coordinates

**Endpoint:** `/functions/v1/geocode-postcode`

**Request:**
```typescript
const { data, error } = await supabase.functions.invoke('geocode-postcode', {
  body: { postcode: 'E1 6AN' }
});
```

**Response:**
```json
{
  "latitude": 51.517,
  "longitude": -0.072,
  "postcode": "E1 6AN"
}
```

---

## External APIs

### Postcodes.io (Free, No Key Required)

**Lookup single postcode:**
```
GET https://api.postcodes.io/postcodes/{postcode}
```

**Response:**
```json
{
  "status": 200,
  "result": {
    "postcode": "E1 6AN",
    "latitude": 51.517,
    "longitude": -0.072,
    "admin_district": "Tower Hamlets",
    "region": "London"
  }
}
```

**Bulk lookup:**
```
POST https://api.postcodes.io/postcodes
Body: { "postcodes": ["E1 6AN", "SW1A 1AA"] }
```

---

## Error Handling

```typescript
const { data, error } = await supabase
  .from('mosques')
  .select('*');

if (error) {
  console.error('Database error:', error.message);
  // Handle specific error codes
  if (error.code === 'PGRST116') {
    // No rows found
  }
  if (error.code === '42501') {
    // RLS policy violation
  }
  return;
}

// Use data safely
console.log(data);
```

---

## TanStack Query Integration

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Fetch mosques
export function useMosques() {
  return useQuery({
    queryKey: ['mosques'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mosques')
        .select('*');
      if (error) throw error;
      return data;
    }
  });
}

// Save mosque mutation
export function useSaveMosque() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, mosqueId }) => {
      const { error } = await supabase
        .from('saved_mosques')
        .insert({ user_id: userId, mosque_id: mosqueId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-mosques'] });
    }
  });
}
```
