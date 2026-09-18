import { useEffect, useState } from 'react';
import { BriefcaseBusiness, Building2, FileText, Trophy, Loader2, ShieldCheck } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

export default function PlacementOverview() {
  const [stats, setStats] = useState({
    companies: 0,
    jobs: 0,
    applications: 0,
    offers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [companies, jobs, applications, offers] = await Promise.all([
        supabase.from('companies').select('*', { count: 'exact', head: true }),
        supabase.from('job_postings').select('*', { count: 'exact', head: true }),
        supabase.from('placement_applications').select('*', { count: 'exact', head: true }),
        supabase.from('placement_results').select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        companies: companies.count || 0,
        jobs: jobs.count || 0,
        applications: applications.count || 0,
        offers: offers.count || 0,
      });
      setLoading(false);
    };

    load();
  }, []);

  const cards = [
    { label: 'Companies', value: stats.companies, icon: Building2 },
    { label: 'Job Postings', value: stats.jobs, icon: BriefcaseBusiness },
    { label: 'Applications', value: stats.applications, icon: FileText },
    { label: 'Offers Recorded', value: stats.offers, icon: Trophy },
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
              <h1 className="text-2xl font-bold">Placement Overview</h1>
              <p className="mt-1 text-sm text-slate-300">
                System-wide placement information. Super Admin access is read-only.
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
            <CardTitle>Placement Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
              Super Admin can monitor placement data and analytics, while all placement
              modifications remain restricted to the Placement Admin.
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
