import { createClient } from '@/lib/supabase/server';
import { ExternalLink, Clock } from 'lucide-react';
import { BookmarkButton } from '@/components/BookmarkButton';
import { NewsFilter } from '@/components/NewsFilter';
import { SidebarWidgets } from '@/components/SidebarWidgets';
import { ReadTimeBadge } from '@/components/ReadTimeBadge';
import { Suspense } from 'react';
import parse from 'html-react-parser';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import sanitizeHtml from 'sanitize-html';
import type { Article } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function HomePage(props: { searchParams: Promise<{ q?: string; category?: string; sort?: string }> }) {
  const searchParams = await props.searchParams;
  const q = searchParams?.q || '';
  const categoryId = searchParams?.category || '';
  const sort = searchParams?.sort || 'newest';

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
    .order('published_at', { ascending: sort === 'oldest' });

  if (q) {
    const safeQ = q.replace(/,/g, ' '); // Strip commas which break Supabase OR string syntax
    query = query.or(`title.ilike.%${safeQ}%,content.ilike.%${safeQ}%`);
  }
  
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const hasFilters = q !== '' || categoryId !== '' || sort === 'oldest';
  const { data: articles, error } = await query.limit(hasFilters ? 40 : 20);

  if (!articles || articles.length === 0) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-12 py-8 pb-20">
        <Suspense fallback={<div className="h-16 mb-8" />}>
          <NewsFilter categories={categories} />
        </Suspense>
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center py-20 text-muted-foreground bg-muted border border-dashed px-8 font-sans">
            No articles found. Try adjusting your search or filters!
          </div>
        </div>
      </div>
    );
  }

  if (hasFilters) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-12 py-8 pb-20">
        <div className="border-b-2 border-foreground pb-2 mb-6 flex justify-between items-end font-sans text-xs uppercase tracking-widest font-bold text-foreground">
          <div>Search Results</div>
          <div>{articles.length} {articles.length === 1 ? 'Result' : 'Results'} Found</div>
        </div>

        <Suspense fallback={<div className="h-16 mb-8" />}>
          <NewsFilter categories={categories} />
        </Suspense>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 mt-8">
           {articles.map((article, idx) => (
              <article key={article.id} className="flex flex-col relative group border-t border-border pt-6">
                 <Link href={`/article/${article.id}`} className="block mb-4">
                   {article.image_url && (
                     <div className="relative aspect-[4/3] w-full mb-4 bg-muted overflow-hidden">
                        <Image src={article.image_url} fill className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out" alt="Article image" />
                     </div>
                   )}
                   <div className="font-sans text-[10px] font-bold uppercase text-muted-foreground mb-3 tracking-widest">
                     {article.categories?.name || 'News'}
                   </div>
                   <h3 className="font-serif text-lg font-bold leading-snug mb-3 text-foreground group-hover:text-foreground/80 transition-colors">
                     {article.title}
                   </h3>
                   <div className="font-serif text-foreground/70 text-sm leading-relaxed line-clamp-3 prose dark:prose-invert prose-p:my-0 prose-a:text-foreground">
                     {parse(sanitizeHtml(article.content))}
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
    );
  }

  // Classic Editorial Layout
  const heroArticle = articles[0];
  const gridArticles = articles.slice(1, 5);
  const sidebarArticles = articles.slice(5, 11);
  const bottomArticles = articles.slice(11);

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-12 py-8 pb-20">
      <div className="border-b-2 border-foreground pb-2 mb-6 flex justify-between items-end font-sans text-xs uppercase tracking-widest font-bold text-foreground">
        <div>Vol. CLIII • No. 12</div>
        <div>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
      </div>

      <Suspense fallback={<div className="h-16 mb-8" />}>
        <NewsFilter categories={categories} />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-12 xl:gap-x-16">
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col">
          <article className="border-b border-border pb-12 mb-12 flex flex-col">
            <Link href={`/article/${heroArticle?.id}`} className="group block w-full mb-6">
               {heroArticle?.image_url && (
                 <div className="relative aspect-[16/9] w-full bg-muted mb-6">
                   <Image src={heroArticle.image_url} fill className="object-cover group-hover:opacity-95 transition-opacity" alt="Hero article image" priority />
                 </div>
               )}
               <div className="font-sans text-[11px] font-bold uppercase text-muted-foreground mb-4 tracking-widest flex items-center gap-3">
                 <span>{heroArticle?.categories?.name || 'News'} • {heroArticle ? formatDistanceToNow(new Date(heroArticle.published_at), { addSuffix: true }) : ''}</span>
                 {heroArticle && <ReadTimeBadge content={heroArticle.content} />}
               </div>
               <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6 text-foreground group-hover:opacity-80 transition-opacity">
                 {heroArticle?.title}
               </h2>
               <div className="font-serif text-foreground/90 text-xl leading-relaxed line-clamp-4 prose dark:prose-invert prose-p:my-0 prose-p:mb-2 prose-a:text-foreground">
                 {heroArticle ? parse(sanitizeHtml(heroArticle.content)) : null}
               </div>
            </Link>
            
            <div className="font-sans text-xs font-bold uppercase text-foreground flex items-center justify-between border-t border-border pt-4">
              <span className="flex items-center">
                BY {heroArticle?.type === 'exclusive' ? 'BAWSALA EXCLUSIVE' : heroArticle?.sources?.name}
              </span>
              {heroArticle && <BookmarkButton articleId={heroArticle.id} initialIsSaved={savedArticleIds.includes(heroArticle.id)} />}
            </div>
          </article>

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
                   {article.image_url && (
                     <div className="relative aspect-[16/9] w-full mb-6 bg-muted">
                        <Image src={article.image_url} fill className="object-cover group-hover:opacity-95 transition-opacity" alt="Article image" />
                     </div>
                   )}
                   <div className="font-sans text-[10px] font-bold uppercase text-muted-foreground mb-3 tracking-widest flex items-center gap-2">
                     <span>{article.categories?.name || 'News'} • {formatDistanceToNow(new Date(article.published_at))}</span>
                     <ReadTimeBadge content={article.content} />
                   </div>
                   <h3 className="font-serif text-2xl font-bold leading-snug mb-3 text-foreground group-hover:text-foreground/80 transition-colors">
                     {article.title}
                   </h3>
                   <div className="font-serif text-foreground/80 text-sm leading-relaxed line-clamp-3 prose dark:prose-invert prose-p:my-0 prose-a:text-foreground">
                     {parse(sanitizeHtml(article.content))}
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

             <div className="mt-8">
               <SidebarWidgets />
             </div>
          </div>
        )}
      </div>

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
                       {parse(sanitizeHtml(article.content))}
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
