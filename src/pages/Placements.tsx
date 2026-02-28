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
import { Search, Briefcase, Trophy, CheckCircle, XCircle } from 'lucide-react';

export default function Placements() {
  const { data: jobs, isLoading } = useJobPostings();
  const { data: results, isLoading: resultsLoading } = usePlacementResults();
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  const allDepartments = [...new Set(
    jobs?.flatMap((job) => job.eligible_departments || []) || []
  )].sort();

  const filteredJobs = jobs?.filter((job) => {
    const matchesSearch = 
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.companies?.name?.toLowerCase().includes(search.toLowerCase()) ||
      job.description?.toLowerCase().includes(search.toLowerCase());
    const matchesDepartment = 
      departmentFilter === 'all' || 
      job.eligible_departments?.includes(departmentFilter);
    return matchesSearch && matchesDepartment;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Placements</h1>
          <p className="text-muted-foreground">
            Browse job opportunities and placement results
          </p>
        </div>

        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList>
            <TabsTrigger value="jobs">Job Postings</TabsTrigger>
            <TabsTrigger value="results">Placement Results</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search jobs or companies..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {allDepartments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-3 p-4 border rounded-lg">
                    <div className="flex gap-3">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ))}
              </div>
            ) : filteredJobs && filteredJobs.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Briefcase className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-medium">No job postings found</h3>
                <p className="text-muted-foreground">
                  {search || departmentFilter !== 'all' ? 'Try adjusting your filters' : 'Check back later for new opportunities'}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="h-6 w-6 text-primary" />
              Placement Results
            </h2>
            {resultsLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-lg" />
                ))}
              </div>
            ) : results && results.length > 0 ? (
              <div className="space-y-3">
                {results.map((r: any) => (
                  <Card key={r.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        {r.job_postings?.companies?.logo_url && (
                          <img
                            src={r.job_postings.companies.logo_url}
                            alt=""
                            className="h-10 w-10 rounded-md object-contain"
                          />
                        )}
                        <div>
                          <p className="font-medium">{r.job_postings?.title}</p>
                          <p className="text-sm text-muted-foreground">{r.job_postings?.companies?.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {r.package_offered && (
                          <Badge variant="outline">₹{r.package_offered} LPA</Badge>
                        )}
                        {r.joined ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            <CheckCircle className="mr-1 h-3 w-3" /> Joined
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <XCircle className="mr-1 h-3 w-3" /> Not Joined
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Trophy className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-medium">No placement results yet</h3>
                <p className="text-muted-foreground">Results will appear here once published</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
