import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Building2, Briefcase, Users, Trophy, ArrowRight, Loader2 } from 'lucide-react';
import type { Company, JobPosting } from '@/types/database';

interface PlacementStats {
  totalCompanies: number;
  activeJobs: number;
  pendingApplications: number;
  totalPlacements: number;
}

export function PlacementDashboard() {
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
        // Count companies
        const { count: companiesCount } = await supabase
          .from('companies')
          .select('*', { count: 'exact', head: true });

        // Count active jobs
        const { data: jobsData, count: jobsCount } = await supabase
          .from('job_postings')
          .select('*', { count: 'exact' })
          .eq('status', 'open')
          .order('created_at', { ascending: false })
          .limit(5);

        // Count pending applications
        const { count: pendingCount } = await supabase
          .from('placement_applications')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        // Count total placements
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
      <div>
        <h1 className="text-3xl font-bold">Placement Cell Dashboard</h1>
        <p className="text-muted-foreground">
          Manage companies, job postings, and placements
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompanies}</div>
            <p className="text-xs text-muted-foreground">Registered companies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeJobs}</div>
            <p className="text-xs text-muted-foreground">Open positions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApplications}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Placements</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPlacements}</div>
            <p className="text-xs text-muted-foreground">Students placed</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Job Postings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Job Postings</CardTitle>
                <CardDescription>Latest open positions</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/placement-admin/jobs">
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
                    <Badge variant="default">Open</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No active job postings
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link to="/placement-admin/companies">
                <Building2 className="mr-2 h-4 w-4" />
                Add New Company
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link to="/placement-admin/jobs">
                <Briefcase className="mr-2 h-4 w-4" />
                Create Job Posting
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link to="/placement-admin/applications">
                <Users className="mr-2 h-4 w-4" />
                Review Applications
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
