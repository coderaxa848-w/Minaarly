

# Consolidate Women's Section Data

## Goal
Remove the redundant `has_womens_section` boolean column and use `womens_area` from the `facilities` array as the single source of truth.

## Why This Is Safe
Every mosque with `has_womens_section = true` already has `womens_area` in its facilities array. No data will be lost.

## Changes

### 1. Database Migration
- Drop the `has_womens_section` column from the `mosques` table
- No data migration needed since `womens_area` already exists in facilities for all relevant mosques

### 2. MosqueDashboard.tsx (mosque admin edit form)
- Remove the `has_womens_section` toggle switch
- Replace it with a `womens_area` checkbox/toggle that adds/removes it from the `facilities` array (or rely on the existing facilities editing if one exists)
- Remove `has_womens_section` from the save/update call

### 3. MosqueDetail.tsx (public detail page)
- Add a "Sisters" badge in the hero section, driven by checking `facilities?.includes('womens_area')`
- The facilities grid already shows it, so this adds the prominent badge without duplication concerns (badge = highlight, grid = full list)

### 4. import-mosques edge function
- Remove `has_womens_section` from the `MosqueImport` interface
- Remove it from the insert payload
- Keep the logic that adds `womens_area` to the facilities array (already there)

### 5. ImportMosques.tsx (admin import preview)
- Change the "Women's Area" badge to check `facilities.includes('womens_area')` instead of `has_womens_section`

### 6. MosqueForm.tsx (admin mosque form)
- Already has `womens_section` in its facilities list -- rename to `womens_area` for consistency with the imported data

## Files to Modify
- SQL migration to drop the column
- `src/pages/MosqueDashboard.tsx` -- remove toggle, update save logic
- `src/pages/MosqueDetail.tsx` -- add Sisters badge from facilities
- `src/pages/admin/ImportMosques.tsx` -- use facilities check
- `src/pages/admin/MosqueForm.tsx` -- rename facility value
- `supabase/functions/import-mosques/index.ts` -- remove from interface and insert

## Implementation Order
1. Database migration (drop column)
2. Update all code references in a single pass

