import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import {
  Building2,
  Briefcase,
  Users,
  Trophy,
  Loader2,
  ClipboardList,
  Megaphone,
  ArrowUpRight,
  TrendingUp,
  Clock3,
  Sparkles,
} from 'lucide-react';
import type { JobPosting } from '@/types/database';
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

interface PlacementStats {
  totalCompanies: number;
  activeJobs: number;
  pendingApplications: number;
  totalPlacements: number;
}

export function PlacementDashboard() {
  const { data: activity } = useActivityFeed('placement_cell');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PlacementStats>({
    totalCompanies: 0,
    activeJobs: 0,
    pendingApplications: 0,
    totalPlacements: 0,
  });
  const [recentJobs, setRecentJobs] = useState<JobPosting[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { count: companiesCount } = await supabase
          .from('companies')
          .select('*', { count: 'exact', head: true });

        const { data: jobsData, count: jobsCount } = await supabase
          .from('job_postings')
          .select('*', { count: 'exact' })
          .eq('status', 'open')
          .order('created_at', { ascending: false })
          .limit(5);

        const { count: pendingCount } = await supabase
          .from('placement_applications')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        const { count: placementsCount } = await supabase
          .from('placement_results')
          .select('*', { count: 'exact', head: true });

        setStats({
          totalCompanies: companiesCount || 0,
          activeJobs: jobsCount || 0,
          pendingApplications: pendingCount || 0,
          totalPlacements: placementsCount || 0,
        });

        setRecentJobs((jobsData as JobPosting[]) || []);
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
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-2xl bg-primary/10 p-4">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">
            Loading placement dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card p-6 shadow-sm sm:p-8">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-blue-400/10 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Placement Management
            </div>

            <DashboardHeader
              title="Placement Cell Dashboard"
              subtitle="Manage companies, job postings, applications, and student placements."
            />
          </div>

          <Link
            to="/placement-admin/jobs"
            className="group inline-flex w-fit items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <Briefcase className="h-4 w-4" />
            Manage Job Postings
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Companies"
          value={stats.totalCompanies}
          caption="Registered partners"
          icon={Building2}
        />

        <StatTile
          label="Active Jobs"
          value={stats.activeJobs}
          caption="Open positions"
          icon={Briefcase}
          tone="success"
        />

        <StatTile
          label="Pending Apps"
          value={stats.pendingApplications}
          caption="Awaiting review"
          icon={Clock3}
          tone="warning"
        />

        <StatTile
          label="Placements"
          value={stats.totalPlacements}
          caption="Students placed"
          icon={Trophy}
          tone="info"
        />
      </div>

      {/* Summary strip */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="rounded-xl bg-blue-500/10 p-2.5">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              Current
            </span>
          </div>
          <p className="text-2xl font-bold">{stats.activeJobs}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Active placement opportunities
          </p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="rounded-xl bg-amber-500/10 p-2.5">
              <ClipboardList className="h-5 w-5 text-amber-600" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              Action needed
            </span>
          </div>
          <p className="text-2xl font-bold">{stats.pendingApplications}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Applications awaiting review
          </p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="rounded-xl bg-emerald-500/10 p-2.5">
              <Trophy className="h-5 w-5 text-emerald-600" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              Recorded
            </span>
          </div>
          <p className="text-2xl font-bold">{stats.totalPlacements}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Placement outcomes recorded
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel
            title="Recent Job Postings"
            description="Latest open placement opportunities"
            action={<ViewAllLink to="/placement-admin/jobs" />}
          >
            {recentJobs.length > 0 ? (
              <ul className="space-y-3">
                {recentJobs.map((job) => (
                  <li
                    key={job.id}
                    className="group flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-background p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <Briefcase className="h-4 w-4 text-primary" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-semibold">{job.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {job.package_lpa
                            ? `₹${job.package_lpa} LPA`
                            : 'Package TBD'}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <Badge
                        variant="success"
                        className="rounded-full px-3"
                      >
                        Open
                      </Badge>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="mb-3 rounded-2xl bg-primary/10 p-3">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <p className="font-medium">No active job postings</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  New openings will appear here.
                </p>
              </div>
            )}
          </Panel>
        </div>

        {/* Right rail */}
        <div className="space-y-6">
          <Panel
            title="Live Activity"
            description="Recent placement updates"
          >
            {activity.length > 0 ? (
              <ActivityFeed items={activity} />
            ) : (
              <p className="py-4 text-sm text-muted-foreground">
                No recent activity
              </p>
            )}
          </Panel>

          <Panel title="Quick Tools" description="Frequently used actions">
            <QuickToolsGrid
              items={[
                {
                  label: 'Companies',
                  icon: Building2,
                  to: '/placement-admin/companies',
                },
                {
                  label: 'Postings',
                  icon: Briefcase,
                  to: '/placement-admin/jobs',
                },
                {
                  label: 'Applications',
                  icon: ClipboardList,
                  to: '/placement-admin/applications',
                },
                {
                  label: 'Broadcast',
                  icon: Megaphone,
                  to: '/placement-admin/jobs',
                },
              ]}
            />
          </Panel>

          <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/60 p-4 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-950/20">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-100 p-2 dark:bg-emerald-900/40">
                <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-semibold">Placement system</p>
                <p className="text-xs text-muted-foreground">
                  All core services operational
                </p>
              </div>
              <div className="ml-auto">
                <StatusPill status="operational" label="Operational" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
