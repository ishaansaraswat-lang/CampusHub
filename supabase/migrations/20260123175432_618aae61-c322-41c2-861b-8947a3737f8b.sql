-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('student', 'event_admin', 'placement_cell', 'super_admin');

-- Create enum for event status
CREATE TYPE public.event_status AS ENUM ('draft', 'upcoming', 'active', 'completed', 'cancelled');

-- Create enum for registration status
CREATE TYPE public.registration_status AS ENUM ('pending', 'confirmed', 'cancelled', 'waitlisted');

-- Create enum for application status
CREATE TYPE public.application_status AS ENUM ('pending', 'shortlisted', 'rejected', 'selected', 'withdrawn');

-- Create enum for job posting status
CREATE TYPE public.job_status AS ENUM ('draft', 'open', 'closed', 'filled');

-- =============================================
-- PROFILES TABLE
-- =============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  student_id TEXT,
  department TEXT,
  year INTEGER,
  phone TEXT,
  avatar_url TEXT,
  cgpa DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- USER ROLES TABLE (Separate for security)
-- =============================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- =============================================
-- EVENTS TABLE
-- =============================================
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  banner_url TEXT,
  start_date DATE,
  end_date DATE,
  status event_status NOT NULL DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- SUB-EVENTS TABLE
-- =============================================
CREATE TABLE public.sub_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  venue TEXT,
  schedule TIMESTAMP WITH TIME ZONE,
  rules TEXT,
  max_participants INTEGER,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  is_team_event BOOLEAN NOT NULL DEFAULT false,
  team_size_min INTEGER DEFAULT 1,
  team_size_max INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- EVENT COORDINATORS TABLE
-- =============================================
CREATE TABLE public.event_coordinators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);

-- =============================================
-- EVENT REGISTRATIONS TABLE
-- =============================================
CREATE TABLE public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_event_id UUID REFERENCES public.sub_events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  team_name TEXT,
  team_members JSONB,
  status registration_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (sub_event_id, user_id)
);

-- =============================================
-- EVENT RESULTS TABLE
-- =============================================
CREATE TABLE public.event_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_event_id UUID REFERENCES public.sub_events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  position INTEGER NOT NULL,
  team_name TEXT,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- EVENT GALLERY TABLE
-- =============================================
CREATE TABLE public.event_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  sub_event_id UUID REFERENCES public.sub_events(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- COMPANIES TABLE
-- =============================================
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- JOB POSTINGS TABLE
-- =============================================
CREATE TABLE public.job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  jd_file_url TEXT,
  eligibility_criteria JSONB,
  min_cgpa DECIMAL(3,2),
  eligible_departments TEXT[],
  eligible_years INTEGER[],
  package_lpa DECIMAL(5,2),
  deadline TIMESTAMP WITH TIME ZONE,
  status job_status NOT NULL DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- PLACEMENT APPLICATIONS TABLE
-- =============================================
CREATE TABLE public.placement_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.job_postings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  resume_url TEXT,
  cover_letter TEXT,
  status application_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (job_id, user_id)
);

-- =============================================
-- PLACEMENT RESULTS TABLE
-- =============================================
CREATE TABLE public.placement_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.job_postings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  offer_letter_url TEXT,
  package_offered DECIMAL(5,2),
  joined BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (job_id, user_id)
);

-- =============================================
-- SECURITY DEFINER FUNCTIONS
-- =============================================

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user is coordinator of an event
CREATE OR REPLACE FUNCTION public.is_event_coordinator(_user_id UUID, _event_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.event_coordinators
    WHERE user_id = _user_id
      AND event_id = _event_id
  )
$$;

-- Function to get user roles
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id UUID)
RETURNS SETOF app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id
$$;

-- =============================================
-- TRIGGER: Auto-create profile on signup
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- TRIGGER: Update updated_at timestamp
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sub_events_updated_at
  BEFORE UPDATE ON public.sub_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_registrations_updated_at
  BEFORE UPDATE ON public.event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_postings_updated_at
  BEFORE UPDATE ON public.job_postings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_placement_applications_updated_at
  BEFORE UPDATE ON public.placement_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_coordinators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_results ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES: PROFILES
-- =============================================
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- =============================================
-- RLS POLICIES: USER ROLES
-- =============================================
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Super admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- =============================================
-- RLS POLICIES: EVENTS
-- =============================================
CREATE POLICY "Anyone can view active/upcoming/completed events"
  ON public.events FOR SELECT
  USING (status IN ('upcoming', 'active', 'completed'));

CREATE POLICY "Authenticated users can view all events"
  ON public.events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Super admins can manage events"
  ON public.events FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Event admins can update their assigned events"
  ON public.events FOR UPDATE
  TO authenticated
  USING (public.is_event_coordinator(auth.uid(), id));

-- =============================================
-- RLS POLICIES: SUB-EVENTS
-- =============================================
CREATE POLICY "Anyone can view sub-events of visible events"
  ON public.sub_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = sub_events.event_id
      AND events.status IN ('upcoming', 'active', 'completed')
    )
  );

CREATE POLICY "Super admins can manage sub-events"
  ON public.sub_events FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Event admins can manage sub-events of their events"
  ON public.sub_events FOR ALL
  TO authenticated
  USING (public.is_event_coordinator(auth.uid(), event_id));

