import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  FileText,
  UserCheck,
  TrendingUp,
  Users,
  Plus,
  BarChart3,
  ArrowRight,
  Download,
  RefreshCw,
  CalendarDays,
  Filter,
  Layers3,
} from 'lucide-react';

function getAcademicYearStart(year?: string | null) {
  if (!year) return 0;

  const match = year.match(/(20\d{2})/);
  return match ? Number(match[1]) : 0;
}

function formatAcademicYear(year?: string | null) {
  if (!year) return '—';
  return year.replace(/(\d{4})-(\d{4})/, '$1–$2');
}

export default function AdmissionsDashboard() {
  const { data: records = [], isLoading, refetch } = useQuery({
    queryKey: ['admissions-dashboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admission_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const academicYears = useMemo(() => {
    return Array.from(
      new Set(
        records
          .map((record) => record.academic_year)
          .filter(Boolean)
      )
    ).sort(
      (a, b) => getAcademicYearStart(b) - getAcademicYearStart(a)
    );
  }, [records]);

  const latestAcademicYear = academicYears[0] || 'all';

  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  const activeYear = selectedYear ?? latestAcademicYear;

  const filteredRecords = useMemo(() => {
    if (activeYear === 'all') return records;

    return records.filter(
      (record) => record.academic_year === activeYear
    );
  }, [records, activeYear]);

  const handleExportReport = () => {
    if (!records.length) return;

    const headers = [
      'Academic Year',
      'Course',
      'Region',
      'Applications',
      'Admissions',
      'Conversion Rate',
    ];

    const rows = records.map((record) => {
      const applications = Number(record.applications || 0);
      const admissions = Number(record.admissions || 0);
      const conversion =
        applications > 0
          ? ((admissions / applications) * 100).toFixed(1)
          : '0.0';

      return [
        record.academic_year || '',
        record.course || '',
        record.region || '',
        applications,
        admissions,
        `${conversion}%`,
      ];
    });

    const csv = [
      headers.join(','),
      ...rows.map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `campushub-admissions-report-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  const totalApplications = records.reduce(
    (sum, record) => sum + Number(record.applications || 0),
    0
  );

  const totalAdmissions = records.reduce(
    (sum, record) => sum + Number(record.admissions || 0),
    0
  );

  const conversionRate =
    totalApplications > 0
      ? ((totalAdmissions / totalApplications) * 100).toFixed(1)
      : '0.0';

  const snapshotApplications = filteredRecords.reduce(
    (sum, record) => sum + Number(record.applications || 0),
    0
  );

  const snapshotAdmissions = filteredRecords.reduce(
    (sum, record) => sum + Number(record.admissions || 0),
    0
  );

  const snapshotConversion =
    snapshotApplications > 0
      ? ((snapshotAdmissions / snapshotApplications) * 100).toFixed(1)
      : '0.0';

  const snapshotCourses = new Set(
    filteredRecords.map((record) => record.course).filter(Boolean)
  ).size;

  const snapshotRegions = new Set(
    filteredRecords.map((record) => record.region).filter(Boolean)
  ).size;

  const recentRecords = useMemo(() => {
    return [...filteredRecords]
      .sort(
        (a, b) =>
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime()
      )
      .slice(0, 6);
  }, [filteredRecords]);

  const snapshotLabel =
    activeYear === 'all'
      ? 'All Academic Years'
      : formatAcademicYear(activeYear);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-3xl bg-[#0B1220] p-7 text-white shadow-xl">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-2 text-sm font-medium text-blue-300">
                Admissions Cell
              </p>

              <h1 className="text-3xl font-bold tracking-tight">
                Admissions Dashboard
              </h1>

              <p className="mt-2 text-sm text-slate-300">
                Monitor applications, admissions and enrollment performance.
              </p>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => refetch()} disabled={isLoading} className="rounded-xl bg-blue-600 hover:bg-blue-500"><RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />Refresh Data</Button>
            </div>
          </div>
        </div>

        {/* Overall KPIs */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Layers3 className="h-4 w-4 text-blue-600" />
            <p className="text-sm font-semibold text-slate-700">
              Overall Admissions Performance
            </p>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
              All Sessions
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">
                  Total Applications
                </p>

                <div className="mt-2 flex items-center justify-between">
                  <p className="text-3xl font-bold">
                    {isLoading
                      ? '—'
                      : totalApplications.toLocaleString()}
                  </p>

                  <div className="rounded-xl bg-blue-500/10 p-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  Across all academic sessions
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-0 shadow-sm">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">
                  Total Admissions
                </p>

                <div className="mt-2 flex items-center justify-between">
                  <p className="text-3xl font-bold">
                    {isLoading
                      ? '—'
                      : totalAdmissions.toLocaleString()}
                  </p>

                  <div className="rounded-xl bg-emerald-500/10 p-3">
                    <UserCheck className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  Combined enrolled students
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-0 shadow-sm">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">
                  Conversion Rate
                </p>

                <div className="mt-2 flex items-center justify-between">
                  <p className="text-3xl font-bold">
                    {conversionRate}%
                  </p>

                  <div className="rounded-xl bg-violet-500/10 p-3">
                    <TrendingUp className="h-5 w-5 text-violet-600" />
                  </div>
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  Admissions ÷ applications
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-0 shadow-sm">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">
                  Admission Records
                </p>

                <div className="mt-2 flex items-center justify-between">
                  <p className="text-3xl font-bold">
                    {records.length}
                  </p>

                  <div className="rounded-xl bg-amber-500/10 p-3">
                    <Users className="h-5 w-5 text-amber-600" />
                  </div>
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  Course × region records
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Year-specific section */}
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* Recent records */}
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle>
                    {activeYear === 'all'
                      ? 'Recent Admission Records'
                      : `Recent Records · ${formatAcademicYear(activeYear)}`}
                  </CardTitle>
                </div>

                <p className="mt-1 text-sm text-muted-foreground">
                  Latest admission records for the selected academic session.
                </p>
              </div>

              <Button
                asChild
                variant="ghost"
                className="w-fit rounded-xl"
              >
                <Link to="/admissions/manage">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>

            <CardContent>
              {recentRecords.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 py-12 text-center">
                  <CalendarDays className="mx-auto h-8 w-8 text-slate-400" />

                  <p className="mt-3 font-semibold text-slate-700">
                    No admission records found
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    There are no records for {snapshotLabel}.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-3 font-semibold">
                          Academic Year
                        </th>
                        <th className="pb-3 font-semibold">
                          Course
                        </th>
                        <th className="pb-3 font-semibold">
                          Region
                        </th>
                        <th className="pb-3 text-right font-semibold">
                          Applications
                        </th>
                        <th className="pb-3 text-right font-semibold">
                          Admissions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {recentRecords.map((record) => (
                        <tr
                          key={record.id}
                          className="border-b last:border-0 transition-colors hover:bg-slate-50/80"
                        >
                          <td className="py-4">
                            <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                              {formatAcademicYear(record.academic_year)}
                            </span>
                          </td>

                          <td className="py-4 font-medium">
                            {record.course}
                          </td>

                          <td className="py-4 text-muted-foreground">
                            {record.region}
                          </td>

                          <td className="py-4 text-right">
                            {Number(
                              record.applications || 0
                            ).toLocaleString()}
                          </td>

                          <td className="py-4 text-right font-semibold text-emerald-700">
                            {Number(
                              record.admissions || 0
                            ).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admissions Snapshot */}
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>Admissions Snapshot</CardTitle>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Session-wise performance overview
                  </p>
                </div>

                <div className="rounded-xl bg-blue-500/10 p-2">
                  <Filter className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Year selector */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Academic Year
                </label>

                <select
                  value={activeYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  {academicYears.length > 1 && (
                    <option value="all">
                      All Academic Years
                    </option>
                  )}

                  {academicYears.map((year) => (
                    <option key={year} value={year}>
                      {formatAcademicYear(year)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Snapshot metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs text-muted-foreground">
                    Applications
                  </p>

                  <p className="mt-1 text-xl font-bold">
                    {snapshotApplications.toLocaleString()}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs text-muted-foreground">
                    Admissions
                  </p>

                  <p className="mt-1 text-xl font-bold">
                    {snapshotAdmissions.toLocaleString()}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs text-muted-foreground">
                    Conversion
                  </p>

                  <p className="mt-1 text-xl font-bold text-emerald-600">
                    {snapshotConversion}%
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs text-muted-foreground">
                    Records
                  </p>

                  <p className="mt-1 text-xl font-bold">
                    {filteredRecords.length}
                  </p>
                </div>
              </div>

              {/* Coverage */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Courses Covered
                  </span>

                  <span className="font-semibold">
                    {snapshotCourses}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Regions Covered
                  </span>

                  <span className="font-semibold">
                    {snapshotRegions}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Total Sessions
                  </span>

                  <span className="font-semibold">
                    {academicYears.length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}






