import { useEffect, useState } from 'react';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string;
  end_time: string | null;
  category: string | null;
  guest_speaker: string | null;
  is_archived: boolean | null;
  mosque: {
    name: string;
    city: string;
  } | null;
  interested_count: number;
}

export default function EventsList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          mosques (name, city)
        `)
        .order('event_date', { ascending: true })
        .limit(100);

      if (error) throw error;

      // Get interested counts for each event
      const eventsWithCounts = await Promise.all(
        (data || []).map(async (event: any) => {
          const { data: countData } = await supabase.rpc('get_event_interested_count', {
            _event_id: event.id,
          });
          return {
            ...event,
            mosque: event.mosques,
            interested_count: countData || 0,
          };
        })
      );

      setEvents(eventsWithCounts);
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
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Events</h1>
        <p className="text-muted-foreground">
          View all mosque events ({events.length} total, {upcomingEvents.length} upcoming)
        </p>
      </div>

      {/* Upcoming Events */}
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
            {upcomingEvents.map((event) => (
              <Card key={event.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.mosque?.name}, {event.mosque?.city}
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
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {event.interested_count} interested
                    </div>
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
            ))}
          </div>
        )}
      </div>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-muted-foreground">Past Events</h2>
          <div className="grid gap-4 opacity-75">
            {pastEvents.slice(0, 10).map((event) => (
              <Card key={event.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.mosque?.name}, {event.mosque?.city}
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
