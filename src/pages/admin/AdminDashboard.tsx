import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Building2, 
  ClipboardList, 
  Users, 
  Calendar, 
  TrendingUp, 
  Upload,
  ArrowRight,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Activity,
  MapPin,
  BarChart3,
  Zap,
  Bug,
  Lightbulb
} from 'lucide-react';
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
  openBugReports: number;
  pendingSuggestions: number;
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
    openBugReports: 0,
    pendingSuggestions: 0,
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

        // Fetch bug report count (unresolved)
        const { count: openBugReports } = await supabase
          .from('issue_report_form')
          .select('*', { count: 'exact', head: true })
          .eq('resolved', false);

        // Fetch suggestion count (not accepted)
        const { count: pendingSuggestions } = await supabase
          .from('user_suggestions')
          .select('*', { count: 'exact', head: true })
          .eq('accepted', false);

        setStats({
          totalMosques: totalMosques || 0,
          verifiedMosques: verifiedMosques || 0,
          pendingClaims: pendingClaims || 0,
          totalUsers: totalUsers || 0,
          totalEvents: totalEvents || 0,
          upcomingEvents: upcomingEvents || 0,
          openBugReports: openBugReports || 0,
          pendingSuggestions: pendingSuggestions || 0,
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
      gradient: 'from-emerald-500 to-teal-600',
      bgGradient: 'from-emerald-500/10 to-teal-500/5',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-500',
      trend: '+12%',
      trendUp: true,
    },
    {
      title: 'Pending Claims',
      value: stats.pendingClaims,
      description: 'Awaiting review',
      icon: ClipboardList,
      href: '/admin/claims',
      gradient: 'from-amber-500 to-orange-600',
      bgGradient: 'from-amber-500/10 to-orange-500/5',
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-500',
      badge: stats.pendingClaims > 0,
      urgent: stats.pendingClaims > 0,
    },
    {
      title: 'Registered Users',
      value: stats.totalUsers,
      description: 'Total accounts',
      icon: Users,
      href: '/admin/users',
      gradient: 'from-blue-500 to-cyan-600',
      bgGradient: 'from-blue-500/10 to-cyan-500/5',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      trend: '+8%',
      trendUp: true,
    },
    {
      title: 'Events',
      value: stats.totalEvents,
      description: `${stats.upcomingEvents} upcoming`,
      icon: Calendar,
      href: '/admin/events',
      gradient: 'from-violet-500 to-purple-600',
      bgGradient: 'from-violet-500/10 to-purple-500/5',
      iconBg: 'bg-violet-500/10',
      iconColor: 'text-violet-500',
      trend: '+5%',
      trendUp: true,
    },
    {
      title: 'Bug Reports',
      value: stats.openBugReports,
      description: 'Unresolved issues',
      icon: Bug,
      href: '/admin/bug-reports',
      gradient: 'from-red-500 to-rose-600',
      bgGradient: 'from-red-500/10 to-rose-500/5',
      iconBg: 'bg-red-500/10',
      iconColor: 'text-red-500',
      badge: stats.openBugReports > 0,
      urgent: stats.openBugReports > 0,
    },
    {
      title: 'Suggestions',
      value: stats.pendingSuggestions,
      description: 'Feature requests',
      icon: Lightbulb,
      href: '/admin/suggestions',
      gradient: 'from-yellow-500 to-amber-600',
      bgGradient: 'from-yellow-500/10 to-amber-500/5',
      iconBg: 'bg-yellow-500/10',
      iconColor: 'text-yellow-500',
    },
  ];

  const quickActions = [
    { 
      title: 'Add New Mosque', 
      description: 'Register a new mosque location',
      icon: Building2, 
      href: '/admin/mosques/new',
      gradient: 'from-emerald-500 to-teal-600',
    },
    { 
      title: 'Review Claims', 
      description: 'Process pending requests',
      icon: ClipboardList, 
      href: '/admin/claims',
      gradient: 'from-amber-500 to-orange-600',
      badge: stats.pendingClaims,
    },
    { 
      title: 'Manage Users', 
      description: 'View and edit user accounts',
      icon: Users, 
      href: '/admin/users',
      gradient: 'from-blue-500 to-cyan-600',
    },
    { 
      title: 'Import Mosques', 
      description: 'Bulk import from CSV file',
      icon: Upload, 
      href: '/admin/import',
      gradient: 'from-slate-500 to-slate-600',
    },
  ];

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="space-y-2">
              <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              <div className="h-5 w-96 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
              <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-20 w-60 h-60 bg-violet-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary">Admin Dashboard</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <Activity className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Live</span>
              </div>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
              Welcome back! 👋
            </h1>
            <p className="text-muted-foreground mt-1 text-lg">
              Here's what's happening with Minaarly today.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link to="/map">
              <Button variant="outline" className="gap-2 rounded-xl h-11 px-5 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
                <MapPin className="h-4 w-4" />
                View Map
              </Button>
            </Link>
            <Link to="/admin/mosques/new">
              <Button className="gap-2 rounded-xl h-11 px-5 bg-gradient-to-r from-primary to-emerald-600 hover:opacity-90 shadow-lg shadow-primary/25">
                <Building2 className="h-4 w-4" />
                Add Mosque
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={stat.href} className="block group">
                <div className={`relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 p-6 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-300 hover:-translate-y-1`}>
                  {/* Background gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-50`} />
                  
                  {/* Decorative corner */}
                  <div className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`} />
                  
                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                        <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                      </div>
                      {stat.urgent && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20">
                          <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                          <span className="text-xs font-semibold text-red-600 dark:text-red-400">Action needed</span>
                        </div>
                      )}
                      {stat.trend && !stat.urgent && (
                        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <TrendingUp className="h-4 w-4" />
                          <span className="text-sm font-semibold">{stat.trend}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-4xl font-bold text-foreground tracking-tight">
                        {stat.value.toLocaleString()}
                      </div>
                      <div className="text-sm font-medium text-muted-foreground">{stat.title}</div>
                      <div className="flex items-center gap-2 pt-2">
                        <span className="text-xs text-muted-foreground">{stat.description}</span>
                        <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Claims - Takes 2 columns */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/10">
                      <ClipboardList className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">Pending Claims</h2>
                      <p className="text-sm text-muted-foreground">Recent mosque claim requests</p>
                    </div>
                  </div>
                  <Link to="/admin/claims">
                    <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                      View All
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="p-6">
                {recentClaims.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center">
                      <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">All caught up!</h3>
                    <p className="text-muted-foreground">No pending claims to review</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentClaims.map((claim, index) => (
                      <motion.div 
                        key={claim.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="group flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-semibold text-sm">
                            {claim.mosque_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{claim.mosque_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {claim.claimant_name} • {claim.claimant_role}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span className="text-xs">{formatTimeAgo(claim.created_at)}</span>
                          </div>
                          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20">
                            Pending
                          </Badge>
                          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden h-full">
              <div className="p-6 border-b border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-violet-500/10">
                    <Zap className="h-5 w-5 text-violet-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
                    <p className="text-sm text-muted-foreground">Common tasks</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 space-y-2">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.title}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <Link to={action.href}>
                      <div className="group flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-lg`}>
                          <action.icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground">{action.title}</p>
                            {action.badge && action.badge > 0 && (
                              <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                                {action.badge}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{action.description}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
              
              {/* View Map CTA */}
              <div className="p-4 pt-0">
                <Link to="/map" className="block">
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary to-emerald-600 p-4 group">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgZmlsbD0iI2ZmZiIgb3BhY2l0eT0iLjEiIGN4PSIyMCIgY3k9IjIwIiByPSIxIi8+PC9nPjwvc3ZnPg==')] opacity-30" />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">View Public Map</p>
                          <p className="text-sm text-white/70">See all mosques</p>
                        </div>
                      </div>
                      <ArrowUpRight className="h-5 w-5 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Activity Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10">
                <BarChart3 className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Platform Overview</h2>
                <p className="text-sm text-muted-foreground">Key metrics at a glance</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 rounded-xl bg-slate-50 dark:bg-slate-700/30">
              <div className="text-3xl font-bold text-foreground mb-1">{stats.verifiedMosques}</div>
              <div className="text-sm text-muted-foreground">Verified Mosques</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-slate-50 dark:bg-slate-700/30">
              <div className="text-3xl font-bold text-foreground mb-1">{stats.upcomingEvents}</div>
              <div className="text-sm text-muted-foreground">Upcoming Events</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-slate-50 dark:bg-slate-700/30">
              <div className="text-3xl font-bold text-foreground mb-1">{stats.totalUsers}</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-slate-50 dark:bg-slate-700/30">
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
