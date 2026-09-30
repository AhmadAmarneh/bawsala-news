import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { BookmarkButton } from '@/components/BookmarkButton';
import { ReadTimeBadge } from '@/components/ReadTimeBadge';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import DOMPurify from 'isomorphic-dompurify';

import type { Article } from '@/lib/types';
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
    .select('*, users(email), categories(name), sources(name)')
    .eq('id', id)
    .single();

  if (error || !article) {
    notFound();
  }

  const authorName = article.type === 'exclusive' 
    ? 'BAWSALA EXCLUSIVE' 
    : article.sources?.name || 'EXTERNAL SOURCE';

  return (
    <article className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 bg-background min-h-screen">
      
      <header className="mb-10 text-center flex flex-col items-center">
        <div className="font-sans text-xs font-bold uppercase text-muted-foreground mb-6 tracking-widest flex items-center gap-4">
           <span>{article.categories?.name || 'News'}</span>
           <span>•</span>
           <time dateTime={article.published_at}>
             {new Date(article.published_at).toLocaleDateString('en-US', {
               year: 'numeric',
               month: 'long',
               day: 'numeric'
             })}
           </time>
        </div>
        
        {article.type === 'aggregated' && article.original_url ? (
          <a href={article.original_url} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-black tracking-tight text-foreground leading-tight max-w-3xl group-hover:underline decoration-2 underline-offset-4 decoration-gray-400">
              {article.title}
            </h1>
            <ExternalLink className="w-6 h-6 ml-4 text-muted-foreground/80 group-hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity hidden md:block" />
          </a>
        ) : (
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-black tracking-tight text-foreground leading-tight max-w-3xl">
            {article.title}
          </h1>
        )}

        <div className="mt-8 pt-6 border-t border-foreground w-full max-w-2xl flex items-center justify-between">
          <div className="font-sans text-xs font-bold uppercase text-foreground tracking-widest flex items-center gap-3">
            <span>BY {authorName}</span>
            <ReadTimeBadge content={article.content} />
          </div>
          <BookmarkButton articleId={article.id} initialIsSaved={isSaved} />
        </div>
      </header>

      {article.image_url && (
        <div className="relative aspect-video w-full mb-12 bg-muted">
           <Image 
             src={article.image_url} 
             fill 
             className="object-cover" 
             alt={article.title} 
             priority 
           />
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <div 
          className="prose dark:prose-invert prose-lg prose-slate prose-p:font-serif prose-p:text-foreground/90 prose-p:leading-relaxed prose-a:text-foreground prose-a:font-bold prose-headings:font-serif prose-headings:font-bold prose-headings:text-foreground mx-auto"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }} 
        />
        
        {article.type === 'aggregated' && article.original_url && (
          <div className="mt-12 pt-8 border-t border-border">
            <a 
              href={article.original_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-foreground text-background px-8 py-3 font-sans text-sm font-bold uppercase tracking-widest hover:opacity-80 transition-colors"
            >
              Read Full Article on {article.sources?.name || 'Source'}
              <ExternalLink className="w-4 h-4 ml-3" />
            </a>
          </div>
        )}
      </div>
      
    </article>
  );
}
