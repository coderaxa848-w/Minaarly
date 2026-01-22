# Minaarly Project TODO & Roadmap

> Last Updated: January 2025

---

## ✅ Completed

### Database & Backend
- [x] All 8 database tables created
- [x] Row-Level Security (RLS) policies for all tables
- [x] Database functions (has_role, is_mosque_admin, etc.)
- [x] Automatic profile creation on signup
- [x] Storage buckets (mosque-images, event-images)
- [x] Enums for roles, categories, statuses

### Authentication
- [x] Supabase Auth integration
- [x] AuthContext provider
- [x] Sign in / Sign up pages
- [x] Session management
- [x] Navbar auth integration (Sign In button / User dropdown)

### Landing Page
- [x] Hero section
- [x] Features section
- [x] How it works section
- [x] Who it's for section
- [x] Mobile app preview section
- [x] CTA section
- [x] Footer with links

### Pages
- [x] Landing page (/)
- [x] About page (/about)
- [x] Contact page (/contact)
- [x] Auth page (/auth)
- [x] Map page structure (/map)
- [x] Mosque detail page structure (/mosque/:slug)
- [x] 404 Not Found page

### Map
- [x] Leaflet + OpenStreetMap integration
- [x] Mosque markers with custom icons
- [x] Slide-up panel for mosque details
- [x] Nearby mosques list view
- [x] Filter component (UI only)

---

## 🔄 In Progress

### Connect to Supabase (Replace Mock Data)
- [ ] Map page: Fetch mosques from Supabase
- [ ] Mosque detail page: Fetch from Supabase by slug
- [ ] Events: Real event data
- [ ] Prayer times: Real iqamah data

### Geocoding
- [ ] Create geocode-postcode edge function
- [ ] Process existing mosques without coordinates
- [ ] Auto-geocode on mosque creation

---

## 📋 Upcoming

### Priority 1: Core Functionality
- [ ] Save mosque feature (frontend integration)
- [ ] User's saved mosques page
- [ ] Event interest button
- [ ] Search mosques by name/city/postcode

### Priority 2: Admin Dashboard
- [ ] Admin route protection
- [ ] Mosque management (CRUD)
- [ ] Prayer times editor
- [ ] Event management
- [ ] Image uploads

### Priority 3: User Features
- [ ] User profile page
- [ ] Edit profile
- [ ] View saved mosques
- [ ] Event reminders/notifications

### Priority 4: Mosque Admin Features
- [ ] Claim mosque flow
- [ ] Mosque admin dashboard
- [ ] Update mosque details
- [ ] Manage events
- [ ] Update prayer times

### Priority 5: Enhanced Features
- [ ] Advanced map filtering
- [ ] Distance-based search
- [ ] User location detection
- [ ] Directions to mosque
- [ ] Share mosque/event

---

## 🐛 Known Issues

| Issue | Priority | Notes |
|-------|----------|-------|
| Map uses mock data | High | Need to connect to Supabase |
| Mosque detail uses mock data | High | Need to connect to Supabase |
| No geocoded mosques in DB | Medium | Need edge function + data migration |
| Filters not functional | Medium | UI exists, needs implementation |

---

## 🔧 Technical Debt

- [ ] Remove mock data files after Supabase integration
- [ ] Add loading states for all data fetches
- [ ] Add error boundaries
- [ ] Implement proper form validation
- [ ] Add unit tests
- [ ] Add E2E tests
- [ ] Optimize images and assets
- [ ] Add SEO meta tags to all pages

---

## 📝 Notes

### Geocoding Strategy
1. Create edge function using Postcodes.io API
2. Call on mosque creation/update
3. Batch process existing mosques without coordinates
4. Store lat/lng in mosques table

### Admin Access
- Platform admins: Full access to all mosques
- Mosque admins: Access to their claimed mosques only
- Use `has_role()` and `is_mosque_admin()` functions for checks

### Data Migration Plan
1. Export mock data structure
2. Create real mosque entries in Supabase
3. Geocode all postcodes
4. Link iqamah times and events
5. Remove mock data imports
