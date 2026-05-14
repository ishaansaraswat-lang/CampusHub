import { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DashboardHeader, Panel, StatTile, ViewAllLink } from '@/components/dashboard/shared';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Briefcase, Building2, TrendingUp, Trophy, Download, Loader2, IndianRupee } from 'lucide-react';
import { format, subMonths, startOfMonth } from 'date-fns';

type Row = Record<string, any>;

const CHART_COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--info))', 'hsl(var(--destructive))'];

function toCSV(rows: Row[]): string {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const escape = (v: any) => {
    if (v == null) return '';
    const s = String(v).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };
  return [headers.join(','), ...rows.map((r) => headers.map((h) => escape(r[h])).join(','))].join('\n');
}

function downloadCSV(filename: string, rows: Row[]) {
  const blob = new Blob([toCSV(rows)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function PlacementStatistics() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Row[]>([]);
  const [apps, setApps] = useState<Row[]>([]);
  const [results, setResults] = useState<Row[]>([]);
  const [companies, setCompanies] = useState<Row[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [j, a, r, c] = await Promise.all([
          supabase.from('job_postings').select('*, companies(name)').order('created_at', { ascending: false }),
          supabase.from('placement_applications').select('*, job_postings(title, package_lpa, company_id, companies(name))').order('created_at', { ascending: false }),
          supabase
            .from('placement_results')
            .select('*, job_postings(title, companies(name)), profiles!placement_results_user_id_fkey(name, department, year)')
            .order('created_at', { ascending: false }),
          supabase.from('companies').select('*'),
        ]);
        setJobs(j.data || []);
        // profiles foreign key may not exist; fall back without it
        if (r.error) {
          const r2 = await supabase
            .from('placement_results')
            .select('*, job_postings(title, companies(name))')
            .order('created_at', { ascending: false });
          setResults(r2.data || []);
        } else {
          setResults(r.data || []);
        }
        setApps(a.data || []);
        setCompanies(c.data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Trends: last 6 months
  const trendData = useMemo(() => {
    const months = Array.from({ length: 6 }).map((_, i) => startOfMonth(subMonths(new Date(), 5 - i)));
    return months.map((m) => {
      const key = format(m, 'MMM');
      const inMonth = (d: string) => {
        const dt = new Date(d);
        return dt >= m && dt < startOfMonth(subMonths(m, -1));
      };
      return {
        month: key,
        Jobs: jobs.filter((x) => inMonth(x.created_at)).length,
        Applications: apps.filter((x) => inMonth(x.created_at)).length,
        Placements: results.filter((x) => inMonth(x.created_at)).length,
      };
    });
  }, [jobs, apps, results]);

  // Company stats
  const companyStats = useMemo(() => {
    const map = new Map<string, { name: string; jobs: number; applications: number; placements: number; avgPackage: number; total: number; count: number }>();
    const ensure = (id: string, name: string) => {
      if (!map.has(id)) map.set(id, { name, jobs: 0, applications: 0, placements: 0, avgPackage: 0, total: 0, count: 0 });
      return map.get(id)!;
    };
    jobs.forEach((j) => {
      const c = ensure(j.company_id, j.companies?.name || 'Unknown');
      c.jobs += 1;
    });
    apps.forEach((a) => {
      const cid = a.job_postings?.company_id;
      if (!cid) return;
      const c = ensure(cid, a.job_postings?.companies?.name || 'Unknown');
      c.applications += 1;
    });
    results.forEach((r) => {
      const job = jobs.find((j) => j.id === r.job_id);
      const cid = job?.company_id;
      if (!cid) return;
      const c = ensure(cid, job?.companies?.name || 'Unknown');
      c.placements += 1;
      if (r.package_offered) {
        c.total += Number(r.package_offered);
        c.count += 1;
      }
    });
    return Array.from(map.values())
      .map((c) => ({ ...c, avgPackage: c.count ? +(c.total / c.count).toFixed(2) : 0 }))
      .sort((a, b) => b.placements - a.placements || b.applications - a.applications);
  }, [jobs, apps, results]);

  // Status distribution
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    apps.forEach((a) => {
      counts[a.status] = (counts[a.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [apps]);

  // KPIs
  const totalPlacements = results.length;
  const placedCount = new Set(results.map((r) => r.user_id)).size;
  const avgPackage = useMemo(() => {
    const vals = results.map((r) => Number(r.package_offered)).filter((v) => v > 0);
    return vals.length ? +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : 0;
  }, [results]);
  const highestPackage = useMemo(() => {
    const vals = results.map((r) => Number(r.package_offered)).filter((v) => v > 0);
    return vals.length ? Math.max(...vals) : 0;
  }, [results]);
  const conversionRate = apps.length ? +((totalPlacements / apps.length) * 100).toFixed(1) : 0;

  // Exports
  const exportTrends = () => downloadCSV(`placement-trends-${Date.now()}.csv`, trendData);
  const exportCompanies = () =>
    downloadCSV(
      `company-stats-${Date.now()}.csv`,
      companyStats.map(({ name, jobs, applications, placements, avgPackage }) => ({
        Company: name,
        Jobs: jobs,
        Applications: applications,
        Placements: placements,
        'Avg Package (LPA)': avgPackage,
      })),
    );
  const exportPlacements = () =>
    downloadCSV(
      `placements-${Date.now()}.csv`,
      results.map((r) => ({
        Date: format(new Date(r.created_at), 'yyyy-MM-dd'),
        Job: r.job_postings?.title || '',
        Company: r.job_postings?.companies?.name || '',
        'Package (LPA)': r.package_offered || '',
        Joined: r.joined ? 'Yes' : 'No',
      })),
    );
  const exportApplications = () =>
    downloadCSV(
      `applications-${Date.now()}.csv`,
      apps.map((a) => ({
        Date: format(new Date(a.created_at), 'yyyy-MM-dd'),
        Job: a.job_postings?.title || '',
        Company: a.job_postings?.companies?.name || '',
        Status: a.status,
      })),
    );

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <DashboardHeader title="Placement Statistics" subtitle="Trends, company performance, and exportable reports." />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile label="Total Placements" value={totalPlacements} caption={`${placedCount} unique students`} icon={Trophy} tone="success" />
          <StatTile label="Avg Package" value={`${avgPackage} LPA`} caption="Across all offers" icon={IndianRupee} tone="info" />
          <StatTile label="Highest Package" value={`${highestPackage} LPA`} caption="Top offer" icon={TrendingUp} tone="primary" />
          <StatTile label="Conversion Rate" value={`${conversionRate}%`} caption="Applications → Offers" icon={Briefcase} tone="warning" />
        </div>

        <Panel
          title="6-Month Trends"
          description="Jobs posted, applications received, and placements"
          action={
            <Button variant="ghost" size="sm" onClick={exportTrends} className="gap-2">
              <Download className="h-4 w-4" /> CSV
            </Button>
          }
        >
          <div className="h-72 w-full">
            <ResponsiveContainer>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 12 }} />
                <Legend />
                <Line type="monotone" dataKey="Jobs" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Applications" stroke="hsl(var(--info))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Placements" stroke="hsl(var(--success))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <div className="grid gap-6 lg:grid-cols-3">
          <Panel
            title="Top Companies"
            description="By number of placements"
            className="lg:col-span-2"
            action={
              <Button variant="ghost" size="sm" onClick={exportCompanies} className="gap-2">
                <Download className="h-4 w-4" /> CSV
              </Button>
            }
          >
            <div className="h-72 w-full">
              <ResponsiveContainer>
                <BarChart data={companyStats.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 12 }} />
                  <Legend />
                  <Bar dataKey="placements" name="Placements" fill="hsl(var(--success))" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="applications" name="Applications" fill="hsl(var(--info))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title="Application Status" description="Pipeline distribution">
            {statusData.length > 0 ? (
              <div className="h-72 w-full">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={4}>
                      {statusData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 12 }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">No applications yet</p>
            )}
          </Panel>
        </div>

        <Panel
          title="Company Performance"
          description={`${companyStats.length} companies tracked`}
          action={<ViewAllLink to="/placement-admin/companies" />}
        >
          {companyStats.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="pb-3 font-semibold">Company</th>
                    <th className="pb-3 font-semibold">Jobs</th>
                    <th className="pb-3 font-semibold">Applications</th>
                    <th className="pb-3 font-semibold">Placements</th>
                    <th className="pb-3 font-semibold">Avg Package (LPA)</th>
                  </tr>
                </thead>
                <tbody>
                  {companyStats.map((c) => (
                    <tr key={c.name} className="border-t border-border/60">
                      <td className="py-3 font-semibold">{c.name}</td>
                      <td className="py-3">{c.jobs}</td>
                      <td className="py-3">{c.applications}</td>
                      <td className="py-3">{c.placements}</td>
                      <td className="py-3">{c.avgPackage || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">No company data yet</p>
          )}
        </Panel>

        <Panel title="Exportable Reports" description="Download CSV reports for analysis or sharing">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Trends Report', icon: TrendingUp, onClick: exportTrends, count: trendData.length },
              { label: 'Company Stats', icon: Building2, onClick: exportCompanies, count: companyStats.length },
              { label: 'All Placements', icon: Trophy, onClick: exportPlacements, count: results.length },
              { label: 'All Applications', icon: Briefcase, onClick: exportApplications, count: apps.length },
            ].map((r) => (
              <button
                key={r.label}
                onClick={r.onClick}
                className="group flex flex-col items-start gap-3 rounded-2xl bg-background p-5 text-left shadow-extruded-sm transition-all hover:-translate-y-0.5 hover:shadow-extruded active:shadow-inset"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl text-primary shadow-inset-sm">
                  <r.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">{r.label}</p>
                  <p className="text-xs text-muted-foreground">{r.count} rows</p>
                </div>
                <span className="mt-auto inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                  <Download className="h-3.5 w-3.5" /> Download CSV
                </span>
              </button>
            ))}
          </div>
        </Panel>
      </div>
    </MainLayout>
  );
}
