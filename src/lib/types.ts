// Supabase-ready type definitions for Minaarly

export interface Mosque {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  image: string;
  description: string;
  facilities: Facility[];
  languages: string[];
  madhab?: string;
  phone?: string;
  website?: string;
  email?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IqamahTimes {
  mosqueId: string;
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  jummah: string;
  lastUpdated: string;
}

export interface Event {
  id: string;
  mosqueId: string;
  mosqueName: string;
  title: string;
  description: string;
  date: string;
  time: string;
  endTime?: string;
  category: EventCategory;
  image?: string;
  interestedCount: number;
  isRecurring: boolean;
  recurrencePattern?: string;
  createdAt: string;
}

export type EventCategory = 
  | 'lecture'
  | 'class'
  | 'youth'
  | 'sisters'
  | 'jummah'
  | 'community'
  | 'iftar'
  | 'fundraiser'
  | 'other';

export type Facility = 
  | 'wheelchair'
  | 'parking'
  | 'wudu'
  | 'womens_area'
  | 'childrens_area'
  | 'library'
  | 'funeral'
  | 'marriage'
  | 'quran_classes'
  | 'youth_programs'
  | 'food'
  | 'shoe_racks';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'mosque_admin';
  managedMosqueIds?: string[];
  createdAt: string;
}

export interface MosqueWithDetails extends Mosque {
  iqamahTimes: IqamahTimes;
  upcomingEvents: Event[];
  distance?: number;
}

// Filter types
export interface MapFilters {
  nearMe: boolean;
  openNow: boolean;
  eventsToday: boolean;
  jummah: boolean;
  facilities: Facility[];
  languages: string[];
  madhab?: string;
}

// Form types for admin
export interface MosqueFormData {
  name: string;
  address: string;
  city: string;
  state: string;
  coordinates: { lat: number; lng: number };
  description: string;
  facilities: Facility[];
  languages: string[];
  madhab?: string;
  phone?: string;
  website?: string;
  email?: string;
}

export interface EventFormData {
  mosqueId: string;
  title: string;
  description: string;
  date: string;
  time: string;
  endTime?: string;
  category: EventCategory;
  isRecurring: boolean;
  recurrencePattern?: string;
}

export interface IqamahFormData {
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  jummah: string;
}
