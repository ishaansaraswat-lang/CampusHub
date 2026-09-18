import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  CalendarDays,
  BriefcaseBusiness,
  UserRound,
  Trophy,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Sparkles,
  Loader2,
} from 'lucide-react';

interface DashboardData {
  events: any[];
  registrations: any[];
  applications: any[];
  results: any[];
}

export default function Dashboard() {
  const { profile } = useAuth();

  const [data, setData] = useState<DashboardData>({
    events: [],
    registrations: [],
    applications: [],
    results: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!profile?.id && !profile?.user_id) return;

      try {
        setLoading(true);

        const userId = profile.user_id || profile.id;

        const [eventsRes, registrationsRes, applicationsRes, resultsRes] =
          await Promise.all([
            supabase.from('events').select('*').order('created_at', { ascending: false }),
            supabase
              .from('event_registrations')
              .select('*')
              .eq('user_id', userId)
              .order('created_at', { ascending: false }),
            supabase
              .from('placement_applications')
              .select('*')
              .eq('user_id', userId)
              .order('created_at', { ascending: false }),
            supabase
              .from('placement_results')
              .select('*')
              .eq('user_id', userId)
              .order('created_at', { ascending: false }),
          ]);

        setData({
          events: eventsRes.data || [],
          registrations: registrationsRes.data || [],
          applications: applicationsRes.data || [],
          results: resultsRes.data || [],
        });
      } catch (error) {
        console.error('Error loading student dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [profile?.id, profile?.user_id]);

  const profileCompletion = useMemo(() => {
    if (!profile) return 0;

    const fields = [
      profile.name,
      profile.email,
      profile.student_id,
      profile.department,
      profile.year,
      profile.cgpa,
      profile.phone,
      profile.avatar_url,
    ];

    return Math.round(
      (fields.filter((field) => field !== null && field !== undefined && field !== '').length /
        fields.length) *
        100
    );
  }, [profile]);

  const upcomingEvents = data.events.slice(0, 4);

  const getEventName = (event: any) =>
    event?.name || event?.title || 'Campus Event';

  const getEventDate = (event: any) => {
    const date =
      event?.start_date ||
      event?.event_date ||
      event?.date ||
      event?.created_at;

    if (!date) return 'Date TBA';

    try {
      return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Date TBA';
    }
  };

  const getStatusClass = (status: string) => {
    const value = status?.toLowerCase();

    if (['confirmed', 'approved', 'selected', 'present'].includes(value)) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }

    if (['pending', 'under_review', 'shortlisted'].includes(value)) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }

    if (['rejected', 'cancelled', 'withdrawn'].includes(value)) {
      return 'bg-red-50 text-red-700 border-red-200';
    }

    return 'bg-slate-50 text-slate-600 border-slate-200';
  };

  return (
    <MainLayout>
      <div className="space-y-7">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-[#0B1220] px-6 py-7 text-white shadow-xl md:px-8 md:py-9">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-white/20 shadow-lg">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback className="bg-blue-600 text-lg font-bold text-white">
                  {profile?.name?.charAt(0)?.toUpperCase() || 'S'}
                </AvatarFallback>
              </Avatar>

              <div>
                <p className="mb-1 text-sm font-medium text-blue-300">
                  Student Dashboard
                </p>
                <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
                  Welcome back, {profile?.name?.split(' ')[0] || 'Student'} 👋
                </h1>
                <p className="mt-1 text-sm text-slate-300">
                  Stay updated with your campus activities and career journey.
                </p>
              </div>
            </div>

            <Button
              asChild
              className="w-full bg-white text-slate-900 hover:bg-slate-100 md:w-auto"
            >
              <Link to="/profile">
                <UserRound className="mr-2 h-4 w-4" />
                View Profile
              </Link>
            </Button>
          </div>
        </section>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/70 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Available Events
                  </p>
                  <p className="mt-2 font-display text-3xl font-bold">
                    {loading ? '—' : data.events.length}
                  </p>
                </div>
                <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                  <CalendarDays className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Explore campus activities
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    My Registrations
                  </p>
                  <p className="mt-2 font-display text-3xl font-bold">
                    {loading ? '—' : data.registrations.length}
                  </p>
                </div>
                <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Events you've joined
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Job Applications
                  </p>
                  <p className="mt-2 font-display text-3xl font-bold">
                    {loading ? '—' : data.applications.length}
                  </p>
                </div>
                <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
                  <BriefcaseBusiness className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Placement applications
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Achievements
                  </p>
                  <p className="mt-2 font-display text-3xl font-bold">
                    {loading ? '—' : data.results.length}
                  </p>
                </div>
                <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                  <Trophy className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Placement outcomes recorded
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* Events */}
          <Card className="border-border/70 shadow-sm">
            <div className="flex items-center justify-between border-b px-6 py-5">
              <div>
                <h2 className="font-display text-lg font-bold">Upcoming Events</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Discover what's happening around campus.
                </p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/events">
                  View All
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <CardContent className="p-4 md:p-6">
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-7 w-7 animate-spin text-primary" />
                </div>
              ) : upcomingEvents.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-10 text-center">
                  <CalendarDays className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-3 font-medium">No events available</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    New campus events will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {upcomingEvents.map((event: any) => (
                    <div
                      key={event.id}
                      className="group rounded-2xl border border-border/60 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                          <CalendarDays className="h-5 w-5" />
                        </div>

                        <Badge variant="outline" className="text-xs">
                          {event.status || 'Upcoming'}
                        </Badge>
                      </div>

                      <h3 className="mt-4 line-clamp-1 font-semibold">
                        {getEventName(event)}
                      </h3>

                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock3 className="h-3.5 w-3.5" />
                        {getEventDate(event)}
                      </div>

                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="mt-3 px-0 text-primary hover:bg-transparent"
                      >
                        <Link to="/events">
                          Explore Event
                          <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right column */}
          <div className="space-y-6">
            {/* Profile completion */}
            <Card className="border-border/70 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <h2 className="font-display font-bold">Profile Strength</h2>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Keep your profile updated for placements.
                    </p>
                  </div>

                  <span className="font-display text-xl font-bold text-primary">
                    {profileCompletion}%
                  </span>
                </div>

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>

                <Button asChild className="mt-5 w-full">
                  <Link to="/profile">
                    Complete Profile
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Quick actions */}
            <Card className="border-border/70 shadow-sm">
              <div className="border-b px-6 py-5">
                <h2 className="font-display font-bold">Quick Actions</h2>
              </div>

              <CardContent className="grid gap-3 p-4">
                <Button
                  asChild
                  variant="outline"
                  className="h-auto justify-between rounded-xl px-4 py-3"
                >
                  <Link to="/events">
                    <span className="flex items-center gap-3">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      Browse Events
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="h-auto justify-between rounded-xl px-4 py-3"
                >
                  <Link to="/placements">
                    <span className="flex items-center gap-3">
                      <BriefcaseBusiness className="h-4 w-4 text-primary" />
                      Browse Jobs
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="h-auto justify-between rounded-xl px-4 py-3"
                >
                  <Link to="/profile">
                    <span className="flex items-center gap-3">
                      <UserRound className="h-4 w-4 text-primary" />
                      Manage Profile
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Applications */}
        <Card className="border-border/70 shadow-sm">
          <div className="flex items-center justify-between border-b px-6 py-5">
            <div>
              <h2 className="font-display text-lg font-bold">Recent Applications</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Track your latest placement activity.
              </p>
            </div>

            <Button variant="ghost" size="sm" asChild>
              <Link to="/my-applications">
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <CardContent className="p-4 md:p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : data.applications.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-8 text-center">
                <BriefcaseBusiness className="mx-auto h-9 w-9 text-muted-foreground" />
                <p className="mt-3 font-medium">No applications yet</p>
                <Button asChild size="sm" className="mt-4">
                  <Link to="/placements">Browse Jobs</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {data.applications.slice(0, 5).map((application: any) => (
                  <div
                    key={application.id}
                    className="flex flex-col gap-3 rounded-xl border border-border/60 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
                        <BriefcaseBusiness className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {application.job_title ||
                            application.title ||
                            'Job Application'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Applied{' '}
                          {application.created_at
                            ? new Date(application.created_at).toLocaleDateString('en-IN')
                            : 'recently'}
                        </p>
                      </div>
                    </div>

                    <Badge
                      variant="outline"
                      className={getStatusClass(application.status)}
                    >
                      {application.status || 'Submitted'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
