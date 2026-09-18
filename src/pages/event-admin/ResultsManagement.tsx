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
import {
  Loader2,
  Plus,
  Trash2,
  Trophy,
  Medal,
  Crown,
  Users,
  Award,
  ArrowUpRight,
} from 'lucide-react';
import {
  useMyAssignedEvents,
  useAssignedSubEvents,
  useAssignedResults,
  useCreateResult,
  useDeleteResult,
} from '@/hooks/useEventAdmin';

export default function ResultsManagement() {
  const { data: events = [] } = useMyAssignedEvents();
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [selectedSubEvent, setSelectedSubEvent] = useState<string>('');

  const { data: subEvents = [] } =
    useAssignedSubEvents(selectedEvent || null);

  const { data: results = [], isLoading } =
    useAssignedResults(selectedSubEvent || null);

  const createResult = useCreateResult();
  const deleteResult = useDeleteResult();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    position: 1,
    team_name: '',
    remarks: '',
  });

  const orderedResults = useMemo(
    () => [...results].sort((a, b) => a.position - b.position),
    [results]
  );

  const stats = useMemo(
    () => ({
      total: results.length,
      first: results.filter((r) => r.position === 1).length,
      podium: results.filter((r) => r.position <= 3).length,
    }),
    [results]
  );

  const selectedEventName =
    events.find((e) => e.id === selectedEvent)?.name || '';

  const selectedSubEventName =
    subEvents.find((se) => se.id === selectedSubEvent)?.name || '';

  const handleCreate = () => {
    if (!selectedSubEvent || !form.team_name.trim()) return;

    createResult.mutate(
      {
        sub_event_id: selectedSubEvent,
        position: form.position,
        team_name: form.team_name.trim(),
        remarks: form.remarks.trim(),
      },
      {
        onSuccess: () => {
          setDialogOpen(false);
          setForm({
            position: results.length + 2,
            team_name: '',
            remarks: '',
          });
        },
      }
    );
  };

  const positionLabel = (pos: number) => {
    if (pos === 1) return '1st';
    if (pos === 2) return '2nd';
    if (pos === 3) return '3rd';
    return `${pos}th`;
  };

  const positionIcon = (pos: number) => {
    if (pos === 1) return <Crown className="h-4 w-4" />;
    if (pos === 2) return <Medal className="h-4 w-4" />;
    if (pos === 3) return <Award className="h-4 w-4" />;
    return <Trophy className="h-4 w-4" />;
  };

  const positionStyle = (pos: number) => {
    if (pos === 1) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (pos === 2) return 'bg-slate-100 text-slate-700 border-slate-200';
    if (pos === 3) return 'bg-orange-50 text-orange-700 border-orange-200';
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  return (
    <MainLayout>
      <div className="space-y-6 pb-8">

        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-6 text-white shadow-lg shadow-blue-900/10 sm:p-8">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-indigo-300/10 blur-3xl" />

          <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-50 backdrop-blur-sm">
                <Trophy className="h-3.5 w-3.5" />
                Event Results
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Results Management
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-blue-100 sm:text-base">
                Publish winners, manage podium positions, and maintain
                official event results.
              </p>
            </div>

            {selectedSubEvent && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="h-11 rounded-xl bg-white px-5 font-semibold text-blue-700 shadow-sm hover:bg-blue-50"
                    onClick={() =>
                      setForm({
                        position: results.length + 1,
                        team_name: '',
                        remarks: '',
                      })
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Result
                  </Button>
                </DialogTrigger>

                <DialogContent className="rounded-2xl sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Result</DialogTitle>
                    <DialogDescription>
                      Add a winner or participant result for this activity.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-2">
                    <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Activity
                      </p>
                      <p className="mt-1 font-semibold">
                        {selectedSubEventName}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Position *</Label>
                      <Input
                        type="number"
                        min={1}
                        className="h-11 rounded-xl"
                        value={form.position}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            position:
                              parseInt(e.target.value) || 1,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Team / Participant Name *</Label>
                      <Input
                        className="h-11 rounded-xl"
                        value={form.team_name}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            team_name: e.target.value,
                          })
                        }
                        placeholder="Winner name or team"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Remarks</Label>
                      <Textarea
                        className="min-h-[90px] rounded-xl"
                        value={form.remarks}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            remarks: e.target.value,
                          })
                        }
                        placeholder="Optional remarks..."
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      className="rounded-lg"
                      onClick={() => setDialogOpen(false)}
                    >
                      Cancel
                    </Button>

                    <Button
                      className="rounded-lg"
                      onClick={handleCreate}
                      disabled={
                        !form.team_name.trim() ||
                        createResult.isPending
                      }
                    >
                      {createResult.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Add Result
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </section>

        {/* Selection */}
        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardContent className="p-5">
            <div className="mb-4">
              <h2 className="font-semibold">Select Activity</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Choose an event and activity to manage its results.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Select
                value={selectedEvent}
                onValueChange={(v) => {
                  setSelectedEvent(v);
                  setSelectedSubEvent('');
                }}
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Select Event" />
                </SelectTrigger>

                <SelectContent>
                  {events.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedSubEvent}
                onValueChange={setSelectedSubEvent}
                disabled={!selectedEvent}
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Select Activity / Sub-Event" />
                </SelectTrigger>

                <SelectContent>
                  {subEvents.map((se) => (
                    <SelectItem key={se.id} value={se.id}>
                      {se.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        {selectedSubEvent && (
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              icon={Users}
              label="Results Recorded"
              value={stats.total}
            />

            <StatCard
              icon={Crown}
              label="Winners"
              value={stats.first}
              tone="amber"
            />

            <StatCard
              icon={Medal}
              label="Podium Positions"
              value={stats.podium}
              tone="blue"
            />
          </div>
        )}

        {/* Results */}
        <Card className="overflow-hidden rounded-2xl border-border/70 shadow-sm">
          <CardContent className="p-0">
            {!selectedSubEvent ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Trophy className="h-7 w-7" />
                </div>

                <h3 className="font-semibold">
                  Select an activity
                </h3>

                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  Select an event and sub-event above to view and
                  manage its official results.
                </p>
              </div>
            ) : isLoading ? (
              <div className="flex min-h-[280px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : results.length === 0 ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                  <Trophy className="h-7 w-7" />
                </div>

                <h3 className="font-semibold">
                  No results yet
                </h3>

                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  Add the winners or participants for this activity
                  using the Add Result button.
                </p>
              </div>
            ) : (
              <>
                <div className="border-b border-border/60 px-5 py-4 sm:px-6">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="font-semibold">
                        Official Results
                      </h2>

                      <p className="text-xs text-muted-foreground">
                        {selectedEventName} · {selectedSubEventName}
                      </p>
                    </div>

                    <div className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700">
                      {results.length} result
                      {results.length === 1 ? '' : 's'}
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableHead className="pl-6">
                          Position
                        </TableHead>
                        <TableHead>
                          Team / Participant
                        </TableHead>
                        <TableHead>Remarks</TableHead>
                        <TableHead className="pr-6 text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {orderedResults.map((r) => (
                        <TableRow
                          key={r.id}
                          className="border-border/50 transition-colors hover:bg-blue-50/40"
                        >
                          <TableCell className="pl-6">
                            <Badge
                              variant="outline"
                              className={`rounded-full px-3 py-1 ${positionStyle(
                                r.position
                              )}`}
                            >
                              <span className="mr-1.5">
                                {positionIcon(r.position)}
                              </span>
                              {positionLabel(r.position)}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                <Trophy className="h-4 w-4" />
                              </div>

                              <span className="font-semibold">
                                {r.team_name || '—'}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell className="max-w-[300px]">
                            <span className="block truncate text-sm text-muted-foreground">
                              {r.remarks || '—'}
                            </span>
                          </TableCell>

                          <TableCell className="pr-6 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-lg hover:bg-red-50"
                              onClick={() =>
                                deleteResult.mutate(r.id)
                              }
                              disabled={deleteResult.isPending}
                            >
                              {deleteResult.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                              ) : (
                                <Trash2 className="h-4 w-4 text-destructive" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone = 'slate',
}: {
  icon: any;
  label: string;
  value: number;
  tone?: 'slate' | 'blue' | 'amber';
}) {
  const tones = {
    slate: 'bg-slate-100 text-slate-700',
    blue: 'bg-blue-50 text-blue-700',
    amber: 'bg-amber-50 text-amber-700',
  };

  return (
    <Card className="rounded-2xl border-border/70 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md">
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${tones[tone]}`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <p className="text-2xl font-bold tracking-tight">
            {value}
          </p>
          <p className="text-xs font-medium text-muted-foreground">
            {label}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
