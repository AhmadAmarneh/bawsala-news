import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { createClient } from '@/lib/supabase/server';

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['enclosure', 'enclosure'],
      ['image', 'image']
    ]
  }
});

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
            // Attempt to extract image URL from various RSS formats
            let extractedImage = null;
            if (item.mediaContent && item.mediaContent['$'] && item.mediaContent['$'].url) {
              extractedImage = item.mediaContent['$'].url;
            } else if (item.mediaThumbnail && item.mediaThumbnail['$'] && item.mediaThumbnail['$'].url) {
              extractedImage = item.mediaThumbnail['$'].url;
            } else if (item.enclosure && item.enclosure.url) {
              extractedImage = item.enclosure.url;
            } else if (item.image && item.image.url) {
              extractedImage = item.image.url;
            } else {
              // Try to find an img tag in the content as a last resort
              const imgMatch = (item.content || '').match(/<img[^>]+src="([^">]+)"/);
              if (imgMatch) extractedImage = imgMatch[1];
            }

            // Insert new article
            await supabase.from('articles').insert({
              title: item.title || 'Untitled',
              content: item.contentSnippet || item.content || '',
              type: 'aggregated',
              source_id: source.id,
              original_url: item.link,
              image_url: extractedImage,
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

  } catch (error: unknown) {
    console.error('Error in cron job:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
