
CREATE TABLE public.event_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own participation"
  ON public.event_participants FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can register for events"
  ON public.event_participants FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Event admins can view participants"
  ON public.event_participants FOR SELECT
  USING (is_event_coordinator(auth.uid(), event_id));

CREATE POLICY "Super admins manage all"
  ON public.event_participants FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role));
