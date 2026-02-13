import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Globe,
  Mail,
  Clock,
  Heart,
  HeartOff,
  Accessibility,
  Car,
  Droplets,
  Users,
  Baby,
  BookOpen,
  Heart as HeartIcon,
  Utensils,
  Calendar,
  Share2,
  CheckCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import type { Tables } from '@/integrations/supabase/types';

type Mosque = Tables<'mosques'>;
type IqamahTimes = Tables<'iqamah_times'>;
type Event = Tables<'events'>;

const facilityIcons: Record<string, { icon: React.ReactNode; label: string }> = {
  wheelchair: { icon: <Accessibility className="h-4 w-4" />, label: 'Wheelchair Access' },
  parking: { icon: <Car className="h-4 w-4" />, label: 'Parking' },
  wudu: { icon: <Droplets className="h-4 w-4" />, label: 'Wudu Facilities' },
  womens_area: { icon: <Users className="h-4 w-4" />, label: "Women's Area" },
  childrens_area: { icon: <Baby className="h-4 w-4" />, label: "Children's Area" },
  library: { icon: <BookOpen className="h-4 w-4" />, label: 'Library' },
  funeral: { icon: <HeartIcon className="h-4 w-4" />, label: 'Funeral Services' },
  quran_classes: { icon: <BookOpen className="h-4 w-4" />, label: 'Quran Classes' },
  food: { icon: <Utensils className="h-4 w-4" />, label: 'Food Available' },
};

const serviceLabels: Record<string, string> = {
  nikkah: 'Nikkah (Islamic Marriage)',
  hall_booking: 'Hall/Venue Booking',
  immigration_advice: 'Immigration Advice',
  counselling: 'Counselling Services',
  funeral: 'Funeral Services',
  zakat_collection: 'Zakat Collection',
  food_bank: 'Food Bank',
};

const formatServiceName = (code: string): string => {
  return serviceLabels[code] || code;
};

