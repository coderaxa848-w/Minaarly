
# Add Services Field to Mosques Table

## Overview
Add a `services` column to the `mosques` table to allow mosques to list the services they offer (Nikkah, Hall booking, Immigration advice, etc.).

## Database Change

### Migration: Add `services` column

```sql
-- Add services column to mosques table
ALTER TABLE mosques
ADD COLUMN services TEXT[] DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN mosques.services IS 
  'Services offered by the mosque: nikkah, hall_booking, immigration_advice, counselling, funeral, or custom text';
```

### Suggested Service Codes (for consistency)
| Code | Display Name |
|------|--------------|
| `nikkah` | Nikkah (Islamic Marriage) |
| `hall_booking` | Hall/Venue Booking |
| `immigration_advice` | Immigration Advice |
| `counselling` | Counselling Services |
| `funeral` | Funeral Services |
| `zakat_collection` | Zakat Collection |
| `food_bank` | Food Bank |
| (any custom text) | (Custom Service) |

The array accepts any text, so mosques can add custom services not in the predefined list.

## React Native Developer Instructions

### Claim Form - Notes Field
The `notes` field already exists in `mosque_admins`. Include it in the claim submission:

```typescript
// Submit claim with notes
const { error } = await supabase
  .from('mosque_admins')
  .insert({
    mosque_id: selectedMosque.id,
    user_id: user.id,
    claimant_name: name,
    claimant_email: user.email,
    claimant_phone: phone,
    claimant_role: 'imam', // or 'committee_member', 'volunteer', 'other'
    notes: additionalNotes  // <-- FREE TEXT FIELD FOR DETAILS
  });
```

### Displaying Services on Mosque Detail

```typescript
// Fetch mosque with services
const { data } = await supabase
  .from('mosques')
  .select('*, services')
  .eq('slug', mosqueSlug)
  .single();

// Display services
{data.services?.map((service) => (
  <Badge key={service}>{formatServiceName(service)}</Badge>
))}

// Helper to format service codes
const formatServiceName = (code: string) => {
  const map: Record<string, string> = {
    nikkah: 'Nikkah',
    hall_booking: 'Hall Booking',
    immigration_advice: 'Immigration Advice',
    counselling: 'Counselling',
    funeral: 'Funeral Services',
    zakat_collection: 'Zakat Collection',
    food_bank: 'Food Bank',
  };
  return map[code] || code; // Return code as-is if custom
};
```

### Mosque Admin - Adding Services

When a mosque admin edits their mosque, they can update services:

```typescript
const { error } = await supabase
  .from('mosques')
  .update({
    services: ['nikkah', 'hall_booking', 'Custom Service Here']
  })
  .eq('id', mosqueId);
```

## Files to Modify

| File | Change |
|------|--------|
| Database Migration | Add `services TEXT[]` column |
| `src/integrations/supabase/types.ts` | Auto-regenerated after migration |
| `src/pages/MosqueDetail.tsx` | Display services section |
| `src/pages/admin/MosqueForm.tsx` | Add services multi-select |
| `src/lib/types.ts` | Add Service type (optional) |
| `docs/DATABASE.md` | Document new column |
| `docs/HANDOFF_REACT_NATIVE.md` | Add services to mobile docs |

## Technical Notes

### Why TEXT[] instead of just TEXT?
- Mosques typically offer multiple services
- Consistent with `facilities` field pattern
- Easy to query: `WHERE 'nikkah' = ANY(services)`
- Easy to filter in the app

### RLS
No new policies needed - services inherit existing mosque RLS:
- Anyone can view (SELECT)
- Mosque admins can update their mosque
- Platform admins have full access
