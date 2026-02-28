import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import {
  useAssignedSubEvents,
  useCreateAssignedSubEvent,
  useUpdateAssignedSubEvent,
  useDeleteAssignedSubEvent,
  useMyAssignedEvents,
} from '@/hooks/useEventAdmin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Plus, Pencil, Trash2, Calendar, MapPin, Users, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import type { SubEvent } from '@/types/database';

const initialFormState = {
  name: '',
  description: '',
  venue: '',
  schedule: '',
  rules: '',
  max_participants: '',
  registration_deadline: '',
  is_team_event: false,
  team_size_min: '1',
  team_size_max: '1',
};

export default function EventAdminSubEventsManagement() {
  const { id: eventId } = useParams<{ id: string }>();
  const { data: events = [], isLoading: eventsLoading } = useMyAssignedEvents();
  const event = events.find((e) => e.id === eventId);
  const { data: subEvents, isLoading: subEventsLoading } = useAssignedSubEvents(eventId || null);
  const createSubEvent = useCreateAssignedSubEvent();
  const updateSubEvent = useUpdateAssignedSubEvent();
  const deleteSubEvent = useDeleteAssignedSubEvent();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubEvent, setEditingSubEvent] = useState<SubEvent | null>(null);
  const [formData, setFormData] = useState(initialFormState);

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingSubEvent(null);
  };

  const openEditDialog = (subEvent: SubEvent) => {
    setEditingSubEvent(subEvent);
    setFormData({
      name: subEvent.name,
      description: subEvent.description || '',
      venue: subEvent.venue || '',
      schedule: subEvent.schedule ? subEvent.schedule.slice(0, 16) : '',
      rules: subEvent.rules || '',
      max_participants: subEvent.max_participants?.toString() || '',
      registration_deadline: subEvent.registration_deadline ? subEvent.registration_deadline.slice(0, 16) : '',
      is_team_event: subEvent.is_team_event,
      team_size_min: subEvent.team_size_min?.toString() || '1',
      team_size_max: subEvent.team_size_max?.toString() || '1',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId) return;

    const payload = {
      name: formData.name,
      description: formData.description || null,
      venue: formData.venue || null,
      schedule: formData.schedule || null,
      rules: formData.rules || null,
      max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
      registration_deadline: formData.registration_deadline || null,
      is_team_event: formData.is_team_event,
      team_size_min: parseInt(formData.team_size_min) || 1,
      team_size_max: parseInt(formData.team_size_max) || 1,
    };

    if (editingSubEvent) {
      await updateSubEvent.mutateAsync({ id: editingSubEvent.id, ...payload });
    } else {
      await createSubEvent.mutateAsync({ event_id: eventId, ...payload });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const isPending = createSubEvent.isPending || updateSubEvent.isPending;

  if (eventsLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </MainLayout>
    );
  }

  if (!event) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Event not found or not assigned to you</h2>
          <Button asChild className="mt-4">
            <Link to="/admin/events">Back to My Events</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Button variant="ghost" asChild className="mb-2 pl-0">
              <Link to="/admin/events">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to My Events
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">{event.name}</h1>
            <p className="text-muted-foreground">Manage activities and competitions</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Activity
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingSubEvent ? 'Edit Activity' : 'Add New Activity'}</DialogTitle>
                <DialogDescription>Create a competition, workshop, or activity for this event</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Activity Name *</Label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} placeholder="e.g., Solo Singing" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={formData.description} onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))} placeholder="Describe the activity..." rows={3} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="venue">Venue</Label>
                    <Input id="venue" value={formData.venue} onChange={(e) => setFormData((prev) => ({ ...prev, venue: e.target.value }))} placeholder="e.g., Main Auditorium" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_participants">Max Participants</Label>
                    <Input id="max_participants" type="number" value={formData.max_participants} onChange={(e) => setFormData((prev) => ({ ...prev, max_participants: e.target.value }))} placeholder="Leave empty for unlimited" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="schedule">Date & Time</Label>
                    <Input id="schedule" type="datetime-local" value={formData.schedule} onChange={(e) => setFormData((prev) => ({ ...prev, schedule: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registration_deadline">Registration Deadline</Label>
                    <Input id="registration_deadline" type="datetime-local" value={formData.registration_deadline} onChange={(e) => setFormData((prev) => ({ ...prev, registration_deadline: e.target.value }))} />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Switch id="is_team_event" checked={formData.is_team_event} onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_team_event: checked }))} />
                  <Label htmlFor="is_team_event">Team Event</Label>
                </div>
                {formData.is_team_event && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="team_size_min">Min Team Size</Label>
                      <Input id="team_size_min" type="number" min="1" value={formData.team_size_min} onChange={(e) => setFormData((prev) => ({ ...prev, team_size_min: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="team_size_max">Max Team Size</Label>
                      <Input id="team_size_max" type="number" min="1" value={formData.team_size_max} onChange={(e) => setFormData((prev) => ({ ...prev, team_size_max: e.target.value }))} />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="rules">Rules & Guidelines</Label>
                  <Textarea id="rules" value={formData.rules} onChange={(e) => setFormData((prev) => ({ ...prev, rules: e.target.value }))} placeholder="Enter rules for the activity..." rows={3} />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>Cancel</Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>) : (editingSubEvent ? 'Update Activity' : 'Add Activity')}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {subEventsLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (<Skeleton key={i} className="h-48 w-full" />))}
          </div>
        ) : subEvents && subEvents.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subEvents.map((subEvent) => (
              <Card key={subEvent.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{subEvent.name}</CardTitle>
                    {subEvent.is_team_event && <Badge variant="secondary">Team</Badge>}
                  </div>
                  <CardDescription className="line-clamp-2">{subEvent.description || 'No description'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    {subEvent.schedule && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(subEvent.schedule), 'MMM d, h:mm a')}</span>
                      </div>
                    )}
                    {subEvent.venue && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{subEvent.venue}</span>
                      </div>
                    )}
                    {subEvent.max_participants && (
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>Max {subEvent.max_participants}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditDialog(subEvent)}>
                      <Pencil className="mr-2 h-4 w-4" />Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Activity?</AlertDialogTitle>
                          <AlertDialogDescription>This will permanently delete "{subEvent.name}" and all its registrations.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteSubEvent.mutate(subEvent.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-medium">No activities yet</h3>
              <p className="text-muted-foreground mb-4">Add competitions, workshops, and activities to this event</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />Add First Activity
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
