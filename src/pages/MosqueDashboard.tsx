import { useEffect, useState, useCallback } from 'react';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Building, Clock, Calendar, MapPin, Phone, Mail, Globe, Edit, Plus, Trash2, Save, CheckCircle, Users, Heart, Moon, Link as LinkIcon, ArrowRight, Upload, FileImage, Loader2, AlertTriangle, X } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

/** Compress image files using Canvas API before upload. Skips PDFs. */
async function compressImage(file: File, maxDim = 1920, quality = 0.6): Promise<File> {
  if (!file.type.startsWith('image/')) return file;
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Compression failed'));
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
        },
        'image/jpeg',
        quality,
      );
    };
    img.onerror = () => reject(new Error('Failed to load image for compression'));
    img.src = URL.createObjectURL(file);
  });
}

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

  // Timetable upload states
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadMonth, setUploadMonth] = useState('');
  const [uploadYear, setUploadYear] = useState(new Date().getFullYear().toString());
  const [uploadMadhab, setUploadMadhab] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [extractedWarnings, setExtractedWarnings] = useState<string[]>([]);
  const [existingMonths, setExistingMonths] = useState<Array<{ month: number; year: number; id: string }>>([]);
  const [viewingMonthData, setViewingMonthData] = useState<any>(null);
  const [viewingMonthLabel, setViewingMonthLabel] = useState('');

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
      setUploadMadhab(mosqueRes.data.madhab || '');
    }
    if (iqamahRes.data) {
      setIqamah(iqamahRes.data);
      setIqamahForm(iqamahRes.data);
    }
    setEvents(eventsRes.data || []);
    setLoading(false);
    fetchExistingMonths();
  }

  async function fetchExistingMonths() {
    if (!mosqueId) return;
    const { data } = await supabase
      .from('masjid_salah_times_monthly' as any)
      .select('id, month, year')
      .eq('masjid_id', mosqueId)
      .order('year', { ascending: false })
      .order('month', { ascending: false });
    const months = (data as any) || [];
    setExistingMonths(months);

    // Auto-load current month if available
    const now = new Date();
    const currentMonth = months.find((m: any) => m.month === now.getMonth() + 1 && m.year === now.getFullYear());
    if (currentMonth) {
      loadMonthData(currentMonth.id, currentMonth.month, currentMonth.year);
    } else if (months.length > 0) {
      loadMonthData(months[0].id, months[0].month, months[0].year);
    }
  }

  async function loadMonthData(id: string, month: number, year: number) {
    const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    setViewingMonthLabel(`${monthNames[month]} ${year}`);
    const { data } = await supabase
      .from('masjid_salah_times_monthly' as any)
      .select('*')
      .eq('id', id)
      .maybeSingle();
    setViewingMonthData(data);
  }

  async function handleExtract() {
    if (!uploadFile || !mosqueId || !uploadMonth || !uploadYear) {
      toast({ title: 'Missing info', description: 'Please select a file, month, and year.', variant: 'destructive' });
      return;
    }
    setExtracting(true);
    setExtractedData(null);
    setExtractedWarnings([]);

    try {
      // Compress images before upload (skip PDFs)
      const fileToUpload = await compressImage(uploadFile);
      const fileExt = fileToUpload.name.split('.').pop();
      const fileName = `${mosqueId}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('temp-uploads')
        .upload(fileName, fileToUpload);
      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      const { data: urlData } = supabase.storage
        .from('temp-uploads')
        .getPublicUrl(fileName);

      const { data: fnData, error: fnError } = await supabase.functions.invoke('extract-prayer-times', {
        body: {
          file_url: urlData.publicUrl,
          file_type: fileToUpload.type,
          mosque_id: mosqueId,
          mosque_name: mosqueName,
          madhab_preference: uploadMadhab || null,
          mode: 'single',
        },
      });

      if (fnError) throw new Error(fnError.message);
      if (!fnData?.success) throw new Error(fnData?.error || 'Extraction failed');

      setExtractedData(fnData.extracted);
      setExtractedWarnings(fnData.extracted.warnings || []);
      toast({ title: 'Extraction complete', description: `Extracted ${fnData.extracted.monthly_times?.days?.length || 0} days of prayer times.` });
    } catch (e: any) {
      console.error('Extraction error:', e);
      toast({ title: 'Extraction failed', description: e.message, variant: 'destructive' });
    } finally {
      setExtracting(false);
    }
  }

  function updateExtractedTime(dayIndex: number, prayerIndex: number, field: 'adhan' | 'iqamah', value: string) {
    if (!extractedData) return;
    const updated = JSON.parse(JSON.stringify(extractedData));
    updated.monthly_times.days[dayIndex].prayers[prayerIndex][field] = value || null;
    setExtractedData(updated);
  }

  async function saveExtractedTimes() {
    if (!extractedData || !mosqueId) return;
    setSaving(true);
    try {
      const monthNum = ['january','february','march','april','may','june','july','august','september','october','november','december']
        .indexOf(extractedData.month.toLowerCase()) + 1;

      const payload = {
        masjid_id: mosqueId,
        masjid_name: mosqueName,
        month: monthNum || parseInt(uploadMonth),
        year: parseInt(uploadYear) || extractedData.year,
        monthly_times: extractedData.monthly_times,
        special_dates: extractedData.special_dates?.length ? extractedData.special_dates : null,
        madhab_preference: uploadMadhab || null,
        source: 'ai_extracted',
        created_by: (await supabase.auth.getUser()).data.user?.id || null,
      };

      const existing = existingMonths.find(
        (m) => m.month === payload.month && m.year === payload.year
      );

      let error;
      if (existing) {
        ({ error } = await supabase.from('masjid_salah_times_monthly' as any).update(payload).eq('id', existing.id));
      } else {
        ({ error } = await supabase.from('masjid_salah_times_monthly' as any).insert(payload));
      }

      if (error) throw new Error(error.message);

      toast({ title: 'Saved!', description: `Prayer times for ${extractedData.month} ${extractedData.year} published.` });
      setExtractedData(null);
      setUploadFile(null);
      fetchExistingMonths();
    } catch (e: any) {
      toast({ title: 'Save failed', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }

  async function deleteMonth(id: string) {
    const { error } = await supabase.from('masjid_salah_times_monthly' as any).delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Deleted', description: 'Month data removed.' });
      fetchExistingMonths();
    }
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
                    {viewingMonthData ? (() => {
                      const todayStr = new Date().toISOString().slice(0, 10);
                      const todayData = viewingMonthData.monthly_times?.days?.find((d: any) => d.date === todayStr);
                      if (!todayData) return <p className="text-sm text-muted-foreground">No data for today in {viewingMonthLabel}. <button className="text-primary underline" onClick={() => setActiveTab('prayer')}>Upload</button></p>;
                      return (
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                          {['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].map(prayer => {
                            const p = todayData.prayers?.find((pr: any) => pr.prayer === prayer);
                            return (
                              <div key={prayer} className="flex justify-between py-0.5">
                                <span className="capitalize text-muted-foreground">{prayer}</span>
                                <span className="font-medium text-foreground">{p?.iqamah || p?.adhan || '—'}</span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })() : iqamah ? (
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
            <div className="space-y-6">
              {/* Monthly Prayer Times Viewer */}
              {existingMonths.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" /> Monthly Prayer Times</CardTitle>
                        <CardDescription>Viewing saved timetable for your mosque.</CardDescription>
                      </div>
                      {/* Month Selector */}
                      <div className="flex flex-wrap gap-1.5">
                        {existingMonths.map(m => {
                          const monthShort = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                          const isActive = viewingMonthLabel === `${['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][m.month]} ${m.year}`;
                          return (
                            <Badge
                              key={m.id}
                              variant={isActive ? 'default' : 'outline'}
                              className="cursor-pointer"
                              onClick={() => loadMonthData(m.id, m.month, m.year)}
                            >
                              {monthShort[m.month]} {m.year}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {viewingMonthData ? (
                      <>
                        <h3 className="text-lg font-semibold text-foreground mb-4">{viewingMonthLabel}</h3>
                        <div className="overflow-x-auto border rounded-lg">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-20 sticky left-0 bg-background z-10">Date</TableHead>
                                <TableHead className="w-12">Day</TableHead>
                                <TableHead className="text-center">Fajr</TableHead>
                                <TableHead className="text-center">Sunrise</TableHead>
                                <TableHead className="text-center">Dhuhr</TableHead>
                                <TableHead className="text-center">Asr</TableHead>
                                <TableHead className="text-center">Maghrib</TableHead>
                                <TableHead className="text-center">Isha</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {viewingMonthData.monthly_times?.days?.map((day: any, di: number) => {
                                const isFriday = day.day?.toLowerCase() === 'friday';
                                const isToday = day.date === new Date().toISOString().slice(0, 10);
                                return (
                                  <TableRow key={di} className={`${isToday ? 'bg-primary/10 font-semibold' : ''} ${isFriday ? 'bg-accent/30' : ''}`}>
                                    <TableCell className="font-mono text-xs sticky left-0 bg-inherit z-10">{day.date?.slice(5)}</TableCell>
                                    <TableCell className="text-xs capitalize">{day.day?.slice(0, 3)}</TableCell>
                                    {['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'].map(prayer => {
                                      const p = day.prayers?.find((pr: any) => pr.prayer === prayer);
                                      return (
                                        <TableCell key={prayer} className="text-center p-1.5">
                                          <div className="text-xs font-mono">
                                            {p?.adhan && <div className="text-muted-foreground">{p.adhan}</div>}
                                            {p?.iqamah && prayer !== 'sunrise' && (
                                              <div className="font-semibold text-foreground">{p.iqamah}</div>
                                            )}
                                            {!p?.adhan && !p?.iqamah && <span className="text-muted-foreground/50">—</span>}
                                          </div>
                                        </TableCell>
                                      );
                                    })}
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                        {/* Legend */}
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary/10 inline-block" /> Today</span>
                          <span>Top = Adhan · <span className="font-semibold text-foreground">Bottom = Iqamah</span></span>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground py-4 text-center">Loading timetable...</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {existingMonths.length === 0 && (
                <Card>
                  <CardContent className="py-8 text-center">
                    <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No monthly timetables uploaded yet.</p>
                    <p className="text-sm text-muted-foreground mt-1">Upload a prayer timetable image below to get started.</p>
                  </CardContent>
                </Card>
              )}

              <Separator />

              {/* Monthly Timetable Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5 text-primary" /> Upload Monthly Timetable</CardTitle>
                  <CardDescription>Upload a photo or PDF of your printed prayer timetable. AI will extract all prayer times automatically.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!extractedData ? (
                    <>
                      {/* File Input */}
                      <div>
                        <Label>Timetable Image or PDF</Label>
                        <div className="mt-1">
                          <label className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer border-muted-foreground/25 hover:border-primary/50 transition-colors bg-muted/20">
                            <div className="text-center">
                              <FileImage className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground">
                                {uploadFile ? uploadFile.name : 'Click to select JPG, PNG, WEBP, or PDF'}
                              </p>
                            </div>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/jpeg,image/png,image/webp,application/pdf"
                              onChange={e => setUploadFile(e.target.files?.[0] || null)}
                            />
                          </label>
                        </div>
                      </div>

                      {/* Month/Year/Madhab */}
                      <div className="grid gap-4 md:grid-cols-3">
                        <div>
                          <Label>Month</Label>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={uploadMonth}
                            onChange={e => setUploadMonth(e.target.value)}
                          >
                            <option value="">Select month...</option>
                            {['January','February','March','April','May','June','July','August','September','October','November','December'].map((m, i) => (
                              <option key={m} value={String(i + 1)}>{m}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label>Year</Label>
                          <Input type="number" value={uploadYear} onChange={e => setUploadYear(e.target.value)} min="2024" max="2030" />
                        </div>
                        <div>
                          <Label>Madhab (for Asr)</Label>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={uploadMadhab}
                            onChange={e => setUploadMadhab(e.target.value)}
                          >
                            <option value="">Not specified</option>
                            <option value="hanafi">Hanafi</option>
                            <option value="shafi">Shafi'i</option>
                          </select>
                        </div>
                      </div>

                      <Button onClick={handleExtract} disabled={extracting || !uploadFile || !uploadMonth || !uploadYear}>
                        {extracting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Extracting times...</> : <><Upload className="h-4 w-4 mr-2" /> Extract Times</>}
                      </Button>
                    </>
                  ) : (
                    <>
                      {/* Review Header */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">Review: {extractedData.month} {extractedData.year}</h3>
                          <p className="text-sm text-muted-foreground">{extractedData.monthly_times?.days?.length || 0} days extracted. Click any cell to edit.</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => { setExtractedData(null); setUploadFile(null); }}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Warnings */}
                      {extractedWarnings.length > 0 && (
                        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-700">Warnings ({extractedWarnings.length})</span>
                          </div>
                          <ul className="text-xs text-yellow-700 space-y-1">
                            {extractedWarnings.map((w, i) => <li key={i}>• {w}</li>)}
                          </ul>
                        </div>
                      )}

                      {/* Review Table */}
                      <div className="overflow-x-auto border rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-24">Date</TableHead>
                              <TableHead className="w-16">Day</TableHead>
                              <TableHead>Fajr</TableHead>
                              <TableHead>Sunrise</TableHead>
                              <TableHead>Dhuhr</TableHead>
                              <TableHead>Asr</TableHead>
                              <TableHead>Maghrib</TableHead>
                              <TableHead>Isha</TableHead>
                              <TableHead>Jumuah</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {extractedData.monthly_times?.days?.map((day: any, di: number) => {
                              const hasWarning = extractedWarnings.some(w => w.includes(day.date));
                              return (
                                <TableRow key={di} className={hasWarning ? 'bg-yellow-500/5' : ''}>
                                  <TableCell className="font-mono text-xs">{day.date?.slice(5)}</TableCell>
                                  <TableCell className="text-xs capitalize">{day.day?.slice(0, 3)}</TableCell>
                                  {['fajr','sunrise','dhuhr','asr','maghrib','isha'].map((prayer, pi) => {
                                    const p = day.prayers?.find((pr: any) => pr.prayer === prayer);
                                    return (
                                      <TableCell key={prayer} className="p-1">
                                        <div className="space-y-0.5">
                                          <Input
                                            className="h-7 text-xs px-1 w-16"
                                            value={p?.adhan || ''}
                                            onChange={e => {
                                              const idx = day.prayers?.findIndex((pr: any) => pr.prayer === prayer);
                                              if (idx >= 0) updateExtractedTime(di, idx, 'adhan', e.target.value);
                                            }}
                                            placeholder="Adhan"
                                          />
                                          {prayer !== 'sunrise' && (
                                            <Input
                                              className="h-7 text-xs px-1 w-16 bg-primary/5"
                                              value={p?.iqamah || ''}
                                              onChange={e => {
                                                const idx = day.prayers?.findIndex((pr: any) => pr.prayer === prayer);
                                                if (idx >= 0) updateExtractedTime(di, idx, 'iqamah', e.target.value);
                                              }}
                                              placeholder="Iqamah"
                                            />
                                          )}
                                        </div>
                                      </TableCell>
                                    );
                                  })}
                                  <TableCell className="text-xs font-mono">{day.jumuah || '—'}</TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={saveExtractedTimes} disabled={saving}>
                          <Save className="h-4 w-4 mr-2" />{saving ? 'Saving...' : 'Save & Publish'}
                        </Button>
                        <Button variant="outline" onClick={() => { setExtractedData(null); setUploadFile(null); }}>Cancel</Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Manage Uploaded Months */}
              {existingMonths.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Manage Uploaded Months</CardTitle>
                    <CardDescription>Delete a month's timetable if needed.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {existingMonths.map(m => {
                        const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        return (
                          <div key={m.id} className="flex items-center gap-1">
                            <Badge variant="secondary">{monthNames[m.month]} {m.year}</Badge>
                            <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => deleteMonth(m.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
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
