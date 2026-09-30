import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['enclosure', 'enclosure'],
      ['image', 'image'],
      ['content:encoded', 'content:encoded']
    ]
  }
});

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    console.error("[Fetch-News] CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing from environment variables.");
    return NextResponse.json(
      { error: 'Server misconfiguration: Service role key is missing.' },
      { status: 500 }
    );
  }

  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey
  );

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
            } else if (item.image && typeof item.image === 'string') {
              extractedImage = item.image;
            } else {
              // Try to find an img tag in the content as a last resort
              const contentToSearch = item['content:encoded'] || item.content || '';
              const imgMatch = contentToSearch.match(/<img[^>]+src=["']([^"']+)["']/i);
              
              if (imgMatch) {
                extractedImage = imgMatch[1];
              } else if (item.link) {
                // Fallback: Fetch the original article and scrape og:image or twitter:image
                try {
                  console.log(`[Fetch-News] Fetching HTML for missing image: ${item.link}`);
                  const articleRes = await fetch(item.link, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(8000) });
                  if (articleRes.ok) {
                    const html = await articleRes.text();
                    const cheerio = require('cheerio');
                    const $ = cheerio.load(html);
                    
                    const ogImage = $('meta[property="og:image"]').attr('content') || 
                                    $('meta[name="twitter:image"]').attr('content');
                                    
                    if (ogImage) {
                      extractedImage = ogImage;
                    }
                  } else {
                    console.log(`[Fetch-News] Failed to fetch HTML, status: ${articleRes.status}`);
                  }
                } catch (e) {
                  console.error(`[Fetch-News] Error scraping og:image for ${item.link}:`, e instanceof Error ? e.message : e);
                }
              }
            }

            console.log(`[Fetch-News] Image found for '${item.title}': ${extractedImage || 'NULL'}`);

            // Insert new article
            const { error: insertError } = await supabase.from('articles').insert({
              title: item.title || 'Untitled',
              content: item.contentSnippet || item.content || '',
              type: 'aggregated',
              source_id: source.id,
              original_url: item.link,
              image_url: extractedImage,
              published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString()
            });
            
            if (insertError) {
              console.error(`[Fetch-News] Supabase Insert Error for '${item.title}':`, insertError.message || insertError);
            } else {
              insertedCount++;
            }
          } else {
            console.log(`[Fetch-News] Skipping already existing article: ${item.title}`);
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
