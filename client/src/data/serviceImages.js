// Central image map for the customer-facing marketplace UI.
//
// Hosting: every asset lives in the project's Cloudinary account under the
// `odforce/catalog` folder. They are uploaded by
// server/scripts/uploadCatalogImages.js using the existing CLOUDINARY_*
// environment config (server/config/cloudinary.js) — no credentials in the
// frontend, no local file paths, no direct third-party hotlinks.
//
// Delivery: all URLs below carry on-the-fly transformations
// (w, h, c_fill, q_auto, f_auto) so the browser only ever downloads a
// display-sized derivative, never the original file.
//
// Key = the Cloudinary public_id suffix. Images were chosen to be distinct
// and topically correct per category/subcategory (verified against the live
// catalog tree: 38 categories, 18 subcategories that differ from their
// category name).

const CLOUD = 'https://res.cloudinary.com/dnn5up0tl/image/upload';
const FOLDER = 'odforce/catalog';
const DEFAULT_KEY = 'livingRoom';

export const imageUrl = (key, w = 800, h = 500) =>
  `${CLOUD}/w_${w},h_${h},c_fill,q_auto,f_auto/${FOLDER}/${key}`;

const CATEGORY_IMAGES = {
  'AC Installation': 'acInstallation',
  'AC Service & Repair': 'acServiceRepair',
  'Bathroom Cleaning': 'bathroom',
  'Beard & Shaving': 'beardShaving',
  'Body Massage': 'massage',
  'Bridal & Special Occasion': 'bridal',
  'Carpenter': 'carpenterDrill',
  'Chair Cleaning': 'chairCleaning',
  'Chimney': 'chimney',
  'Deep Cleaning': 'sprayBottle',
  'Dishwasher': 'dishwasher',
  'Electrician': 'electricianHelmet',
  'Facial & Skin Care': 'facialMask',
  'Floor Cleaning': 'vacuumCarpet',
  'Geyser': 'geyser',
  'Grooming Packages': 'groomingPackages',
  'Hair & Beard Combo': 'hairBeardCombo',
  'Hair Care': 'longHair',
  'Hair Removal': 'hairRemoval',
  'Hair Spa': 'hairWash',
  'Hair Styling': 'hairStyling',
  'Haircut': 'haircut',
  'Head Massage': 'headMassage',
  'Home Cleaning': 'bedroom',
  'Kitchen Cleaning': 'kitchen',
  'Makeup': 'makeup',
  'Manicure & Pedicure': 'manicure',
  'Mattress Cleaning': 'bedLinen',
  'Microwave': 'microwave',
  'Other Home Appliances': 'craftsmanTools',
  'Pest Control': 'pestControl',
  'Plumber': 'faucet',
  'RO/Water Purifier': 'waterGlass',
  'Refrigerator': 'refrigerator',
  'Sofa Cleaning': 'sofaRoom',
  'Spa & Massage': 'spaMassage',
  'Washing Machine': 'washingMachineRoom',
  'Window & Glass Cleaning': 'windowCleaning',
};

// Subcategories whose name differs from their category (each gets its own
// image instead of reusing the parent category's).
const SUBCATEGORY_IMAGES = {
  'Door & Window': 'carpenterDoorWindow',
  'Drilling & Installation': 'drillingInstallation',
  'Furniture Assembly': 'furnitureAssembly',
  'Furniture Repair': 'furnitureRepair',
  'Doorbell': 'doorbell',
  'Electrical Appliances': 'electricalAppliances',
  'Electrical Inspection': 'electricalInspection',
  'Fans': 'ceilingFan',
  'Inverter & Stabilizer': 'inverterStabilizer',
  'Lights': 'lights',
  'Switches & Sockets': 'switchesSockets',
  'Wiring & Electrical Repair': 'wiringRepair',
  'Bathroom Plumbing': 'bathroomPlumbing',
  'Pipes & Leakage': 'pipesLeakage',
  'Sink': 'sinkPlumbing',
  'Taps & Faucets': 'tapsFaucets',
  'Toilet': 'toilet',
  'Water Supply': 'waterSupply',
};

const MAIN_CATEGORY_IMAGES = {
  'AC & Appliance Repair': 'applianceRepair',
  'Cleaning': 'cleaningTeam',
  'Electrician, Plumber & Carpenter': 'plumberRadiator',
  "Men's Salon & Massage": 'barbershop',
  "Women's Salon & Spa": 'hairBlowDry',
};

export const HERO_IMAGES = {
  main: imageUrl('windowCleanerSilhouette', 1200, 800),
  thumbs: [imageUrl('electricianPanel', 400, 400), imageUrl('facialTreatment', 400, 400)],
};

export const getCategoryImage = (category) =>
  imageUrl(CATEGORY_IMAGES[category] || DEFAULT_KEY);

export const getMainCategoryImage = (mainCategory) =>
  imageUrl(MAIN_CATEGORY_IMAGES[mainCategory] || DEFAULT_KEY);

export const getSubCategoryImage = (subCategory) =>
  imageUrl(SUBCATEGORY_IMAGES[subCategory] || DEFAULT_KEY);

export const getServiceImage = (service) => {
  if (!service) return imageUrl(DEFAULT_KEY);
  const key =
    SUBCATEGORY_IMAGES[service.subCategory] ||
    CATEGORY_IMAGES[service.category] ||
    MAIN_CATEGORY_IMAGES[service.mainCategory] ||
    DEFAULT_KEY;
  return imageUrl(key);
};
