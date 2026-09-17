import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAllUsers, useAddRole, useRemoveRole } from '@/hooks/useUserManagement';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Search, MoreHorizontal, Plus, X, Loader2, Users } from 'lucide-react';
import type { AppRole } from '@/types/database';

const ALL_ROLES: AppRole[] = ['student', 'event_admin', 'placement_cell', 'super_admin'];

const ROLE_COLORS: Record<AppRole, string> = {
  student: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  event_admin: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  placement_cell: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  super_admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const ROLE_LABELS: Record<AppRole, string> = {
  student: 'Student',
  event_admin: 'Event Admin',
  placement_cell: 'Placement Cell',
  super_admin: 'Super Admin',
};

export default function UsersManagement() {
  const { data: users, isLoading } = useAllUsers();
  const addRole = useAddRole();
  const removeRole = useRemoveRole();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<AppRole | 'all'>('all');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: 'add' | 'remove';
    userId: string;
    role: AppRole;
    userName: string;
  } | null>(null);

  const filteredUsers = users?.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.student_id && user.student_id.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === 'all' || user.roles.includes(roleFilter);

    return matchesSearch && matchesRole;
  });

  const handleAddRole = (userId: string, role: AppRole, userName: string) => {
    setConfirmDialog({ open: true, action: 'add', userId, role, userName });
  };

  const handleRemoveRole = (userId: string, role: AppRole, userName: string) => {
    setConfirmDialog({ open: true, action: 'remove', userId, role, userName });
  };

  const confirmAction = () => {
    if (!confirmDialog) return;

    if (confirmDialog.action === 'add') {
      addRole.mutate({ userId: confirmDialog.userId, role: confirmDialog.role });
    } else {
      removeRole.mutate({ userId: confirmDialog.userId, role: confirmDialog.role });
    }
    setConfirmDialog(null);
  };

  const getAvailableRolesToAdd = (currentRoles: AppRole[]) => {
    return ALL_ROLES.filter((role) => !currentRoles.includes(role));
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="pt-4 md:pt-2">
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">User Management</h1>
          <p className="mt-1 text-muted-foreground">
            View all users, search, and manage their roles
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or student ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-11 rounded-2xl bg-background border-0 shadow-inset-sm focus-visible:ring-1"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-11 rounded-2xl bg-background shadow-extruded-sm hover:shadow-inset-sm">
                <Users className="mr-2 h-4 w-4" />
                {roleFilter === 'all' ? 'All Roles' : ROLE_LABELS[roleFilter]}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setRoleFilter('all')}>
                All Roles
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {ALL_ROLES.map((role) => (
                <DropdownMenuItem key={role} onClick={() => setRoleFilter(role)}>
                  {ROLE_LABELS[role]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Users Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredUsers?.length === 0 ? (
          <div className="rounded-2xl bg-background p-10 text-center text-muted-foreground shadow-inset-sm">
            No users found
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredUsers?.map((user) => (
              <div
                key={user.id}
                className="rounded-2xl bg-background p-5 shadow-extruded-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-extruded"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-12 w-12 shadow-extruded-xs">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback className="bg-background text-primary font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      {user.student_id && (
                        <p className="text-[11px] text-muted-foreground/80 mt-0.5">ID: {user.student_id}</p>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 shrink-0 rounded-full bg-background shadow-extruded-xs hover:shadow-inset-sm"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Add Role</DropdownMenuLabel>
                      {getAvailableRolesToAdd(user.roles).length === 0 ? (
                        <DropdownMenuItem disabled>All roles assigned</DropdownMenuItem>
                      ) : (
                        getAvailableRolesToAdd(user.roles).map((role) => (
                          <DropdownMenuItem
                            key={role}
                            onClick={() => handleAddRole(user.user_id, role, user.name)}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            {ROLE_LABELS[role]}
                          </DropdownMenuItem>
                        ))
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {(user.department || user.year) && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {user.department && (
                      <span className="inline-flex items-center rounded-full bg-background px-3 py-1 text-xs font-medium shadow-inset-sm">
                        {user.department}
                      </span>
                    )}
                    {user.year && (
                      <span className="inline-flex items-center rounded-full bg-background px-3 py-1 text-xs font-medium shadow-inset-sm">
                        Year {user.year}
                      </span>
                    )}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {user.roles.length === 0 ? (
                    <span className="text-xs text-muted-foreground">No roles assigned</span>
                  ) : (
                    user.roles.map((role) => (
                      <Badge
                        key={role}
                        variant="secondary"
                        className={`${ROLE_COLORS[role]} cursor-pointer`}
                        onClick={() => handleRemoveRole(user.user_id, role, user.name)}
                      >
                        {ROLE_LABELS[role]}
                        <X className="ml-1 h-3 w-3" />
                      </Badge>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {users && (
          <div className="inline-flex items-center rounded-full bg-background px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-inset-sm">
            Showing {filteredUsers?.length || 0} of {users.length} users
          </div>
        )}

        {/* Confirmation Dialog */}
        <AlertDialog
          open={confirmDialog?.open}
          onOpenChange={(open) => !open && setConfirmDialog(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {confirmDialog?.action === 'add' ? 'Add Role' : 'Remove Role'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {confirmDialog?.action === 'add'
                  ? `Are you sure you want to add the "${ROLE_LABELS[confirmDialog.role]}" role to ${confirmDialog.userName}?`
                  : `Are you sure you want to remove the "${confirmDialog && ROLE_LABELS[confirmDialog.role]}" role from ${confirmDialog?.userName}?`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmAction}>
                {confirmDialog?.action === 'add' ? 'Add Role' : 'Remove Role'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
}
