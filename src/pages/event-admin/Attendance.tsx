import EventAttendanceQR from '@/components/event-admin/EventAttendanceQR';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  Search,
  Users,
  XCircle,
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

        // 1. Fetch event
        const { data: event, error: eventError } = await supabase
          .from('events')
          .select('id, name, start_date')
          .eq('id', eventId)
          .single();

        if (eventError) throw eventError;

        setEventName(event.name);
        setEventDate(event.start_date);

        // 2. Fetch sub-events belonging to this event
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

        // 3. Fetch registrations through sub_event_id
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

        // 4. Fetch profiles using user_id
        const { data: profiles, error: profilesError } =
          await supabase
            .from('profiles')
            .select('id, user_id, name, email, department')
            .in('user_id', userIds)
            .order('name');

        if (profilesError) throw profilesError;

        const studentList = (profiles || []) as Student[];

        setStudents(studentList);

        // 5. Fetch existing attendance
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

    return students.filter((student) => {
      return (
        student.name?.toLowerCase().includes(query) ||
        student.email?.toLowerCase().includes(query) ||
        student.department?.toLowerCase().includes(query)
      );
    });
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
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="mb-2 -ml-2"
            onClick={() => navigate('/admin/events')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>

          <h1 className="text-3xl font-bold">Event Attendance</h1>

          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {eventName || 'Event'}
            </span>

            {eventDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(eventDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>


        <div className="flex justify-end">
          <Button asChild variant="outline">
            <Link to={`/admin/events/${eventId}/attendance/analytics`}>
              <ClipboardCheck className="mr-2 h-4 w-4" />
              Attendance Analytics
            </Link>
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                  {students.length}
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
                  {presentCount}
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
                  {absentCount}
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
                  {attendancePercentage.toFixed(1)}%
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      {/* Attendance QR */}
<EventAttendanceQR
  eventId={eventId!}
  eventName={eventName || 'Event'}
/>
        {/* Student Attendance */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Student Attendance</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Mark students as present or absent.
                </p>
              </div>

              <div className="relative w-full sm:w-72">
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
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : students.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <Users className="mx-auto mb-3 h-10 w-10" />
                <p className="font-medium">
                  No registered students found
                </p>
                <p className="mt-1 text-sm">
                  Students registered for this event will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredStudents.map((student) => {
                  const currentStatus = attendance[student.id];
                  const isSaving =
                    savingStudent === student.id;

                  return (
                    <div
                      key={student.id}
                      className="flex flex-col gap-4 rounded-2xl border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">
                            {student.name}
                          </p>

                          {currentStatus === 'present' && (
                            <Badge variant="success">
                              Present
                            </Badge>
                          )}

                          {currentStatus === 'absent' && (
                            <Badge variant="destructive">
                              Absent
                            </Badge>
                          )}

                          {!currentStatus && (
                            <Badge variant="outline">
                              Pending
                            </Badge>
                          )}
                        </div>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {student.email}
                        </p>

                        {student.department && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {student.department}
                          </p>
                        )}
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <Button
                          size="sm"
                          variant={
                            currentStatus === 'present'
                              ? 'default'
                              : 'outline'
                          }
                          disabled={isSaving}
                          onClick={() =>
                            markAttendance(
                              student.id,
                              'present'
                            )
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
                          variant={
                            currentStatus === 'absent'
                              ? 'destructive'
                              : 'outline'
                          }
                          disabled={isSaving}
                          onClick={() =>
                            markAttendance(
                              student.id,
                              'absent'
                            )
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
                  <div className="py-8 text-center text-muted-foreground">
                    No students match your search.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {!loading && students.length > 0 && pendingCount > 0 && (
          <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
            <strong className="text-foreground">
              {pendingCount}
            </strong>{' '}
            student{pendingCount !== 1 ? 's' : ''} still pending
            attendance.
          </div>
        )}
      </div>
    </MainLayout>
  );
}

