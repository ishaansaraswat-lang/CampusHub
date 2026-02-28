import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useJobPosting, useMyApplications, useApplyForJob } from '@/hooks/usePlacements';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Building2, 
  Calendar, 
  IndianRupee, 
  GraduationCap, 
  ArrowLeft, 
  ExternalLink,
  FileText,
  Users,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';

export default function PlacementDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: job, isLoading } = useJobPosting(id || '');
  const { data: myApplications } = useMyApplications();
  const applyMutation = useApplyForJob();

  const hasApplied = myApplications?.some((app) => app.job_id === id);
  const isDeadlinePassed = job?.deadline ? new Date(job.deadline) < new Date() : false;
  const canApply = user && !hasApplied && !isDeadlinePassed && job?.status === 'open';

  const handleApply = () => {
    if (id) {
      applyMutation.mutate({ jobId: id });
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-32" />
          <div className="flex gap-4">
            <Skeleton className="h-16 w-16 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-40 w-full" />
        </div>
      </MainLayout>
    );
  }

  if (!job) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h2 className="text-2xl font-bold">Job not found</h2>
          <p className="text-muted-foreground mb-4">
            The job posting you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/placements">Browse Jobs</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  const statusColors: Record<string, string> = {
    open: 'bg-green-500/10 text-green-600 border-green-500/20',
    closed: 'bg-muted text-muted-foreground border-muted',
    filled: 'bg-primary/10 text-primary border-primary/20',
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Back button */}
        <Button variant="ghost" asChild className="pl-0">
          <Link to="/placements">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Placements
          </Link>
        </Button>

        {/* Job Header */}
        <div className="flex flex-wrap items-start gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-muted">
            {job.companies?.logo_url ? (
              <img
                src={job.companies.logo_url}
                alt={job.companies.name}
                className="h-full w-full rounded-lg object-contain p-2"
              />
            ) : (
              <Building2 className="h-10 w-10 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">{job.title}</h1>
                <div className="mt-1 flex items-center gap-2 text-lg text-muted-foreground">
                  <span>{job.companies?.name || 'Company'}</span>
                  {job.companies?.website && (
                    <a
                      href={job.companies.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
              <Badge variant="outline" className={statusColors[job.status] || ''}>
                {job.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {job.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Job Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-muted-foreground">
                    {job.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {job.companies?.description && (
              <Card>
                <CardHeader>
                  <CardTitle>About {job.companies.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{job.companies.description}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
            <Card>
              <CardContent className="pt-6">
                {!user ? (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-3">
                      Sign in to apply for this position
                    </p>
                    <Button asChild className="w-full">
                      <Link to="/auth">Sign In</Link>
                    </Button>
                  </div>
                ) : hasApplied ? (
                  <div className="text-center">
                    <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-600" />
                    <p className="font-medium text-green-600">Applied</p>
                    <p className="text-sm text-muted-foreground">
                      You have already applied for this position
                    </p>
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    onClick={handleApply}
                    disabled={!canApply || applyMutation.isPending}
                  >
                    {applyMutation.isPending ? 'Applying...' : 
                     isDeadlinePassed ? 'Deadline Passed' : 'Apply Now'}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {job.package_lpa && (
                  <div className="flex items-center gap-3">
                    <IndianRupee className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Package</p>
                      <p className="font-medium">{job.package_lpa} LPA</p>
                    </div>
                  </div>
                )}

                {job.deadline && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Deadline</p>
                      <p className={`font-medium ${isDeadlinePassed ? 'text-destructive' : ''}`}>
                        {format(new Date(job.deadline), 'MMMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                )}

                {job.min_cgpa && (
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Minimum CGPA</p>
                      <p className="font-medium">{job.min_cgpa}</p>
                    </div>
                  </div>
                )}

                {job.eligible_years && job.eligible_years.length > 0 && (
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Eligible Years</p>
                      <p className="font-medium">{job.eligible_years.join(', ')}</p>
                    </div>
                  </div>
                )}

                {job.jd_file_url && (
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <a
                      href={job.jd_file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      View Job Description PDF
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Eligible Departments */}
            {job.eligible_departments && job.eligible_departments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Eligible Departments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.eligible_departments.map((dept) => (
                      <Badge key={dept} variant="secondary">
                        {dept}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
