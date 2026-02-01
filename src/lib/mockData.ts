import { Mosque, Event, IqamahTimes, MosqueWithDetails } from './types';

// Mock mosques data - ready for Supabase integration
export const mockMosques: Mosque[] = [
  {
    id: '1',
    name: 'Islamic Center of Irving',
    slug: 'islamic-center-of-irving',
    address: '2555 Esters Rd',
    city: 'Irving',
    state: 'TX',
    coordinates: { lat: 32.8998, lng: -96.9789 },
    image: 'https://images.unsplash.com/photo-1585036156171-384164a8c675?w=800',
    description: 'A vibrant community mosque serving the Irving area with daily prayers, educational programs, and community events.',
    facilities: ['wheelchair', 'parking', 'wudu', 'womens_area', 'childrens_area', 'library', 'quran_classes', 'youth_programs'],
    languages: ['English', 'Arabic', 'Urdu'],
    madhab: 'Hanafi',
    phone: '(972) 812-2230',
    website: 'https://icirving.org',
    isVerified: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'East Plano Islamic Center',
    slug: 'east-plano-islamic-center',
    address: '901 Shiloh Rd',
    city: 'Plano',
    state: 'TX',
    coordinates: { lat: 33.0198, lng: -96.6989 },
    image: 'https://images.unsplash.com/photo-1564769625392-651b89c75a77?w=800',
    description: 'EPIC serves the Muslim community of Plano and surrounding areas with comprehensive Islamic services.',
    facilities: ['wheelchair', 'parking', 'wudu', 'womens_area', 'childrens_area', 'funeral', 'marriage', 'quran_classes', 'food'],
    languages: ['English', 'Arabic', 'Urdu', 'Bangla'],
    madhab: 'Shafi',
    phone: '(972) 633-5555',
    website: 'https://epicmasjid.org',
    isVerified: true,
    createdAt: '2024-01-02',
    updatedAt: '2024-01-16',
  },
  {
    id: '3',
    name: 'Dallas Central Mosque',
    slug: 'dallas-central-mosque',
    address: '840 Abrams Rd',
    city: 'Richardson',
    state: 'TX',
    coordinates: { lat: 32.9545, lng: -96.7189 },
    image: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?w=800',
    description: 'One of the largest mosques in North Texas, offering a wide range of religious and community services.',
    facilities: ['wheelchair', 'parking', 'wudu', 'womens_area', 'library', 'funeral', 'marriage', 'youth_programs', 'shoe_racks'],
    languages: ['English', 'Arabic'],
    madhab: 'Hanbali',
    phone: '(972) 231-5698',
    isVerified: true,
    createdAt: '2024-01-03',
    updatedAt: '2024-01-17',
  },
  {
    id: '4',
    name: 'Masjid Al-Islam',
    slug: 'masjid-al-islam',
    address: '2604 S Harwood St',
    city: 'Dallas',
    state: 'TX',
    coordinates: { lat: 32.7667, lng: -96.7836 },
    image: 'https://images.unsplash.com/photo-1545167496-5a24ded5cc09?w=800',
    description: 'A historic mosque in South Dallas serving the community for over 40 years.',
    facilities: ['parking', 'wudu', 'womens_area', 'quran_classes'],
    languages: ['English', 'Arabic'],
    isVerified: true,
    createdAt: '2024-01-04',
    updatedAt: '2024-01-18',
  },
  {
    id: '5',
    name: 'Islamic Association of Carrollton',
    slug: 'islamic-association-of-carrollton',
    address: '1820 Hebron Pkwy',
    city: 'Carrollton',
    state: 'TX',
    coordinates: { lat: 33.0062, lng: -96.8897 },
    image: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800',
    description: 'Serving the Carrollton Muslim community with daily prayers and weekend Islamic school.',
    facilities: ['wheelchair', 'parking', 'wudu', 'womens_area', 'childrens_area', 'quran_classes', 'youth_programs'],
    languages: ['English', 'Arabic', 'Urdu', 'Turkish'],
    madhab: 'Hanafi',
    isVerified: true,
    createdAt: '2024-01-05',
    updatedAt: '2024-01-19',
  },
  {
    id: '6',
    name: 'Masjid Al-Hedaya',
    slug: 'masjid-al-hedaya',
    address: '1625 E Berry St',
    city: 'Fort Worth',
    state: 'TX',
    coordinates: { lat: 32.7234, lng: -97.3089 },
    image: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=800',
    description: 'A welcoming mosque in Fort Worth with strong community programs.',
    facilities: ['parking', 'wudu', 'womens_area', 'food'],
    languages: ['English', 'Arabic', 'Spanish'],
    isVerified: false,
    createdAt: '2024-01-06',
    updatedAt: '2024-01-20',
  },
];

