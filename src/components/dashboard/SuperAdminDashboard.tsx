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
  GraduationCap,
  BriefcaseBusiness,
  Trophy,
  ClipboardList,
  TrendingUp,
  ArrowUpRight,
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
  admissionApplications: number;
  totalAdmissions: number;
  placementApplications: number;
  placementOffers: number;
}

export function SuperAdminDashboard() {
  const { data: activity } = useActivityFeed('super_admin');

  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<SuperAdminStats>({
    totalUsers: 0,
    totalEvents: 0,
    activeEvents: 0,
    totalCompanies: 0,
    admissionApplications: 0,
    totalAdmissions: 0,
    placementApplications: 0,
    placementOffers: 0,
  });

  const [recentUsers, setRecentUsers] = useState<Profile[]>([]);
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [
          usersResult,
          eventsResult,
          activeEventsResult,
          companiesResult,
          admissionsResult,
          placementApplicationsResult,
          placementOffersResult,
        ] = await Promise.all([
          supabase
            .from('profiles')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .limit(5),

          supabase
            .from('events')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .limit(5),

          supabase
            .from('events')
            .select('*', { count: 'exact', head: true })
            .in('status', ['upcoming', 'active']),

          supabase
            .from('companies')
            .select('*', { count: 'exact', head: true }),

          supabase
            .from('admission_records')
            .select('applications, admissions'),

          supabase
            .from('placement_applications')
            .select('*', { count: 'exact', head: true }),

          supabase
            .from('placement_results')
            .select('*', { count: 'exact', head: true }),
        ]);

        if (usersResult.error) throw usersResult.error;
        if (eventsResult.error) throw eventsResult.error;
        if (activeEventsResult.error) throw activeEventsResult.error;
        if (companiesResult.error) throw companiesResult.error;
        if (admissionsResult.error) throw admissionsResult.error;
        if (placementApplicationsResult.error) {
          throw placementApplicationsResult.error;
        }
        if (placementOffersResult.error) {
          throw placementOffersResult.error;
        }

        const admissionApplications =
          admissionsResult.data?.reduce(
            (total, record) => total + Number(record.applications || 0),
            0
          ) || 0;

        const totalAdmissions =
          admissionsResult.data?.reduce(
            (total, record) => total + Number(record.admissions || 0),
            0
          ) || 0;

        setStats({
          totalUsers: usersResult.count || 0,
          totalEvents: eventsResult.count || 0,
          activeEvents: activeEventsResult.count || 0,
          totalCompanies: companiesResult.count || 0,
          admissionApplications,
          totalAdmissions,
          placementApplications: placementApplicationsResult.count || 0,
          placementOffers: placementOffersResult.count || 0,
        });

        setRecentUsers((usersResult.data as Profile[]) || []);
        setRecentEvents((eventsResult.data as Event[]) || []);
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

  const admissionConversion =
    stats.admissionApplications > 0
      ? (stats.totalAdmissions / stats.admissionApplications) * 100
      : 0;

  const placementSelectionRate =
    stats.placementApplications > 0
      ? (stats.placementOffers / stats.placementApplications) * 100
      : 0;

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Super Admin Dashboard"
        subtitle="Central overview of CampusHub operations."
      />

      {/* Campus Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Total Users"
          value={stats.totalUsers}
          caption="Registered users"
          icon={Users}
        />

        <StatTile
          label="Total Events"
          value={stats.totalEvents}
          caption="All campus events"
          icon={Calendar}
          tone="info"
        />

        <StatTile
          label="Active Events"
          value={stats.activeEvents}
          caption="Upcoming or active"
          icon={Calendar}
          tone="success"
        />

        <StatTile
          label="Companies"
          value={stats.totalCompanies}
          caption="Placement partners"
          icon={Building2}
          tone="warning"
        />
      </div>

      {/* Admissions + Placement Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Admission Applications"
          value={stats.admissionApplications.toLocaleString()}
          caption="Across all admission records"
          icon={ClipboardList}
          tone="info"
        />

        <StatTile
          label="Total Admissions"
          value={stats.totalAdmissions.toLocaleString()}
          caption={`${admissionConversion.toFixed(1)}% conversion`}
          icon={GraduationCap}
          tone="success"
        />

        <StatTile
          label="Placement Applications"
          value={stats.placementApplications}
          caption="Student applications"
          icon={BriefcaseBusiness}
          tone="info"
        />

        <StatTile
          label="Offers Recorded"
          value={stats.placementOffers}
          caption={`${placementSelectionRate.toFixed(1)}% application-to-offer`}
          icon={Trophy}
          tone="success"
        />
      </div>

      {/* Module Overview */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Admissions */}
        <Panel
          title="Admissions Overview"
          description="Live admission performance"
          action={
            <Link
              to="/admissions/analytics"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              Analytics
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          }
        >
          <div className="space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Applications
                </span>
                <span className="font-semibold">
                  {stats.admissionApplications.toLocaleString()}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-full rounded-full bg-primary" />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Admissions
                </span>
                <span className="font-semibold">
                  {stats.totalAdmissions.toLocaleString()}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{
                    width: `${Math.min(admissionConversion, 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-background p-3 shadow-extruded-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  Conversion Rate
                </span>
              </div>

              <span className="font-bold text-primary">
                {admissionConversion.toFixed(1)}%
              </span>
            </div>
          </div>
        </Panel>

        {/* Placement */}
        <Panel
          title="Placement Overview"
          description="Live placement pipeline"
          action={
            <Link
              to="/placement-admin/statistics"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              Statistics
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          }
        >
          <div className="space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Applications
                </span>
                <span className="font-semibold">
                  {stats.placementApplications}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-full rounded-full bg-primary" />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Offers Recorded
                </span>
                <span className="font-semibold">
                  {stats.placementOffers}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{
                    width: `${Math.min(placementSelectionRate, 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-background p-3 shadow-extruded-sm">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  Offer Rate
                </span>
              </div>

              <span className="font-bold text-primary">
                {placementSelectionRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </Panel>

        {/* Quick Actions */}
        <Panel
          title="Quick Actions"
          description="Jump to important modules"
        >
          <QuickToolsGrid
            items={[
              {
                label: 'Events',
                icon: Calendar,
                to: '/super-admin/events',
              },
              {
                label: 'Users',
                icon: Users,
                to: '/super-admin/users',
              },
              {
                label: 'Companies',
                icon: Building2,
                to: '/placement-admin/companies',
              },
              {
                label: 'Admissions',
                icon: GraduationCap,
                to: '/admissions/manage',
              },
              {
                label: 'Analytics',
                icon: TrendingUp,
                to: '/admissions/analytics',
              },
              {
                label: 'Settings',
                icon: Settings,
                to: '/super-admin/settings',
              },
            ]}
          />
        </Panel>
      </div>

      {/* Recent Events + Users + Activity */}
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

                    <p className="mt-3 line-clamp-1 font-display text-lg font-bold">
                      {event.name}
                    </p>

                    <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {event.start_date
                        ? new Date(
                            event.start_date
                          ).toLocaleDateString()
                        : 'Date TBD'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-6 text-center text-muted-foreground">
                No events created yet
              </p>
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
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>

                    <Badge variant="secondary">
                      {user.department || 'No dept'}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-6 text-center text-muted-foreground">
                No users registered yet
              </p>
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel
            title="Live Activity"
            description="Recent system events"
          >
            {activity.length > 0 ? (
              <ActivityFeed items={activity} />
            ) : (
              <p className="text-sm text-muted-foreground">
                No recent activity
              </p>
            )}
          </Panel>

          <Panel title="Admin Tools">
            <QuickToolsGrid
              items={[
                {
                  label: 'Events',
                  icon: Calendar,
                  to: '/super-admin/events',
                },
                {
                  label: 'Users',
                  icon: Users,
                  to: '/super-admin/users',
                },
                {
                  label: 'Companies',
                  icon: Building2,
                  to: '/placement-admin/companies',
                },
                {
                  label: 'Settings',
                  icon: Settings,
                  to: '/super-admin/settings',
                },
              ]}
            />
          </Panel>

          <StatusPill
            status="operational"
            label="CampusHub Operational"
          />
        </div>
      </div>
    </div>
  );
}