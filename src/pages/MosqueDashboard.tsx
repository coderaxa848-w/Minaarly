import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { useMosqueAdminCheck } from '@/hooks/useMosqueAdminCheck';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Building, Clock, Calendar, MapPin, Phone, Mail, Globe, Edit, Plus, Trash2, Save, CheckCircle } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Mosque = Tables<'mosques'>;
type IqamahTimes = Tables<'iqamah_times'>;
type MosqueEvent = Tables<'events'>;

export default function MosqueDashboard() {
  const navigate = useNavigate();
  const { isMosqueAdmin, mosqueId, mosqueName, loading: adminLoading } = useMosqueAdminCheck();
  const [mosque, setMosque] = useState<Mosque | null>(null);
  const [iqamah, setIqamah] = useState<IqamahTimes | null>(null);
  const [events, setEvents] = useState<MosqueEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit states
  const [editForm, setEditForm] = useState<Partial<Mosque>>({});
  const [iqamahForm, setIqamahForm] = useState<Partial<IqamahTimes>>({});
  const [saving, setSaving] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<MosqueEvent | null>(null);
  const [eventForm, setEventForm] = useState({
    title: '', description: '', event_date: '', start_time: '', end_time: '',
    category: 'other' as const, guest_speaker: '', topic: '',
  });

  useEffect(() => {
    if (adminLoading) return;
    if (!isMosqueAdmin || !mosqueId) {
      navigate('/');
      return;
    }
    fetchData();
  }, [adminLoading, isMosqueAdmin, mosqueId]);

  async function fetchData() {
    if (!mosqueId) return;
    setLoading(true);
    const [mosqueRes, iqamahRes, eventsRes] = await Promise.all([
      supabase.from('mosques').select('*').eq('id', mosqueId).single(),
      supabase.from('iqamah_times').select('*').eq('mosque_id', mosqueId).maybeSingle(),
      supabase.from('events').select('*').eq('mosque_id', mosqueId).order('event_date', { ascending: false }),
    ]);

    if (mosqueRes.data) {
      setMosque(mosqueRes.data);
      setEditForm(mosqueRes.data);
    }
    if (iqamahRes.data) {
      setIqamah(iqamahRes.data);
      setIqamahForm(iqamahRes.data);
    }
    setEvents(eventsRes.data || []);
    setLoading(false);
  }

  async function saveDetails() {
    if (!mosqueId) return;
    setSaving(true);
    const { error } = await supabase.from('mosques').update({
      name: editForm.name, address: editForm.address, city: editForm.city,
      postcode: editForm.postcode, phone: editForm.phone, email: editForm.email,
      website: editForm.website, description: editForm.description,
      madhab: editForm.madhab, facilities: editForm.facilities,
      languages: editForm.languages, has_womens_section: editForm.has_womens_section,
    }).eq('id', mosqueId);
    setSaving(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Saved', description: 'Mosque details updated successfully.' });
      fetchData();
    }
  }

  async function savePrayerTimes() {
    if (!mosqueId) return;
    setSaving(true);
    const payload = {
      mosque_id: mosqueId, fajr: iqamahForm.fajr || null, dhuhr: iqamahForm.dhuhr || null,
      asr: iqamahForm.asr || null, maghrib: iqamahForm.maghrib || null,
      isha: iqamahForm.isha || null, jummah: iqamahForm.jummah || null,
      use_api_times: iqamahForm.use_api_times ?? true,
    };
    const { error } = iqamah
      ? await supabase.from('iqamah_times').update(payload).eq('id', iqamah.id)
      : await supabase.from('iqamah_times').insert(payload);
    setSaving(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Saved', description: 'Prayer times updated.' });
      fetchData();
    }
  }

  async function saveEvent() {
    if (!mosqueId) return;
    setSaving(true);
    const payload = {
      mosque_id: mosqueId, title: eventForm.title, description: eventForm.description || null,
      event_date: eventForm.event_date, start_time: eventForm.start_time,
      end_time: eventForm.end_time || null, category: eventForm.category,
      guest_speaker: eventForm.guest_speaker || null, topic: eventForm.topic || null,
    };
    const { error } = editingEvent
      ? await supabase.from('events').update(payload).eq('id', editingEvent.id)
      : await supabase.from('events').insert(payload);
    setSaving(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: editingEvent ? 'Updated' : 'Created', description: `Event ${editingEvent ? 'updated' : 'created'} successfully.` });
      setShowEventForm(false);
      setEditingEvent(null);
      setEventForm({ title: '', description: '', event_date: '', start_time: '', end_time: '', category: 'other', guest_speaker: '', topic: '' });
      fetchData();
    }
  }

  async function deleteEvent(id: string) {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Deleted', description: 'Event removed.' });
      fetchData();
    }
  }

  function startEditEvent(event: MosqueEvent) {
    setEditingEvent(event);
    setEventForm({
      title: event.title, description: event.description || '', event_date: event.event_date,
      start_time: event.start_time, end_time: event.end_time || '',
      category: (event.category || 'other') as typeof eventForm.category,
      guest_speaker: event.guest_speaker || '', topic: event.topic || '',
    });
    setShowEventForm(true);
  }

  if (adminLoading || loading) {
    return (
      <Layout>
        <div className="container py-12 space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </Layout>
    );
  }

  if (!mosque) return null;

  return (
    <Layout>
      <div className="container py-8 md:py-12 max-w-5xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Building className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{mosque.name}</h1>
            <p className="text-muted-foreground text-sm">Mosque Dashboard</p>
          </div>
          {mosque.is_verified && <Badge variant="secondary" className="ml-auto"><CheckCircle className="h-3 w-3 mr-1" /> Verified</Badge>}
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Edit Details</TabsTrigger>
            <TabsTrigger value="prayer">Prayer Times</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><MapPin className="h-4 w-4" /> Location</CardTitle></CardHeader>
                <CardContent className="space-y-1 text-sm text-muted-foreground">
                  <p>{mosque.address}</p>
                  <p>{mosque.city}, {mosque.postcode}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Phone className="h-4 w-4" /> Contact</CardTitle></CardHeader>
                <CardContent className="space-y-1 text-sm text-muted-foreground">
                  {mosque.phone && <p className="flex items-center gap-2"><Phone className="h-3 w-3" /> {mosque.phone}</p>}
                  {mosque.email && <p className="flex items-center gap-2"><Mail className="h-3 w-3" /> {mosque.email}</p>}
                  {mosque.website && <p className="flex items-center gap-2"><Globe className="h-3 w-3" /> {mosque.website}</p>}
                  {!mosque.phone && !mosque.email && !mosque.website && <p>No contact info added yet.</p>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Clock className="h-4 w-4" /> Prayer Times</CardTitle></CardHeader>
                <CardContent>
                  {iqamah ? (
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {['fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'jummah'].map(p => (
                        <div key={p} className="flex justify-between">
                          <span className="capitalize text-muted-foreground">{p}</span>
                          <span className="font-medium text-foreground">{(iqamah as any)[p] || '—'}</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-sm text-muted-foreground">No prayer times set.</p>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Calendar className="h-4 w-4" /> Events</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{events.length} event{events.length !== 1 ? 's' : ''} listed</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Edit Details Tab */}
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Mosque Details</CardTitle>
                <CardDescription>Update your mosque's information visible to the public.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div><Label>Name</Label><Input value={editForm.name || ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} /></div>
                  <div><Label>Madhab</Label><Input value={editForm.madhab || ''} onChange={e => setEditForm(f => ({ ...f, madhab: e.target.value }))} placeholder="e.g. Hanafi" /></div>
                  <div><Label>Address</Label><Input value={editForm.address || ''} onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))} /></div>
                  <div><Label>City</Label><Input value={editForm.city || ''} onChange={e => setEditForm(f => ({ ...f, city: e.target.value }))} /></div>
                  <div><Label>Postcode</Label><Input value={editForm.postcode || ''} onChange={e => setEditForm(f => ({ ...f, postcode: e.target.value }))} /></div>
                  <div><Label>Phone</Label><Input value={editForm.phone || ''} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} /></div>
                  <div><Label>Email</Label><Input value={editForm.email || ''} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} /></div>
                  <div><Label>Website</Label><Input value={editForm.website || ''} onChange={e => setEditForm(f => ({ ...f, website: e.target.value }))} /></div>
                </div>
                <div><Label>Description</Label><Textarea value={editForm.description || ''} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} rows={3} /></div>
                <div><Label>Facilities (comma-separated)</Label><Input value={(editForm.facilities || []).join(', ')} onChange={e => setEditForm(f => ({ ...f, facilities: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} placeholder="e.g. Parking, Wudu Area, Library" /></div>
                <div><Label>Languages (comma-separated)</Label><Input value={(editForm.languages || []).join(', ')} onChange={e => setEditForm(f => ({ ...f, languages: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} placeholder="e.g. English, Arabic, Urdu" /></div>
                <div className="flex items-center gap-3">
                  <Switch checked={editForm.has_womens_section ?? false} onCheckedChange={v => setEditForm(f => ({ ...f, has_womens_section: v }))} />
                  <Label>Women's section available</Label>
                </div>
                <Button onClick={saveDetails} disabled={saving}><Save className="h-4 w-4 mr-2" />{saving ? 'Saving...' : 'Save Details'}</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prayer Times Tab */}
          <TabsContent value="prayer">
            <Card>
              <CardHeader>
                <CardTitle>Iqamah Times</CardTitle>
                <CardDescription>Set your mosque's iqamah times. Toggle API times off to use manual overrides.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <Switch checked={iqamahForm.use_api_times ?? true} onCheckedChange={v => setIqamahForm(f => ({ ...f, use_api_times: v }))} />
                  <Label>Use API-calculated times</Label>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {['fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'jummah'].map(prayer => (
                    <div key={prayer}>
                      <Label className="capitalize">{prayer}</Label>
                      <Input type="time" value={(iqamahForm as any)[prayer] || ''} onChange={e => setIqamahForm(f => ({ ...f, [prayer]: e.target.value }))} />
                    </div>
                  ))}
                </div>
                <Button onClick={savePrayerTimes} disabled={saving}><Save className="h-4 w-4 mr-2" />{saving ? 'Saving...' : 'Save Prayer Times'}</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Mosque Events</CardTitle>
                  <CardDescription>Manage events at your mosque.</CardDescription>
                </div>
                <Button size="sm" onClick={() => { setEditingEvent(null); setEventForm({ title: '', description: '', event_date: '', start_time: '', end_time: '', category: 'other', guest_speaker: '', topic: '' }); setShowEventForm(true); }}>
                  <Plus className="h-4 w-4 mr-1" /> Add Event
                </Button>
              </CardHeader>
              <CardContent>
                {showEventForm && (
                  <div className="border rounded-lg p-4 mb-6 space-y-4 bg-muted/30">
                    <h3 className="font-semibold">{editingEvent ? 'Edit Event' : 'New Event'}</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div><Label>Title</Label><Input value={eventForm.title} onChange={e => setEventForm(f => ({ ...f, title: e.target.value }))} /></div>
                      <div><Label>Category</Label>
                        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={eventForm.category} onChange={e => setEventForm(f => ({ ...f, category: e.target.value as any }))}>
                          {['halaqa','quran_class','youth','sisters','community','lecture','jummah','fundraiser','iftar','other'].map(c => (
                            <option key={c} value={c}>{c.replace('_', ' ')}</option>
                          ))}
                        </select>
                      </div>
                      <div><Label>Date</Label><Input type="date" value={eventForm.event_date} onChange={e => setEventForm(f => ({ ...f, event_date: e.target.value }))} /></div>
                      <div><Label>Start Time</Label><Input type="time" value={eventForm.start_time} onChange={e => setEventForm(f => ({ ...f, start_time: e.target.value }))} /></div>
                      <div><Label>End Time</Label><Input type="time" value={eventForm.end_time} onChange={e => setEventForm(f => ({ ...f, end_time: e.target.value }))} /></div>
                      <div><Label>Guest Speaker</Label><Input value={eventForm.guest_speaker} onChange={e => setEventForm(f => ({ ...f, guest_speaker: e.target.value }))} /></div>
                    </div>
                    <div><Label>Topic</Label><Input value={eventForm.topic} onChange={e => setEventForm(f => ({ ...f, topic: e.target.value }))} /></div>
                    <div><Label>Description</Label><Textarea value={eventForm.description} onChange={e => setEventForm(f => ({ ...f, description: e.target.value }))} rows={3} /></div>
                    <div className="flex gap-2">
                      <Button onClick={saveEvent} disabled={saving || !eventForm.title || !eventForm.event_date || !eventForm.start_time}>
                        <Save className="h-4 w-4 mr-2" />{saving ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
                      </Button>
                      <Button variant="outline" onClick={() => { setShowEventForm(false); setEditingEvent(null); }}>Cancel</Button>
                    </div>
                  </div>
                )}

                {events.length === 0 && !showEventForm ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">No events yet. Click "Add Event" to create one.</p>
                ) : (
                  <div className="space-y-3">
                    {events.map(event => (
                      <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium text-foreground">{event.title}</p>
                          <p className="text-sm text-muted-foreground">{event.event_date} • {event.start_time}{event.end_time ? ` – ${event.end_time}` : ''}</p>
                          {event.category && <Badge variant="outline" className="mt-1 text-xs">{event.category.replace('_', ' ')}</Badge>}
                        </div>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => startEditEvent(event)}><Edit className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteEvent(event.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
