"use client";

import React, { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X, Save } from "lucide-react";

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

export default function AdmissionsManagement() {
  const [records, setRecords] = useState<AdmissionRecord[]>([]);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  return (
    <MainLayout>
      <DashboardHeader
        title="Admissions Management"
        subtitle="Add, update and manage admission data used by Admissions Analytics."
      />

      <div className="space-y-6">
        {/* Form */}
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
                  placeholder="B.Tech CSE"
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

        {/* Records Table */}
        <Panel
          title="Admission Records"
          description={`${records.length} record${
            records.length === 1 ? "" : "s"
          } currently stored`}
        >
          {loading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Loading admission records...
            </div>
          ) : records.length === 0 ? (
            <div className="rounded-lg border border-dashed py-12 text-center">
              <p className="font-medium">No admission records yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add your first record using the form above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-sm">
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
                  {records.map((record) => {
                    const conversion =
                      record.applications > 0
                        ? (record.admissions / record.applications) * 100
                        : 0;

                    return (
                      <tr
                        key={record.id}
                        className="border-b last:border-0 hover:bg-muted/40"
                      >
                        <td className="px-4 py-3 font-medium">
                          {record.academic_year}
                        </td>

                        <td className="px-4 py-3">{record.course}</td>

                        <td className="px-4 py-3">{record.region}</td>

                        <td className="px-4 py-3 text-right">
                          {record.applications.toLocaleString()}
                        </td>

                        <td className="px-4 py-3 text-right font-medium">
                          {record.admissions.toLocaleString()}
                        </td>

                        <td className="px-4 py-3 text-right">
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
