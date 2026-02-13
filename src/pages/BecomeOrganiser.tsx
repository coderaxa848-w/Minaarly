import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2, Instagram, Globe, Twitter } from 'lucide-react';

export default function BecomeOrganiser() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [submitting, setSubmitting] = useState(false);
  const [existingProfile, setExistingProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    display_name: '',
    org_type: 'individual',
    bio: '',
    social_instagram: '',
    social_twitter: '',
    social_website: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      // Check for existing application
      const { data } = await supabase
        .from('event_organizer_profiles' as any)
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (data) setExistingProfile(data);

      // Pre-fill name from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.full_name) {
        setForm(f => ({ ...f, display_name: profile.full_name || '' }));
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (form.bio.length > 500) {
      toast({ title: 'Bio too long', description: 'Please keep your bio under 500 characters.', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('event_organizer_profiles' as any).insert({
        user_id: user.id,
        display_name: form.display_name.trim(),
        org_type: form.org_type,
        bio: form.bio.trim() || null,
        social_instagram: form.social_instagram.trim() || null,
        social_twitter: form.social_twitter.trim() || null,
        social_website: form.social_website.trim() || null,
      } as any);

      if (error) throw error;
      setExistingProfile({ status: 'pending' });
    } catch (err: any) {
      toast({ title: 'Submission failed', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
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

  if (existingProfile) {
    const statusMessages: Record<string, { title: string; desc: string }> = {
      pending: { title: 'Application Under Review', desc: 'We\'ve received your application and our team is reviewing it. You\'ll be notified once a decision is made.' },
      approved: { title: 'You\'re an Event Organiser! 🎉', desc: 'Your application has been approved. You can now submit unlimited events that go live immediately.' },
      rejected: { title: 'Application Not Approved', desc: 'Unfortunately your application wasn\'t approved this time. You can still submit events as a regular user (1 per week).' },
    };
    const msg = statusMessages[existingProfile.status] || statusMessages.pending;

    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-3">{msg.title}</h1>
          <p className="text-muted-foreground max-w-md mb-6">{msg.desc}</p>
          <div className="flex gap-3">
            <Button onClick={() => navigate('/submit-event')}>Submit an Event</Button>
            <Button variant="outline" onClick={() => navigate('/')}>Go Home</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-2xl py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Become an Event Organiser</h1>
          <p className="text-muted-foreground">
            Apply to become a verified event organiser. Once approved, your events will go live instantly and your profile will appear alongside your events.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">About You</h2>

            <div>
              <Label htmlFor="display_name">Display Name *</Label>
              <Input
                id="display_name"
                required
                value={form.display_name}
                onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
                placeholder="Your name or organisation name"
                maxLength={100}
              />
            </div>

            <div>
              <Label>Organisation Type *</Label>
              <RadioGroup value={form.org_type} onValueChange={v => setForm(f => ({ ...f, org_type: v }))} className="flex gap-6 mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="individual" id="individual" />
                  <Label htmlFor="individual" className="font-normal cursor-pointer">Individual</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="company" id="company" />
                  <Label htmlFor="company" className="font-normal cursor-pointer">Company / Charity</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="bio">Tell us about yourself / your organisation</Label>
              <Textarea
                id="bio"
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                placeholder="What kind of events do you organise? Tell us a bit about yourself..."
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1">{form.bio.length}/500 characters</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">Social Links (Optional)</h2>
            <p className="text-sm text-muted-foreground">These will appear on your events so people can find you.</p>

            <div>
              <Label htmlFor="social_instagram" className="flex items-center gap-2">
                <Instagram className="h-4 w-4" /> Instagram
              </Label>
              <Input
                id="social_instagram"
                value={form.social_instagram}
                onChange={e => setForm(f => ({ ...f, social_instagram: e.target.value }))}
                placeholder="@yourhandle or full URL"
              />
            </div>

            <div>
              <Label htmlFor="social_twitter" className="flex items-center gap-2">
                <Twitter className="h-4 w-4" /> Twitter / X
              </Label>
              <Input
                id="social_twitter"
                value={form.social_twitter}
                onChange={e => setForm(f => ({ ...f, social_twitter: e.target.value }))}
                placeholder="@yourhandle or full URL"
              />
            </div>

            <div>
              <Label htmlFor="social_website" className="flex items-center gap-2">
                <Globe className="h-4 w-4" /> Website
              </Label>
              <Input
                id="social_website"
                value={form.social_website}
                onChange={e => setForm(f => ({ ...f, social_website: e.target.value }))}
                placeholder="https://yoursite.com"
              />
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</> : 'Submit Application'}
          </Button>
        </form>
      </div>
    </Layout>
  );
}
