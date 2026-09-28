'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function deleteArticle(articleId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  // To be safe against RLS bypass on server actions without proper RLS policies,
  // we do a manual check if the user is the author or an admin
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
  const role = profile?.role;

  const { data: article } = await supabase.from('articles').select('author_id').eq('id', articleId).single();

  if (!article) {
    return { error: 'Article not found' };
  }

  if (role !== 'admin' && article.author_id !== user.id) {
    return { error: 'Forbidden' };
  }

  // Delete associated saved_articles first to prevent foreign key errors
  await supabase.from('saved_articles').delete().eq('article_id', articleId);

  // Delete article
  const { error } = await supabase.from('articles').delete().eq('id', articleId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/');
  revalidatePath('/dashboard/articles');
  
  return { success: true };
}
