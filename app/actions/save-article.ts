'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function toggleSaveArticle(articleId: string, currentSavedState: boolean) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'unauthenticated', message: 'You must be logged in to save articles.' };
  }

  if (currentSavedState) {
    // Unsave
    const { error } = await supabase
      .from('saved_articles')
      .delete()
      .match({ user_id: user.id, article_id: articleId });

    if (error) return { success: false, error: 'db_error', message: error.message };
  } else {
    // Save
    const { error } = await supabase
      .from('saved_articles')
      .insert({ user_id: user.id, article_id: articleId });

    if (error) return { success: false, error: 'db_error', message: error.message };
  }

  // Revalidate paths to reflect updated state
  revalidatePath('/');
  revalidatePath('/saved');
  revalidatePath(`/article/${articleId}`);

  return { success: true, isSaved: !currentSavedState };
}
