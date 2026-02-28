import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Event, SubEvent, EventRegistration, EventResult, EventGalleryItem, RegistrationStatus } from '@/types/database';

// Fetch events assigned to the current user via event_coordinators
export function useMyAssignedEvents() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ['my-assigned-events', profile?.user_id],
    queryFn: async () => {
      if (!profile) return [];
      const { data: coords } = await supabase
        .from('event_coordinators')
        .select('event_id')
        .eq('user_id', profile.user_id);
      const eventIds = coords?.map((c) => c.event_id) || [];
      if (eventIds.length === 0) return [];
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .in('id', eventIds)
        .order('start_date', { ascending: false });
      if (error) throw error;
      return (data || []) as Event[];
    },
    enabled: !!profile,
  });
}

// Fetch sub-events for a specific event
export function useAssignedSubEvents(eventId: string | null) {
  return useQuery({
    queryKey: ['assigned-sub-events', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      const { data, error } = await supabase
        .from('sub_events')
        .select('*')
        .eq('event_id', eventId)
        .order('name');
      if (error) throw error;
      return (data || []) as SubEvent[];
    },
    enabled: !!eventId,
  });
}

// Fetch all sub-events for all assigned events
export function useAllAssignedSubEvents(eventIds: string[]) {
  return useQuery({
    queryKey: ['all-assigned-sub-events', eventIds],
    queryFn: async () => {
      if (eventIds.length === 0) return [];
      const { data, error } = await supabase
        .from('sub_events')
        .select('*')
        .in('event_id', eventIds)
        .order('name');
      if (error) throw error;
      return (data || []) as SubEvent[];
    },
    enabled: eventIds.length > 0,
  });
}

// Fetch registrations for given sub-event IDs
export function useAssignedRegistrations(subEventIds: string[]) {
  return useQuery({
    queryKey: ['assigned-registrations', subEventIds],
    queryFn: async () => {
      if (subEventIds.length === 0) return [];
      const { data: regs, error } = await supabase
        .from('event_registrations')
        .select('*, sub_events(*, events:event_id(*))')
        .in('sub_event_id', subEventIds)
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (!regs || regs.length === 0) return [];

      // Fetch profiles separately since there's no FK relationship
      const userIds = [...new Set(regs.map((r) => r.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', userIds);
      const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));

      return regs.map((r) => ({
        ...r,
        profiles: profileMap.get(r.user_id) || null,
      }));
    },
    enabled: subEventIds.length > 0,
  });
}

// Update registration status
export function useUpdateRegistrationStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: RegistrationStatus }) => {
      const { error } = await supabase
        .from('event_registrations')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Registration status updated' });
      queryClient.invalidateQueries({ queryKey: ['assigned-registrations'] });
    },
    onError: (err: Error) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });
}

// Fetch results for a sub-event
export function useAssignedResults(subEventId: string | null) {
  return useQuery({
    queryKey: ['assigned-results', subEventId],
    queryFn: async () => {
      if (!subEventId) return [];
      const { data, error } = await supabase
        .from('event_results')
        .select('*')
        .eq('sub_event_id', subEventId)
        .order('position');
      if (error) throw error;
      return (data || []) as EventResult[];
    },
    enabled: !!subEventId,
  });
}

// Create a result
export function useCreateResult() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (result: { sub_event_id: string; position: number; team_name?: string; remarks?: string }) => {
      const { error } = await supabase.from('event_results').insert({
        sub_event_id: result.sub_event_id,
        position: result.position,
        team_name: result.team_name || null,
        remarks: result.remarks || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Result added' });
      queryClient.invalidateQueries({ queryKey: ['assigned-results'] });
    },
    onError: (err: Error) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });
}

// Delete a result
export function useDeleteResult() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('event_results').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Result deleted' });
      queryClient.invalidateQueries({ queryKey: ['assigned-results'] });
    },
    onError: (err: Error) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });
}

// Fetch gallery images for an event
export function useAssignedGallery(eventId: string | null) {
  return useQuery({
    queryKey: ['assigned-gallery', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      const { data, error } = await supabase
        .from('event_gallery')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as EventGalleryItem[];
    },
    enabled: !!eventId,
  });
}

// Upload gallery image
export function useUploadGalleryImage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async ({ file, eventId, subEventId, caption }: { file: File; eventId: string; subEventId?: string; caption?: string }) => {
      const filePath = `${eventId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from('event-gallery').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('event-gallery').getPublicUrl(filePath);
      const { error } = await supabase.from('event_gallery').insert({
        event_id: eventId,
        sub_event_id: subEventId || null,
        image_url: urlData.publicUrl,
        caption: caption || null,
        uploaded_by: profile?.user_id || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Image uploaded' });
      queryClient.invalidateQueries({ queryKey: ['assigned-gallery'] });
    },
    onError: (err: Error) => {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    },
  });
}

// Create a sub-event (activity) for an assigned event
export function useCreateAssignedSubEvent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (payload: {
      event_id: string;
      name: string;
      description?: string | null;
      venue?: string | null;
      schedule?: string | null;
      rules?: string | null;
      max_participants?: number | null;
      registration_deadline?: string | null;
      is_team_event?: boolean;
      team_size_min?: number;
      team_size_max?: number;
    }) => {
      const { error } = await supabase.from('sub_events').insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Activity created' });
      queryClient.invalidateQueries({ queryKey: ['assigned-sub-events'] });
    },
    onError: (err: Error) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });
}

// Update a sub-event (activity)
export function useUpdateAssignedSubEvent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...payload }: {
      id: string;
      name?: string;
      description?: string | null;
      venue?: string | null;
      schedule?: string | null;
      rules?: string | null;
      max_participants?: number | null;
      registration_deadline?: string | null;
      is_team_event?: boolean;
      team_size_min?: number;
      team_size_max?: number;
    }) => {
      const { error } = await supabase.from('sub_events').update(payload).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Activity updated' });
      queryClient.invalidateQueries({ queryKey: ['assigned-sub-events'] });
    },
    onError: (err: Error) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });
}

// Delete a sub-event (activity)
export function useDeleteAssignedSubEvent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('sub_events').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Activity deleted' });
      queryClient.invalidateQueries({ queryKey: ['assigned-sub-events'] });
    },
    onError: (err: Error) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });
}

// Delete gallery image
export function useDeleteGalleryImage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, imageUrl }: { id: string; imageUrl: string }) => {
      // Extract path from URL
      const urlParts = imageUrl.split('/event-gallery/');
      if (urlParts.length > 1) {
        await supabase.storage.from('event-gallery').remove([urlParts[1]]);
      }
      const { error } = await supabase.from('event_gallery').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Image deleted' });
      queryClient.invalidateQueries({ queryKey: ['assigned-gallery'] });
    },
    onError: (err: Error) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });
}
