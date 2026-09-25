const PRIORITY_CATEGORIES = [
  'AC Service & Repair',
  'Deep Cleaning',
  'Sofa Cleaning',
  'Electrician',
  'Plumber',
  'Carpenter',
  'Pest Control',
  'Washing Machine',
  'Haircut',
  'Facial & Skin Care',
  'Manicure & Pedicure',
  'Body Massage',
];

export const flattenCatalogTree = (tree) => {
  const services = [];
  Object.entries(tree || {}).forEach(([mainCategory, categories]) => {
    Object.entries(categories || {}).forEach(([category, subCategories]) => {
      Object.entries(subCategories || {}).forEach(([subCategory, list]) => {
        (list || []).forEach((service) => {
          services.push({ ...service, mainCategory, category, subCategory });
        });
      });
    });
  });
  return services;
};

export const servicesByMainCategory = (services) => {
  const grouped = {};
  services.forEach((service) => {
    if (!grouped[service.mainCategory]) grouped[service.mainCategory] = [];
    grouped[service.mainCategory].push(service);
  });
  return grouped;
};

// No booking counts exist in the catalog, so "popular" is a curated shortlist:
// one entry-price service from each high-intent category.
export const pickPopularServices = (services, limit = 10) => {
  const picked = [];
  PRIORITY_CATEGORIES.forEach((category) => {
    const inCategory = services.filter((service) => service.category === category);
    if (!inCategory.length) return;
    const cheapest = inCategory.reduce((best, service) =>
      (service.price ?? Infinity) < (best.price ?? Infinity) ? service : best
    );
    picked.push(cheapest);
  });
  return picked.slice(0, limit);
};
