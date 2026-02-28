import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/hooks/useRole';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Calendar, Briefcase, Trophy, Users, ArrowRight, Loader2 } from 'lucide-react';
import type { Event, JobPosting, EventRegistration } from '@/types/database';

interface DashboardStats {
  upcomingEvents: number;
  myRegistrations: number;
  activeJobs: number;
  myApplications: number;
}

export function StudentDashboard() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    upcomingEvents: 0,
    myRegistrations: 0,
    activeJobs: 0,
    myApplications: 0,
  });
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [recentJobs, setRecentJobs] = useState<JobPosting[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!profile) return;

      try {
        // Fetch upcoming events
        const { data: eventsData, count: eventsCount } = await supabase
          .from('events')
          .select('*', { count: 'exact' })
          .in('status', ['upcoming', 'active'])
          .order('start_date', { ascending: true })
          .limit(3);

        // Fetch my registrations count
        const { count: registrationsCount } = await supabase
          .from('event_registrations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.user_id);

        // Fetch active job postings
        const { data: jobsData, count: jobsCount } = await supabase
          .from('job_postings')
          .select('*', { count: 'exact' })
          .eq('status', 'open')
          .order('created_at', { ascending: false })
          .limit(3);

        // Fetch my applications count
        const { count: applicationsCount } = await supabase
          .from('placement_applications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.user_id);

        setStats({
          upcomingEvents: eventsCount || 0,
          myRegistrations: registrationsCount || 0,
          activeJobs: jobsCount || 0,
          myApplications: applicationsCount || 0,
        });

        setUpcomingEvents((eventsData as Event[]) || []);
        setRecentJobs((jobsData as JobPosting[]) || []);
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
        <h1 className="text-3xl font-bold">Welcome back, {profile?.name?.split(' ')[0]}!</h1>
        <p className="text-muted-foreground">
          Here's what's happening on campus
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
            <p className="text-xs text-muted-foreground">Events you can join</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Registrations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.myRegistrations}</div>
            <p className="text-xs text-muted-foreground">Events you've joined</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Job Openings</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeJobs}</div>
            <p className="text-xs text-muted-foreground">Positions available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Applications</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.myApplications}</div>
            <p className="text-xs text-muted-foreground">Jobs you've applied to</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>Don't miss out on campus activities</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/events">
                  View all <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
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
                    <Badge variant={event.status === 'active' ? 'default' : 'secondary'}>
                      {event.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No upcoming events at the moment
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Job Postings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Job Postings</CardTitle>
                <CardDescription>Latest placement opportunities</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/placements">
                  View all <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentJobs.length > 0 ? (
              <div className="space-y-4">
                {recentJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">{job.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {job.package_lpa ? `${job.package_lpa} LPA` : 'Package TBD'}
                      </p>
                    </div>
                    {job.deadline && (
                      <Badge variant="outline">
                        Due {new Date(job.deadline).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No job postings available
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
