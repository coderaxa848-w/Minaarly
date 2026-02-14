

## Add Bug Reports and User Suggestions to Admin Dashboard

### What we're building
Two new sections on the admin dashboard and two new admin pages to manage:
1. **Bug Reports** (from `issue_report_form` table) - user-submitted bug reports with screenshots/videos
2. **User Suggestions** (from `user_suggestions` table) - feature requests from users

### Changes

#### 1. Admin Dashboard (`AdminDashboard.tsx`)
- Add two new stat cards: "Bug Reports" (count of unresolved issues) and "Suggestions" (count of unaccepted suggestions)
- Add a new "Recent Reports" section below the existing Pending Claims area showing the latest 5 bug reports with category, description preview, and time ago
- Fetch counts from `issue_report_form` (where `resolved = false`) and `user_suggestions` (where `accepted = false`)

#### 2. New Admin Page: Bug Reports (`src/pages/admin/BugReportsList.tsx`)
- Table view of all bug reports with columns: category, description, mosque name, screenshots, video, resolved status, date
- Ability to mark as resolved / add notes
- Click to expand and view full details including screenshots and video

#### 3. New Admin Page: User Suggestions (`src/pages/admin/SuggestionsList.tsx`)
- Table view of all suggestions with columns: area, description, user email, screenshots, accepted status, date
- Ability to mark as accepted
- Click to expand full details

#### 4. Sidebar (`AdminSidebar.tsx`)
- Add two new nav items: "Bug Reports" and "Suggestions" with appropriate icons (Bug and Lightbulb)

#### 5. Routing (`App.tsx`)
- Add routes: `/admin/bug-reports` and `/admin/suggestions`

#### 6. RLS Policies
- Both `issue_report_form` and `user_suggestions` currently have **no RLS policies** -- we need to add admin SELECT/UPDATE policies so the admin dashboard can read and update these records

### Technical Details

**Database queries for dashboard stats:**
```sql
-- Bug reports count (unresolved)
SELECT count(*) FROM issue_report_form WHERE resolved = false;
-- Suggestions count (not accepted)  
SELECT count(*) FROM user_suggestions WHERE accepted = false;
```

**RLS policies to add:**
- `issue_report_form`: Admin can SELECT, UPDATE all rows; users can INSERT and SELECT their own
- `user_suggestions`: Admin can SELECT, UPDATE all rows; users can INSERT and SELECT their own

**New files:**
- `src/pages/admin/BugReportsList.tsx`
- `src/pages/admin/SuggestionsList.tsx`

**Modified files:**
- `src/pages/admin/AdminDashboard.tsx` - add stats + recent reports section
- `src/components/admin/AdminSidebar.tsx` - add nav items
- `src/App.tsx` - add routes
- `src/pages/admin/index.ts` - export new pages

