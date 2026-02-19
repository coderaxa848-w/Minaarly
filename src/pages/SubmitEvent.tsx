import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, MapPin, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { addWeeks, addMonths, format, parseISO } from 'date-fns';

const CATEGORIES = [
  { value: 'halaqa', label: 'Halaqa' },
  { value: 'quran_class', label: 'Quran Class' },
  { value: 'youth', label: 'Youth' },
  { value: 'sisters', label: 'Sisters' },
  { value: 'community', label: 'Community' },
  { value: 'lecture', label: 'Lecture' },
  { value: 'jummah', label: 'Jummah' },
  { value: 'fundraiser', label: 'Fundraiser' },
  { value: 'iftar', label: 'Iftar' },
  { value: 'other', label: 'Other' },
];

const AUDIENCE_OPTIONS = [
  { value: 'mixed', label: 'Mixed (Everyone)' },
  { value: 'brothers_only', label: 'Brothers Only' },
  { value: 'sisters_only', label: 'Sisters Only' },
];

const REPEAT_PATTERNS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every 2 weeks' },
  { value: 'monthly_same_day', label: 'Monthly (same day)' },
  { value: 'custom', label: 'Custom dates' },
];

function computeUpcomingDates(startDate: string, pattern: string, interval: number, until: string): string[] {
  if (!startDate || !until) return [];
  const dates: string[] = [];
  let current = parseISO(startDate);
  const end = parseISO(until);
  let count = 0;
  while (current <= end && count < 52) {
    dates.push(format(current, 'yyyy-MM-dd'));
    if (pattern === 'weekly') current = addWeeks(current, interval);
    else if (pattern === 'biweekly') current = addWeeks(current, 2);
    else if (pattern === 'monthly_same_day') current = addMonths(current, 1);
    else break;
    count++;
  }
  return dates;
}

