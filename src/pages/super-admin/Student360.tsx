import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Search,
  Users,
  GraduationCap,
  Calendar,
  CheckCircle2,
  Briefcase,
  BriefcaseBusiness,
  Trophy,
  Mail,
  Phone,
  Building,
  RefreshCw,
} from 'lucide-react';

interface Student {
  id: string;
  user_id: string;
  name: string;
  email: string;
  student_id: string | null;
  department: string | null;
  year: number | null;
  cgpa: number | null;
  phone: string | null;
  avatar_url: string | null;
}

interface EventRegistration {
  id: string;
  status: string;
  team_name: string | null;
  sub_events: {
    name: string;
    events: {
      name: string;
      banner_url: string | null;
    } | null;
  } | null;
}

interface AttendanceRecord {
  event_id: string;
  status: string;
  checked_in_at: string;
}

interface EventResult {
  id: string;
  position: number;
  remarks: string | null;
  team_name: string | null;
  sub_event_id: string;
}

interface PlacementResult {
  id: string;
  job_id: string;
  joined: boolean | null;
  package_offered: number | null;
  offer_letter_url: string | null;
  created_at: string;
}

interface PlacementApplication {
  id: string;
  status: string;
  created_at: string;
  job_postings: {
    title: string;
    package_lpa: number | null;
    companies: {
      name: string;
      logo_url: string | null;
    } | null;
  } | null;
}

