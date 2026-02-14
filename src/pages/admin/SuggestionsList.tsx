import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, CheckCircle2, ChevronDown, ChevronUp, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';

interface Suggestion {
  id: string;
  area: string | null;
  description: string | null;
  user_email: string | null;
  picture_1: string | null;
  picture_2: string | null;
  accepted: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export default function SuggestionsList() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted'>('all');

  useEffect(() => {
    fetchSuggestions();
  }, []);

  async function fetchSuggestions() {
    const { data, error } = await supabase
      .from('user_suggestions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching suggestions:', error);
    } else {
      setSuggestions(data || []);
    }
    setLoading(false);
  }

  async function toggleAccepted(id: string, currentStatus: boolean | null) {
    const { error } = await supabase
      .from('user_suggestions')
      .update({ accepted: !currentStatus })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    } else {
      setSuggestions(prev => prev.map(s => s.id === id ? { ...s, accepted: !currentStatus } : s));
      toast({ title: 'Updated', description: `Suggestion ${!currentStatus ? 'accepted' : 'unmarked'}` });
    }
  }

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  const filtered = suggestions.filter(s => {
    if (filter === 'pending') return !s.accepted;
    if (filter === 'accepted') return s.accepted;
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
            <div className="p-2.5 rounded-xl bg-yellow-500/10">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">User Suggestions</h1>
              <p className="text-sm text-muted-foreground">{suggestions.filter(s => !s.accepted).length} pending suggestions</p>
            </div>
          </div>
          <div className="flex gap-2">
            {(['all', 'pending', 'accepted'] as const).map(f => (
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
                <TableHead>Area</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>User Email</TableHead>
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
                    No suggestions found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(suggestion => (
                  <>
                    <TableRow key={suggestion.id} className="cursor-pointer" onClick={() => setExpandedId(expandedId === suggestion.id ? null : suggestion.id)}>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {suggestion.area || 'General'}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {suggestion.description || 'No description'}
                      </TableCell>
                      <TableCell className="text-sm">{suggestion.user_email || '—'}</TableCell>
                      <TableCell>
                        {(suggestion.picture_1 || suggestion.picture_2) && (
                          <Image className="h-4 w-4 text-blue-500" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={suggestion.accepted
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                          : 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
                        }>
                          {suggestion.accepted ? 'Accepted' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{formatDate(suggestion.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant={suggestion.accepted ? 'outline' : 'default'}
                            onClick={(e) => { e.stopPropagation(); toggleAccepted(suggestion.id, suggestion.accepted); }}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            {suggestion.accepted ? 'Unmark' : 'Accept'}
                          </Button>
                          {expandedId === suggestion.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedId === suggestion.id && (
                      <TableRow key={`${suggestion.id}-detail`}>
                        <TableCell colSpan={7} className="bg-slate-50 dark:bg-slate-700/20">
                          <div className="p-4 space-y-4">
                            <div>
                              <h4 className="text-sm font-semibold text-foreground mb-1">Full Description</h4>
                              <p className="text-sm text-muted-foreground">{suggestion.description || 'No description provided'}</p>
                            </div>
                            {(suggestion.picture_1 || suggestion.picture_2) && (
                              <div>
                                <h4 className="text-sm font-semibold text-foreground mb-2">Attachments</h4>
                                <div className="flex gap-4 flex-wrap">
                                  {suggestion.picture_1 && (
                                    <a href={suggestion.picture_1} target="_blank" rel="noopener noreferrer">
                                      <img src={suggestion.picture_1} alt="Attachment 1" className="h-32 rounded-lg border object-cover" />
                                    </a>
                                  )}
                                  {suggestion.picture_2 && (
                                    <a href={suggestion.picture_2} target="_blank" rel="noopener noreferrer">
                                      <img src={suggestion.picture_2} alt="Attachment 2" className="h-32 rounded-lg border object-cover" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            )}
                            <div className="flex gap-4 text-xs text-muted-foreground">
                              <span>Created: {formatDate(suggestion.created_at)}</span>
                              <span>Updated: {formatDate(suggestion.updated_at)}</span>
                              {suggestion.user_email && <span>Email: {suggestion.user_email}</span>}
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
