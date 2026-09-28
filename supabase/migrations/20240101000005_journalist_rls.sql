-- 4. Journalist Articles Access
CREATE POLICY "Journalists can insert articles"
ON public.articles FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT id FROM public.users WHERE role = 'journalist' OR role = 'admin')
);

CREATE POLICY "Journalists can update own articles"
ON public.articles FOR UPDATE USING (
  auth.uid() = author_id OR auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin')
);

CREATE POLICY "Journalists can delete own articles"
ON public.articles FOR DELETE USING (
  auth.uid() = author_id OR auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin')
);