export default function Student360() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [eventRegistrations, setEventRegistrations] = useState<
    EventRegistration[]
  >([]);

  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  const [placementApplications, setPlacementApplications] = useState<
    PlacementApplication[]
  >([]);

  const [eventResults, setEventResults] = useState<EventResult[]>([]);
  const [placementResults, setPlacementResults] = useState<PlacementResult[]>([]);

  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const loadStudents = async () => {
    try {
      setLoadingStudents(true);

      const { data, error } = await supabase
        .from('profiles')
        .select(
          'id, user_id, name, email, student_id, department, year, cgpa, phone, avatar_url'
        )
        .order('name', { ascending: true });

      if (error) throw error;

      setStudents(data || []);

      if (!selectedStudent && data && data.length > 0) {
        setSelectedStudent(data[0]);
      }
    } catch (error) {
      console.error('Failed to load students:', error);
    } finally {
      setLoadingStudents(false);
    }
  };

  const loadStudentDetails = async (student: Student) => {
    try {
      setLoadingDetails(true);

      // Event registrations
      const { data: registrations } = await supabase
        .from('event_registrations')
        .select(
          `
          id,
          status,
          team_name,
          sub_events (
            name,
            events:event_id (
              name,
              banner_url
            )
          )
        `
        )
        .eq('user_id', student.user_id);

      setEventRegistrations(
        (registrations || []) as unknown as EventRegistration[]
      );

      // Attendance
      const { data: attendanceData } = await supabase
        .from('event_attendance')
        .select('event_id, status, checked_in_at')
        .eq('student_id', student.id);

      setAttendance((attendanceData || []) as AttendanceRecord[]);

      // Event results
      const { data: eventResultsData } = await supabase
        .from('event_results')
        .select('id, position, remarks, team_name, sub_event_id')
        .eq('user_id', student.user_id)
        .order('position', { ascending: true });

      setEventResults((eventResultsData || []) as EventResult[]);

      // Placement applications
      const { data: applications } = await supabase
        .from('placement_applications')
        .select(
          `
          id,
          status,
          created_at,
          job_postings (
            title,
            package_lpa,
            companies (
              name,
              logo_url
            )
          )
        `
        )
        .eq('user_id', student.user_id)
        .order('created_at', { ascending: false });

      setPlacementApplications(
        (applications || []) as unknown as PlacementApplication[]
      );

      // Placement results
      const { data: placementResultsData } = await supabase
        .from('placement_results')
        .select('id, job_id, joined, package_offered, offer_letter_url, created_at')
        .eq('user_id', student.user_id)
        .order('created_at', { ascending: false });

      setPlacementResults((placementResultsData || []) as PlacementResult[]);
    } catch (error) {
      console.error('Failed to load student details:', error);

      setEventRegistrations([]);
      setAttendance([]);
      setPlacementApplications([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      loadStudentDetails(selectedStudent);
    }
  }, [selectedStudent]);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return students.filter(
      (student) =>
        (
          student.name?.toLowerCase().includes(query) ||
          student.email?.toLowerCase().includes(query) ||
          student.student_id?.toLowerCase().includes(query) ||
          student.department?.toLowerCase().includes(query)
        ) &&
        (yearFilter === 'all' || String(student.year) === yearFilter) &&
        (courseFilter === 'all' || student.department === courseFilter)
    );
  }, [students, search, yearFilter, courseFilter]);
  const presentCount = attendance.filter(
    (record) => record.status === 'present'
  ).length;

  const absentCount = attendance.filter(
    (record) => record.status === 'absent'
  ).length;

  const attendanceRate =
    attendance.length > 0
      ? (presentCount / attendance.length) * 100
      : 0;

  const selectedEventCount = new Set(
    eventRegistrations
      .map((registration) => registration.sub_events?.events?.name)
      .filter(Boolean)
  ).size;

  const selectedApplicationCount = placementApplications.length;

  const selectedOfferCount = placementApplications.filter(
    (application) =>
      application.status === 'selected' ||
      application.status === 'offered' ||
      application.status === 'placed'
  ).length;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Student 360°</h1>
            <p className="mt-1 text-muted-foreground">
              Complete student profile, participation, attendance and
              placement overview
            </p>
          </div>

          <Button
            variant="outline"
            onClick={loadStudents}
            disabled={loadingStudents}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${
                loadingStudents ? 'animate-spin' : ''
              }`}
            />
            Refresh
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Student Search */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Students
              </CardTitle>

              <div className="relative pt-2">
                <Search className="absolute left-3 top-5 h-4 w-4 text-muted-foreground" />

                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search student..."
                  className="pl-9"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3">
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="h-10 rounded-md border bg-background px-3 text-sm"
                >
                  <option value="all">All Years</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>

                <select
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  className="h-10 rounded-md border bg-background px-3 text-sm"
                >
                  <option value="all">All Courses</option>
                  {Array.from(new Set(students.map((s) => s.department).filter(Boolean))).map((course) => (
                    <option key={course} value={course!}>{course}</option>
                  ))}
                </select>
              </div>

              <p className="pt-3 text-xs text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{filteredStudents.length}</span> of {students.length} students
              </p>
            </CardHeader>

            <CardContent className="max-h-[620px] space-y-2 overflow-y-auto">
              {loadingStudents ? (
                <div className="py-10 text-center text-muted-foreground">
                  Loading students...
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground">
                  No students found.
                </div>
              ) : (
                filteredStudents.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className={`w-full rounded-xl border p-3 text-left transition ${
                      selectedStudent?.id === student.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={student.avatar_url || undefined}
                        />
                        <AvatarFallback>
                          {student.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {student.name}
                        </p>

                        <p className="truncate text-xs text-muted-foreground">
                          {student.student_id || student.email}
                        </p>

                        {student.department && (
                          <p className="truncate text-xs text-muted-foreground">
                            {student.department}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          {/* Student Details */}
          <div className="space-y-6">
            {!selectedStudent ? (
              <Card>
                <CardContent className="py-16 text-center text-muted-foreground">
                  Select a student to view their complete profile.
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Profile Header */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-5 md:flex-row md:items-center">
                      <Avatar className="h-24 w-24">
                        <AvatarImage
                          src={
                            selectedStudent.avatar_url || undefined
                          }
                        />

                        <AvatarFallback className="text-2xl">
                          {selectedStudent.name
                            ?.charAt(0)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-2xl font-bold">
                            {selectedStudent.name}
                          </h2>

                          <Badge variant="outline">
                            Student
                          </Badge>
                        </div>

                        <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {selectedStudent.email}
                          </div>

                          {selectedStudent.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              {selectedStudent.phone}
                            </div>
                          )}

                          {selectedStudent.department && (
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4" />
                              {selectedStudent.department}
                            </div>
                          )}

                          {selectedStudent.student_id && (
                            <div className="flex items-center gap-2">
                              <GraduationCap className="h-4 w-4" />
                              {selectedStudent.student_id}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-left md:text-right">
                        <p className="text-sm text-muted-foreground">
                          Academic Year
                        </p>

                        <p className="text-xl font-bold">
                          {selectedStudent.year
                            ? `Year ${selectedStudent.year}`
                            : 'Not set'}
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                          CGPA:{' '}
                          <span className="font-semibold text-foreground">
                            {selectedStudent.cgpa ?? '—'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* KPI Cards */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Event Registrations
                          </p>

                          <p className="mt-1 text-2xl font-bold">
                            {eventRegistrations.length}
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {selectedEventCount} event
                            {selectedEventCount !== 1 ? 's' : ''}
                          </p>
                        </div>

                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Attendance
                          </p>

                          <p className="mt-1 text-2xl font-bold">
                            {attendanceRate.toFixed(1)}%
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {presentCount} present · {absentCount} absent
                          </p>
                        </div>

                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Placement Applications
                          </p>

                          <p className="mt-1 text-2xl font-bold">
                            {selectedApplicationCount}
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            Applications submitted
                          </p>
                        </div>

                        <Briefcase className="h-6 w-6 text-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Offers / Selected
                          </p>

                          <p className="mt-1 text-2xl font-bold">
                            {selectedOfferCount}
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            Placement outcomes
                          </p>
                        </div>

                        <Trophy className="h-6 w-6 text-amber-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {loadingDetails ? (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      Loading student activity...
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-6 xl:grid-cols-2">
                    {/* Events */}
                    <Card>
                      <CardHeader>
                        <CardTitle>
                          Event Participation
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        {eventRegistrations.length === 0 ? (
                          <p className="py-6 text-center text-muted-foreground">
                            No event registrations.
                          </p>
                        ) : (
                          eventRegistrations.map((registration) => (
                            <div
                              key={registration.id}
                              className="flex items-center justify-between gap-3 rounded-xl border p-3"
                            >
                              <div className="min-w-0">
                                <p className="font-medium">
                                  {registration.sub_events?.name ||
                                    'Activity'}
                                </p>

                                <p className="truncate text-sm text-muted-foreground">
                                  {
                                    registration.sub_events?.events
                                      ?.name
                                  }
                                </p>

                                {registration.team_name && (
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    Team: {registration.team_name}
                                  </p>
                                )}
                              </div>

                              <Badge variant="outline">
                                {registration.status}
                              </Badge>
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>

                    {/* Attendance */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Event Results</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {eventResults.length === 0 ? (
                          <p className="py-6 text-center text-muted-foreground">
                            No event results recorded.
                          </p>
                        ) : (
                          eventResults.map((result) => (
                            <div
                              key={result.id}
                              className="flex items-center justify-between rounded-lg border p-3"
                            >
                              <div>
                                <p className="font-medium">Position: #{result.position}</p>
                                {result.team_name && (
                                  <p className="text-sm text-muted-foreground">Team: {result.team_name}</p>
                                )}
                                {result.remarks && (
                                  <p className="text-sm text-muted-foreground">{result.remarks}</p>
                                )}
                              </div>
                              <Trophy className="h-5 w-5 text-yellow-500" />
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>
                          Attendance Summary
                        </CardTitle>
                      </CardHeader>

                      <CardContent>
                        {attendance.length === 0 ? (
                          <div className="py-8 text-center text-muted-foreground">
                            No attendance records.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {attendance.map((record, index) => (
                              <div
                                key={`${record.event_id}-${index}`}
                                className="flex items-center justify-between rounded-xl border p-3"
                              >
                                <div>
                                  <p className="font-medium">
                                    Event Attendance
                                  </p>

                                  <p className="text-xs text-muted-foreground">
                                    {new Date(
                                      record.checked_in_at
                                    ).toLocaleString()}
                                  </p>
                                </div>

                                <Badge
                                  variant={
                                    record.status === 'present'
                                      ? 'default'
                                      : 'destructive'
                                  }
                                >
                                  {record.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Placement */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Placement Results</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {placementResults.length === 0 ? (
                          <p className="py-6 text-center text-muted-foreground">
                            No placement results recorded.
                          </p>
                        ) : (
                          placementResults.map((result) => (
                            <div
                              key={result.id}
                              className="flex items-center justify-between rounded-lg border p-3"
                            >
                              <div>
                                <p className="font-medium">
                                  {result.joined ? 'Joined' : 'Offer Recorded'}
                                </p>
                                {result.package_offered !== null && (
                                  <p className="text-sm text-muted-foreground">
                                    Package: ?{result.package_offered} LPA
                                  </p>
                                )}
                              </div>
                              <BriefcaseBusiness className="h-5 w-5" />
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>

                    <Card className="xl:col-span-2">
                      <CardHeader>
                        <CardTitle>
                          Placement Activity
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        {placementApplications.length === 0 ? (
                          <div className="py-8 text-center text-muted-foreground">
                            No placement applications.
                          </div>
                        ) : (
                          placementApplications.map((application) => (
                            <div
                              key={application.id}
                              className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div className="flex items-center gap-3">
                                {application.job_postings?.companies
                                  ?.logo_url && (
                                  <img
                                    src={
                                      application.job_postings
                                        .companies.logo_url
                                    }
                                    alt=""
                                    className="h-10 w-10 rounded-md object-contain"
                                  />
                                )}

                                <div>
                                  <p className="font-medium">
                                    {application.job_postings?.title ||
                                      'Job Application'}
                                  </p>

                                  <p className="text-sm text-muted-foreground">
                                    {
                                      application.job_postings?.companies
                                        ?.name
                                    }
                                  </p>

                                  {application.job_postings?.package_lpa && (
                                    <p className="text-sm font-medium text-primary">
                                      ₹
                                      {
                                        application.job_postings
                                          .package_lpa
                                      }{' '}
                                      LPA
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <Badge variant="outline">
                                  {application.status}
                                </Badge>

                                <span className="text-xs text-muted-foreground">
                                  {new Date(
                                    application.created_at
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}













