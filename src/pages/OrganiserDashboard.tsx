import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2, Instagram, Globe, Twitter, Camera, Calendar,
  Clock, MapPin, PlusCircle, Users, Edit2, Save, X
} from 'lucide-react';

interface OrgProfile {
  id: string;
  display_name: string;
  org_type: string;
  bio: string | null;
  social_instagram: string | null;
  social_twitter: string | null;
  social_website: string | null;
  org_picture_url: string | null;
  status: string;
}

interface MyEvent {
  id: string;
  title: string;
  event_date: string;
  start_time: string;
  category: string | null;
  status: string | null;
  is_archived: boolean | null;
}

export default function OrganiserDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<OrgProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [events, setEvents] = useState<MyEvent[]>([]);

  const [form, setForm] = useState({
    display_name: '',
    bio: '',
    social_instagram: '',
    social_twitter: '',
    social_website: '',
  });

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth', { replace: true });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const { data: prof } = await (supabase as any)
        .from('event_organizer_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (prof) {
        setProfile(prof as OrgProfile);
        setForm({
          display_name: prof.display_name || '',
          bio: prof.bio || '',
          social_instagram: prof.social_instagram || '',
          social_twitter: prof.social_twitter || '',
          social_website: prof.social_website || '',
        });
      }

      // Load user's events
      const { data: evts } = await supabase
        .from('events')
        .select('id, title, event_date, start_time, category, status, is_archived')
        .eq('submitted_by', user.id)
        .order('event_date', { ascending: false })
        .limit(20);

      setEvents(evts || []);
      setLoading(false);
    };
    load();
  }, [user]);

  const handleSave = async () => {
    if (!user || !profile) return;
    setSaving(true);
    try {
      const { error } = await (supabase as any)
        .from('event_organizer_profiles')
        .update({
          display_name: form.display_name.trim(),
          bio: form.bio.trim() || null,
          social_instagram: form.social_instagram.trim() || null,
          social_twitter: form.social_twitter.trim() || null,
          social_website: form.social_website.trim() || null,
        })
        .eq('user_id', user.id);

      if (error) throw error;
      setProfile(p => p ? { ...p, ...form } : p);
      setEditing(false);
      toast({ title: 'Profile updated!' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handlePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingPic(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `organiser-pics/${user.id}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
      const { error: updateError } = await supabase
        .from('event_organizer_profiles' as any)
        .update({ org_picture_url: publicUrl })
        .eq('user_id', user.id);
      if (updateError) throw updateError;

      setProfile(p => p ? { ...p, org_picture_url: publicUrl } : p);
      toast({ title: 'Picture updated!' });
    } catch (err: any) {
      toast({ title: 'Error uploading picture', description: err.message, variant: 'destructive' });
    } finally {
      setUploadingPic(false);
    }
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <h1 className="text-2xl font-bold mb-3">Not an Event Organiser</h1>
          <p className="text-muted-foreground mb-6">You need to apply and get approved to access your organiser dashboard.</p>
          <Button asChild><Link to="/become-organiser">Apply Now</Link></Button>
        </div>
      </Layout>
    );
  }

  const upcomingEvents = events.filter(e => new Date(e.event_date) >= new Date() && !e.is_archived);
  const pastEvents = events.filter(e => new Date(e.event_date) < new Date() || e.is_archived);

  const statusColor: Record<string, string> = {
    approved: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
    rejected: 'bg-red-100 text-red-700',
  };

  return (
    <Layout>
      <div className="container max-w-3xl py-12 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Event Organisation</h1>
          <Badge className={profile.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
            {profile.status === 'approved' ? '✓ Verified Organiser' : 'Pending Approval'}
          </Badge>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Organiser Profile</CardTitle>
            {!editing ? (
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                <Edit2 className="h-4 w-4 mr-2" />Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                  <X className="h-4 w-4 mr-1" />Cancel
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
                  Save
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Picture */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div
                  className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden cursor-pointer border-2 border-border hover:border-primary transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploadingPic ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  ) : profile.org_picture_url ? (
                    <img src={profile.org_picture_url} alt="Org picture" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center"
                >
                  <Edit2 className="h-3 w-3 text-primary-foreground" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Tap to change photo</p>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePictureUpload} />
            </div>

            {/* Fields */}
            {editing ? (
              <div className="space-y-4">
                <div>
                  <Label>Display Name</Label>
                  <Input value={form.display_name} onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))} maxLength={100} />
                </div>
                <div>
                  <Label>Bio</Label>
                  <Textarea
                    value={form.bio}
                    onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground mt-1">{form.bio.length}/500</p>
                </div>
                <div>
                  <Label className="flex items-center gap-2"><Instagram className="h-4 w-4" />Instagram</Label>
                  <Input value={form.social_instagram} onChange={e => setForm(f => ({ ...f, social_instagram: e.target.value }))} placeholder="@yourhandle" />
                </div>
                <div>
                  <Label className="flex items-center gap-2"><Twitter className="h-4 w-4" />Twitter / X</Label>
                  <Input value={form.social_twitter} onChange={e => setForm(f => ({ ...f, social_twitter: e.target.value }))} placeholder="@yourhandle" />
                </div>
                <div>
                  <Label className="flex items-center gap-2"><Globe className="h-4 w-4" />Website</Label>
                  <Input value={form.social_website} onChange={e => setForm(f => ({ ...f, social_website: e.target.value }))} placeholder="https://yoursite.com" />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-lg">{profile.display_name}</p>
                  <p className="text-sm text-muted-foreground capitalize">{profile.org_type}</p>
                </div>
                {profile.bio && <p className="text-sm text-muted-foreground">{profile.bio}</p>}
                <div className="flex flex-wrap gap-3">
                  {profile.social_instagram && (
                    <a href={profile.social_instagram.startsWith('http') ? profile.social_instagram : `https://instagram.com/${profile.social_instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                      <Instagram className="h-4 w-4" />{profile.social_instagram}
                    </a>
                  )}
                  {profile.social_twitter && (
                    <a href={profile.social_twitter.startsWith('http') ? profile.social_twitter : `https://twitter.com/${profile.social_twitter.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                      <Twitter className="h-4 w-4" />{profile.social_twitter}
                    </a>
                  )}
                  {profile.social_website && (
                    <a href={profile.social_website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                      <Globe className="h-4 w-4" />Website
                    </a>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Events */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">My Events</h2>
          <Button asChild size="sm">
            <Link to="/submit-event"><PlusCircle className="h-4 w-4 mr-2" />Add Event</Link>
          </Button>
        </div>

        {upcomingEvents.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Upcoming</h3>
            {upcomingEvents.map(e => (
              <Card key={e.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="py-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{e.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(e.event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{e.start_time.slice(0, 5)}</span>
                    </div>
                  </div>
                  <Badge className={statusColor[e.status || 'pending'] || 'bg-muted text-muted-foreground'}>
                    {e.status || 'pending'}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {pastEvents.length > 0 && (
          <div className="space-y-3 opacity-70">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Past</h3>
            {pastEvents.slice(0, 5).map(e => (
              <Card key={e.id}>
                <CardContent className="py-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{e.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(e.event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <Badge variant="outline" className="text-muted-foreground">Past</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {events.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              <Calendar className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>No events yet. Submit your first event!</p>
              <Button asChild className="mt-4" variant="outline">
                <Link to="/submit-event">Submit an Event</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
