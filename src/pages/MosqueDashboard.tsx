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
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { Building, Clock, Calendar, MapPin, Phone, Mail, Globe, Edit, Plus, Trash2, Save, CheckCircle, Users, Heart, Moon, Link as LinkIcon, ArrowRight } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('overview');

  // Edit states
  const [editForm, setEditForm] = useState<Partial<Mosque>>({});
  const [iqamahForm, setIqamahForm] = useState<Partial<IqamahTimes>>({});
  const [saving, setSaving] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<MosqueEvent | null>(null);
  const [ramadanEnabled, setRamadanEnabled] = useState(false);
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

  useEffect(() => {
    if (mosque) {
      setRamadanEnabled(!!(mosque.tarawih_rakah || mosque.tarawih_type || mosque.qiyamul_layl));
    }
  }, [mosque]);

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
      languages: editForm.languages,
      established: editForm.established || null,
      capacity: editForm.capacity || null,
      mosque_donation_link: editForm.mosque_donation_link || null,
      tarawih_rakah: ramadanEnabled ? (editForm.tarawih_rakah || null) : null,
      tarawih_type: ramadanEnabled ? (editForm.tarawih_type || null) : null,
      qiyamul_layl: ramadanEnabled ? (editForm.qiyamul_layl || null) : null,
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

  const upcomingEvents = events.filter(e => new Date(e.event_date) >= new Date()).length;
  const completionItems = [
    { label: 'Description', done: !!mosque.description },
    { label: 'Phone', done: !!mosque.phone },
    { label: 'Email', done: !!mosque.email },
    { label: 'Website', done: !!mosque.website },
    { label: 'Prayer Times', done: !!iqamah },
    { label: 'Facilities', done: (mosque.facilities?.length ?? 0) > 0 },
  ];
  const completionPct = Math.round((completionItems.filter(i => i.done).length / completionItems.length) * 100);

  return (
    <Layout>
      <div className="container py-8 md:py-12 max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <Building className="h-7 w-7 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground truncate">{mosque.name}</h1>
              {mosque.is_verified && <Badge variant="secondary" className="shrink-0"><CheckCircle className="h-3 w-3 mr-1" /> Verified</Badge>}
            </div>
            <p className="text-muted-foreground text-sm">Mosque Dashboard • {mosque.city}, {mosque.postcode}</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Edit Details</TabsTrigger>
            <TabsTrigger value="prayer">Prayer Times</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="space-y-6">
              {/* Profile Completion */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Profile Completion</span>
                    <span className="text-sm font-bold text-primary">{completionPct}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full transition-all" style={{ width: `${completionPct}%` }} />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {completionItems.map(item => (
                      <Badge key={item.label} variant={item.done ? 'secondary' : 'outline'} className={item.done ? 'text-primary' : 'text-muted-foreground'}>
                        {item.done ? <CheckCircle className="h-3 w-3 mr-1" /> : null}
                        {item.label}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Stats Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setActiveTab('details')}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-semibold text-foreground text-sm truncate">{mosque.city}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setActiveTab('prayer')}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Prayer Times</p>
                        <p className="font-semibold text-foreground text-sm">{iqamah ? 'Configured' : 'Not set'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setActiveTab('events')}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Upcoming Events</p>
                        <p className="font-semibold text-foreground text-sm">{upcomingEvents} event{upcomingEvents !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Capacity</p>
                        <p className="font-semibold text-foreground text-sm">{mosque.capacity || '—'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {mosque.phone && <p className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3 w-3" /> {mosque.phone}</p>}
                    {mosque.email && <p className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3 w-3" /> {mosque.email}</p>}
                    {mosque.website && <p className="flex items-center gap-2 text-muted-foreground"><Globe className="h-3 w-3" /> {mosque.website}</p>}
                    {!mosque.phone && !mosque.email && !mosque.website && (
                      <p className="text-muted-foreground">No contact info added. <button className="text-primary underline" onClick={() => setActiveTab('details')}>Add now</button></p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Today's Prayer Times</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {iqamah ? (
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                        {['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].map(p => (
                          <div key={p} className="flex justify-between py-0.5">
                            <span className="capitalize text-muted-foreground">{p}</span>
                            <span className="font-medium text-foreground">{(iqamah as any)[p] || '—'}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No prayer times set. <button className="text-primary underline" onClick={() => setActiveTab('prayer')}>Configure</button></p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Edit Details Tab */}
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Mosque Details</CardTitle>
                <CardDescription>Update your mosque's information visible to the public.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Info */}
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

                <Separator />

                {/* Additional Details */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Additional Details</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div><Label>Established (Year)</Label><Input value={editForm.established || ''} onChange={e => setEditForm(f => ({ ...f, established: e.target.value }))} placeholder="e.g. 1985" /></div>
                    <div><Label>Capacity</Label><Input type="number" value={editForm.capacity ?? ''} onChange={e => setEditForm(f => ({ ...f, capacity: e.target.value ? parseInt(e.target.value) : null }))} placeholder="e.g. 500" /></div>
                    <div><Label>Madhab</Label><Input value={editForm.madhab || ''} onChange={e => setEditForm(f => ({ ...f, madhab: e.target.value }))} placeholder="e.g. Hanafi" /></div>
                  </div>
                </div>

                {/* Donation Link */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Heart className="h-4 w-4 text-primary" /> Donation</h3>
                  <div><Label>Donation Link</Label><Input value={editForm.mosque_donation_link || ''} onChange={e => setEditForm(f => ({ ...f, mosque_donation_link: e.target.value }))} placeholder="https://donate.example.com" /></div>
                </div>

                <Separator />

                {/* Ramadan Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-semibold text-foreground">Ramadan Settings</h3>
                    </div>
                    <Switch checked={ramadanEnabled} onCheckedChange={setRamadanEnabled} />
                  </div>
                  {ramadanEnabled && (
                    <div className="grid gap-4 md:grid-cols-3 p-4 rounded-lg border bg-muted/30">
                      <div>
                        <Label>Tarawih Rakah</Label>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={editForm.tarawih_rakah || ''}
                          onChange={e => setEditForm(f => ({ ...f, tarawih_rakah: e.target.value }))}
                        >
                          <option value="">Select...</option>
                          <option value="8">8 Rakah</option>
                          <option value="20">20 Rakah</option>
                          <option value="8+3">8 + 3 Witr</option>
                          <option value="20+3">20 + 3 Witr</option>
                        </select>
                      </div>
                      <div>
                        <Label>Tarawih Type</Label>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={editForm.tarawih_type || ''}
                          onChange={e => setEditForm(f => ({ ...f, tarawih_type: e.target.value }))}
                        >
                          <option value="">Select...</option>
                          <option value="khatm">Khatm (Full Quran)</option>
                          <option value="selected_surahs">Selected Surahs</option>
                          <option value="short">Short Surahs</option>
                        </select>
                      </div>
                      <div>
                        <Label>Qiyamul Layl</Label>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={editForm.qiyamul_layl || ''}
                          onChange={e => setEditForm(f => ({ ...f, qiyamul_layl: e.target.value }))}
                        >
                          <option value="">Select...</option>
                          <option value="yes">Yes - Available</option>
                          <option value="last_10">Last 10 Nights Only</option>
                          <option value="no">No</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                <div><Label>Facilities (comma-separated)</Label><Input value={(editForm.facilities || []).join(', ')} onChange={e => setEditForm(f => ({ ...f, facilities: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} placeholder="e.g. Parking, Wudu Area, Library" /></div>
                <div><Label>Languages (comma-separated)</Label><Input value={(editForm.languages || []).join(', ')} onChange={e => setEditForm(f => ({ ...f, languages: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} placeholder="e.g. English, Arabic, Urdu" /></div>
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
