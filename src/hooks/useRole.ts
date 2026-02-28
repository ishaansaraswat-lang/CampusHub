import { useAuth } from '@/contexts/AuthContext';
import type { AppRole } from '@/types/database';

export function useRole() {
  const { roles, loading } = useAuth();

  const hasRole = (role: AppRole): boolean => {
    return roles.includes(role);
  };

  const hasAnyRole = (checkRoles: AppRole[]): boolean => {
    return checkRoles.some((role) => roles.includes(role));
  };

  const isStudent = hasRole('student');
  const isEventAdmin = hasRole('event_admin');
  const isPlacementCell = hasRole('placement_cell');
  const isSuperAdmin = hasRole('super_admin');

  // Get the highest priority role for dashboard routing
  const getPrimaryRole = (): AppRole | null => {
    if (isSuperAdmin) return 'super_admin';
    if (isPlacementCell) return 'placement_cell';
    if (isEventAdmin) return 'event_admin';
    if (isStudent) return 'student';
    return null;
  };

  return {
    roles,
    loading,
    hasRole,
    hasAnyRole,
    isStudent,
    isEventAdmin,
    isPlacementCell,
    isSuperAdmin,
    getPrimaryRole,
  };
}
