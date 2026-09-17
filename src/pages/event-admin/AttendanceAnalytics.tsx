import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Download,
  Search,
  Users,
  XCircle,
  Clock,
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

        const { data: subEvents, error: subEventError } = await supabase
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

        const { data: attendance, error: attendanceError } = await supabase
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

    return rows.filter(
      (row) =>
        row.name.toLowerCase().includes(query) ||
        row.email.toLowerCase().includes(query) ||
        row.department?.toLowerCase().includes(query)
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

    const csv = [
      headers,
      ...data,
    ]
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
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="mb-2 -ml-2"
          >
            <Link to={`/admin/events/${eventId}/attendance`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Attendance
            </Link>
          </Button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                Attendance Analytics
              </h1>

              <p className="mt-1 text-muted-foreground">
                {eventName || 'Event'} — attendance overview and report
              </p>
            </div>

            <Button
              onClick={exportCSV}
              disabled={rows.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-xl bg-primary/10 p-3">
                <Users className="h-5 w-5 text-primary" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Registered
                </p>
                <p className="text-2xl font-bold">
                  {total}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-xl bg-green-500/10 p-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Present
                </p>
                <p className="text-2xl font-bold">
                  {present}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-xl bg-red-500/10 p-3">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Absent
                </p>
                <p className="text-2xl font-bold">
                  {absent}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-xl bg-amber-500/10 p-3">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Pending
                </p>
                <p className="text-2xl font-bold">
                  {pending}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-xl bg-blue-500/10 p-3">
                <ClipboardCheck className="h-5 w-5 text-blue-600" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Attendance Rate
                </p>
                <p className="text-2xl font-bold">
                  {attendanceRate.toFixed(1)}%
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student Report */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Attendance Report</CardTitle>

              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search student..."
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="py-12 text-center text-muted-foreground">
                Loading attendance report...
              </div>
            ) : filteredRows.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                No attendance records found.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRows.map((row) => (
                  <div
                    key={row.studentId}
                    className="flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">
                          {row.name}
                        </p>

                        {row.status === 'present' && (
                          <Badge variant="success">
                            Present
                          </Badge>
                        )}

                        {row.status === 'absent' && (
                          <Badge variant="destructive">
                            Absent
                          </Badge>
                        )}

                        {row.status === 'pending' && (
                          <Badge variant="outline">
                            Pending
                          </Badge>
                        )}
                      </div>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {row.email}
                      </p>

                      {row.department && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {row.department}
                        </p>
                      )}
                    </div>

                    <div className="text-left text-sm sm:text-right">
                      <p className="text-muted-foreground">
                        Check-in Time
                      </p>

                      <p className="font-medium">
                        {row.checkedInAt
                          ? new Date(
                              row.checkedInAt
                            ).toLocaleString()
                          : '—'}
                      </p>
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