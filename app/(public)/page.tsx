import { createClient } from '@/lib/supabase/server';
import { ExternalLink, Clock } from 'lucide-react';
import { BookmarkButton } from '@/components/BookmarkButton';
import { NewsFilter } from '@/components/NewsFilter';
import { Suspense } from 'react';
import parse from 'html-react-parser';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import DOMPurify from 'isomorphic-dompurify';

const categoryImages: Record<string, string> = {
  'Technology': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
  'Sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80',
  'Politics': 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800&q=80',
  'Business': 'https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?w=800&q=80',
  'default': 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80'
};

import type { Article } from '@/lib/types';

function getImageUrl(article: Pick<Article, 'image_url' | 'categories'>) {
  if (article.image_url) {
    return article.image_url;
  }
  const catName = article.categories?.name || 'default';
  return categoryImages[catName] || categoryImages['default'];
}

export default async function HomePage(props: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const searchParams = await props.searchParams;
  const q = searchParams?.q || '';
  const categoryId = searchParams?.category || '';

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  let savedArticleIds: string[] = [];
  if (user) {
    const { data: savedData } = await supabase
      .from('saved_articles')
      .select('article_id')
      .eq('user_id', user.id);
    if (savedData) savedArticleIds = savedData.map(s => s.article_id);
  }

  // Fetch all categories for the filter
  const { data: categoriesData } = await supabase.from('categories').select('id, name').order('name');
  const categories = categoriesData || [];

  // Fetch articles with filters
  let query = supabase
    .from('articles')
    .select('*, sources(name), categories(name)')
    .order('published_at', { ascending: false });

  if (q) {
    query = query.ilike('title', `%${q}%`);
  }
  
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data: articles, error } = await query.limit(20);

  const hasFilters = q !== '' || categoryId !== '';

  if (!articles || articles.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center py-20 text-muted-foreground bg-muted border border-dashed px-8 font-sans">
          No articles found. Run the aggregator or write some exclusive news!
        </div>
      </div>
    );
  }

  const heroArticle = articles[0];
  const gridArticles = articles.slice(1, 5);
  const sidebarArticles = articles.slice(5, 11);
  const bottomArticles = articles.slice(11);

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-12 py-8 pb-20">
      
      {/* Editorial Header (Date line) */}
      <div className="border-b-2 border-foreground pb-2 mb-6 flex justify-between items-end font-sans text-xs uppercase tracking-widest font-bold text-foreground">
        <div>Vol. CLIII • No. 12</div>
        <div>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
      </div>

      <Suspense fallback={<div className="h-16 mb-8" />}>
        <NewsFilter categories={categories} />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-12 xl:gap-x-16">
        
        {/* Main Content Area */}
        {articles.length === 0 ? (
          <div className="col-span-12 py-20 text-center font-sans">
            <h2 className="text-2xl font-bold mb-2">No articles found</h2>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <>
            {/* Main Content Area (8 cols) */}
            <div className="lg:col-span-8 xl:col-span-9 flex flex-col">
              
              {/* Hero Article */}
              <article className="border-b border-border pb-12 mb-12 flex flex-col">
                <Link href={`/article/${heroArticle?.id}`} className="group block w-full mb-6">
                   <div className="relative aspect-[16/9] w-full bg-muted mb-6">
                     {heroArticle && <Image src={getImageUrl(heroArticle)} fill className="object-cover group-hover:opacity-95 transition-opacity" alt="Hero article image" priority />}
                   </div>
                   <div className="font-sans text-[11px] font-bold uppercase text-muted-foreground mb-4 tracking-widest">
                     {heroArticle?.categories?.name || 'News'} • {heroArticle ? formatDistanceToNow(new Date(heroArticle.published_at), { addSuffix: true }) : ''}
                   </div>
                   <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6 text-foreground group-hover:opacity-80 transition-opacity">
                     {heroArticle?.title}
                   </h2>
                   <div className="font-serif text-foreground/90 text-xl leading-relaxed line-clamp-4 prose dark:prose-invert prose-p:my-0 prose-p:mb-2 prose-a:text-foreground">
                     {heroArticle ? parse(DOMPurify.sanitize(heroArticle.content)) : null}
                   </div>
                </Link>
                
                <div className="font-sans text-xs font-bold uppercase text-foreground flex items-center justify-between border-t border-border pt-4">
                  <span className="flex items-center">
                    BY {heroArticle?.type === 'exclusive' ? 'BAWSALA EXCLUSIVE' : heroArticle?.sources?.name}
                  </span>
                  {heroArticle && <BookmarkButton articleId={heroArticle.id} initialIsSaved={savedArticleIds.includes(heroArticle.id)} />}
                </div>
              </article>

              {/* 2-Column Grid for Next Top Stories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
                {gridArticles.map((article, idx) => (
                  <article key={article.id} className={`flex flex-col relative ${idx >= 2 ? 'md:border-t md:border-border md:pt-12' : ''}`}>
                     {idx % 2 !== 0 && (
                       <div className="hidden md:block absolute left-[-24px] top-0 bottom-0 w-[1px] bg-border" />
                     )}
                     {idx > 0 && idx < 2 && (
                       <div className="block md:hidden border-t border-border pt-12" />
                     )}
                     {idx > 1 && (
                       <div className="block md:hidden border-t border-border pt-12 mt-2" />
                     )}
                     
                     <Link href={`/article/${article.id}`} className="group block mb-5">
                       <div className="relative aspect-[16/9] w-full mb-6 bg-muted">
                          <Image src={getImageUrl(article)} fill className="object-cover group-hover:opacity-95 transition-opacity" alt="Article image" />
                       </div>
                       <div className="font-sans text-[10px] font-bold uppercase text-muted-foreground mb-3 tracking-widest">
                         {article.categories?.name || 'News'} • {formatDistanceToNow(new Date(article.published_at))}
                       </div>
                       <h3 className="font-serif text-2xl font-bold leading-snug mb-3 text-foreground group-hover:text-foreground/80 transition-colors">
                         {article.title}
                       </h3>
                       <div className="font-serif text-foreground/80 text-sm leading-relaxed line-clamp-3 prose dark:prose-invert prose-p:my-0 prose-a:text-foreground">
                         {parse(DOMPurify.sanitize(article.content))}
                       </div>
                     </Link>
                     
                     <div className="mt-auto flex items-center justify-between font-sans text-[10px] uppercase font-bold border-t border-border/40 pt-4">
                       <span>BY {article.type === 'exclusive' ? 'LOCAL' : article.sources?.name}</span>
                       <BookmarkButton articleId={article.id} initialIsSaved={savedArticleIds.includes(article.id)} />
                     </div>
                  </article>
                ))}
              </div>
            </div>

            {/* Sidebar Area (4 cols) */}
            {sidebarArticles.length > 0 && (
              <div className="lg:col-span-4 xl:col-span-3 border-t-2 lg:border-t-0 lg:border-l border-border pt-12 lg:pt-0 lg:pl-12 xl:pl-16 flex flex-col mt-16 lg:mt-0">
                 <div className="font-sans text-sm font-black uppercase border-b-2 border-foreground pb-2 mb-8 tracking-widest flex items-center justify-between text-foreground">
                   <span>The Latest</span>
                 </div>
                 
                 <div className="flex flex-col divide-y divide-border">
                   {sidebarArticles.map(article => (
                      <article key={article.id} className="py-6 first:pt-0 flex flex-col">
                         <div className="font-sans text-[10px] font-bold uppercase text-muted-foreground mb-1.5 tracking-widest flex items-center justify-between">
                           <span>{article.categories?.name || 'News'}</span>
                           <span className="text-muted-foreground/80">{formatDistanceToNow(new Date(article.published_at))}</span>
                         </div>
                         <Link href={`/article/${article.id}`} className="group">
                           <h3 className="font-serif text-[1.15rem] font-bold leading-[1.3] mb-3 text-foreground group-hover:text-foreground/80 transition-colors">
                             {article.title}
                           </h3>
                         </Link>
                         <div className="flex items-center justify-between text-[10px] font-sans font-bold uppercase mt-2">
                           <span className="text-foreground/70">VIA {article.type === 'exclusive' ? 'LOCAL' : article.sources?.name}</span>
                           <BookmarkButton articleId={article.id} initialIsSaved={savedArticleIds.includes(article.id)} />
                         </div>
                      </article>
                   ))}
                 </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Grid (More News) */}
      {bottomArticles.length > 0 && articles.length > 0 && (
        <div className="mt-16 pt-12 border-t border-border">
           <div className="font-sans text-sm font-black uppercase border-b border-foreground pb-2 mb-8 tracking-widest text-foreground inline-block">
             More News
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
             {bottomArticles.map((article, idx) => (
                <article key={article.id} className={`flex flex-col relative ${idx !== 0 ? 'sm:border-l sm:border-border sm:pl-8' : ''} ${idx % 4 !== 0 ? 'lg:border-l lg:border-border lg:pl-8' : 'lg:border-l-0 lg:pl-0'}`}>
                   <Link href={`/article/${article.id}`} className="group block mb-4">
                     <div className="font-sans text-[10px] font-bold uppercase text-muted-foreground mb-3 tracking-widest">
                       {article.categories?.name || 'News'}
                     </div>
                     <h3 className="font-serif text-lg font-bold leading-snug mb-3 text-foreground group-hover:text-foreground/80 transition-colors">
                       {article.title}
                     </h3>
                     <div className="font-serif text-foreground/70 text-sm leading-relaxed line-clamp-3 prose dark:prose-invert prose-p:my-0 prose-a:text-foreground">
                       {parse(DOMPurify.sanitize(article.content))}
                     </div>
                   </Link>
                   <div className="mt-auto flex items-center justify-between font-sans text-[10px] uppercase font-bold border-t border-border/40 pt-4">
                     <span className="text-muted-foreground">{formatDistanceToNow(new Date(article.published_at))}</span>
                     <BookmarkButton articleId={article.id} initialIsSaved={savedArticleIds.includes(article.id)} />
                   </div>
                </article>
             ))}
           </div>
        </div>
      )}
    </div>
  );
}
