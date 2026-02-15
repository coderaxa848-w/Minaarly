

## AI-Powered Prayer Timetable Extraction

### Overview

Build a system where mosque admins upload photos/PDFs of printed prayer timetables, AI extracts the iqamah times, and after admin review the data is saved to the database. Files are uploaded to temporary storage, Gemini fetches them directly via URL, and temp files are deleted after extraction.

### Prerequisites

A `GEMINI_API_KEY` secret needs to be added to the Supabase project before the edge function will work.

---

### Step 1: Database Migration

**Rename and restructure `masjid_salah_times_weekly`:**

- Rename table to `masjid_salah_times_monthly`
- Rename `weekly_times` column to `monthly_times`
- Drop `week_start_date` and `weekly_payload_hash` columns
- Add `madhab_preference` (text, nullable)
- Add `special_dates` (JSONB, nullable)
- Add unique constraint on `(masjid_id, month, year)`
- Delete existing test rows

**Tighten RLS policies (currently wide-open `true`):**

- SELECT: Anyone can view (public prayer times)
- INSERT: Mosque admins for their mosque, or platform admins
- UPDATE: Mosque admins for their mosque, or platform admins
- DELETE: Mosque admins for their mosque, or platform admins

**Add `month` and `year` columns to `masjid_salah_uploads`** for tracking.

**Create `temp-uploads` storage bucket:**

- Public read access (so Gemini can fetch files via URL)
- Authenticated users can upload
- RLS policies for upload and read

---

### Step 2: Edge Function -- `extract-prayer-times`

Create `supabase/functions/extract-prayer-times/index.ts`

**Input:**
```text
{
  "file_url": "https://...supabase.co/storage/v1/object/public/temp-uploads/abc.jpg",
  "file_type": "image/jpeg",
  "mosque_id": "uuid",
  "mosque_name": "string",
  "madhab_preference": "hanafi" | "shafi" | null,
  "mode": "single" | "bulk"
}
```

**What it does:**

1. Receives the public URL of the uploaded file (no base64)
2. Calls **Google Gemini 2.0 Flash-Exp** directly (`gemini-2.0-flash-exp`) with `fileData.fileUri` pointing to the URL
3. Uses tool calling (structured output) for consistent JSON extraction
4. Validates times: HH:MM 24-hour format, logical order (Fajr < Sunrise < Dhuhr < Asr < Maghrib < Isha)
5. Deletes the temp file from storage after extraction
6. Returns extracted data with warnings -- does NOT save to DB
7. Authenticates caller via JWT claims

**Output:**
```text
{
  "success": true,
  "extracted": {
    "month": "February",
    "year": 2026,
    "monthly_times": {
      "days": [
        {
          "date": "2026-02-01",
          "day": "sunday",
          "prayers": [
            { "prayer": "fajr", "adhan": "05:45", "iqamah": "06:15" },
            { "prayer": "sunrise", "adhan": "07:20", "iqamah": null },
            { "prayer": "dhuhr", "adhan": "12:18", "iqamah": "13:15" },
            { "prayer": "asr", "adhan": "14:48", "iqamah": "16:00" },
            { "prayer": "maghrib", "adhan": "17:19", "iqamah": "17:24" },
            { "prayer": "isha", "adhan": "18:52", "iqamah": "19:15" }
          ],
          "jumuah": "13:30"
        }
      ]
    },
    "special_dates": [],
    "warnings": []
  }
}
```

**Error handling:**
- Invalid/blurry images: return error message with guidance
- Rate limits: surface Gemini 429 errors
- Missing times: flag in warnings array, don't reject

**Gemini prompt strategy:**
- System prompt instructs extraction of structured timetable data
- Specifies all 6 prayers plus Jumuah
- Requests both adhan and iqamah where visible
- Handles madhab-specific Asr times
- Ramadan-aware (Suhoor/Iftar/Taraweeh)
- Normalises dates to YYYY-MM-DD, times to HH:MM 24h

**Model configuration:**
```text
model: "gemini-2.0-flash-exp"
// When experimental phase ends, switch to: "gemini-2.0-flash-001"
```

---

### Step 3: Mosque Dashboard UI Updates

Modify `src/pages/MosqueDashboard.tsx` to add timetable upload functionality to the Prayer Times tab.

**Upload flow:**
1. File input (JPG/PNG/WEBP/PDF)
2. Month/year selector
3. Madhab dropdown (if mosque doesn't have one set)
4. "Extract Times" button

**On extract:**
1. Upload file to `temp-uploads` bucket, get public URL
2. Call `extract-prayer-times` edge function with URL
3. Show loading state: "Extracting times..."
4. Display review table with all extracted days

**Review table:**
- Calendar grid showing date, day, and all 6 prayer times (adhan + iqamah)
- Editable cells -- click to correct AI mistakes
- Yellow highlight on AI-flagged warnings
- Jumuah time shown for Fridays

**Actions:**
- "Save and Publish" -- upserts to `masjid_salah_times_monthly`
- "Cancel" -- discards extracted data

**Monthly overview section:**
- Show which months already have timetable data
- Status badges per month
- Option to re-upload/replace existing month

---

### Files to Create/Modify

**New files:**
- `supabase/functions/extract-prayer-times/index.ts`

**Modified files:**
- `supabase/config.toml` -- add `[functions.extract-prayer-times]` with `verify_jwt = false`
- `src/pages/MosqueDashboard.tsx` -- add upload UI, review table, and save logic to Prayer Times tab

**Database migration:**
- Rename table and columns, add new columns, add constraints, tighten RLS
- Create `temp-uploads` storage bucket with RLS
- Add month/year to `masjid_salah_uploads`

---

### Why Direct Gemini API (not Lovable AI Gateway)

- Lovable AI Gateway does not offer `gemini-2.0-flash-exp`
- Direct API is free during the experimental phase
- Lower latency (no middleman)
- Direct access to Gemini's `fileData.fileUri` feature for URL-based image input
- When the model graduates to stable, cost is ~$0.10/$0.40 per 1M tokens (pennies per extraction)

---

### Cost Summary

| Phase | Cost per extraction | Annual cost (1,700 mosques) |
|-------|--------------------|-----------------------------|
| Experimental (current) | Free | Free |
| Stable (future) | ~$0.0004 per month | ~$5/year (~4 GBP) |

---

### React Native Compatibility

The edge function accepts a file URL and returns JSON, so it works identically from React Native. The RN app would use `react-native-image-picker` or `react-native-document-picker`, upload to `temp-uploads`, call the same edge function, and display a native review table. No separate backend work needed.

---

### Edge Cases

| Scenario | Approach |
|----------|----------|
| Dual Asr (Hanafi/Shafi) | Madhab selection sent in request, AI prompt adapted |
| Ramadan timetables | AI prompt includes Ramadan awareness |
| Blurry/low quality images | Gemini OCR handles; warnings returned |
| Missing times | Flagged in warnings, yellow cells in review |
| Full year upload (bulk) | Process as 12 separate months |
| Different date formats | AI normalises to YYYY-MM-DD |
| Duplicate month | Unique constraint prevents; UI offers replace |
| Large PDFs | URL-based approach handles large files without memory issues |

