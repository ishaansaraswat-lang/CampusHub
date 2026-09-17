import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';
import type { AppRole } from '@/types/database';

type Profile = Tables<'profiles'>;
type UserRole = Tables<'user_roles'>;

export interface UserWithRoles extends Profile {
  roles: AppRole[];
}

// Fetch all users with their roles
export function useAllUsers() {
  return useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('name', { ascending: true });

      if (profilesError) throw profilesError;

      // Fetch all roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Combine profiles with their roles
      const usersWithRoles: UserWithRoles[] = (profiles || []).map((profile) => ({
        ...profile,
        roles: (roles || [])
          .filter((r) => r.user_id === profile.user_id)
          .map((r) => r.role as AppRole),
      }));

      return usersWithRoles;
    },
  });
}

// Add role to user
export function useAddRole() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { data, error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: 'Role added successfully!' });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to add role',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Remove role from user
export function useRemoveRole() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Role removed successfully!' });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to remove role',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
