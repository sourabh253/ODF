// Builds the complete catalog image map: one source photo per catalog node
// (main category / service category / subcategory / service), sourced from the
// existing legacy assets where they still fit and from fresh Pexels searches
// everywhere else. The output is server/scripts/catalogImages.map.json.
//
// Usage (from server/):
//   node scripts/buildCatalogImageMap.mjs                # incremental build
//   node scripts/buildCatalogImageMap.mjs --print-queries # show queries only
//   node scripts/buildCatalogImageMap.mjs --fresh         # rebuild from scratch
//   node scripts/buildCatalogImageMap.mjs --only <key>    # re-fetch one node
import fs from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { buildNodes, mainImageId, categoryImageId, subcategoryImageId, serviceImageId } from './lib/catalogNodes.mjs';
import { LEGACY_SOURCES } from './catalogImageSources.js';

const execFileAsync = promisify(execFile);

const MAP_PATH = new URL('./catalogImages.map.json', import.meta.url);
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const DELAY_MS = 350;
const MAX_PAGES = 3;

const args = process.argv.slice(2);
const PRINT_ONLY = args.includes('--print-queries');
const FRESH = args.includes('--fresh');
const ONLY = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── Legacy reuse ────────────────────────────────────────────────────────────
// Which existing asset still fits which node. Category reuse is keyed by
// display name; when a name exists under two main categories (Hair Styling,
// Hair Spa, Facial & Skin Care) the legacy asset goes to the first main in
// catalog order and the other slot gets a freshly sourced photo.
const MAIN_REUSE = {
  'AC & Appliance Repair': 'applianceRepair',
  Cleaning: 'cleaningTeam',
  'Electrician, Plumber & Carpenter': 'plumberRadiator',
  "Men's Salon & Massage": 'barbershop',
  "Women's Salon & Spa": 'hairBlowDry',
};

const CATEGORY_REUSE = {
  'AC Installation': 'acInstallation',
  'AC Service & Repair': 'acServiceRepair',
  'Bathroom Cleaning': 'bathroom',
  'Beard & Shaving': 'beardShaving',
  'Body Massage': 'massage',
  'Bridal & Special Occasion': 'bridal',
  Carpenter: 'carpenterDrill',
  'Chair Cleaning': 'chairCleaning',
  Chimney: 'chimney',
  'Deep Cleaning': 'sprayBottle',
  Dishwasher: 'dishwasher',
  Electrician: 'electricianHelmet',
  'Facial & Skin Care': 'facialMask',
  'Floor Cleaning': 'vacuumCarpet',
  Geyser: 'geyser',
  'Grooming Packages': 'groomingPackages',
  'Hair & Beard Combo': 'hairBeardCombo',
  'Hair Care': 'longHair',
  'Hair Removal': 'hairRemoval',
  'Hair Spa': 'hairWash',
  'Hair Styling': 'hairStyling',
  Haircut: 'haircut',
  'Head Massage': 'headMassage',
  'Home Cleaning': 'bedroom',
  'Kitchen Cleaning': 'kitchen',
  Makeup: 'makeup',
  'Manicure & Pedicure': 'manicure',
  'Mattress Cleaning': 'bedLinen',
  Microwave: 'microwave',
  'Other Home Appliances': 'craftsmanTools',
  'Pest Control': 'pestControl',
  Plumber: 'faucet',
  'RO/Water Purifier': 'waterGlass',
  Refrigerator: 'refrigerator',
  'Sofa Cleaning': 'sofaRoom',
  'Spa & Massage': 'spaMassage',
  'Washing Machine': 'washingMachineRoom',
  'Window & Glass Cleaning': 'windowCleaning',
};

// Note: 'Taps & Faucets' intentionally absent — the legacy key it used to
// point at (tapsFaucets) was never tracked in the upload script, so that node
// gets a freshly sourced photo like every other subcategory.
const SUB_REUSE = {
  'Door & Window': 'carpenterDoorWindow',
  'Drilling & Installation': 'drillingInstallation',
  'Furniture Assembly': 'furnitureAssembly',
  'Furniture Repair': 'furnitureRepair',
  Doorbell: 'doorbell',
  'Electrical Appliances': 'electricalAppliances',
  'Electrical Inspection': 'electricalInspection',
  Fans: 'ceilingFan',
  'Inverter & Stabilizer': 'inverterStabilizer',
  Lights: 'lights',
  'Switches & Sockets': 'switchesSockets',
  'Wiring & Electrical Repair': 'wiringRepair',
  'Bathroom Plumbing': 'bathroomPlumbing',
  'Pipes & Leakage': 'pipesLeakage',
  Sink: 'sinkPlumbing',
  Toilet: 'toilet',
  'Water Supply': 'waterSupply',
};

const SERVICE_REUSE = [
  {
    main: 'Cleaning',
    category: 'Window & Glass Cleaning',
    subCategory: 'Window & Glass Cleaning',
    serviceName: 'Window cleaning',
    legacyKey: 'windowCleaning',
  },
  {
    main: 'AC & Appliance Repair',
    category: 'Washing Machine',
    subCategory: 'Washing Machine',
    serviceName: 'Washing machine deep cleaning',
    legacyKey: 'washerDrum',
  },
];

// Non-catalog UI assets (hero + odf-for-job) are re-hosted under the new
// folder structure so every delivered URL lives in one consistent tree.
const UI_REUSE = [
  { key: 'odforce/hero/main', legacyKey: 'windowCleanerSilhouette', w: 1200, h: 800 },
  { key: 'odforce/hero/thumb-electrician', legacyKey: 'electricianPanel', w: 400, h: 400 },
  { key: 'odforce/hero/thumb-facial', legacyKey: 'facialTreatment', w: 400, h: 400 },
  { key: 'odforce/odf-for-job/odf-hero', legacyKey: 'odfHero', w: 1200, h: 800 },
  { key: 'odforce/odf-for-job/odf-team', legacyKey: 'odfTeam', w: 800, h: 500 },
  { key: 'odforce/odf-for-job/odf-worker', legacyKey: 'odfWorker', w: 800, h: 500 },
  { key: 'odforce/ui/default', legacyKey: 'livingRoom', w: 800, h: 500 },
];

