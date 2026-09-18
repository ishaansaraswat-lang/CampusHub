import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  Download,
  Search,
  Users,
  XCircle,
  Clock,
  TrendingUp,
  UserCheck,
} from 'lucide-react';

interface AttendanceRow {
  studentId: string;
  name: string;
  email: string;
  department: string | null;
  status: 'present' | 'absent' | 'pending';
  checkedInAt: string | null;
}

export default function AttendanceAnalytics() {
  const { eventId } = useParams<{ eventId: string }>();

  const [eventName, setEventName] = useState('');
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;

    const fetchAnalytics = async () => {
      try {
        setLoading(true);

        const { data: event, error: eventError } = await supabase
          .from('events')
          .select('id, name')
          .eq('id', eventId)
          .single();

        if (eventError) throw eventError;

        setEventName(event.name);

        const { data: subEvents, error: subEventError } =
          await supabase
            .from('sub_events')
            .select('id')
            .eq('event_id', eventId);

        if (subEventError) throw subEventError;

        const subEventIds = (subEvents || []).map((item) => item.id);

        if (subEventIds.length === 0) {
          setRows([]);
          return;
        }

        const { data: registrations, error: registrationError } =
          await supabase
            .from('event_registrations')
            .select('user_id')
            .in('sub_event_id', subEventIds);

        if (registrationError) throw registrationError;

        const userIds = Array.from(
          new Set(
            (registrations || [])
              .map((registration) => registration.user_id)
              .filter(Boolean)
          )
        );

        if (userIds.length === 0) {
          setRows([]);
          return;
        }

        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, user_id, name, email, department')
          .in('user_id', userIds)
          .order('name');

        if (profileError) throw profileError;

        const profileIds = (profiles || []).map((profile) => profile.id);

        const { data: attendance, error: attendanceError } =
          await supabase
            .from('event_attendance')
            .select('student_id, status, checked_in_at')
            .eq('event_id', eventId)
            .in('student_id', profileIds);

        if (attendanceError) throw attendanceError;

        const attendanceMap = new Map(
          (attendance || []).map((record) => [
            record.student_id,
            record,
          ])
        );

        const analyticsRows: AttendanceRow[] = (profiles || []).map(
          (profile) => {
            const record = attendanceMap.get(profile.id);

            return {
              studentId: profile.id,
              name: profile.name,
              email: profile.email,
              department: profile.department,
              status:
                record?.status === 'present' ||
                record?.status === 'absent'
                  ? record.status
                  : 'pending',
              checkedInAt: record?.checked_in_at || null,
            };
          }
        );

        setRows(analyticsRows);
      } catch (error) {
        console.error('Error loading attendance analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [eventId]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return rows;

    return rows.filter((row) =>
      [
        row.name,
        row.email,
        row.department,
      ].some((value) => value?.toLowerCase().includes(query))
    );
  }, [rows, search]);

  const total = rows.length;

  const present = rows.filter(
    (row) => row.status === 'present'
  ).length;

  const absent = rows.filter(
    (row) => row.status === 'absent'
  ).length;

  const pending = rows.filter(
    (row) => row.status === 'pending'
  ).length;

  const attendanceRate =
    total > 0 ? (present / total) * 100 : 0;

  const exportCSV = () => {
    const headers = [
      'Student Name',
      'Email',
      'Department',
      'Status',
      'Checked In At',
    ];

    const data = rows.map((row) => [
      row.name,
      row.email,
      row.department || '',
      row.status,
      row.checkedInAt
        ? new Date(row.checkedInAt).toLocaleString()
        : '',
    ]);

    const csv = [headers, ...data]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `${eventName
      .replace(/\s+/g, '-')
      .toLowerCase()}-attendance.csv`;

    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card p-6 shadow-sm sm:p-8">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-blue-400/10 blur-3xl" />

          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="-ml-2 mb-4 rounded-xl"
            >
              <Link to={`/admin/events/${eventId}/attendance`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Attendance
              </Link>
            </Button>

            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                  <BarChart3 className="h-3.5 w-3.5" />
                  Attendance Analytics
                </div>

                <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                  Attendance Analytics
                </h1>

                <p className="mt-2 text-muted-foreground">
                  {eventName || 'Event'} — attendance overview and report
                </p>
              </div>

              <Button
                onClick={exportCSV}
                disabled={rows.length === 0}
                className="rounded-xl shadow-sm"
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>

        {/* KPI */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label="Registered"
            value={total}
            icon={Users}
            iconClass="bg-primary/10 text-primary"
          />

          <StatCard
            label="Present"
            value={present}
            icon={CheckCircle2}
            iconClass="bg-emerald-500/10 text-emerald-600"
          />

          <StatCard
            label="Absent"
            value={absent}
            icon={XCircle}
            iconClass="bg-red-500/10 text-red-600"
          />

          <StatCard
            label="Pending"
            value={pending}
            icon={Clock}
            iconClass="bg-amber-500/10 text-amber-600"
          />

          <StatCard
            label="Attendance Rate"
            value={`${attendanceRate.toFixed(1)}%`}
            icon={TrendingUp}
            iconClass="bg-blue-500/10 text-blue-600"
          />
        </div>

        {/* Overview */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="rounded-2xl border-border/70 shadow-sm lg:col-span-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Overall Attendance
                  </p>
                  <p className="mt-1 text-3xl font-bold">
                    {attendanceRate.toFixed(1)}%
                  </p>
                </div>

                <div className="rounded-2xl bg-primary/10 p-3">
                  <UserCheck className="h-6 w-6 text-primary" />
                </div>
              </div>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{
                    width: `${Math.min(attendanceRate, 100)}%`,
                  }}
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-5 text-sm">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  Present: {present}
                </span>

                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  Absent: {absent}
                </span>

                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  Pending: {pending}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/70 bg-primary text-primary-foreground shadow-sm">
            <CardContent className="flex h-full flex-col justify-between p-6">
              <div>
                <div className="mb-4 w-fit rounded-xl bg-white/15 p-3">
                  <ClipboardCheck className="h-6 w-6" />
                </div>

                <p className="text-sm text-primary-foreground/70">
                  Attendance Summary
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {present} of {total}
                </p>

                <p className="mt-1 text-sm text-primary-foreground/70">
                  registered students marked present
                </p>
              </div>

              <Button
                asChild
                variant="secondary"
                className="mt-6 w-full rounded-xl"
              >
                <Link to={`/admin/events/${eventId}/attendance`}>
                  Manage Attendance
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Report */}
        <Card className="overflow-hidden rounded-2xl border-border/70 shadow-sm">
          <CardHeader className="border-b border-border/60 bg-muted/10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-xl">
                  Student Report
                </CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Detailed attendance and check-in information.
                </p>
              </div>

              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search student..."
                  className="h-10 rounded-xl border-border/70 bg-background pl-9"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6">
            {loading ? (
              <div className="flex min-h-[280px] flex-col items-center justify-center gap-3">
                <div className="rounded-2xl bg-primary/10 p-4">
                  <BarChart3 className="h-7 w-7 animate-pulse text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Loading attendance report...
                </p>
              </div>
            ) : filteredRows.length === 0 ? (
              <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
                <div className="mb-4 rounded-2xl bg-muted p-4">
                  <Search className="h-7 w-7 text-muted-foreground" />
                </div>
                <p className="font-semibold">
                  No attendance records found
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try changing your search term.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRows.map((row) => (
                  <div
                    key={row.studentId}
                    className="group flex flex-col gap-4 rounded-2xl border border-border/60 bg-background p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                        {row.name?.charAt(0)?.toUpperCase() || 'S'}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-semibold">
                            {row.name}
                          </p>

                          {row.status === 'present' && (
                            <Badge className="rounded-full bg-emerald-100 px-2.5 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                              Present
                            </Badge>
                          )}

                          {row.status === 'absent' && (
                            <Badge className="rounded-full bg-red-100 px-2.5 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                              Absent
                            </Badge>
                          )}

                          {row.status === 'pending' && (
                            <Badge
                              variant="outline"
                              className="rounded-full"
                            >
                              Pending
                            </Badge>
                          )}
                        </div>

                        <p className="mt-1 truncate text-sm text-muted-foreground">
                          {row.email}
                        </p>

                        {row.department && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {row.department}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:text-right">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Check-in Time
                        </p>
                        <p className="mt-1 text-sm font-medium">
                          {row.checkedInAt
                            ? new Date(
                                row.checkedInAt
                              ).toLocaleString()
                            : '—'}
                        </p>
                      </div>

                      <div className="hidden rounded-xl bg-muted/60 p-2 sm:block">
                        {row.status === 'present' ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : row.status === 'absent' ? (
                          <XCircle className="h-4 w-4 text-red-600" />
                        ) : (
                          <Clock className="h-4 w-4 text-amber-600" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconClass,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  iconClass: string;
}) {
  return (
    <Card className="group relative overflow-hidden rounded-2xl border-border/70 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <div className="absolute left-0 top-0 h-1 w-full bg-primary/70" />

      <CardContent className="flex items-center gap-4 p-5 pt-6">
        <div className={`rounded-xl p-3 ${iconClass}`}>
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
