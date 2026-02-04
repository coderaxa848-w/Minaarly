# Minaarly Developer Setup Guide

> Last Updated: January 2025

---

## Prerequisites

- Node.js 18+ 
- npm or bun
- Git

---

## Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd minaarly
```

### 2. Install Dependencies
```bash
npm install
# or
bun install
```

### 3. Environment Variables
Create `.env` file in project root:
```env
VITE_SUPABASE_URL=https://jiwhlklaicnzyifdwbah.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppd2hsa2xhaWNuenlpZmR3YmFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwNjQ0MDgsImV4cCI6MjA4MzY0MDQwOH0.Z4vkZfXdEktXbQIt_doei_tUZWRtxD6368Gqg0hpQjM
```

### 4. Start Development Server
```bash
npm run dev
# or
bun dev
```

### 5. Open Browser
Navigate to `http://localhost:5173`

---

## Project Structure

```
minaarly/
├── docs/                    # Project documentation
├── public/                  # Static assets
├── src/
│   ├── assets/             # Images, icons
│   ├── components/         # React components
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom hooks
│   ├── integrations/       # External service integrations
│   ├── lib/                # Utilities, types, mock data
│   ├── pages/              # Route components
│   ├── App.tsx             # Main app component
│   ├── index.css           # Global styles
│   └── main.tsx            # Entry point
├── supabase/
│   └── config.toml         # Supabase configuration
├── .env                    # Environment variables
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

---

## Supabase Configuration

### Project Details
- **Project ID:** `jiwhlklaicnzyifdwbah`
- **Dashboard:** https://supabase.com/dashboard/project/jiwhlklaicnzyifdwbah

### Key Dashboard Links
- [SQL Editor](https://supabase.com/dashboard/project/jiwhlklaicnzyifdwbah/sql/new)
- [Authentication](https://supabase.com/dashboard/project/jiwhlklaicnzyifdwbah/auth/users)
- [Storage](https://supabase.com/dashboard/project/jiwhlklaicnzyifdwbah/storage/buckets)
- [Edge Functions](https://supabase.com/dashboard/project/jiwhlklaicnzyifdwbah/functions)

### Available Tables
- `mosques` - Mosque information
- `iqamah_times` - Prayer times
- `events` - Mosque events
- `event_interests` - User event interests
- `saved_mosques` - User saved mosques
- `profiles` - User profiles
- `user_roles` - Role assignments
- `mosque_admins` - Mosque admin claims

---

## Development Workflow

### Making Changes
1. Create feature branch
2. Make changes
3. Test locally
4. Commit with descriptive message
5. Push and create PR

### Code Style
- Use TypeScript for all new files
- Follow existing component patterns
- Use semantic Tailwind classes
- Keep components small and focused

### Testing Auth Flows
1. Sign up with email (check Supabase Auth dashboard)
2. Confirm email if required
3. Test sign in/sign out
4. Test protected routes

---

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Linting
npm run lint             # Run ESLint

# Type Checking
npx tsc --noEmit         # Check TypeScript errors
```

---

## Troubleshooting

### Auth Issues
1. Check Supabase Auth settings
2. Verify email confirmation settings
3. Check browser console for errors
4. Verify environment variables

### Database Issues
1. Check RLS policies in Supabase dashboard
2. Verify table permissions
3. Check network tab for API errors
4. Use Supabase SQL Editor to test queries

### Map Issues
1. Ensure Leaflet CSS is imported
2. Check browser console for errors
3. Verify mock data format matches expected types

### Build Errors
1. Clear node_modules and reinstall
2. Check TypeScript errors: `npx tsc --noEmit`
3. Check for circular dependencies
4. Verify all imports are correct

---

## Deployment

### Production
- **URL:** https://www.minaarly.co.uk

### Manual Deployment
```bash
npm run build
# Deploy dist/ folder to your hosting provider
```

---

## External APIs

### Postcodes.io (Geocoding)
- **URL:** https://api.postcodes.io
- **Auth:** None required (free)
- **Rate Limit:** Generous for development
- **Documentation:** https://postcodes.io

### Example Usage
```bash
# Single postcode lookup
curl https://api.postcodes.io/postcodes/E16AN

# Bulk lookup
curl -X POST https://api.postcodes.io/postcodes \
  -H "Content-Type: application/json" \
  -d '{"postcodes": ["E1 6AN", "SW1A 1AA"]}'
```

---

## Getting Help

1. Check documentation in `docs/` folder
2. Review existing code for patterns
3. Check Supabase dashboard for data issues
4. Use browser dev tools for debugging
