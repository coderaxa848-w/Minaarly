import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bug, CheckCircle2, Clock, Image, Video, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';

interface BugReport {
  id: string;
  category: string | null;
  description: string | null;
  mosque_name: string | null;
  screenshot_1_url: string | null;
  screenshot_2_url: string | null;
  video_url: string | null;
  resolved: boolean;
  created_at: string;
  updated_at: string;
  user_id: string | null;
}

export default function BugReportsList() {
  const [reports, setReports] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    const { data, error } = await supabase
      .from('issue_report_form')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bug reports:', error);
    } else {
      setReports(data || []);
    }
    setLoading(false);
  }

  async function toggleResolved(id: string, currentStatus: boolean) {
    const { error } = await supabase
      .from('issue_report_form')
      .update({ resolved: !currentStatus })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    } else {
      setReports(prev => prev.map(r => r.id === id ? { ...r, resolved: !currentStatus } : r));
      toast({ title: 'Updated', description: `Report marked as ${!currentStatus ? 'resolved' : 'open'}` });
    }
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const filtered = reports.filter(r => {
    if (filter === 'open') return !r.resolved;
    if (filter === 'resolved') return r.resolved;
    return true;
  });

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
            <div className="p-2.5 rounded-xl bg-red-500/10">
              <Bug className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Bug Reports</h1>
              <p className="text-sm text-muted-foreground">{reports.filter(r => !r.resolved).length} unresolved reports</p>
            </div>
          </div>
          <div className="flex gap-2">
            {(['all', 'open', 'resolved'] as const).map(f => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(f)}
                className="capitalize"
              >
                {f}
              </Button>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Mosque</TableHead>
                <TableHead>Media</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    No bug reports found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(report => (
                  <>
                    <TableRow key={report.id} className="cursor-pointer" onClick={() => setExpandedId(expandedId === report.id ? null : report.id)}>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {report.category || 'General'}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {report.description || 'No description'}
                      </TableCell>
                      <TableCell>{report.mosque_name || '—'}</TableCell>
                      <TableCell>
                        <div className="flex gap-1.5">
                          {(report.screenshot_1_url || report.screenshot_2_url) && (
                            <Image className="h-4 w-4 text-blue-500" />
                          )}
                          {report.video_url && (
                            <Video className="h-4 w-4 text-purple-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={report.resolved
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                          : 'bg-red-500/10 text-red-600 border-red-500/20'
                        }>
                          {report.resolved ? 'Resolved' : 'Open'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{formatDate(report.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant={report.resolved ? 'outline' : 'default'}
                            onClick={(e) => { e.stopPropagation(); toggleResolved(report.id, report.resolved); }}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            {report.resolved ? 'Reopen' : 'Resolve'}
                          </Button>
                          {expandedId === report.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedId === report.id && (
                      <TableRow key={`${report.id}-detail`}>
                        <TableCell colSpan={7} className="bg-slate-50 dark:bg-slate-700/20">
                          <div className="p-4 space-y-4">
                            <div>
                              <h4 className="text-sm font-semibold text-foreground mb-1">Full Description</h4>
                              <p className="text-sm text-muted-foreground">{report.description || 'No description provided'}</p>
                            </div>
                            {(report.screenshot_1_url || report.screenshot_2_url || report.video_url) && (
                              <div>
                                <h4 className="text-sm font-semibold text-foreground mb-2">Attachments</h4>
                                <div className="flex gap-4 flex-wrap">
                                  {report.screenshot_1_url && (
                                    <a href={report.screenshot_1_url} target="_blank" rel="noopener noreferrer">
                                      <img src={report.screenshot_1_url} alt="Screenshot 1" className="h-32 rounded-lg border object-cover" />
                                    </a>
                                  )}
                                  {report.screenshot_2_url && (
                                    <a href={report.screenshot_2_url} target="_blank" rel="noopener noreferrer">
                                      <img src={report.screenshot_2_url} alt="Screenshot 2" className="h-32 rounded-lg border object-cover" />
                                    </a>
                                  )}
                                  {report.video_url && (
                                    <a href={report.video_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-lg text-purple-600 text-sm font-medium">
                                      <Video className="h-4 w-4" /> View Video
                                    </a>
                                  )}
                                </div>
                              </div>
                            )}
                            <div className="flex gap-4 text-xs text-muted-foreground">
                              <span>Created: {formatDate(report.created_at)}</span>
                              <span>Updated: {formatDate(report.updated_at)}</span>
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
