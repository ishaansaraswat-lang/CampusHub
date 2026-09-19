"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2, X, Save, Filter, BarChart3, Users, FileText, TrendingUp } from "lucide-react";

import { MainLayout } from "@/components/layout/MainLayout";
import { DashboardHeader, Panel } from "@/components/dashboard/shared";
import { supabase } from "@/integrations/supabase/client";

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

type FormData = {
  academic_year: string;
  course: string;
  region: string;
  applications: string;
  admissions: string;
};

const emptyForm: FormData = {
  academic_year: "",
  course: "",
  region: "",
  applications: "",
  admissions: "",
};

const formatNumber = (value: number) => value.toLocaleString("en-IN");

const conversionRate = (applications: number, admissions: number) =>
  applications > 0 ? (admissions / applications) * 100 : 0;

export default function AdmissionsManagement() {
  const [records, setRecords] = useState<AdmissionRecord[]>([]);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState("all");

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
      alert("Unable to load admission records.");
    } else {
      setRecords((data || []) as AdmissionRecord[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const academicYears = useMemo(
    () =>
      Array.from(new Set(records.map((record) => record.academic_year))).sort(
        (a, b) => b.localeCompare(a)
      ),
    [records]
  );

  const regions = useMemo(
    () =>
      Array.from(new Set(records.map((record) => record.region))).sort(),
    [records]
  );

  const courses = useMemo(
    () =>
      Array.from(new Set(records.map((record) => record.course))).sort(),
    [records]
  );

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const yearMatch =
        selectedYear === "all" || record.academic_year === selectedYear;

      const regionMatch =
        selectedRegion === "all" || record.region === selectedRegion;

      const courseMatch =
        selectedCourse === "all" || record.course === selectedCourse;

      return yearMatch && regionMatch && courseMatch;
    });
  }, [records, selectedYear, selectedRegion, selectedCourse]);

  const summary = useMemo(() => {
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
      conversion: conversionRate(applications, admissions),
      records: filteredRecords.length,
    };
  }, [filteredRecords]);

  const courseBreakdown = useMemo(() => {
    const map = new Map<
      string,
      { applications: number; admissions: number }
    >();

    filteredRecords.forEach((record) => {
      const current = map.get(record.course) || {
        applications: 0,
        admissions: 0,
      };

      current.applications += Number(record.applications || 0);
      current.admissions += Number(record.admissions || 0);

      map.set(record.course, current);
    });

    return Array.from(map.entries())
      .map(([course, data]) => ({
        course,
        ...data,
        conversion: conversionRate(data.applications, data.admissions),
      }))
      .sort((a, b) => b.applications - a.applications);
  }, [filteredRecords]);

  const regionBreakdown = useMemo(() => {
    const map = new Map<
      string,
      { applications: number; admissions: number }
    >();

    filteredRecords.forEach((record) => {
      const current = map.get(record.region) || {
        applications: 0,
        admissions: 0,
      };

      current.applications += Number(record.applications || 0);
      current.admissions += Number(record.admissions || 0);

      map.set(record.region, current);
    });

    return Array.from(map.entries())
      .map(([region, data]) => ({
        region,
        ...data,
        conversion: conversionRate(data.applications, data.admissions),
      }))
      .sort((a, b) => b.applications - a.applications);
  }, [filteredRecords]);

  const updateField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const applications = Number(form.applications);
    const admissions = Number(form.admissions);

    if (
      !form.academic_year.trim() ||
      !form.course.trim() ||
      !form.region.trim()
    ) {
      alert("Please fill Academic Year, Course and Region.");
      return;
    }

    if (!Number.isInteger(applications) || applications < 0) {
      alert("Applications must be a valid non-negative number.");
      return;
    }

    if (!Number.isInteger(admissions) || admissions < 0) {
      alert("Admissions must be a valid non-negative number.");
      return;
    }

    if (admissions > applications) {
      alert("Admissions cannot be greater than applications.");
      return;
    }

    setSaving(true);

    const payload = {
      academic_year: form.academic_year.trim(),
      course: form.course.trim(),
      region: form.region.trim(),
      applications,
      admissions,
    };

    if (editingId) {
      const { error } = await supabase
        .from("admission_records")
        .update(payload)
        .eq("id", editingId);

      if (error) {
        console.error(error);
        alert(error.message);
      } else {
        alert("Admission record updated successfully.");
        resetForm();
        await fetchRecords();
      }
    } else {
      const { error } = await supabase
        .from("admission_records")
        .insert(payload);

      if (error) {
        console.error(error);

        if (error.code === "23505") {
          alert(
            "A record already exists for this Academic Year + Course + Region."
          );
        } else {
          alert(error.message);
        }
      } else {
        alert("Admission record added successfully.");
        resetForm();
        await fetchRecords();
      }
    }

    setSaving(false);
  };

  const handleEdit = (record: AdmissionRecord) => {
    setEditingId(record.id);

    setForm({
      academic_year: record.academic_year,
      course: record.course,
      region: record.region,
      applications: String(record.applications),
      admissions: String(record.admissions),
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this admission record?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("admission_records")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    await fetchRecords();
  };

  const clearFilters = () => {
    setSelectedYear("all");
    setSelectedRegion("all");
    setSelectedCourse("all");
  };

  return (
    <MainLayout>
      <DashboardHeader
        title="Admissions Management"
        subtitle="Manage admission performance across academic sessions, regions and courses."
      />

      <div className="space-y-6">
        {/* Add / Edit */}
        <Panel
          title={editingId ? "Edit Admission Record" : "Add Admission Record"}
          description={
            editingId
              ? "Update the selected admission record."
              : "Enter admission data for a particular academic year, course and region."
          }
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Academic Year
                </label>
                <input
                  type="text"
                  placeholder="2025-26"
                  value={form.academic_year}
                  onChange={(e) =>
                    updateField("academic_year", e.target.value)
                  }
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Course
                </label>
                <input
                  type="text"
                  placeholder="B.Tech"
                  value={form.course}
                  onChange={(e) => updateField("course", e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Region
                </label>
                <input
                  type="text"
                  placeholder="Rajasthan"
                  value={form.region}
                  onChange={(e) => updateField("region", e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Applications
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="500"
                  value={form.applications}
                  onChange={(e) =>
                    updateField("applications", e.target.value)
                  }
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Admissions
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="250"
                  value={form.admissions}
                  onChange={(e) => updateField("admissions", e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
              >
                {editingId ? (
                  <>
                    <Save className="h-4 w-4" />
                    {saving ? "Updating..." : "Update Record"}
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    {saving ? "Adding..." : "Add Record"}
                  </>
                )}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </Panel>

        {/* Filters */}
        <Panel
          title="Admission Performance"
          description="Select a session, region or course to drill into the admission data."
        >
          <div className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-700">
            <Filter className="h-4 w-4 text-blue-600" />
            Filters
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Academic Session
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full rounded-xl border bg-background px-3 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Sessions</option>
                {academicYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Region / State
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full rounded-xl border bg-background px-3 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Regions</option>
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Course
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full rounded-xl border bg-background px-3 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Courses</option>
                {courses.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={clearFilters}
                className="w-full rounded-xl border px-4 py-3 text-sm font-semibold hover:bg-muted"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </Panel>

        {/* KPI cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Applications</p>
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                <FileText className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold">
              {formatNumber(summary.applications)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Based on current filters
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Admissions</p>
              <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold">
              {formatNumber(summary.admissions)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Students admitted
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Conversion Rate</p>
              <div className="rounded-xl bg-violet-50 p-2.5 text-violet-600">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-emerald-600">
              {summary.conversion.toFixed(1)}%
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Admissions ÷ applications
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Records</p>
              <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
                <BarChart3 className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold">{summary.records}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Matching records
            </p>
          </div>
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Panel
            title="Course Breakdown"
            description="Performance across courses for the selected filters."
          >
            {courseBreakdown.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No course data available.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="px-3 py-3 font-semibold">Course</th>
                      <th className="px-3 py-3 text-right font-semibold">
                        Applications
                      </th>
                      <th className="px-3 py-3 text-right font-semibold">
                        Admissions
                      </th>
                      <th className="px-3 py-3 text-right font-semibold">
                        Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseBreakdown.map((item) => (
                      <tr
                        key={item.course}
                        className="border-b last:border-0"
                      >
                        <td className="px-3 py-3 font-medium">{item.course}</td>
                        <td className="px-3 py-3 text-right">
                          {formatNumber(item.applications)}
                        </td>
                        <td className="px-3 py-3 text-right font-semibold text-emerald-600">
                          {formatNumber(item.admissions)}
                        </td>
                        <td className="px-3 py-3 text-right">
                          {item.conversion.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          <Panel
            title="Region Breakdown"
            description="State/region performance for the selected filters."
          >
            {regionBreakdown.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No region data available.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="px-3 py-3 font-semibold">Region</th>
                      <th className="px-3 py-3 text-right font-semibold">
                        Applications
                      </th>
                      <th className="px-3 py-3 text-right font-semibold">
                        Admissions
                      </th>
                      <th className="px-3 py-3 text-right font-semibold">
                        Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {regionBreakdown.map((item) => (
                      <tr
                        key={item.region}
                        className="border-b last:border-0"
                      >
                        <td className="px-3 py-3 font-medium">{item.region}</td>
                        <td className="px-3 py-3 text-right">
                          {formatNumber(item.applications)}
                        </td>
                        <td className="px-3 py-3 text-right font-semibold text-emerald-600">
                          {formatNumber(item.admissions)}
                        </td>
                        <td className="px-3 py-3 text-right">
                          {item.conversion.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </div>

        {/* Records */}
        <Panel
          title="Admission Records"
          description={`${filteredRecords.length} of ${records.length} records shown`}
        >
          {loading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Loading admission records...
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="rounded-lg border border-dashed py-12 text-center">
              <p className="font-medium">No matching admission records</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try changing the session, region or course filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="px-4 py-3 font-semibold">Academic Year</th>
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
                    <th className="px-4 py-3 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRecords.map((record) => {
                    const conversion = conversionRate(
                      record.applications,
                      record.admissions
                    );

                    return (
                      <tr
                        key={record.id}
                        className="border-b last:border-0 hover:bg-muted/40"
                      >
                        <td className="px-4 py-3 font-medium">
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                            {record.academic_year}
                          </span>
                        </td>

                        <td className="px-4 py-3">{record.course}</td>

                        <td className="px-4 py-3">{record.region}</td>

                        <td className="px-4 py-3 text-right">
                          {formatNumber(record.applications)}
                        </td>

                        <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                          {formatNumber(record.admissions)}
                        </td>

                        <td className="px-4 py-3 text-right font-medium">
                          {conversion.toFixed(1)}%
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(record)}
                              className="rounded-md p-2 hover:bg-muted"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(record.id)}
                              className="rounded-md p-2 text-destructive hover:bg-destructive/10"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </MainLayout>
  );
}

