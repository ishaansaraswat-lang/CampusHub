import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatRelativeTime } from '@/lib/utils';

export type ActivityTone = 'primary' | 'success' | 'warning' | 'info';

export interface ActivityItem {
  title: string;
  description: string;
  time: string;
  tone?: ActivityTone;
  _ts: number;
}

type Role = 'student' | 'event_admin' | 'placement_cell' | 'super_admin';

function toItem(
  title: string,
  description: string,
  createdAt: string,
  tone: ActivityTone = 'primary',
): ActivityItem {
  return {
    title,
    description,
    time: formatRelativeTime(createdAt),
    tone,
    _ts: new Date(createdAt).getTime(),
  };
}

export function useActivityFeed(role: Role, userId?: string) {
  const [data, setData] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const items: ActivityItem[] = [];
      try {
        if (role === 'student' && userId) {
          const [events, regs, apps] = await Promise.all([
            supabase.from('events').select('name,created_at,status').in('status', ['upcoming', 'active']).order('created_at', { ascending: false }).limit(3),
            supabase.from('event_registrations').select('status,created_at,sub_event_id').eq('user_id', userId).order('created_at', { ascending: false }).limit(3),
            supabase.from('placement_applications').select('status,created_at,job_id').eq('user_id', userId).order('created_at', { ascending: false }).limit(3),
          ]);
          events.data?.forEach((e: any) =>
            items.push(toItem('New Event', `${e.name} is ${e.status}.`, e.created_at, 'primary')),
          );
          regs.data?.forEach((r: any) =>
            items.push(toItem('Event Registration', `Status: ${r.status}.`, r.created_at, 'success')),
          );
          apps.data?.forEach((a: any) =>
            items.push(toItem('Application Submitted', `Status: ${a.status}.`, a.created_at, 'info')),
          );
        } else if (role === 'event_admin' && userId) {
          const { data: coords } = await supabase.from('event_coordinators').select('event_id').eq('user_id', userId);
          const eventIds = coords?.map((c: any) => c.event_id) || [];
          if (eventIds.length) {
            const { data: subs } = await supabase.from('sub_events').select('id,name').in('event_id', eventIds);
            const subIds = subs?.map((s: any) => s.id) || [];
            const subMap = new Map(subs?.map((s: any) => [s.id, s.name]) || []);
            if (subIds.length) {
              const [regs, results] = await Promise.all([
                supabase.from('event_registrations').select('status,created_at,sub_event_id').in('sub_event_id', subIds).order('created_at', { ascending: false }).limit(4),
                supabase.from('event_results').select('position,created_at,sub_event_id,team_name').in('sub_event_id', subIds).order('created_at', { ascending: false }).limit(3),
              ]);
              regs.data?.forEach((r: any) =>
                items.push(toItem('New Registration', `${subMap.get(r.sub_event_id) || 'Sub-event'} — ${r.status}.`, r.created_at, r.status === 'pending' ? 'warning' : 'success')),
              );
              results.data?.forEach((r: any) =>
                items.push(toItem('Result Published', `${subMap.get(r.sub_event_id) || 'Sub-event'} — position ${r.position}.`, r.created_at, 'success')),
              );
            }
          }
        } else if (role === 'placement_cell') {
          const [jobs, apps, results] = await Promise.all([
            supabase.from('job_postings').select('title,created_at,status').order('created_at', { ascending: false }).limit(3),
            supabase.from('placement_applications').select('status,created_at').order('created_at', { ascending: false }).limit(3),
            supabase.from('placement_results').select('package_offered,created_at').order('created_at', { ascending: false }).limit(3),
          ]);
          jobs.data?.forEach((j: any) =>
            items.push(toItem('Job Posting', `${j.title} (${j.status}).`, j.created_at, 'primary')),
          );
          apps.data?.forEach((a: any) =>
            items.push(toItem('Application', `Status: ${a.status}.`, a.created_at, 'info')),
          );
          results.data?.forEach((r: any) =>
            items.push(toItem('Placement', `${r.package_offered ? r.package_offered + ' LPA' : 'Offer'} released.`, r.created_at, 'success')),
          );
        } else if (role === 'super_admin') {
          const [users, events, roles] = await Promise.all([
            supabase.from('profiles').select('name,created_at').order('created_at', { ascending: false }).limit(3),
            supabase.from('events').select('name,created_at,status').order('created_at', { ascending: false }).limit(3),
            supabase.from('user_roles').select('role,created_at').order('created_at', { ascending: false }).limit(3),
          ]);
          users.data?.forEach((u: any) =>
            items.push(toItem('New User', `${u.name} signed up.`, u.created_at, 'primary')),
          );
          events.data?.forEach((e: any) =>
            items.push(toItem('Event Updated', `${e.name} (${e.status}).`, e.created_at, 'success')),
          );
          roles.data?.forEach((r: any) =>
            items.push(toItem('Role Assigned', `${r.role.replace('_', ' ')}.`, r.created_at, 'info')),
          );
        }
      } catch (e) {
        console.error('Activity feed error', e);
      }
      if (!cancelled) {
        setData(items.sort((a, b) => b._ts - a._ts).slice(0, 5));
        setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [role, userId]);

  return { data, loading };
}
