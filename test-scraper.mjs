async function run() {
  const url = 'https://techcrunch.com/2026/09/28/source-inference-provider-modal-labs-closing-in-on-750m-round-at-15-75b-valuation/';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) || 
                       html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  console.log("ogImageMatch:", ogImageMatch?.[1]);
}
run();
