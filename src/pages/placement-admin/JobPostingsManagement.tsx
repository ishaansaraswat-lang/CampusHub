import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Loader2, Search, FileText } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Company = Tables<'companies'>;
type JobPosting = Tables<'job_postings'>;

interface JobFormData {
  company_id: string;
  title: string;
  description: string;
  package_lpa: string;
  min_cgpa: string;
  eligible_departments: string;
  eligible_years: string;
  deadline: string;
  status: string;
}

const emptyForm: JobFormData = {
  company_id: '', title: '', description: '', package_lpa: '', min_cgpa: '',
  eligible_departments: '', eligible_years: '', deadline: '', status: 'draft',
};

const statusColors: Record<string, string> = {
  draft: 'secondary', open: 'default', closed: 'outline', filled: 'destructive',
};

export default function JobPostingsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  const [form, setForm] = useState<JobFormData>(emptyForm);

  const { data: companies = [] } = useQuery({
    queryKey: ['admin-companies'],
    queryFn: async () => {
      const { data, error } = await supabase.from('companies').select('*').order('name');
      if (error) throw error;
      return data as Company[];
    },
  });

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['admin-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_postings')
        .select('*, companies(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as (JobPosting & { companies: { name: string } | null })[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: JobFormData) => {
      const payload = {
        company_id: data.company_id,
        title: data.title,
        description: data.description || null,
        package_lpa: data.package_lpa ? parseFloat(data.package_lpa) : null,
        min_cgpa: data.min_cgpa ? parseFloat(data.min_cgpa) : null,
        eligible_departments: data.eligible_departments ? data.eligible_departments.split(',').map(s => s.trim()).filter(Boolean) : null,
        eligible_years: data.eligible_years ? data.eligible_years.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n)) : null,
        deadline: data.deadline || null,
        status: data.status as 'draft' | 'open' | 'closed' | 'filled',
      };
      if (editingJob) {
        const { error } = await supabase.from('job_postings').update(payload).eq('id', editingJob.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('job_postings').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({ title: editingJob ? 'Job updated' : 'Job created' });
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
      closeDialog();
    },
    onError: (err: Error) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('job_postings').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Job deleted' });
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
    },
    onError: (err: Error) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  const openEdit = (job: JobPosting) => {
    setEditingJob(job);
    setForm({
      company_id: job.company_id,
      title: job.title,
      description: job.description || '',
      package_lpa: job.package_lpa?.toString() || '',
      min_cgpa: job.min_cgpa?.toString() || '',
      eligible_departments: job.eligible_departments?.join(', ') || '',
      eligible_years: job.eligible_years?.join(', ') || '',
      deadline: job.deadline ? new Date(job.deadline).toISOString().slice(0, 16) : '',
      status: job.status,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingJob(null);
    setForm(emptyForm);
  };

  const filtered = jobs.filter((j) => {
    const matchSearch = j.title.toLowerCase().includes(search.toLowerCase()) ||
      (j.companies as any)?.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || j.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Job Postings</h1>
            <p className="text-muted-foreground">Manage job postings and openings</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); else { setForm(emptyForm); setEditingJob(null); setDialogOpen(true); } }}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />Create Job</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingJob ? 'Edit Job' : 'Create Job Posting'}</DialogTitle>
                <DialogDescription>Fill in the job details.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Company *</Label>
                  <Select value={form.company_id} onValueChange={(v) => setForm({ ...form, company_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
                    <SelectContent>
                      {companies.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Job Title *</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Software Engineer" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Package (LPA)</Label>
                    <Input type="number" value={form.package_lpa} onChange={(e) => setForm({ ...form, package_lpa: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Min CGPA</Label>
                    <Input type="number" step="0.1" value={form.min_cgpa} onChange={(e) => setForm({ ...form, min_cgpa: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Eligible Departments (comma-separated)</Label>
                  <Input value={form.eligible_departments} onChange={(e) => setForm({ ...form, eligible_departments: e.target.value })} placeholder="CSE, ECE, ME" />
                </div>
                <div className="space-y-2">
                  <Label>Eligible Years (comma-separated)</Label>
                  <Input value={form.eligible_years} onChange={(e) => setForm({ ...form, eligible_years: e.target.value })} placeholder="3, 4" />
                </div>
                <div className="space-y-2">
                  <Label>Deadline</Label>
                  <Input type="datetime-local" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="filled">Filled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeDialog}>Cancel</Button>
                <Button onClick={() => saveMutation.mutate(form)} disabled={!form.company_id || !form.title || saveMutation.isPending}>
                  {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingJob ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-4">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search jobs..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="filled">Filled</SelectItem>
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
                <FileText className="mx-auto mb-2 h-8 w-8" />
                No job postings found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">{job.title}</TableCell>
                      <TableCell>{(job.companies as any)?.name || '—'}</TableCell>
                      <TableCell>{job.package_lpa ? `${job.package_lpa} LPA` : '—'}</TableCell>
                      <TableCell>
                        <Badge variant={statusColors[job.status] as any}>{job.status}</Badge>
                      </TableCell>
                      <TableCell>{job.deadline ? new Date(job.deadline).toLocaleDateString() : '—'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(job)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(job.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
