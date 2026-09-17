import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAdminEvents, useDeleteEvent } from '@/hooks/useAdminEvents';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  Search, 
  Calendar, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  Eye,
  Users,
  ListTree
} from 'lucide-react';
import { format } from 'date-fns';

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  upcoming: 'bg-primary/10 text-primary',
  active: 'bg-green-500/10 text-green-600',
  completed: 'bg-secondary text-secondary-foreground',
  cancelled: 'bg-destructive/10 text-destructive',
};

export default function SuperAdminEvents() {
  const { data: events, isLoading } = useAdminEvents();
  const deleteEvent = useDeleteEvent();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredEvents = events?.filter((event) => {
    const matchesSearch = event.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Events Management</h1>
            <p className="text-muted-foreground">
              Create and manage college events, fests, and activities
            </p>
          </div>
          <Button asChild>
            <Link to="/super-admin/events/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Events Table */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : filteredEvents && filteredEvents.length > 0 ? (
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <Card key={event.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                      {event.banner_url ? (
                        <img
                          src={event.banner_url}
                          alt={event.name}
                          className="h-full w-full rounded-lg object-cover"
                        />
                      ) : (
                        <Calendar className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{event.name}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        {event.start_date && (
                          <span>{format(new Date(event.start_date), 'MMM d, yyyy')}</span>
                        )}
                        <span>•</span>
                        <span>/{event.slug}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge className={statusColors[event.status]}>
                      {event.status}
                    </Badge>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/events/${event.slug}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Public Page
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/super-admin/events/${event.id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Event
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/super-admin/events/${event.id}/sub-events`}>
                            <ListTree className="mr-2 h-4 w-4" />
                            Manage Activities
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/super-admin/events/${event.id}/coordinators`}>
                            <Users className="mr-2 h-4 w-4" />
                            Manage Coordinators
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Event
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Event?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete "{event.name}" and all its activities,
                                registrations, and results. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteEvent.mutate(event.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-medium">No events found</h3>
              <p className="text-muted-foreground mb-4">
                {search || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first event to get started'}
              </p>
              {!search && statusFilter === 'all' && (
                <Button asChild>
                  <Link to="/super-admin/events/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Event
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
