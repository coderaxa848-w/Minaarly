import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, MapPin, CheckCircle, XCircle, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Mosque {
  id: string;
  name: string;
  city: string;
  postcode: string;
  is_verified: boolean;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

export default function MosquesList() {
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [verifiedFilter, setVerifiedFilter] = useState<string>('all');
  const [cities, setCities] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 50;

  useEffect(() => {
    fetchMosques();
    fetchCities();
  }, [searchQuery, cityFilter, verifiedFilter, page]);

  async function fetchCities() {
    const { data } = await supabase
      .from('mosques')
      .select('city')
      .order('city');
    
    if (data) {
      const uniqueCities = [...new Set(data.map(m => m.city).filter(c => c && c.trim() !== ''))];
      setCities(uniqueCities);
    }
  }

  async function fetchMosques() {
    setLoading(true);
    try {
      let query = supabase
        .from('mosques')
        .select('id, name, city, postcode, is_verified, latitude, longitude, created_at', { count: 'exact' });

      // Apply search filter
      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,postcode.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`);
      }

      // Apply city filter
      if (cityFilter !== 'all') {
        query = query.eq('city', cityFilter);
      }

      // Apply verified filter
      if (verifiedFilter === 'verified') {
        query = query.eq('is_verified', true);
      } else if (verifiedFilter === 'unverified') {
        query = query.eq('is_verified', false);
      }

      // Apply pagination
      const from = page * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to).order('name');

      const { data, error, count } = await query;

      if (error) throw error;
      setMosques(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching mosques:', error);
      toast({
        title: 'Error',
        description: 'Failed to load mosques',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function toggleVerification(id: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from('mosques')
        .update({ is_verified: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      setMosques(mosques.map(m => 
        m.id === id ? { ...m, is_verified: !currentStatus } : m
      ));

      toast({
        title: 'Success',
        description: `Mosque ${!currentStatus ? 'verified' : 'unverified'}`,
      });
    } catch (error) {
      console.error('Error updating mosque:', error);
      toast({
        title: 'Error',
        description: 'Failed to update mosque',
        variant: 'destructive',
      });
    }
  }

  async function deleteMosque(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('mosques')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMosques(mosques.filter(m => m.id !== id));
      toast({
        title: 'Deleted',
        description: `${name} has been removed`,
      });
    } catch (error) {
      console.error('Error deleting mosque:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete mosque',
        variant: 'destructive',
      });
    }
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mosques</h1>
          <p className="text-muted-foreground">Manage all mosques ({totalCount.toLocaleString()} total)</p>
        </div>
        <Link to="/admin/mosques/new">
          <Button className="gradient-teal">
            <Plus className="h-4 w-4 mr-2" />
            Add Mosque
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, postcode, or city..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
            className="pl-10"
          />
        </div>
        <Select value={cityFilter} onValueChange={(v) => { setCityFilter(v); setPage(0); }}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Cities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {cities.slice(0, 50).map((city) => (
              <SelectItem key={city} value={city}>{city}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={verifiedFilter} onValueChange={(v) => { setVerifiedFilter(v); setPage(0); }}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="unverified">Unverified</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Postcode</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}>
                    <div className="h-10 bg-muted animate-pulse rounded" />
                  </TableCell>
                </TableRow>
              ))
            ) : mosques.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No mosques found
                </TableCell>
              </TableRow>
            ) : (
              mosques.map((mosque) => (
                <TableRow key={mosque.id}>
                  <TableCell className="font-medium">{mosque.name}</TableCell>
                  <TableCell>{mosque.city}</TableCell>
                  <TableCell>{mosque.postcode}</TableCell>
                  <TableCell>
                    {mosque.latitude && mosque.longitude ? (
                      <Badge variant="outline" className="text-green-600 border-green-300">
                        <MapPin className="h-3 w-3 mr-1" />
                        Geocoded
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-600 border-amber-300">
                        No coords
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {mosque.is_verified ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <XCircle className="h-3 w-3 mr-1" />
                        Unverified
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/admin/mosques/${mosque.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleVerification(mosque.id, mosque.is_verified)}>
                          {mosque.is_verified ? (
                            <>
                              <XCircle className="h-4 w-4 mr-2" />
                              Unverify
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Verify
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => deleteMosque(mosque.id, mosque.name)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {page * pageSize + 1} - {Math.min((page + 1) * pageSize, totalCount)} of {totalCount}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages - 1}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
