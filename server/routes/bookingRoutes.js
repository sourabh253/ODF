import express from 'express';
import {
  createBooking,
  getMyBookings,
  updateBookingStatus,
  startBooking,
  completeWork,
  confirmCompletion,
  cancelBooking,
  setPaymentMode,
} from '../controllers/bookingController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, authorize('customer'), createBooking);
router.get('/mine', protect, authorize('customer', 'worker'), getMyBookings);
router.patch('/:bookingId/status', protect, authorize('worker'), updateBookingStatus);
router.patch('/:bookingId/start', protect, authorize('worker'), startBooking);
router.patch('/:bookingId/complete', protect, authorize('worker'), completeWork);
router.patch('/:bookingId/confirm', protect, authorize('customer'), confirmCompletion);
router.patch('/:bookingId/cancel', protect, cancelBooking);
router.patch('/:bookingId/payment-mode', protect, authorize('customer'), setPaymentMode);

// Admin: get all bookings
router.get('/admin/all', protect, authorize('admin'), async (req, res, next) => {
  try {
    const Booking = (await import('../models/Booking.js')).default;
    const bookings = await Booking.find()
      .populate('customerId', 'fullName email phone')
      .populate({ path: 'workerId', populate: { path: 'userId', select: 'fullName email phone' } })
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    next(err);
  }
});

export default router;
