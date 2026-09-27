import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { BookmarkButton } from '@/components/BookmarkButton';

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: { user } } = await supabase.auth.getUser();

  let isSaved = false;
  if (user) {
    const { data: savedData } = await supabase
      .from('saved_articles')
      .select('article_id')
      .eq('user_id', user.id)
      .eq('article_id', id)
      .single();
    if (savedData) isSaved = true;
  }

  const { data: article, error } = await supabase
    .from('articles')
    .select('*, users(email), categories(name)')
    .eq('id', id)
    .single();

  if (error || !article) {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-12 right-4 sm:right-6 lg:right-8">
        <BookmarkButton articleId={article.id} initialIsSaved={isSaved} />
      </div>
      
      <header className="mb-10 text-center pr-12">
        {article.categories && (
          <span className="text-blue-600 font-semibold tracking-wide uppercase text-sm">
            {article.categories.name}
          </span>
        )}
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          {article.title}
        </h1>
        <div className="mt-6 flex items-center justify-center text-sm text-slate-500 space-x-4">
          {article.users && <span>By {article.users.email}</span>}
          <span>•</span>
          <time dateTime={article.published_at}>
            {new Date(article.published_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </time>
        </div>
      </header>

      {/* Tailwind Typography Plugin (.prose) parses the Tiptap HTML cleanly */}
      <div 
        className="prose prose-lg prose-slate mx-auto prose-img:rounded-xl prose-a:text-blue-600 hover:prose-a:text-blue-500"
        dangerouslySetInnerHTML={{ __html: article.content }} 
      />
    </article>
  );
}
