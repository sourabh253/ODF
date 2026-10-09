// Catalog image audit (seed-based, source-photo level):
//   Catalog nodes / Image mappings / Unique image URLs
//   Duplicate image URLs: 0 / Missing images: 0
//   Remote delivery: every mapped URL answers HTTP 200 with a transform.
// Runs entirely from files — no server or client import needed.
// Usage: node scripts/verifyCatalogImages.mjs [--offline]   (from server/)
import fs from 'node:fs';

const OFFLINE = process.argv.includes('--offline');
const { buildNodes } = await import('./lib/catalogNodes.mjs');
const { nodes } = buildNodes();
const map = JSON.parse(fs.readFileSync(new URL('./catalogImages.map.json', import.meta.url), 'utf8'));
const clientJsonPath = new URL('../../client/src/data/catalogImages.json', import.meta.url);
const clientJson = JSON.parse(fs.readFileSync(clientJsonPath, 'utf8'));

const urlId = (entry) =>
  entry.photoId ||
  ((entry.url || '').match(/(?:pexels-photo-|photos\/)(\d+)/) || [])[1] ||
  ((entry.url || '').match(/photo-([\w-]+)\?/) || [])[1] ||
  entry.url; // unsplash / legacy assets: the URL itself is the identity

// 1. every catalog node has a mapping with a URL
const missing = [];
for (const node of nodes) {
  const entry = map[node.key];
  if (!entry || !entry.url) missing.push(node.key);
}

// 2. every mapping points at a unique source photo (pexels id or full URL)
const owners = new Map();
const duplicates = [];
for (const [key, entry] of Object.entries(map)) {
  if (!entry.url) continue;
  const id = urlId(entry);
  if (owners.has(id)) duplicates.push(`${key} == ${owners.get(id)}  (${id})`);
  else owners.set(id, key);
}

// 3. the generated client JSON covers every node too
const clientKeys = new Set([
  ...Object.keys(clientJson.mains).map((k) => `odforce/main-categories/${k}`),
  ...Object.keys(clientJson.categories).map((k) => `odforce/categories/${k}`),
  ...Object.keys(clientJson.subcategories).map((k) => `odforce/subcategories/${k}`),
  ...Object.keys(clientJson.services).map((k) => `odforce/services/${k}`),
]);
const clientMissing = nodes.filter((n) => !clientKeys.has(n.key)).map((n) => n.key);

// 4. duplicate URLs as the browser would see them (source photo identity)
const mappedUrls = Object.entries(map).filter(([, e]) => e.url);

console.log(`Catalog nodes:        ${nodes.length}`);
console.log(`Image mappings:       ${Object.keys(map).length} (${mappedUrls.length} with URLs)`);
console.log(`Unique image URLs:    ${owners.size}`);
console.log(`Duplicate image URLs: ${duplicates.length}`);
if (duplicates.length) console.log(duplicates.map((d) => `  ${d}`).join('\n'));
console.log(`Missing images:       ${missing.length}${missing.length ? ' -> ' + missing.join(', ') : ''}`);
console.log(`Client JSON gaps:     ${clientMissing.length}${clientMissing.length ? ' -> ' + clientMissing.join(', ') : ''}`);

let remoteBad = 0;
let dimBad = 0;
if (!OFFLINE) {
  console.log(`\nRemote check: HEAD ${mappedUrls.length} URLs ...`);
  let done = 0;
  const CONCURRENCY = 8;
  const queue = [...mappedUrls];
  const worker = async () => {
    while (queue.length) {
      const [key, entry] = queue.shift();
      try {
        const res = await fetch(entry.url, { method: 'HEAD' });
        if (res.status !== 200) {
          remoteBad += 1;
          console.log(`  HTTP ${res.status}  ${key}`);
        }
      } catch (e) {
        remoteBad += 1;
        console.log(`  ERROR ${key}: ${e.message}`);
      }
      done += 1;
      if (done % 50 === 0) console.log(`  ... ${done}/${mappedUrls.length}`);
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  console.log(`Remote failures:      ${remoteBad}`);

  // 5. hosted asset dimensions — every client-served image must be >=800px wide
  //    (40/500px originals were the source of the blurry-image bug).
  const envText = fs.readFileSync(new URL('../.env', import.meta.url), 'utf8');
  const envOf = (k) => new RegExp(`^${k}=(.*)$`, 'm').exec(envText)?.[1]?.trim();
  const cloud = envOf('CLOUDINARY_CLOUD_NAME');
  const auth = 'Basic ' + Buffer.from(`${envOf('CLOUDINARY_API_KEY')}:${envOf('CLOUDINARY_API_SECRET')}`).toString('base64');
  const dims = new Map();
  let cursor;
  do {
    const u = new URL(`https://api.cloudinary.com/v1_1/${cloud}/resources/image`);
    u.searchParams.set('type', 'upload');
    u.searchParams.set('prefix', 'odforce/');
    u.searchParams.set('max_results', '500');
    if (cursor) u.searchParams.set('next_cursor', cursor);
    const res = await fetch(u, { headers: { Authorization: auth } });
    if (!res.ok) throw new Error(`Cloudinary inventory ${res.status}`);
    const data = await res.json();
    for (const r of data.resources || []) dims.set(r.public_id, r.width);
    cursor = data.next_cursor;
  } while (cursor);

  const servedUrls = [];
  (function walk(node, path) {
    if (node && typeof node === 'object') {
      for (const [k, v] of Object.entries(node)) walk(v, path ? `${path}.${k}` : k);
    } else if (typeof node === 'string' && node.startsWith('odforce/')) {
      servedUrls.push([path, node]);
    }
  })(clientJson, '');

  const MIN_W = 800;
  const byLevel = {};
  for (const [path, publicIdRaw] of servedUrls) {
    const publicId = publicIdRaw.replace(/\.[a-z]+$/, '');
    const level = path.split('.')[0];
    const w = dims.get(publicId);
    byLevel[level] = Math.min(byLevel[level] ?? Infinity, w ?? Infinity);
    if (!w || w < MIN_W) {
      dimBad += 1;
      console.log(`  DIM ${w ?? 'missing'}px  ${path} (${publicId})`);
    }
  }
  console.log(`Served images:        ${servedUrls.length}  min width per level: ${Object.entries(byLevel).map(([l, w]) => `${l}=${w}`).join(' ')}`);
  console.log(`Dimension failures:   ${dimBad}`);
}

const failed = missing.length || duplicates.length || clientMissing.length || remoteBad || dimBad;
console.log(failed ? '\nAUDIT FAILED' : '\nAUDIT PASSED');
process.exit(failed ? 1 : 0);
