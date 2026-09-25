import express from 'express';
import {
  getMainCategories,
  getCategories,
  getSubCategories,
  getServices,
  getCatalogTree,
  searchServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getAllServicesAdmin,
} from '../controllers/catalogController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public read routes — the service catalog is public marketplace data.
// Landing page, search and browsing must work for anonymous visitors.
// (Admin CRUD below stays behind protect + authorize('admin'))
router.get('/main-categories', getMainCategories);
router.get('/search', searchServices);
router.get('/tree', getCatalogTree);
router.get('/categories', getCategories);
router.get('/:category/subcategories', getSubCategories);
router.get('/:category/services', getServices);
router.get('/service/:serviceId', getServiceById);

// Admin-only routes
router.get('/admin/all', protect, authorize('admin'), getAllServicesAdmin);
router.post('/admin/service', protect, authorize('admin'), createService);
router.put('/admin/service/:serviceId', protect, authorize('admin'), updateService);
router.delete('/admin/service/:serviceId', protect, authorize('admin'), deleteService);

export default router;
