import { useEffect, useMemo, useState } from 'react';
import {
  BriefcaseBusiness,
  Building2,
  FileText,
  Trophy,
  Loader2,
  ShieldCheck,
  Search,
  Users,
  Eye,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

type Row = Record<string, any>;

const pick = (row: Row, keys: string[], fallback = '—') => {
  for (const key of keys) {
    if (row?.[key] !== undefined && row?.[key] !== null && row?.[key] !== '') {
      return String(row[key]);
    }
  }
  return fallback;
};

const formatDate = (value: any) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('en-IN');
};

export default function PlacementOverview() {
  const [companies, setCompanies] = useState<Row[]>([]);
  const [jobs, setJobs] = useState<Row[]>([]);
  const [applications, setApplications] = useState<Row[]>([]);
  const [results, setResults] = useState<Row[]>([]);
  const [profiles, setProfiles] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('companies');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const [companiesRes, jobsRes, applicationsRes, resultsRes, profilesRes] =
        await Promise.all([
          supabase.from('companies').select('*').order('created_at', { ascending: false }),
          supabase.from('job_postings').select('*').order('created_at', { ascending: false }),
          supabase.from('placement_applications').select('*').order('created_at', { ascending: false }),
          supabase.from('placement_results').select('*').order('created_at', { ascending: false }),
          supabase.from('profiles').select('*'),
        ]);

      setCompanies(companiesRes.data || []);
      setJobs(jobsRes.data || []);
      setApplications(applicationsRes.data || []);
      setResults(resultsRes.data || []);
      setProfiles(profilesRes.data || []);
      setLoading(false);
    };

    load();
  }, []);

  const companyMap = useMemo(
    () => new Map(companies.map((item) => [String(item.id), item])),
    [companies]
  );

  const jobMap = useMemo(
    () => new Map(jobs.map((item) => [String(item.id), item])),
    [jobs]
  );

  const profileMap = useMemo(() => {
    const map = new Map<string, Row>();
    profiles.forEach((profile) => {
      if (profile.id) map.set(String(profile.id), profile);
      if (profile.user_id) map.set(String(profile.user_id), profile);
    });
    return map;
  }, [profiles]);

  const filteredCompanies = companies.filter((item) =>
    JSON.stringify(item).toLowerCase().includes(search.toLowerCase())
  );

  const filteredJobs = jobs.filter((item) => {
    const company = companyMap.get(String(item.company_id));
    return `${JSON.stringify(item)} ${JSON.stringify(company || {})}`
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  const filteredApplications = applications.filter((item) => {
    const company = companyMap.get(String(item.company_id));
    const job = jobMap.get(String(item.job_id));
    const profile = profileMap.get(String(item.user_id || item.student_id));
    return `${JSON.stringify(item)} ${JSON.stringify(company || {})} ${JSON.stringify(job || {})} ${JSON.stringify(profile || {})}`
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  const filteredResults = results.filter((item) => {
    const company = companyMap.get(String(item.company_id));
    const profile = profileMap.get(String(item.user_id || item.student_id));
    return `${JSON.stringify(item)} ${JSON.stringify(company || {})} ${JSON.stringify(profile || {})}`
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  const stats = [
    { label: 'Companies', value: companies.length, icon: Building2 },
    { label: 'Job Postings', value: jobs.length, icon: BriefcaseBusiness },
    { label: 'Applications', value: applications.length, icon: FileText },
    { label: 'Offers / Results', value: results.length, icon: Trophy },
  ];

  const tabs = [
    ['companies', 'Companies', companies.length],
    ['jobs', 'Job Postings', jobs.length],
    ['applications', 'Applications', applications.length],
    ['results', 'Placement Results', results.length],
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="rounded-2xl bg-[#0B1220] p-6 text-white shadow-lg">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-blue-600 p-3">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Placement Overview</h1>
              <p className="mt-1 text-sm text-slate-300">
                Complete system-wide placement monitoring. Super Admin access is read-only.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map(({ label, value, icon: Icon }) => (
                <Card key={label} className="rounded-2xl shadow-sm">
                  <CardContent className="p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="rounded-xl bg-primary/10 p-2.5">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">View Only</span>
                    </div>
                    <p className="text-3xl font-bold">{value}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="rounded-2xl shadow-sm">
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-wrap gap-2">
                    {tabs.map(([value, label, count]) => (
                      <button
                        key={value}
                        onClick={() => {
                          setTab(String(value));
                          setSearch('');
                        }}
                        className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                          tab === value
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'bg-muted text-muted-foreground hover:bg-muted/70'
                        }`}
                      >
                        {label} <span className="ml-1 opacity-70">({count})</span>
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full lg:w-80">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search placement data..."
                      className="w-full rounded-xl border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {tab === 'companies' && (
              <DataSection title="Registered Companies" count={filteredCompanies.length}>
                <div className="divide-y">
                  {filteredCompanies.map((company) => (
                    <div key={company.id} className="grid gap-3 p-5 md:grid-cols-4">
                      <div>
                        <p className="font-semibold">{pick(company, ['name', 'company_name'])}</p>
                        <p className="text-xs text-muted-foreground">
                          {pick(company, ['industry', 'sector'])}
                        </p>
                      </div>
                      <Info label="Location" value={pick(company, ['location', 'city', 'address'])} />
                      <Info label="Website" value={pick(company, ['website', 'url'])} />
                      <Info label="Created" value={formatDate(company.created_at)} />
                    </div>
                  ))}
                </div>
              </DataSection>
            )}

            {tab === 'jobs' && (
              <DataSection title="Job Postings" count={filteredJobs.length}>
                <div className="divide-y">
                  {filteredJobs.map((job) => {
                    const company = companyMap.get(String(job.company_id));
                    return (
                      <div key={job.id} className="grid gap-3 p-5 md:grid-cols-5">
                        <div>
                          <p className="font-semibold">
                            {pick(job, ['title', 'job_title', 'position'])}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {pick(company || {}, ['name', 'company_name'])}
                          </p>
                        </div>
                        <Info label="Type" value={pick(job, ['job_type', 'employment_type', 'type'])} />
                        <Info label="Location" value={pick(job, ['location', 'city'])} />
                        <Info label="Package" value={pick(job, ['package', 'ctc', 'salary'])} />
                        <Info label="Posted" value={formatDate(job.created_at)} />
                      </div>
                    );
                  })}
                </div>
              </DataSection>
            )}

            {tab === 'applications' && (
              <DataSection title="Placement Applications" count={filteredApplications.length}>
                <div className="divide-y">
                  {filteredApplications.map((application) => {
                    const company = companyMap.get(String(application.company_id));
                    const job = jobMap.get(String(application.job_id));
                    const profile = profileMap.get(
                      String(application.user_id || application.student_id)
                    );

                    return (
                      <div key={application.id} className="grid gap-3 p-5 md:grid-cols-5">
                        <div>
                          <p className="font-semibold">
                            {pick(profile || {}, ['name', 'full_name'], 'Student')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {pick(profile || {}, ['email'])}
                          </p>
                        </div>
                        <Info
                          label="Company"
                          value={pick(company || {}, ['name', 'company_name'])}
                        />
                        <Info
                          label="Job"
                          value={pick(job || {}, ['title', 'job_title', 'position'])}
                        />
                        <Info
                          label="Status"
                          value={pick(application, ['status', 'application_status'])}
                        />
                        <Info label="Applied" value={formatDate(application.created_at)} />
                      </div>
                    );
                  })}
                </div>
              </DataSection>
            )}

            {tab === 'results' && (
              <DataSection title="Placement Results" count={filteredResults.length}>
                <div className="divide-y">
                  {filteredResults.map((result) => {
                    const company = companyMap.get(String(result.company_id));
                    const profile = profileMap.get(
                      String(result.user_id || result.student_id)
                    );

                    return (
                      <div key={result.id} className="grid gap-3 p-5 md:grid-cols-5">
                        <div>
                          <p className="font-semibold">
                            {pick(profile || {}, ['name', 'full_name'], 'Student')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {pick(profile || {}, ['email'])}
                          </p>
                        </div>
                        <Info
                          label="Company"
                          value={pick(company || {}, ['name', 'company_name'])}
                        />
                        <Info label="Status" value={pick(result, ['status', 'result', 'outcome'])} />
                        <Info label="Package" value={pick(result, ['package', 'ctc', 'salary'])} />
                        <Info label="Date" value={formatDate(result.created_at)} />
                      </div>
                    );
                  })}
                </div>
              </DataSection>
            )}

            <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
              <Eye className="h-4 w-4 shrink-0" />
              Super Admin can view and monitor placement records. All placement modifications remain restricted to the Placement Admin.
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}

function DataSection({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden rounded-2xl shadow-sm">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div>
          <h2 className="text-lg font-bold">{title}</h2>
          <p className="text-sm text-muted-foreground">Individual records • Read only</p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
          {count}
        </span>
      </div>
      {children}
    </Card>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-medium">{value}</p>
    </div>
  );
}