// Mock iqamah times
export const mockIqamahTimes: IqamahTimes[] = [
  { mosqueId: '1', fajr: '5:45 AM', dhuhr: '1:30 PM', asr: '5:00 PM', maghrib: '7:45 PM', isha: '9:15 PM', jummah: '1:30 PM', lastUpdated: '2024-01-15' },
  { mosqueId: '2', fajr: '5:30 AM', dhuhr: '1:15 PM', asr: '4:45 PM', maghrib: '7:40 PM', isha: '9:00 PM', jummah: '1:15 PM', lastUpdated: '2024-01-15' },
  { mosqueId: '3', fajr: '5:40 AM', dhuhr: '1:30 PM', asr: '5:00 PM', maghrib: '7:42 PM', isha: '9:10 PM', jummah: '1:30 PM', lastUpdated: '2024-01-15' },
  { mosqueId: '4', fajr: '5:35 AM', dhuhr: '1:20 PM', asr: '4:50 PM', maghrib: '7:38 PM', isha: '9:05 PM', jummah: '1:20 PM', lastUpdated: '2024-01-15' },
  { mosqueId: '5', fajr: '5:45 AM', dhuhr: '1:25 PM', asr: '4:55 PM', maghrib: '7:43 PM', isha: '9:12 PM', jummah: '1:25 PM', lastUpdated: '2024-01-15' },
  { mosqueId: '6', fajr: '5:50 AM', dhuhr: '1:35 PM', asr: '5:05 PM', maghrib: '7:48 PM', isha: '9:20 PM', jummah: '1:35 PM', lastUpdated: '2024-01-15' },
];

// Mock events
export const mockEvents: Event[] = [
  {
    id: 'e1',
    mosqueId: '1',
    mosqueName: 'Islamic Center of Irving',
    title: 'Friday Khutbah: The Importance of Community',
    description: 'Join us for this week\'s Jummah prayer and khutbah focusing on building strong community bonds.',
    date: '2024-01-19',
    time: '1:30 PM',
    category: 'jummah',
    interestedCount: 245,
    isRecurring: true,
    recurrencePattern: 'weekly',
    createdAt: '2024-01-01',
  },
  {
    id: 'e2',
    mosqueId: '1',
    mosqueName: 'Islamic Center of Irving',
    title: 'Youth Halaqa: Building Character',
    description: 'Weekly youth gathering focusing on Islamic character development for teens.',
    date: '2024-01-20',
    time: '6:00 PM',
    endTime: '7:30 PM',
    category: 'youth',
    interestedCount: 32,
    isRecurring: true,
    recurrencePattern: 'weekly',
    createdAt: '2024-01-01',
  },
  {
    id: 'e3',
    mosqueId: '2',
    mosqueName: 'East Plano Islamic Center',
    title: 'Sisters\' Quran Study Circle',
    description: 'Weekly Quran study and tafsir session for sisters with Sheikh Fatima.',
    date: '2024-01-21',
    time: '10:00 AM',
    endTime: '12:00 PM',
    category: 'sisters',
    interestedCount: 48,
    isRecurring: true,
    recurrencePattern: 'weekly',
    createdAt: '2024-01-02',
  },
  {
    id: 'e4',
    mosqueId: '2',
    mosqueName: 'East Plano Islamic Center',
    title: 'Community Iftar Gathering',
    description: 'Join us for a community iftar during Ramadan. All are welcome!',
    date: '2024-03-15',
    time: '6:45 PM',
    category: 'iftar',
    interestedCount: 180,
    isRecurring: false,
    createdAt: '2024-01-02',
  },
  {
    id: 'e5',
    mosqueId: '3',
    mosqueName: 'Dallas Central Mosque',
    title: 'Introduction to Arabic Language',
    description: 'Beginner-friendly Arabic class for adults. Learn to read Quran in its original language.',
    date: '2024-01-22',
    time: '7:00 PM',
    endTime: '8:30 PM',
    category: 'class',
    interestedCount: 65,
    isRecurring: true,
    recurrencePattern: 'weekly',
    createdAt: '2024-01-03',
  },
  {
    id: 'e6',
    mosqueId: '3',
    mosqueName: 'Dallas Central Mosque',
    title: 'Islamic Finance Workshop',
    description: 'Learn about halal investing and Islamic financial principles with guest speaker.',
    date: '2024-01-25',
    time: '6:30 PM',
    endTime: '8:00 PM',
    category: 'lecture',
    interestedCount: 92,
    isRecurring: false,
    createdAt: '2024-01-03',
  },
  {
    id: 'e7',
    mosqueId: '4',
    mosqueName: 'Masjid Al-Islam',
    title: 'Community Service Day',
    description: 'Join us in serving our local community through various volunteer activities.',
    date: '2024-01-27',
    time: '9:00 AM',
    endTime: '2:00 PM',
    category: 'community',
    interestedCount: 55,
    isRecurring: false,
    createdAt: '2024-01-04',
  },
  {
    id: 'e8',
    mosqueId: '5',
    mosqueName: 'Islamic Association of Carrollton',
    title: 'Annual Fundraiser Dinner',
    description: 'Support our mosque expansion project at our annual fundraiser dinner.',
    date: '2024-02-10',
    time: '6:00 PM',
    endTime: '9:00 PM',
    category: 'fundraiser',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800',
    interestedCount: 210,
    isRecurring: false,
    createdAt: '2024-01-05',
  },
];

