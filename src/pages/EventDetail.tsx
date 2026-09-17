import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { SubEventCard } from '@/components/events/SubEventCard';
import {
  useEvent,
  useSubEvents,
  useMyRegistrations,
  useRegisterForEvent,
  useEventParticipation,
  useRegisterForParentEvent,
  useEventResults,
  useEventGallery,
} from '@/hooks/useEvents';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, ArrowLeft, Image, Trophy, Images, CheckCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function EventDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { data: event, isLoading: eventLoading } = useEvent(slug || '');
  const { data: subEvents, isLoading: subEventsLoading } = useSubEvents(event?.id || '');
  const { data: myRegistrations } = useMyRegistrations();
  const registerMutation = useRegisterForEvent();
  const { data: participation, isLoading: participationLoading } = useEventParticipation(event?.id || '');
  const registerParent = useRegisterForParentEvent();
  const { data: results } = useEventResults(event?.id || '');
  const { data: gallery } = useEventGallery(event?.id || '');

  const registeredSubEventIds = new Set(
    myRegistrations?.map((reg) => reg.sub_event_id) || []
  );

  const handleRegister = (subEventId: string) => {
    registerMutation.mutate({ subEventId });
  };

  const handleRegisterForEvent = () => {
    if (event) registerParent.mutate(event.id);
  };

  if (eventLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="aspect-[3/1] w-full rounded-lg" />
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </MainLayout>
    );
  }

  if (!event) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h2 className="text-2xl font-bold">Event not found</h2>
          <p className="text-muted-foreground mb-4">
            The event you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/events">Browse Events</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  const statusColors: Record<string, string> = {
    upcoming: 'bg-primary/10 text-primary border-primary/20',
    active: 'bg-green-500/10 text-green-600 border-green-500/20',
    completed: 'bg-muted text-muted-foreground border-muted',
  };

  const isRegisteredForEvent = !!participation;

  // Group results by sub-event
  const resultsBySubEvent = (results || []).reduce<Record<string, typeof results>>((acc, r) => {
    const key = r.sub_event_name;
    if (!acc[key]) acc[key] = [];
    acc[key]!.push(r);
    return acc;
  }, {});

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Back button */}
        <Button variant="ghost" asChild className="pl-0">
          <Link to="/events">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Link>
        </Button>

        {/* Banner */}
        <div className="aspect-[3/1] w-full overflow-hidden rounded-lg bg-muted">
          {event.banner_url ? (
            <img src={event.banner_url} alt={event.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              <Image className="h-16 w-16 text-primary/30" />
            </div>
          )}
        </div>

        {/* Event Info */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{event.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-muted-foreground">
                {event.start_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(event.start_date), 'MMMM d, yyyy')}
                      {event.end_date && event.end_date !== event.start_date && (
                        <> - {format(new Date(event.end_date), 'MMMM d, yyyy')}</>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <Badge variant="outline" className={statusColors[event.status] || ''}>
              {event.status}
            </Badge>
          </div>

          {event.description && (
            <p className="text-muted-foreground">{event.description}</p>
          )}

          {/* Register for Event button */}
          {user && !isRegisteredForEvent && !participationLoading && (
            <Button onClick={handleRegisterForEvent} disabled={registerParent.isPending} size="lg">
              {registerParent.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Register for this Event
            </Button>
          )}
          {user && isRegisteredForEvent && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              You are registered for this event
            </div>
          )}
        </div>

        {/* Tabs for Activities, Results, Gallery */}
        <Tabs defaultValue="activities" className="space-y-4">
          <TabsList>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            {(results?.length ?? 0) > 0 && <TabsTrigger value="results">Results</TabsTrigger>}
            {(gallery?.length ?? 0) > 0 && <TabsTrigger value="gallery">Gallery</TabsTrigger>}
          </TabsList>

          {/* Activities Tab */}
          <TabsContent value="activities" className="space-y-4">
            <h2 className="text-2xl font-bold">Activities & Competitions</h2>

            {!user && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">Sign in to register for activities</p>
                <Button asChild size="sm">
                  <Link to="/auth">Sign In</Link>
                </Button>
              </div>
            )}

            {user && !isRegisteredForEvent && !participationLoading && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Register for this event first to participate in activities
                </p>
              </div>
            )}

            {subEventsLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-3 p-4 border rounded-lg">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                ))}
              </div>
            ) : subEvents && subEvents.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {subEvents.map((subEvent) => (
                  <SubEventCard
                    key={subEvent.id}
                    subEvent={subEvent}
                    onRegister={user && isRegisteredForEvent ? handleRegister : undefined}
                    isRegistered={registeredSubEventIds.has(subEvent.id)}
                    isLoading={registerMutation.isPending}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No activities have been added to this event yet.</p>
              </div>
            )}
          </TabsContent>

          {/* Results Tab */}
          {(results?.length ?? 0) > 0 && (
            <TabsContent value="results" className="space-y-4">
              <h2 className="text-2xl font-bold">Results</h2>
              {Object.entries(resultsBySubEvent).map(([subEventName, subResults]) => (
                <Card key={subEventName}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-primary" />
                      {subEventName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {subResults!.map((r) => (
                        <div key={r.id} className="flex items-center justify-between rounded-lg border p-3">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="font-bold">
                              #{r.position}
                            </Badge>
                            <span className="font-medium">
                              {r.team_name || 'Individual'}
                            </span>
                          </div>
                          {r.remarks && <span className="text-sm text-muted-foreground">{r.remarks}</span>}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          )}

          {/* Gallery Tab */}
          {(gallery?.length ?? 0) > 0 && (
            <TabsContent value="gallery" className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Images className="h-6 w-6" />
                Gallery
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {gallery!.map((img) => (
                  <div key={img.id} className="overflow-hidden rounded-lg border">
                    <img
                      src={img.image_url}
                      alt={img.caption || 'Event photo'}
                      className="aspect-square w-full object-cover"
                    />
                    {img.caption && (
                      <p className="p-2 text-sm text-muted-foreground">{img.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </MainLayout>
  );
}
