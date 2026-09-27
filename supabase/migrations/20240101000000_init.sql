
CREATE TYPE user_role AS ENUM ('admin', 'journalist', 'reader');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'reader'
);

CREATE TABLE sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    rss_url TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE
);

CREATE TYPE article_type AS ENUM ('exclusive', 'aggregated');

CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type article_type NOT NULL,
    author_id UUID REFERENCES users(id),
    source_id UUID REFERENCES sources(id),
    original_url TEXT,
    category_id UUID REFERENCES categories(id),
    published_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE saved_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    article_id UUID REFERENCES articles(id) NOT NULL,
    UNIQUE(user_id, article_id)
);

