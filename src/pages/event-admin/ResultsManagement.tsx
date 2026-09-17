import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, Trash2, Trophy } from 'lucide-react';
import { useMyAssignedEvents, useAssignedSubEvents, useAssignedResults, useCreateResult, useDeleteResult } from '@/hooks/useEventAdmin';

export default function ResultsManagement() {
  const { data: events = [] } = useMyAssignedEvents();
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [selectedSubEvent, setSelectedSubEvent] = useState<string>('');
  const { data: subEvents = [] } = useAssignedSubEvents(selectedEvent || null);
  const { data: results = [], isLoading } = useAssignedResults(selectedSubEvent || null);
  const createResult = useCreateResult();
  const deleteResult = useDeleteResult();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ position: 1, team_name: '', remarks: '' });

  const handleCreate = () => {
    if (!selectedSubEvent) return;
    createResult.mutate({
      sub_event_id: selectedSubEvent,
      position: form.position,
      team_name: form.team_name,
      remarks: form.remarks,
    }, {
      onSuccess: () => {
        setDialogOpen(false);
        setForm({ position: (results.length || 0) + 2, team_name: '', remarks: '' });
      },
    });
  };

  const positionLabel = (pos: number) => {
    if (pos === 1) return '🥇 1st';
    if (pos === 2) return '🥈 2nd';
    if (pos === 3) return '🥉 3rd';
    return `${pos}th`;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Results</h1>
            <p className="text-muted-foreground">Manage event results and winners</p>
          </div>
          {selectedSubEvent && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setForm({ position: (results.length || 0) + 1, team_name: '', remarks: '' })}>
                  <Plus className="mr-2 h-4 w-4" />Add Result
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Result</DialogTitle>
                  <DialogDescription>Add a winner for this sub-event.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Position *</Label>
                    <Input type="number" min={1} value={form.position} onChange={(e) => setForm({ ...form, position: parseInt(e.target.value) || 1 })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Team / Participant Name *</Label>
                    <Input value={form.team_name} onChange={(e) => setForm({ ...form, team_name: e.target.value })} placeholder="Winner name or team" />
                  </div>
                  <div className="space-y-2">
                    <Label>Remarks</Label>
                    <Textarea value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} placeholder="Optional remarks..." />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreate} disabled={!form.team_name || createResult.isPending}>
                    {createResult.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <Select value={selectedEvent} onValueChange={(v) => { setSelectedEvent(v); setSelectedSubEvent(''); }}>
            <SelectTrigger className="w-[250px]"><SelectValue placeholder="Select Event" /></SelectTrigger>
            <SelectContent>
              {events.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {selectedEvent && (
            <Select value={selectedSubEvent} onValueChange={setSelectedSubEvent}>
              <SelectTrigger className="w-[250px]"><SelectValue placeholder="Select Sub-Event" /></SelectTrigger>
              <SelectContent>
                {subEvents.map((se) => <SelectItem key={se.id} value={se.id}>{se.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        </div>

        <Card>
          <CardContent className="p-0">
            {!selectedSubEvent ? (
              <div className="py-12 text-center text-muted-foreground">
                <Trophy className="mx-auto mb-2 h-8 w-8" />
                Select an event and sub-event to manage results
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : results.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <Trophy className="mx-auto mb-2 h-8 w-8" />
                No results yet. Add winners above.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Position</TableHead>
                    <TableHead>Team / Participant</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{positionLabel(r.position)}</TableCell>
                      <TableCell>{r.team_name || '—'}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{r.remarks || '—'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => deleteResult.mutate(r.id)}>
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
