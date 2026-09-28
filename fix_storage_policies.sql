-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Auth Insert" ON storage.objects;

-- Create a new, secure policy restricting uploads to authenticated users
CREATE POLICY "Auth Insert" 
ON storage.objects FOR INSERT 
WITH CHECK ( 
  bucket_id = 'article-images' 
  AND auth.role() = 'authenticated'
);

-- (Optional) If you want to restrict it specifically to admins and journalists, use this instead:
-- CREATE POLICY "Journalist/Admin Upload" 
-- ON storage.objects FOR INSERT 
-- WITH CHECK ( 
--   bucket_id = 'article-images' 
--   AND auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'journalist'))
-- );