// ─── Queries ─────────────────────────────────────────────────────────────────
// Per-category search queries (also used for subcategories whose name equals
// their category, and as the fallback for services in that category).
const CATEGORY_QUERIES = {
  'AC Installation': 'air conditioner installation wall',
  'AC Service & Repair': 'air conditioner repair technician',
  'Bathroom Cleaning': 'bathroom cleaning scrub',
  'Beard & Shaving': 'barber shaving beard razor',
  'Body Massage': 'back massage therapy',
  'Bridal & Special Occasion': 'bride bridal makeup',
  Carpenter: 'carpenter woodworking workshop',
  'Chair Cleaning': 'cleaning chair upholstery',
  Chimney: 'kitchen chimney hood',
  'Deep Cleaning': 'deep cleaning house',
  Dishwasher: 'dishwasher kitchen appliance',
  Electrician: 'electrician working wires',
  'Facial & Skin Care': 'facial skincare treatment',
  'Floor Cleaning': 'floor mopping cleaning',
  Geyser: 'water heater geyser',
  'Grooming Packages': 'men grooming salon',
  'Hair & Beard Combo': 'barber haircut beard',
  'Hair Care': 'woman long hair care',
  'Hair Removal': 'waxing hair removal legs',
  'Hair Spa': 'hair spa treatment',
  'Hair Styling': 'hair styling salon',
  Haircut: 'haircut barber scissors',
  'Head Massage': 'head massage therapy',
  'Home Cleaning': 'home cleaning living room',
  'Kitchen Cleaning': 'kitchen cleaning counter',
  Makeup: 'makeup brush face',
  'Manicure & Pedicure': 'manicure pedicure nails',
  'Mattress Cleaning': 'mattress cleaning bed',
  Microwave: 'microwave oven kitchen',
  'Other Home Appliances': 'air cooler home appliance',
  'Pest Control': 'pest control spraying',
  Plumber: 'plumber fixing pipe wrench',
  'RO/Water Purifier': 'water purifier filter drinking',
  Refrigerator: 'refrigerator kitchen appliance',
  'Sofa Cleaning': 'sofa cleaning vacuum',
  'Spa & Massage': 'spa massage candles',
  'Washing Machine': 'washing machine laundry',
  'Window & Glass Cleaning': 'window glass cleaning squeegee',
};

// Per-node query overrides. Used (a) when the node's slot already had its
// legacy asset taken by a same-named node elsewhere in the catalog, and
// (b) to correct picks whose first automated query matched the wrong topic.
// An existing pick whose stored query differs from the override here is
// re-sourced automatically on the next run.
const svcQ = (main, category, sub, service, query) => [serviceImageId(main, category, sub, service), query];
const subQ = (main, category, sub, query) => [subcategoryImageId(main, category, sub), query];

