import express from 'express';
import { createOrder, verifyPayment, validateCoupon } from '../controllers/paymentController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create-order', protect, authorize('customer'), createOrder);
router.post('/verify', protect, authorize('customer'), verifyPayment);
router.post('/coupon/validate', protect, authorize('customer'), validateCoupon);

export default router;