export default function SubmitEvent() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isAtMosque, setIsAtMosque] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [repeatPattern, setRepeatPattern] = useState('weekly');
  const [repeatInterval, setRepeatInterval] = useState(1);
  const [recurringUntil, setRecurringUntil] = useState('');
  const [mosqueSearch, setMosqueSearch] = useState('');
  const [mosqueResults, setMosqueResults] = useState<{ id: string; name: string; address: string }[]>([]);
  const [searchingMosques, setSearchingMosques] = useState(false);
  const [isOrganiser, setIsOrganiser] = useState(false);
  const [canSubmit, setCanSubmit] = useState(true);
  const [checkingEligibility, setCheckingEligibility] = useState(true);

  const [form, setForm] = useState({
    title: '',
    organizer_name: '',
    organizer_email: '',
    organizer_phone: '',
    description: '',
    event_date: '',
    start_time: '',
    end_time: '',
    audience: 'mixed' as string,
    category: 'other' as string,
    mosque_id: '',
    custom_location: '',
    postcode: '',
  });

  const upcomingDates = useMemo(() => {
    if (!isRecurring || repeatPattern === 'custom') return [];
    return computeUpcomingDates(form.event_date, repeatPattern, repeatInterval, recurringUntil);
  }, [isRecurring, repeatPattern, repeatInterval, recurringUntil, form.event_date]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Check organiser status and rate limit
  useEffect(() => {
    if (!user) return;
    const checkEligibility = async () => {
      setCheckingEligibility(true);
      const { data: orgData } = await supabase.rpc('is_event_organizer', { _user_id: user.id });
      setIsOrganiser(!!orgData);

      if (!orgData) {
        const { data: canSubmitData } = await supabase.rpc('can_submit_community_event', { _user_id: user.id });
        setCanSubmit(!!canSubmitData);
      }
      setCheckingEligibility(false);
    };
    checkEligibility();
  }, [user]);

  useEffect(() => {
    if (user) {
      setForm(f => ({ ...f, organizer_email: user.email || '' }));
    }
  }, [user]);

  // Mosque search
  useEffect(() => {
    if (!mosqueSearch || mosqueSearch.length < 2) {
      setMosqueResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setSearchingMosques(true);
      const { data } = await supabase.rpc('search_mosques', {
        search_term: mosqueSearch,
        limit_count: 5,
      });
      setMosqueResults(
        (data || []).map((m: any) => ({ id: m.id, name: m.name, address: m.address }))
      );
      setSearchingMosques(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, [mosqueSearch]);

  const geocodePostcode = async (postcode: string) => {
    try {
      const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`);
      const data = await res.json();
      if (data.status === 200) {
        return { lat: data.result.latitude, lng: data.result.longitude };
      }
    } catch {}
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      let latitude: number | null = null;
      let longitude: number | null = null;

      if (!isAtMosque && form.postcode) {
        const coords = await geocodePostcode(form.postcode);
        if (coords) {
          latitude = coords.lat;
          longitude = coords.lng;
        }
      }

      const { error } = await supabase.from('events').insert({
        title: form.title,
        description: form.description || null,
        event_date: form.event_date,
        start_time: form.start_time,
        end_time: form.end_time || null,
        category: (form.category || 'other') as any,
        audience: form.audience,
        mosque_id: isAtMosque && form.mosque_id ? form.mosque_id : null,
        custom_location: !isAtMosque ? form.custom_location || null : null,
        postcode: form.postcode || null,
        latitude,
        longitude,
        organizer_name: form.organizer_name,
        organizer_email: form.organizer_email || null,
        organizer_phone: form.organizer_phone || null,
        submitted_by: user.id,
        source: isOrganiser ? 'community_organiser' : 'user',
        status: isOrganiser ? 'approved' : 'pending',
        is_recurring: isRecurring,
        recurrence_pattern: isRecurring ? repeatPattern : null,
        recurrence_interval: isRecurring && repeatPattern === 'weekly' ? repeatInterval : null,
        recurring_until: isRecurring && recurringUntil ? recurringUntil : null,
      } as any);
      if (error) throw error;

      setSubmitted(true);
    } catch (err: any) {
      toast({
        title: 'Submission failed',
        description: err.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || checkingEligibility) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!canSubmit && !isOrganiser) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
            <Clock className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Weekly Limit Reached</h1>
          <p className="text-muted-foreground max-w-md mb-6">
            You can submit 1 community event per week. You've already submitted one recently. Try again next week, or become a verified Event Organiser for unlimited submissions.
          </p>
          <div className="flex gap-3">
            <Button onClick={() => navigate('/become-organiser')}>Become an Event Organiser</Button>
            <Button variant="outline" onClick={() => navigate('/')}>Go Home</Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (submitted) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-3">{isOrganiser ? 'Event Published!' : 'Event Submitted!'}</h1>
          <p className="text-muted-foreground max-w-md mb-6">
            {isOrganiser
              ? 'Your event is now live and visible to everyone.'
              : 'Your event has been submitted for review. Our team will review it and you\'ll be notified once it\'s approved.'}
          </p>
          <div className="flex gap-3">
            <Button onClick={() => { setSubmitted(false); setForm({ title: '', organizer_name: '', organizer_email: user?.email || '', organizer_phone: '', description: '', event_date: '', start_time: '', end_time: '', audience: 'mixed', category: 'other', mosque_id: '', custom_location: '', postcode: '' }); }}>
              Submit Another Event
            </Button>
            <Button variant="outline" onClick={() => navigate('/')}>
              Go Home
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-2xl py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Submit a Community Event</h1>
          <p className="text-muted-foreground">
            Fill out the form below to submit your event for review. Once approved, it will appear on our app.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Details */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">Event Details</h2>

            <div>
              <Label htmlFor="title">Event Name *</Label>
              <Input id="title" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Weekly Quran Circle" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="audience">Audience *</Label>
                <Select value={form.audience} onValueChange={v => setForm(f => ({ ...f, audience: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {AUDIENCE_OPTIONS.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Tell us about your event..." rows={4} />
            </div>
          </div>

          {/* Date & Time */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
              <Calendar className="h-5 w-5" /> Date & Time
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="event_date">Date *</Label>
                <Input id="event_date" type="date" required value={form.event_date} onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="start_time">Start Time *</Label>
                <Input id="start_time" type="time" required value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="end_time">End Time</Label>
                <Input id="end_time" type="time" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} />
              </div>
            </div>

            {/* Recurring toggle */}
            <div className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-colors ${isRecurring ? 'border-primary bg-primary/5' : 'border-border'}`}>
              <RefreshCw className={`h-5 w-5 mt-0.5 ${isRecurring ? 'text-primary' : 'text-muted-foreground'}`} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Recurring event?</p>
                    <p className="text-sm text-muted-foreground">Repeat this event on multiple dates</p>
                  </div>
                  <Switch checked={isRecurring} onCheckedChange={setIsRecurring} />
                </div>

                {isRecurring && (
                  <div className="mt-4 space-y-4">
                    {/* Pattern */}
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">Repeat Pattern</Label>
                      <div className="space-y-2">
                        {REPEAT_PATTERNS.map(p => (
                          <button
                            key={p.value}
                            type="button"
                            onClick={() => setRepeatPattern(p.value)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 text-sm font-medium transition-colors text-left ${repeatPattern === p.value ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/50'}`}
                          >
                            <RefreshCw className="h-4 w-4" />
                            {p.label}
                            {repeatPattern === p.value && <span className="ml-auto">✓</span>}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Frequency (only for weekly) */}
                    {repeatPattern === 'weekly' && (
                      <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">Frequency</Label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4].map(w => (
                            <button
                              key={w}
                              type="button"
                              onClick={() => setRepeatInterval(w)}
                              className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${repeatInterval === w ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary/50'}`}
                            >
                              {w}w
                            </button>
                          ))}
                        </div>
                        {form.event_date && (
                          <p className="text-sm text-primary mt-2">
                            Every {repeatInterval > 1 ? `${repeatInterval} weeks` : 'week'} on {new Date(form.event_date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long' })}
                          </p>
                        )}
                      </div>
                    )}

                    {/* End date */}
                    {repeatPattern !== 'custom' && (
                      <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">End Date *</Label>
                        <Input type="date" value={recurringUntil} onChange={e => setRecurringUntil(e.target.value)} min={form.event_date} />
                      </div>
                    )}

                    {/* Upcoming dates preview */}
                    {upcomingDates.length > 0 && (
                      <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
                        <p className="text-sm font-semibold text-primary mb-3">
                          <Calendar className="inline h-4 w-4 mr-1" />
                          Upcoming Dates — {upcomingDates.length} total
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {upcomingDates.slice(0, 6).map(d => {
                            const date = new Date(d + 'T00:00:00');
                            return (
                              <div key={d} className="text-center bg-background border border-border rounded-lg px-3 py-2">
                                <p className="text-base font-bold">{date.getDate()}</p>
                                <p className="text-xs text-muted-foreground">{date.toLocaleString('en-GB', { month: 'short' })}</p>
                              </div>
                            );
                          })}
                          {upcomingDates.length > 6 && (
                            <div className="text-center bg-muted rounded-lg px-3 py-2 flex items-center">
                              <p className="text-sm text-muted-foreground">+{upcomingDates.length - 6} more</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
              <MapPin className="h-5 w-5" /> Location
            </h2>

            <div className="flex items-center gap-3">
              <Switch checked={isAtMosque} onCheckedChange={setIsAtMosque} id="is_at_mosque" />
              <Label htmlFor="is_at_mosque">This event is at a mosque</Label>
            </div>

            {isAtMosque ? (
              <div>
                <Label>Search for a mosque</Label>
                <Input placeholder="Type mosque name or postcode..." value={mosqueSearch} onChange={e => { setMosqueSearch(e.target.value); setForm(f => ({ ...f, mosque_id: '' })); }} />
                {searchingMosques && <p className="text-sm text-muted-foreground mt-1">Searching...</p>}
                {mosqueResults.length > 0 && (
                  <div className="mt-2 border rounded-lg divide-y">
                    {mosqueResults.map(m => (
                      <button key={m.id} type="button" onClick={() => { setForm(f => ({ ...f, mosque_id: m.id })); setMosqueSearch(m.name); setMosqueResults([]); }} className={`w-full text-left px-4 py-3 hover:bg-accent transition-colors ${form.mosque_id === m.id ? 'bg-accent' : ''}`}>
                        <p className="font-medium text-sm">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.address}</p>
                      </button>
                    ))}
                  </div>
                )}
                {form.mosque_id && <p className="text-sm text-primary mt-1">✓ Mosque selected</p>}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="custom_location">Location / Address</Label>
                  <Input id="custom_location" value={form.custom_location} onChange={e => setForm(f => ({ ...f, custom_location: e.target.value }))} placeholder="e.g. Community Hall, 123 High Street" />
                </div>
                <div>
                  <Label htmlFor="postcode">Postcode</Label>
                  <Input id="postcode" value={form.postcode} onChange={e => setForm(f => ({ ...f, postcode: e.target.value }))} placeholder="e.g. E1 6AN" />
                  <p className="text-xs text-muted-foreground mt-1">We use this to show your event on the map</p>
                </div>
              </div>
            )}
          </div>

          {/* Organizer Info */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">Your Details</h2>
            <div>
              <Label htmlFor="organizer_name">Your Name *</Label>
              <Input id="organizer_name" required value={form.organizer_name} onChange={e => setForm(f => ({ ...f, organizer_name: e.target.value }))} placeholder="Full name" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="organizer_email">Email</Label>
                <Input id="organizer_email" type="email" value={form.organizer_email} onChange={e => setForm(f => ({ ...f, organizer_email: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="organizer_phone">Phone</Label>
                <Input id="organizer_phone" type="tel" value={form.organizer_phone} onChange={e => setForm(f => ({ ...f, organizer_phone: e.target.value }))} placeholder="Optional" />
              </div>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</> : isOrganiser ? 'Publish Event' : 'Submit Event for Review'}
          </Button>
        </form>
      </div>
    </Layout>
  );
}
