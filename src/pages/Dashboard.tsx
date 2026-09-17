import { useRole } from '@/hooks/useRole';
import { MainLayout } from '@/components/layout/MainLayout';
import { StudentDashboard } from '@/components/dashboard/StudentDashboard';
import { EventAdminDashboard } from '@/components/dashboard/EventAdminDashboard';
import { PlacementDashboard } from '@/components/dashboard/PlacementDashboard';
import { SuperAdminDashboard } from '@/components/dashboard/SuperAdminDashboard';

export default function Dashboard() {
  const { isSuperAdmin, isPlacementCell, isEventAdmin, isStudent } = useRole();

  // /dashboard always shows student dashboard; other roles have their own routes
  const renderDashboard = () => {
    if (isStudent) return <StudentDashboard />;
    if (isSuperAdmin) return <SuperAdminDashboard />;
    if (isPlacementCell) return <PlacementDashboard />;
    if (isEventAdmin) return <EventAdminDashboard />;
    return <StudentDashboard />;
  };

  return <MainLayout>{renderDashboard()}</MainLayout>;
}
