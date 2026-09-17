import { MainLayout } from '@/components/layout/MainLayout';
import { useMyApplications } from '@/hooks/usePlacements';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Briefcase, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function MyApplications() {
  const { data: applications, isLoading } = useMyApplications();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'selected': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'rejected':
      case 'withdrawn': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'shortlisted': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild className="pl-0">
            <Link to="/profile">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Profile
            </Link>
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold">My Applications</h1>
          <p className="text-muted-foreground">Track your placement applications</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ) : !applications?.length ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Briefcase className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-medium">No applications yet</h3>
            <p className="text-muted-foreground mb-4">Browse job postings and apply</p>
            <Button asChild>
              <Link to="/placements">Browse Jobs</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app: any) => (
              <Card key={app.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    {app.job_postings?.companies?.logo_url && (
                      <img
                        src={app.job_postings.companies.logo_url}
                        alt=""
                        className="h-12 w-12 rounded-md object-contain"
                      />
                    )}
                    <div>
                      <p className="font-medium">{app.job_postings?.title}</p>
                      <p className="text-sm text-muted-foreground">{app.job_postings?.companies?.name}</p>
                      {app.job_postings?.package_lpa && (
                        <p className="text-sm font-medium text-primary">₹{app.job_postings.package_lpa} LPA</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={getStatusColor(app.status)}>{app.status}</Badge>
                    <span className="text-xs text-muted-foreground">
                      Applied {format(new Date(app.created_at), 'PP')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
