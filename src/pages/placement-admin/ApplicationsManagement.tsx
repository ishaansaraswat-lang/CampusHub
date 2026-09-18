import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Loader2,
  Search,
  ClipboardList,
  Eye,
  Users,
  CheckCircle2,
  Clock3,
  UserCheck,
  Building2,
  Briefcase,
  CalendarDays,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

const statusConfig: Record<string, {
  label: string;
  className: string;
}> = {
  pending: {
    label: 'Pending',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  },
  shortlisted: {
    label: 'Shortlisted',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  },
  selected: {
    label: 'Selected',
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  },
  withdrawn: {
    label: 'Withdrawn',
    className: 'bg-muted text-muted-foreground',
  },
};

export default function ApplicationsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['admin-applications'],
    queryFn: async () => {
      const { data: apps, error } = await supabase
        .from('placement_applications')
        .select('*, job_postings(title, companies(name))')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const userIds = [...new Set((apps || []).map((a: any) => a.user_id))];

      let profilesMap: Record<string, any> = {};

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, name, email, student_id, department, cgpa')
          .in('user_id', userIds);

        if (profiles) {
          profilesMap = Object.fromEntries(
            profiles.map((p) => [p.user_id, p])
          );
        }
      }

      return (apps || []).map((a: any) => ({
        ...a,
        profiles: profilesMap[a.user_id] || null,
      }));
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('placement_applications')
        .update({ status: status as any })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Application status updated' });
      queryClient.invalidateQueries({ queryKey: ['admin-applications'] });
      setSelectedApp(null);
    },
    onError: (err: Error) => {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    },
  });

  const filtered = applications.filter((a: any) => {
    const query = search.toLowerCase().trim();

    const matchSearch =
      !query ||
      a.profiles?.name?.toLowerCase().includes(query) ||
      a.profiles?.email?.toLowerCase().includes(query) ||
      a.profiles?.student_id?.toLowerCase().includes(query) ||
      a.profiles?.department?.toLowerCase().includes(query) ||
      a.job_postings?.title?.toLowerCase().includes(query) ||
      a.job_postings?.companies?.name?.toLowerCase().includes(query);

    const matchStatus =
      statusFilter === 'all' || a.status === statusFilter;

    return matchSearch && matchStatus;
  });

  const pendingCount = applications.filter((a: any) => a.status === 'pending').length;
  const shortlistedCount = applications.filter((a: any) => a.status === 'shortlisted').length;
  const selectedCount = applications.filter((a: any) => a.status === 'selected').length;

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card p-6 shadow-sm sm:p-8">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-blue-400/10 blur-3xl" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Recruitment Management
              </div>

              <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Applications
              </h1>

              <p className="mt-2 max-w-2xl text-muted-foreground">
                Review student applications, evaluate candidates, and manage recruitment status.
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-background/70 px-5 py-3">
              <p className="text-xs text-muted-foreground">Total Applications</p>
              <p className="mt-1 text-2xl font-bold">{applications.length}</p>
            </div>
          </div>
        </div>

        {/* KPI */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="rounded-xl bg-primary/10 p-2.5">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold">{applications.length}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Total applications
            </p>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="rounded-xl bg-amber-500/10 p-2.5">
                <Clock3 className="h-5 w-5 text-amber-600" />
              </div>
            </div>
            <p className="text-2xl font-bold">{pendingCount}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Awaiting review
            </p>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="rounded-xl bg-blue-500/10 p-2.5">
                <UserCheck className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold">{shortlistedCount}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Shortlisted candidates
            </p>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="rounded-xl bg-emerald-500/10 p-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
            <p className="text-2xl font-bold">{selectedCount}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Selected candidates
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="h-11 rounded-xl border-border/70 bg-background pl-10"
                  placeholder="Search student, ID, department, job or company..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-11 w-full rounded-xl border-border/70 bg-background lg:w-52">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="selected">Selected</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Showing{' '}
                <span className="font-semibold text-foreground">
                  {filtered.length}
                </span>{' '}
                applications
              </span>

              {(search || statusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('all');
                  }}
                  className="font-semibold text-primary hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Applications table */}
        <Card className="overflow-hidden rounded-2xl border-border/70 shadow-sm">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex min-h-[320px] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="rounded-2xl bg-primary/10 p-4">
                    <Loader2 className="h-7 w-7 animate-spin text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Loading applications...
                  </p>
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 rounded-2xl bg-primary/10 p-4">
                  <ClipboardList className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">
                  No applications found
                </h3>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Try changing your search or status filter.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="min-w-[220px]">Student</TableHead>
                      <TableHead className="min-w-[180px]">Job</TableHead>
                      <TableHead className="min-w-[150px]">Company</TableHead>
                      <TableHead>CGPA</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applied</TableHead>
                      <TableHead className="text-right">Review</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filtered.map((app: any) => {
                      const config =
                        statusConfig[app.status] || statusConfig.pending;

                      return (
                        <TableRow
                          key={app.id}
                          className="group transition-colors hover:bg-primary/[0.025]"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                                {(app.profiles?.name || 'S')
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate font-semibold">
                                  {app.profiles?.name || '—'}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                  {app.profiles?.student_id ||
                                    app.profiles?.email ||
                                    '—'}
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Briefcase className="h-4 w-4 shrink-0 text-muted-foreground" />
                              <span className="max-w-[180px] truncate font-medium">
                                {app.job_postings?.title || '—'}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                              <span className="max-w-[150px] truncate">
                                {app.job_postings?.companies?.name || '—'}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <span className="font-semibold">
                              {app.profiles?.cgpa || '—'}
                            </span>
                          </TableCell>

                          <TableCell>
                            <Badge
                              className={`rounded-full px-3 py-1 ${config.className}`}
                            >
                              {config.label}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <CalendarDays className="h-3.5 w-3.5" />
                              {new Date(app.created_at).toLocaleDateString()}
                            </div>
                          </TableCell>

                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-xl border-border/70 opacity-80 transition-all group-hover:border-primary/30 group-hover:text-primary group-hover:opacity-100"
                              onClick={() => {
                                setSelectedApp(app);
                                setNewStatus(app.status);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Review
                              <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Application details dialog */}
        <Dialog
          open={!!selectedApp}
          onOpenChange={(open) => {
            if (!open) setSelectedApp(null);
          }}
        >
          <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl">
                Application Review
              </DialogTitle>
              <DialogDescription>
                Review candidate details and update the application status.
              </DialogDescription>
            </DialogHeader>

            {selectedApp && (
              <div className="space-y-5">
                {/* Candidate header */}
                <div className="flex items-center gap-4 rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-xl font-bold text-primary">
                    {(selectedApp.profiles?.name || 'S')
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-semibold">
                      {selectedApp.profiles?.name || 'Unknown Student'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedApp.profiles?.email || 'No email available'}
                    </p>
                    <Badge
                      className={`mt-2 rounded-full ${
                        (statusConfig[selectedApp.status] ||
                          statusConfig.pending).className
                      }`}
                    >
                      {(statusConfig[selectedApp.status] ||
                        statusConfig.pending).label}
                    </Badge>
                  </div>
                </div>

                {/* Candidate details */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-border/60 bg-background p-4">
                    <Label className="text-xs text-muted-foreground">
                      Student ID
                    </Label>
                    <p className="mt-1 font-semibold">
                      {selectedApp.profiles?.student_id || '—'}
                    </p>
                  </div>

                  <div className="rounded-xl border border-border/60 bg-background p-4">
                    <Label className="text-xs text-muted-foreground">
                      Department
                    </Label>
                    <p className="mt-1 font-semibold">
                      {selectedApp.profiles?.department || '—'}
                    </p>
                  </div>

                  <div className="rounded-xl border border-border/60 bg-background p-4">
                    <Label className="text-xs text-muted-foreground">
                      CGPA
                    </Label>
                    <p className="mt-1 font-semibold">
                      {selectedApp.profiles?.cgpa || '—'}
                    </p>
                  </div>

                  <div className="rounded-xl border border-border/60 bg-background p-4">
                    <Label className="text-xs text-muted-foreground">
                      Applied On
                    </Label>
                    <p className="mt-1 font-semibold">
                      {new Date(
                        selectedApp.created_at
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Job */}
                <div className="rounded-2xl border border-border/70 bg-primary/[0.025] p-4">
                  <Label className="text-xs text-muted-foreground">
                    Applied Position
                  </Label>

                  <div className="mt-2 flex items-center gap-3">
                    <div className="rounded-xl bg-primary/10 p-2.5">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>

                    <div>
                      <p className="font-semibold">
                        {selectedApp.job_postings?.title || '—'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedApp.job_postings?.companies?.name || '—'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cover letter */}
                {selectedApp.cover_letter && (
                  <div className="space-y-2">
                    <Label>Cover Letter</Label>
                    <div className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-xl border border-border/70 bg-muted/20 p-4 text-sm leading-6 text-muted-foreground">
                      {selectedApp.cover_letter}
                    </div>
                  </div>
                )}

                {/* Status */}
                <div className="space-y-2">
                  <Label>Update Application Status</Label>

                  <Select
                    value={newStatus}
                    onValueChange={setNewStatus}
                  >
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="shortlisted">
                        Shortlisted
                      </SelectItem>
                      <SelectItem value="selected">Selected</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="withdrawn">Withdrawn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => setSelectedApp(null)}
              >
                Close
              </Button>

              <Button
                className="rounded-xl"
                onClick={() =>
                  updateStatus.mutate({
                    id: selectedApp.id,
                    status: newStatus,
                  })
                }
                disabled={
                  newStatus === selectedApp?.status ||
                  updateStatus.isPending
                }
              >
                {updateStatus.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Update Status
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
