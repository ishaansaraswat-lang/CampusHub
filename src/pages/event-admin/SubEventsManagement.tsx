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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  ArrowUpRight,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  MapPin,
  Users,
  Loader2,
  Trophy,
  UsersRound,
  Clock3,
} from 'lucide-react';
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

  const { data: events = [], isLoading: eventsLoading } =
    useMyAssignedEvents();

  const event = events.find((e) => e.id === eventId);

  const {
    data: subEvents,
    isLoading: subEventsLoading,
  } = useAssignedSubEvents(eventId || null);

  const createSubEvent = useCreateAssignedSubEvent();
  const updateSubEvent = useUpdateAssignedSubEvent();
  const deleteSubEvent = useDeleteAssignedSubEvent();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubEvent, setEditingSubEvent] =
    useState<SubEvent | null>(null);
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
      schedule: subEvent.schedule
        ? subEvent.schedule.slice(0, 16)
        : '',
      rules: subEvent.rules || '',
      max_participants:
        subEvent.max_participants?.toString() || '',
      registration_deadline: subEvent.registration_deadline
        ? subEvent.registration_deadline.slice(0, 16)
        : '',
      is_team_event: subEvent.is_team_event,
      team_size_min:
        subEvent.team_size_min?.toString() || '1',
      team_size_max:
        subEvent.team_size_max?.toString() || '1',
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
      max_participants: formData.max_participants
        ? parseInt(formData.max_participants)
        : null,
      registration_deadline:
        formData.registration_deadline || null,
      is_team_event: formData.is_team_event,
      team_size_min:
        parseInt(formData.team_size_min) || 1,
      team_size_max:
        parseInt(formData.team_size_max) || 1,
    };

    if (editingSubEvent) {
      await updateSubEvent.mutateAsync({
        id: editingSubEvent.id,
        ...payload,
      });
    } else {
      await createSubEvent.mutateAsync({
        event_id: eventId,
        ...payload,
      });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const isPending =
    createSubEvent.isPending ||
    updateSubEvent.isPending;

  if (eventsLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-56 rounded-2xl" />
            <Skeleton className="h-56 rounded-2xl" />
            <Skeleton className="h-56 rounded-2xl" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!event) {
    return (
      <MainLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <div className="mb-4 rounded-2xl bg-primary/10 p-4">
            <Calendar className="h-9 w-9 text-primary" />
          </div>

          <h2 className="text-2xl font-bold">
            Event not found
          </h2>

          <p className="mt-2 text-muted-foreground">
            This event may not be assigned to you.
          </p>

          <Button asChild className="mt-5 rounded-xl">
            <Link to="/admin/events">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to My Events
            </Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card p-6 shadow-sm sm:p-8">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-blue-400/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Button
                variant="ghost"
                asChild
                className="-ml-2 mb-4 rounded-xl"
              >
                <Link to="/admin/events">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to My Events
                </Link>
              </Button>

              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                <Trophy className="h-3.5 w-3.5" />
                Event Activities
              </div>

              <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                {event.name}
              </h1>

              <p className="mt-2 text-muted-foreground">
                Manage competitions, workshops, and activities
                for this event.
              </p>
            </div>

            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) resetForm();
              }}
            >
              <DialogTrigger asChild>
                <Button className="rounded-xl shadow-sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Activity
                </Button>
              </DialogTrigger>

              <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {editingSubEvent
                      ? 'Edit Activity'
                      : 'Add New Activity'}
                  </DialogTitle>

                  <DialogDescription>
                    Create a competition, workshop, or activity
                    for this event.
                  </DialogDescription>
                </DialogHeader>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Activity Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="e.g. Solo Singing"
                      className="rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Describe the activity..."
                      rows={3}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="venue">Venue</Label>
                      <Input
                        id="venue"
                        value={formData.venue}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            venue: e.target.value,
                          }))
                        }
                        placeholder="Main Auditorium"
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="max_participants">
                        Max Participants
                      </Label>
                      <Input
                        id="max_participants"
                        type="number"
                        min="1"
                        value={formData.max_participants}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            max_participants:
                              e.target.value,
                          }))
                        }
                        placeholder="Unlimited"
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="schedule">
                        Date & Time
                      </Label>
                      <Input
                        id="schedule"
                        type="datetime-local"
                        value={formData.schedule}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            schedule: e.target.value,
                          }))
                        }
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="registration_deadline">
                        Registration Deadline
                      </Label>
                      <Input
                        id="registration_deadline"
                        type="datetime-local"
                        value={formData.registration_deadline}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            registration_deadline:
                              e.target.value,
                          }))
                        }
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <div>
                      <Label
                        htmlFor="is_team_event"
                        className="font-semibold"
                      >
                        Team Event
                      </Label>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Enable team-based participation.
                      </p>
                    </div>

                    <Switch
                      id="is_team_event"
                      checked={formData.is_team_event}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          is_team_event: checked,
                        }))
                      }
                    />
                  </div>

                  {formData.is_team_event && (
                    <div className="grid gap-4 rounded-2xl border border-primary/15 bg-primary/[0.03] p-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="team_size_min">
                          Min Team Size
                        </Label>
                        <Input
                          id="team_size_min"
                          type="number"
                          min="1"
                          value={formData.team_size_min}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              team_size_min:
                                e.target.value,
                            }))
                          }
                          className="rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="team_size_max">
                          Max Team Size
                        </Label>
                        <Input
                          id="team_size_max"
                          type="number"
                          min="1"
                          value={formData.team_size_max}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              team_size_max:
                                e.target.value,
                            }))
                          }
                          className="rounded-xl"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="rules">
                      Rules & Guidelines
                    </Label>
                    <Textarea
                      id="rules"
                      value={formData.rules}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          rules: e.target.value,
                        }))
                      }
                      placeholder="Enter rules for the activity..."
                      rows={3}
                      className="rounded-xl"
                    />
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => {
                        setIsDialogOpen(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>

                    <Button
                      type="submit"
                      disabled={isPending}
                      className="rounded-xl"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : editingSubEvent ? (
                        'Update Activity'
                      ) : (
                        'Add Activity'
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary */}
        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryCard
            icon={Trophy}
            label="Total Activities"
            value={subEvents?.length || 0}
            iconClass="bg-primary/10 text-primary"
          />

          <SummaryCard
            icon={UsersRound}
            label="Team Events"
            value={
              subEvents?.filter((item) => item.is_team_event)
                .length || 0
            }
            iconClass="bg-blue-500/10 text-blue-600"
          />

          <SummaryCard
            icon={Clock3}
            label="Scheduled"
            value={
              subEvents?.filter((item) => item.schedule).length ||
              0
            }
            iconClass="bg-emerald-500/10 text-emerald-600"
          />
        </div>

        {/* Activities */}
        {subEventsLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton
                key={i}
                className="h-64 w-full rounded-2xl"
              />
            ))}
          </div>
        ) : subEvents && subEvents.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {subEvents.map((subEvent) => (
              <Card
                key={subEvent.id}
                className="group overflow-hidden rounded-2xl border-border/70 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-lg"
              >
                <div className="h-1 bg-primary/70" />

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="rounded-xl bg-primary/10 p-2.5">
                        <Trophy className="h-5 w-5 text-primary" />
                      </div>

                      <div className="min-w-0">
                        <CardTitle className="truncate text-lg">
                          {subEvent.name}
                        </CardTitle>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Event activity
                        </p>
                      </div>
                    </div>

                    {subEvent.is_team_event && (
                      <Badge className="shrink-0 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                        Team
                      </Badge>
                    )}
                  </div>

                  <CardDescription className="mt-3 line-clamp-2 min-h-10">
                    {subEvent.description ||
                      'No description provided for this activity.'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2.5 rounded-xl bg-muted/30 p-3">
                    {subEvent.schedule && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 shrink-0 text-primary" />
                        <span>
                          {format(
                            new Date(subEvent.schedule),
                            'MMM d, yyyy • h:mm a'
                          )}
                        </span>
                      </div>
                    )}

                    {subEvent.venue && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span className="truncate">
                          {subEvent.venue}
                        </span>
                      </div>
                    )}

                    {subEvent.max_participants && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4 shrink-0" />
                        <span>
                          Max {subEvent.max_participants}{' '}
                          participants
                        </span>
                      </div>
                    )}

                    {!subEvent.schedule &&
                      !subEvent.venue &&
                      !subEvent.max_participants && (
                        <p className="text-xs text-muted-foreground">
                          No schedule or capacity details added.
                        </p>
                      )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-xl"
                      onClick={() =>
                        openEditDialog(subEvent)
                      }
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>

                      <AlertDialogContent className="rounded-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete Activity?
                          </AlertDialogTitle>

                          <AlertDialogDescription>
                            This will permanently delete "
                            {subEvent.name}" and all its
                            registrations.
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl">
                            Cancel
                          </AlertDialogCancel>

                          <AlertDialogAction
                            onClick={() =>
                              deleteSubEvent.mutate(
                                subEvent.id
                              )
                            }
                            className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="rounded-2xl border-dashed border-border/80 shadow-sm">
            <CardContent className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 rounded-2xl bg-primary/10 p-4">
                <Calendar className="h-9 w-9 text-primary" />
              </div>

              <h3 className="text-lg font-semibold">
                No activities yet
              </h3>

              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Add competitions, workshops, and activities to
                make this event ready for participants.
              </p>

              <Button
                className="mt-5 rounded-xl"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add First Activity
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  iconClass,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  iconClass: string;
}) {
  return (
    <Card className="relative overflow-hidden rounded-2xl border-border/70 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <div className="absolute left-0 top-0 h-1 w-full bg-primary/70" />

      <CardContent className="flex items-center gap-4 p-5 pt-6">
        <div className={`rounded-xl p-3 ${iconClass}`}>
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <p className="text-sm text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
