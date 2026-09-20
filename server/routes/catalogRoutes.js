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

// Public routes (authenticated users can browse)
router.get('/main-categories', protect, getMainCategories);
router.get('/search', protect, searchServices);
router.get('/tree', protect, getCatalogTree);
router.get('/categories', protect, getCategories);
router.get('/:category/subcategories', protect, getSubCategories);
router.get('/:category/services', protect, getServices);
router.get('/service/:serviceId', protect, getServiceById);

// Admin-only routes
router.get('/admin/all', protect, authorize('admin'), getAllServicesAdmin);
router.post('/admin/service', protect, authorize('admin'), createService);
router.put('/admin/service/:serviceId', protect, authorize('admin'), updateService);
router.delete('/admin/service/:serviceId', protect, authorize('admin'), deleteService);

export default router;
