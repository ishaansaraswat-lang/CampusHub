import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Users,
  Trophy,
  Image as ImageIcon,
  Loader2,
  Megaphone,
  FileBarChart,
  ClipboardList,
  ArrowRight,
} from 'lucide-react';
import type { Event } from '@/types/database';
import {
  DashboardHeader,
  StatTile,
  Panel,
  ViewAllLink,
  ActivityFeed,
  QuickToolsGrid,
  StatusPill,
} from './shared';
import { useActivityFeed } from '@/hooks/useActivityFeed';

interface EventAdminStats {
  assignedEvents: number;
  pendingRegistrations: number;
  totalParticipants: number;
  publishedResults: number;
}

export function EventAdminDashboard() {
  const { profile } = useAuth();
  const { data: activity } = useActivityFeed('event_admin', profile?.user_id);
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
        const { data: coordinatorData } = await supabase
          .from('event_coordinators')
          .select('event_id')
          .eq('user_id', profile.user_id);
        const eventIds = coordinatorData?.map((c) => c.event_id) || [];

        if (eventIds.length > 0) {
          const { data: eventsData, count: eventsCount } = await supabase
            .from('events')
            .select('*', { count: 'exact' })
            .in('id', eventIds)
            .order('start_date', { ascending: false })
            .limit(5);

          const { data: subEventsData } = await supabase
            .from('sub_events')
            .select('id')
            .in('event_id', eventIds);
          const subEventIds = subEventsData?.map((se) => se.id) || [];

          const { count: pendingCount } = await supabase
            .from('event_registrations')
            .select('*', { count: 'exact', head: true })
            .in('sub_event_id', subEventIds)
            .eq('status', 'pending');

          const { count: participantsCount } = await supabase
            .from('event_registrations')
            .select('*', { count: 'exact', head: true })
            .in('sub_event_id', subEventIds)
            .eq('status', 'confirmed');

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
      <DashboardHeader
        title="Admin Dashboard 👋"
        subtitle={`Overseeing ${stats.assignedEvents} active event${stats.assignedEvents === 1 ? '' : 's'}.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Participants" value={stats.totalParticipants} caption="Confirmed registrations" icon={Users} tone="success" />
        <StatTile label="Pending" value={`${stats.pendingRegistrations} Regs`} caption="Needs attention" icon={ClipboardList} tone="warning" />
        <StatTile label="Assigned Events" value={stats.assignedEvents} caption="Events you manage" icon={Calendar} />
        <StatTile label="Published Results" value={stats.publishedResults} caption="Winners announced" icon={Trophy} tone="info" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel
            title="Managed Events"
            description="Events assigned to you"
            action={<ViewAllLink to="/admin/events" />}
          >
            {myEvents.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {myEvents.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-2xl bg-background p-4 shadow-extruded-sm transition-all hover:-translate-y-0.5 hover:shadow-extruded"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <Badge
                        variant={
                          event.status === 'active'
                            ? 'success'
                            : event.status === 'completed'
                            ? 'secondary'
                            : 'default'
                        }
                      >
                        {event.status}
                      </Badge>
                    </div>
                    <p className="mt-3 font-display text-lg font-bold line-clamp-1">{event.name}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1 shadow-inset-sm">
                        <Calendar className="h-3.5 w-3.5" />
                        {event.start_date ? new Date(event.start_date).toLocaleDateString() : 'Date TBD'}
                      </span>
                    </div>
                    <Link
                      to={`/admin/events`}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1.5 text-xs font-semibold text-primary shadow-extruded-xs transition-all hover:shadow-inset-sm"
                    >
                      Manage <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-6">No events assigned to you yet</p>
            )}
          </Panel>

          <Panel
            title="Pending Registrations"
            description="Awaiting your approval"
            action={
              <Button size="sm" asChild>
                <Link to="/admin/registrations">Process All</Link>
              </Button>
            }
          >
            <div className="rounded-2xl bg-background p-4 shadow-inset-sm text-sm text-muted-foreground">
              {stats.pendingRegistrations > 0
                ? `${stats.pendingRegistrations} registrations are waiting for review.`
                : 'No pending registrations right now.'}
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Live Activity" description="Recent updates">
            {activity.length > 0 ? <ActivityFeed items={activity} /> : <p className="text-sm text-muted-foreground">No recent activity</p>}
          </Panel>

          <Panel title="Admin Tools">
            <QuickToolsGrid
              items={[
                { label: 'Broadcast', icon: Megaphone, to: '/admin/registrations' },
                { label: 'Reports', icon: FileBarChart, to: '/admin/results' },
                { label: 'Gallery', icon: ImageIcon, to: '/admin/gallery' },
                { label: 'Volunteers', icon: Users, to: '/admin/registrations' },
              ]}
            />
          </Panel>

          <StatusPill status="operational" label="Operational" />
        </div>
      </div>
    </div>
  );
}
