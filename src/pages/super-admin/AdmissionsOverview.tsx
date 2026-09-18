import { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  GraduationCap,
  Users,
  CheckCircle2,
  Search,
  Eye,
} from 'lucide-react';

type AdmissionRecord = {
  id: string;
  academic_year: string;
  course: string;
  region: string;
  applications: number;
  admissions: number;
};

export default function AdmissionsOverview() {
  const [records, setRecords] = useState<AdmissionRecord[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);

    const { data } = await supabase
      .from('admission_records')
      .select('*')
      .order('academic_year', { ascending: false });

    setRecords((data || []) as AdmissionRecord[]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const totals = useMemo(
    () => ({
      applications: records.reduce((sum, row) => sum + (row.applications || 0), 0),
      admissions: records.reduce((sum, row) => sum + (row.admissions || 0), 0),
    }),
    [records]
  );

  const conversion =
    totals.applications > 0
      ? Math.round((totals.admissions / totals.applications) * 100)
      : 0;

  const filtered = records.filter((record) => {
    const query = search.toLowerCase();
    return (
      record.course.toLowerCase().includes(query) ||
      record.region.toLowerCase().includes(query) ||
      record.academic_year.toLowerCase().includes(query)
    );
  });

  const stats = [
    { label: 'Total Applications', value: totals.applications, icon: Users },
    { label: 'Total Admissions', value: totals.admissions, icon: CheckCircle2 },
    { label: 'Conversion Rate', value: `${conversion}%`, icon: GraduationCap },
    { label: 'Data Records', value: records.length, icon: Eye },
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
              Admissions Overview
            </h1>
            <p className="mt-3 text-sm leading-6 text-blue-100 md:text-base">
              Complete admissions visibility with analytics and regional breakdowns.
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
                <h2 className="text-xl font-bold">Admission Records</h2>
                <p className="text-sm text-muted-foreground">
                  Academic year, course and regional admission data.
                </p>
              </div>

              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search course, region, year..."
                  className="pl-9"
                />
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-muted-foreground">
                Loading admissions data...
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                No admission records found.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border/60">
                <table className="w-full min-w-[720px] text-sm">
                  <thead className="bg-muted/50">
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left font-semibold">Academic Year</th>
                      <th className="px-4 py-3 text-left font-semibold">Course</th>
                      <th className="px-4 py-3 text-left font-semibold">Region</th>
                      <th className="px-4 py-3 text-right font-semibold">Applications</th>
                      <th className="px-4 py-3 text-right font-semibold">Admissions</th>
                      <th className="px-4 py-3 text-right font-semibold">Conversion</th>
                      <th className="px-4 py-3 text-right font-semibold">Access</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((record) => {
                      const rate =
                        record.applications > 0
                          ? Math.round((record.admissions / record.applications) * 100)
                          : 0;

                      return (
                        <tr
                          key={record.id}
                          className="border-b last:border-0 hover:bg-muted/30"
                        >
                          <td className="px-4 py-4 font-medium">{record.academic_year}</td>
                          <td className="px-4 py-4">{record.course}</td>
                          <td className="px-4 py-4">
                            <Badge variant="secondary">{record.region}</Badge>
                          </td>
                          <td className="px-4 py-4 text-right">{record.applications}</td>
                          <td className="px-4 py-4 text-right font-semibold">
                            {record.admissions}
                          </td>
                          <td className="px-4 py-4 text-right text-blue-600 font-semibold">
                            {rate}%
                          </td>
                          <td className="px-4 py-4 text-right">
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <Eye className="h-3.5 w-3.5" />
                              Read only
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
