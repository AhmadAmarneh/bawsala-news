-- Clear all aggregated articles to start fresh for the cron job testing
DELETE FROM articles WHERE type = 'aggregated';
