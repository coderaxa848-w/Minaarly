# Prayer Timetable AI Extraction — React Native Implementation Guide

> **Last Updated:** February 2026  
> **Feature:** AI-powered prayer timetable extraction from images/PDFs

---

## Overview

Mosque admins can upload a photo or PDF of their prayer timetable and have it automatically digitised using Google Gemini AI. The extracted data (adhan + iqamah times for every day of the month) is returned as structured JSON for review, then saved to the `masjid_salah_times_monthly` table.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     MOBILE APP FLOW                          │
├─────────────────────────────────────────────────────────────┤
│  1. User picks image/PDF from gallery or camera             │
│  2. Upload to Supabase Storage: temp-uploads bucket         │
│  3. Get public URL of uploaded file                         │
│  4. Call extract-prayer-times Edge Function with URL         │
│  5. Receive structured JSON with all prayer times            │
│  6. Show editable grid for review                           │
│  7. On confirm, save to masjid_salah_times_monthly          │
└─────────────────────────────────────────────────────────────┘
```

---

## Step 1: Upload File to `temp-uploads`

The `temp-uploads` bucket is **public** so the Edge Function can access the file URL.

```typescript
import { supabase } from './supabaseClient';

async function uploadTimetableFile(file: {
  uri: string;
  name: string;
  type: string; // e.g. 'image/jpeg', 'image/png', 'application/pdf'
}) {
  const filePath = `prayer-times/${Date.now()}-${file.name}`;
  
  // Read file as blob (React Native)
  const response = await fetch(file.uri);
  const blob = await response.blob();

  const { data, error } = await supabase.storage
    .from('temp-uploads')
    .upload(filePath, blob, {
      contentType: file.type,
      upsert: false,
    });

  if (error) throw error;

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('temp-uploads')
    .getPublicUrl(filePath);

  return {
    publicUrl: urlData.publicUrl,
    filePath,
    mimeType: file.type,
  };
}
```

---

## Step 2: Call the Edge Function

```typescript
async function extractPrayerTimes({
  fileUrl,
  fileType,
  mosqueId,
  mosqueName,
  madhabPreference, // optional: 'hanafi' | 'shafii' | null
}: {
  fileUrl: string;
  fileType: string;
  mosqueId: string;
  mosqueName: string;
  madhabPreference?: string | null;
}) {
  const { data, error } = await supabase.functions.invoke('extract-prayer-times', {
    body: {
      file_url: fileUrl,
      file_type: fileType,        // e.g. 'image/jpeg', 'application/pdf'
      mosque_id: mosqueId,
      mosque_name: mosqueName,
      madhab_preference: madhabPreference || null,
      mode: 'single',             // 'single' for one month, 'bulk' for multi
    },
  });

  if (error) throw error;
  if (!data.success) throw new Error(data.error);

  return data.extracted;
  // Returns: { month, year, monthly_times, special_dates, warnings }
}
```

### Response Shape

```typescript
interface ExtractionResult {
  month: string;           // e.g. "January"
  year: number;            // e.g. 2026
  monthly_times: {
    days: Array<{
      date: string;        // "2026-01-01"
      day: string;         // "thursday"
      prayers: Array<{
        prayer: 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
        adhan: string | null;   // "06:30" or null
        iqamah: string | null;  // "06:45" or null
      }>;
      jumuah?: string | null;   // "13:30" on Fridays
    }>;
  };
  special_dates: Array<{
    date: string;
    name: string;
    notes: string;
  }>;
  warnings: string[];       // Any extraction issues
}
```

---

## Step 3: Review UI

After extraction, present the data in an **editable calendar grid** before saving. Key UX points:

- Show warnings from the AI at the top (e.g. "Could not read Asr time for 15th")
- Highlight any cells with null/missing times in red
- Allow manual correction of any time
- Show both Adhan and Iqamah columns
- Highlight Fridays (show Jumuah time)
- Show the month/year header with ability to correct

---

## Step 4: Save to Database

```typescript
async function savePrayerTimes({
  mosqueId,
  mosqueName,
  month,       // 1-12
  year,        // 2026
  monthlyTimes,
  specialDates,
  madhabPreference,
}: {
  mosqueId: string;
  mosqueName: string;
  month: number;
  year: number;
  monthlyTimes: any;       // The monthly_times object from extraction
  specialDates: any[];
  madhabPreference?: string;
}) {
  const { data, error } = await supabase
    .from('masjid_salah_times_monthly')
    .upsert(
      {
        masjid_id: mosqueId,
        masjid_name: mosqueName,
        month,
        year,
        monthly_times: monthlyTimes,
        special_dates: specialDates.length > 0 ? specialDates : null,
        madhab_preference: madhabPreference || null,
        source: 'ai_extracted',
        created_by: (await supabase.auth.getUser()).data.user?.id,
      },
      { onConflict: 'masjid_id,month,year' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

### Important: Unique Constraint

The table has a **unique constraint on `(masjid_id, month, year)`**, so upserting will replace any existing data for that month. Warn the user if data already exists.

---

## Step 5: Reading Monthly Prayer Times (Public)

For displaying prayer times to end users (no auth required):

```typescript
// Get current month's timetable for a mosque
async function getMonthlyPrayerTimes(mosqueId: string, month: number, year: number) {
  const { data, error } = await supabase
    .from('masjid_salah_times_monthly')
    .select('*')
    .eq('masjid_id', mosqueId)
    .eq('month', month)
    .eq('year', year)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// Get today's prayer times from monthly data
function getTodaysPrayers(monthlyData: any): any | null {
  if (!monthlyData?.monthly_times?.days) return null;
  
  const today = new Date().toISOString().split('T')[0]; // "2026-02-16"
  return monthlyData.monthly_times.days.find(
    (day: any) => day.date === today
  );
}

// Get all available months for a mosque
async function getAvailableMonths(mosqueId: string) {
  const { data, error } = await supabase
    .from('masjid_salah_times_monthly')
    .select('month, year, source, updated_at')
    .eq('masjid_id', mosqueId)
    .order('year', { ascending: false })
    .order('month', { ascending: false });

  if (error) throw error;
  return data;
}
```

---

## Error Handling

| Scenario | HTTP Status | Error Message |
|----------|-------------|---------------|
| Not logged in | 401 | "Unauthorized" |
| Missing file_url | 400 | "file_url and mosque_id are required" |
| AI can't read image | 422 | "Could not extract prayer times..." |
| Rate limited | 429 | "Rate limit exceeded..." |
| Server error | 500 | "AI extraction failed..." |

---

## Supported File Types

- `image/jpeg` — Best results, recommended
- `image/png` — Good results
- `application/pdf` — Supported, works well for printed timetables
- `image/webp` — Supported

**Tip:** Encourage users to take clear, well-lit photos. Cropping to just the timetable improves accuracy.

---

## Client-Side Image Compression (Recommended)

Before uploading, compress images to reduce upload time:

```typescript
// React Native - use react-native-image-resizer or expo-image-manipulator
import * as ImageManipulator from 'expo-image-manipulator';

async function compressImage(uri: string) {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1920 } }],  // Max width
    { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
  );
  return result; // { uri, width, height }
}
```

---

## Legacy Fallback: `iqamah_times` Table

Some mosques may only have data in the legacy `iqamah_times` table (single set of times, no date-specific data). Your app should:

1. First check `masjid_salah_times_monthly` for the current month
2. If no monthly data, fall back to `iqamah_times` for basic times
3. Display a notice like "These times may not be current"

```typescript
async function getPrayerTimesWithFallback(mosqueId: string) {
  const now = new Date();
  const monthly = await getMonthlyPrayerTimes(mosqueId, now.getMonth() + 1, now.getFullYear());
  
  if (monthly) {
    return { source: 'monthly', data: monthly };
  }

  // Fallback to legacy iqamah_times
  const { data: legacy } = await supabase
    .from('iqamah_times')
    .select('*')
    .eq('mosque_id', mosqueId)
    .maybeSingle();

  return { source: 'legacy', data: legacy };
}
```

---

## Database Schema: `masjid_salah_times_monthly`

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `masjid_id` | uuid | FK to mosques |
| `masjid_name` | text | Denormalised mosque name |
| `month` | smallint | 1-12 |
| `year` | smallint | e.g. 2026 |
| `monthly_times` | jsonb | `{ days: [...] }` — see response shape above |
| `special_dates` | jsonb | Array of special dates (nullable) |
| `madhab_preference` | text | hanafi, shafii, etc. (nullable) |
| `source` | text | `manual`, `upload`, `parsed_upload`, `ai_extracted` |
| `created_by` | uuid | User who uploaded |
| `created_at` | timestamp | Auto |
| `updated_at` | timestamp | Auto |

**Unique constraint:** `(masjid_id, month, year)`

**RLS:** Public read, mosque admins + platform admins can insert/update/delete.
