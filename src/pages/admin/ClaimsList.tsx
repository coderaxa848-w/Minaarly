import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, Mail, Phone, User, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Claim {
  id: string;
  mosque_id: string;
  user_id: string | null;
  claimant_name: string | null;
  claimant_email: string | null;
  claimant_phone: string | null;
  claimant_role: string | null;
  status: 'pending' | 'approved' | 'rejected';
  notes: string | null;
  created_at: string;
  mosque: {
    name: string;
    city: string;
    postcode: string;
  } | null;
}

export default function ClaimsList() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; claimId: string | null }>({
    open: false,
    claimId: null,
  });
  const [rejectNotes, setRejectNotes] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    fetchClaims();
  }, [filter]);

  async function fetchClaims() {
    setLoading(true);
    try {
      let query = supabase
        .from('mosque_admins')
        .select(`
          *,
          mosques (name, city, postcode)
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      setClaims(
        (data || []).map((claim: any) => ({
          ...claim,
          mosque: claim.mosques,
        }))
      );
    } catch (error) {
      console.error('Error fetching claims:', error);
      toast({
        title: 'Error',
        description: 'Failed to load claims',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function approveClaim(claimId: string) {
    setProcessingId(claimId);
    try {
      const { error } = await supabase
        .from('mosque_admins')
        .update({ status: 'approved' })
        .eq('id', claimId);

      if (error) throw error;

      setClaims(claims.map(c => 
        c.id === claimId ? { ...c, status: 'approved' as const } : c
      ));

      toast({
        title: 'Approved',
        description: 'Claim has been approved. The user is now a mosque admin.',
      });
    } catch (error) {
      console.error('Error approving claim:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve claim',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  }

  async function rejectClaim() {
    if (!rejectDialog.claimId) return;

    setProcessingId(rejectDialog.claimId);
    try {
      const { error } = await supabase
        .from('mosque_admins')
        .update({ 
          status: 'rejected',
          notes: rejectNotes || null,
        })
        .eq('id', rejectDialog.claimId);

      if (error) throw error;

      setClaims(claims.map(c => 
        c.id === rejectDialog.claimId ? { ...c, status: 'rejected' as const, notes: rejectNotes } : c
      ));

      toast({
        title: 'Rejected',
        description: 'Claim has been rejected.',
      });

      setRejectDialog({ open: false, claimId: null });
      setRejectNotes('');
    } catch (error) {
      console.error('Error rejecting claim:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject claim',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-amber-600 border-amber-300"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return null;
    }
  }

  const counts = {
    all: claims.length,
    pending: claims.filter(c => c.status === 'pending').length,
    approved: claims.filter(c => c.status === 'approved').length,
    rejected: claims.filter(c => c.status === 'rejected').length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Mosque Claims</h1>
        <p className="text-muted-foreground">Review and manage mosque ownership claims</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['pending', 'approved', 'rejected', 'all'] as const).map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(status)}
            className={filter === status ? 'gradient-teal' : ''}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status !== 'all' && (
              <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                {counts[status]}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Claims List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-24 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : claims.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No claims found</p>
            <p className="text-muted-foreground">
              {filter === 'pending' 
                ? 'No pending claims to review'
                : `No ${filter} claims`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <Card key={claim.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {claim.mosque?.name || 'Unknown Mosque'}
                    </CardTitle>
                    <CardDescription>
                      {claim.mosque?.city}, {claim.mosque?.postcode}
                    </CardDescription>
                  </div>
                  {getStatusBadge(claim.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{claim.claimant_name || 'Unknown'}</span>
                    {claim.claimant_role && (
                      <Badge variant="secondary" className="text-xs capitalize">
                        {claim.claimant_role.replace(/_/g, ' ')}
                      </Badge>
                    )}
                  </div>
                  {claim.claimant_email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${claim.claimant_email}`} className="text-primary hover:underline">
                        {claim.claimant_email}
                      </a>
                    </div>
                  )}
                  {claim.claimant_phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${claim.claimant_phone}`} className="text-primary hover:underline">
                        {claim.claimant_phone}
                      </a>
                    </div>
                  )}
                </div>

                <div className="text-xs text-muted-foreground mb-4">
                  Submitted: {new Date(claim.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>

                {claim.notes && (
                  <div className="bg-muted p-3 rounded-lg text-sm mb-4">
                    <strong>Notes:</strong> {claim.notes}
                  </div>
                )}

                {claim.status === 'pending' && (
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRejectDialog({ open: true, claimId: claim.id })}
                      disabled={processingId === claim.id}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => approveClaim(claim.id)}
                      disabled={processingId === claim.id}
                      className="gradient-teal"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ open, claimId: open ? rejectDialog.claimId : null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Claim</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this claim? You can add a reason below.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection (optional)"
            value={rejectNotes}
            onChange={(e) => setRejectNotes(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, claimId: null })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={rejectClaim} disabled={processingId !== null}>
              Reject Claim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
