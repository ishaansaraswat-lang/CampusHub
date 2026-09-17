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
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Placement Cell Dashboard"
        subtitle="Manage companies, job postings, and placements."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Companies" value={stats.totalCompanies} caption="Registered" icon={Building2} />
        <StatTile label="Active Jobs" value={stats.activeJobs} caption="Open positions" icon={Briefcase} tone="success" />
        <StatTile label="Pending Apps" value={stats.pendingApplications} caption="Awaiting review" icon={Users} tone="warning" />
        <StatTile label="Placements" value={stats.totalPlacements} caption="Students placed" icon={Trophy} tone="info" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel
            title="Recent Job Postings"
            description="Latest open positions"
            action={<ViewAllLink to="/placement-admin/jobs" />}
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
                    <Badge variant="success">Open</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-muted-foreground py-6">No active job postings</p>
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Live Activity" description="Recent placement updates">
            {activity.length > 0 ? <ActivityFeed items={activity} /> : <p className="text-sm text-muted-foreground">No recent activity</p>}
          </Panel>

          <Panel title="Quick Tools">
            <QuickToolsGrid
              items={[
                { label: 'Companies', icon: Building2, to: '/placement-admin/companies' },
                { label: 'Postings', icon: Briefcase, to: '/placement-admin/jobs' },
                { label: 'Applications', icon: ClipboardList, to: '/placement-admin/applications' },
                { label: 'Broadcast', icon: Megaphone, to: '/placement-admin/jobs' },
              ]}
            />
          </Panel>

          <StatusPill status="operational" label="Operational" />
        </div>
      </div>
    </div>
  );
}
