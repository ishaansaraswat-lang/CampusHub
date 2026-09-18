import { MainLayout } from '@/components/layout/MainLayout';
import { useMyApplications } from '@/hooks/usePlacements';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Briefcase, ArrowLeft, CalendarDays, Building2, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function MyApplications() {
  const { data: applications, isLoading } = useMyApplications();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'selected':
        return {
          label: 'Selected',
          className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
          icon: CheckCircle2,
        };
      case 'pending':
        return {
          label: 'Pending',
          className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
          icon: CalendarDays,
        };
      case 'shortlisted':
        return {
          label: 'Shortlisted',
          className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
          icon: CheckCircle2,
        };
      case 'rejected':
      case 'withdrawn':
        return {
          label: status === 'withdrawn' ? 'Withdrawn' : 'Rejected',
          className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
          icon: Briefcase,
        };
      default:
        return {
          label: status,
          className: 'bg-muted text-muted-foreground',
          icon: Briefcase,
        };
    }
  };

  const selectedCount = applications?.filter((app: any) => app.status === 'selected').length || 0;
  const pendingCount = applications?.filter((app: any) => app.status === 'pending').length || 0;

  return (
    <MainLayout>
      <div className="space-y-8">
        <Button
          variant="ghost"
          asChild
          className="-ml-2 rounded-xl text-muted-foreground hover:text-foreground"
        >
          <Link to="/profile">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profile
          </Link>
        </Button>

        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card p-6 shadow-sm sm:p-8">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                <Briefcase className="h-3.5 w-3.5" />
                Placement Tracker
              </div>
              <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                My Applications
              </h1>
              <p className="mt-2 text-muted-foreground">
                Track your placement applications and their latest status.
              </p>
            </div>

            <div className="flex gap-3">
              <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
                <p className="text-xs text-muted-foreground">Applications</p>
                <p className="mt-1 text-xl font-bold">{applications?.length || 0}</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
                <p className="text-xs text-muted-foreground">Selected</p>
                <p className="mt-1 text-xl font-bold text-emerald-600">{selectedCount}</p>
              </div>
              <div className="hidden rounded-2xl border border-border/60 bg-background/70 px-4 py-3 sm:block">
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="mt-1 text-xl font-bold text-amber-600">{pendingCount}</p>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="rounded-2xl border-border/60">
                <CardContent className="flex items-center gap-4 p-5">
                  <Skeleton className="h-14 w-14 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-8 w-24 rounded-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !applications?.length ? (
          <Card className="rounded-2xl border-dashed shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 rounded-2xl bg-primary/10 p-4">
                <Briefcase className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">No applications yet</h3>
              <p className="mb-5 mt-1 max-w-sm text-sm text-muted-foreground">
                Explore available job postings and apply to opportunities that match your profile.
              </p>
              <Button asChild className="rounded-xl">
                <Link to="/placements">
                  <Briefcase className="mr-2 h-4 w-4" />
                  Browse Jobs
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((app: any) => {
              const status = getStatusConfig(app.status);
              const StatusIcon = status.icon;

              return (
                <Card
                  key={app.id}
                  className="group rounded-2xl border-border/70 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md"
                >
                  <CardContent className="p-5">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-background">
                          {app.job_postings?.companies?.logo_url ? (
                            <img
                              src={app.job_postings.companies.logo_url}
                              alt=""
                              className="h-full w-full object-contain p-2"
                            />
                          ) : (
                            <Building2 className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate font-semibold">
                            {app.job_postings?.title || 'Placement Opportunity'}
                          </h3>
                          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Building2 className="h-3.5 w-3.5" />
                            {app.job_postings?.companies?.name || 'Company'}
                          </p>

                          <div className="mt-2 flex flex-wrap items-center gap-3">
                            {app.job_postings?.package_lpa && (
                              <span className="text-sm font-semibold text-primary">
                                ₹{app.job_postings.package_lpa} LPA
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <CalendarDays className="h-3.5 w-3.5" />
                              Applied {format(new Date(app.created_at), 'PP')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Badge className={`w-fit shrink-0 rounded-full px-3 py-1.5 ${status.className}`}>
                        <StatusIcon className="mr-1.5 h-3.5 w-3.5" />
                        {status.label}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
