import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, CheckCircle2, XCircle, ChevronDown, ChevronUp, Circle, Eye, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface MosqueSubmission {
  id: string;
  submitted_by: string | null;
  submitted_by_name: string | null;
  submitted_by_email: string | null;
  submitted_at: string;
  seen: boolean;
  seen_at: string | null;
  seen_by: string | null;
  status: string;
  admin_notes: string | null;
  name: string;
  postcode: string | null;
  address: string | null;
  city: string | null;
  county: string | null;
  description: string | null;
  facilities: string[];
  languages: string[];
  madhab: string | null;
  website: string | null;
  email: string | null;
  social_links: any;
  contact_page: string | null;
  services: string[];
  ramadan_options: any;
  parking_options: any;
  created_at: string;
  updated_at: string;
}

export default function MosqueSubmissions() {
  const [submissions, setSubmissions] = useState<MosqueSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'under_review' | 'approved' | 'rejected'>('all');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState('');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  async function fetchSubmissions() {
    const { data, error } = await supabase
      .from('submitted_mosque_data')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching mosque submissions:', error);
    } else {
      setSubmissions((data as unknown as MosqueSubmission[]) || []);
    }
    setLoading(false);
  }

  async function markAsSeen(id: string) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('submitted_mosque_data')
      .update({ 
        seen: true,
        seen_at: new Date().toISOString(),
        seen_by: user?.id
      } as never)
      .eq('id', id);

    if (!error) {
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, seen: true } : s));
    }
  }

  async function updateStatus(id: string, newStatus: 'under_review' | 'approved' | 'rejected') {
    const { error } = await supabase
      .from('submitted_mosque_data')
      .update({ status: newStatus } as never)
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    } else {
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
      toast({ title: 'Updated', description: `Submission marked as ${newStatus.replace('_', ' ')}` });
      
      // If approved, create the mosque in the main table
      if (newStatus === 'approved') {
        const submission = submissions.find(s => s.id === id);
        if (submission) {
          await createMosque(submission);
        }
      }
    }
  }

  async function createMosque(submission: MosqueSubmission) {
    // Generate slug from name
    const slug = submission.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    const { error } = await supabase
      .from('mosques')
      .insert({
        name: submission.name,
        slug: `${slug}-${Date.now()}`, // Ensure uniqueness
        postcode: submission.postcode || '',
        address: submission.address || '',
        city: submission.city || '',
        county: submission.county,
        description: submission.description,
        facilities: submission.facilities,
        languages: submission.languages,
        madhab: submission.madhab,
        website: submission.website,
        email: submission.email,
        social_links: submission.social_links,
        contact_page: submission.contact_page,
        services: submission.services,
        is_verified: false
      } as never);

    if (error) {
      console.error('Error creating mosque:', error);
      toast({ title: 'Warning', description: 'Submission approved but failed to create mosque entry', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Mosque created successfully' });
    }
  }

  async function saveAdminNotes(id: string) {
    const { error } = await supabase
      .from('submitted_mosque_data')
      .update({ admin_notes: notesDraft } as never)
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to save notes', variant: 'destructive' });
    } else {
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, admin_notes: notesDraft } : s));
      setEditingNotesId(null);
      setNotesDraft('');
      toast({ title: 'Saved', description: 'Admin notes updated' });
    }
  }

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'rejected': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'under_review': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default: return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
    }
  };

  const filtered = submissions.filter(s => {
    if (filter === 'pending') return s.status === 'pending';
    if (filter === 'under_review') return s.status === 'under_review';
    if (filter === 'approved') return s.status === 'approved';
    if (filter === 'rejected') return s.status === 'rejected';
    return true;
  });

  const pendingCount = submissions.filter(s => s.status === 'pending').length;
  const unseenCount = submissions.filter(s => !s.seen).length;

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10">
              <Building2 className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Mosque Submissions</h1>
              <p className="text-sm text-muted-foreground">
                {pendingCount} pending • {unseenCount} new
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'pending', 'under_review', 'approved', 'rejected'] as const).map(f => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(f)}
                className="capitalize"
              >
                {f.replace('_', ' ')}
                {f === 'pending' && pendingCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-white/20 rounded-full">{pendingCount}</span>
                )}
              </Button>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mosque Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Submitted By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    No mosque submissions found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(submission => (
                  <>
                    <TableRow 
                      key={submission.id} 
                      className="cursor-pointer" 
                      onClick={() => {
                        setExpandedId(expandedId === submission.id ? null : submission.id);
                        if (!submission.seen) markAsSeen(submission.id);
                      }}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {!submission.seen && (
                            <Circle className="h-2.5 w-2.5 fill-blue-500 text-blue-500" />
                          )}
                          <span className="font-medium">{submission.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          {submission.city || submission.postcode || '—'}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {submission.submitted_by_name || submission.submitted_by_email || 'Anonymous'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(submission.status)}>
                          {submission.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(submission.submitted_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {(submission.status === 'pending' || submission.status === 'under_review') && (
                            <>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="default"
                                    className="bg-emerald-500 hover:bg-emerald-600"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                    Approve
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Approve Mosque Submission?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will approve the submission and create a new mosque entry for "{submission.name}".
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-emerald-500 hover:bg-emerald-600"
                                      onClick={() => updateStatus(submission.id, 'approved')}
                                    >
                                      Approve & Create Mosque
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-500 border-red-200 hover:bg-red-50"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <XCircle className="h-3.5 w-3.5 mr-1" />
                                    Reject
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Reject Submission?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will reject the mosque submission for "{submission.name}".
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-red-500 hover:bg-red-600"
                                      onClick={() => updateStatus(submission.id, 'rejected')}
                                    >
                                      Reject
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                          {submission.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => { e.stopPropagation(); updateStatus(submission.id, 'under_review'); }}
                            >
                              Mark Under Review
                            </Button>
                          )}
                          {expandedId === submission.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedId === submission.id && (
                      <TableRow key={`${submission.id}-detail`}>
                        <TableCell colSpan={6} className="bg-slate-50 dark:bg-slate-700/20">
                          <div className="p-4 space-y-4">
                            {/* Mosque Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-sm font-semibold text-foreground mb-2">Mosque Information</h4>
                                <div className="space-y-2 text-sm">
                                  <p><span className="text-muted-foreground">Name:</span> {submission.name}</p>
                                  <p><span className="text-muted-foreground">Address:</span> {submission.address || '—'}</p>
                                  <p><span className="text-muted-foreground">City:</span> {submission.city || '—'}</p>
                                  <p><span className="text-muted-foreground">Postcode:</span> {submission.postcode || '—'}</p>
                                  <p><span className="text-muted-foreground">County:</span> {submission.county || '—'}</p>
                                  <p><span className="text-muted-foreground">Madhab:</span> {submission.madhab || '—'}</p>
                                </div>
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-foreground mb-2">Contact & Links</h4>
                                <div className="space-y-2 text-sm">
                                  <p><span className="text-muted-foreground">Email:</span> {submission.email || '—'}</p>
                                  <p><span className="text-muted-foreground">Website:</span> {submission.website ? <a href={submission.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{submission.website}</a> : '—'}</p>
                                  <p><span className="text-muted-foreground">Contact Page:</span> {submission.contact_page || '—'}</p>
                                </div>
                              </div>
                            </div>

                            {submission.description && (
                              <div>
                                <h4 className="text-sm font-semibold text-foreground mb-1">Description</h4>
                                <p className="text-sm text-muted-foreground">{submission.description}</p>
                              </div>
                            )}

                            {submission.facilities?.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold text-foreground mb-2">Facilities</h4>
                                <div className="flex flex-wrap gap-1.5">
                                  {submission.facilities.map((f, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">{f}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {submission.services?.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold text-foreground mb-2">Services</h4>
                                <div className="flex flex-wrap gap-1.5">
                                  {submission.services.map((s, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">{s}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Admin Notes Section */}
                            <div className="border-t pt-4">
                              <h4 className="text-sm font-semibold text-foreground mb-2">Admin Notes</h4>
                              {editingNotesId === submission.id ? (
                                <div className="space-y-2">
                                  <Textarea
                                    value={notesDraft}
                                    onChange={(e) => setNotesDraft(e.target.value)}
                                    placeholder="Add notes about this submission..."
                                    className="min-h-[80px]"
                                  />
                                  <div className="flex gap-2">
                                    <Button size="sm" onClick={() => saveAdminNotes(submission.id)}>
                                      Save Notes
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => { setEditingNotesId(null); setNotesDraft(''); }}>
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  {submission.admin_notes ? (
                                    <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border text-sm text-foreground">
                                      {submission.admin_notes}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-muted-foreground italic">No admin notes yet</p>
                                  )}
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="mt-2"
                                    onClick={() => { setEditingNotesId(submission.id); setNotesDraft(submission.admin_notes || ''); }}
                                  >
                                    {submission.admin_notes ? 'Edit Notes' : 'Add Notes'}
                                  </Button>
                                </div>
                              )}
                            </div>

                            <div className="flex gap-4 text-xs text-muted-foreground border-t pt-4">
                              <span>Submitted: {formatDate(submission.submitted_at)}</span>
                              {submission.submitted_by_email && <span>By: {submission.submitted_by_email}</span>}
                              {submission.seen_at && <span>Seen: {formatDate(submission.seen_at)}</span>}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>
    </div>
  );
}
