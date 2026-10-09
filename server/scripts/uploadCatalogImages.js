// Uploads every catalog/UI image to Cloudinary using the existing config
// (server/config/cloudinary.js + CLOUDINARY_* env vars).
//
// Sources come from scripts/catalogImages.map.json (produced by
// scripts/buildCatalogImageMap.mjs), so every catalog node's photo is pushed
// to its own stable public_id path:
//
//   odforce/main-categories/<main>
//   odforce/categories/<main>/<category>
//   odforce/subcategories/<main>/<category>/<subcategory>
//   odforce/services/<main>/<category>/<subcategory>/<service>
//   odforce/hero/...   odforce/odf-for-job/...   odforce/ui/...
//
// Usage: node scripts/uploadCatalogImages.js [--force]   (run from server/)
import fs from 'node:fs';
import cloudinary from '../config/cloudinary.js';

const MAP_PATH = new URL('./catalogImages.map.json', import.meta.url);
const MANIFEST_PATH = new URL('./catalogImages.manifest.json', import.meta.url);
const FORCE = process.argv.includes('--force');

if (!fs.existsSync(MAP_PATH)) {
  console.error('catalogImages.map.json not found — run scripts/buildCatalogImageMap.mjs first');
  process.exit(1);
}

const map = JSON.parse(fs.readFileSync(MAP_PATH, 'utf8'));
const manifest = fs.existsSync(MANIFEST_PATH)
  ? JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'))
  : {};

const keys = Object.keys(map).sort();
const failures = [];
let uploaded = 0;
let skipped = 0;

const writeManifest = () => {
  const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(sorted, null, 2));
};

for (const key of keys) {
  const entry = map[key];
  if (!FORCE && manifest[key] && manifest[key].source === entry.url) {
    skipped += 1;
    continue;
  }
  try {
    const r = await cloudinary.uploader.upload(entry.url, {
      public_id: key,
      overwrite: true,
      resource_type: 'image',
      transformation: [{ width: 1600, height: 1600, crop: 'limit', quality: 'auto' }],
      invalidate: true,
    });
    manifest[key] = { public_id: r.public_id, source: entry.url, width: r.width, height: r.height };
    uploaded += 1;
    console.log(`OK   ${key.padEnd(95)} ${r.width}x${r.height}`);
    writeManifest();
  } catch (e) {
    failures.push({ key, source: entry.url, error: e.message });
    console.log(`FAIL ${key.padEnd(95)} ${e.message}`);
  }
}

writeManifest();
console.log(`\nUploaded ${uploaded}, skipped ${skipped}, failed ${failures.length} (total ${keys.length})`);
if (failures.length) {
  console.log('Failures:', JSON.stringify(failures, null, 2));
  process.exit(1);
}
