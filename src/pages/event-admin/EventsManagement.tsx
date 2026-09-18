import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Loader2,
  Users,
  Trophy,
  Image,
  ClipboardCheck,
  ArrowUpRight,
  Sparkles,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMyAssignedEvents } from '@/hooks/useEventAdmin';

export default function EventsManagement() {
  const { data: events = [], isLoading } = useMyAssignedEvents();

  const activeEvents = events.filter((event) => event.status === 'active').length;
  const completedEvents = events.filter((event) => event.status === 'completed').length;

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
                Event Management
              </div>

              <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                My Events
              </h1>

              <p className="mt-2 max-w-2xl text-muted-foreground">
                Manage assigned events, activities, registrations, attendance,
                results, and event galleries.
              </p>
            </div>

            <div className="flex gap-3">
              <div className="rounded-2xl border border-border/60 bg-background/70 px-5 py-3">
                <p className="text-xs text-muted-foreground">Assigned</p>
                <p className="mt-1 text-2xl font-bold">{events.length}</p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-background/70 px-5 py-3">
                <p className="text-xs text-muted-foreground">Active</p>
                <p className="mt-1 text-2xl font-bold text-primary">
                  {activeEvents}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
            <div className="mb-3 w-fit rounded-xl bg-primary/10 p-2.5">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <p className="text-2xl font-bold">{events.length}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Total assigned events
            </p>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
            <div className="mb-3 w-fit rounded-xl bg-blue-500/10 p-2.5">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold">{activeEvents}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Currently active
            </p>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
            <div className="mb-3 w-fit rounded-xl bg-emerald-500/10 p-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold">{completedEvents}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Completed events
            </p>
          </div>
        </div>

        {/* Events */}
        <Card className="overflow-hidden rounded-2xl border-border/70 shadow-sm">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex min-h-[320px] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="rounded-2xl bg-primary/10 p-4">
                    <Loader2 className="h-7 w-7 animate-spin text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Loading assigned events...
                  </p>
                </div>
              </div>
            ) : events.length === 0 ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 rounded-2xl bg-primary/10 p-4">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>

                <h3 className="text-lg font-semibold">
                  No events assigned
                </h3>

                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Events assigned to you will appear here for management.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <TableWrapper>
                  {events.map((event) => (
                    <EventRow key={event.id} event={event} />
                  ))}
                </TableWrapper>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

function TableWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <table className="w-full min-w-[1050px] text-sm">
      <thead>
        <tr className="border-b border-border/70 bg-muted/30 text-left">
          <th className="px-5 py-4 font-semibold">Event</th>
          <th className="px-5 py-4 font-semibold">Dates</th>
          <th className="px-5 py-4 font-semibold">Status</th>
          <th className="px-5 py-4 text-right font-semibold">Actions</th>
        </tr>
      </thead>

      <tbody className="divide-y divide-border/60">
        {children}
      </tbody>
    </table>
  );
}

function EventRow({ event }: { event: any }) {
  const status =
    event.status === 'active'
      ? {
          label: 'Active',
          className:
            'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
        }
      : event.status === 'completed'
      ? {
          label: 'Completed',
          className:
            'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
        }
      : {
          label: event.status,
          className: 'bg-muted text-muted-foreground',
        };

  return (
    <tr className="group transition-colors hover:bg-primary/[0.025]">
      <td className="px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Calendar className="h-5 w-5 text-primary" />
          </div>

          <div className="min-w-0">
            <p className="truncate font-semibold">{event.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Assigned event
            </p>
          </div>
        </div>
      </td>

      <td className="px-5 py-5">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {event.start_date
              ? new Date(event.start_date).toLocaleDateString()
              : 'TBD'}

            {event.end_date &&
              ` – ${new Date(event.end_date).toLocaleDateString()}`}
          </span>
        </div>
      </td>

      <td className="px-5 py-5">
        <Badge className={`rounded-full px-3 py-1 ${status.className}`}>
          {status.label}
        </Badge>
      </td>

      <td className="px-5 py-5">
        <div className="flex flex-wrap justify-end gap-1.5">
          <ActionButton
            to={`/admin/events/${event.id}/sub-events`}
            icon={Calendar}
            label="Activities"
          />

          <ActionButton
            to="/admin/registrations"
            icon={Users}
            label="Registrations"
          />

          <ActionButton
            to="/admin/results"
            icon={Trophy}
            label="Results"
          />

          <ActionButton
            to="/admin/gallery"
            icon={Image}
            label="Gallery"
          />

          <ActionButton
            to={`/admin/events/${event.id}/attendance`}
            icon={ClipboardCheck}
            label="Attendance"
            primary
          />
        </div>
      </td>
    </tr>
  );
}

function ActionButton({
  to,
  icon: Icon,
  label,
  primary = false,
}: {
  to: string;
  icon: React.ElementType;
  label: string;
  primary?: boolean;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      asChild
      className={`rounded-xl transition-all ${
        primary
          ? 'border-primary/30 text-primary hover:bg-primary/10'
          : 'border-border/60'
      }`}
    >
      <Link to={to}>
        <Icon className="mr-1.5 h-3.5 w-3.5" />
        {label}
        <ArrowUpRight className="ml-0.5 h-3 w-3" />
      </Link>
    </Button>
  );
}
