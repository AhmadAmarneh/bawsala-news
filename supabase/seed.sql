-- Disable trigger temporarily if needed, but since we rely on it, let's keep it enabled.
-- Note: auth.users password is encrypted with bcrypt

-- 1. Seed Auth Users
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, confirmation_token, recovery_token, email_change_token_new, email_change)
VALUES 
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'admin@bawsala.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), 'authenticated', '', '', '', ''),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'journalist@bawsala.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), 'authenticated', '', '', '', ''),
  ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'reader@bawsala.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), 'authenticated', '', '', '', '');

-- 2. Update Roles in public.users (inserted automatically via trigger)
UPDATE public.users SET role = 'admin' WHERE id = '11111111-1111-1111-1111-111111111111';
UPDATE public.users SET role = 'journalist' WHERE id = '22222222-2222-2222-2222-222222222222';
-- Reader stays as reader

-- 3. Seed Categories
INSERT INTO public.categories (id, name, slug) VALUES 
  ('10000000-0000-0000-0000-000000000001', 'Technology', 'technology'),
  ('10000000-0000-0000-0000-000000000002', 'Sports', 'sports'),
  ('10000000-0000-0000-0000-000000000003', 'Politics', 'politics'),
  ('10000000-0000-0000-0000-000000000004', 'Business', 'business');

-- 4. Seed Sources
INSERT INTO public.sources (id, name, rss_url, is_active) VALUES 
  ('20000000-0000-0000-0000-000000000001', 'TechCrunch', 'https://techcrunch.com/feed/', true),
  ('20000000-0000-0000-0000-000000000002', 'BBC News', 'http://feeds.bbci.co.uk/news/rss.xml', true),
  ('20000000-0000-0000-0000-000000000003', 'Al Jazeera English', 'https://www.aljazeera.com/xml/rss/all.xml', true);

-- 5. Seed Articles (Mixed)
INSERT INTO public.articles (id, title, content, type, author_id, source_id, original_url, category_id, published_at) VALUES 
  -- Exclusive Articles (Journalist authored)
  (gen_random_uuid(), 'The Future of AI in Local Communities', '<p>Artificial Intelligence is reshaping how local communities interact, share data, and govern themselves.</p><h2>The Core Benefits</h2><ul><li>Better traffic management</li><li>Automated public services</li><li>Enhanced community engagement</li></ul><p>We sat down with local leaders to discuss how this will impact our daily lives over the next decade. The consensus is clear: adaptation is necessary.</p>', 'exclusive', '22222222-2222-2222-2222-222222222222', null, null, '10000000-0000-0000-0000-000000000001', now() - interval '1 hour'),
  
  (gen_random_uuid(), 'City Council Approves New Sports Complex', '<p>In a unanimous vote, the city council has approved the development of a brand new 50-acre sports complex.</p><p>This facility will host a variety of sports including tennis, basketball, and an Olympic-sized swimming pool. Construction is set to begin next spring, bringing hundreds of jobs to the area.</p>', 'exclusive', '22222222-2222-2222-2222-222222222222', null, null, '10000000-0000-0000-0000-000000000002', now() - interval '2 hours'),
  
  (gen_random_uuid(), 'Local Election Debate Breakdown', '<p>The highly anticipated mayoral debate took place last night, with candidates clashing over taxes, education, and infrastructure.</p><p><strong>Key Takeaways:</strong></p><ul><li>Candidate A focused on lowering property taxes.</li><li>Candidate B emphasized public school funding.</li></ul><p>Read our full analysis to see who came out on top.</p>', 'exclusive', '22222222-2222-2222-2222-222222222222', null, null, '10000000-0000-0000-0000-000000000003', now() - interval '3 hours'),

  -- Aggregated Articles
  (gen_random_uuid(), 'Apple announces new mixed reality headset timeline', 'Apple is reportedly shifting its timeline for the next generation of its mixed reality headset...', 'aggregated', null, '20000000-0000-0000-0000-000000000001', 'https://techcrunch.com/2023/apple-headset', '10000000-0000-0000-0000-000000000001', now() - interval '1 day'),
  
  (gen_random_uuid(), 'Global Markets Rally Amid Tech Stock Surge', 'Stock markets around the world saw significant gains today as major technology companies reported better-than-expected earnings...', 'aggregated', null, '20000000-0000-0000-0000-000000000002', 'https://bbc.com/news/business-123', '10000000-0000-0000-0000-000000000004', now() - interval '1 day 2 hours'),
  
  (gen_random_uuid(), 'UN calls for immediate ceasefire in conflict zones', 'The United Nations Security Council has issued a strong statement urging all parties in ongoing conflict zones to agree to an immediate ceasefire...', 'aggregated', null, '20000000-0000-0000-0000-000000000003', 'https://aljazeera.com/news/un-ceasefire', '10000000-0000-0000-0000-000000000003', now() - interval '1 day 5 hours'),
  
  (gen_random_uuid(), 'Champions League: Final teams confirmed', 'The final two teams for this years Champions League have been decided after a thrilling set of semi-final matches...', 'aggregated', null, '20000000-0000-0000-0000-000000000002', 'https://bbc.com/sport/football-456', '10000000-0000-0000-0000-000000000002', now() - interval '2 days');
