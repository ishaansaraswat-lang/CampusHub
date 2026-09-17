import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Event = Tables<'events'>;
type SubEvent = Tables<'sub_events'>;
type EventCoordinator = Tables<'event_coordinators'>;
type Profile = Tables<'profiles'>;

// Fetch all events for admin
export function useAdminEvents() {
  return useQuery({
    queryKey: ['adminEvents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Event[];
    },
  });
}

// Fetch single event with details
export function useAdminEvent(id: string) {
  return useQuery({
    queryKey: ['adminEvent', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Event;
    },
    enabled: !!id,
  });
}

// Create event
export function useCreateEvent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventData: Omit<TablesInsert<'events'>, 'created_by'>) => {
      const { data, error } = await supabase
        .from('events')
        .insert({
          ...eventData,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: 'Event created successfully!' });
      queryClient.invalidateQueries({ queryKey: ['adminEvents'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to create event', description: error.message, variant: 'destructive' });
    },
  });
}

// Update event
export function useUpdateEvent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'events'> & { id: string }) => {
      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({ title: 'Event updated successfully!' });
      queryClient.invalidateQueries({ queryKey: ['adminEvents'] });
      queryClient.invalidateQueries({ queryKey: ['adminEvent', data.id] });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update event', description: error.message, variant: 'destructive' });
    },
  });
}

// Delete event
export function useDeleteEvent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Event deleted successfully!' });
      queryClient.invalidateQueries({ queryKey: ['adminEvents'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to delete event', description: error.message, variant: 'destructive' });
    },
  });
}

// Sub-events management
export function useAdminSubEvents(eventId: string) {
  return useQuery({
    queryKey: ['adminSubEvents', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sub_events')
        .select('*')
        .eq('event_id', eventId)
        .order('schedule', { ascending: true });

      if (error) throw error;
      return data as SubEvent[];
    },
    enabled: !!eventId,
  });
}

export function useCreateSubEvent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subEventData: TablesInsert<'sub_events'>) => {
      const { data, error } = await supabase
        .from('sub_events')
        .insert(subEventData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({ title: 'Activity created successfully!' });
      queryClient.invalidateQueries({ queryKey: ['adminSubEvents', data.event_id] });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to create activity', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateSubEvent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'sub_events'> & { id: string }) => {
      const { data, error } = await supabase
        .from('sub_events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({ title: 'Activity updated successfully!' });
      queryClient.invalidateQueries({ queryKey: ['adminSubEvents', data.event_id] });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update activity', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteSubEvent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, eventId }: { id: string; eventId: string }) => {
      const { error } = await supabase.from('sub_events').delete().eq('id', id);
      if (error) throw error;
      return eventId;
    },
    onSuccess: (eventId) => {
      toast({ title: 'Activity deleted successfully!' });
      queryClient.invalidateQueries({ queryKey: ['adminSubEvents', eventId] });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to delete activity', description: error.message, variant: 'destructive' });
    },
  });
}

// Coordinators management
export function useEventCoordinators(eventId: string) {
  return useQuery({
    queryKey: ['eventCoordinators', eventId],
    queryFn: async () => {
      const { data: coordinators, error } = await supabase
        .from('event_coordinators')
        .select('*')
        .eq('event_id', eventId);

      if (error) throw error;
      if (!coordinators || coordinators.length === 0) return [];

      const userIds = coordinators.map((c) => c.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, email, avatar_url, user_id')
        .in('user_id', userIds);

      return coordinators.map((c) => ({
        ...c,
        profiles: profiles?.find((p) => p.user_id === c.user_id) || null,
      }));
    },
    enabled: !!eventId,
  });
}

export function useAddCoordinator() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, userId }: { eventId: string; userId: string }) => {
      const { data, error } = await supabase
        .from('event_coordinators')
        .insert({ event_id: eventId, user_id: userId })
        .select()
        .single();

      if (error) throw error;

      // Ensure user has event_admin role
      await supabase
        .from('user_roles')
        .upsert({ user_id: userId, role: 'event_admin' as const }, { onConflict: 'user_id,role' });

      return data;
    },
    onSuccess: (data) => {
      toast({ title: 'Coordinator added successfully!' });
      queryClient.invalidateQueries({ queryKey: ['eventCoordinators', data.event_id] });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to add coordinator', description: error.message, variant: 'destructive' });
    },
  });
}

export function useRemoveCoordinator() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, eventId }: { id: string; eventId: string }) => {
      const { error } = await supabase.from('event_coordinators').delete().eq('id', id);
      if (error) throw error;
      return eventId;
    },
    onSuccess: (eventId) => {
      toast({ title: 'Coordinator removed successfully!' });
      queryClient.invalidateQueries({ queryKey: ['eventCoordinators', eventId] });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to remove coordinator', description: error.message, variant: 'destructive' });
    },
  });
}

// Fetch all users for coordinator assignment
export function useAllProfiles() {
  return useQuery({
    queryKey: ['allProfiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Profile[];
    },
  });
}

// Get users with event_admin role for quick assignment
export function useEventAdmins() {
  return useQuery({
    queryKey: ['eventAdmins'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('user_id, profiles:user_id(id, name, email, avatar_url)')
        .eq('role', 'event_admin');

      if (error) throw error;
      return data;
    },
  });
}
