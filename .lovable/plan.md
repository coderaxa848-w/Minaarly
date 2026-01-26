
## Bulk Mosque Import Implementation Plan

### Overview
Create a complete CSV import system to bulk insert 2,189 mosques from `MosquesJan26Extended.csv` into Supabase with automatic slug generation and coordinate extraction.

---

### Part 1: Edge Function - `import-mosques`

Create `supabase/functions/import-mosques/index.ts` to handle CSV parsing and batch insertion.

#### CSV Format Analysis
Each line follows this pattern:
```
longitude,latitude,"*[flags]Name. Address. Phone","City,Postcode-ID:N"
```

**Example:**
```
-2.1007543802,57.1609160759,"*[250WArabArab]Aberdeen Mosque...","Aberdeen City,AB24 3JD-ID:1"
```

#### Extraction Logic
| Field | Extraction Method |
|-------|-------------------|
| Longitude | Column 1 |
| Latitude | Column 2 |
| Capacity | Parse `[250W...]` - number before `W` or end of bracket |
| Women's Facilities | Check for `W` in flags |
| Madhab | `Deob` = Deobandi, `Brel` = Barelvi, `Salf` = Salafi, `Shia` = Shia |
| Name | Text after `]` before first `.` |
| Address | Text between first and second `.` |
| Phone | Text after second `.` (if exists) |
| City | First part before comma in column 4 |
| Postcode | Text between comma and `-ID:` |

#### Function Features
- Accept CSV text in request body
- Parse each line with regex
- Call `generate_slug` RPC for each mosque
- Batch upsert into `mosques` table (chunks of 100)
- Return success/error counts and details

---

### Part 2: Admin Import Page

Create `src/pages/admin/ImportMosques.tsx` with:

#### UI Components
1. **File Upload Zone** - Accept CSV file
2. **Preview Section** - Show first 10 parsed records
3. **Dry Run Button** - Parse without inserting, show stats
4. **Import Button** - Execute actual import
5. **Progress Bar** - Show import progress
6. **Results Panel** - Success/error counts and details

#### State Management
- `file`: Uploaded CSV file
- `parsedData`: Array of parsed mosque objects
- `importing`: Boolean for loading state
- `progress`: Current import progress
- `results`: Import results (success, errors, skipped)

---

### Part 3: Routing Integration

#### Update App.tsx
Add new route under admin:
```typescript
<Route path="import" element={<ImportMosques />} />
```

#### Update Admin Index
Export the new component:
```typescript
export { default as ImportMosques } from './ImportMosques';
```

#### Update AdminDashboard
Add quick action button for Import Mosques

---

### Part 4: Supabase Config

Update `supabase/config.toml` to register the edge function:
```toml
[functions.import-mosques]
verify_jwt = false
```

---

### File Changes Summary

| Action | File |
|--------|------|
| Create | `supabase/functions/import-mosques/index.ts` |
| Create | `src/pages/admin/ImportMosques.tsx` |
| Modify | `src/App.tsx` - Add import route |
| Modify | `src/pages/admin/index.ts` - Export ImportMosques |
| Modify | `src/pages/admin/AdminDashboard.tsx` - Add import quick action |
| Modify | `supabase/config.toml` - Register edge function |

---

### Technical Details

#### Edge Function Structure
```text
supabase/functions/import-mosques/index.ts
+-- CORS headers configuration
+-- parseCsvLine() - Parse single CSV line
+-- extractMosqueData() - Extract all fields from parsed line
+-- parseCapacityFlags() - Parse [250WArab] format
+-- POST /import - Dry run mode (parse only)
+-- POST /execute - Actual database insertion
+-- Batch processing (100 records per batch)
+-- Error handling and logging
```

#### Import Page Flow
```text
1. User uploads CSV file
2. Client reads file as text
3. Click "Dry Run" -> POST to /import
   - Returns parsed data preview and validation
4. Review results, fix any issues
5. Click "Import" -> POST to /execute
   - Shows progress bar
   - Returns final counts
6. View success/error summary
```

#### Data Transformation
```text
CSV Line -> Parsed Object:
{
  name: "Aberdeen Mosque and Islamic Centre",
  address: "164-168 Spital",
  city: "Aberdeen City",
  postcode: "AB24 3JD",
  latitude: 57.1609160759,
  longitude: -2.1007543802,
  phone: "01224 493764",
  madhab: null,
  facilities: ["women_section"],
  capacity: 250
}
```

---

### Implementation Order

1. Create edge function with CSV parsing logic
2. Deploy and test edge function
3. Create ImportMosques.tsx page
4. Add routing and exports
5. Add quick action to dashboard
6. Test full import flow
