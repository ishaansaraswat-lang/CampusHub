import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Loader2, Users, Trophy, Image } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMyAssignedEvents } from '@/hooks/useEventAdmin';

export default function EventsManagement() {
  const { data: events = [], isLoading } = useMyAssignedEvents();

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Events</h1>
          <p className="text-muted-foreground">Events assigned to you for management</p>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : events.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <Calendar className="mx-auto mb-2 h-8 w-8" />
                No events assigned to you yet
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.name}</TableCell>
                      <TableCell>
                        {event.start_date
                          ? new Date(event.start_date).toLocaleDateString()
                          : 'TBD'}
                        {event.end_date && ` – ${new Date(event.end_date).toLocaleDateString()}`}
                      </TableCell>
                      <TableCell>
                        <Badge variant={event.status === 'active' ? 'default' : event.status === 'completed' ? 'secondary' : 'outline'}>
                          {event.status}
                        </Badge>
                      </TableCell>
                        <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/admin/events/${event.id}/sub-events`}><Calendar className="mr-1 h-3 w-3" />Activities</Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to="/admin/registrations"><Users className="mr-1 h-3 w-3" />Registrations</Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to="/admin/results"><Trophy className="mr-1 h-3 w-3" />Results</Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to="/admin/gallery"><Image className="mr-1 h-3 w-3" />Gallery</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
