
# Fix: Duplicate Slug Collisions During Import

## The Problem

5 mosques failed to import because they generated the same slug as mosques already in the database. For example, "Muslim Prayer Room" with postcode "E3 3AA" generates slug `muslim-prayer-room-e33aa` -- which already exists from the first import.

The edge function **does** have collision handling (appending `-2`, `-3`, etc.), and it **does** fetch existing slugs before importing. The bug is that the collision check works correctly for new-vs-new conflicts within the same batch, but these 5 are genuine duplicates -- same mosque name AND same postcode appearing in both datasets.

## Root Cause

The collision suffix logic (`-2`, `-3`) works, but there's a subtle issue: the function only queries slugs from the `mosques` table once at the start. If the exact same slug was already inserted in a previous chunk (or previous import), it should still be in the `slugSet`. So the real problem is likely that these are **exact same records** being re-imported, meaning the slug with `-2` suffix also already exists.

## Solution

Improve the edge function's slug collision handling to be more robust:

1. **Better collision resolution**: When a slug collision is detected, query the database for ALL slugs starting with the base slug to find the next available suffix number
2. **Add an upsert option**: Allow the import to update existing records instead of failing on duplicates (matched by name + postcode)

## Technical Changes

### File: `supabase/functions/import-mosques/index.ts`

**Change 1: Fetch all potentially conflicting slugs**

Instead of fetching all slugs (which could be thousands), fetch slugs with a LIKE match when a collision is detected:

```typescript
// When slug collision detected, query DB for next available suffix
async function getNextAvailableSlug(
  supabase: any, 
  baseSlug: string, 
  slugSet: Set<string>
): Promise<string> {
  // Also check DB for any suffixed versions
  const { data } = await supabase
    .from('mosques')
    .select('slug')
    .like('slug', `${baseSlug}%`);
  
  // Add all found slugs to our set
  if (data) {
    for (const row of data) {
      slugSet.add(row.slug);
    }
  }
  
  let slug = baseSlug;
  let counter = 1;
  while (slugSet.has(slug)) {
    counter++;
    slug = `${baseSlug}-${counter}`;
  }
  return slug;
}
```

**Change 2: Update the insert loop to use the improved function**

Replace the inline collision logic with a call to the new helper, making it async-aware.

**Change 3: Set `muslims_in_britain_data = false` for new imports**

Since this is a different data source (Round 3), newly imported mosques should have `muslims_in_britain_data` set based on the source, or default to `false`.

### Outcome

- All 5 previously failing mosques will import successfully with unique slugs (e.g., `muslim-prayer-room-e33aa-2`)
- Future imports with duplicate names will also be handled gracefully
- No data loss or overwrites

### Steps
1. Update the `import-mosques` edge function with improved slug collision handling
2. Deploy the updated function
3. Re-import the CSV -- the 5 previously failed mosques will now succeed
