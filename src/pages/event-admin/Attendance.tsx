import EventAttendanceQR from '@/components/event-admin/EventAttendanceQR';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  Search,
  Users,
  XCircle,
  QrCode,
  BarChart3,
  UserCheck,
} from 'lucide-react';

interface Student {
  id: string;
  user_id: string;
  name: string;
  email: string;
  department: string | null;
}

interface AttendanceRecord {
  student_id: string;
  status: string;
}

export default function Attendance() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingStudent, setSavingStudent] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) return;

    const fetchAttendanceData = async () => {
      try {
        setLoading(true);

        const { data: event, error: eventError } = await supabase
          .from('events')
          .select('id, name, start_date')
          .eq('id', eventId)
          .single();

        if (eventError) throw eventError;

        setEventName(event.name);
        setEventDate(event.start_date);

        const { data: subEvents, error: subEventsError } =
          await supabase
            .from('sub_events')
            .select('id')
            .eq('event_id', eventId);

        if (subEventsError) throw subEventsError;

        const subEventIds = (subEvents || []).map(
          (subEvent) => subEvent.id
        );

        if (subEventIds.length === 0) {
          setStudents([]);
          setAttendance({});
          return;
        }

        const { data: registrations, error: registrationsError } =
          await supabase
            .from('event_registrations')
            .select('user_id, status')
            .in('sub_event_id', subEventIds);

        if (registrationsError) throw registrationsError;

        const userIds = Array.from(
          new Set(
            (registrations || [])
              .map((registration) => registration.user_id)
              .filter(Boolean)
          )
        );

        if (userIds.length === 0) {
          setStudents([]);
          setAttendance({});
          return;
        }

        const { data: profiles, error: profilesError } =
          await supabase
            .from('profiles')
            .select('id, user_id, name, email, department')
            .in('user_id', userIds)
            .order('name');

        if (profilesError) throw profilesError;

        const studentList = (profiles || []) as Student[];
        setStudents(studentList);

        const studentProfileIds = studentList.map(
          (student) => student.id
        );

        if (studentProfileIds.length === 0) {
          setAttendance({});
          return;
        }

        const { data: attendanceData, error: attendanceError } =
          await supabase
            .from('event_attendance')
            .select('student_id, status')
            .eq('event_id', eventId)
            .in('student_id', studentProfileIds);

        if (attendanceError) throw attendanceError;

        const attendanceMap: Record<string, string> = {};

        (attendanceData as AttendanceRecord[] | null)?.forEach(
          (record) => {
            attendanceMap[record.student_id] = record.status;
          }
        );

        setAttendance(attendanceMap);
      } catch (error) {
        console.error('Error loading attendance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [eventId]);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return students;

    return students.filter((student) =>
      [
        student.name,
        student.email,
        student.department,
      ].some((value) => value?.toLowerCase().includes(query))
    );
  }, [students, search]);

  const presentCount = students.filter(
    (student) => attendance[student.id] === 'present'
  ).length;

  const absentCount = students.filter(
    (student) => attendance[student.id] === 'absent'
  ).length;

  const pendingCount =
    students.length - presentCount - absentCount;

  const attendancePercentage =
    students.length > 0
      ? (presentCount / students.length) * 100
      : 0;

  const markAttendance = async (
    studentId: string,
    status: 'present' | 'absent'
  ) => {
    if (!eventId) return;

    try {
      setSavingStudent(studentId);

      const { error } = await supabase
        .from('event_attendance')
        .upsert(
          {
            event_id: eventId,
            student_id: studentId,
            status,
          },
          {
            onConflict: 'event_id,student_id',
          }
        );

      if (error) throw error;

      setAttendance((previous) => ({
        ...previous,
        [studentId]: status,
      }));
    } catch (error) {
      console.error('Error saving attendance:', error);
    } finally {
      setSavingStudent(null);
    }
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
              className="-ml-2 mb-4 rounded-xl"
              onClick={() => navigate('/admin/events')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Events
            </Button>

            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                  <ClipboardCheck className="h-3.5 w-3.5" />
                  Attendance Management
                </div>

                <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                  Event Attendance
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                  <span className="font-semibold text-foreground">
                    {eventName || 'Event'}
                  </span>

                  {eventDate && (
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(eventDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <Button
                asChild
                className="rounded-xl shadow-sm"
              >
                <Link
                  to={`/admin/events/${eventId}/attendance/analytics`}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Attendance Analytics
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Registered"
            value={students.length}
            icon={Users}
            iconClass="bg-primary/10 text-primary"
          />

          <StatCard
            label="Present"
            value={presentCount}
            icon={CheckCircle2}
            iconClass="bg-emerald-500/10 text-emerald-600"
          />

          <StatCard
            label="Absent"
            value={absentCount}
            icon={XCircle}
            iconClass="bg-red-500/10 text-red-600"
          />

          <StatCard
            label="Attendance Rate"
            value={`${attendancePercentage.toFixed(1)}%`}
            icon={UserCheck}
            iconClass="bg-blue-500/10 text-blue-600"
          />
        </div>

        {/* QR */}
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
          <div className="border-b border-border/60 bg-muted/20 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2.5">
                <QrCode className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold">Quick Check-In</h2>
                <p className="text-sm text-muted-foreground">
                  Let students scan the QR code to mark attendance.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <EventAttendanceQR
              eventId={eventId!}
              eventName={eventName || 'Event'}
            />
          </div>
        </div>

        {/* Students */}
        <Card className="overflow-hidden rounded-2xl border-border/70 shadow-sm">
          <CardHeader className="border-b border-border/60 bg-muted/10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-xl">
                  Student Attendance
                </CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Manually mark students as present or absent.
                </p>
              </div>

              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search by name, email or department..."
                  className="h-10 rounded-xl border-border/70 bg-background pl-9"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6">
            {loading ? (
              <div className="flex min-h-[280px] flex-col items-center justify-center gap-3">
                <div className="rounded-2xl bg-primary/10 p-4">
                  <Loader2 className="h-7 w-7 animate-spin text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Loading attendance...
                </p>
              </div>
            ) : students.length === 0 ? (
              <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
                <div className="mb-4 rounded-2xl bg-primary/10 p-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold">
                  No registered students
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Students registered for this event will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredStudents.map((student) => {
                  const currentStatus = attendance[student.id];
                  const isSaving = savingStudent === student.id;

                  return (
                    <div
                      key={student.id}
                      className="group flex flex-col gap-4 rounded-2xl border border-border/60 bg-background p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                          {student.name?.charAt(0)?.toUpperCase() || 'S'}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate font-semibold">
                              {student.name}
                            </p>

                            {currentStatus === 'present' && (
                              <Badge className="rounded-full bg-emerald-100 px-2.5 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                                Present
                              </Badge>
                            )}

                            {currentStatus === 'absent' && (
                              <Badge className="rounded-full bg-red-100 px-2.5 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                                Absent
                              </Badge>
                            )}

                            {!currentStatus && (
                              <Badge
                                variant="outline"
                                className="rounded-full"
                              >
                                Pending
                              </Badge>
                            )}
                          </div>

                          <p className="mt-1 truncate text-sm text-muted-foreground">
                            {student.email}
                          </p>

                          {student.department && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {student.department}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <Button
                          size="sm"
                          disabled={isSaving}
                          variant={
                            currentStatus === 'present'
                              ? 'default'
                              : 'outline'
                          }
                          className="rounded-xl"
                          onClick={() =>
                            markAttendance(student.id, 'present')
                          }
                        >
                          {isSaving &&
                          currentStatus !== 'present' ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                          )}
                          Present
                        </Button>

                        <Button
                          size="sm"
                          disabled={isSaving}
                          variant={
                            currentStatus === 'absent'
                              ? 'destructive'
                              : 'outline'
                          }
                          className="rounded-xl"
                          onClick={() =>
                            markAttendance(student.id, 'absent')
                          }
                        >
                          {isSaving &&
                          currentStatus !== 'absent' ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle className="mr-2 h-4 w-4" />
                          )}
                          Absent
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {filteredStudents.length === 0 && (
                  <div className="py-10 text-center">
                    <Search className="mx-auto mb-3 h-7 w-7 text-muted-foreground" />
                    <p className="font-medium">
                      No students found
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Try a different search term.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending notice */}
        {!loading && students.length > 0 && (
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-dashed border-primary/30 bg-primary/[0.03] p-4">
            <div>
              <p className="font-semibold">
                {pendingCount} pending
              </p>
              <p className="text-sm text-muted-foreground">
                Students whose attendance has not been marked yet.
              </p>
            </div>

            <ClipboardCheck className="hidden h-6 w-6 text-primary sm:block" />
          </div>
        )}
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
        <div
          className={`rounded-xl p-3 ${iconClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div>
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
