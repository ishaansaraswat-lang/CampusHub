import { Navigate } from 'react-router-dom';
import { useRole } from '@/hooks/useRole';
import Dashboard from '@/pages/Dashboard';
import AdmissionsDashboard from '@/pages/admissions/Dashboard';

export default function DashboardRouter() {
  const {
    loading,
    isSuperAdmin,
    isPlacementCell,
    isAdmissionsCell,
    isEventAdmin,
    isStudent,
  } = useRole();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading dashboard...
      </div>
    );
  }

  if (isSuperAdmin) {
    return <Navigate to="/super-admin/dashboard" replace />;
  }

  if (isPlacementCell) {
    return <Navigate to="/placement-admin/dashboard" replace />;
  }

  if (isAdmissionsCell) {
    return <AdmissionsDashboard />;
  }

  if (isEventAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (isStudent) {
    return <Dashboard />;
  }

  return <Navigate to="/auth" replace />;
}

