

# Event Organiser System

## Overview

Add a verified "Event Organiser" tier so trusted users can post community events without waiting for manual approval, while regular users remain limited to 1 submission per week.

## How It Works

**Regular users:**
- Can submit 1 community event per week (rolling 7-day window)
- Events go through the existing admin approval queue
- If they hit the limit, they see a message encouraging them to apply as an Event Organiser

**Event Organisers (verified):**
- Events are auto-approved on submission but still logged in the admin panel
- Unlimited submissions
- Their organiser profile (bio, org type, social links) appears on their events
- Must apply and be approved by a platform admin first

**Platform admins:**
- Review organiser applications (approve/reject) from the admin dashboard
- Can still see and revoke auto-approved events
- Can revoke organiser status at any time

## What Gets Built

### 1. Database Changes

**Add `event_organizer` to the `app_role` enum:**

```text
ALTER TYPE app_role ADD VALUE 'event_organizer';
```

**New table: `event_organizer_profiles`**

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Auto-generated |
| user_id | uuid (unique) | References auth.users |
| display_name | text | Public-facing name |
| org_type | text | 'individual' or 'company' |
| bio | text | Short description of themselves/org |
| social_instagram | text | Instagram handle or URL |
| social_twitter | text | Twitter/X handle or URL |
| social_website | text | Website URL |
| status | text | 'pending', 'approved', 'rejected' |
| admin_notes | text | Internal notes from reviewer |
| created_at | timestamptz | Submission timestamp |
| updated_at | timestamptz | Last update |

RLS policies:
- Users can view their own profile
- Users can insert their own application (once)
- Platform admins can view and update all
- Public can view approved profiles (for display on events)

**New DB function: `is_event_organizer(user_id)`**

Returns true if user has an approved organiser profile AND the `event_organizer` role. Used in RLS policies.

**New DB function: `can_submit_community_event(user_id)`**

Returns true if:
- User has `event_organizer` role, OR
- User has submitted fewer than 1 community event in the last 7 days

### 2. Update Community Events Flow

**SubmitEvent page (`src/pages/SubmitEvent.tsx`):**
- On load, check if user is an event organiser or has hit their weekly limit
- If organiser: show normal form, auto-set status to 'approved' on insert
- If regular user within limit: show normal form (status stays 'pending')
- If regular user at limit: show a friendly block message with a link to apply as an organiser

**RLS policy update on `community_events`:**
- Add policy allowing event organisers to insert with status='approved'

### 3. Organiser Application Page

**New page: `/become-organiser`**

A clean form collecting:
- Display name (pre-filled from profile)
- Organisation type: Individual or Company/Charity (radio buttons)
- Bio/about (textarea, max 500 chars)
- Social links: Instagram, Twitter/X, Website (all optional)

After submission, show a confirmation message that the application is under review.

### 4. Admin: Organiser Applications Panel

**New admin page: `/admin/organisers`**

- List all organiser applications with status filter (pending/approved/rejected)
- View detail dialog with all submitted info
- Approve (grants `event_organizer` role in `user_roles` + updates profile status) or Reject with optional admin notes

**Add to admin sidebar navigation.**

### 5. Display Organiser Info on Events

When viewing a community event created by an event organiser, show their:
- Display name
- Bio snippet
- Social links (as clickable icons)

This appears in the event detail view and the community events feed.

## Technical Details

### Files to Create
- `src/pages/BecomeOrganiser.tsx` -- application form
- `src/pages/admin/OrganisersList.tsx` -- admin review panel

### Files to Modify
- `supabase/migrations/` -- new migration for enum, table, functions, RLS
- `src/pages/SubmitEvent.tsx` -- rate limit check, auto-approve logic
- `src/pages/admin/CommunityEventsList.tsx` -- show organiser badge on auto-approved events
- `src/components/admin/AdminSidebar.tsx` -- add "Organisers" nav link
- `src/App.tsx` -- add routes for `/become-organiser` and `/admin/organisers`
- `src/integrations/supabase/types.ts` -- auto-updated after migration

### Implementation Order
1. Database migration (enum, table, functions, RLS policies)
2. Organiser application page (`/become-organiser`)
3. Admin organiser review panel (`/admin/organisers`)
4. Update SubmitEvent with rate limiting and auto-approve
5. Display organiser info on events

