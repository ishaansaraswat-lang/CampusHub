import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type JobPosting = Tables<'job_postings'>;
type Company = Tables<'companies'>;
type PlacementApplication = Tables<'placement_applications'>;

export function useJobPostings() {
  return useQuery({
    queryKey: ['jobPostings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_postings')
        .select('*, companies(*)')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as (JobPosting & { companies: Company | null })[];
    },
  });
}

export function useJobPosting(id: string) {
  return useQuery({
    queryKey: ['jobPosting', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_postings')
        .select('*, companies(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as JobPosting & { companies: Company | null };
    },
    enabled: !!id,
  });
}

export function useMyApplications() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['myApplications', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('placement_applications')
        .select('*, job_postings(*, companies(*))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useApplyForJob() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      jobId, 
      resumeUrl, 
      coverLetter 
    }: { 
      jobId: string; 
      resumeUrl?: string; 
      coverLetter?: string;
    }) => {
      if (!user) throw new Error('You must be logged in');

      const { data, error } = await supabase
        .from('placement_applications')
        .insert({
          job_id: jobId,
          user_id: user.id,
          resume_url: resumeUrl,
          cover_letter: coverLetter,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Application submitted!',
        description: 'Your application has been submitted successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['myApplications'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Application failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useCompanies() {
  return useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Company[];
    },
  });
}

export function usePlacementResults() {
  return useQuery({
    queryKey: ['placementResults'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('placement_results')
        .select('*, job_postings(*, companies(*))')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}
