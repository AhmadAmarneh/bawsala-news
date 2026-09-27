
INSERT INTO storage.buckets (id, name, public) 
VALUES ('article-images', 'article-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'article-images' );

CREATE POLICY "Auth Insert" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'article-images' );

