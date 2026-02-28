import { MainLayout } from '@/components/layout/MainLayout';
import { useMyEventParticipations, useMyRegistrations } from '@/hooks/useEvents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function MyEvents() {
  const { data: participations, isLoading } = useMyEventParticipations();
  const { data: registrations } = useMyRegistrations();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'waitlisted': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  // Group sub-event registrations by event_id
  const regsByEvent = (registrations || []).reduce<Record<string, typeof registrations>>((acc, reg: any) => {
    const eventId = reg.sub_events?.events?.id;
    if (eventId) {
      if (!acc[eventId]) acc[eventId] = [];
      acc[eventId]!.push(reg);
    }
    return acc;
  }, {});

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild className="pl-0">
            <Link to="/profile">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Profile
            </Link>
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold">My Events</h1>
          <p className="text-muted-foreground">Events you've registered for</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        ) : !participations?.length ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-medium">No events yet</h3>
            <p className="text-muted-foreground mb-4">Browse events and register to participate</p>
            <Button asChild>
              <Link to="/events">Browse Events</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {participations.map((p: any) => {
              const event = p.events;
              const eventRegs = regsByEvent[event?.id] || [];
              return (
                <Card key={p.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        <Link to={`/events/${event?.slug}`} className="hover:underline">
                          {event?.name}
                        </Link>
                      </CardTitle>
                      <Badge variant="outline">{event?.status}</Badge>
                    </div>
                    {event?.start_date && (
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(event.start_date), 'MMMM d, yyyy')}
                        {event.end_date && event.end_date !== event.start_date && (
                          <> - {format(new Date(event.end_date), 'MMMM d, yyyy')}</>
                        )}
                      </p>
                    )}
                  </CardHeader>
                  {eventRegs.length > 0 && (
                    <CardContent>
                      <p className="text-sm font-medium mb-2">Registered Activities:</p>
                      <div className="space-y-2">
                        {eventRegs.map((reg: any) => (
                          <div key={reg.id} className="flex items-center justify-between rounded border p-2 text-sm">
                            <span>{reg.sub_events?.name}</span>
                            <Badge className={getStatusColor(reg.status)}>{reg.status}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
