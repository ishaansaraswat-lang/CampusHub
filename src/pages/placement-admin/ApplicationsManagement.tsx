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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Search, ClipboardList, Eye } from 'lucide-react';

const statusColors: Record<string, string> = {
  pending: 'secondary',
  shortlisted: 'default',
  rejected: 'destructive',
  selected: 'default',
  withdrawn: 'outline',
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
      // Fetch applications with job details
      const { data: apps, error } = await supabase
        .from('placement_applications')
        .select('*, job_postings(title, companies(name))')
        .order('created_at', { ascending: false });
      if (error) throw error;

      // Fetch profiles for all user_ids
      const userIds = [...new Set((apps || []).map((a: any) => a.user_id))];
      let profilesMap: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, name, email, student_id, department, cgpa')
          .in('user_id', userIds);
        if (profiles) {
          profilesMap = Object.fromEntries(profiles.map(p => [p.user_id, p]));
        }
      }

      return (apps || []).map((a: any) => ({ ...a, profiles: profilesMap[a.user_id] || null }));
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
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  const filtered = applications.filter((a: any) => {
    const matchSearch =
      a.profiles?.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.profiles?.email?.toLowerCase().includes(search.toLowerCase()) ||
      a.job_postings?.title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Applications</h1>
          <p className="text-muted-foreground">Review and manage student applications</p>
        </div>

        <div className="flex gap-4">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search by name, email, job..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
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

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <ClipboardList className="mx-auto mb-2 h-8 w-8" />
                No applications found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Job</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>CGPA</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((app: any) => (
                    <TableRow key={app.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{app.profiles?.name || '—'}</p>
                          <p className="text-xs text-muted-foreground">{app.profiles?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{app.job_postings?.title || '—'}</TableCell>
                      <TableCell>{app.job_postings?.companies?.name || '—'}</TableCell>
                      <TableCell>{app.profiles?.cgpa || '—'}</TableCell>
                      <TableCell>
                        <Badge variant={statusColors[app.status] as any}>{app.status}</Badge>
                      </TableCell>
                      <TableCell>{new Date(app.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => { setSelectedApp(app); setNewStatus(app.status); }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={!!selectedApp} onOpenChange={(open) => { if (!open) setSelectedApp(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
              <DialogDescription>Review and update the application status.</DialogDescription>
            </DialogHeader>
            {selectedApp && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Student</Label>
                    <p className="font-medium">{selectedApp.profiles?.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedApp.profiles?.email}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Student ID</Label>
                    <p className="font-medium">{selectedApp.profiles?.student_id || '—'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Department</Label>
                    <p className="font-medium">{selectedApp.profiles?.department || '—'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">CGPA</Label>
                    <p className="font-medium">{selectedApp.profiles?.cgpa || '—'}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Job</Label>
                  <p className="font-medium">{selectedApp.job_postings?.title} — {selectedApp.job_postings?.companies?.name}</p>
                </div>
                {selectedApp.cover_letter && (
                  <div>
                    <Label className="text-muted-foreground">Cover Letter</Label>
                    <p className="text-sm whitespace-pre-wrap rounded border p-3">{selectedApp.cover_letter}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Update Status</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="shortlisted">Shortlisted</SelectItem>
                      <SelectItem value="selected">Selected</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="withdrawn">Withdrawn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedApp(null)}>Close</Button>
              <Button
                onClick={() => updateStatus.mutate({ id: selectedApp.id, status: newStatus })}
                disabled={newStatus === selectedApp?.status || updateStatus.isPending}
              >
                {updateStatus.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Status
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
