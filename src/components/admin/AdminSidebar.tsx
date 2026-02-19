import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Building2, 
  ClipboardList, 
  Users, 
  Calendar, 
  Settings,
  ChevronLeft,
  MapPin,
  Sparkles,
  ExternalLink,
  Upload,
  UserCheck,
  Bug,
  Lightbulb,
  Clock,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, color: 'from-violet-500 to-purple-600' },
  { name: 'Mosques', path: '/admin/mosques', icon: Building2, color: 'from-emerald-500 to-teal-600' },
  { name: 'Mosque Submissions', path: '/admin/mosque-submissions', icon: FileText, color: 'from-teal-500 to-emerald-600' },
  { name: 'Prayer Time Submissions', path: '/admin/prayer-time-submissions', icon: Clock, color: 'from-blue-500 to-indigo-600' },
  { name: 'Claims', path: '/admin/claims', icon: ClipboardList, color: 'from-amber-500 to-orange-600' },
  { name: 'Users', path: '/admin/users', icon: Users, color: 'from-blue-500 to-cyan-600' },
  { name: 'Events', path: '/admin/events', icon: Calendar, color: 'from-rose-500 to-pink-600' },
  { name: 'Community Events', path: '/admin/community-events', icon: Sparkles, color: 'from-indigo-500 to-violet-600' },
  { name: 'Organisers', path: '/admin/organisers', icon: UserCheck, color: 'from-cyan-500 to-teal-600' },
  { name: 'Bug Reports', path: '/admin/bug-reports', icon: Bug, color: 'from-red-500 to-rose-600' },
  { name: 'Suggestions', path: '/admin/suggestions', icon: Lightbulb, color: 'from-yellow-500 to-amber-600' },
  { name: 'Import', path: '/admin/import', icon: Upload, color: 'from-slate-500 to-slate-600' },
];

interface AdminSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function AdminSidebar({ collapsed = false, onToggle }: AdminSidebarProps) {
  const location = useLocation();

  return (
    <aside 
      className={cn(
        "h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 flex flex-col transition-all duration-300 relative overflow-hidden",
        collapsed ? "w-20" : "w-72"
      )}
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -left-12 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative h-20 flex items-center justify-between px-5 border-b border-white/5">
        {!collapsed && (
          <Link to="/admin" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-emerald-500 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-500 shadow-lg">
                <MapPin className="h-5 w-5 text-white" />
              </div>
            </div>
            <div>
              <span className="font-bold text-white text-lg tracking-tight">Minaarly</span>
              <div className="flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-primary" />
                <span className="text-[10px] font-medium text-primary uppercase tracking-wider">Admin Panel</span>
              </div>
            </div>
          </Link>
        )}
        {collapsed && (
          <Link to="/admin" className="mx-auto group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-emerald-500 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-500 shadow-lg">
                <MapPin className="h-5 w-5 text-white" />
              </div>
            </div>
          </Link>
        )}
        {onToggle && !collapsed && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggle} 
            className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1.5 relative overflow-y-auto">
        {!collapsed && (
          <div className="px-3 mb-4">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Navigation</span>
          </div>
        )}
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/admin' && location.pathname.startsWith(item.path));
          
          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={item.path}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                  isActive 
                    ? "text-white" 
                    : "text-slate-400 hover:text-white",
                  collapsed && "justify-center px-3"
                )}
                title={collapsed ? item.name : undefined}
              >
                {/* Active background */}
                {isActive && (
                  <motion.div 
                    layoutId="activeNav"
                    className={cn(
                      "absolute inset-0 rounded-xl bg-gradient-to-r",
                      item.color,
                      "opacity-90 shadow-lg"
                    )}
                    style={{ 
                      boxShadow: '0 4px 15px -3px rgba(0, 0, 0, 0.3)'
                    }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                
                {/* Hover background */}
                {!isActive && (
                  <div className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/5 transition-colors" />
                )}

                {/* Icon */}
                <div className={cn(
                  "relative z-10 flex items-center justify-center w-8 h-8 rounded-lg transition-colors",
                  isActive 
                    ? "bg-white/20" 
                    : "bg-slate-800 group-hover:bg-slate-700"
                )}>
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                </div>
                
                {!collapsed && (
                  <span className="relative z-10 font-medium">{item.name}</span>
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="relative border-t border-white/5 p-4">
        {!collapsed && (
          <div className="mb-3 px-2">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Quick Links</span>
          </div>
        )}
        <Link
          to="/"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all group",
            collapsed && "justify-center px-3"
          )}
          title={collapsed ? "View Site" : undefined}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 group-hover:bg-slate-700 transition-colors">
            <ExternalLink className="h-4 w-4" />
          </div>
          {!collapsed && <span>View Live Site</span>}
        </Link>
        
        {!collapsed && (
          <div className="mt-4 mx-2 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-emerald-500/10 border border-primary/20">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-emerald-400">System Online</span>
            </div>
            <p className="text-[10px] text-slate-500">All services operational</p>
          </div>
        )}
      </div>
    </aside>
  );
}
