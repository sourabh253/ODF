// Uploads every catalog/UI image to Cloudinary using the existing config
// (server/config/cloudinary.js + CLOUDINARY_* env vars). Sources are remote
// Unsplash/Pexels URLs; nothing is read from the local filesystem.
// Usage: node scripts/uploadCatalogImages.js   (run from server/)
import fs from 'node:fs';
import cloudinary from '../config/cloudinary.js';

const P = (id) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg`;
const U = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1600&q=80`;

const SOURCES = {
  // --- migrated from the previous Unsplash/Pexels direct URLs ---
  windowCleaning: U('1581578731548-c64695cc6952'),
  windowCleanerSilhouette: U('1615873968403-89e068629265'),
  electricianPanel: U('1621905251189-08b45d6a269e'),
  electricianHelmet: U('1621905252507-b35492cc74b4'),
  barbershop: U('1560066984-138dadb4c035'),
  massage: U('1544161515-4ab6ce6db874'),
  manicure: U('1487412947147-5cebf100ffc2'),
  makeup: U('1604654894610-df63bc536371'),
  carpenterDrill: U('1504148455328-c376907d081c'),
  craftsmanTools: U('1558618666-fcd25c85cd64'),
  kitchen: U('1556911220-bff31c812dba'),
  bathroom: U('1584622650111-993a426fbf0a'),
  gloves: U('1585421514738-01798e348b17'),
  sprayBottle: U('1628177142898-93e36e4e3a50'),
  bedroom: U('1615874959474-d609969a20ed'),
  livingRoom: U('1607400201515-c2c41c07d307'),
  sofaRoom: U('1493663284031-b7e3aefcae8e'),
  vacuumCarpet: U('1527515637462-cff94eecc1ac'),
  bedLinen: U('1616627561950-9f746e330187'),
  washingMachineRoom: U('1626806787461-102c1bfaaea1'),
  washerDrum: U('1610557892470-55d9e80c0bce'),
  faucet: U('1585704032915-c3400ca199e7'),
  refrigerator: U('1571175443880-49e1d25b2bc5'),
  longHair: U('1522337360788-8b13dee7a37e'),
  hairWash: U('1595476108010-b4d1f102b1b1'),
  facialMask: U('1570172619644-dfd03ed5d881'),
  facialTreatment: U('1512290923902-8a9f81dc236c'),
  waterGlass: U('1548839140-29a749e1cf4d'),
  microwave: U('1585659722983-3a675dabf23d'),
  dishwasher: U('1581622558663-b2e33377dfb2'),
  houseExterior: U('1600585154340-be6161a56a0c'),
  acUnits: P('18725613'),
  pestControl: P('11654274'),

  // --- new distinct topical images (picks verified by description + spot-view) ---
  acServiceRepair: P('5463575'),
  acInstallation: P('7347538'),
  chimney: P('12119355'),
  geyser: P('6436774'),
  chairCleaning: P('27176673'),
  beardShaving: P('2521978'),
  groomingPackages: P('7781844'),
  hairBeardCombo: P('7518707'),
  haircut: P('19664889'),
  headMassage: P('6628689'),
  hairStyling: P('3993290'),
  bridal: P('37710473'),
  hairRemoval: P('6763621'),
  spaMassage: P('6187652'),
  carpenterDoorWindow: P('5691498'),
  drillingInstallation: P('7218567'),
  furnitureAssembly: P('4554417'),
  furnitureRepair: P('31567147'),
  doorbell: P('8550100'),
  electricalAppliances: P('34734504'),
  electricalInspection: P('35154098'),
  ceilingFan: P('38697833'),
  inverterStabilizer: P('39057090'),
  lights: P('4792521'),
  switchesSockets: P('14681225'),
  wiringRepair: P('5767595'),
  bathroomPlumbing: P('32588548'),
  pipesLeakage: P('36571568'),
  sinkPlumbing: P('7220892'),
  toilet: P('27924620'),
  waterSupply: P('29248902'),
  cleaningTeam: P('6195274'),
  hairBlowDry: P('14615063'),
  plumberRadiator: P('29226620'),
  applianceRepair: P('38190070'),
  odfHero: P('16552847'),
  odfTeam: P('1181738'),
  odfWorker: P('6474460'),
};

const FOLDER = 'odforce/catalog';
const results = {};
const failures = [];

for (const [key, url] of Object.entries(SOURCES)) {
  try {
    const r = await cloudinary.uploader.upload(url, {
      folder: FOLDER,
      public_id: key,
      overwrite: true,
      resource_type: 'image',
      transformation: [{ width: 1600, height: 1600, crop: 'limit', quality: 'auto' }],
      invalidate: true,
    });
    results[key] = r.public_id;
    console.log(`OK   ${key.padEnd(24)} ${r.width}x${r.height}  ${r.public_id}`);
  } catch (e) {
    failures.push({ key, error: e.message });
    console.log(`FAIL ${key.padEnd(24)} ${e.message}`);
  }
}

fs.writeFileSync(new URL('./catalogImages.manifest.json', import.meta.url), JSON.stringify(results, null, 2));
console.log(`\nUploaded ${Object.keys(results).length}/${Object.keys(SOURCES).length}`);
if (failures.length) {
  console.log('Failures:', JSON.stringify(failures, null, 2));
  process.exit(1);
}
