-- Update all exclusive (internal) articles that currently have no image with a random high-quality Unsplash image
UPDATE articles
SET image_url = (
  ARRAY[
    'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&q=80',
    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80',
    'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80'
  ]
)[floor(random() * 5) + 1]
WHERE type != 'aggregated' AND (image_url IS NULL OR image_url = '');
