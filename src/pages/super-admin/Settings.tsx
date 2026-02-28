import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Users, Calendar, Building2, Shield, HardDrive, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function useSystemStats() {
  return useQuery({
    queryKey: ['systemStats'],
    queryFn: async () => {
      const [profiles, events, companies, roles] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('companies').select('id', { count: 'exact', head: true }),
        supabase.from('user_roles').select('role'),
      ]);

      const roleCounts: Record<string, number> = {};
      if (roles.data) {
        for (const r of roles.data) {
          roleCounts[r.role] = (roleCounts[r.role] || 0) + 1;
        }
      }

      return {
        totalUsers: profiles.count ?? 0,
        totalEvents: events.count ?? 0,
        totalCompanies: companies.count ?? 0,
        roleCounts,
      };
    },
  });
}

const STORAGE_BUCKETS = ['avatars', 'event-banners', 'event-gallery', 'company-logos'];

function StatCard({ icon: Icon, label, value, loading }: { icon: React.ElementType; label: string; value: number; loading: boolean }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="rounded-lg bg-primary/10 p-3">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          {loading ? <Skeleton className="h-8 w-16" /> : <p className="text-2xl font-bold">{value}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Settings() {
  const { data: stats, isLoading } = useSystemStats();

  const roleLabels: Record<string, string> = {
    student: 'Students',
    event_admin: 'Event Admins',
    placement_cell: 'Placement Cell',
    super_admin: 'Super Admins',
  };

  return (
    <MainLayout>
      <div className="container mx-auto max-w-4xl space-y-8 py-8">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">System information and management</p>
        </div>

        {/* System Stats */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">System Information</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard icon={Users} label="Total Users" value={stats?.totalUsers ?? 0} loading={isLoading} />
            <StatCard icon={Calendar} label="Total Events" value={stats?.totalEvents ?? 0} loading={isLoading} />
            <StatCard icon={Building2} label="Companies" value={stats?.totalCompanies ?? 0} loading={isLoading} />
          </div>
        </section>

        <Separator />

        {/* Role Distribution */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5" /> Role Distribution
          </h2>
          <Card>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-8 w-full" />)}
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(roleLabels).map(([role, label]) => (
                    <div key={role} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{label}</span>
                      <Badge variant="secondary">{stats?.roleCounts[role] ?? 0}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Storage Buckets */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <HardDrive className="h-5 w-5" /> Storage Buckets
          </h2>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-3">
                {STORAGE_BUCKETS.map((bucket) => (
                  <div key={bucket} className="flex items-center justify-between">
                    <span className="text-sm font-medium font-mono">{bucket}</span>
                    <Badge variant="outline">Active</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Danger Zone */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" /> Danger Zone
          </h2>
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-base">Destructive Actions</CardTitle>
              <CardDescription>These actions are irreversible. Proceed with caution.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No destructive actions available yet.</p>
            </CardContent>
          </Card>
        </section>
      </div>
    </MainLayout>
  );
}