const QUERY_OVERRIDES = {
  // categories whose legacy asset went to the same-named node in the other main category
  [categoryImageId("Men's Salon & Massage", 'Hair Styling')]: 'mens hair styling barber',
  [categoryImageId("Men's Salon & Massage", 'Hair Spa')]: 'mens hair spa treatment shampoo',
  [categoryImageId("Men's Salon & Massage", 'Facial & Skin Care')]: 'mens facial skincare treatment',

  // ── subcategories ──
  ...Object.fromEntries([
    subQ('AC & Appliance Repair', 'Other Home Appliances', 'Other Home Appliances', 'air cooler desert room'),
    subQ('Cleaning', 'Chair Cleaning', 'Chair Cleaning', 'cleaning chair brush'),
    subQ("Men's Salon & Massage", 'Grooming Packages', 'Grooming Packages', 'men grooming barbershop'),
    subQ("Women's Salon & Spa", 'Hair Care', 'Hair Care', 'woman long hair'),
  ]),

  // ── services: AC & Appliance Repair ──
  ...Object.fromEntries([
    svcQ('AC & Appliance Repair', 'AC Installation', 'AC Installation', 'Split AC installation', 'air conditioner installation technician'),
    svcQ('AC & Appliance Repair', 'AC Installation', 'AC Installation', 'Window AC removal', 'air conditioner unit'),
    svcQ('AC & Appliance Repair', 'AC Service & Repair', 'AC Service & Repair', 'AC gas leakage inspection', 'air conditioner gas pipe'),
    svcQ('AC & Appliance Repair', 'Chimney', 'Chimney', 'Chimney installation', 'kitchen chimney hood'),
    svcQ('AC & Appliance Repair', 'Chimney', 'Chimney', 'Chimney exterior cleaning', 'kitchen chimney cleaning'),
    svcQ('AC & Appliance Repair', 'Geyser', 'Geyser', 'Geyser installation', 'water heater installation'),
    svcQ('AC & Appliance Repair', 'Geyser', 'Geyser', 'Geyser removal', 'water heater'),
    svcQ('AC & Appliance Repair', 'Geyser', 'Geyser', 'Geyser electrical connection', 'water heater switch'),
    svcQ('AC & Appliance Repair', 'Microwave', 'Microwave', 'Microwave installation', 'microwave oven'),
    svcQ('AC & Appliance Repair', 'Microwave', 'Microwave', 'Microwave electrical connection', 'microwave oven'),
    svcQ('AC & Appliance Repair', 'Other Home Appliances', 'Other Home Appliances', 'Air cooler installation', 'air cooler desert room'),
    svcQ('AC & Appliance Repair', 'Other Home Appliances', 'Other Home Appliances', 'Air cooler removal', 'air cooler desert room'),
    svcQ('AC & Appliance Repair', 'Refrigerator', 'Refrigerator', 'Door gasket replacement', 'refrigerator door open'),
    svcQ('AC & Appliance Repair', 'RO/Water Purifier', 'RO/Water Purifier', 'RO inspection', 'water purifier'),
    svcQ('AC & Appliance Repair', 'RO/Water Purifier', 'RO/Water Purifier', 'RO basic service', 'water purifier filter'),
    svcQ('AC & Appliance Repair', 'RO/Water Purifier', 'RO/Water Purifier', 'RO installation', 'water purifier kitchen'),
    svcQ('AC & Appliance Repair', 'RO/Water Purifier', 'RO/Water Purifier', 'RO removal', 'water purifier'),
    svcQ('AC & Appliance Repair', 'RO/Water Purifier', 'RO/Water Purifier', 'Filter replacement', 'water filter cartridge'),
    svcQ('AC & Appliance Repair', 'Washing Machine', 'Washing Machine', 'Washing machine inspection', 'washing machine repair'),
    svcQ('AC & Appliance Repair', 'Washing Machine', 'Washing Machine', 'Washing machine basic service', 'washing machine repair'),
    svcQ('AC & Appliance Repair', 'Dishwasher', 'Dishwasher', 'Dishwasher installation', 'dishwasher'),
  ]),

  // ── services: Cleaning ──
  ...Object.fromEntries([
    svcQ('Cleaning', 'Bathroom Cleaning', 'Bathroom Cleaning', 'Bathroom basic cleaning', 'cleaning bathroom'),
    svcQ('Cleaning', 'Bathroom Cleaning', 'Bathroom Cleaning', 'Bathroom deep cleaning', 'bathroom cleaning scrub'),
    svcQ('Cleaning', 'Floor Cleaning', 'Floor Cleaning', 'Floor deep cleaning', 'floor cleaning mop'),
    svcQ('Cleaning', 'Floor Cleaning', 'Floor Cleaning', 'Terrace basic cleaning', 'roof terrace'),
    svcQ('Cleaning', 'Chair Cleaning', 'Chair Cleaning', 'Dining chair cleaning', 'dining chair'),
    svcQ('Cleaning', 'Sofa Cleaning', 'Sofa Cleaning', '3-seat sofa cleaning', 'sofa cleaning'),
    svcQ('Cleaning', 'Window & Glass Cleaning', 'Window & Glass Cleaning', 'Glass partition cleaning', 'office glass partition'),
    svcQ('Cleaning', 'Kitchen Cleaning', 'Kitchen Cleaning', 'Kitchen deep cleaning', 'cleaning kitchen'),
    svcQ('Cleaning', 'Kitchen Cleaning', 'Kitchen Cleaning', 'Chimney exterior cleaning', 'kitchen chimney'),
    svcQ('Cleaning', 'Home Cleaning', 'Home Cleaning', '1 BHK basic cleaning', 'home cleaning house'),
    svcQ('Cleaning', 'Home Cleaning', 'Home Cleaning', '2 BHK basic cleaning', 'home cleaning house'),
    svcQ('Cleaning', 'Deep Cleaning', 'Deep Cleaning', '1 BHK deep cleaning', 'deep cleaning home'),
    svcQ('Cleaning', 'Deep Cleaning', 'Deep Cleaning', '2 BHK deep cleaning', 'deep cleaning home'),
    svcQ('Cleaning', 'Pest Control', 'Pest Control', '1 BHK pest control', 'pest control'),
    svcQ('Cleaning', 'Pest Control', 'Pest Control', '2 BHK pest control', 'pest control'),
    svcQ('Cleaning', 'Pest Control', 'Pest Control', '3 BHK pest control', 'pest control'),
    svcQ('Cleaning', 'Mattress Cleaning', 'Mattress Cleaning', 'Single mattress cleaning', 'mattress'),
    svcQ('Cleaning', 'Mattress Cleaning', 'Mattress Cleaning', 'Double mattress cleaning', 'mattress'),
    svcQ('Cleaning', 'Mattress Cleaning', 'Mattress Cleaning', 'King mattress cleaning', 'mattress'),
  ]),

  // ── services: Electrician / Plumber / Carpenter ──
  ...Object.fromEntries([
    svcQ('Electrician, Plumber & Carpenter', 'Carpenter', 'Door & Window', 'Hinge replacement', 'door hinge'),
    svcQ('Electrician, Plumber & Carpenter', 'Carpenter', 'Door & Window', 'Window latch replacement', 'window latch lock'),
    svcQ('Electrician, Plumber & Carpenter', 'Carpenter', 'Furniture Repair', 'Bed repair', 'wooden bed frame'),
    svcQ('Electrician, Plumber & Carpenter', 'Carpenter', 'Furniture Repair', 'Wardrobe door repair', 'wardrobe closet doors'),
    svcQ('Electrician, Plumber & Carpenter', 'Electrician', 'Electrical Appliances', 'Microwave electrical connection', 'microwave oven'),
    svcQ('Electrician, Plumber & Carpenter', 'Electrician', 'Electrical Appliances', 'Washing machine electrical connection', 'washing machine laundry'),
    svcQ('Electrician, Plumber & Carpenter', 'Electrician', 'Electrical Appliances', 'Refrigerator electrical connection', 'refrigerator kitchen'),
    svcQ('Electrician, Plumber & Carpenter', 'Electrician', 'Electrical Appliances', 'Geyser electrical connection', 'water heater geyser'),
    svcQ('Electrician, Plumber & Carpenter', 'Electrician', 'Lights', 'Wall light installation', 'wall sconce light'),
    svcQ('Electrician, Plumber & Carpenter', 'Electrician', 'Lights', 'Tube light installation', 'tube light'),
    svcQ('Electrician, Plumber & Carpenter', 'Electrician', 'Switches & Sockets', 'Modular switch replacement', 'light switch wall'),
    svcQ('Electrician, Plumber & Carpenter', 'Electrician', 'Switches & Sockets', 'Modular socket replacement', 'electrical outlet socket'),
    svcQ('Electrician, Plumber & Carpenter', 'Electrician', 'Switches & Sockets', 'Switch+socket replacement', 'light switch socket'),
    svcQ('Electrician, Plumber & Carpenter', 'Electrician', 'Wiring & Electrical Repair', 'MCB replacement', 'circuit breaker'),
    svcQ('Electrician, Plumber & Carpenter', 'Electrician', 'Wiring & Electrical Repair', 'Distribution board inspection', 'electrical panel breaker'),
    svcQ('Electrician, Plumber & Carpenter', 'Electrician', 'Wiring & Electrical Repair', 'Fuse replacement', 'electrical fuse'),
    svcQ('Electrician, Plumber & Carpenter', 'Electrician', 'Wiring & Electrical Repair', 'Short-circuit inspection', 'burnt electrical wire'),
    svcQ('Electrician, Plumber & Carpenter', 'Electrician', 'Wiring & Electrical Repair', 'Loose wire connection repair', 'electrical wire hands'),
    svcQ('Electrician, Plumber & Carpenter', 'Electrician', 'Inverter & Stabilizer', 'Inverter installation', 'home inverter battery'),
    svcQ('Electrician, Plumber & Carpenter', 'Electrician', 'Inverter & Stabilizer', 'Stabilizer installation', 'voltage stabilizer'),
    svcQ('Electrician, Plumber & Carpenter', 'Electrician', 'Inverter & Stabilizer', 'Stabilizer removal', 'voltage stabilizer'),
    svcQ('Electrician, Plumber & Carpenter', 'Electrician', 'Doorbell', 'Doorbell replacement', 'doorbell button'),
    svcQ('Electrician, Plumber & Carpenter', 'Plumber', 'Toilet', 'Flush repair', 'toilet flush'),
    svcQ('Electrician, Plumber & Carpenter', 'Plumber', 'Toilet', 'Flush tank replacement', 'toilet cistern'),
    svcQ('Electrician, Plumber & Carpenter', 'Plumber', 'Toilet', 'Seat replacement', 'toilet seat'),
    svcQ('Electrician, Plumber & Carpenter', 'Plumber', 'Sink', 'Sink removal', 'kitchen sink'),
    svcQ('Electrician, Plumber & Carpenter', 'Plumber', 'Pipes & Leakage', 'Minor pipe leakage repair', 'leaking pipe water'),
    svcQ('Electrician, Plumber & Carpenter', 'Plumber', 'Bathroom Plumbing', 'Health faucet installation', 'bidet sprayer'),
  ]),

  // ── services: salon ──
  ...Object.fromEntries([
    svcQ("Men's Salon & Massage", 'Beard & Shaving', 'Beard & Shaving', 'Beard styling', 'beard grooming'),
    svcQ("Men's Salon & Massage", 'Facial & Skin Care', 'Facial & Skin Care', "Men's cleanup", 'men facial treatment'),
    svcQ("Men's Salon & Massage", 'Grooming Packages', 'Grooming Packages', 'Premium grooming package', 'men grooming barbershop'),
    svcQ("Men's Salon & Massage", 'Hair & Beard Combo', 'Hair & Beard Combo', 'Haircut + beard trim', 'haircut beard barber'),
    svcQ("Men's Salon & Massage", 'Hair & Beard Combo', 'Hair & Beard Combo', 'Haircut + beard styling', 'barber beard styling'),
    svcQ("Men's Salon & Massage", 'Hair Spa', 'Hair Spa', "Basic men's hair spa", 'man hair wash salon'),
    svcQ("Men's Salon & Massage", 'Head Massage', 'Head Massage', 'Head massage', 'head massage'),
    svcQ("Men's Salon & Massage", 'Head Massage', 'Head Massage', 'Head massage + hair wash', 'hair wash salon'),
    svcQ("Women's Salon & Spa", 'Spa & Massage', 'Spa & Massage', 'Head massage', 'head massage'),
    svcQ("Women's Salon & Spa", 'Spa & Massage', 'Spa & Massage', 'Back massage', 'back massage therapy'),
    svcQ("Women's Salon & Spa", 'Hair Removal', 'Hair Removal', 'Full legs waxing', 'leg waxing'),
    svcQ("Women's Salon & Spa", 'Hair Removal', 'Hair Removal', 'Half legs waxing', 'leg waxing'),
    svcQ("Women's Salon & Spa", 'Hair Care', 'Hair Care', 'Hair trim', 'haircut scissors'),
    svcQ("Women's Salon & Spa", 'Hair Care', 'Hair Care', "Women's haircut", 'woman haircut salon'),
    svcQ("Women's Salon & Spa", 'Bridal & Special Occasion', 'Bridal & Special Occasion', 'Bridal hair styling', 'bride hair'),
  ]),
};

