import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import {
  useAdminEvent,
  useEventCoordinators,
  useAddCoordinator,
  useRemoveCoordinator,
  useAllProfiles,
} from '@/hooks/useAdminEvents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { ArrowLeft, Plus, Search, UserPlus, X, Loader2, Users } from 'lucide-react';

export default function CoordinatorsManagement() {
  const { id: eventId } = useParams<{ id: string }>();
  const { data: event, isLoading: eventLoading } = useAdminEvent(eventId || '');
  const { data: coordinators, isLoading: coordinatorsLoading } = useEventCoordinators(eventId || '');
  const { data: allProfiles, isLoading: profilesLoading } = useAllProfiles();
  const addCoordinator = useAddCoordinator();
  const removeCoordinator = useRemoveCoordinator();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [search, setSearch] = useState('');

  const coordinatorUserIds = new Set(coordinators?.map((c) => c.user_id) || []);

  const availableProfiles = allProfiles?.filter(
    (profile) =>
      !coordinatorUserIds.has(profile.user_id) &&
      (profile.name.toLowerCase().includes(search.toLowerCase()) ||
        profile.email.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAddCoordinator = async (userId: string) => {
    if (!eventId) return;
    await addCoordinator.mutateAsync({ eventId, userId });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (eventLoading) {
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
          <h2 className="text-2xl font-bold">Event not found</h2>
          <Button asChild className="mt-4">
            <Link to="/super-admin/events">Back to Events</Link>
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
              <Link to="/super-admin/events">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Events
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">{event.name}</h1>
            <p className="text-muted-foreground">Manage event coordinators and admins</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Coordinator
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Coordinator</DialogTitle>
                <DialogDescription>
                  Search and add a user as an event coordinator
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <div className="max-h-64 space-y-2 overflow-y-auto">
                  {profilesLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : availableProfiles && availableProfiles.length > 0 ? (
                    availableProfiles.slice(0, 10).map((profile) => (
                      <div
                        key={profile.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={profile.avatar_url || undefined} />
                            <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{profile.name}</p>
                            <p className="text-xs text-muted-foreground">{profile.email}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAddCoordinator(profile.user_id)}
                          disabled={addCoordinator.isPending}
                        >
                          {addCoordinator.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-sm text-muted-foreground py-4">
                      {search ? 'No users found' : 'All users are already coordinators'}
                    </p>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Coordinators List */}
        <Card>
          <CardHeader>
            <CardTitle>Event Coordinators</CardTitle>
            <CardDescription>
              Users who can manage this event, its activities, and registrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {coordinatorsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : coordinators && coordinators.length > 0 ? (
              <div className="space-y-3">
                {coordinators.map((coordinator) => {
                  const profile = coordinator.profiles as any;
                  return (
                    <div
                      key={coordinator.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={profile?.avatar_url || undefined} />
                          <AvatarFallback>
                            {profile?.name ? getInitials(profile.name) : 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{profile?.name || 'Unknown User'}</p>
                          <p className="text-sm text-muted-foreground">
                            {profile?.email || 'No email'}
                          </p>
                        </div>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                            <X className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Coordinator?</AlertDialogTitle>
                            <AlertDialogDescription>
                              {profile?.name} will no longer be able to manage this event.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                removeCoordinator.mutate({ id: coordinator.id, eventId: eventId! })
                              }
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <Users className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-medium">No coordinators assigned</h3>
                <p className="text-muted-foreground mb-4">
                  Add coordinators to help manage this event
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Coordinator
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
