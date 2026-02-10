

## Community Event Submissions by Organizers

### Overview

Allow external event organizers (non-mosque admins) to submit events for admin approval. Approved events appear on the mobile app. This adds two new columns to the previously agreed schema: **event type** and **audience gender**.

### Database: New Table `community_events`

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Auto-generated |
| user_id | uuid | The organizer who submitted |
| status | text ('pending', 'approved', 'rejected') | Default 'pending' |
| title | text (NOT NULL) | Event name |
| description | text | What the event is about |
| organizer_name | text (NOT NULL) | Organizer's full name |
| organizer_email | text | Contact email |
| organizer_phone | text | Contact phone |
| event_date | date (NOT NULL) | Date of event |
| start_time | time (NOT NULL) | Start time |
| end_time | time | End time |
| **event_type** | **text (NOT NULL)** | **Type of event: 'quran', 'lecture', 'talk', 'workshop', 'fundraiser', 'iftar', 'community', 'youth', 'other'** |
| **audience** | **text (NOT NULL, default 'mixed')** | **Who the event is for: 'brothers_only', 'sisters_only', 'mixed'** |
| is_at_mosque | boolean (default false) | Whether at a mosque |
| mosque_id | uuid (FK to mosques, nullable) | If at a mosque, which one |
| custom_location | text | If not at a mosque, typed address |
| postcode | text | UK postcode for geocoding |
| latitude | double precision | Geocoded lat |
| longitude | double precision | Geocoded lng |
| category | event_category enum | Reuses existing enum |
| image_url | text | Optional event image |
| admin_notes | text | Admin notes on approval/rejection |
| created_at | timestamptz | Submission timestamp |

### Database: New Enums

Two new enums will be created to keep the data clean:

- **`community_event_type`**: 'quran', 'lecture', 'talk', 'workshop', 'fundraiser', 'iftar', 'community', 'youth', 'other'
- **`event_audience`**: 'brothers_only', 'sisters_only', 'mixed'

### RLS Policies

- **SELECT**: Authenticated users see their own submissions; admins see all
- **INSERT**: Any authenticated user can submit (user_id must match auth.uid())
- **UPDATE**: Platform admins only (for approval/rejection)
- **DELETE**: Platform admins only

### New Pages

1. **`/submit-event`** -- Organizer submission form (requires login)
   - Fields: event name, organizer name, date/time, event type dropdown, audience selector (brothers only / sisters only / mixed), description, "at a mosque?" toggle with mosque search or custom location + postcode, optional image
   - Geocodes postcode via postcodes.io
   - Shows success confirmation after submission

2. **`/admin/community-events`** -- Admin review page
   - Filterable list by status (pending/approved/rejected)
   - View full details, approve or reject with optional notes

### User Flow

```text
Organizer visits /submit-event
  --> Not logged in? Redirect to /auth
  --> Fills out form (including event type + audience)
  --> Submits (status = 'pending')
  --> Sees: "Your event has been submitted for review"

Admin visits /admin/community-events
  --> Filters by 'pending'
  --> Reviews details
  --> Approves or rejects with notes
```

### Files to Create

- `src/pages/SubmitEvent.tsx` -- Organizer submission form with all fields
- `src/pages/admin/CommunityEventsList.tsx` -- Admin review/approval page

### Files to Modify

- `src/App.tsx` -- Add `/submit-event` and `/admin/community-events` routes
- `src/components/admin/AdminSidebar.tsx` -- Add "Community Events" nav item
- `src/pages/admin/index.ts` -- Export new admin page
- `src/components/layout/Navbar.tsx` -- Add "Submit Event" link for logged-in users

### Database Migration

- Create enums: `community_event_type`, `event_audience`
- Create `community_events` table with all columns and foreign keys
- Add RLS policies
- No changes to the existing `events` table