// Hand-picked photo ids for nodes whose automated query returned a
// topically-wrong photo. Every id below was verified to be unused by any
// other node (and not present in LEGACY_SOURCES). The builder fetches the
// photo page for its og:image + description, and refuses to run if the id
// is already owned by a different node.
const EXPLICIT_PICKS = {
  // ── AC & Appliance Repair ──
  'odforce/services/ac-appliance-repair/ac-installation/ac-installation/window-ac-removal': '18725613',
  'odforce/services/ac-appliance-repair/ac-service-repair/ac-service-repair/ac-gas-leakage-inspection': '20046692',
  'odforce/services/ac-appliance-repair/chimney/chimney/chimney-exterior-cleaning': '7515855',
  'odforce/services/ac-appliance-repair/dishwasher/dishwasher/dishwasher-installation': '5904038',
  'odforce/services/ac-appliance-repair/microwave/microwave/microwave-electrical-connection': '32168944',
  'odforce/services/ac-appliance-repair/refrigerator/refrigerator/door-gasket-replacement': '9031968',
  'odforce/services/ac-appliance-repair/ro-water-purifier/ro-water-purifier/filter-replacement': '2226387',
  'odforce/services/ac-appliance-repair/ro-water-purifier/ro-water-purifier/ro-inspection': '3500006',
  'odforce/services/ac-appliance-repair/ro-water-purifier/ro-water-purifier/ro-installation': '7166645',
  'odforce/services/ac-appliance-repair/ro-water-purifier/ro-water-purifier/ro-removal': '11612595',
  'odforce/services/ac-appliance-repair/washing-machine/washing-machine/washing-machine-inspection': '4700400',
  'odforce/services/ac-appliance-repair/washing-machine/washing-machine/washing-machine-basic-service': '17181948',

  // ── Cleaning ──
  'odforce/services/cleaning/bathroom-cleaning/bathroom-cleaning/bathroom-deep-cleaning': '5217889',
  'odforce/services/cleaning/home-cleaning/home-cleaning/1-bhk-basic-cleaning': '9462162',
  'odforce/services/cleaning/kitchen-cleaning/kitchen-cleaning/chimney-exterior-cleaning': '36035073',
  'odforce/services/cleaning/pest-control/pest-control/2-bhk-pest-control': '4176550',
  'odforce/services/cleaning/pest-control/pest-control/3-bhk-pest-control': '16851694',
  'odforce/services/cleaning/sofa-cleaning/sofa-cleaning/3-seat-sofa-cleaning': '1239298',

  // ── Electrician / Plumber / Carpenter ──
  'odforce/services/electrician-plumber-carpenter/carpenter/furniture-repair/bed-repair': '5644286',
  'odforce/services/electrician-plumber-carpenter/electrician/electrical-appliances/microwave-electrical-connection': '32831269',
  'odforce/services/electrician-plumber-carpenter/electrician/inverter-stabilizer/inverter-installation': '38040020',
  'odforce/services/electrician-plumber-carpenter/electrician/inverter-stabilizer/stabilizer-installation': '11032801',
  'odforce/services/electrician-plumber-carpenter/electrician/inverter-stabilizer/stabilizer-removal': '11924298',
  'odforce/services/electrician-plumber-carpenter/electrician/lights/tube-light-installation': '988888',
  'odforce/services/electrician-plumber-carpenter/electrician/lights/wall-light-installation': '11440223',
  'odforce/services/electrician-plumber-carpenter/electrician/switches-sockets/modular-socket-replacement': '8101107',
  'odforce/services/electrician-plumber-carpenter/electrician/switches-sockets/modular-switch-replacement': '12996907',
  'odforce/services/electrician-plumber-carpenter/electrician/switches-sockets/switch-socket-replacement': '3615711',
  'odforce/services/electrician-plumber-carpenter/electrician/wiring-electrical-repair/distribution-board-inspection': '12207608',
  'odforce/services/electrician-plumber-carpenter/electrician/wiring-electrical-repair/fuse-replacement': '12380719',
  'odforce/services/electrician-plumber-carpenter/electrician/wiring-electrical-repair/mcb-replacement': '3520692',
  'odforce/services/electrician-plumber-carpenter/electrician/wiring-electrical-repair/short-circuit-inspection': '6817477',
  'odforce/services/electrician-plumber-carpenter/plumber/bathroom-plumbing/health-faucet-installation': '19666087',
  'odforce/services/electrician-plumber-carpenter/plumber/toilet/flush-tank-replacement': '17854867',
  'odforce/services/electrician-plumber-carpenter/plumber/toilet/seat-replacement': '10900758',

  // ── Men's Salon & Massage ──
  'odforce/services/mens-salon-massage/beard-shaving/beard-shaving/beard-styling': '10586305',
  'odforce/services/mens-salon-massage/grooming-packages/grooming-packages/premium-grooming-package': '7518736',
  'odforce/services/mens-salon-massage/head-massage/head-massage/head-massage': '7697439',
  'odforce/services/mens-salon-massage/head-massage/head-massage/head-massage-hair-wash': '7755473',
  'odforce/services/mens-salon-massage/hair-spa/hair-spa/basic-mens-hair-spa': '23349912',

  // ── Women's Salon & Spa ──
  'odforce/services/womens-salon-spa/hair-removal/hair-removal/full-legs-waxing': '35103884',
  'odforce/services/womens-salon-spa/hair-removal/hair-removal/half-legs-waxing': '9486702',
  'odforce/services/womens-salon-spa/spa-massage/spa-massage/back-massage': '38407786',
  'odforce/services/womens-salon-spa/spa-massage/spa-massage/head-massage': '9335961',

  // ── subcategories ──
  'odforce/subcategories/ac-appliance-repair/other-home-appliances/other-home-appliances': '18071814',
  'odforce/subcategories/mens-salon-massage/grooming-packages/grooming-packages': '7518761',
  // ── visual-audit replacements (faceless / wrong subject) ──
  'odforce/subcategories/womens-salon-spa/hair-care/hair-care': '8834042',
  'odforce/subcategories/cleaning/floor-cleaning/floor-cleaning': '36715251',
  'odforce/subcategories/cleaning/chair-cleaning/chair-cleaning': '4401537',
  'odforce/subcategories/ac-appliance-repair/ro-water-purifier/ro-water-purifier': '4641430',
  'odforce/subcategories/ac-appliance-repair/microwave/microwave': '29149068',
  'odforce/subcategories/ac-appliance-repair/chimney/chimney': '7168012',
  'odforce/subcategories/mens-salon-massage/hair-styling/hair-styling': '11169551',
  'odforce/subcategories/mens-salon-massage/beard-shaving/beard-shaving': '6007400',
  'odforce/services/cleaning/deep-cleaning/deep-cleaning/1-bhk-deep-cleaning': '36715248',
  'odforce/services/cleaning/sofa-cleaning/sofa-cleaning/5-seat-sofa-cleaning': '4401535',
  'odforce/services/cleaning/mattress-cleaning/mattress-cleaning/king-mattress-cleaning': '14675103',
  'odforce/services/electrician-plumber-carpenter/plumber/taps-faucets/mixer-tap-installation': '15667601',
  'odforce/services/electrician-plumber-carpenter/carpenter/furniture-repair/wardrobe-door-repair': '37663438',
  'odforce/services/ac-appliance-repair/washing-machine/washing-machine/washing-machine-electrical-inspection': '4386143',
  'odforce/services/ac-appliance-repair/refrigerator/refrigerator/refrigerator-electrical-inspection': '34872423',
  'odforce/services/ac-appliance-repair/microwave/microwave/microwave-installation': '4686822',
  'odforce/services/ac-appliance-repair/other-home-appliances/other-home-appliances/air-cooler-removal': '11256510',
  'odforce/services/electrician-plumber-carpenter/electrician/fans/ceiling-fan-removal': '3990590',
  'odforce/services/electrician-plumber-carpenter/electrician/fans/fan-regulator-replacement': '10117712',
  'odforce/services/electrician-plumber-carpenter/electrician/doorbell/doorbell-replacement': '9461215',
  'odforce/services/electrician-plumber-carpenter/plumber/sink/sink-installation': '7535016',
  'odforce/services/electrician-plumber-carpenter/plumber/toilet/flush-repair': '7622581',
  'odforce/services/ac-appliance-repair/ac-installation/ac-installation/split-ac-removal': '5463576',
  'odforce/services/mens-salon-massage/grooming-packages/grooming-packages/basic-grooming-package': '7697273',
  'odforce/services/mens-salon-massage/facial-skin-care/facial-skin-care/mens-basic-facial': '13357909',
  'odforce/services/mens-salon-massage/facial-skin-care/facial-skin-care/mens-cleanup': '39303684',
  'odforce/services/mens-salon-massage/hair-styling/hair-styling/hair-styling': '7447150',
  'odforce/services/electrician-plumber-carpenter/electrician/lights/led-panel-light-installation': '7640978',
  'odforce/categories/mens-salon-massage/facial-skin-care': '5912287',
};

