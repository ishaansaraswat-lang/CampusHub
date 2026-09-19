import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Download,
  MapPin,
  BookOpen,
  Users,
  UserCheck,
  TrendingUp,
  FileText,
  Pencil,
  Trash2,
  Map,
} from "lucide-react";

type AdmissionRecord = {
  id: string;
  academic_year: string;
  course: string;
  region: string;
  applications: number;
  admissions: number;
};

const SESSION_OPTIONS = ["All", "2025-26", "2024-25", "2023-24"];

const REGION_ORDER = [
  "Rajasthan",
  "Delhi",
  "Gujarat",
  "MP",
  "Karnataka",
];

const REGION_STYLES: Record<string, string> = {
  Rajasthan: "bg-pink-50 text-pink-600",
  Delhi: "bg-emerald-50 text-emerald-600",
  Gujarat: "bg-amber-50 text-amber-600",
  MP: "bg-purple-50 text-purple-600",
  Karnataka: "bg-blue-50 text-blue-600",
};

export default function AdmissionsAnalytics() {
  const [records, setRecords] = useState<AdmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState("All");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [search, setSearch] = useState("");

  const fetchRecords = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("admission_records")
      .select("*")
      .order("academic_year", { ascending: false })
      .order("course", { ascending: true })
      .order("region", { ascending: true });

    if (error) {
      console.error(error);
      setRecords([]);
    } else {
      setRecords((data || []) as AdmissionRecord[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const sessionMatch =
        session === "All" || record.academic_year === session;

      const regionMatch =
        selectedRegion === "All" || record.region === selectedRegion;

      const searchText = search.trim().toLowerCase();

      const searchMatch =
        !searchText ||
        record.course.toLowerCase().includes(searchText) ||
        record.region.toLowerCase().includes(searchText) ||
        record.academic_year.toLowerCase().includes(searchText);

      return sessionMatch && regionMatch && searchMatch;
    });
  }, [records, session, selectedRegion, search]);

  const totalApplications = filteredRecords.reduce(
    (sum, record) => sum + Number(record.applications || 0),
    0
  );

  const totalAdmissions = filteredRecords.reduce(
    (sum, record) => sum + Number(record.admissions || 0),
    0
  );

  const topReason = (() => {
  const counts = filteredRecords.reduce((acc: Record<string, number>, record) => {
    const reason = record.reason || "Not specified";
    acc[reason] = (acc[reason] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "No data";
})();
const conversionRate =
    totalApplications > 0
      ? (totalAdmissions / totalApplications) * 100
      : 0;

  const regions = new Set(
    filteredRecords.map((record) => record.region)
  ).size;

  const courses = new Set(
    filteredRecords.map((record) => record.course)
  ).size;

  const availableRegions = useMemo(() => {
    const dynamicRegions = Array.from(
      new Set(records.map((record) => record.region))
    );

    return [
      ...REGION_ORDER.filter((region) =>
        dynamicRegions.includes(region)
      ),
      ...dynamicRegions.filter(
        (region) => !REGION_ORDER.includes(region)
      ),
    ];
  }, [records]);

  const regionCounts = useMemo(() => {
    return availableRegions.map((region) => ({
      region,
      count: records.filter((record) => record.region === region).length,
    }));
  }, [records, availableRegions]);

  const courseSummary = useMemo(() => {
    const map = new Map<
      string,
      {
        applications: number;
        admissions: number;
        records: number;
      }
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

    return Array.from(map.entries()).map(([course, data]) => ({
      course,
      ...data,
      conversion:
        data.applications > 0
          ? (data.admissions / data.applications) * 100
          : 0,
    }));
  }, [filteredRecords]);

  const exportReport = () => {
    const header = [
      "Academic Year",
      "Course",
      "Region",
      "Applications",
      "Admissions",
      "Conversion",
    ];

    const rows = filteredRecords.map((record) => {
      const conversion =
        Number(record.applications) > 0
          ? (
              (Number(record.admissions) / Number(record.applications)) *
              100
            ).toFixed(1)
          : "0.0";

      return [
        record.academic_year,
        record.course,
        record.region,
        record.applications,
        record.admissions,
        `${conversion}%`,
      ];
    });

    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `admissions-report-${session}-${selectedRegion}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const formatNumber = (value: number) =>
    value.toLocaleString("en-IN");

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#f8fafc]">
        <div className="space-y-6">

          {/* Header */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                <span>Admissions</span>
                <span>›</span>
                <span>Explorer</span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-[#0f172a]">
                Admissions Explorer
              </h1>

              <p className="mt-1 text-sm text-slate-600">
                Explore admission data by academic session, region and course.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-[280px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by course, region or keyword..."
                  className="h-11 rounded-xl border-slate-200 bg-white pl-10 shadow-sm"
                />
              </div>

              <Button
                onClick={exportReport}
                variant="outline"
                className="h-11 rounded-xl border-slate-200 bg-white px-5 font-semibold"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Academic Session */}
          <div className="flex flex-wrap items-center gap-3">
            <p className="mr-2 text-sm font-semibold text-[#0f172a]">
              Academic Session
            </p>

            {SESSION_OPTIONS.map((option) => (
              <button
                key={option}
                onClick={() => setSession(option)}
                className={`rounded-xl px-7 py-3 text-sm font-semibold transition-all ${
                  session === option
                    ? "bg-[#2563eb] text-white shadow-md shadow-blue-200"
                    : "bg-white text-slate-700 shadow-sm hover:bg-slate-50"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="rounded-full bg-blue-50 p-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-500">
                Total Applications
              </p>
              <p className="mt-1 text-3xl font-bold text-[#0f172a]">
                {formatNumber(totalApplications)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {session === "All"
                  ? "Across all sessions"
                  : `For ${session}`}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="rounded-full bg-blue-50 p-3 w-fit">
                <UserCheck className="h-5 w-5 text-blue-600" />
              </div>
              <p className="mt-4 text-sm text-slate-500">
                Total Admissions
              </p>
              <p className="mt-1 text-3xl font-bold text-[#0f172a]">
                {formatNumber(totalAdmissions)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Combined enrolled students
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="rounded-full bg-purple-50 p-3 w-fit">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <p className="mt-4 text-sm text-slate-500">
                Conversion Rate
              </p>
              <p className="mt-1 text-3xl font-bold text-[#0f172a]">
                {conversionRate.toFixed(1)}%
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Admissions / Applications
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="rounded-full bg-blue-50 p-3 w-fit">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <p className="mt-4 text-sm text-slate-500">
                Regions
              </p>
              <p className="mt-1 text-3xl font-bold text-[#0f172a]">
                {regions}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Across selected data
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="rounded-full bg-blue-50 p-3 w-fit">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <p className="mt-4 text-sm text-slate-500">
                Courses
              </p>
              <p className="mt-1 text-3xl font-bold text-[#0f172a]">
                {courses}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {courseSummary.map((item) => item.course).join(", ") || "—"}
              </p>
            </div>
          </div>

          {/* Regions */}
          <div>
            <h2 className="mb-3 text-base font-bold text-[#0f172a]">
              Select State / Region
            </h2>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <button
                onClick={() => setSelectedRegion("All")}
                className={`rounded-xl border p-4 text-left transition-all ${
                  selectedRegion === "All"
                    ? "border-blue-500 bg-blue-50/40 shadow-sm"
                    : "border-slate-200 bg-white hover:border-blue-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-blue-50 p-3">
                    <Map className="h-5 w-5 text-blue-600" />
                  </div>

                  <div>
                    <p className="font-semibold text-[#0f172a]">
                      All States
                    </p>
                    <p className="text-sm text-slate-500">
                      {records.length} records
                    </p>
                  </div>
                </div>
              </button>

              {regionCounts.map(({ region, count }) => (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    selectedRegion === region
                      ? "border-blue-500 bg-blue-50/40 shadow-sm"
                      : "border-slate-200 bg-white hover:border-blue-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-full p-3 ${
                        REGION_STYLES[region] ||
                        "bg-blue-50 text-blue-600"
                      }`}
                    >
                      <MapPin className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="font-semibold text-[#0f172a]">
                        {region}
                      </p>
                      <p className="text-sm text-slate-500">
                        {count} records
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Admission Records */}
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#0f172a]">
                  Admission Records
                </h2>
                <p className="text-sm text-slate-500">
                  Showing records for{" "}
                  {selectedRegion === "All"
                    ? "All States"
                    : selectedRegion}{" "}
                  ({session === "All" ? "All Sessions" : session})
                </p>
              </div>

              <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600">
                {topReason} records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left">
                    <th className="px-5 py-4 font-semibold text-slate-700">
                      #
                    </th>
                    <th className="px-5 py-4 font-semibold text-slate-700">
                      Academic Year
                    </th>
                    <th className="px-5 py-4 font-semibold text-slate-700">
                      Course
                    </th>
                    <th className="px-5 py-4 font-semibold text-slate-700">
                      Region
                    </th>
                    <th className="px-5 py-4 text-right font-semibold text-slate-700">
                      Applications
                    </th>
                    <th className="px-5 py-4 text-right font-semibold text-slate-700">
                      Admissions
                    </th>
                    <th className="px-5 py-4 text-right font-semibold text-slate-700">
                      Conversion
                    </th>
                    <th className="px-5 py-4 text-right font-semibold text-slate-700">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-5 py-12 text-center text-slate-500"
                      >
                        Loading admission records...
                      </td>
                    </tr>
                  ) : filteredRecords.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-5 py-12 text-center text-slate-500"
                      >
                        No admission records found.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record, index) => {
                      const conversion =
                        Number(record.applications) > 0
                          ? (Number(record.admissions) /
                              Number(record.applications)) *
                            100
                          : 0;

                      return (
                        <tr
                          key={record.id}
                          className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                        >
                          <td className="px-5 py-3.5 font-medium text-slate-600">
                            {index + 1}
                          </td>

                          <td className="px-5 py-3.5 text-slate-700">
                            {record.academic_year}
                          </td>

                          <td className="px-5 py-3.5 font-medium text-[#0f172a]">
                            {record.course}
                          </td>

                          <td className="px-5 py-3.5 text-slate-700">
                            {record.region}
                          </td>

                          <td className="px-5 py-3.5 text-right text-slate-700">
                            {formatNumber(Number(record.applications))}
                          </td>

                          <td className="px-5 py-3.5 text-right text-slate-700">
                            {formatNumber(Number(record.admissions))}
                          </td>

                          <td className="px-5 py-3.5 text-right font-semibold text-emerald-600">
                            {conversion.toFixed(1)}%
                          </td>

                          <td className="px-5 py-3.5">
                            <div className="flex justify-end gap-2">
                              <button
                                className="rounded-lg p-2 text-slate-700 hover:bg-slate-100"
                                title="Edit record"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>

                              <button
                                className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                                title="Delete record"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Course Summary */}
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-50 p-2.5">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-[#0f172a]">
                    Course-wise Summary
                  </h2>

                  <p className="text-sm text-slate-500">
                    Summary for{" "}
                    {selectedRegion === "All"
                      ? "All States"
                      : selectedRegion}{" "}
                    (
                    {session === "All"
                      ? "All Sessions"
                      : session}
                    )
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left">
                    <th className="px-5 py-4 font-semibold text-slate-700">
                      Course
                    </th>
                    <th className="px-5 py-4 text-right font-semibold text-slate-700">
                      Applications
                    </th>
                    <th className="px-5 py-4 text-right font-semibold text-slate-700">
                      Admissions
                    </th>
                    <th className="px-5 py-4 text-right font-semibold text-slate-700">
                      Conversion Rate
                    </th>
                    <th className="px-5 py-4 text-right font-semibold text-slate-700">
                      Records
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {courseSummary.map((item) => (
                    <tr
                      key={item.course}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-5 py-3.5 font-medium text-[#0f172a]">
                        {item.course}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        {formatNumber(item.applications)}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        {formatNumber(item.admissions)}
                      </td>

                      <td className="px-5 py-3.5 text-right font-semibold text-emerald-600">
                        {item.conversion.toFixed(1)}%
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        {item.records}
                      </td>
                    </tr>
                  ))}

                  {courseSummary.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-10 text-center text-slate-500"
                      >
                        No course data available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}


