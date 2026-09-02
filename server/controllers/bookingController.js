import asyncHandler from '../utils/asyncHandler.js';
import Booking from '../models/Booking.js';
import Worker from '../models/Worker.js';

export const createBooking = asyncHandler(async (req, res) => {
  const {
    workerId,
    bookingType,
    duration,
    scheduledDate,
    scheduledTime,
    serviceAddress,
  } = req.body;

  if (!workerId || !['hourly', 'full-day'].includes(bookingType)) {
    res.status(400);
    throw new Error('Choose a valid worker and booking type');
  }

  const parsedDuration = Number(duration);
  if (!Number.isInteger(parsedDuration) || parsedDuration < 1 || parsedDuration > 24) {
    res.status(400);
    throw new Error('Duration must be a whole number between 1 and 24');
  }

  if (!scheduledDate || !scheduledTime || !serviceAddress?.trim()) {
    res.status(400);
    throw new Error('Date, time, and service address are required');
  }

  const worker = await Worker.findById(workerId);
  if (!worker) {
    res.status(404);
    throw new Error('Worker profile not found');
  }
  if (!worker.isAvailable) {
    res.status(400);
    throw new Error('This worker is currently unavailable');
  }

  const rate = bookingType === 'hourly' ? worker.hourlyCharge : worker.fullDayCharge;
  const estimatedPayment = bookingType === 'hourly' ? rate * parsedDuration : rate;
  if (estimatedPayment < 300) {
    res.status(400);
    throw new Error('Booking amount must be at least ₹300');
  }

  const booking = await Booking.create({
    customerId: req.user._id,
    workerId: worker._id,
    bookingType,
    duration: parsedDuration,
    scheduledDate,
    scheduledTime,
    serviceAddress: serviceAddress.trim(),
    estimatedPayment,
    status: 'pending',
  });

  const populatedBooking = await booking.populate([
    { path: 'customerId', select: 'fullName email phone' },
    { path: 'workerId', populate: { path: 'userId', select: 'fullName email' } },
  ]);
  req.app.get('io')?.to(`user:${populatedBooking.workerId.userId._id}`).emit('new_booking_request', populatedBooking);

  res.status(201).json(populatedBooking);
});

export const getMyBookings = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'customer'
    ? { customerId: req.user._id }
    : { workerId: (await Worker.findOne({ userId: req.user._id }).select('_id'))?._id };

  if (!filter.customerId && !filter.workerId) return res.json([]);

  const bookings = await Booking.find(filter)
    .populate('customerId', 'fullName email phone')
    .populate({ path: 'workerId', populate: { path: 'userId', select: 'fullName email' } })
    .sort({ createdAt: -1 });
  res.json(bookings);
});

export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['accepted', 'rejected'].includes(status)) {
    res.status(400);
    throw new Error('Invalid booking action');
  }

  const worker = await Worker.findOne({ userId: req.user._id }).select('_id');
  if (!worker) {
    res.status(404);
    throw new Error('Worker profile not found');
  }

  const booking = await Booking.findOneAndUpdate(
    { _id: req.params.bookingId, workerId: worker._id, status: 'pending' },
    { $set: { status } },
    { new: true }
  )
    .populate('customerId', 'fullName email phone')
    .populate({ path: 'workerId', populate: { path: 'userId', select: 'fullName email' } });

  if (!booking) {
    const existing = await Booking.findById(req.params.bookingId).select('workerId status');
    if (!existing) {
      res.status(404);
      throw new Error('Booking not found');
    }
    if (!existing.workerId.equals(worker._id)) {
      res.status(403);
      throw new Error('You are not authorized to modify this booking');
    }
    res.status(409);
    throw new Error('Only pending bookings can be updated');
  }

  req.app.get('io')?.to(`user:${booking.customerId._id}`).emit(
    status === 'accepted' ? 'booking_accepted' : 'booking_rejected',
    booking
  );
  res.json(booking);
});
