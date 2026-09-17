import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Loader2, Search, Trophy } from 'lucide-react';

interface ResultFormData {
  job_id: string;
  user_id: string;
  package_offered: string;
  offer_letter_url: string;
  joined: boolean;
}

const emptyForm: ResultFormData = {
  job_id: '', user_id: '', package_offered: '', offer_letter_url: '', joined: false,
};

export default function ResultsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<ResultFormData>(emptyForm);

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['admin-placement-results'],
    queryFn: async () => {
      const { data: res, error } = await supabase
        .from('placement_results')
        .select('*, job_postings(title, companies(name))')
        .order('created_at', { ascending: false });
      if (error) throw error;

      const userIds = [...new Set((res || []).map((r: any) => r.user_id))];
      let profilesMap: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, name, email, student_id, department')
          .in('user_id', userIds);
        if (profiles) {
          profilesMap = Object.fromEntries(profiles.map(p => [p.user_id, p]));
        }
      }

      return (res || []).map((r: any) => ({ ...r, profiles: profilesMap[r.user_id] || null }));
    },
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ['admin-jobs-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_postings')
        .select('id, title, companies(name)')
        .order('title');
      if (error) throw error;
      return data;
    },
  });

  // Get selected applications for the selected job
  const { data: selectedApplicants = [] } = useQuery({
    queryKey: ['selected-applicants', form.job_id],
    queryFn: async () => {
      if (!form.job_id) return [];
      const { data: apps, error } = await supabase
        .from('placement_applications')
        .select('user_id')
        .eq('job_id', form.job_id)
        .eq('status', 'selected');
      if (error) throw error;

      const userIds = (apps || []).map((a: any) => a.user_id);
      if (userIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, name, email')
        .in('user_id', userIds);

      return (profiles || []).map(p => ({ user_id: p.user_id, profiles: p }));
    },
    enabled: !!form.job_id,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: ResultFormData) => {
      const { error } = await supabase.from('placement_results').insert({
        job_id: data.job_id,
        user_id: data.user_id,
        package_offered: data.package_offered ? parseFloat(data.package_offered) : null,
        offer_letter_url: data.offer_letter_url || null,
        joined: data.joined,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Placement result recorded' });
      queryClient.invalidateQueries({ queryKey: ['admin-placement-results'] });
      setDialogOpen(false);
      setForm(emptyForm);
    },
    onError: (err: Error) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('placement_results').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Result deleted' });
      queryClient.invalidateQueries({ queryKey: ['admin-placement-results'] });
    },
    onError: (err: Error) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  const filtered = results.filter((r: any) => {
    return r.profiles?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.job_postings?.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.job_postings?.companies?.name?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Placement Results</h1>
            <p className="text-muted-foreground">Record and manage placement outcomes</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setForm(emptyForm); }}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />Add Result</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Placement Result</DialogTitle>
                <DialogDescription>Add a new placement result for a selected student.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Job Posting *</Label>
                  <Select value={form.job_id} onValueChange={(v) => setForm({ ...form, job_id: v, user_id: '' })}>
                    <SelectTrigger><SelectValue placeholder="Select job" /></SelectTrigger>
                    <SelectContent>
                      {jobs.map((j: any) => (
                        <SelectItem key={j.id} value={j.id}>{j.title} — {j.companies?.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Student *</Label>
                  <Select value={form.user_id} onValueChange={(v) => setForm({ ...form, user_id: v })}>
                    <SelectTrigger><SelectValue placeholder={form.job_id ? 'Select student' : 'Select a job first'} /></SelectTrigger>
                    <SelectContent>
                      {selectedApplicants.map((a: any) => (
                        <SelectItem key={a.user_id} value={a.user_id}>{a.profiles?.name} ({a.profiles?.email})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.job_id && selectedApplicants.length === 0 && (
                    <p className="text-xs text-muted-foreground">No selected applicants for this job. Mark applications as "selected" first.</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Package Offered (LPA)</Label>
                  <Input type="number" value={form.package_offered} onChange={(e) => setForm({ ...form, package_offered: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Offer Letter URL</Label>
                  <Input value={form.offer_letter_url} onChange={(e) => setForm({ ...form, offer_letter_url: e.target.value })} placeholder="https://..." />
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.joined} onCheckedChange={(v) => setForm({ ...form, joined: v })} />
                  <Label>Student has joined</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setDialogOpen(false); setForm(emptyForm); }}>Cancel</Button>
                <Button onClick={() => saveMutation.mutate(form)} disabled={!form.job_id || !form.user_id || saveMutation.isPending}>
                  {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Record Result
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search results..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <Trophy className="mx-auto mb-2 h-8 w-8" />
                No placement results found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Job</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r: any) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{r.profiles?.name || '—'}</p>
                          <p className="text-xs text-muted-foreground">{r.profiles?.student_id || r.profiles?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{r.job_postings?.title || '—'}</TableCell>
                      <TableCell>{r.job_postings?.companies?.name || '—'}</TableCell>
                      <TableCell>{r.package_offered ? `${r.package_offered} LPA` : '—'}</TableCell>
                      <TableCell>
                        <Badge variant={r.joined ? 'default' : 'secondary'}>{r.joined ? 'Yes' : 'No'}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(r.id)}>
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