const SUB_QUERIES = {
  'Door & Window': 'door window hinges handle',
  'Drilling & Installation': 'drilling wall mount installation',
  'Furniture Assembly': 'assembling furniture screwdriver',
  'Furniture Repair': 'furniture repair sanding wood',
  Doorbell: 'doorbell button wall',
  'Electrical Appliances': 'home appliance plug socket',
  'Electrical Inspection': 'electrical inspection tester',
  Fans: 'ceiling fan room',
  'Inverter & Stabilizer': 'inverter battery stabilizer',
  Lights: 'led light bulb lamp',
  'Switches & Sockets': 'light switch socket wall',
  'Wiring & Electrical Repair': 'electrical wires repair',
  'Bathroom Plumbing': 'shower bathroom plumbing',
  'Pipes & Leakage': 'water pipe leakage repair',
  Sink: 'sink faucet plumbing',
  'Taps & Faucets': 'faucet tap water sink',
  Toilet: 'toilet bathroom flush',
  'Water Supply': 'water tank pipes',
};

const MAIN_QUERIES = {
  'AC & Appliance Repair': 'home appliance repair technician',
  Cleaning: 'professional cleaning service home',
  'Electrician, Plumber & Carpenter': 'electrician plumber carpenter tools',
  "Men's Salon & Massage": 'barbershop men grooming',
  "Women's Salon & Spa": 'beauty salon women hair spa',
};

