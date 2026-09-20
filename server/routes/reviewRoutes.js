import express from 'express';
import { submitReview, getWorkerReviews, getAllReviews } from '../controllers/reviewController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Customer submits review
router.post('/', protect, authorize('customer'), submitReview);

// Get reviews for a worker
router.get('/worker/:workerId', protect, getWorkerReviews);

// Admin: all reviews
router.get('/admin/all', protect, authorize('admin'), getAllReviews);

export default router;
