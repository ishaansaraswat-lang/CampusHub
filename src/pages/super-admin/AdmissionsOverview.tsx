import { useEffect, useState } from 'react';
import { GraduationCap, ClipboardList, Users, TrendingUp, Loader2, ShieldCheck } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

export default function AdmissionsOverview() {
  const [stats, setStats] = useState({
    applications: 0,
    admissions: 0,
    records: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('admission_records')
        .select('applications, admissions');

      if (!error && data) {
        setStats({
          applications: data.reduce((sum, row) => sum + Number(row.applications || 0), 0),
          admissions: data.reduce((sum, row) => sum + Number(row.admissions || 0), 0),
          records: data.length,
        });
      }

      setLoading(false);
    };

    load();
  }, []);

  const conversion =
    stats.applications > 0
      ? ((stats.admissions / stats.applications) * 100).toFixed(1)
      : '0.0';

  const cards = [
    { label: 'Admission Records', value: stats.records, icon: ClipboardList },
    { label: 'Applications', value: stats.applications, icon: Users },
    { label: 'Total Admissions', value: stats.admissions, icon: GraduationCap },
    { label: 'Conversion Rate', value: `${conversion}%`, icon: TrendingUp },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="rounded-2xl bg-[#0B1220] p-6 text-white shadow-lg">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-blue-600 p-3">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Admissions Overview</h1>
              <p className="mt-1 text-sm text-slate-300">
                System-wide admissions information. Super Admin access is read-only.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map(({ label, value, icon: Icon }) => (
              <Card key={label} className="rounded-2xl border-border/70 shadow-sm">
                <CardContent className="p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="rounded-xl bg-primary/10 p-2.5">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">View Only</span>
                  </div>
                  <p className="text-3xl font-bold">{value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Admissions Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
              Super Admin can monitor admissions data and performance, while all admissions
              modifications remain restricted to the Admissions Admin.
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
