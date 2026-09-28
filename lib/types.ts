export interface Article {
  id: string;
  title: string;
  content: string;
  type: 'exclusive' | 'aggregated';
  author_id: string | null;
  source_id: string | null;
  original_url: string | null;
  category_id: string | null;
  image_url: string | null;
  published_at: string;
  categories?: { name: string } | null;
  sources?: { name: string } | null;
  users?: { email: string } | null;
}

export interface Source {
  id: string;
  name: string;
  rss_url: string;
  is_active: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string | null;
}
