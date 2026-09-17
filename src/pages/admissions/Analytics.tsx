"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Download,
  TrendingDown,
  TrendingUp,
  Users,
  GraduationCap,
  Percent,
  FileText,
} from "lucide-react";

import { MainLayout } from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

type AdmissionRecord = {
  id: string;
  academic_year: string;
  course: string;
  region: string;
  applications: number;
  admissions: number;
  created_at: string;
  updated_at: string;
};

type AggregatedItem = {
  name: string;
  applications: number;
  admissions: number;
};

type TrendItem = {
  year: string;
  applications: number;
  admissions: number;
};

type Insight = {
  label: string;
  current: number;
  previous: number;
  change: number | null;
};

function parseYear(year: string) {
  const match = year.match(/\d{4}/);
  return match ? Number(match[0]) : 0;
}

function formatNumber(value: number) {
  return value.toLocaleString("en-IN");
}

function percentageChange(current: number, previous: number) {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

export default function AdmissionsAnalytics() {
  const [records, setRecords] = useState<AdmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState("");
  const [compareYear, setCompareYear] = useState("");

  const fetchRecords = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("admission_records")
      .select("*")
      .order("academic_year", { ascending: true });

    if (error) {
      console.error(error);
      alert("Unable to load admission analytics.");
    } else {
      setRecords((data || []) as AdmissionRecord[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const years = useMemo(() => {
    return Array.from(
      new Set(records.map((record) => record.academic_year))
    ).sort((a, b) => parseYear(a) - parseYear(b));
  }, [records]);

  useEffect(() => {
    if (years.length > 0) {
      const latest = years[years.length - 1];
      const previous = years.length > 1 ? years[years.length - 2] : "";

      setSelectedYear((current) => current || latest);
      setCompareYear((current) => current || previous);
    }
  }, [years]);

  const selectedRecords = useMemo(() => {
    return records.filter(
      (record) => record.academic_year === selectedYear
    );
  }, [records, selectedYear]);

  const comparisonRecords = useMemo(() => {
    return records.filter(
      (record) => record.academic_year === compareYear
    );
  }, [records, compareYear]);

  const totals = useMemo(() => {
    const applications = selectedRecords.reduce(
      (sum, record) => sum + record.applications,
      0
    );

    const admissions = selectedRecords.reduce(
      (sum, record) => sum + record.admissions,
      0
    );

    const conversion =
      applications > 0 ? (admissions / applications) * 100 : 0;

    return {
      applications,
      admissions,
      conversion,
    };
  }, [selectedRecords]);

  const previousTotals = useMemo(() => {
    const applications = comparisonRecords.reduce(
      (sum, record) => sum + record.applications,
      0
    );

    const admissions = comparisonRecords.reduce(
      (sum, record) => sum + record.admissions,
      0
    );

    const conversion =
      applications > 0 ? (admissions / applications) * 100 : 0;

    return {
      applications,
      admissions,
      conversion,
    };
  }, [comparisonRecords]);

  const courseData = useMemo<AggregatedItem[]>(() => {
    const map = new Map<string, AggregatedItem>();

    selectedRecords.forEach((record) => {
      const existing = map.get(record.course) || {
        name: record.course,
        applications: 0,
        admissions: 0,
      };

      existing.applications += record.applications;
      existing.admissions += record.admissions;

      map.set(record.course, existing);
    });

    return Array.from(map.values()).sort(
      (a, b) => b.admissions - a.admissions
    );
  }, [selectedRecords]);

  const regionData = useMemo<AggregatedItem[]>(() => {
    const map = new Map<string, AggregatedItem>();

    selectedRecords.forEach((record) => {
      const existing = map.get(record.region) || {
        name: record.region,
        applications: 0,
        admissions: 0,
      };

      existing.applications += record.applications;
      existing.admissions += record.admissions;

      map.set(record.region, existing);
    });

    return Array.from(map.values()).sort(
      (a, b) => b.admissions - a.admissions
    );
  }, [selectedRecords]);

  const topCourse =
    courseData.length > 0 ? courseData[0] : null;

  const topRegion =
    regionData.length > 0 ? regionData[0] : null;

  const trendData = useMemo<TrendItem[]>(() => {
    const map = new Map<string, TrendItem>();

    records.forEach((record) => {
      const existing = map.get(record.academic_year) || {
        year: record.academic_year,
        applications: 0,
        admissions: 0,
      };

      existing.applications += record.applications;
      existing.admissions += record.admissions;

      map.set(record.academic_year, existing);
    });

    return Array.from(map.values()).sort(
      (a, b) => parseYear(a.year) - parseYear(b.year)
    );
  }, [records]);

  const courseRegionData = useMemo(() => {
    const map = new Map<
      string,
      {
        course: string;
        region: string;
        applications: number;
        admissions: number;
        conversion: number;
      }
    >();

    selectedRecords.forEach((record) => {
      const key = `${record.course}__${record.region}`;

      const existing = map.get(key) || {
        course: record.course,
        region: record.region,
        applications: 0,
        admissions: 0,
        conversion: 0,
      };

      existing.applications += record.applications;
      existing.admissions += record.admissions;

      existing.conversion =
        existing.applications > 0
          ? (existing.admissions / existing.applications) * 100
          : 0;

      map.set(key, existing);
    });

    return Array.from(map.values()).sort(
      (a, b) => b.admissions - a.admissions
    );
  }, [selectedRecords]);

  const insights = useMemo(() => {
    const currentMap = new Map<string, number>();
    const previousMap = new Map<string, number>();

    selectedRecords.forEach((record) => {
      const key = `${record.course}__${record.region}`;

      currentMap.set(
        key,
        (currentMap.get(key) || 0) + record.admissions
      );
    });

    comparisonRecords.forEach((record) => {
      const key = `${record.course}__${record.region}`;

      previousMap.set(
        key,
        (previousMap.get(key) || 0) + record.admissions
      );
    });

    const allKeys = Array.from(
      new Set([...currentMap.keys(), ...previousMap.keys()])
    );

    const result: Insight[] = allKeys.map((key) => {
      const [course, region] = key.split("__");

      const current = currentMap.get(key) || 0;
      const previous = previousMap.get(key) || 0;

      return {
        label: `${course} — ${region}`,
        current,
        previous,
        change: percentageChange(current, previous),
      };
    });

    return result;
  }, [selectedRecords, comparisonRecords]);

  const topRisers = insights
    .filter(
      (item) => item.change !== null && item.change > 0
    )
    .sort(
      (a, b) => (b.change || 0) - (a.change || 0)
    )
    .slice(0, 5);

  const topDeclines = insights
    .filter(
      (item) => item.change !== null && item.change < 0
    )
    .sort(
      (a, b) => (a.change || 0) - (b.change || 0)
    )
    .slice(0, 5);

  const applicationChange = percentageChange(
    totals.applications,
    previousTotals.applications
  );

  const admissionChange = percentageChange(
    totals.admissions,
    previousTotals.admissions
  );

  const conversionChange = percentageChange(
    totals.conversion,
    previousTotals.conversion
  );

  const exportCSV = () => {
    const headers = [
      "Academic Year",
      "Course",
      "Region",
      "Applications",
      "Admissions",
      "Conversion Rate",
    ];

    const rows = selectedRecords.map((record) => {
      const conversion =
        record.applications > 0
          ? (record.admissions / record.applications) * 100
          : 0;

      return [
        record.academic_year,
        record.course,
        record.region,
        record.applications,
        record.admissions,
        `${conversion.toFixed(2)}%`,
      ];
    });

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((value) =>
            `"${String(value).replace(/"/g, '""')}"`
          )
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `admissions-${selectedYear || "analytics"}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Loading admissions analytics...
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Admissions Analytics
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Analyse admissions performance across courses,
              regions and academic years.
            </p>
          </div>

          <button
            onClick={exportCSV}
            disabled={!selectedRecords.length}
            className="inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>

        {/* Year Controls */}
        <div className="rounded-xl border bg-card p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Analyse Year
              </label>

              <select
                value={selectedYear}
                onChange={(e) =>
                  setSelectedYear(e.target.value)
                }
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Compare With
              </label>

              <select
                value={compareYear}
                onChange={(e) =>
                  setCompareYear(e.target.value)
                }
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">No comparison</option>

                {years
                  .filter((year) => year !== selectedYear)
                  .map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {/* Applications */}
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">
                  Applications
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {formatNumber(totals.applications)}
                </p>
              </div>

              <div className="rounded-lg bg-primary/10 p-3">
                <FileText className="h-5 w-5 text-primary" />
              </div>
            </div>

            {applicationChange !== null &&
              compareYear && (
                <p
                  className={`mt-3 text-xs font-medium ${
                    applicationChange >= 0
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  {applicationChange >= 0 ? "↑" : "↓"}{" "}
                  {Math.abs(applicationChange).toFixed(1)}%
                  {" "}vs {compareYear}
                </p>
              )}
          </div>

          {/* Admissions */}
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Admissions
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {formatNumber(totals.admissions)}
                </p>
              </div>

              <div className="rounded-lg bg-primary/10 p-3">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
            </div>

            {admissionChange !== null &&
              compareYear && (
                <p
                  className={`mt-3 text-xs font-medium ${
                    admissionChange >= 0
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  {admissionChange >= 0 ? "↑" : "↓"}{" "}
                  {Math.abs(admissionChange).toFixed(1)}%
                  {" "}vs {compareYear}
                </p>
              )}
          </div>

          {/* Conversion */}
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">
                  Conversion Rate
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {totals.conversion.toFixed(1)}%
                </p>
              </div>

              <div className="rounded-lg bg-primary/10 p-3">
                <Percent className="h-5 w-5 text-primary" />
              </div>
            </div>

            {conversionChange !== null &&
              compareYear && (
                <p
                  className={`mt-3 text-xs font-medium ${
                    conversionChange >= 0
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  {conversionChange >= 0 ? "↑" : "↓"}{" "}
                  {Math.abs(conversionChange).toFixed(1)}%
                  {" "}vs {compareYear}
                </p>
              )}
          </div>

          {/* Courses */}
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">
                  Courses
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {courseData.length}
                </p>
              </div>

              <div className="rounded-lg bg-primary/10 p-3">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              Across {regionData.length} regions
            </p>
          </div>

          {/* Top Course */}
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">
                  Top Course
                </p>

                <p className="mt-2 truncate text-xl font-bold">
                  {topCourse?.name || "—"}
                </p>
              </div>

              <div className="shrink-0 rounded-lg bg-primary/10 p-3">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              {topCourse
                ? `${formatNumber(topCourse.admissions)} admissions`
                : "No data"}
            </p>
          </div>

          {/* Top Region */}
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">
                  Top Region
                </p>

                <p className="mt-2 truncate text-xl font-bold">
                  {topRegion?.name || "—"}
                </p>
              </div>

              <div className="shrink-0 rounded-lg bg-primary/10 p-3">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              {topRegion
                ? `${formatNumber(topRegion.admissions)} admissions`
                : "No data"}
            </p>
          </div>
        </div>

        {/* Course + Region Charts */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Course Chart */}
          <div className="rounded-xl border bg-card p-5">
            <div className="mb-5">
              <h2 className="font-semibold">
                Course-wise Admissions
              </h2>

              <p className="text-sm text-muted-foreground">
                Applications vs admissions for {selectedYear}
              </p>
            </div>

            <div className="h-[320px]">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart data={courseData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />

                  <Bar
                    dataKey="applications"
                    name="Applications"
                    fill="hsl(var(--muted-foreground))"
                    radius={[4, 4, 0, 0]}
                  />

                  <Bar
                    dataKey="admissions"
                    name="Admissions"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Region Chart */}
          <div className="rounded-xl border bg-card p-5">
            <div className="mb-5">
              <h2 className="font-semibold">
                Region-wise Admissions
              </h2>

              <p className="text-sm text-muted-foreground">
                Geographic distribution for {selectedYear}
              </p>
            </div>

            <div className="h-[320px]">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={regionData}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={90}
                  />
                  <Tooltip />
                  <Legend />

                  <Bar
                    dataKey="admissions"
                    name="Admissions"
                    fill="hsl(var(--primary))"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Year Trend */}
        <div className="rounded-xl border bg-card p-5">
          <div className="mb-5">
            <h2 className="font-semibold">
              Year-over-Year Trend
            </h2>

            <p className="text-sm text-muted-foreground">
              Overall applications and admissions across
              academic years
            </p>
          </div>

          <div className="h-[340px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />

                <Line
                  type="monotone"
                  dataKey="applications"
                  name="Applications"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />

                <Line
                  type="monotone"
                  dataKey="admissions"
                  name="Admissions"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Insights */}
        {compareYear && (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {/* Rising */}
            <div className="rounded-xl border bg-card p-5">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-lg bg-emerald-500/10 p-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>

                <div>
                  <h2 className="font-semibold">
                    Rising Segments
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    Admissions increased vs {compareYear}
                  </p>
                </div>
              </div>

              {topRisers.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No rising segments found.
                </p>
              ) : (
                <div className="space-y-3">
                  {topRisers.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between gap-4 rounded-lg border p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {item.label}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {formatNumber(item.previous)} →{" "}
                          {formatNumber(item.current)} admissions
                        </p>
                      </div>

                      <span className="shrink-0 font-semibold text-emerald-600">
                        ↑ {item.change?.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Declining */}
            <div className="rounded-xl border bg-card p-5">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-lg bg-red-500/10 p-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                </div>

                <div>
                  <h2 className="font-semibold">
                    Declining Segments
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    Admissions decreased vs {compareYear}
                  </p>
                </div>
              </div>

              {topDeclines.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No declining segments found.
                </p>
              ) : (
                <div className="space-y-3">
                  {topDeclines.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between gap-4 rounded-lg border p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {item.label}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {formatNumber(item.previous)} →{" "}
                          {formatNumber(item.current)} admissions
                        </p>
                      </div>

                      <span className="shrink-0 font-semibold text-red-600">
                        ↓{" "}
                        {Math.abs(item.change || 0).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Course x Region */}
        <div className="rounded-xl border bg-card p-5">
          <div className="mb-5">
            <h2 className="font-semibold">
              Course × Region Analysis
            </h2>

            <p className="text-sm text-muted-foreground">
              Detailed admission performance for {selectedYear}
            </p>
          </div>

          {courseRegionData.length === 0 ? (
            <div className="rounded-lg border border-dashed py-12 text-center">
              <p className="font-medium">
                No admission data available
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Add records from Admissions Management.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="px-4 py-3 font-semibold">
                      Course
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Region
                    </th>

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
                  {courseRegionData.map((item) => (
                    <tr
                      key={`${item.course}-${item.region}`}
                      className="border-b last:border-0 hover:bg-muted/40"
                    >
                      <td className="px-4 py-3 font-medium">
                        {item.course}
                      </td>

                      <td className="px-4 py-3">
                        {item.region}
                      </td>

                      <td className="px-4 py-3 text-right">
                        {formatNumber(item.applications)}
                      </td>

                      <td className="px-4 py-3 text-right font-medium">
                        {formatNumber(item.admissions)}
                      </td>

                      <td className="px-4 py-3 text-right">
                        {item.conversion.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}