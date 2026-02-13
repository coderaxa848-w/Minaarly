

# Fix: Auto-Approved Organiser Events Not Visible in Admin

## Problem
When an event organiser submits an event, it is automatically approved (`status = 'approved'`). However, the admin Community Events page defaults its filter to "Pending", so these auto-approved events are hidden from view. The events exist correctly in the database -- they are just filtered out.

## Solution
Change the default filter from "pending" to "all" in the Community Events admin page so admins see everything by default.

## Technical Detail
**File:** `src/pages/admin/CommunityEventsList.tsx`
- Line 48: Change `useState('pending')` to `useState('all')`

This is a single-line fix. All 10 community events in the database (including your test events) will immediately become visible when the page loads.

