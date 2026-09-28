-- HIGH-3: Sources RLS Policies
CREATE POLICY "Admins can insert sources" ON public.sources FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));
CREATE POLICY "Admins can update sources" ON public.sources FOR UPDATE USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));
CREATE POLICY "Admins can delete sources" ON public.sources FOR DELETE USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));

-- HIGH-4: Secure handle_new_user and User RLS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (new.id, new.email, 'reader');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Provide minimal user policies if necessary (e.g., updating their own profile, though currently only triggers insert)
-- Assuming only system inserts for now, so we just secure the trigger.

-- MED-2: Add saved_at to saved_articles
ALTER TABLE public.saved_articles ADD COLUMN IF NOT EXISTS saved_at TIMESTAMPTZ DEFAULT now();

-- MED-6: Fix Journalist INSERT Policy
DROP POLICY IF EXISTS "Journalists can insert articles" ON public.articles;
CREATE POLICY "Journalists can insert articles"
ON public.articles FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT id FROM public.users WHERE role IN ('journalist', 'admin'))
  AND (author_id = auth.uid() OR author_id IS NULL)
);
