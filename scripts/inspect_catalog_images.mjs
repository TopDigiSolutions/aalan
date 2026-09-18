import fs from 'fs';

const catalog = JSON.parse(fs.readFileSync('./shared/catalog.json', 'utf-8'));

async function inspectAll() {
  for (const item of catalog) {
    const url = item.image;
    // Unsplash photo id usually starts with photo-
    const match = url.match(/(photo-[0-9a-fA-F-]+)/);
    if (!match) {
      console.log(`[${item.id}] "${item.name}" (${item.category}): no photo id in ${url}`);
      continue;
    }
    const photoId = match[1];
    try {
      const res = await fetch(`https://unsplash.com/photos/${photoId}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      const html = await res.text();
      const titleMatch = html.match(/<title>([^<]+)<\/title>/);
      const title = titleMatch ? titleMatch[1].replace(' | Unsplash', '').trim() : 'Unknown';
      console.log(`[${item.id}] [${item.category}] Expected: "${item.name}" => Photo title: "${title}"`);
    } catch (err) {
      console.log(`[${item.id}] ERROR: ${err.message}`);
    }
  }
}

inspectAll();