const cleanServiceQuery = (name) => {
  let s = name.replace(/\//g, ' ').replace(/\+/g, ' ');
  const hadBhk = /\d+\s*BHK/i.test(s);
  const hadSeat = /^\d+[- ]?seat/i.test(s);
  const hadMattress = /^(Single|Double|King)\s+/i.test(s);
  s = s.replace(/^\d+\s*BHK\s*/i, '').replace(/^\d+[- ]seat\s*/i, '').replace(/^(Single|Double|King)\s+/i, '');
  s = s.replace(/install\/replace/gi, 'installation').replace(/alignment\/adjustment/gi, 'adjustment');
  s = s.replace(/\s+/g, ' ').trim();
  if (hadBhk) return `${s} apartment home`;
  if (hadSeat) return `${s} couch`;
  if (hadMattress) return `${s} bed`;
  return s;
};

const queriesForNode = (node) => {
  const overrides = QUERY_OVERRIDES[node.key] ? [QUERY_OVERRIDES[node.key]] : [];
  if (node.level === 'category') {
    return [...overrides, CATEGORY_QUERIES[node.category]].filter(Boolean);
  }
  if (node.level === 'subcategory') {
    if (node.subCategory !== node.category) {
      return [...overrides, SUB_QUERIES[node.subCategory] || CATEGORY_QUERIES[node.category]].filter(Boolean);
    }
    return [...overrides, CATEGORY_QUERIES[node.category]].filter(Boolean);
  }
  if (node.level === 'service') {
    return [
      ...overrides,
      cleanServiceQuery(node.serviceName),
      SUB_QUERIES[node.subCategory],
      CATEGORY_QUERIES[node.category],
      MAIN_QUERIES[node.main],
    ].filter(Boolean);
  }
  return [...overrides, MAIN_QUERIES[node.main]].filter(Boolean);
};

// ─── Pexels search ───────────────────────────────────────────────────────────
const searchCache = new Map(); // query -> { results: [{id,url,alt}], page }

// Pexels sits behind Cloudflare, which rejects Node's TLS fingerprint with a
// 403 challenge but serves plain curl normally — so every search goes out via
// curl with the browser UA.
const fetchPexelsPage = async (query, page) => {
  // Page 1 is the bare path (adding ?page=1 triggers a 301 to /search/?q=...);
  // later pages use the query-string form. -L follows whatever it redirects to.
  const base = `https://www.pexels.com/search/${encodeURIComponent(query)}/`;
  const url = page === 1 ? base : `${base}?page=${page}`;
  const { stdout: html } = await execFileAsync(
    'curl',
    ['-sL', '--max-time', '30', '-H', `User-Agent: ${UA}`, '-H', 'Accept-Language: en-US,en;q=0.9', url],
    { maxBuffer: 32 * 1024 * 1024 }
  );
  if (html.includes('Just a moment')) throw new Error(`Cloudflare challenge for "${query}" page ${page}`);
  const results = [];
  const seen = new Set();
  const imgTags = html.match(/<img\b[^>]*>/g) || [];
  for (const tag of imgTags) {
    const idMatch = tag.match(/\/photos\/(\d+)\//);
    if (!idMatch) continue;
    const id = idMatch[1];
    if (seen.has(id)) continue;
    const srcMatch = tag.match(/src="(https:\/\/images\.pexels\.com\/photos\/[^"]+)"/);
    if (!srcMatch) continue;
    seen.add(id);
    const altMatch = tag.match(/alt="([^"]*)"/);
    // Search-page <img> srcs are tiny thumbnails (?h=40&w=40...). Canonicalize
    // to the full-size asset (same form fetchPexelsPhoto uses) so the stored
    // Cloudinary original is always high-res.
    const canonicalUrl = srcMatch[1]
      .replace(/&amp;/g, '&')
      .split('?')[0]
      .concat('?auto=compress&cs=tinysrgb&w=1600');
    results.push({ id, url: canonicalUrl, alt: altMatch ? altMatch[1] : '' });
  }
  if (!results.length) throw new Error(`No results parsed for "${query}" page ${page}`);
  return results;
};

