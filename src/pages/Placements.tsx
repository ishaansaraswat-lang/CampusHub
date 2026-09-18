import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { JobCard } from '@/components/placements/JobCard';
import { useJobPostings, usePlacementResults } from '@/hooks/usePlacements';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Search,
  Briefcase,
  Trophy,
  CheckCircle,
  XCircle,
  Building2,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

export default function Placements() {
  const { data: jobs, isLoading } = useJobPostings();
  const { data: results, isLoading: resultsLoading } = usePlacementResults();
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  const allDepartments = [...new Set(
    jobs?.flatMap((job) => job.eligible_departments || []) || []
  )].sort();

  const filteredJobs = jobs?.filter((job) => {
    const query = search.toLowerCase().trim();

    const matchesSearch =
      job.title.toLowerCase().includes(query) ||
      job.companies?.name?.toLowerCase().includes(query) ||
      job.description?.toLowerCase().includes(query);

    const matchesDepartment =
      departmentFilter === 'all' ||
      job.eligible_departments?.includes(departmentFilter);

    return matchesSearch && matchesDepartment;
  });

  const openJobs = jobs?.filter((job) => job.status === 'open').length || 0;
  const companies = new Set(
    jobs?.map((job) => job.companies?.name).filter(Boolean)
  ).size;

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card p-6 shadow-sm sm:p-8">
          <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-blue-400/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Career Opportunities
              </div>
              <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Placements
              </h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Discover job opportunities, track applications, and view your placement outcomes.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex">
              <div className="rounded-2xl border border-border/60 bg-background/70 px-5 py-3">
                <p className="text-xs font-medium text-muted-foreground">Open Roles</p>
                <p className="mt-1 text-2xl font-bold">{openJobs}</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/70 px-5 py-3">
                <p className="text-xs font-medium text-muted-foreground">Companies</p>
                <p className="mt-1 text-2xl font-bold">{companies}</p>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList className="h-auto rounded-xl border border-border/70 bg-card p-1.5 shadow-sm">
            <TabsTrigger
              value="jobs"
              className="rounded-lg px-5 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Briefcase className="mr-2 h-4 w-4" />
              Job Postings
            </TabsTrigger>
            <TabsTrigger
              value="results"
              className="rounded-lg px-5 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Trophy className="mr-2 h-4 w-4" />
              Placement Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-6">
            {/* Filters */}
            <Card className="rounded-2xl border-border/70 shadow-sm">
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col gap-3 lg:flex-row">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search jobs, companies or descriptions..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="h-11 rounded-xl border-border/70 bg-background pl-10"
                    />
                  </div>

                  <Select
                    value={departmentFilter}
                    onValueChange={setDepartmentFilter}
                  >
                    <SelectTrigger className="h-11 w-full rounded-xl border-border/70 bg-background lg:w-56">
                      <SelectValue placeholder="Filter by department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {allDepartments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Showing <span className="font-semibold text-foreground">{filteredJobs?.length || 0}</span> opportunities
                  </span>
                  {(search || departmentFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setSearch('');
                        setDepartmentFilter('all');
                      }}
                      className="font-semibold text-primary hover:underline"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>

            {isLoading ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="rounded-2xl border-border/60">
                    <CardContent className="space-y-4 p-5">
                      <div className="flex gap-3">
                        <Skeleton className="h-11 w-11 rounded-xl" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-10 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredJobs && filteredJobs.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredJobs.map((job) => (
                  <div
                    key={job.id}
                    className="transition-transform duration-300 hover:-translate-y-1"
                  >
                    <JobCard job={job} />
                  </div>
                ))}
              </div>
            ) : (
              <Card className="rounded-2xl border-dashed border-border/80 shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-4 rounded-2xl bg-primary/10 p-4">
                    <Briefcase className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">No job postings found</h3>
                  <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                    {search || departmentFilter !== 'all'
                      ? 'Try adjusting your search or department filter.'
                      : 'Check back later for new placement opportunities.'}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="results" className="space-y-5">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                <Trophy className="h-6 w-6 text-primary" />
                Placement Results
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Published placement outcomes and joining status.
              </p>
            </div>

            {resultsLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-2xl" />
                ))}
              </div>
            ) : results && results.length > 0 ? (
              <div className="space-y-3">
                {results.map((r: any) => (
                  <Card
                    key={r.id}
                    className="rounded-2xl border-border/70 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md"
                  >
                    <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-background">
                          {r.job_postings?.companies?.logo_url ? (
                            <img
                              src={r.job_postings.companies.logo_url}
                              alt=""
                              className="h-full w-full object-contain p-1.5"
                            />
                          ) : (
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-semibold">
                            {r.job_postings?.title || 'Placement Opportunity'}
                          </p>
                          <p className="truncate text-sm text-muted-foreground">
                            {r.job_postings?.companies?.name || 'Company'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                        {r.package_offered && (
                          <Badge variant="outline" className="rounded-full px-3">
                            ₹{r.package_offered} LPA
                          </Badge>
                        )}

                        {r.joined ? (
                          <Badge className="rounded-full bg-emerald-100 px-3 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300">
                            <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                            Joined
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="rounded-full px-3">
                            <XCircle className="mr-1.5 h-3.5 w-3.5" />
                            Not Joined
                          </Badge>
                        )}

                        <ArrowUpRight className="hidden h-4 w-4 text-muted-foreground sm:block" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="rounded-2xl border-dashed shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-4 rounded-2xl bg-primary/10 p-4">
                    <Trophy className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">No placement results yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Results will appear here once they are published.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
