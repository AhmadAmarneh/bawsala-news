import Parser from 'rss-parser';
const parser = new Parser(); // default

async function run() {
  const feed = await parser.parseURL('https://moxie.foxnews.com/google-publisher/latest.xml');
  console.log(feed.items[0].enclosure);
}
run();
