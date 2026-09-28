-- Add image_url column to articles table if it doesn't exist
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS image_url TEXT;
