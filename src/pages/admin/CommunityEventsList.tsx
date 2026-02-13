import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, XCircle, Clock, Eye, Loader2, Calendar, MapPin, Users, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { format } from 'date-fns';

interface CommunityEvent {
  id: string;
  title: string;
  description: string | null;
  organizer_name: string;
  organizer_email: string | null;
  organizer_phone: string | null;
  event_date: string;
  start_time: string;
  end_time: string | null;
  event_type: string;
  audience: string;
  category: string | null;
  status: string;
  is_at_mosque: boolean;
  mosque_id: string | null;
  custom_location: string | null;
  postcode: string | null;
  image_url: string | null;
  admin_notes: string | null;
  created_at: string;
  mosque_name?: string | null;
  mosque_address?: string | null;
  mosque_city?: string | null;
}

export default function CommunityEventsList() {
  const { toast } = useToast();
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedEvent, setSelectedEvent] = useState<CommunityEvent | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('community_events' as any)
      .select('*, mosques(name, address, city)')
      .order('created_at', { ascending: false });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setEvents(((data as any[]) || []).map((e: any) => ({
        ...e,
        mosque_name: e.mosques?.name || null,
        mosque_address: e.mosques?.address || null,
        mosque_city: e.mosques?.city || null,
      })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, []);

  const filteredEvents = events.filter(e => e.status === activeTab);

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    setUpdating(true);
    const { error } = await supabase.from('community_events' as any).update({ status, admin_notes: adminNotes || null } as any).eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      if (status === 'approved' && selectedEvent?.is_at_mosque && selectedEvent?.mosque_id) {
        const { error: eventError } = await supabase.from('events').insert({
          mosque_id: selectedEvent.mosque_id,
          title: selectedEvent.title,
          description: selectedEvent.description || null,
          event_date: selectedEvent.event_date,
          start_time: selectedEvent.start_time,
          end_time: selectedEvent.end_time || null,
          category: selectedEvent.category || 'other',
        } as any);
        if (eventError) {
          toast({ title: 'Partial success', description: `Event approved but failed to add to mosque events: ${eventError.message}`, variant: 'destructive' });
        } else {
          toast({ title: 'Event approved', description: 'Event approved and added to the mosque\'s event list.' });
        }
      } else {
        toast({ title: `Event ${status}`, description: `The event has been ${status}.` });
      }
      setSelectedEvent(null);
      setAdminNotes('');
      fetchEvents();
    }
    setUpdating(false);
  };

  const deleteEvent = async (id: string) => {
    const { error } = await supabase.from('community_events' as any).delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Deleted', description: 'Community event deleted.' });
      fetchEvents();
    }
  };

  const formatAudience = (a: string) => {
    switch (a) {
      case 'brothers_only': return 'Brothers Only';
      case 'sisters_only': return 'Sisters Only';
      default: return 'Mixed';
    }
  };

  const pendingCount = events.filter(e => e.status === 'pending').length;
  const approvedCount = events.filter(e => e.status === 'approved').length;
  const rejectedCount = events.filter(e => e.status === 'rejected').length;

  function renderEventCard(event: CommunityEvent) {
    return (
      <div key={event.id} className="border rounded-xl p-5 bg-card hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{event.title}</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {format(new Date(event.event_date), 'dd MMM yyyy')} at {event.start_time?.slice(0, 5)}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {formatAudience(event.audience)}
              </span>
              <span className="capitalize">{event.event_type}</span>
              {(event.custom_location || event.is_at_mosque) && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {event.is_at_mosque ? (event.mosque_name || 'At a mosque') : event.custom_location}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">By {event.organizer_name}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => { setSelectedEvent(event); setAdminNotes(event.admin_notes || ''); }}>
              <Eye className="h-4 w-4 mr-1" /> View
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Community Events</h1>
        <p className="text-muted-foreground">Review and manage event submissions from organizers</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" />
              Pending
              {pendingCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1.5 text-xs">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Approved
              {approvedCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1.5 text-xs">
                  {approvedCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-2">
              <XCircle className="h-4 w-4" />
              Rejected
              {rejectedCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1.5 text-xs">
                  {rejectedCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {['pending', 'approved', 'rejected'].map(tab => (
            <TabsContent key={tab} value={tab}>
              {filteredEvents.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No {tab} community events found.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredEvents.map(renderEventCard)}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={open => { if (!open) setSelectedEvent(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="font-medium text-muted-foreground">Status</span><p className="capitalize">{selectedEvent.status}</p></div>
                <div><span className="font-medium text-muted-foreground">Event Type</span><p className="capitalize">{selectedEvent.event_type}</p></div>
                <div><span className="font-medium text-muted-foreground">Audience</span><p>{formatAudience(selectedEvent.audience)}</p></div>
                <div><span className="font-medium text-muted-foreground">Category</span><p className="capitalize">{selectedEvent.category || 'N/A'}</p></div>
                <div><span className="font-medium text-muted-foreground">Date</span><p>{format(new Date(selectedEvent.event_date), 'dd MMM yyyy')}</p></div>
                <div><span className="font-medium text-muted-foreground">Time</span><p>{selectedEvent.start_time?.slice(0, 5)}{selectedEvent.end_time ? ` – ${selectedEvent.end_time.slice(0, 5)}` : ''}</p></div>
              </div>

              {selectedEvent.description && (
                <div><span className="font-medium text-muted-foreground">Description</span><p className="mt-1">{selectedEvent.description}</p></div>
              )}

              <div className="border-t pt-3">
                <span className="font-medium text-muted-foreground">Location</span>
                <p>{selectedEvent.is_at_mosque ? (selectedEvent.mosque_name || 'At a mosque') : selectedEvent.custom_location || 'Not specified'}</p>
                {selectedEvent.is_at_mosque && selectedEvent.mosque_address && (
                  <p className="text-muted-foreground">{selectedEvent.mosque_address}{selectedEvent.mosque_city ? `, ${selectedEvent.mosque_city}` : ''}</p>
                )}
                {selectedEvent.postcode && <p className="text-muted-foreground">Postcode: {selectedEvent.postcode}</p>}
              </div>

              <div className="border-t pt-3">
                <span className="font-medium text-muted-foreground">Organizer</span>
                <p>{selectedEvent.organizer_name}</p>
                {selectedEvent.organizer_email && <p className="text-muted-foreground">{selectedEvent.organizer_email}</p>}
                {selectedEvent.organizer_phone && <p className="text-muted-foreground">{selectedEvent.organizer_phone}</p>}
              </div>

              {selectedEvent.status === 'pending' && (
                <div className="border-t pt-3 space-y-3">
                  <div>
                    <span className="font-medium text-muted-foreground">Admin Notes (optional)</span>
                    <Textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} placeholder="Add notes about your decision..." className="mt-1" />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => updateStatus(selectedEvent.id, 'approved')} disabled={updating} className="flex-1">
                      <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                    </Button>
                    <Button variant="destructive" onClick={() => updateStatus(selectedEvent.id, 'rejected')} disabled={updating} className="flex-1">
                      <XCircle className="h-4 w-4 mr-1" /> Reject
                    </Button>
                  </div>
                </div>
              )}

              {selectedEvent.admin_notes && selectedEvent.status !== 'pending' && (
                <div className="border-t pt-3">
                  <span className="font-medium text-muted-foreground">Admin Notes</span>
                  <p className="mt-1">{selectedEvent.admin_notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
