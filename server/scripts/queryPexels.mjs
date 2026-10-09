// Prints top Pexels candidates (id + alt) for ad-hoc queries, to hand-pick
// photos for nodes whose automated query matched the wrong topic.
// Usage: node scripts/queryPexels.mjs "query one" "query two" ...
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const fetchPage = async (query, page = 1) => {
  const base = `https://www.pexels.com/search/${encodeURIComponent(query)}/`;
  const url = page === 1 ? base : `${base}?page=${page}`;
  const { stdout: html } = await execFileAsync(
    'curl',
    ['-sL', '--max-time', '30', '-H', `User-Agent: ${UA}`, '-H', 'Accept-Language: en-US,en;q=0.9', url],
    { maxBuffer: 32 * 1024 * 1024 }
  );
  const results = [];
  const seen = new Set();
  for (const tag of html.match(/<img\b[^>]*>/g) || []) {
    const idMatch = tag.match(/\/photos\/(\d+)\//);
    if (!idMatch || seen.has(idMatch[1])) continue;
    const srcMatch = tag.match(/src="(https:\/\/images\.pexels\.com\/photos\/[^"]+)"/);
    if (!srcMatch) continue;
    seen.add(idMatch[1]);
    const altMatch = tag.match(/alt="([^"]*)"/);
    results.push({ id: idMatch[1], alt: altMatch ? altMatch[1].slice(0, 100) : '' });
  }
  return results;
};

for (const query of process.argv.slice(2)) {
  const results = await fetchPage(query);
  console.log(`\n=== "${query}" (${results.length}) ===`);
  for (const r of results.slice(0, 14)) console.log(`  ${r.id.padEnd(12)} ${r.alt}`);
}
