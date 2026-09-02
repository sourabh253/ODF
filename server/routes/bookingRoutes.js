import express from 'express';
import { createBooking, getMyBookings, updateBookingStatus } from '../controllers/bookingController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, authorize('customer'), createBooking);
router.get('/mine', protect, authorize('customer', 'worker'), getMyBookings);
router.patch('/:bookingId/status', protect, authorize('worker'), updateBookingStatus);

export default router;
