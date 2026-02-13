import { useEffect, useState } from 'react';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UnifiedEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string;
  end_time: string | null;
  category: string | null;
  guest_speaker: string | null;
  is_archived: boolean | null;
  location_name: string | null;
  location_city: string | null;
  interested_count: number;
  is_community: boolean;
}

export default function EventsList() {
  const [events, setEvents] = useState<UnifiedEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    setLoading(true);
    try {
      // Fetch mosque events
      const { data: mosqueEvents, error: mosqueError } = await supabase
        .from('events')
        .select(`*, mosques (name, city)`)
        .order('event_date', { ascending: true })
        .limit(100);

      if (mosqueError) throw mosqueError;

      // Fetch approved non-mosque community events
      const { data: communityEvents, error: communityError } = await supabase
        .from('community_events')
        .select('*')
        .eq('status', 'approved')
        .eq('is_at_mosque', false)
        .order('event_date', { ascending: true })
        .limit(100);

      if (communityError) throw communityError;

      // Get interested counts for mosque events
      const mosqueWithCounts = await Promise.all(
        (mosqueEvents || []).map(async (event: any) => {
          const { data: countData } = await supabase.rpc('get_event_interested_count', {
            _event_id: event.id,
          });
          return {
            id: event.id,
            title: event.title,
            description: event.description,
            event_date: event.event_date,
            start_time: event.start_time,
            end_time: event.end_time,
            category: event.category,
            guest_speaker: event.guest_speaker,
            is_archived: event.is_archived,
            location_name: event.mosques?.name || null,
            location_city: event.mosques?.city || null,
            interested_count: countData || 0,
            is_community: false,
          } as UnifiedEvent;
        })
      );

      // Map community events
      const communityMapped: UnifiedEvent[] = (communityEvents || []).map((event: any) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        event_date: event.event_date,
        start_time: event.start_time,
        end_time: event.end_time,
        category: event.category,
        guest_speaker: null,
        is_archived: false,
        location_name: event.custom_location || event.postcode || 'Custom Location',
        location_city: null,
        interested_count: 0,
        is_community: true,
      }));

      // Merge and sort by date
      const allEvents = [...mosqueWithCounts, ...communityMapped].sort(
        (a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
      );

      setEvents(allEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: 'Error',
        description: 'Failed to load events',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  const upcomingEvents = events.filter(e => {
    const eventDate = new Date(e.event_date);
    return eventDate >= new Date() && !e.is_archived;
  });

  const pastEvents = events.filter(e => {
    const eventDate = new Date(e.event_date);
    return eventDate < new Date() || e.is_archived;
  });

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  function formatTime(timeStr: string) {
    return timeStr.slice(0, 5);
  }

  function getCategoryColor(category: string | null) {
    switch (category) {
      case 'lecture': return 'bg-blue-100 text-blue-700';
      case 'halaqa': return 'bg-green-100 text-green-700';
      case 'youth': return 'bg-purple-100 text-purple-700';
      case 'sisters': return 'bg-pink-100 text-pink-700';
      case 'community': return 'bg-amber-100 text-amber-700';
      case 'jummah': return 'bg-teal-100 text-teal-700';
      case 'fundraiser': return 'bg-orange-100 text-orange-700';
      case 'iftar': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  function renderEventCard(event: UnifiedEvent) {
    return (
      <Card key={event.id}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{event.title}</CardTitle>
                {event.is_community && (
                  <Badge variant="outline" className="bg-violet-100 text-violet-700 border-violet-200">
                    Community
                  </Badge>
                )}
              </div>
              <CardDescription className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {event.location_name}
                {event.location_city && `, ${event.location_city}`}
              </CardDescription>
            </div>
            <Badge className={getCategoryColor(event.category)}>
              {event.category || 'other'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {formatDate(event.event_date)}
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              {formatTime(event.start_time)}
              {event.end_time && ` - ${formatTime(event.end_time)}`}
            </div>
            {!event.is_community && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-4 w-4" />
                {event.interested_count} interested
              </div>
            )}
          </div>
          {event.description && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {event.description}
            </p>
          )}
          {event.guest_speaker && (
            <p className="mt-2 text-sm">
              <span className="font-medium">Speaker:</span> {event.guest_speaker}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-24 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Events</h1>
        <p className="text-muted-foreground">
          View all events ({events.length} total, {upcomingEvents.length} upcoming)
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
        {upcomingEvents.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No upcoming events</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {upcomingEvents.map(renderEventCard)}
          </div>
        )}
      </div>

      {pastEvents.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-muted-foreground">Past Events</h2>
          <div className="grid gap-4 opacity-75">
            {pastEvents.slice(0, 10).map((event) => (
              <Card key={event.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{event.title}</CardTitle>
                        {event.is_community && (
                          <Badge variant="outline" className="bg-violet-100 text-violet-700 border-violet-200">
                            Community
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location_name}
                        {event.location_city && `, ${event.location_city}`}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">{formatDate(event.event_date)}</Badge>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
