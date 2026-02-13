

# Fix: Non-Mosque Community Events Not Appearing in Admin Events Page

## Problem
When any user (organiser or normal) creates an event at a custom location (not a mosque), it gets stored in the `community_events` table. The database trigger `sync_community_event_to_events` only syncs events that have a `mosque_id`, so non-mosque events are never copied to the `events` table. The admin Events page (`EventsList.tsx`) only queries the `events` table, meaning non-mosque community events are invisible -- even when approved.

## Root Cause
- The `events` table has a mandatory `mosque_id` foreign key, so non-mosque events structurally cannot exist there
- The admin Events page only queries the `events` table
- The trigger correctly skips non-mosque events (they can't go into `events`)

## Solution

### 1. Revert Community Events filter back to "pending"
Change the default filter in `CommunityEventsList.tsx` back to `'pending'` so admins see events needing review first.

### 2. Update the admin Events page to also show approved community events
Modify `EventsList.tsx` to fetch approved community events from the `community_events` table (both mosque and non-mosque) and display them alongside regular mosque events. Non-mosque events will show their custom location instead of a mosque name.

### Technical Details

**File: `src/pages/admin/CommunityEventsList.tsx`**
- Revert line 48: Change `useState('all')` back to `useState('pending')`

**File: `src/pages/admin/EventsList.tsx`**
- Add a second query to fetch approved `community_events` where `is_at_mosque = false`
- Merge these into the events list with a "Community" badge to distinguish them
- Display `custom_location` and `postcode` instead of mosque name/city for non-mosque events
- Sort all events together by date

The unified interface will look like:
- Mosque events show "Mosque Name, City" as location
- Non-mosque events show "Custom Location" with a "Community" badge
- Both appear in the same Upcoming/Past sections, sorted by date

