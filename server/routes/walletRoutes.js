import express from 'express';
import {
  getWallet,
  getTransactions,
  withdraw,
  manualCredit,
  manualDebit,
  adminAdjustWallet,
  adminGetWallet,
} from '../controllers/walletController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Worker routes
router.get('/', protect, authorize('worker'), getWallet);
router.get('/transactions', protect, authorize('worker'), getTransactions);
router.post('/withdraw', protect, authorize('worker'), withdraw);
router.post('/credit', protect, authorize('worker'), manualCredit);
router.post('/debit', protect, authorize('worker'), manualDebit);

// Admin routes
router.get('/admin/:workerId', protect, authorize('admin'), adminGetWallet);
router.post('/admin/adjust', protect, authorize('admin'), adminAdjustWallet);

export default router;
