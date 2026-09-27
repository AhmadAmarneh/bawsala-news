import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { createClient } from '@/lib/supabase/server';

const parser = new Parser();

export async function GET(request: Request) {
  // Add authentication or a secret token check here if it's a real cron job
  // For now, we will just run it

  const supabase = await createClient();

  try {
    // 1. Fetch active sources
    const { data: sources, error: sourcesError } = await supabase
      .from('sources')
      .select('id, rss_url')
      .eq('is_active', true);

    if (sourcesError) throw sourcesError;

    if (!sources || sources.length === 0) {
      return NextResponse.json({ message: 'No active sources found' }, { status: 200 });
    }

    let insertedCount = 0;

    // 2. Fetch and parse RSS for each source
    for (const source of sources) {
      try {
        const feed = await parser.parseURL(source.rss_url);

        for (const item of feed.items) {
          // Check if article already exists
          const { data: existing } = await supabase
            .from('articles')
            .select('id')
            .eq('original_url', item.link)
            .single();

          if (!existing) {
            // Insert new article
            await supabase.from('articles').insert({
              title: item.title || 'Untitled',
              content: item.contentSnippet || item.content || '',
              type: 'aggregated',
              source_id: source.id,
              original_url: item.link,
              published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString()
            });
            insertedCount++;
          }
        }
      } catch (err) {
        console.error(`Error fetching RSS for source ${source.id}:`, err);
        // Continue to the next source
      }
    }

    return NextResponse.json({ message: `Successfully fetched news. Inserted ${insertedCount} articles.` }, { status: 200 });

  } catch (error: any) {
    console.error('Error in cron job:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
