import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import { BookmarkButton } from '@/components/BookmarkButton';

export default async function HomePage() {
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

  const { data: articles, error } = await supabase
    .from('articles')
    .select('*, sources(name)')
    .order('published_at', { ascending: false })
    .limit(20);

  return (
    <div className="space-y-12">
      <section className="text-center py-16 bg-slate-900 rounded-2xl text-white shadow-lg mx-4 mt-8">
        <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Your Daily Compass</h2>
        <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">Discover exclusive local stories and the best aggregated news from around the web, tailored just for you.</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
        {articles?.map((article) => {
          const isSaved = savedArticleIds.includes(article.id);
          return (
            <Card key={article.id} className={`flex flex-col overflow-hidden transition-all hover:shadow-md ${article.type === 'exclusive' ? 'border-t-4 border-t-blue-600' : 'border-t-4 border-t-slate-300'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-3">
                  {article.type === 'exclusive' ? (
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
                      Local/Exclusive
                    </span>
                  ) : (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 flex items-center gap-1">
                      Via {article.sources?.name || 'External'}
                    </span>
                  )}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">
                      {new Date(article.published_at).toLocaleDateString()}
                    </span>
                    <BookmarkButton articleId={article.id} initialIsSaved={isSaved} />
                  </div>
                </div>
                <CardTitle className="text-xl leading-tight line-clamp-2 pr-2">
                  <a href={article.type === 'exclusive' ? `/article/${article.id}` : article.original_url} target={article.type === 'aggregated' ? "_blank" : "_self"} className="hover:text-blue-600 transition-colors">
                    {article.title}
                  </a>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col">
                <div 
                  className="text-slate-600 text-sm line-clamp-3 mb-6 flex-grow prose prose-sm max-w-none" 
                  dangerouslySetInnerHTML={{ __html: article.content }} 
                />
                <a href={article.type === 'exclusive' ? `/article/${article.id}` : article.original_url} target={article.type === 'aggregated' ? "_blank" : "_self"} className="w-full mt-auto inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-slate-100 hover:text-slate-900 h-10 px-4 py-2 transition-colors">
                  {article.type === 'exclusive' ? 'Read Story' : (
                    <>
                      Read on Source
                      <ExternalLink className="w-4 h-4 ml-2 opacity-50" />
                    </>
                  )}
                </a>
              </CardContent>
            </Card>
          );
        })}
        {(!articles || articles.length === 0) && (
          <div className="col-span-full text-center py-20 text-slate-500 bg-slate-50 rounded-lg border border-dashed">
            No articles found. Run the aggregator or write some exclusive news!
          </div>
        )}
      </div>
    </div>
  );
}
