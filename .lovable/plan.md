

# Mosque Data Migration v4: Replace with Minaarly (1).csv

## What We'll Do

1. **Backup** your current 2,959 mosques into a safety table (`mosques_backup_20260212`)
2. **Clean out** all current mosque data and any linked test data (events, prayer times, saved mosques, claims)
3. **Add new database columns** for the richer fields in the new CSV (parking, wheelchair access, wudu details, Ramadan info, etc.)
4. **Update the import tool** so it understands the new CSV format
5. **You upload** `Minaarly (1).csv` through your admin dashboard Import page -- done!

After this, you'll have 3,338 mosques with significantly more detail than before.

---

## What You Gain

The new dataset includes fields your current data doesn't have:

- Denomination and year established
- Parking type and availability
- Wheelchair accessibility (prayer hall, wudu, parking)
- Wudu facility quality and women's wudu details
- Iftar facilities
- Tarawih and Qiyamul Layl info (great for Ramadan)
- Pre-written descriptions and services

All your existing fields (contacts, socials, coordinates, etc.) are preserved in the new CSV.

---

## What Gets Deleted

Since mosque IDs change with a fresh import, any data linked to old mosques must go:

| Data | Action |
|------|--------|
| Current mosques (2,959) | Backed up, then removed |
| Events (test data) | Removed |
| Prayer times | Removed |
| Saved mosques | Removed |
| Mosque admin claims | Removed |

This is all pre-launch test data, so no real user impact.

---

## Technical Details

### Database Migration (SQL)

**Backup and clean:**
```text
1. CREATE TABLE mosques_backup_20260212 AS SELECT * FROM mosques
2. DELETE from events, iqamah_times, saved_mosques, mosque_admins
3. TRUNCATE mosques
```

**New columns added to mosques table:**
```text
denomination, established, wudu_facilities, womens_wudu,
iftar_facilities, parking_type, parking_availability,
wheelchair_prayer_hall, wheelchair_wudu, wheelchair_parking,
tarawih_rakah, tarawih_type, qiyamul_layl
```

### Edge Function Update

Rewrite `supabase/functions/import-mosques/index.ts` to:
- Map the new CSV column layout (different indices from v3)
- Parse new fields (denomination, parking, wheelchair booleans, tarawih, etc.)
- Handle "Not Available" values across all fields
- Keep the Shia exclusion filter as a safeguard
- Geocode any mosques missing coordinates via Postcodes.io API

### Admin Import Page Update

Update `src/pages/admin/ImportMosques.tsx` to:
- Label as "v4 format" with updated field descriptions
- Show new fields in the preview cards

### Import Flow

After deployment, you go to `/admin/import`, paste or upload `Minaarly (1).csv`, and the chunked importer handles all 3,338 records (7 batches of 500).

