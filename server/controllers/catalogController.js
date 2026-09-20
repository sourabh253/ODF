import asyncHandler from '../utils/asyncHandler.js';
import ServiceCatalog from '../models/ServiceCatalog.js';

// Get all unique main categories (customer-facing)
export const getMainCategories = asyncHandler(async (req, res) => {
  const mainCategories = await ServiceCatalog.distinct('mainCategory', { isActive: true });
  res.json(mainCategories);
});

// Get all unique service categories, optionally filtered by mainCategory
export const getCategories = asyncHandler(async (req, res) => {
  const { mainCategory } = req.query;
  const filter = { isActive: true };
  if (mainCategory) filter.mainCategory = mainCategory;
  const categories = await ServiceCatalog.distinct('category', filter);
  res.json(categories);
});

// Get subcategories for a category, optionally filtered by mainCategory
export const getSubCategories = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { mainCategory } = req.query;
  const filter = { category, isActive: true };
  if (mainCategory) filter.mainCategory = mainCategory;
  const subCategories = await ServiceCatalog.distinct('subCategory', filter);
  res.json(subCategories);
});

// Get services for a category (with optional subcategory/mainCategory filter)
export const getServices = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { subCategory, mainCategory } = req.query;

  const filter = { category, isActive: true };
  if (subCategory) filter.subCategory = subCategory;
  if (mainCategory) filter.mainCategory = mainCategory;

  const services = await ServiceCatalog.find(filter).sort({ subCategory: 1, serviceName: 1 });
  res.json(services);
});

// Get full catalog tree: mainCategory -> category -> subcategory -> services
export const getCatalogTree = asyncHandler(async (req, res) => {
  const { mainCategory } = req.query;
  const filter = { isActive: true };
  if (mainCategory) filter.mainCategory = mainCategory;

  const services = await ServiceCatalog.find(filter).sort({ mainCategory: 1, category: 1, subCategory: 1, serviceName: 1 });

  const tree = {};
  for (const svc of services) {
    if (!tree[svc.mainCategory]) tree[svc.mainCategory] = {};
    if (!tree[svc.mainCategory][svc.category]) tree[svc.mainCategory][svc.category] = {};
    if (!tree[svc.mainCategory][svc.category][svc.subCategory]) tree[svc.mainCategory][svc.category][svc.subCategory] = [];
    tree[svc.mainCategory][svc.category][svc.subCategory].push({
      _id: svc._id,
      serviceName: svc.serviceName,
      description: svc.description,
      price: svc.price,
      unit: svc.unit,
      isQuotationOnly: svc.isQuotationOnly,
    });
  }

  res.json(tree);
});

// Search services across all categories (for "All Services" aggregator)
export const searchServices = asyncHandler(async (req, res) => {
  const { q, mainCategory } = req.query;
  const filter = { isActive: true };
  if (mainCategory) filter.mainCategory = mainCategory;
  if (q) {
    filter.$or = [
      { serviceName: { $regex: q, $options: 'i' } },
      { category: { $regex: q, $options: 'i' } },
      { subCategory: { $regex: q, $options: 'i' } },
    ];
  }
  const services = await ServiceCatalog.find(filter).sort({ mainCategory: 1, category: 1, serviceName: 1 }).limit(100);
  res.json(services);
});

// Get a single service by ID
export const getServiceById = asyncHandler(async (req, res) => {
  const service = await ServiceCatalog.findById(req.params.serviceId);
  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }
  res.json(service);
});

// --- Admin-only controllers ---

// Create a new service
export const createService = asyncHandler(async (req, res) => {
  const { mainCategory, category, subCategory, serviceName, description, price, unit, isQuotationOnly } = req.body;

  if (!mainCategory || !category || !subCategory || !serviceName || price === undefined) {
    res.status(400);
    throw new Error('Main category, category, subcategory, service name, and price are required');
  }

  const service = await ServiceCatalog.create({
    mainCategory,
    category,
    subCategory,
    serviceName,
    description: description || '',
    price: Number(price),
    unit: unit || 'per job',
    isQuotationOnly: isQuotationOnly || false,
  });

  res.status(201).json(service);
});

// Update a service
export const updateService = asyncHandler(async (req, res) => {
  const service = await ServiceCatalog.findById(req.params.serviceId);
  if (!service) { res.status(404); throw new Error('Service not found'); }

  const allowed = ['mainCategory', 'category', 'subCategory', 'serviceName', 'description', 'price', 'unit', 'isQuotationOnly', 'isActive'];
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      service[key] = key === 'price' ? Number(req.body[key]) : req.body[key];
    }
  }

  await service.save();
  res.json(service);
});

// Delete a service (soft delete)
export const deleteService = asyncHandler(async (req, res) => {
  const service = await ServiceCatalog.findById(req.params.serviceId);
  if (!service) { res.status(404); throw new Error('Service not found'); }

  service.isActive = false;
  await service.save();
  res.json({ message: 'Service deactivated' });
});

// Get all services (admin, including inactive)
export const getAllServicesAdmin = asyncHandler(async (req, res) => {
  const services = await ServiceCatalog.find().sort({ mainCategory: 1, category: 1, subCategory: 1, serviceName: 1 });
  res.json(services);
});
