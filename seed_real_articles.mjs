import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import Parser from 'rss-parser';
import * as cheerio from 'cheerio';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

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

async function run() {
  console.log('Starting fetch...');
  const { data: sources } = await supabase.from('sources').select('id, rss_url').eq('is_active', true);
  
  if (!sources) return console.log('No sources');

  for (const source of sources) {
    try {
      console.log('Fetching source:', source.rss_url);
      const feed = await parser.parseURL(source.rss_url);
      let count = 0;
      for (const item of feed.items) {
        if (count >= 5) break; // just fetch 5 per source for a quick test/seed
        
        const { data: existing } = await supabase.from('articles').select('id').eq('original_url', item.link).single();
        if (existing) {
          console.log('Exists:', item.title);
          continue;
        }

        let extractedImage = null;
        if (item.mediaContent && item.mediaContent['$'] && item.mediaContent['$'].url) {
          extractedImage = item.mediaContent['$'].url;
        } else if (item.mediaThumbnail && item.mediaThumbnail['$'] && item.mediaThumbnail['$'].url) {
          extractedImage = item.mediaThumbnail['$'].url;
        } else if (item.enclosure && item.enclosure.url) {
          extractedImage = item.enclosure.url;
        } else if (item.image && typeof item.image === 'string') {
          extractedImage = item.image;
        } else if (item.image && item.image.url) {
          extractedImage = item.image.url;
        } else if (item.link) {
          try {
            console.log('Scraping HTML for:', item.link);
            const res = await fetch(item.link, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(5000) });
            if (res.ok) {
              const html = await res.text();
              const $ = cheerio.load(html);
              const ogImage = $('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content');
              if (ogImage) extractedImage = ogImage;
            }
          } catch(e) {}
        }

        console.log(`Inserting: ${item.title} | Image: ${extractedImage}`);
        await supabase.from('articles').insert({
          title: item.title || 'Untitled',
          content: item.contentSnippet || item.content || '',
          type: 'aggregated',
          source_id: source.id,
          original_url: item.link,
          image_url: extractedImage,
          published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString()
        });
        count++;
      }
    } catch (e) {
      console.log('Error source:', source.rss_url, e.message);
    }
  }
  console.log('Done!');
}
run();
