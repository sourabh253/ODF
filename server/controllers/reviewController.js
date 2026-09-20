import asyncHandler from '../utils/asyncHandler.js';
import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import Worker from '../models/Worker.js';

// Submit a review for a completed booking
export const submitReview = asyncHandler(async (req, res) => {
  const { bookingId, rating, comment } = req.body;

  if (!bookingId || !rating) {
    res.status(400);
    throw new Error('Booking ID and rating are required');
  }

  if (rating < 1 || rating > 5) {
    res.status(400);
    throw new Error('Rating must be between 1 and 5');
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) { res.status(404); throw new Error('Booking not found'); }
  if (booking.customerId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }
  if (booking.status !== 'completed') {
    res.status(400);
    throw new Error('Can only review completed bookings');
  }

  const existingReview = await Review.findOne({ bookingId });
  if (existingReview) {
    res.status(400);
    throw new Error('Review already submitted for this booking');
  }

  const review = await Review.create({
    bookingId,
    customerId: req.user._id,
    workerId: booking.workerId,
    rating: Number(rating),
    comment: comment || '',
  });

  // Recompute worker's average rating
  const worker = await Worker.findById(booking.workerId);
  if (worker) {
    const stats = await Review.aggregate([
      { $match: { workerId: worker._id } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    if (stats.length > 0) {
      worker.rating = Math.round(stats[0].avgRating * 10) / 10;
      worker.totalReviews = stats[0].count;
      await worker.save();
    }
  }

  res.status(201).json(review);
});

// Get reviews for a worker
export const getWorkerReviews = asyncHandler(async (req, res) => {
  const { workerId } = req.params;
  const reviews = await Review.find({ workerId })
    .populate('customerId', 'fullName')
    .sort({ createdAt: -1 });
  res.json(reviews);
});

// Admin: get all reviews
export const getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find()
    .populate('customerId', 'fullName email')
    .populate({ path: 'workerId', populate: { path: 'userId', select: 'fullName email' } })
    .populate('bookingId', 'totalAmount status')
    .sort({ createdAt: -1 });
  res.json(reviews);
});
