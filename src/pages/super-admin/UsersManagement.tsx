import { useMemo, useState } from 'react';
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
import {
  Search,
  MoreHorizontal,
  Plus,
  X,
  Loader2,
  Users,
  ShieldCheck,
  BriefcaseBusiness,
  GraduationCap,
  CalendarDays,
  UserRound,
} from 'lucide-react';
import type { AppRole } from '@/types/database';

const ALL_ROLES: AppRole[] = [
  'student',
  'event_admin',
  'placement_cell',
  'admissions_cell',
  'super_admin',
];

const ROLE_LABELS: Record<AppRole, string> = {
  student: 'Student',
  event_admin: 'Event Admin',
  placement_cell: 'Placement Admin',
  admissions_cell: 'Admissions Admin',
  super_admin: 'Super Admin',
};

const ROLE_STYLES: Record<
  AppRole,
  { badge: string; icon: typeof Users }
> = {
  student: {
    badge: 'border-blue-200 bg-blue-50 text-blue-700',
    icon: UserRound,
  },
  event_admin: {
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    icon: CalendarDays,
  },
  placement_cell: {
    badge: 'border-violet-200 bg-violet-50 text-violet-700',
    icon: BriefcaseBusiness,
  },
  admissions_cell: {
    badge: 'border-amber-200 bg-amber-50 text-amber-700',
    icon: GraduationCap,
  },
  super_admin: {
    badge: 'border-red-200 bg-red-50 text-red-700',
    icon: ShieldCheck,
  },
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

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return (
      users?.filter((user) => {
        const matchesSearch =
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          (user.student_id &&
            user.student_id.toLowerCase().includes(query)) ||
          (user.department &&
            user.department.toLowerCase().includes(query));

        const matchesRole =
          roleFilter === 'all' || user.roles.includes(roleFilter);

        return matchesSearch && matchesRole;
      }) || []
    );
  }, [users, searchQuery, roleFilter]);

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    ALL_ROLES.forEach((role) => {
      counts[role] =
        users?.filter((user) => user.roles.includes(role)).length || 0;
    });

    return counts;
  }, [users]);

  const handleAddRole = (
    userId: string,
    role: AppRole,
    userName: string
  ) => {
    setConfirmDialog({
      open: true,
      action: 'add',
      userId,
      role,
      userName,
    });
  };

  const handleRemoveRole = (
    userId: string,
    role: AppRole,
    userName: string
  ) => {
    setConfirmDialog({
      open: true,
      action: 'remove',
      userId,
      role,
      userName,
    });
  };

  const confirmAction = () => {
    if (!confirmDialog) return;

    if (confirmDialog.action === 'add') {
      addRole.mutate({
        userId: confirmDialog.userId,
        role: confirmDialog.role,
      });
    } else {
      removeRole.mutate({
        userId: confirmDialog.userId,
        role: confirmDialog.role,
      });
    }

    setConfirmDialog(null);
  };

  const getAvailableRolesToAdd = (currentRoles: AppRole[]) =>
    ALL_ROLES.filter((role) => !currentRoles.includes(role));

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B1220] via-[#172554] to-blue-700 p-7 text-white shadow-xl">
          <div className="relative z-10 max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-100 backdrop-blur">
              <ShieldCheck className="h-3.5 w-3.5" />
              SUPER ADMIN CONTROL
            </div>

            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              User Management
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 md:text-base">
              Manage staff access, assign operational roles and control
              platform permissions from one place.
            </p>
          </div>

          <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />
          <div className="absolute -bottom-24 right-24 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        </section>

        {/* Role summary */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {ALL_ROLES.map((role) => {
            const Icon = ROLE_STYLES[role].icon;

            return (
              <button
                key={role}
                type="button"
                onClick={() =>
                  setRoleFilter(roleFilter === role ? 'all' : role)
                }
                className={`rounded-2xl border bg-card p-4 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                  roleFilter === role
                    ? 'border-primary ring-2 ring-primary/10'
                    : 'border-border/70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`rounded-xl p-2.5 ${ROLE_STYLES[role].badge}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <span className="text-2xl font-bold">
                    {roleCounts[role] || 0}
                  </span>
                </div>

                <p className="mt-3 text-sm font-semibold">
                  {ROLE_LABELS[role]}
                </p>
              </button>
            );
          })}
        </div>

        {/* Search / filter */}
        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, student ID or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 rounded-xl border-border/70 bg-background pl-11"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-11 rounded-xl px-4"
                >
                  <Users className="mr-2 h-4 w-4" />
                  {roleFilter === 'all'
                    ? 'All Roles'
                    : ROLE_LABELS[roleFilter]}
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>Filter by role</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => setRoleFilter('all')}
                >
                  All Roles
                </DropdownMenuItem>

                {ALL_ROLES.map((role) => {
                  const Icon = ROLE_STYLES[role].icon;

                  return (
                    <DropdownMenuItem
                      key={role}
                      onClick={() => setRoleFilter(role)}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {ROLE_LABELS[role]}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Users */}
        {isLoading ? (
          <div className="flex items-center justify-center rounded-2xl border border-border/70 bg-card py-16 shadow-sm">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="rounded-2xl border border-border/70 bg-card p-12 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 font-semibold">No users found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try changing your search or role filter.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="group rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="h-12 w-12 ring-2 ring-primary/10">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <p className="truncate font-semibold">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </p>

                      {user.student_id && (
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          ID: {user.student_id}
                        </p>
                      )}
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 shrink-0 rounded-xl hover:bg-muted"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        Assign Staff / User Role
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      {getAvailableRolesToAdd(user.roles).length === 0 ? (
                        <DropdownMenuItem disabled>
                          All roles assigned
                        </DropdownMenuItem>
                      ) : (
                        getAvailableRolesToAdd(user.roles).map((role) => {
                          const Icon = ROLE_STYLES[role].icon;

                          return (
                            <DropdownMenuItem
                              key={role}
                              onClick={() =>
                                handleAddRole(
                                  user.user_id,
                                  role,
                                  user.name
                                )
                              }
                            >
                              <Icon className="mr-2 h-4 w-4" />
                              <Plus className="mr-1 h-3.5 w-3.5" />
                              {ROLE_LABELS[role]}
                            </DropdownMenuItem>
                          );
                        })
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {(user.department || user.year) && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {user.department && (
                      <span className="rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1 text-xs font-medium">
                        {user.department}
                      </span>
                    )}

                    {user.year && (
                      <span className="rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1 text-xs font-medium">
                        Year {user.year}
                      </span>
                    )}
                  </div>
                )}

                <div className="mt-4 border-t border-border/60 pt-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Assigned Roles
                    </span>

                    <span className="text-[11px] text-muted-foreground">
                      {user.roles.length} assigned
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {user.roles.length === 0 ? (
                      <span className="text-xs text-muted-foreground">
                        No roles assigned
                      </span>
                    ) : (
                      user.roles.map((role) => {
                        const Icon = ROLE_STYLES[role].icon;

                        return (
                          <Badge
                            key={role}
                            variant="outline"
                            className={`${ROLE_STYLES[role].badge} cursor-pointer gap-1 rounded-lg px-2.5 py-1`}
                            onClick={() =>
                              handleRemoveRole(
                                user.user_id,
                                role,
                                user.name
                              )
                            }
                          >
                            <Icon className="h-3 w-3" />
                            {ROLE_LABELS[role]}
                            <X className="ml-0.5 h-3 w-3" />
                          </Badge>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Result count */}
        {users && (
          <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm">
            <span className="text-sm text-muted-foreground">
              Showing{' '}
              <span className="font-semibold text-foreground">
                {filteredUsers.length}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-foreground">
                {users.length}
              </span>{' '}
              users
            </span>

            {roleFilter !== 'all' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRoleFilter('all')}
                className="h-8 rounded-lg"
              >
                Clear filter
              </Button>
            )}
          </div>
        )}

        {/* Confirmation */}
        <AlertDialog
          open={confirmDialog?.open}
          onOpenChange={(open) =>
            !open && setConfirmDialog(null)
          }
        >
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>
                {confirmDialog?.action === 'add'
                  ? 'Assign Role'
                  : 'Remove Role'}
              </AlertDialogTitle>

              <AlertDialogDescription>
                {confirmDialog?.action === 'add'
                  ? `Are you sure you want to assign "${confirmDialog ? ROLE_LABELS[confirmDialog.role] : ''}" to ${confirmDialog?.userName}?`
                  : `Are you sure you want to remove "${confirmDialog ? ROLE_LABELS[confirmDialog.role] : ''}" from ${confirmDialog?.userName}?`}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>

              <AlertDialogAction onClick={confirmAction}>
                {confirmDialog?.action === 'add'
                  ? 'Assign Role'
                  : 'Remove Role'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
}