const getResults = async (query, page) => {
  const cacheKey = `${query}::${page}`;
  if (searchCache.has(cacheKey)) return searchCache.get(cacheKey);
  const results = await fetchPexelsPage(query, page);
  searchCache.set(cacheKey, results);
  return results;
};

const unusedPexelsId = async (query, usedIds) => {
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    let results;
    try {
      results = await getResults(query, page);
    } catch (e) {
      // Page 1 failing is a real problem; later pages simply may not exist.
      if (page === 1) throw e;
      break;
    }
    for (const r of results) {
      if (!usedIds.has(r.id)) return { ...r, query, page };
    }
  }
  return null;
};

// Fetch the photo page for an explicit pick: og:image gives the canonical
// image URL, the <h1 title> gives the photographer's description (alt text).
const fetchPexelsPhoto = async (photoId) => {
  const url = `https://www.pexels.com/photo/${photoId}/`;
  const { stdout: html } = await execFileAsync(
    'curl',
    ['-sL', '--max-time', '30', '-H', `User-Agent: ${UA}`, '-H', 'Accept-Language: en-US,en;q=0.9', url],
    { maxBuffer: 32 * 1024 * 1024 }
  );
  if (html.includes('Just a moment')) throw new Error(`Cloudflare challenge for photo ${photoId}`);
  const ogMatch = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/);
  if (!ogMatch) throw new Error(`No og:image on photo page ${photoId}`);
  const descMatch = html.match(/<h1[^>]*\btitle="([^"]+)"/) || html.match(/"description":"([^"]+)"/);
  const img = ogMatch[1].replace(/&amp;/g, '&');
  // Canonical URL form, keeping the source extension (.jpeg or .png).
  const ext = (img.match(/pexels-photo-\d+\.(jpeg|png|jpg)/) || [, 'jpeg'])[1];
  const canonical = `https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.${ext}?auto=compress&cs=tinysrgb&w=1600`;
  return { url: canonical, img, alt: descMatch ? descMatch[1].replace(/&#x27;/g, "'") : `Pexels photo ${photoId}` };
};

// ─── Main ────────────────────────────────────────────────────────────────────
const legacyId = (url) => {
  const m = url.match(/(?:pexels\.com\/photos\/|pexels-photo-)(\d+)/);
  return m ? m[1] : null;
};

const loadMap = () => {
  if (FRESH || !fs.existsSync(MAP_PATH)) return {};
  return JSON.parse(fs.readFileSync(MAP_PATH, 'utf8'));
};

const saveMap = (map) => {
  const sorted = Object.fromEntries(Object.entries(map).sort(([a], [b]) => a.localeCompare(b)));
  fs.writeFileSync(MAP_PATH, JSON.stringify(sorted, null, 2));
};

const labelFor = (node) =>
  node.level === 'service'
    ? `${node.main} / ${node.category} / ${node.subCategory} / ${node.serviceName}`
    : node.level === 'subcategory'
      ? `${node.main} / ${node.category} / ${node.subCategory}`
      : node.level === 'category'
        ? `${node.main} / ${node.category}`
        : node.main;

const { nodes } = buildNodes();
console.log(`Catalog nodes: ${nodes.length}`);

if (PRINT_ONLY) {
  for (const node of nodes) {
    const legacyKey = null;
    void legacyKey;
    console.log(`\n${node.level.toUpperCase().padEnd(12)} ${node.key}\n  label: ${labelFor(node)}\n  queries: ${queriesForNode(node).join(' | ')}`);
  }
  process.exit(0);
}

const map = loadMap();
const usedIds = new Set();

// Seed used-ids from legacy sources and from every photo already assigned in
// a previous run, so fresh picks never collide with existing assignments.
for (const url of Object.values(LEGACY_SOURCES)) {
  const id = legacyId(url);
  if (id) usedIds.add(id);
}
for (const entry of Object.values(map)) {
  if (entry.photoId) usedIds.add(entry.photoId);
}

// Reserve every hand-picked photo id up front, then verify none of them is
// owned by a node other than the one it is assigned to here.
{
  const nodeKeys = new Set(nodes.map((n) => n.key));
  for (const [key, id] of Object.entries(EXPLICIT_PICKS)) {
    if (!nodeKeys.has(key)) throw new Error(`EXPLICIT_PICKS: unknown node key ${key}`);
    for (const [otherKey, entry] of Object.entries(map)) {
      if (otherKey !== key && entry.photoId === id) {
        throw new Error(`EXPLICIT_PICKS: photo ${id} already owned by ${otherKey}`);
      }
      if (otherKey !== key && entry.url) {
        const oid = legacyId(entry.url);
        if (oid === id) throw new Error(`EXPLICIT_PICKS: photo ${id} already in legacy url of ${otherKey}`);
      }
    }
    usedIds.add(id);
  }
}

const failures = [];
const reusedLegacy = new Set();

const assignLegacy = (key, legacyKey, extra) => {
  const url = LEGACY_SOURCES[legacyKey];
  if (!url) throw new Error(`Unknown legacy key: ${legacyKey}`);
  if (reusedLegacy.has(legacyKey)) throw new Error(`Legacy key reused twice: ${legacyKey}`);
  reusedLegacy.add(legacyKey);
  const id = legacyId(url);
  if (id) usedIds.add(id);
  map[key] = { ...extra, source: 'legacy', legacyKey, url };
};

// 1. UI assets (hero, odf-for-job, default)
for (const ui of UI_REUSE) {
  assignLegacy(ui.key, ui.legacyKey, { level: 'ui', label: ui.key, w: ui.w, h: ui.h });
}

// 2. Catalog nodes
let sourced = 0;
for (const node of nodes) {
  const meta = { level: node.level, label: labelFor(node) };
  const already = map[node.key];
  if (already && already.source === 'legacy') {
    const id = legacyId(already.url);
    if (id) usedIds.add(id);
    if (already.legacyKey) reusedLegacy.add(already.legacyKey);
    continue;
  }
  if (ONLY && node.key !== ONLY) {
    if (already && already.photoId) usedIds.add(already.photoId);
    continue;
  }

  // Hand-picked photo: fetch its page for the URL + alt and pin it.
  const explicitId = EXPLICIT_PICKS[node.key];
  if (explicitId) {
    if (already && already.photoId === explicitId && already.source === 'pexels') {
      usedIds.add(explicitId);
    } else {
      try {
        const photo = await fetchPexelsPhoto(explicitId);
        map[node.key] = {
          ...meta,
          source: 'pexels',
          photoId: explicitId,
          query: `explicit:${explicitId}`,
          alt: photo.alt,
          url: photo.url,
        };
        sourced += 1;
        console.log(`EXPLICIT ${node.key}\n         -> ${explicitId}  alt="${photo.alt}"`);
        await sleep(DELAY_MS);
      } catch (e) {
        failures.push({ key: node.key, label: labelFor(node), queries: ['explicit'], error: e.message });
        console.log(`FAIL   ${node.key}  (${e.message})`);
      }
    }
    continue;
  }

  // Legacy reuse (first slot wins for ambiguous names)
  let legacyKey = null;
  if (node.level === 'main') legacyKey = MAIN_REUSE[node.main];
  else if (node.level === 'category') legacyKey = CATEGORY_REUSE[node.category] || null;
  else if (node.level === 'subcategory' && node.subCategory !== node.category)
    legacyKey = SUB_REUSE[node.subCategory] || null;
  else if (node.level === 'service') {
    const hit = SERVICE_REUSE.find(
      (r) =>
        r.main === node.main &&
        r.category === node.category &&
        r.subCategory === node.subCategory &&
        r.serviceName === node.serviceName
    );
    legacyKey = hit ? hit.legacyKey : null;
  }
  if (legacyKey && !reusedLegacy.has(legacyKey) && LEGACY_SOURCES[legacyKey]) {
    assignLegacy(node.key, legacyKey, meta);
    console.log(`LEGACY ${node.key}  <- ${legacyKey}`);
    continue;
  }

  const wantedQuery = QUERY_OVERRIDES[node.key];
  if (already && already.source === 'pexels' && !ONLY) {
    if (wantedQuery && already.query !== wantedQuery) {
      // Pick came from an older query — fall through and re-source it.
    } else {
      usedIds.add(already.photoId);
      continue;
    }
  }
  // Fresh Pexels search
  const queries = queriesForNode(node);
  let picked = null;
  let lastError = null;
  for (const query of queries) {
    try {
      picked = await unusedPexelsId(query, usedIds);
    } catch (e) {
      lastError = e.message;
    }
    if (picked) break;
    await sleep(DELAY_MS);
  }
  if (!picked) {
    failures.push({ key: node.key, label: labelFor(node), queries, error: lastError });
    console.log(`FAIL   ${node.key}  (${lastError || 'no unused results'})`);
    continue;
  }
  usedIds.add(picked.id);
  map[node.key] = {
    ...meta,
    source: 'pexels',
    photoId: picked.id,
    query: picked.query,
    alt: picked.alt,
    url: picked.url,
  };
  sourced += 1;
  console.log(`OK     ${node.key}\n         q="${picked.query}" -> ${picked.id}  alt="${picked.alt}"`);
  if (sourced % 10 === 0) saveMap(map);
  await sleep(DELAY_MS);
}

saveMap(map);

// ─── Report ──────────────────────────────────────────────────────────────────
const nodeKeys = new Set(nodes.map((n) => n.key));
let legacyCount = 0;
let pexelsCount = 0;
const urlOwners = new Map();
const duplicateUrls = [];
for (const [key, entry] of Object.entries(map)) {
  if (!nodeKeys.has(key)) continue;
  if (entry.source === 'legacy') legacyCount += 1;
  else pexelsCount += 1;
  const photoKey = entry.photoId ? `pexels:${entry.photoId}` : `url:${entry.url}`;
  if (urlOwners.has(photoKey)) duplicateUrls.push(`${key} == ${urlOwners.get(photoKey)}`);
  else urlOwners.set(photoKey, key);
}
const missing = nodes.filter((n) => !map[n.key]).map((n) => n.key);

console.log('\n── build summary ─────────────────────────────');
console.log(`catalog nodes:        ${nodes.length}`);
console.log(`mapped:               ${legacyCount + pexelsCount}  (legacy ${legacyCount} / pexels ${pexelsCount})`);
console.log(`missing:              ${missing.length}${missing.length ? '\n  ' + missing.join('\n  ') : ''}`);
console.log(`duplicate sources:    ${duplicateUrls.length}${duplicateUrls.length ? '\n  ' + duplicateUrls.join('\n  ') : ''}`);
console.log(`failures:             ${failures.length}${failures.length ? '\n  ' + failures.map((f) => `${f.key} (${f.queries.join(' | ')})`).join('\n  ') : ''}`);
if (failures.length || missing.length || duplicateUrls.length) process.exit(1);
