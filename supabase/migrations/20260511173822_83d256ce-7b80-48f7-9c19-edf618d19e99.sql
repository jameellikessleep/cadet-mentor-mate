
CREATE TABLE public.shared_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson jsonb NOT NULL,
  title text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.shared_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read shared lessons"
  ON public.shared_lessons FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create shared lessons"
  ON public.shared_lessons FOR INSERT
  WITH CHECK (true);
