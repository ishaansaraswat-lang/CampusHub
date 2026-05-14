import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

import { Link } from 'react-router-dom';
import {
  Calendar,
  Users,
  Building2,
  Settings,
  Loader2,
} from 'lucide-react';
import type { Event, Profile } from '@/types/database';
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

interface SuperAdminStats {
  totalUsers: number;
  totalEvents: number;
  activeEvents: number;
  totalCompanies: number;
}

export function SuperAdminDashboard() {
  const { data: activity } = useActivityFeed('super_admin');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SuperAdminStats>({
    totalUsers: 0,
    totalEvents: 0,
    activeEvents: 0,
    totalCompanies: 0,
  });
  const [recentUsers, setRecentUsers] = useState<Profile[]>([]);
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: usersData, count: usersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .limit(5);

        const { data: eventsData, count: eventsCount } = await supabase
          .from('events')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .limit(5);

        const { count: activeCount } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .in('status', ['upcoming', 'active']);

        const { count: companiesCount } = await supabase
          .from('companies')
          .select('*', { count: 'exact', head: true });

        setStats({
          totalUsers: usersCount || 0,
          totalEvents: eventsCount || 0,
          activeEvents: activeCount || 0,
          totalCompanies: companiesCount || 0,
        });
        setRecentUsers((usersData as Profile[]) || []);
        setRecentEvents((eventsData as Event[]) || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

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
        title="Super Admin Dashboard"
        subtitle="System overview and management."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Total Users" value={stats.totalUsers} caption="Registered users" icon={Users} />
        <StatTile label="Total Events" value={stats.totalEvents} caption="All events" icon={Calendar} tone="info" />
        <StatTile label="Active Events" value={stats.activeEvents} caption="Currently running" icon={Calendar} tone="success" />
        <StatTile label="Companies" value={stats.totalCompanies} caption="For placements" icon={Building2} tone="warning" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel
            title="Recent Events"
            description="Latest created events"
            action={<ViewAllLink to="/super-admin/events" />}
          >
            {recentEvents.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {recentEvents.map((event) => (
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
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {event.start_date ? new Date(event.start_date).toLocaleDateString() : 'Date TBD'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-6">No events created yet</p>
            )}
          </Panel>

          <Panel
            title="Recent Users"
            description="Newly registered users"
            action={<ViewAllLink to="/super-admin/users" />}
          >
            {recentUsers.length > 0 ? (
              <ul className="space-y-3">
                {recentUsers.map((user) => (
                  <li
                    key={user.id}
                    className="flex items-center justify-between rounded-2xl bg-background p-4 shadow-extruded-sm transition-all hover:shadow-inset-sm"
                  >
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <Badge variant="secondary">{user.department || 'No dept'}</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-muted-foreground py-6">No users registered yet</p>
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Live Activity" description="System events">
            {activity.length > 0 ? <ActivityFeed items={activity} /> : <p className="text-sm text-muted-foreground">No recent activity</p>}
          </Panel>

          <Panel title="Admin Tools">
            <QuickToolsGrid
              items={[
                { label: 'Events', icon: Calendar, to: '/super-admin/events' },
                { label: 'Users', icon: Users, to: '/super-admin/users' },
                { label: 'Companies', icon: Building2, to: '/placement-admin/companies' },
                { label: 'Settings', icon: Settings, to: '/super-admin/settings' },
              ]}
            />
          </Panel>

          <StatusPill status="operational" label="Operational" />
        </div>
      </div>
    </div>
  );
}
