-- Admissions Analytics Module

-- Add admissions role to existing role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'admissions_cell';

-- Admissions analytics data
CREATE TABLE IF NOT EXISTS public.admission_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year TEXT NOT NULL,
  course TEXT NOT NULL,
  region TEXT NOT NULL,
  applications INTEGER NOT NULL DEFAULT 0 CHECK (applications >= 0),
  admissions INTEGER NOT NULL DEFAULT 0 CHECK (admissions >= 0 AND admissions <= applications),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (academic_year, course, region)
);

-- Enable RLS
ALTER TABLE public.admission_records ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can view admission analytics
CREATE POLICY "Authenticated users can view admission records"
  ON public.admission_records
  FOR SELECT
  TO authenticated
  USING (true);

-- Admissions cell can manage admission records
CREATE POLICY "Admissions cell can manage admission records"
  ON public.admission_records
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admissions_cell'))
  WITH CHECK (public.has_role(auth.uid(), 'admissions_cell'));

-- Super admins can manage admission records
CREATE POLICY "Super admins can manage admission records"
  ON public.admission_records
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Updated-at trigger
CREATE TRIGGER update_admission_records_updated_at
  BEFORE UPDATE ON public.admission_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Useful indexes for analytics
CREATE INDEX IF NOT EXISTS idx_admission_records_year
  ON public.admission_records(academic_year);

CREATE INDEX IF NOT EXISTS idx_admission_records_course
  ON public.admission_records(course);

CREATE INDEX IF NOT EXISTS idx_admission_records_region
  ON public.admission_records(region);
