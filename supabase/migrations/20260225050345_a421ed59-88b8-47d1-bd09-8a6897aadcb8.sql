
CREATE POLICY "Anyone can view placement results"
  ON public.placement_results FOR SELECT
  USING (true);
