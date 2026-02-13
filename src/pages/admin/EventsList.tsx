import { useEffect, useState } from 'react';
import { Calendar, MapPin, Clock, Users, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface EventRow {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string;
  end_time: string | null;
  category: string | null;
  guest_speaker: string | null;
  is_archived: boolean | null;
  source: string | null;
  status: string | null;
  custom_location: string | null;
  organizer_name: string | null;
  mosque_name: string | null;
  mosque_city: string | null;
  interested_count: number;
}

export default function EventsList() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`*, mosques (name, city)`)
        .order('event_date', { ascending: true })
        .limit(200);

      if (error) throw error;

      const mapped = await Promise.all(
        (data || []).map(async (event: any) => {
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
            source: event.source,
            status: event.status,
            custom_location: event.custom_location,
            organizer_name: event.organizer_name,
            mosque_name: event.mosques?.name || null,
            mosque_city: event.mosques?.city || null,
            interested_count: countData || 0,
          } as EventRow;
        })
      );

      setEvents(mapped);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({ title: 'Error', description: 'Failed to load events', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  async function deleteEvent(id: string) {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Deleted', description: 'Event deleted successfully.' });
      fetchEvents();
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
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    });
  }

  function formatTime(timeStr: string) {
    return timeStr.slice(0, 5);
  }

  function getSourceBadge(source: string | null) {
    switch (source) {
      case 'mosque_admin': return <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200">Mosque</Badge>;
      case 'community_organiser': return <Badge variant="outline" className="bg-violet-100 text-violet-700 border-violet-200">Organiser</Badge>;
      case 'user': return <Badge variant="outline" className="bg-sky-100 text-sky-700 border-sky-200">User</Badge>;
      default: return null;
    }
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
      case 'quran_class': return 'bg-cyan-100 text-cyan-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  function getLocationDisplay(event: EventRow) {
    if (event.mosque_name) {
      return `${event.mosque_name}${event.mosque_city ? `, ${event.mosque_city}` : ''}`;
    }
    return event.custom_location || 'Custom Location';
  }

  function renderEventCard(event: EventRow) {
    return (
      <Card key={event.id}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{event.title}</CardTitle>
                {getSourceBadge(event.source)}
              </div>
              <CardDescription className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {getLocationDisplay(event)}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getCategoryColor(event.category)}>
                {event.category || 'other'}
              </Badge>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete event?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete "{event.title}". This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteEvent(event.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
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
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{event.description}</p>
          )}
          {event.guest_speaker && (
            <p className="mt-2 text-sm"><span className="font-medium">Speaker:</span> {event.guest_speaker}</p>
          )}
          {event.organizer_name && (
            <p className="mt-1 text-sm text-muted-foreground">Organizer: {event.organizer_name}</p>
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
            {pastEvents.slice(0, 10).map(renderEventCard)}
          </div>
        </div>
      )}
    </div>
  );
}
