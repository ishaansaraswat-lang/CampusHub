import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Download,
  MapPin,
  BookOpen,
  FileText,
  Users,
  TrendingUp,
  ArrowLeft,
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type AdmissionRecord = {
  id: string;
  academic_year: string;
  course: string;
  region: string;
  applications: number;
  admissions: number;
};

const sessions = ["All", "2025-26", "2024-25", "2023-24"];

const regions = ["All", "Rajasthan", "Delhi", "Gujarat", "MP", "Karnataka"];

export default function AdmissionsExplorer() {
  const [session, setSession] = useState("All");
  const [region, setRegion] = useState("All");
  const [search, setSearch] = useState("");

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["admissions-explorer"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admission_records")
        .select("*")
        .order("academic_year", { ascending: false })
        .order("course", { ascending: true })
        .order("region", { ascending: true });

      if (error) throw error;
      return (data || []) as AdmissionRecord[];
    },
  });

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const sessionMatch =
        session === "All" || record.academic_year === session;

      const regionMatch =
        region === "All" || record.region === region;

      const searchMatch =
        !search ||
        record.course.toLowerCase().includes(search.toLowerCase()) ||
        record.region.toLowerCase().includes(search.toLowerCase()) ||
        record.academic_year.toLowerCase().includes(search.toLowerCase());

      return sessionMatch && regionMatch && searchMatch;
    });
  }, [records, session, region, search]);

  const totals = useMemo(() => {
    const applications = filteredRecords.reduce(
      (sum, record) => sum + Number(record.applications || 0),
      0
    );

    const admissions = filteredRecords.reduce(
      (sum, record) => sum + Number(record.admissions || 0),
      0
    );

    return {
      applications,
      admissions,
      conversion:
        applications > 0 ? (admissions / applications) * 100 : 0,
    };
  }, [filteredRecords]);

  const courseSummary = useMemo(() => {
    const map = new Map<
      string,
      { applications: number; admissions: number; records: number }
    >();

    filteredRecords.forEach((record) => {
      const current = map.get(record.course) || {
        applications: 0,
        admissions: 0,
        records: 0,
      };

      current.applications += Number(record.applications || 0);
      current.admissions += Number(record.admissions || 0);
      current.records += 1;

      map.set(record.course, current);
    });

    return Array.from(map.entries())
      .map(([course, value]) => ({
        course,
        ...value,
        conversion:
          value.applications > 0
            ? (value.admissions / value.applications) * 100
            : 0,
      }))
      .sort((a, b) => b.applications - a.applications);
  }, [filteredRecords]);

  const exportCSV = () => {
    const headers = [
      "Academic Year",
      "Course",
      "Region",
      "Applications",
      "Admissions",
      "Conversion",
    ];

    const rows = filteredRecords.map((record) => [
      record.academic_year,
      record.course,
      record.region,
      record.applications,
      record.admissions,
      `${((Number(record.admissions) / Number(record.applications)) * 100).toFixed(1)}%`,
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `admissions-${session}-${region}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const currentLabel =
    session === "All" ? "All Sessions" : session;

  const regionLabel =
    region === "All" ? "All States" : region;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Link
                to="/admissions/manage"
                className="hover:text-blue-600"
              >
                Admissions
              </Link>
              <span>/</span>
              <span>Explorer</span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight">
              Admissions Explorer
            </h1>

            <p className="mt-1 text-muted-foreground">
              Explore admission performance by academic session, state and course.
            </p>
          </div>

          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search course, region..."
                className="h-11 w-64 rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-blue-500"
              />
            </div>

            <button
              onClick={exportCSV}
              className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold shadow-sm transition hover:bg-slate-50"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Session selector */}
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="mb-3 text-sm font-semibold">
              Academic Session
            </div>

            <div className="flex flex-wrap gap-3">
              {sessions.map((item) => (
                <button
                  key={item}
                  onClick={() => setSession(item)}
                  className={`rounded-xl px-6 py-3 text-sm font-semibold transition ${
                    session === item
                      ? "bg-blue-600 text-white shadow-md"
                      : "border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  {item === "All" ? "All Sessions" : item}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* KPI */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardContent className="p-5">
              <FileText className="mb-4 h-5 w-5 text-blue-600" />
              <p className="text-sm text-muted-foreground">
                Applications
              </p>
              <p className="mt-1 text-2xl font-bold">
                {totals.applications.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {currentLabel}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 shadow-sm">
            <CardContent className="p-5">
              <Users className="mb-4 h-5 w-5 text-emerald-600" />
              <p className="text-sm text-muted-foreground">
                Admissions
              </p>
              <p className="mt-1 text-2xl font-bold">
                {totals.admissions.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Enrolled students
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 shadow-sm">
            <CardContent className="p-5">
              <TrendingUp className="mb-4 h-5 w-5 text-violet-600" />
              <p className="text-sm text-muted-foreground">
                Conversion Rate
              </p>
              <p className="mt-1 text-2xl font-bold text-emerald-600">
                {totals.conversion.toFixed(1)}%
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Admissions / Applications
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 shadow-sm">
            <CardContent className="p-5">
              <MapPin className="mb-4 h-5 w-5 text-orange-500" />
              <p className="text-sm text-muted-foreground">
                Selected Region
              </p>
              <p className="mt-1 text-2xl font-bold">
                {regionLabel}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Geographic filter
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 shadow-sm">
            <CardContent className="p-5">
              <BookOpen className="mb-4 h-5 w-5 text-indigo-600" />
              <p className="text-sm text-muted-foreground">
                Courses
              </p>
              <p className="mt-1 text-2xl font-bold">
                {courseSummary.length}$4Available courses
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Region selector */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">
                Select State / Region
              </h2>
              <p className="text-sm text-muted-foreground">
                Choose a region to drill into its admission performance.
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
            {regions.map((item) => {
              const count =
                item === "All"
                  ? records.length
                  : records.filter((r) => r.region === item).length;

              return (
                <button
                  key={item}
                  onClick={() => setRegion(item)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    region === item
                      ? "border-blue-500 bg-blue-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                        region === item
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <MapPin className="h-4 w-4" />
                    </div>
                  </div>

                  <p className="mt-3 font-semibold">
                    {item === "All" ? "All States" : item}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {count} records
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Records */}
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Admission Records</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Showing records for {regionLabel} · {currentLabel}
              </p>
            </div>

            <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600">
              {filteredRecords.length} records
            </span>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="py-12 text-center text-muted-foreground">
                Loading admission records...
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                No admission records found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="px-4 py-3 font-semibold">#</th>
                      <th className="px-4 py-3 font-semibold">
                        Academic Year
                      </th>
                      <th className="px-4 py-3 font-semibold">Course</th>
                      <th className="px-4 py-3 font-semibold">Region</th>
                      <th className="px-4 py-3 text-right font-semibold">
                        Applications
                      </th>
                      <th className="px-4 py-3 text-right font-semibold">
                        Admissions
                      </th>
                      <th className="px-4 py-3 text-right font-semibold">
                        Conversion
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredRecords.map((record, index) => {
                      const conversion =
                        Number(record.applications) > 0
                          ? (Number(record.admissions) /
                              Number(record.applications)) *
                            100
                          : 0;

                      return (
                        <tr
                          key={record.id}
                          className="border-b last:border-0 hover:bg-slate-50"
                        >
                          <td className="px-4 py-4 text-muted-foreground">
                            {index + 1}
                          </td>

                          <td className="px-4 py-4">
                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                              {record.academic_year}
                            </span>
                          </td>

                          <td className="px-4 py-4 font-medium">
                            {record.course}
                          </td>

                          <td className="px-4 py-4">
                            {record.region}
                          </td>

                          <td className="px-4 py-4 text-right">
                            {Number(record.applications).toLocaleString()}
                          </td>

                          <td className="px-4 py-4 text-right font-semibold text-emerald-600">
                            {Number(record.admissions).toLocaleString()}
                          </td>

                          <td className="px-4 py-4 text-right font-semibold text-emerald-600">
                            {conversion.toFixed(1)}%
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

        {/* Course Summary */}
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Course-wise Summary</CardTitle>
            <p className="text-sm text-muted-foreground">
              Performance for {regionLabel} · {currentLabel}
            </p>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="px-4 py-3 font-semibold">Course</th>
                    <th className="px-4 py-3 text-right font-semibold">
                      Applications
                    </th>
                    <th className="px-4 py-3 text-right font-semibold">
                      Admissions
                    </th>
                    <th className="px-4 py-3 text-right font-semibold">
                      Conversion
                    </th>
                    <th className="px-4 py-3 text-right font-semibold">
                      Records
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {courseSummary.map((course) => (
                    <tr
                      key={course.course}
                      className="border-b last:border-0"
                    >
                      <td className="px-4 py-4 font-semibold">
                        {course.course}
                      </td>

                      <td className="px-4 py-4 text-right">
                        {course.applications.toLocaleString()}
                      </td>

                      <td className="px-4 py-4 text-right">
                        {course.admissions.toLocaleString()}
                      </td>

                      <td className="px-4 py-4 text-right font-semibold text-emerald-600">
                        {course.conversion.toFixed(1)}%
                      </td>

                      <td className="px-4 py-4 text-right text-muted-foreground">
                        {course.records}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div>
          <Link
            to="/admissions/manage"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admissions Management
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}

