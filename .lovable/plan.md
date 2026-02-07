
# Direct Mosque Data Import Plan

## Problem Identified
The edge function's CORS headers are incomplete, causing "Failed to send a request" errors from the browser.

## Solution: Fix CORS + Direct API Import

### Step 1: Fix Edge Function CORS Headers
Update `supabase/functions/import-mosques/index.ts` to include all required Supabase client headers:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};
```

### Step 2: Deploy Edge Function
The function will auto-deploy after the fix.

### Step 3: Import Data via API
I'll use the `curl_edge_functions` tool to call the import function directly with the CSV data from `src/mosques/MosquesJan26Extended_v3.csv`.

The import will be done in 5 chunks of 500 records each:
- Chunk 1: Lines 0-499 (500 mosques)
- Chunk 2: Lines 500-999 (500 mosques)  
- Chunk 3: Lines 1000-1499 (500 mosques)
- Chunk 4: Lines 1500-1999 (500 mosques)
- Chunk 5: Lines 2000-2040 (40 mosques)

### Step 4: Verify Import
Query the database to confirm:
- Total count = 2,040
- Spot check random records
- Verify slugs are unique

## Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/import-mosques/index.ts` | Fix CORS headers |

## Expected Result
All 2,040 mosques imported with:
- Proper slugs (with collision handling)
- Social links as JSONB
- Usage type, capacity, management fields populated
- Facilities array populated from women's section data

## Technical Notes

### Why This Will Work
- The `curl_edge_functions` tool bypasses browser CORS restrictions
- I can read the CSV directly from the project files
- The chunked import avoids timeout issues

### Backup Safety
The `mosques_backup_20260207` table already contains your original data if anything needs to be recovered.
