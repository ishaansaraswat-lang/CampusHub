import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Calendar, Users, Building2, Settings, ArrowRight, Loader2, Plus } from 'lucide-react';
import type { Event, Profile } from '@/types/database';

interface SuperAdminStats {
  totalUsers: number;
  totalEvents: number;
  activeEvents: number;
  totalCompanies: number;
}

export function SuperAdminDashboard() {
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
        // Count users
        const { data: usersData, count: usersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .limit(5);

        // Count events
        const { data: eventsData, count: eventsCount } = await supabase
          .from('events')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .limit(5);

        // Count active events
        const { count: activeCount } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .in('status', ['upcoming', 'active']);

        // Count companies
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">
            System overview and management
          </p>
        </div>
        <Button asChild>
          <Link to="/super-admin/events">
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">All events created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeEvents}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompanies}</div>
            <p className="text-xs text-muted-foreground">For placements</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>Newly registered users</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/super-admin/users">
                  View all <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentUsers.length > 0 ? (
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <Badge variant="secondary">
                      {user.department || 'No dept'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No users registered yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Events */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Events</CardTitle>
                <CardDescription>Latest created events</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/super-admin/events">
                  View all <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentEvents.length > 0 ? (
              <div className="space-y-4">
                {recentEvents.map((event) => (
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
                No events created yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            <Button className="justify-start" variant="outline" asChild>
              <Link to="/super-admin/events">
                <Calendar className="mr-2 h-4 w-4" />
                Manage Events
              </Link>
            </Button>
            <Button className="justify-start" variant="outline" asChild>
              <Link to="/super-admin/users">
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Link>
            </Button>
            <Button className="justify-start" variant="outline" asChild>
              <Link to="/placement-admin/companies">
                <Building2 className="mr-2 h-4 w-4" />
                Manage Companies
              </Link>
            </Button>
            <Button className="justify-start" variant="outline" asChild>
              <Link to="/super-admin/settings">
                <Settings className="mr-2 h-4 w-4" />
                System Settings
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
