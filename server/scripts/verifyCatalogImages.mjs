// Verifies the client image map against the live catalog:
//  1. every category / differing subcategory / main category / hero image resolves
//  2. no two catalog entries share the same image URL (no duplicate stock photos)
//  3. every delivered URL returns HTTP 200 with a display-sized transformation
// Usage: node scripts/verifyCatalogImages.mjs   (run from server/)
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptsDir = fileURLToPath(new URL('.', import.meta.url));
const clientImages = await import(
  pathToFileURL(join(scriptsDir, '../../client/src/data/serviceImages.js')).href
);
const { getCategoryImage, getMainCategoryImage, getServiceImage, HERO_IMAGES } = clientImages;

const tree = await (await fetch('http://localhost:5000/api/catalog/tree')).json();
const byMain = tree.tree || tree;

const entries = [];
for (const [main, categories] of Object.entries(byMain)) {
  entries.push({ label: `MAIN ${main}`, url: getMainCategoryImage(main) });
  for (const [category, subs] of Object.entries(categories)) {
    entries.push({ label: `CAT  ${category}`, url: getCategoryImage(category) });
    for (const sub of Object.keys(subs)) {
      if (sub !== category) {
        entries.push({ label: `SUB  ${category} / ${sub}`, url: getServiceImage({ category, subCategory: sub, mainCategory: main }) });
      }
    }
  }
}
entries.push({ label: 'HERO main', url: HERO_IMAGES.main });
entries.push({ label: 'HERO thumb0', url: HERO_IMAGES.thumbs[0] });
entries.push({ label: 'HERO thumb1', url: HERO_IMAGES.thumbs[1] });

const seen = new Map();
const seenLabels = new Set();
const duplicates = [];
for (const e of entries) {
  if (seenLabels.has(e.label)) continue; // same category reachable via two main categories
  seenLabels.add(e.label);
  if (seen.has(e.url)) duplicates.push(`${e.label} == ${seen.get(e.url)}`);
  else seen.set(e.url, e.label);
}

const badUrls = [];
for (const [url, label] of seen) {
  if (!url.includes('res.cloudinary.com')) badUrls.push(`${label}: not cloudinary -> ${url}`);
  if (!/w_\d+,h_\d+,c_fill,q_auto,f_auto/.test(url)) badUrls.push(`${label}: missing transform -> ${url}`);
  const res = await fetch(url, { method: 'HEAD' });
  if (res.status !== 200) badUrls.push(`${label}: HTTP ${res.status}`);
}

console.log(`Checked ${entries.length} catalog entries, ${seen.size} unique URLs`);
console.log(`Duplicates: ${duplicates.length ? '\n  ' + duplicates.join('\n  ') : 'none'}`);
console.log(`Bad URLs: ${badUrls.length ? '\n  ' + badUrls.join('\n  ') : 'none'}`);
process.exit(duplicates.length || badUrls.length ? 1 : 0);