-- =============================================
-- RLS POLICIES: EVENT COORDINATORS
-- =============================================
CREATE POLICY "Users can view coordinators"
  ON public.event_coordinators FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Super admins can manage coordinators"
  ON public.event_coordinators FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- =============================================
-- RLS POLICIES: EVENT REGISTRATIONS
-- =============================================
CREATE POLICY "Users can view their own registrations"
  ON public.event_registrations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can register for events"
  ON public.event_registrations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own registrations"
  ON public.event_registrations FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Event admins can view registrations for their events"
  ON public.event_registrations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sub_events se
      WHERE se.id = sub_event_id
      AND public.is_event_coordinator(auth.uid(), se.event_id)
    )
  );

CREATE POLICY "Event admins can update registrations for their events"
  ON public.event_registrations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sub_events se
      WHERE se.id = sub_event_id
      AND public.is_event_coordinator(auth.uid(), se.event_id)
    )
  );

CREATE POLICY "Super admins can manage all registrations"
  ON public.event_registrations FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- =============================================
-- RLS POLICIES: EVENT RESULTS
-- =============================================
CREATE POLICY "Anyone can view results"
  ON public.event_results FOR SELECT
  USING (true);

CREATE POLICY "Event admins can manage results for their events"
  ON public.event_results FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sub_events se
      WHERE se.id = sub_event_id
      AND public.is_event_coordinator(auth.uid(), se.event_id)
    )
  );

CREATE POLICY "Super admins can manage all results"
  ON public.event_results FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- =============================================
-- RLS POLICIES: EVENT GALLERY
-- =============================================
CREATE POLICY "Anyone can view gallery"
  ON public.event_gallery FOR SELECT
  USING (true);

CREATE POLICY "Event admins can manage gallery for their events"
  ON public.event_gallery FOR ALL
  TO authenticated
  USING (public.is_event_coordinator(auth.uid(), event_id));

CREATE POLICY "Super admins can manage all gallery"
  ON public.event_gallery FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- =============================================
-- RLS POLICIES: COMPANIES
-- =============================================
CREATE POLICY "Anyone can view companies"
  ON public.companies FOR SELECT
  USING (true);

CREATE POLICY "Placement cell can manage companies"
  ON public.companies FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'placement_cell'));

CREATE POLICY "Super admins can manage companies"
  ON public.companies FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- =============================================
-- RLS POLICIES: JOB POSTINGS
-- =============================================
CREATE POLICY "Anyone can view open job postings"
  ON public.job_postings FOR SELECT
  USING (status = 'open');

CREATE POLICY "Authenticated users can view all job postings"
  ON public.job_postings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Placement cell can manage job postings"
  ON public.job_postings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'placement_cell'));

CREATE POLICY "Super admins can manage job postings"
  ON public.job_postings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- =============================================
-- RLS POLICIES: PLACEMENT APPLICATIONS
-- =============================================
CREATE POLICY "Users can view their own applications"
  ON public.placement_applications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can apply for jobs"
  ON public.placement_applications FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own applications"
  ON public.placement_applications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Placement cell can view all applications"
  ON public.placement_applications FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'placement_cell'));

CREATE POLICY "Placement cell can update applications"
  ON public.placement_applications FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'placement_cell'));

CREATE POLICY "Super admins can manage all applications"
  ON public.placement_applications FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- =============================================
-- RLS POLICIES: PLACEMENT RESULTS
-- =============================================
CREATE POLICY "Users can view their own placement results"
  ON public.placement_results FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Placement cell can manage placement results"
  ON public.placement_results FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'placement_cell'));

CREATE POLICY "Super admins can manage all placement results"
  ON public.placement_results FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- =============================================
-- STORAGE BUCKETS
-- =============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('event-banners', 'event-banners', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('event-gallery', 'event-gallery', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('company-logos', 'company-logos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('job-documents', 'job-documents', false);

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for event-banners
CREATE POLICY "Event banners are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'event-banners');

CREATE POLICY "Event admins and super admins can manage event banners"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'event-banners' AND (
      public.has_role(auth.uid(), 'event_admin') OR
      public.has_role(auth.uid(), 'super_admin')
    )
  );

-- Storage policies for event-gallery
CREATE POLICY "Event gallery is publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'event-gallery');

CREATE POLICY "Event admins and super admins can manage event gallery"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'event-gallery' AND (
      public.has_role(auth.uid(), 'event_admin') OR
      public.has_role(auth.uid(), 'super_admin')
    )
  );

-- Storage policies for company-logos
CREATE POLICY "Company logos are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'company-logos');

CREATE POLICY "Placement cell and super admins can manage company logos"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'company-logos' AND (
      public.has_role(auth.uid(), 'placement_cell') OR
      public.has_role(auth.uid(), 'super_admin')
    )
  );

-- Storage policies for job-documents
CREATE POLICY "Authenticated users can view job documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'job-documents');

CREATE POLICY "Placement cell and super admins can manage job documents"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'job-documents' AND (
      public.has_role(auth.uid(), 'placement_cell') OR
      public.has_role(auth.uid(), 'super_admin')
    )
  );