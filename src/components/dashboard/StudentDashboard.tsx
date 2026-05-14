import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Briefcase,
  Trophy,
  Users,
  Loader2,
  FileText,
  Image as ImageIcon,
  UserCircle,
} from 'lucide-react';
import type { Event, JobPosting } from '@/types/database';
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

interface DashboardStats {
  upcomingEvents: number;
  myRegistrations: number;
  activeJobs: number;
  myApplications: number;
}

export function StudentDashboard() {
  const { profile } = useAuth();
  const { data: activity } = useActivityFeed('student', profile?.user_id);
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
        const { data: eventsData, count: eventsCount } = await supabase
          .from('events')
          .select('*', { count: 'exact' })
          .in('status', ['upcoming', 'active'])
          .order('start_date', { ascending: true })
          .limit(4);

        const { count: registrationsCount } = await supabase
          .from('event_registrations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.user_id);

        const { data: jobsData, count: jobsCount } = await supabase
          .from('job_postings')
          .select('*', { count: 'exact' })
          .eq('status', 'open')
          .order('created_at', { ascending: false })
          .limit(3);

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
      <DashboardHeader
        title={`Welcome back, ${profile?.name?.split(' ')[0] || 'there'} 👋`}
        subtitle="Here's what's happening on campus today."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Active Events" value={stats.upcomingEvents} caption="Events you can join" icon={Calendar} />
        <StatTile label="My Registrations" value={stats.myRegistrations} caption="Events joined" icon={Users} tone="success" />
        <StatTile label="Job Openings" value={stats.activeJobs} caption="Positions available" icon={Briefcase} tone="info" />
        <StatTile label="My Applications" value={stats.myApplications} caption="Jobs applied" icon={Trophy} tone="warning" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel
            title="Upcoming Events"
            description="Don't miss out on campus activities"
            action={<ViewAllLink to="/events" />}
          >
            {upcomingEvents.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {upcomingEvents.map((event) => (
                  <Link
                    key={event.id}
                    to={`/events/${event.slug}`}
                    className="rounded-2xl bg-background p-4 shadow-extruded-sm transition-all hover:-translate-y-0.5 hover:shadow-extruded"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold line-clamp-1">{event.name}</p>
                      <Badge variant={event.status === 'active' ? 'success' : 'default'}>{event.status}</Badge>
                    </div>
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {event.start_date ? new Date(event.start_date).toLocaleDateString() : 'Date TBD'}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-6">No upcoming events at the moment</p>
            )}
          </Panel>

          <Panel
            title="Recent Job Postings"
            description="Latest placement opportunities"
            action={<ViewAllLink to="/placements" />}
          >
            {recentJobs.length > 0 ? (
              <ul className="space-y-3">
                {recentJobs.map((job) => (
                  <li
                    key={job.id}
                    className="flex items-center justify-between rounded-2xl bg-background p-4 shadow-extruded-sm transition-all hover:shadow-inset-sm"
                  >
                    <div>
                      <p className="font-semibold">{job.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {job.package_lpa ? `${job.package_lpa} LPA` : 'Package TBD'}
                      </p>
                    </div>
                    {job.deadline && (
                      <Badge variant="outline">Due {new Date(job.deadline).toLocaleDateString()}</Badge>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-muted-foreground py-6">No job postings available</p>
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Live Activity" description="What's new for you">
            {activity.length > 0 ? <ActivityFeed items={activity} /> : <p className="text-sm text-muted-foreground">No recent activity</p>}
          </Panel>

          <Panel title="Quick Tools">
            <QuickToolsGrid
              items={[
                { label: 'My Events', icon: Calendar, to: '/my-events' },
                { label: 'Applications', icon: FileText, to: '/my-applications' },
                { label: 'Gallery', icon: ImageIcon, to: '/events' },
                { label: 'Profile', icon: UserCircle, to: '/profile' },
              ]}
            />
          </Panel>

          <StatusPill status="operational" label="Operational" />
        </div>
      </div>
    </div>
  );
}
