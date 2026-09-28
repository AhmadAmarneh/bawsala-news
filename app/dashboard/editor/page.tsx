import { createClient } from '@/lib/supabase/server';
import { EditorForm } from './EditorForm';
import type { Article, Category } from '@/lib/types';

export default async function EditorPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id: articleId } = await searchParams;
  const supabase = await createClient();

  const { data: categoriesData } = await supabase.from('categories').select('id, name, slug');
  const categories = (categoriesData as Category[]) || [];

  let article: Article | null = null;
  if (articleId) {
    const { data } = await supabase.from('articles').select('*').eq('id', articleId).single();
    if (data) article = data as Article;
  }

  return <EditorForm categories={categories} article={article} />;
}
