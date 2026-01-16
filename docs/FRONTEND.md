# Minaarly Frontend Architecture

> Last Updated: January 2025

## Tech Stack

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS + shadcn/ui
- **State Management:** React Context + TanStack Query
- **Routing:** React Router DOM v6
- **Maps:** Leaflet + react-leaflet (OpenStreetMap)
- **Animations:** Framer Motion
- **Backend:** Supabase (PostgreSQL + Auth + Storage)

---

## Project Structure

```
src/
├── assets/              # Static images
├── components/
│   ├── landing/         # Landing page sections
│   ├── layout/          # Navbar, Footer, Layout wrapper
│   ├── map/             # Map-related components
│   ├── ui/              # shadcn/ui components
│   └── theme-provider.tsx
├── contexts/
│   └── AuthContext.tsx  # Authentication state
├── hooks/
│   ├── use-mobile.tsx   # Mobile detection
│   └── use-toast.ts     # Toast notifications
├── integrations/
│   └── supabase/
│       ├── client.ts    # Supabase client instance
│       └── types.ts     # Auto-generated DB types
├── lib/
│   ├── mockData.ts      # Temporary mock data
│   ├── types.ts         # TypeScript interfaces
│   └── utils.ts         # Utility functions
├── pages/               # Route components
├── App.tsx              # Main app with routing
├── index.css            # Global styles + CSS variables
└── main.tsx             # App entry point
```

---

## Routes

| Path | Component | Status | Description |
|------|-----------|--------|-------------|
| `/` | Index.tsx | ✅ Complete | Landing page |
| `/about` | About.tsx | ✅ Complete | About page |
| `/contact` | Contact.tsx | ✅ Complete | Contact page |
| `/map` | MapPage.tsx | 🔄 Uses Mock Data | Interactive mosque map |
| `/auth` | Auth.tsx | ✅ Connected | Sign in / Sign up |
| `/mosque/:slug` | MosqueDetail.tsx | 🔄 Uses Mock Data | Individual mosque page |
| `*` | NotFound.tsx | ✅ Complete | 404 page |

---

## Authentication

### AuthContext (`src/contexts/AuthContext.tsx`)

Provides:
- `user` - Current Supabase user object
- `session` - Current session
- `loading` - Auth loading state
- `signIn(email, password)` - Login function
- `signUp(email, password, fullName)` - Registration function
- `signOut()` - Logout function

### Usage
```tsx
import { useAuth } from '@/contexts/AuthContext';

function Component() {
  const { user, signIn, signOut } = useAuth();
  
  if (user) {
    return <button onClick={signOut}>Sign Out</button>;
  }
  return <button onClick={() => signIn(email, password)}>Sign In</button>;
}
```

---

## Components

### Layout Components
- **Navbar** - Main navigation with auth integration
- **Footer** - Site footer with links
- **Layout** - Wrapper component with Navbar + Footer

### Landing Page Sections
- **HeroSection** - Main hero with CTA
- **FeaturesSection** - Feature highlights
- **HowItWorksSection** - Step-by-step guide
- **WhoItsForSection** - Target audience
- **MobileAppSection** - App screenshots
- **CTASection** - Call to action

### Map Components
- **MapFilters** - Filter controls for mosque search
- **MosqueSlidePanel** - Slide-up panel showing mosque details

---

## Design System

### CSS Variables (index.css)
```css
--background: 0 0% 100%;
--foreground: 222.2 84% 4.9%;
--primary: 158 64% 35%;        /* Teal/Green */
--secondary: 210 40% 96.1%;
--muted: 210 40% 96.1%;
--accent: 210 40% 96.1%;
--destructive: 0 84.2% 60.2%;
```

### Tailwind Usage
Always use semantic tokens:
```tsx
// ✅ Correct
<div className="bg-primary text-primary-foreground" />
<div className="bg-background text-foreground" />

// ❌ Incorrect
<div className="bg-green-600 text-white" />
```

---

## Data Flow

### Current State (Mock Data)
```
MapPage.tsx
  └── mockMosques (from lib/mockData.ts)
  
MosqueDetail.tsx
  └── getMosqueWithDetails(slug) (from lib/mockData.ts)
```

### Target State (Supabase)
```
MapPage.tsx
  └── useQuery → supabase.from('mosques').select('*, iqamah_times(*)')
  
MosqueDetail.tsx
  └── useQuery → supabase.from('mosques').select('*, iqamah_times(*), events(*)')
```

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/App.tsx` | Routing configuration |
| `src/contexts/AuthContext.tsx` | Auth state management |
| `src/integrations/supabase/client.ts` | Supabase client |
| `src/lib/types.ts` | TypeScript interfaces |
| `src/lib/mockData.ts` | Temporary mock data |
| `src/index.css` | CSS variables + global styles |
| `tailwind.config.ts` | Tailwind configuration |

---

## Environment Variables

```env
VITE_SUPABASE_URL=https://jiwhlklaicnzyifdwbah.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbG...
```

---

## Mobile Support

The app uses `use-mobile.tsx` hook for responsive detection:

```tsx
import { useIsMobile } from '@/hooks/use-mobile';

function Component() {
  const isMobile = useIsMobile();
  return isMobile ? <MobileView /> : <DesktopView />;
}
```

Breakpoint: `768px` (matches Tailwind's `md:`)
