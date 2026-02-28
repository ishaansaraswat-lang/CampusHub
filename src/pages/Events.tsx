import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { EventCard } from '@/components/events/EventCard';
import { useEvents, useSubEventsCounts } from '@/hooks/useEvents';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Calendar } from 'lucide-react';

export default function Events() {
  const { data: events, isLoading } = useEvents();
  const { data: subEventsCounts } = useSubEventsCounts();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredEvents = events?.filter((event) => {
    const matchesSearch = event.name.toLowerCase().includes(search.toLowerCase()) ||
      event.description?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground">
            Discover and register for campus events, fests, and activities
          </p>
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
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Events Grid */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-video w-full rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredEvents && filteredEvents.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                subEventsCount={subEventsCounts?.[event.id] || 0}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-medium">No events found</h3>
            <p className="text-muted-foreground">
              {search || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Check back later for upcoming events'}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
