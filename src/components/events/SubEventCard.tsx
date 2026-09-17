import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';
import type { Tables } from '@/integrations/supabase/types';

type SubEvent = Tables<'sub_events'>;

interface SubEventCardProps {
  subEvent: SubEvent;
  onRegister?: (subEventId: string) => void;
  isRegistered?: boolean;
  isLoading?: boolean;
}

export function SubEventCard({ subEvent, onRegister, isRegistered, isLoading }: SubEventCardProps) {
  const isDeadlinePassed = subEvent.registration_deadline 
    ? new Date(subEvent.registration_deadline) < new Date() 
    : false;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{subEvent.name}</CardTitle>
          {subEvent.is_team_event && (
            <Badge variant="secondary">Team Event</Badge>
          )}
        </div>
        <CardDescription className="line-clamp-2">
          {subEvent.description || 'No description available'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          {subEvent.schedule && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{format(new Date(subEvent.schedule), 'MMM d, h:mm a')}</span>
            </div>
          )}
          {subEvent.venue && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{subEvent.venue}</span>
            </div>
          )}
          {subEvent.is_team_event && subEvent.team_size_min && subEvent.team_size_max && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>
                {subEvent.team_size_min === subEvent.team_size_max
                  ? `${subEvent.team_size_min} members`
                  : `${subEvent.team_size_min}-${subEvent.team_size_max} members`}
              </span>
            </div>
          )}
          {subEvent.max_participants && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Max {subEvent.max_participants}</span>
            </div>
          )}
        </div>

        {subEvent.registration_deadline && (
          <p className="text-xs text-muted-foreground">
            Registration deadline: {format(new Date(subEvent.registration_deadline), 'MMM d, yyyy h:mm a')}
          </p>
        )}

        {onRegister && (
          <Button
            className="w-full"
            onClick={() => onRegister(subEvent.id)}
            disabled={isRegistered || isDeadlinePassed || isLoading}
            variant={isRegistered ? 'secondary' : 'default'}
          >
            {isRegistered ? 'Already Registered' : isDeadlinePassed ? 'Registration Closed' : 'Register Now'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
