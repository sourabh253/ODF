import express from 'express';
import {
  getDashboardStats,
  getCustomers,
  getWorkers,
  getPendingVerifications,
  updateWorkerVerification,
  toggleWorkerStatus,
  getBookings,
  getWallets,
  adjustWallet,
} from '../controllers/adminController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All admin routes require auth + admin role
router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/customers', getCustomers);
router.get('/workers', getWorkers);
router.get('/workers/verifications', getPendingVerifications);
router.patch('/workers/:workerId/verify', updateWorkerVerification);
router.patch('/workers/:userId/toggle', toggleWorkerStatus);
router.get('/bookings', getBookings);
router.get('/wallets', getWallets);
router.post('/wallets/adjust', adjustWallet);

export default router;
