import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, ClipboardList, Users, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalMosques: number;
  verifiedMosques: number;
  pendingClaims: number;
  totalUsers: number;
  totalEvents: number;
  upcomingEvents: number;
}

interface RecentClaim {
  id: string;
  mosque_name: string;
  claimant_name: string;
  claimant_role: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalMosques: 0,
    verifiedMosques: 0,
    pendingClaims: 0,
    totalUsers: 0,
    totalEvents: 0,
    upcomingEvents: 0,
  });
  const [recentClaims, setRecentClaims] = useState<RecentClaim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch mosque counts
        const { count: totalMosques } = await supabase
          .from('mosques')
          .select('*', { count: 'exact', head: true });

        const { count: verifiedMosques } = await supabase
          .from('mosques')
          .select('*', { count: 'exact', head: true })
          .eq('is_verified', true);

        // Fetch pending claims count
        const { count: pendingClaims } = await supabase
          .from('mosque_admins')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        // Fetch user count
        const { count: totalUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Fetch event counts
        const { count: totalEvents } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true });

        const today = new Date().toISOString().split('T')[0];
        const { count: upcomingEvents } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .gte('event_date', today)
          .eq('is_archived', false);

        setStats({
          totalMosques: totalMosques || 0,
          verifiedMosques: verifiedMosques || 0,
          pendingClaims: pendingClaims || 0,
          totalUsers: totalUsers || 0,
          totalEvents: totalEvents || 0,
          upcomingEvents: upcomingEvents || 0,
        });

        // Fetch recent pending claims with mosque name
        const { data: claims } = await supabase
          .from('mosque_admins')
          .select(`
            id,
            claimant_name,
            claimant_role,
            created_at,
            mosques (name)
          `)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(5);

        if (claims) {
          setRecentClaims(
            claims.map((c: any) => ({
              id: c.id,
              mosque_name: c.mosques?.name || 'Unknown',
              claimant_name: c.claimant_name || 'Unknown',
              claimant_role: c.claimant_role || 'Unknown',
              created_at: c.created_at,
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Mosques',
      value: stats.totalMosques,
      description: `${stats.verifiedMosques} verified`,
      icon: Building2,
      href: '/admin/mosques',
      color: 'text-primary',
    },
    {
      title: 'Pending Claims',
      value: stats.pendingClaims,
      description: 'Awaiting review',
      icon: ClipboardList,
      href: '/admin/claims',
      color: 'text-amber-500',
      badge: stats.pendingClaims > 0,
    },
    {
      title: 'Registered Users',
      value: stats.totalUsers,
      description: 'Total accounts',
      icon: Users,
      href: '/admin/users',
      color: 'text-blue-500',
    },
    {
      title: 'Events',
      value: stats.totalEvents,
      description: `${stats.upcomingEvents} upcoming`,
      icon: Calendar,
      href: '/admin/events',
      color: 'text-green-500',
    },
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to the Minaarly admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Link key={stat.title} to={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
                  {stat.badge && (
                    <Badge variant="destructive" className="h-5">
                      Action needed
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Claims */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Pending Claims</CardTitle>
                <CardDescription>Recent mosque claim requests</CardDescription>
              </div>
              <Link to="/admin/claims">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentClaims.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ClipboardList className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No pending claims</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentClaims.map((claim) => (
                  <div key={claim.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div>
                      <p className="font-medium text-sm">{claim.mosque_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {claim.claimant_name} • {claim.claimant_role}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-amber-600 border-amber-300">
                      Pending
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/admin/mosques/new" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Building2 className="h-4 w-4 mr-2" />
                Add New Mosque
              </Button>
            </Link>
            <Link to="/admin/claims" className="block">
              <Button variant="outline" className="w-full justify-start">
                <ClipboardList className="h-4 w-4 mr-2" />
                Review Claims
                {stats.pendingClaims > 0 && (
                  <Badge variant="destructive" className="ml-auto">
                    {stats.pendingClaims}
                  </Badge>
                )}
              </Button>
            </Link>
            <Link to="/admin/users" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
            </Link>
            <Link to="/map" className="block">
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Public Map
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
