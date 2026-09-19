import { useEffect, useMemo, useState } from 'react';
import {
  GraduationCap,
  ClipboardList,
  Users,
  TrendingUp,
  Loader2,
  ShieldCheck,
  Search,
  MapPin,
  BookOpen,
  CalendarDays,
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

export default function AdmissionsOverview() {
  const [records, setRecords] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [year, setYear] = useState('all');
  const [course, setCourse] = useState('all');
  const [region, setRegion] = useState('all');

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('admission_records')
        .select('*')
        .order('created_at', { ascending: false });

      setRecords(data || []);
      setLoading(false);
    };

    load();
  }, []);

  const years = useMemo(
    () =>
      Array.from(
        new Set(
          records
            .map((r) => pick(r, ['academic_year', 'year', 'session']))
            .filter((v) => v !== '—')
        )
      ).sort(),
    [records]
  );

  const courses = useMemo(
    () =>
      Array.from(
        new Set(
          records
            .map((r) => pick(r, ['course', 'program', 'programme']))
            .filter((v) => v !== '—')
        )
      ).sort(),
    [records]
  );

  const regions = useMemo(
    () =>
      Array.from(
        new Set(
          records
            .map((r) => pick(r, ['region', 'state', 'location']))
            .filter((v) => v !== '—')
        )
      ).sort(),
    [records]
  );

  const filtered = records.filter((record) => {
    const recordYear = pick(record, ['academic_year', 'year', 'session']);
    const recordCourse = pick(record, ['course', 'program', 'programme']);
    const recordRegion = pick(record, ['region', 'state', 'location']);

    const matchesYear = year === 'all' || recordYear === year;
    const matchesCourse = course === 'all' || recordCourse === course;
    const matchesRegion = region === 'all' || recordRegion === region;

    const text = JSON.stringify(record).toLowerCase();
    const matchesSearch = text.includes(search.toLowerCase());

    return matchesYear && matchesCourse && matchesRegion && matchesSearch;
  });

  const stats = useMemo(() => {
    const applications = records.reduce(
      (sum, row) => sum + Number(row.applications || 0),
      0
    );
    const admissions = records.reduce(
      (sum, row) => sum + Number(row.admissions || 0),
      0
    );

    return {
      records: records.length,
      applications,
      admissions,
      conversion: applications ? ((admissions / applications) * 100).toFixed(1) : '0.0',
    };
  }, [records]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="rounded-2xl bg-[#0B1220] p-6 text-white shadow-lg">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-blue-600 p-3">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Admissions Overview</h1>
              <p className="mt-1 text-sm text-slate-300">
                Complete system-wide admissions monitoring. Super Admin access is read-only.
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
              <Stat label="Admission Records" value={stats.records} icon={ClipboardList} />
              <Stat label="Applications" value={stats.applications} icon={Users} />
              <Stat label="Total Admissions" value={stats.admissions} icon={GraduationCap} />
              <Stat label="Conversion Rate" value={`${stats.conversion}%`} icon={TrendingUp} />
            </div>

            <Card className="rounded-2xl shadow-sm">
              <CardContent className="p-5">
                <div className="grid gap-3 lg:grid-cols-5">
                  <div className="relative lg:col-span-2">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search admission records..."
                      className="w-full rounded-xl border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  <Filter value={year} setValue={setYear} label="Academic Year" options={years} />
                  <Filter value={course} setValue={setCourse} label="Course" options={courses} />
                  <Filter value={region} setValue={setRegion} label="Region" options={regions} />
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden rounded-2xl shadow-sm">
              <div className="flex items-center justify-between border-b px-5 py-4">
                <div>
                  <h2 className="text-lg font-bold">Admission Records</h2>
                  <p className="text-sm text-muted-foreground">
                    Individual admission data • Read only
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                  {filtered.length} records
                </span>
              </div>

              {filtered.length === 0 ? (
                <div className="py-16 text-center text-sm text-muted-foreground">
                  No admission records match the selected filters.
                </div>
              ) : (
                <div className="divide-y">
                  {filtered.map((record, index) => (
                    <div
                      key={record.id || index}
                      className="grid gap-5 p-5 transition hover:bg-muted/30 md:grid-cols-6"
                    >
                      <div className="md:col-span-2">
                        <div className="flex items-start gap-3">
                          <div className="rounded-xl bg-primary/10 p-2.5">
                            <GraduationCap className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">
                              {pick(record, ['course', 'program', 'programme'], 'Admission Record')}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Record #{index + 1}
                            </p>
                          </div>
                        </div>
                      </div>

                      <Detail
                        icon={CalendarDays}
                        label="Academic Year"
                        value={pick(record, ['academic_year', 'year', 'session'])}
                      />

                      <Detail
                        icon={BookOpen}
                        label="Applications"
                        value={pick(record, ['applications'], '0')}
                      />

                      <Detail
                        icon={Users}
                        label="Admissions"
                        value={pick(record, ['admissions'], '0')}
                      />

                      <Detail
                        icon={MapPin}
                        label="Region"
                        value={pick(record, ['region', 'state', 'location'])}
                      />
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              Super Admin can view and monitor individual admissions records. All admissions modifications remain restricted to the Admissions Admin.
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: any;
}) {
  return (
    <Card className="rounded-2xl shadow-sm">
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
  );
}

function Filter({
  value,
  setValue,
  label,
  options,
}: {
  value: string;
  setValue: (value: string) => void;
  label: string;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
      aria-label={label}
    >
      <option value="all">{label}: All</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="truncate text-sm font-semibold">{value}</p>
    </div>
  );
}
