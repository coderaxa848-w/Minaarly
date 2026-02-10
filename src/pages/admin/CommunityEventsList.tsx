import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, XCircle, Clock, Eye, Loader2, Calendar, MapPin, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive'; icon: any }> = {
  pending: { label: 'Pending', variant: 'secondary', icon: Clock },
  approved: { label: 'Approved', variant: 'default', icon: CheckCircle2 },
  rejected: { label: 'Rejected', variant: 'destructive', icon: XCircle },
};

export default function CommunityEventsList() {
  const { toast } = useToast();
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedEvent, setSelectedEvent] = useState<CommunityEvent | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    let query = supabase.from('community_events' as any).select('*, mosques(name, address, city)').order('created_at', { ascending: false });
    if (filter !== 'all') {
      query = query.eq('status', filter);
    }
    const { data, error } = await query;
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setEvents(((data as any[]) || []).map((e: any) => ({ ...e, mosque_name: e.mosques?.name || null, mosque_address: e.mosques?.address || null, mosque_city: e.mosques?.city || null })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, [filter]);

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    setUpdating(true);
    const { error } = await supabase.from('community_events' as any).update({ status, admin_notes: adminNotes || null } as any).eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: `Event ${status}`, description: `The event has been ${status}.` });
      setSelectedEvent(null);
      setAdminNotes('');
      fetchEvents();
    }
    setUpdating(false);
  };

  const formatAudience = (a: string) => {
    switch (a) {
      case 'brothers_only': return 'Brothers Only';
      case 'sisters_only': return 'Sisters Only';
      default: return 'Mixed';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Community Events</h1>
          <p className="text-muted-foreground">Review and manage event submissions from organizers</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No {filter !== 'all' ? filter : ''} community events found.
        </div>
      ) : (
        <div className="space-y-3">
          {events.map(event => {
            const sc = statusConfig[event.status] || statusConfig.pending;
            const StatusIcon = sc.icon;
            return (
              <div key={event.id} className="border rounded-xl p-5 bg-card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg truncate">{event.title}</h3>
                      <Badge variant={sc.variant} className="shrink-0">
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {sc.label}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
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
                  <Button variant="outline" size="sm" onClick={() => { setSelectedEvent(event); setAdminNotes(event.admin_notes || ''); }}>
                    <Eye className="h-4 w-4 mr-1" /> View
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
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
