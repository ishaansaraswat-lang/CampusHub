import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Calendar, Users, Trophy, Image, ArrowRight, Loader2 } from 'lucide-react';
import type { Event } from '@/types/database';

interface EventAdminStats {
  assignedEvents: number;
  pendingRegistrations: number;
  totalParticipants: number;
  publishedResults: number;
}

export function EventAdminDashboard() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<EventAdminStats>({
    assignedEvents: 0,
    pendingRegistrations: 0,
    totalParticipants: 0,
    publishedResults: 0,
  });
  const [myEvents, setMyEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!profile) return;

      try {
        // Get assigned event IDs
        const { data: coordinatorData } = await supabase
          .from('event_coordinators')
          .select('event_id')
          .eq('user_id', profile.user_id);

        const eventIds = coordinatorData?.map((c) => c.event_id) || [];

        if (eventIds.length > 0) {
          // Fetch assigned events
          const { data: eventsData, count: eventsCount } = await supabase
            .from('events')
            .select('*', { count: 'exact' })
            .in('id', eventIds)
            .order('start_date', { ascending: false })
            .limit(5);

          // Get sub-event IDs for these events
          const { data: subEventsData } = await supabase
            .from('sub_events')
            .select('id')
            .in('event_id', eventIds);

          const subEventIds = subEventsData?.map((se) => se.id) || [];

          // Count pending registrations
          const { count: pendingCount } = await supabase
            .from('event_registrations')
            .select('*', { count: 'exact', head: true })
            .in('sub_event_id', subEventIds)
            .eq('status', 'pending');

          // Count total participants
          const { count: participantsCount } = await supabase
            .from('event_registrations')
            .select('*', { count: 'exact', head: true })
            .in('sub_event_id', subEventIds)
            .eq('status', 'confirmed');

          // Count published results
          const { count: resultsCount } = await supabase
            .from('event_results')
            .select('*', { count: 'exact', head: true })
            .in('sub_event_id', subEventIds);

          setStats({
            assignedEvents: eventsCount || 0,
            pendingRegistrations: pendingCount || 0,
            totalParticipants: participantsCount || 0,
            publishedResults: resultsCount || 0,
          });

          setMyEvents((eventsData as Event[]) || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [profile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Event Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your assigned events and registrations
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.assignedEvents}</div>
            <p className="text-xs text-muted-foreground">Events you manage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Registrations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingRegistrations}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalParticipants}</div>
            <p className="text-xs text-muted-foreground">Confirmed registrations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published Results</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.publishedResults}</div>
            <p className="text-xs text-muted-foreground">Winners announced</p>
          </CardContent>
        </Card>
      </div>

      {/* My Events */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Events</CardTitle>
              <CardDescription>Events assigned to you</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/events">
                View all <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {myEvents.length > 0 ? (
            <div className="space-y-4">
              {myEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{event.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {event.start_date
                        ? new Date(event.start_date).toLocaleDateString()
                        : 'Date TBD'}
                    </p>
                  </div>
                  <Badge
                    variant={
                      event.status === 'active'
                        ? 'default'
                        : event.status === 'completed'
                        ? 'secondary'
                        : 'outline'
                    }
                  >
                    {event.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No events assigned to you yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
