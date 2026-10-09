// Builds the complete catalog node inventory directly from the actual catalog
// source of truth (server/scripts/seedCatalog.js). Nothing is hard-coded here:
// every main category, service category, subcategory and service row in the
// seed becomes a node, so image mappings can never drift from the catalog.
//
// A node's identity is its full path (main > category > subcategory > service).
// Display names are converted to stable slugs used as image lookup keys.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SEED_PATH = fileURLToPath(new URL('../seedCatalog.js', import.meta.url));

export const slugify = (name) =>
  String(name)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' ')
    .replace(/['']/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

export const parseSeedServices = () => {
  const text = readFileSync(SEED_PATH, 'utf8');
  const start = text.indexOf('const services = [');
  if (start === -1) throw new Error('Could not locate services array in seedCatalog.js');
  const open = text.indexOf('[', start);
  let depth = 0;
  let end = -1;
  for (let i = open; i < text.length; i += 1) {
    if (text[i] === '[') depth += 1;
    else if (text[i] === ']') {
      depth -= 1;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end === -1) throw new Error('Unterminated services array in seedCatalog.js');
  // eslint-disable-next-line no-new-func
  const services = Function(`"use strict"; return (${text.slice(open, end + 1)});`)();
  if (!Array.isArray(services) || !services.length) throw new Error('Parsed empty services array');
  return services;
};

// Public-id paths (Cloudinary) for every node level. These are the stable
// identifiers the whole image system is built on.
export const mainImageId = (main) => `odforce/main-categories/${slugify(main)}`;
export const categoryImageId = (main, category) =>
  `odforce/categories/${slugify(main)}/${slugify(category)}`;
export const subcategoryImageId = (main, category, sub) =>
  `odforce/subcategories/${slugify(main)}/${slugify(category)}/${slugify(sub)}`;
// Services always carry the full path (main/category/subcategory/service) so
// the lookup is deterministic and never ambiguous, even when the same service
// name appears under two different subcategories or main categories.
export const serviceImageId = (main, category, sub, service) =>
  `odforce/services/${slugify(main)}/${slugify(category)}/${slugify(sub)}/${slugify(service)}`;

export const buildNodes = () => {
  const services = parseSeedServices();
  const nodes = [];
  const seen = new Map();

  const push = (node) => {
    if (!seen.has(node.key)) {
      seen.set(node.key, node);
      nodes.push(node);
    }
  };

  const mains = [...new Set(services.map((s) => s.mainCategory))];
  const catSlots = [
    ...new Map(services.map((s) => [`${s.mainCategory}||${s.category}`, s])).values(),
  ];
  const subSlots = [
    ...new Map(
      services.map((s) => [`${s.mainCategory}||${s.category}||${s.subCategory}`, s])
    ).values(),
  ];

  for (const main of mains) {
    push({ level: 'main', key: mainImageId(main), main });
  }
  for (const s of catSlots) {
    push({ level: 'category', key: categoryImageId(s.mainCategory, s.category), main: s.mainCategory, category: s.category });
  }
  for (const s of subSlots) {
    push({
      level: 'subcategory',
      key: subcategoryImageId(s.mainCategory, s.category, s.subCategory),
      main: s.mainCategory,
      category: s.category,
      subCategory: s.subCategory,
    });
  }

  for (const s of services) {
    push({
      level: 'service',
      key: serviceImageId(s.mainCategory, s.category, s.subCategory, s.serviceName),
      main: s.mainCategory,
      category: s.category,
      subCategory: s.subCategory,
      serviceName: s.serviceName,
    });
  }

  const counts = {
    mains: nodes.filter((n) => n.level === 'main').length,
    categories: nodes.filter((n) => n.level === 'category').length,
    subcategories: nodes.filter((n) => n.level === 'subcategory').length,
    services: nodes.filter((n) => n.level === 'service').length,
    total: nodes.length,
    serviceRows: services.length,
  };

  return { nodes, counts, services };
};
