import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, XCircle, Clock, Eye, Loader2, Instagram, Twitter, Globe, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';

interface OrganizerProfile {
  id: string;
  user_id: string;
  display_name: string;
  org_type: string;
  bio: string | null;
  social_instagram: string | null;
  social_twitter: string | null;
  social_website: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive'; icon: any }> = {
  pending: { label: 'Pending', variant: 'secondary', icon: Clock },
  approved: { label: 'Approved', variant: 'default', icon: CheckCircle2 },
  rejected: { label: 'Rejected', variant: 'destructive', icon: XCircle },
};

export default function OrganisersList() {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<OrganizerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selected, setSelected] = useState<OrganizerProfile | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchProfiles = async () => {
    setLoading(true);
    let query = supabase.from('event_organizer_profiles' as any).select('*').order('created_at', { ascending: false });
    if (filter !== 'all') {
      query = query.eq('status', filter);
    }
    const { data, error } = await query;
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setProfiles((data as any[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchProfiles(); }, [filter]);

  const updateStatus = async (id: string, userId: string, status: 'approved' | 'rejected') => {
    setUpdating(true);
    try {
      // Update profile status
      const { error } = await supabase
        .from('event_organizer_profiles' as any)
        .update({ status, admin_notes: adminNotes || null } as any)
        .eq('id', id);
      if (error) throw error;

      if (status === 'approved') {
        // Grant event_organizer role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'event_organizer' as any });
        if (roleError && !roleError.message.includes('duplicate')) throw roleError;
      } else if (status === 'rejected') {
        // Remove event_organizer role if exists
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'event_organizer' as any);
      }

      toast({ title: `Application ${status}`, description: `The organiser application has been ${status}.` });
      setSelected(null);
      setAdminNotes('');
      fetchProfiles();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setUpdating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Event Organisers</h1>
          <p className="text-muted-foreground">Review and manage organiser applications</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
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
      ) : profiles.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No {filter !== 'all' ? filter : ''} organiser applications found.
        </div>
      ) : (
        <div className="space-y-3">
          {profiles.map(profile => {
            const sc = statusConfig[profile.status] || statusConfig.pending;
            const StatusIcon = sc.icon;
            return (
              <div key={profile.id} className="border rounded-xl p-5 bg-card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg truncate">{profile.display_name}</h3>
                      <Badge variant={sc.variant} className="shrink-0">
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {sc.label}
                      </Badge>
                      <Badge variant="outline" className="shrink-0 capitalize">{profile.org_type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{profile.bio || 'No bio provided'}</p>
                    <p className="text-xs text-muted-foreground mt-1">Applied {format(new Date(profile.created_at), 'dd MMM yyyy')}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => { setSelected(profile); setAdminNotes(profile.admin_notes || ''); }}>
                    <Eye className="h-4 w-4 mr-1" /> View
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={open => { if (!open) setSelected(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected?.display_name}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="font-medium text-muted-foreground">Status</span>
                  <p className="capitalize">{selected.status}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Type</span>
                  <p className="capitalize">{selected.org_type}</p>
                </div>
              </div>

              {selected.bio && (
                <div>
                  <span className="font-medium text-muted-foreground">Bio</span>
                  <p className="mt-1">{selected.bio}</p>
                </div>
              )}

              <div className="border-t pt-3">
                <span className="font-medium text-muted-foreground">Social Links</span>
                <div className="flex flex-wrap gap-3 mt-2">
                  {selected.social_instagram && (
                    <a href={selected.social_instagram.startsWith('http') ? selected.social_instagram : `https://instagram.com/${selected.social_instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                      <Instagram className="h-4 w-4" /> {selected.social_instagram}
                    </a>
                  )}
                  {selected.social_twitter && (
                    <a href={selected.social_twitter.startsWith('http') ? selected.social_twitter : `https://x.com/${selected.social_twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                      <Twitter className="h-4 w-4" /> {selected.social_twitter}
                    </a>
                  )}
                  {selected.social_website && (
                    <a href={selected.social_website.startsWith('http') ? selected.social_website : `https://${selected.social_website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                      <Globe className="h-4 w-4" /> {selected.social_website}
                    </a>
                  )}
                  {!selected.social_instagram && !selected.social_twitter && !selected.social_website && (
                    <p className="text-muted-foreground">No social links provided</p>
                  )}
                </div>
              </div>

              {selected.status === 'pending' && (
                <div className="border-t pt-3 space-y-3">
                  <div>
                    <span className="font-medium text-muted-foreground">Admin Notes (optional)</span>
                    <Textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} placeholder="Add notes about your decision..." className="mt-1" />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => updateStatus(selected.id, selected.user_id, 'approved')} disabled={updating} className="flex-1">
                      <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                    </Button>
                    <Button variant="destructive" onClick={() => updateStatus(selected.id, selected.user_id, 'rejected')} disabled={updating} className="flex-1">
                      <XCircle className="h-4 w-4 mr-1" /> Reject
                    </Button>
                  </div>
                </div>
              )}

              {selected.admin_notes && selected.status !== 'pending' && (
                <div className="border-t pt-3">
                  <span className="font-medium text-muted-foreground">Admin Notes</span>
                  <p className="mt-1">{selected.admin_notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
