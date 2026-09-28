-- Enable Row Level Security (RLS) on tables
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 1. Public Read Access (Frontend needs to fetch this without logging in)
CREATE POLICY "Allow public read access to articles" 
ON public.articles FOR SELECT USING (true);

CREATE POLICY "Allow public read access to categories" 
ON public.categories FOR SELECT USING (true);

CREATE POLICY "Allow public read access to sources" 
ON public.sources FOR SELECT USING (true);

-- 2. Authenticated Users (Saved Articles logic)
CREATE POLICY "Users can read their own saved articles" 
ON public.saved_articles FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved articles" 
ON public.saved_articles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved articles" 
ON public.saved_articles FOR DELETE USING (auth.uid() = user_id);

-- 3. Public Users Table Read (Needed for article author joining)
CREATE POLICY "Allow public read access to users"
ON public.users FOR SELECT USING (true);
