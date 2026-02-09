
## Fix: Empty City Values Crashing Admin Mosques List

### Problem
The Radix UI `<SelectItem>` component requires a non-empty string for its `value` prop. Two mosques in the database have empty string cities, causing the city filter dropdown to crash with: *"A SelectItem must have a value prop that is not an empty string."*

### Solution (2 parts)

**1. Fix the data in the database**
Update the 2 mosques with empty cities:
- "Dundalk Muslim Community Centre" -> city = "Dundalk"
- "Masjid Isa Ibn Maryam" (98 Dames Road) -> city = "London"

**2. Add defensive filtering in `MosquesList.tsx`**
In the `fetchCities()` function, filter out empty/null city values before setting state, so this can never happen again even if future data has missing cities.

### Technical Details

**File: `src/pages/admin/MosquesList.tsx`** (line ~62)

Change:
```ts
const uniqueCities = [...new Set(data.map(m => m.city))];
```
To:
```ts
const uniqueCities = [...new Set(data.map(m => m.city).filter(c => c && c.trim() !== ''))];
```

**Database update** (run via Supabase):
```sql
UPDATE mosques SET city = 'Dundalk' WHERE name = 'Dundalk Muslim Community Centre' AND (city = '' OR city IS NULL);
UPDATE mosques SET city = 'London' WHERE name = 'Masjid Isa Ibn Maryam' AND (city = '' OR city IS NULL);
```
