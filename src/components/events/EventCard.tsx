import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import type { Tables } from '@/integrations/supabase/types';

type Event = Tables<'events'>;

interface EventCardProps {
  event: Event;
  subEventsCount?: number;
}

const statusColors: Record<string, string> = {
  upcoming: 'bg-primary/10 text-primary border-primary/20',
  active: 'bg-green-500/10 text-green-600 border-green-500/20',
  completed: 'bg-muted text-muted-foreground border-muted',
  draft: 'bg-muted text-muted-foreground border-muted',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
};

export function EventCard({ event, subEventsCount = 0 }: EventCardProps) {
  return (
    <Link to={`/events/${event.slug}`}>
      <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
        <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
          {event.banner_url ? (
            <img
              src={event.banner_url}
              alt={event.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              <Calendar className="h-12 w-12 text-primary/50" />
            </div>
          )}
        </div>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-1 text-lg">{event.name}</CardTitle>
            <Badge variant="outline" className={statusColors[event.status] || ''}>
              {event.status}
            </Badge>
          </div>
          <CardDescription className="line-clamp-2">
            {event.description || 'No description available'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {event.start_date && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(event.start_date), 'MMM d, yyyy')}</span>
              </div>
            )}
            {subEventsCount > 0 && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{subEventsCount} activities</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