// Helper function to get mosque with details
export function getMosqueWithDetails(mosqueId: string): MosqueWithDetails | undefined {
  const mosque = mockMosques.find(m => m.id === mosqueId);
  if (!mosque) return undefined;

  const iqamahTimes = mockIqamahTimes.find(t => t.mosqueId === mosqueId);
  const upcomingEvents = mockEvents.filter(e => e.mosqueId === mosqueId);

  return {
    ...mosque,
    iqamahTimes: iqamahTimes || {
      mosqueId,
      fajr: 'N/A',
      dhuhr: 'N/A',
      asr: 'N/A',
      maghrib: 'N/A',
      isha: 'N/A',
      jummah: 'N/A',
      lastUpdated: 'N/A',
    },
    upcomingEvents,
  };
}

// Get all mosques with details
export function getAllMosquesWithDetails(): MosqueWithDetails[] {
  return mockMosques.map(mosque => getMosqueWithDetails(mosque.id)!);
}

// Get events by category
export function getEventsByCategory(category?: Event['category']): Event[] {
  if (!category) return mockEvents;
  return mockEvents.filter(e => e.category === category);
}

// Get today's events
export function getTodaysEvents(): Event[] {
  const today = new Date().toISOString().split('T')[0];
  return mockEvents.filter(e => e.date === today);
}

// Facility labels for display
export const facilityLabels: Record<string, string> = {
  wheelchair: 'Wheelchair Accessible',
  parking: 'Parking Available',
  wudu: 'Wudu Facilities',
  womens_area: 'Women\'s Prayer Area',
  childrens_area: 'Children\'s Area',
  library: 'Library',
  funeral: 'Funeral Services',
  marriage: 'Marriage Services',
  quran_classes: 'Quran Classes',
  youth_programs: 'Youth Programs',
  food: 'Food Services',
  shoe_racks: 'Shoe Racks',
};

// Event category labels
export const categoryLabels: Record<string, string> = {
  lecture: 'Lecture',
  class: 'Class',
  youth: 'Youth',
  sisters: 'Sisters',
  jummah: 'Jummah',
  community: 'Community',
  iftar: 'Iftar',
  fundraiser: 'Fundraiser',
  other: 'Other',
};

// Category colors for badges
export const categoryColors: Record<string, string> = {
  lecture: 'bg-blue-100 text-blue-800',
  class: 'bg-purple-100 text-purple-800',
  youth: 'bg-orange-100 text-orange-800',
  sisters: 'bg-pink-100 text-pink-800',
  jummah: 'bg-primary/10 text-primary',
  community: 'bg-green-100 text-green-800',
  iftar: 'bg-amber-100 text-amber-800',
  fundraiser: 'bg-rose-100 text-rose-800',
  other: 'bg-gray-100 text-gray-800',
};
