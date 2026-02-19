import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, XCircle, ChevronDown, ChevronUp, Circle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
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

interface PrayerTimeSubmission {
  id: string;
  masjid_id: string;
  masjid_name: string | null;
  month: number;
  year: number;
  monthly_times: any;
  source: string | null;
  status: string | null;
  created_by: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function PrayerTimeSubmissions() {
  const [submissions, setSubmissions] = useState<PrayerTimeSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  async function fetchSubmissions() {
    const { data, error } = await supabase
      .from('masjid_salah_times_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching prayer time submissions:', error);
    } else {
      setSubmissions((data as unknown as PrayerTimeSubmission[]) || []);
    }
    setLoading(false);
  }

  async function updateStatus(id: string, newStatus: 'approved' | 'rejected') {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('masjid_salah_times_submissions')
      .update({ 
        status: newStatus,
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString()
      } as never)
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    } else {
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
      toast({ title: 'Updated', description: `Submission ${newStatus}` });
      
      // If approved, copy to the main prayer times table
      if (newStatus === 'approved') {
        const submission = submissions.find(s => s.id === id);
        if (submission) {
          await copyToMainTable(submission);
        }
      }
    }
  }

  async function copyToMainTable(submission: PrayerTimeSubmission) {
    // Check if entry exists for this mosque/month/year
    const { data: existing } = await supabase
      .from('masjid_salah_times_monthly')
      .select('id')
      .eq('masjid_id', submission.masjid_id)
      .eq('month', submission.month)
      .eq('year', submission.year)
      .single();

    if (existing) {
      // Update existing
      await supabase
        .from('masjid_salah_times_monthly')
        .update({
          monthly_times: submission.monthly_times,
          source: submission.source,
          updated_at: new Date().toISOString()
        } as never)
        .eq('id', existing.id);
    } else {
      // Insert new
      await supabase
        .from('masjid_salah_times_monthly')
        .insert({
          masjid_id: submission.masjid_id,
          masjid_name: submission.masjid_name,
          month: submission.month,
          year: submission.year,
          monthly_times: submission.monthly_times,
          source: submission.source,
          created_by: submission.created_by
        } as never);
    }
  }

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'approved': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'rejected': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
    }
  };

  const filtered = submissions.filter(s => {
    if (filter === 'pending') return s.status === 'pending';
    if (filter === 'approved') return s.status === 'approved';
    if (filter === 'rejected') return s.status === 'rejected';
    return true;
  });

  const pendingCount = submissions.filter(s => s.status === 'pending').length;

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
            <div className="p-2.5 rounded-xl bg-blue-500/10">
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Prayer Time Submissions</h1>
              <p className="text-sm text-muted-foreground">{pendingCount} pending submissions</p>
            </div>
          </div>
          <div className="flex gap-2">
            {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(f)}
                className="capitalize"
              >
                {f}
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
                <TableHead>Mosque</TableHead>
                <TableHead>Month/Year</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    No prayer time submissions found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(submission => (
                  <>
                    <TableRow 
                      key={submission.id} 
                      className="cursor-pointer" 
                      onClick={() => setExpandedId(expandedId === submission.id ? null : submission.id)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {submission.status === 'pending' && (
                            <Circle className="h-2.5 w-2.5 fill-blue-500 text-blue-500" />
                          )}
                          <span className="font-medium">{submission.masjid_name || 'Unknown Mosque'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {monthNames[submission.month - 1]} {submission.year}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize text-sm text-muted-foreground">
                        {submission.source?.replace('_', ' ') || 'manual'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(submission.status)}>
                          {submission.status || 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(submission.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {submission.status === 'pending' && (
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
                                    <AlertDialogTitle>Approve Submission?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will approve the prayer times and copy them to the main prayer times table for {submission.masjid_name}.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-emerald-500 hover:bg-emerald-600"
                                      onClick={() => updateStatus(submission.id, 'approved')}
                                    >
                                      Approve
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
                                      This will reject the prayer time submission from {submission.masjid_name}.
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
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => { e.stopPropagation(); setExpandedId(expandedId === submission.id ? null : submission.id); }}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            View
                          </Button>
                          {expandedId === submission.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedId === submission.id && (
                      <TableRow key={`${submission.id}-detail`}>
                        <TableCell colSpan={6} className="bg-slate-50 dark:bg-slate-700/20">
                          <div className="p-4 space-y-4">
                            <div>
                              <h4 className="text-sm font-semibold text-foreground mb-2">Prayer Times Data</h4>
                              <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border max-h-64 overflow-auto">
                                <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                                  {JSON.stringify(submission.monthly_times, null, 2)}
                                </pre>
                              </div>
                            </div>
                            <div className="flex gap-4 text-xs text-muted-foreground">
                              <span>Created: {formatDate(submission.created_at)}</span>
                              {submission.reviewed_at && <span>Reviewed: {formatDate(submission.reviewed_at)}</span>}
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
