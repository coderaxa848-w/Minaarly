

## Two Changes: Prominent Mobile App Section + Mosque Admin Dashboard

### 1. Make MobileAppSection More Prominent

Since the web map has been removed and the app is the primary way to discover mosques, the MobileAppSection needs to be elevated.

**Changes:**
- Reorder landing page sections so MobileAppSection appears right after HeroSection
- Add an `id="get-the-app"` anchor to MobileAppSection so the Hero "Get the App" button scrolls to it
- Enhance the copy to position the app as THE way to use Minaarly (not supplementary)
- Add more feature highlights: mosque search, prayer times, events, saved mosques

**Files to modify:**
- `src/pages/Index.tsx` -- Reorder: Hero, MobileApp, HowItWorks, Features, WhoItsFor, CTA
- `src/components/landing/MobileAppSection.tsx` -- Bigger headline, stronger copy, anchor id
- `src/components/landing/HeroSection.tsx` -- "Get the App" button scrolls to `#get-the-app`

---

### 2. Mosque Admin Dashboard

When a user has an approved mosque claim, they get a "My Mosque" link in the navbar that takes them to a dashboard where they can manage their mosque.

**What mosque admins can do (permissions already exist in the database):**
- Edit mosque details (name, address, phone, email, website, facilities, languages, madhab)
- Create, edit, and delete mosque events
- Manage iqamah/prayer times (manual override or API-based)

**New files to create:**

- `src/hooks/useMosqueAdminCheck.ts` -- Hook that queries `mosque_admins` for approved claims belonging to the current user, joins with `mosques` to get mosque name/id. Returns `{ isMosqueAdmin, mosqueId, mosqueName, loading }`.

- `src/pages/MosqueDashboard.tsx` -- The mosque admin dashboard with tabbed sections:
  - **Overview tab**: Mosque name, address, verification status
  - **Edit Details tab**: Form to update mosque info (name, address, facilities, contact info, etc.)
  - **Prayer Times tab**: View/edit iqamah times with the existing API toggle
  - **Events tab**: List of mosque events with ability to create new ones, edit, or delete

**Files to modify:**

- `src/components/layout/Navbar.tsx` -- Add "My Mosque" link (with Building icon) in the user dropdown menu, visible only when `useMosqueAdminCheck` returns `isMosqueAdmin: true`. Added in both desktop dropdown and mobile menu.

- `src/App.tsx` -- Add `/mosque-dashboard` route pointing to the new MosqueDashboard page

### Technical Details

**useMosqueAdminCheck hook:**
```text
Query: mosque_admins WHERE user_id = auth.uid() AND status = 'approved'
Join: mosques table to get mosque name
Returns: { isMosqueAdmin, mosqueId, mosqueName, loading }
```

**MosqueDashboard page structure:**
```text
/mosque-dashboard
  +-- Protected: redirects to / if not mosque admin
  +-- Tabs
       +-- Overview (read-only summary)
       +-- Edit Details (form -> supabase update mosques)
       +-- Prayer Times (form -> supabase update iqamah_times)
       +-- Events (list + create/edit/delete -> supabase events table)
```

**Navbar dropdown order for logged-in users:**
```text
1. Submit Event (everyone)
2. My Mosque (mosque admins only) -- NEW
3. Admin Dashboard (platform admins only)
4. Sign Out
```

### Summary of All File Changes

| Action | File | What |
|--------|------|------|
| Modify | `src/pages/Index.tsx` | Reorder sections |
| Modify | `src/components/landing/MobileAppSection.tsx` | Enhanced copy, anchor id |
| Modify | `src/components/landing/HeroSection.tsx` | Scroll-to-anchor button |
| Create | `src/hooks/useMosqueAdminCheck.ts` | Hook for mosque admin detection |
| Create | `src/pages/MosqueDashboard.tsx` | Full mosque management dashboard |
| Modify | `src/components/layout/Navbar.tsx` | Add "My Mosque" nav item |
| Modify | `src/App.tsx` | Add /mosque-dashboard route |

