// Generates client/src/data/catalogImages.json from the built image map
// (server/scripts/catalogImages.map.json) after asserting that every catalog
// node has exactly one mapping. The client never guesses: the JSON is the
// single source of truth for which public_id path each node renders.
//
// Usage: node scripts/generateClientImages.mjs   (run from server/)
import fs from 'node:fs';
import { buildNodes } from './lib/catalogNodes.mjs';

const MAP_PATH = new URL('./catalogImages.map.json', import.meta.url);
const OUT_PATH = new URL('../../client/src/data/catalogImages.json', import.meta.url);

if (!fs.existsSync(MAP_PATH)) {
  console.error('catalogImages.map.json not found — run scripts/buildCatalogImageMap.mjs first');
  process.exit(1);
}

const map = JSON.parse(fs.readFileSync(MAP_PATH, 'utf8'));
const { nodes } = buildNodes();

const missing = nodes.filter((n) => !map[n.key]);
if (missing.length) {
  console.error(`[MISSING IMAGE] ${missing.length} catalog node(s) have no mapping:`);
  for (const n of missing) console.error(`  ${n.level}: ${n.key}  (${n.label || n.main})`);
  process.exit(1);
}

const mains = {};
const categories = {};
const subcategories = {};
const services = {};

for (const node of nodes) {
  if (node.level === 'main') mains[node.key.split('/').pop()] = node.key;
  else if (node.level === 'category')
    categories[node.key.replace(/^odforce\/categories\//, '')] = node.key;
  else if (node.level === 'subcategory')
    subcategories[node.key.replace(/^odforce\/subcategories\//, '')] = node.key;
  else services[node.key.replace(/^odforce\/services\//, '')] = node.key;
}

const hero = map['odforce/hero/main'];
const odf = {
  hero: map['odforce/odf-for-job/odf-hero'],
  team: map['odforce/odf-for-job/odf-team'],
  worker: map['odforce/odf-for-job/odf-worker'],
};
const defaultId = map['odforce/ui/default'];
for (const [label, entry] of [
  ['hero/main', hero],
  ['odf-for-job/odf-hero', odf.hero],
  ['odf-for-job/odf-team', odf.team],
  ['odf-for-job/odf-worker', odf.worker],
  ['ui/default', defaultId],
]) {
  if (!entry) {
    console.error(`[MISSING IMAGE] UI asset odforce/${label} is not in the map`);
    process.exit(1);
  }
}

const out = {
  mains,
  categories,
  subcategories,
  services,
  hero: {
    main: map['odforce/hero/main'] && map['odforce/hero/main'].key ? undefined : 'odforce/hero/main',
    thumbElectrician: 'odforce/hero/thumb-electrician',
    thumbFacial: 'odforce/hero/thumb-facial',
  },
  odfForJob: {
    hero: 'odforce/odf-for-job/odf-hero',
    team: 'odforce/odf-for-job/odf-team',
    worker: 'odforce/odf-for-job/odf-worker',
  },
  default: 'odforce/ui/default',
};
delete out.hero.main;
out.hero.main = 'odforce/hero/main';

fs.writeFileSync(OUT_PATH, `${JSON.stringify(out, null, 2)}\n`);

console.log('client/src/data/catalogImages.json generated');
console.log(`  mains:        ${Object.keys(mains).length}`);
console.log(`  categories:   ${Object.keys(categories).length}`);
console.log(`  subcategories:${Object.keys(subcategories).length}`);
console.log(`  services:     ${Object.keys(services).length}`);
