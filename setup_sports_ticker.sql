-- Create the sports_ticker table
CREATE TABLE IF NOT EXISTS sports_ticker (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  match_status TEXT NOT NULL, -- e.g., 'LIVE', 'FT', 'HT', 'Upcoming'
  match_time TEXT NOT NULL, -- e.g., '72'' or 'Final'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS (Read-only for public)
ALTER TABLE sports_ticker ENABLE ROW LEVEL SECURITY;

-- Drop policy if exists so we can safely re-run
DROP POLICY IF EXISTS "Allow public read access to sports_ticker" ON sports_ticker;

CREATE POLICY "Allow public read access to sports_ticker" 
  ON sports_ticker FOR SELECT 
  USING (true);

-- Clear existing data (if re-running)
TRUNCATE TABLE sports_ticker;

-- Insert Realistic September 2026 Club Football Data
INSERT INTO sports_ticker (home_team, away_team, home_score, away_score, match_status, match_time) VALUES
('Arsenal', 'Manchester City', 2, 2, 'LIVE', '67'''),
('Real Madrid', 'Atletico Madrid', 1, 0, 'HT', 'Half Time'),
('Barcelona', 'Bayern Munich', 0, 0, 'Upcoming', '21:00'),
('Liverpool', 'Chelsea', 3, 1, 'FT', 'Full Time');