export default function MosqueDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { toast } = useToast();

  const [mosque, setMosque] = useState<Mosque | null>(null);
  const [iqamahTimes, setIqamahTimes] = useState<IqamahTimes | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchMosqueData();
    }
  }, [slug, user]);

  const fetchMosqueData = async () => {
    setLoading(true);
    try {
      // Fetch mosque by slug
      const { data: mosqueData, error: mosqueError } = await supabase
        .from('mosques')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (mosqueError) throw mosqueError;
      if (!mosqueData) {
        setMosque(null);
        return;
      }

      setMosque(mosqueData);

      // Fetch iqamah times
      const { data: timesData } = await supabase
        .from('iqamah_times')
        .select('*')
        .eq('mosque_id', mosqueData.id)
        .maybeSingle();

      setIqamahTimes(timesData);

      // Fetch upcoming events
      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .eq('mosque_id', mosqueData.id)
        .gte('event_date', new Date().toISOString().split('T')[0])
        .order('event_date', { ascending: true })
        .limit(5);

      setEvents(eventsData || []);

      // Check if user has saved this mosque
      if (user) {
        const { data: savedData } = await supabase
          .from('saved_mosques')
          .select('id')
          .eq('user_id', user.id)
          .eq('mosque_id', mosqueData.id)
          .maybeSingle();

        setIsSaved(!!savedData);
      }
    } catch (error) {
      console.error('Error fetching mosque:', error);
      toast({
        title: 'Error',
        description: 'Failed to load mosque details.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSaveMosque = async () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to save mosques.',
      });
      return;
    }

    if (!mosque) return;

    setSaving(true);
    try {
      if (isSaved) {
        await supabase
          .from('saved_mosques')
          .delete()
          .eq('user_id', user.id)
          .eq('mosque_id', mosque.id);
        setIsSaved(false);
        toast({ title: 'Mosque removed from saved' });
      } else {
        await supabase
          .from('saved_mosques')
          .insert({ user_id: user.id, mosque_id: mosque.id });
        setIsSaved(true);
        toast({ title: 'Mosque saved!' });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update saved mosque.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: mosque?.name,
        text: `Check out ${mosque?.name} on Minaarly`,
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: 'Link copied to clipboard!' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-64 bg-muted animate-pulse" />
        <div className="container py-8 space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
          <div className="grid md:grid-cols-2 gap-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  if (!mosque) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Mosque not found</h1>
          <Link to="/map">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Map
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Image */}
      <div
        className="h-64 md:h-80 bg-cover bg-center relative"
        style={{
          backgroundImage: mosque.background_image_url
            ? `url(${mosque.background_image_url})`
            : 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(168 84% 40%) 100%)',
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <Link to="/map">
            <Button variant="secondary" size="sm" className="glass">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="glass"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="glass"
              onClick={toggleSaveMosque}
              disabled={saving}
            >
              {isSaved ? (
                <HeartOff className="h-4 w-4 text-destructive" />
              ) : (
                <Heart className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold">{mosque.name}</h1>
            {mosque.is_verified && (
              <CheckCircle className="h-6 w-6 text-primary" />
            )}
          </div>
          <p className="text-muted-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {mosque.address}, {mosque.city}, {mosque.postcode}
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {mosque.madhab && (
              <Badge variant="secondary">
                {mosque.madhab}
              </Badge>
            )}
            {mosque.facilities?.includes('womens_area') && (
              <Badge variant="secondary" className="bg-pink-500/10 text-pink-600 border-pink-200">
                <Users className="h-3 w-3 mr-1" />
                Sisters
              </Badge>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Description */}
            {mosque.description && (
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{mosque.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Prayer Times */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Prayer Times
                </CardTitle>
              </CardHeader>
              <CardContent>
                {iqamahTimes ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { name: 'Fajr', time: iqamahTimes.fajr },
                      { name: 'Dhuhr', time: iqamahTimes.dhuhr },
                      { name: 'Asr', time: iqamahTimes.asr },
                      { name: 'Maghrib', time: iqamahTimes.maghrib },
                      { name: 'Isha', time: iqamahTimes.isha },
                      { name: 'Jummah', time: iqamahTimes.jummah },
                    ].map((prayer) => (
                      <div
                        key={prayer.name}
                        className="p-4 rounded-xl bg-secondary text-center"
                      >
                        <p className="text-sm text-muted-foreground">{prayer.name}</p>
                        <p className="text-lg font-semibold">{prayer.time || 'N/A'}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Prayer times not available for this mosque.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Facilities */}
            {mosque.facilities && mosque.facilities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Facilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {mosque.facilities.map((facility) => {
                      const info = facilityIcons[facility];
                      return (
                        <Badge key={facility} variant="secondary" className="gap-1 py-1.5">
                          {info?.icon}
                          {info?.label || facility}
                        </Badge>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Services */}
            {mosque.services && mosque.services.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Services Offered</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {mosque.services.map((service) => (
                      <Badge key={service} variant="outline" className="py-1.5">
                        {formatServiceName(service)}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Events */}
            {events.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {events.map((event) => (
                      <div
                        key={event.id}
                        className="p-4 rounded-xl border bg-card hover:border-primary transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{event.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {format(new Date(event.event_date), 'EEEE, MMMM d')} at{' '}
                              {event.start_time}
                            </p>
                            {event.guest_speaker && (
                              <p className="text-sm text-primary mt-1">
                                Speaker: {event.guest_speaker}
                              </p>
                            )}
                          </div>
                          <Badge variant="outline">{event.category}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mosque.phone && (
                  <a
                    href={`tel:${mosque.phone}`}
                    className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                  >
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {mosque.phone}
                  </a>
                )}
                {mosque.email && (
                  <a
                    href={`mailto:${mosque.email}`}
                    className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                  >
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {mosque.email}
                  </a>
                )}
                {mosque.website && (
                  <a
                    href={mosque.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                  >
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    Website
                  </a>
                )}
              </CardContent>
            </Card>

            {/* Languages */}
            {mosque.languages && mosque.languages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Languages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {mosque.languages.map((lang) => (
                      <Badge key={lang} variant="outline">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Get Directions */}
            {mosque.latitude && mosque.longitude && (
              <Button
                className="w-full gradient-teal shadow-teal"
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps/dir/?api=1&destination=${mosque.latitude},${mosque.longitude}`,
                    '_blank'
                  )
                }
              >
                <MapPin className="h-4 w-4 mr-2" />
                Get Directions
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
