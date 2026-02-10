import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, MapPin, Sun, Moon, User, LogOut, Shield, CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'About Us', path: '/about' },
  { name: 'Contact Us', path: '/contact' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdminCheck();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-50 w-full glass border-b">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-teal">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground">Minaarly</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                location.pathname === link.path
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait" initial={false}>
              {theme === 'dark' ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sun className="h-5 w-5 text-foreground" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Moon className="h-5 w-5 text-foreground" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {/* Auth Button */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="max-w-24 truncate">{user.email?.split('@')[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/submit-event">
                    <CalendarPlus className="h-4 w-4 mr-2" />
                    Submit Event
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                   <>
                     <DropdownMenuItem asChild>
                       <Link to="/admin">
                         <Shield className="h-4 w-4 mr-2" />
                         Admin Dashboard
                       </Link>
                     </DropdownMenuItem>
                   </>
                 )}
                 <DropdownMenuSeparator />
                 <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
          )}

        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t bg-background"
          >
            <nav className="container flex flex-col py-4 gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'text-base font-medium py-2 transition-colors',
                    location.pathname === link.path
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="text-sm text-muted-foreground">Theme</span>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg hover:bg-accent transition-colors"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? (
                    <Sun className="h-5 w-5 text-foreground" />
                  ) : (
                    <Moon className="h-5 w-5 text-foreground" />
                  )}
                </button>
              </div>
              
              {/* Mobile Auth */}
              {user ? (
                <>
                  <Link to="/submit-event" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarPlus className="h-4 w-4 mr-2" />
                      Submit Event
                    </Button>
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full justify-start">
                        <Shield className="h-4 w-4 mr-2" />
                        Admin Dashboard
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      signOut();
                      setIsOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
              )}
              
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
