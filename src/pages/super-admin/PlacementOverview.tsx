import { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  BriefcaseBusiness,
  Building2,
  FileText,
  Trophy,
  Search,
  Eye,
  ExternalLink,
} from 'lucide-react';

type Company = {
  id: string;
  name: string;
  website: string | null;
  description: string | null;
};

type Job = {
  id: string;
  title: string;
  company_id: string;
  status: string;
  package_lpa: number | null;
  min_cgpa: number | null;
  deadline: string | null;
};

type Application = {
  id: string;
  user_id: string;
  job_id: string;
  status: string;
  created_at: string;
};

type Result = {
  id: string;
  user_id: string;
  job_id: string;
  package_offered: number | null;
  joined: boolean | null;
  created_at: string;
};

export default function PlacementOverview() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);

    const [companiesRes, jobsRes, applicationsRes, resultsRes] =
      await Promise.all([
        supabase.from('companies').select('*').order('name'),
        supabase.from('job_postings').select('*').order('created_at', { ascending: false }),
        supabase.from('placement_applications').select('*').order('created_at', { ascending: false }),
        supabase.from('placement_results').select('*').order('created_at', { ascending: false }),
      ]);

    setCompanies((companiesRes.data || []) as Company[]);
    setJobs((jobsRes.data || []) as Job[]);
    setApplications((applicationsRes.data || []) as Application[]);
    setResults((resultsRes.data || []) as Result[]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const companyMap = useMemo(
    () => Object.fromEntries(companies.map((company) => [company.id, company.name])),
    [companies]
  );

  const jobMap = useMemo(
    () => Object.fromEntries(jobs.map((job) => [job.id, job])),
    [jobs]
  );

  const filteredJobs = jobs.filter((job) => {
    const company = companyMap[job.company_id] || '';
    const query = search.toLowerCase();
    return (
      job.title.toLowerCase().includes(query) ||
      company.toLowerCase().includes(query)
    );
  });

  const stats = [
    { label: 'Companies', value: companies.length, icon: Building2 },
    { label: 'Job Openings', value: jobs.length, icon: BriefcaseBusiness },
    { label: 'Applications', value: applications.length, icon: FileText },
    { label: 'Offers Recorded', value: results.length, icon: Trophy },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B1220] via-[#172554] to-blue-700 p-7 text-white shadow-xl">
          <div className="relative z-10 max-w-3xl">
            <p className="mb-2 text-sm font-medium text-blue-200">
              SUPER ADMIN • READ ONLY
            </p>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Placement Overview
            </h1>
            <p className="mt-3 text-sm leading-6 text-blue-100 md:text-base">
              Complete placement operations visibility without modification access.
            </p>
          </div>
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        </section>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="rounded-2xl border-border/70 shadow-sm">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardContent className="p-6">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold">Job Postings</h2>
                <p className="text-sm text-muted-foreground">
                  View all placement opportunities and eligibility details.
                </p>
              </div>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search job or company..."
                  className="pl-9"
                />
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-muted-foreground">
                Loading placement data...
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                No job postings found.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex flex-col gap-4 rounded-xl border border-border/60 bg-background p-4 transition hover:border-primary/30 hover:shadow-sm md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{job.title}</h3>
                        <Badge variant="secondary">{job.status}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {companyMap[job.company_id] || 'Unknown Company'}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <span>Package: {job.package_lpa ? `₹${job.package_lpa} LPA` : '—'}</span>
                        <span>Min CGPA: {job.min_cgpa ?? '—'}</span>
                        <span>Applications: {applications.filter((a) => a.job_id === job.id).length}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      Read only
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-2xl border-border/70 shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold">Companies</h2>
              <p className="mb-5 text-sm text-muted-foreground">
                Registered placement partners.
              </p>

              <div className="space-y-3">
                {companies.map((company) => (
                  <div
                    key={company.id}
                    className="rounded-xl border border-border/60 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{company.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                          {company.description || 'No description available.'}
                        </p>
                      </div>
                      {company.website && (
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/70 shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold">Placement Results</h2>
              <p className="mb-5 text-sm text-muted-foreground">
                Recorded offers and joining status.
              </p>

              <div className="space-y-3">
                {results.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No placement results recorded.
                  </div>
                ) : (
                  results.map((result) => {
                    const job = jobMap[result.job_id];
                    return (
                      <div
                        key={result.id}
                        className="rounded-xl border border-border/60 p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold">
                              {job?.title || 'Placement Result'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Student ID: {result.user_id}
                            </p>
                          </div>
                          <Badge variant={result.joined ? 'default' : 'secondary'}>
                            {result.joined ? 'Joined' : 'Offer Recorded'}
                          </Badge>
                        </div>
                        {result.package_offered && (
                          <p className="mt-2 text-sm font-medium text-blue-600">
                            ₹{result.package_offered} LPA
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
