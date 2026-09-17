export type AppRole = 'student' | 'event_admin' | 'placement_cell' | 'super_admin';

export type EventStatus = 'draft' | 'upcoming' | 'active' | 'completed' | 'cancelled';

export type RegistrationStatus = 'pending' | 'confirmed' | 'cancelled' | 'waitlisted';

export type ApplicationStatus = 'pending' | 'shortlisted' | 'rejected' | 'selected' | 'withdrawn';

export type JobStatus = 'draft' | 'open' | 'closed' | 'filled';

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  student_id: string | null;
  department: string | null;
  year: number | null;
  phone: string | null;
  avatar_url: string | null;
  cgpa: number | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface Event {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  banner_url: string | null;
  start_date: string | null;
  end_date: string | null;
  status: EventStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubEvent {
  id: string;
  event_id: string;
  name: string;
  description: string | null;
  venue: string | null;
  schedule: string | null;
  rules: string | null;
  max_participants: number | null;
  registration_deadline: string | null;
  is_team_event: boolean;
  team_size_min: number;
  team_size_max: number;
  created_at: string;
  updated_at: string;
}

export interface EventCoordinator {
  id: string;
  event_id: string;
  user_id: string;
  created_at: string;
}

export interface EventRegistration {
  id: string;
  sub_event_id: string;
  user_id: string;
  team_name: string | null;
  team_members: Record<string, unknown> | null;
  status: RegistrationStatus;
  created_at: string;
  updated_at: string;
}

export interface EventResult {
  id: string;
  sub_event_id: string;
  user_id: string | null;
  position: number;
  team_name: string | null;
  remarks: string | null;
  created_at: string;
}

export interface EventGalleryItem {
  id: string;
  event_id: string;
  sub_event_id: string | null;
  image_url: string;
  caption: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface Company {
  id: string;
  name: string;
  logo_url: string | null;
  description: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobPosting {
  id: string;
  company_id: string;
  title: string;
  description: string | null;
  jd_file_url: string | null;
  eligibility_criteria: Record<string, unknown> | null;
  min_cgpa: number | null;
  eligible_departments: string[] | null;
  eligible_years: number[] | null;
  package_lpa: number | null;
  deadline: string | null;
  status: JobStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlacementApplication {
  id: string;
  job_id: string;
  user_id: string;
  resume_url: string | null;
  cover_letter: string | null;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
}

export interface PlacementResult {
  id: string;
  job_id: string;
  user_id: string;
  offer_letter_url: string | null;
  package_offered: number | null;
  joined: boolean;
  created_at: string;
}

// Extended types with relations
export interface SubEventWithEvent extends SubEvent {
  events?: Event;
}

export interface EventRegistrationWithDetails extends EventRegistration {
  sub_events?: SubEventWithEvent;
  profiles?: Profile;
}

export interface JobPostingWithCompany extends JobPosting {
  companies?: Company;
}

export interface PlacementApplicationWithDetails extends PlacementApplication {
  job_postings?: JobPostingWithCompany;
  profiles?: Profile;
}
