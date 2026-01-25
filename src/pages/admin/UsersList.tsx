import { useEffect, useState } from 'react';
import { Search, Shield, User, ShieldCheck, ShieldX } from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string | null;
  roles: AppRole[];
}

export default function UsersList() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleDialog, setRoleDialog] = useState<{ open: boolean; user: UserProfile | null }>({
    open: false,
    user: null,
  });
  const [selectedRole, setSelectedRole] = useState<AppRole | ''>('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combine data
      const usersWithRoles = (profiles || []).map((profile) => ({
        ...profile,
        roles: (roles || [])
          .filter((r) => r.user_id === profile.id)
          .map((r) => r.role),
      }));

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function addRole() {
    if (!roleDialog.user || !selectedRole) return;

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: roleDialog.user.id,
          role: selectedRole,
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: 'Info',
            description: 'User already has this role',
          });
          return;
        }
        throw error;
      }

      setUsers(users.map(u => 
        u.id === roleDialog.user?.id 
          ? { ...u, roles: [...u.roles, selectedRole] }
          : u
      ));

      toast({
        title: 'Success',
        description: `Added ${selectedRole} role`,
      });

      setRoleDialog({ open: false, user: null });
      setSelectedRole('');
    } catch (error) {
      console.error('Error adding role:', error);
      toast({
        title: 'Error',
        description: 'Failed to add role',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  }

  async function removeRole(userId: string, role: AppRole) {
    if (!confirm(`Remove ${role} role from this user?`)) return;

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) throw error;

      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, roles: u.roles.filter(r => r !== role) }
          : u
      ));

      toast({
        title: 'Success',
        description: `Removed ${role} role`,
      });
    } catch (error) {
      console.error('Error removing role:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove role',
        variant: 'destructive',
      });
    }
  }

  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.email?.toLowerCase().includes(searchLower) ||
      user.full_name?.toLowerCase().includes(searchLower)
    );
  });

  function getRoleBadge(role: AppRole) {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100"><Shield className="h-3 w-3 mr-1" />Admin</Badge>;
      case 'mosque_admin':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100"><ShieldCheck className="h-3 w-3 mr-1" />Mosque Admin</Badge>;
      default:
        return <Badge variant="secondary"><User className="h-3 w-3 mr-1" />User</Badge>;
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Users</h1>
        <p className="text-muted-foreground">Manage user accounts and roles ({users.length} total)</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={4}>
                    <div className="h-12 bg-muted animate-pulse rounded" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{user.full_name || 'No name'}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.length === 0 ? (
                        <Badge variant="outline" className="text-muted-foreground">No roles</Badge>
                      ) : (
                        user.roles.map((role) => (
                          <div key={role} className="group relative">
                            {getRoleBadge(role)}
                            {role !== 'user' && (
                              <button
                                onClick={() => removeRole(user.id, role)}
                                className="absolute -top-1 -right-1 hidden group-hover:flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs"
                                title="Remove role"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRoleDialog({ open: true, user })}
                    >
                      <Shield className="h-4 w-4 mr-1" />
                      Role
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Role Dialog */}
      <Dialog open={roleDialog.open} onOpenChange={(open) => setRoleDialog({ open, user: open ? roleDialog.user : null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Role</DialogTitle>
            <DialogDescription>
              Add a role to {roleDialog.user?.full_name || roleDialog.user?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Roles</label>
              <div className="flex flex-wrap gap-1">
                {roleDialog.user?.roles.length === 0 ? (
                  <span className="text-sm text-muted-foreground">No roles assigned</span>
                ) : (
                  roleDialog.user?.roles.map((role) => getRoleBadge(role))
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Add Role</label>
              <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as AppRole)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin (Full access)</SelectItem>
                  <SelectItem value="mosque_admin">Mosque Admin</SelectItem>
                  <SelectItem value="user">User (Basic)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialog({ open: false, user: null })}>
              Cancel
            </Button>
            <Button onClick={addRole} disabled={!selectedRole || processing} className="gradient-teal">
              Add Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
