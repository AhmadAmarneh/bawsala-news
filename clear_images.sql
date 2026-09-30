-- Clear all existing fake Unsplash placeholder images so the cron job can re-fetch authentic ones
UPDATE articles 
SET image_url = NULL 
WHERE image_url LIKE '%unsplash.com%';
