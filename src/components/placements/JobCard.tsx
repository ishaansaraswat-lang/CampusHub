import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Calendar, IndianRupee, GraduationCap } from 'lucide-react';
import { format } from 'date-fns';
import type { Tables } from '@/integrations/supabase/types';

type JobPosting = Tables<'job_postings'> & {
  companies?: Tables<'companies'> | null;
};

interface JobCardProps {
  job: JobPosting;
}

const statusColors: Record<string, string> = {
  open: 'bg-green-500/10 text-green-600 border-green-500/20',
  closed: 'bg-muted text-muted-foreground border-muted',
  draft: 'bg-muted text-muted-foreground border-muted',
  filled: 'bg-primary/10 text-primary border-primary/20',
};

export function JobCard({ job }: JobCardProps) {
  const isDeadlinePassed = job.deadline ? new Date(job.deadline) < new Date() : false;

  return (
    <Link to={`/placements/${job.id}`}>
      <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              {job.companies?.logo_url ? (
                <img
                  src={job.companies.logo_url}
                  alt={job.companies.name}
                  className="h-10 w-10 rounded-lg object-contain bg-muted p-1"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <div>
                <CardTitle className="text-lg line-clamp-1">{job.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {job.companies?.name || 'Company'}
                </p>
              </div>
            </div>
            <Badge variant="outline" className={statusColors[job.status] || ''}>
              {job.status}
            </Badge>
          </div>
          <CardDescription className="line-clamp-2 mt-2">
            {job.description || 'No description available'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {job.package_lpa && (
              <div className="flex items-center gap-1">
                <IndianRupee className="h-4 w-4" />
                <span>{job.package_lpa} LPA</span>
              </div>
            )}
            {job.min_cgpa && (
              <div className="flex items-center gap-1">
                <GraduationCap className="h-4 w-4" />
                <span>Min CGPA: {job.min_cgpa}</span>
              </div>
            )}
            {job.deadline && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span className={isDeadlinePassed ? 'text-destructive' : ''}>
                  {isDeadlinePassed ? 'Closed' : `Apply by ${format(new Date(job.deadline), 'MMM d')}`}
                </span>
              </div>
            )}
          </div>
          {job.eligible_departments && job.eligible_departments.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {job.eligible_departments.slice(0, 3).map((dept) => (
                <Badge key={dept} variant="secondary" className="text-xs">
                  {dept}
                </Badge>
              ))}
              {job.eligible_departments.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{job.eligible_departments.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
