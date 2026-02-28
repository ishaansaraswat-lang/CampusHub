import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Loader2, Search, Users } from 'lucide-react';
import { useMyAssignedEvents, useAllAssignedSubEvents, useAssignedRegistrations, useUpdateRegistrationStatus } from '@/hooks/useEventAdmin';
import type { RegistrationStatus } from '@/types/database';

const statusColors: Record<RegistrationStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'outline',
  confirmed: 'default',
  cancelled: 'destructive',
  waitlisted: 'secondary',
};

export default function RegistrationsManagement() {
  const { data: events = [] } = useMyAssignedEvents();
  const eventIds = useMemo(() => events.map((e) => e.id), [events]);
  const { data: subEvents = [] } = useAllAssignedSubEvents(eventIds);
  const subEventIds = useMemo(() => subEvents.map((se) => se.id), [subEvents]);
  const { data: registrations = [], isLoading } = useAssignedRegistrations(subEventIds);
  const updateStatus = useUpdateRegistrationStatus();

  const [search, setSearch] = useState('');
  const [filterEvent, setFilterEvent] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedReg, setSelectedReg] = useState<any>(null);
  const [newStatus, setNewStatus] = useState<RegistrationStatus>('confirmed');

  const filtered = useMemo(() => {
    return registrations.filter((r: any) => {
      const profile = r.profiles;
      const subEvent = r.sub_events;
      const matchSearch = !search || 
        profile?.name?.toLowerCase().includes(search.toLowerCase()) ||
        profile?.email?.toLowerCase().includes(search.toLowerCase());
      const matchEvent = filterEvent === 'all' || subEvent?.event_id === filterEvent;
      const matchStatus = filterStatus === 'all' || r.status === filterStatus;
      return matchSearch && matchEvent && matchStatus;
    });
  }, [registrations, search, filterEvent, filterStatus]);

  const openStatusDialog = (reg: any) => {
    setSelectedReg(reg);
    setNewStatus(reg.status === 'pending' ? 'confirmed' : reg.status);
    setDialogOpen(true);
  };

  const handleUpdateStatus = () => {
    if (!selectedReg) return;
    updateStatus.mutate({ id: selectedReg.id, status: newStatus }, {
      onSuccess: () => setDialogOpen(false),
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Registrations</h1>
          <p className="text-muted-foreground">Manage event registrations</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search by name/email..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={filterEvent} onValueChange={setFilterEvent}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Events" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              {events.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="waitlisted">Waitlisted</SelectItem>
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
                <Users className="mx-auto mb-2 h-8 w-8" />
                No registrations found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Sub-Event</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((reg: any) => (
                    <TableRow key={reg.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{reg.profiles?.name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">{reg.profiles?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{reg.sub_events?.name || '—'}</TableCell>
                      <TableCell>{reg.sub_events?.events?.name || '—'}</TableCell>
                      <TableCell>{reg.team_name || '—'}</TableCell>
                      <TableCell>
                        <Badge variant={statusColors[reg.status as RegistrationStatus]}>{reg.status}</Badge>
                      </TableCell>
                      <TableCell>{new Date(reg.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => openStatusDialog(reg)}>
                          Update
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Registration Status</DialogTitle>
            <DialogDescription>
              {selectedReg?.profiles?.name} — {selectedReg?.sub_events?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>New Status</Label>
              <Select value={newStatus} onValueChange={(v) => setNewStatus(v as RegistrationStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="waitlisted">Waitlisted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateStatus} disabled={updateStatus.isPending}>
              {updateStatus.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
