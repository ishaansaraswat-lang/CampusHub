import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Event = Tables<'events'>;
type SubEvent = Tables<'sub_events'>;
type EventRegistration = Tables<'event_registrations'>;

export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .in('status', ['upcoming', 'active', 'completed'])
        .order('start_date', { ascending: true });

      if (error) throw error;
      return data as Event[];
    },
  });
}

export function useEvent(slug: string) {
  return useQuery({
    queryKey: ['event', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data as Event;
    },
    enabled: !!slug,
  });
}

export function useSubEvents(eventId: string) {
  return useQuery({
    queryKey: ['subEvents', eventId],
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

export function useSubEventsCounts() {
  return useQuery({
    queryKey: ['subEventsCounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sub_events')
        .select('event_id');

      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data.forEach((item) => {
        counts[item.event_id] = (counts[item.event_id] || 0) + 1;
      });
      return counts;
    },
  });
}

export function useMyRegistrations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['myRegistrations', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('event_registrations')
        .select('*, sub_events(*, events(*))')
        .eq('user_id', user.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useEventParticipation(eventId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['eventParticipation', eventId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('event_participants')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!eventId && !!user,
  });
}

export function useRegisterForParentEvent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      if (!user) throw new Error('You must be logged in');

      const { data, error } = await supabase
        .from('event_participants')
        .insert({ event_id: eventId, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: 'Registered for event!', description: 'You can now register for activities.' });
      queryClient.invalidateQueries({ queryKey: ['eventParticipation'] });
      queryClient.invalidateQueries({ queryKey: ['myEventParticipations'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Registration failed', description: error.message, variant: 'destructive' });
    },
  });
}

export function useRegisterForEvent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      subEventId, 
      teamName, 
      teamMembers 
    }: { 
      subEventId: string; 
      teamName?: string; 
      teamMembers?: string[];
    }) => {
      if (!user) throw new Error('You must be logged in');

      const { data, error } = await supabase
        .from('event_registrations')
        .insert({
          sub_event_id: subEventId,
          user_id: user.id,
          team_name: teamName,
          team_members: teamMembers,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Registration successful!',
        description: 'You have been registered for this activity.',
      });
      queryClient.invalidateQueries({ queryKey: ['myRegistrations'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Registration failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useEventResults(eventId: string) {
  return useQuery({
    queryKey: ['eventResults', eventId],
    queryFn: async () => {
      const { data: subEvents } = await supabase
        .from('sub_events')
        .select('id, name')
        .eq('event_id', eventId);

      if (!subEvents?.length) return [];

      const subEventIds = subEvents.map((se) => se.id);
      const { data: results, error } = await supabase
        .from('event_results')
        .select('*')
        .in('sub_event_id', subEventIds)
        .order('position', { ascending: true });

      if (error) throw error;

      const subEventMap = new Map(subEvents.map((se) => [se.id, se.name]));
      return (results || []).map((r) => ({
        ...r,
        sub_event_name: subEventMap.get(r.sub_event_id) || '',
      }));
    },
    enabled: !!eventId,
  });
}

export function useEventGallery(eventId: string) {
  return useQuery({
    queryKey: ['eventGallery', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_gallery')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!eventId,
  });
}

export function useMyEventParticipations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['myEventParticipations', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('event_participants')
        .select('*, events(*)')
        .eq('user_id', user.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}
