import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesUpdate } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;
type EventRegistration = Tables<'event_registrations'>;
type PlacementApplication = Tables<'placement_applications'>;

// Update profile
export function useUpdateProfile() {
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: TablesUpdate<'profiles'>) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: 'Profile updated successfully!' });
      refreshProfile();
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update profile',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Upload avatar
export function useUploadAvatar() {
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;
      return data;
    },
    onSuccess: () => {
      toast({ title: 'Avatar uploaded successfully!' });
      refreshProfile();
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to upload avatar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Fetch user's event registrations with event details
export function useMyEventRegistrations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['myEventRegistrations', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          *,
          sub_events:sub_event_id (
            id,
            name,
            venue,
            schedule,
            events:event_id (
              id,
              name,
              slug,
              banner_url
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

// Fetch user's placement applications with job details
export function useMyPlacementApplications() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['myPlacementApplications', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('placement_applications')
        .select(`
          *,
          job_postings:job_id (
            id,
            title,
            package_lpa,
            deadline,
            status,
            companies:company_id (
              id,
              name,
              logo_url
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}
