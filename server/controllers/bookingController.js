import asyncHandler from '../utils/asyncHandler.js';
import Booking from '../models/Booking.js';
import Worker from '../models/Worker.js';
import Wallet from '../models/Wallet.js';
import Notification from '../models/Notification.js';
import mongoose from 'mongoose';

const INSPECTION_FEE = 80;

// Create a new booking (customer sends request)
export const createBooking = asyncHandler(async (req, res) => {
  const { workerId, selectedServices, customerLocation, tip } = req.body;

  if (!workerId || !selectedServices || !Array.isArray(selectedServices) || selectedServices.length === 0) {
    res.status(400);
    throw new Error('Worker ID and at least one selected service are required');
  }

  if (!customerLocation || !customerLocation.address) {
    res.status(400);
    throw new Error('Customer location is required');
  }

  // Verify worker exists and is available
  const worker = await Worker.findById(workerId);
  if (!worker) {
    res.status(404);
    throw new Error('Worker not found');
  }
  if (!worker.isAvailable) {
    res.status(400);
    throw new Error('Worker is not currently available');
  }

  // Server-side price validation: look up each service in the catalog
  const ServiceCatalog = mongoose.model('ServiceCatalog');
  let servicesTotal = 0;
  const snapshotServices = [];

  for (const item of selectedServices) {
    const service = await ServiceCatalog.findById(item.serviceId);
    if (!service || !service.isActive) {
      res.status(400);
      throw new Error(`Service not found or inactive: ${item.serviceId}`);
    }
    const qty = Math.max(1, parseInt(item.quantity) || 1);
    const lineTotal = service.price * qty;
    servicesTotal += lineTotal;
    snapshotServices.push({
      serviceId: service._id,
      serviceName: service.serviceName,
      mainCategory: service.mainCategory,
      category: service.category,
      subCategory: service.subCategory,
      unitPrice: service.price,
      quantity: qty,
      lineTotal,
    });
  }

  const tipAmount = Math.max(0, Number(tip) || 0);
  const totalAmount = servicesTotal + INSPECTION_FEE + tipAmount;

  const booking = await Booking.create({
    customerId: req.user._id,
    workerId,
    selectedServices: snapshotServices,
    servicesTotal,
    inspectionFee: INSPECTION_FEE,
    tip: tipAmount,
    totalAmount,
    customerLocation,
    status: 'pending',
  });

  // Emit real-time event to the worker
  const io = req.app.get('io');
  if (io) {
    io.to(`user:${workerId}`).emit('new_booking_request', {
      booking,
      customer: { _id: req.user._id, fullName: req.user.fullName },
    });
  }

  // Persist notification for the worker
  const workerUser = await Worker.findById(workerId).populate('userId', '_id');
  if (workerUser?.userId) {
    const serviceNames = snapshotServices.map(s => s.serviceName).join(', ');
    await Notification.create({
      userId: workerUser.userId._id,
      type: 'new_booking_request',
      title: 'New Booking Request',
      message: `${req.user.fullName} wants to book: ${serviceNames}`,
      bookingId: booking._id,
    });
  }

  res.status(201).json(booking);
});

// Get bookings for the logged-in user (customer or worker)
export const getMyBookings = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'worker'
    ? { workerId: (await Worker.findOne({ userId: req.user._id }))?._id }
    : { customerId: req.user._id };

  if (!filter.workerId && !filter.customerId) {
    return res.json([]);
  }

  const bookings = await Booking.find(filter)
    .populate({ path: 'customerId', select: 'fullName email phone location' })
    .populate({ path: 'workerId', populate: { path: 'userId', select: 'fullName email phone' } })
    .sort({ createdAt: -1 });

  res.json(bookings);
});

// Worker accepts or rejects a booking
export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const { status } = req.body;

  if (!['accepted', 'rejected'].includes(status)) {
    res.status(400);
    throw new Error('Status must be "accepted" or "rejected"');
  }

  const worker = await Worker.findOne({ userId: req.user._id });
  if (!worker) {
    res.status(404);
    throw new Error('Worker profile not found');
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  if (booking.workerId.toString() !== worker._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this booking');
  }

  if (booking.status !== 'pending') {
    res.status(409);
    throw new Error('Only pending bookings can be updated');
  }

  booking.status = status;
  booking.acceptedAt = status === 'accepted' ? new Date() : undefined;
  await booking.save();

  // Emit real-time event to the customer
  const io = req.app.get('io');
  if (io) {
    const event = status === 'accepted' ? 'booking_accepted' : 'booking_rejected';
    io.to(`user:${booking.customerId}`).emit(event, {
      bookingId: booking._id,
      status,
    });
  }

  // Persist notification for the customer
  const notifType = status === 'accepted' ? 'booking_accepted' : 'booking_rejected';
  const notifTitle = status === 'accepted' ? 'Booking Accepted' : 'Booking Rejected';
  const notifMessage = status === 'accepted'
    ? 'Your booking has been accepted by the worker.'
    : 'Your booking has been rejected by the worker.';
  await Notification.create({
    userId: booking.customerId,
    type: notifType,
    title: notifTitle,
    message: notifMessage,
    bookingId: booking._id,
  });

  res.json(booking);
});

// Worker marks booking as in-progress — ONLY allowed on confirmed bookings
export const startBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const worker = await Worker.findOne({ userId: req.user._id });
  if (!worker) { res.status(404); throw new Error('Worker profile not found'); }

  const booking = await Booking.findById(bookingId);
  if (!booking) { res.status(404); throw new Error('Booking not found'); }
  if (booking.workerId.toString() !== worker._id.toString()) { res.status(403); throw new Error('Not authorized'); }
  if (booking.status !== 'confirmed') {
    res.status(409);
    throw new Error('Booking must be confirmed (payment resolved) before work can start');
  }

  booking.status = 'in-progress';
  await booking.save();

  // Notify customer that worker is on the way
  const io = req.app.get('io');
  if (io) {
    io.to(`user:${booking.customerId}`).emit('work_started', { bookingId: booking._id });
  }

  await Notification.create({
    userId: booking.customerId,
    type: 'work_started',
    title: 'Worker On The Way',
    message: 'Your worker is on the way — arriving in about 20 minutes',
    bookingId: booking._id,
  });

  res.json(booking);
});

// Worker marks work completed
export const completeWork = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const worker = await Worker.findOne({ userId: req.user._id });
  if (!worker) { res.status(404); throw new Error('Worker profile not found'); }

  const booking = await Booking.findById(bookingId);
  if (!booking) { res.status(404); throw new Error('Booking not found'); }
  if (booking.workerId.toString() !== worker._id.toString()) { res.status(403); throw new Error('Not authorized'); }
  if (booking.status !== 'in-progress') { res.status(409); throw new Error('Only in-progress bookings can be completed'); }

  booking.status = 'work-completed-pending-confirmation';
  booking.workCompletedAt = new Date();
  await booking.save();

  const io = req.app.get('io');
  if (io) {
    io.to(`user:${booking.customerId}`).emit('work_completed', { bookingId: booking._id });
  }

  // Persist notification for the customer
  await Notification.create({
    userId: booking.customerId,
    type: 'work_completed',
    title: 'Work Completed',
    message: 'The worker has marked the job as completed. Please verify and confirm.',
    bookingId: booking._id,
  });

  res.json(booking);
});

// Customer confirms completion (triggers settlement)
export const confirmCompletion = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  const booking = await Booking.findById(bookingId);
  if (!booking) { res.status(404); throw new Error('Booking not found'); }
  if (booking.customerId.toString() !== req.user._id.toString()) { res.status(403); throw new Error('Not authorized'); }
  if (booking.status !== 'work-completed-pending-confirmation') {
    res.status(409);
    throw new Error('Only work-completed bookings can be confirmed');
  }

  booking.status = 'completed';
  booking.confirmedAt = new Date();
  await booking.save();

  // Settlement: credit or deduct from worker wallet
  const worker = await Worker.findById(booking.workerId);
  if (worker) {
    let wallet = await Wallet.findOne({ workerId: worker._id });
    if (!wallet) {
      wallet = await Wallet.create({ workerId: worker._id, balance: 0, transactions: [] });
    }

    if (booking.paymentMode === 'cash-on-service' || !booking.paymentMode) {
      // Cash booking: platform fee deducted from worker wallet
      const platformFee = Math.round(booking.totalAmount * 0.10); // 10% platform fee
      wallet.balance -= platformFee;
      wallet.transactions.push({
        bookingId: booking._id,
        type: 'platform-fee-deduction',
        amount: -platformFee,
        balanceAfter: wallet.balance,
        note: `Platform fee for booking ${booking._id}`,
      });
    } else {
      // Pay Before: worker earning credited (totalAmount - platform fee)
      const platformFee = Math.round(booking.totalAmount * 0.10);
      const earning = booking.totalAmount - platformFee;
      wallet.balance += earning;
      wallet.transactions.push({
        bookingId: booking._id,
        type: 'earning-credit',
        amount: earning,
        balanceAfter: wallet.balance,
        note: `Earning for booking ${booking._id}`,
      });
    }

    await wallet.save();

    // Update worker stats
    worker.totalJobsCompleted = (worker.totalJobsCompleted || 0) + 1;
    await worker.save();
  }

  const io = req.app.get('io');
  if (io) {
    io.to(`user:${booking.customerId}`).emit('booking_confirmed', { bookingId: booking._id });
    io.to(`user:${booking.workerId}`).emit('booking_confirmed', { bookingId: booking._id });
  }

  // Persist notifications for both parties
  await Notification.create({
    userId: booking.customerId,
    type: 'booking_confirmed',
    title: 'Booking Completed',
    message: 'Your booking has been confirmed and completed. Thank you!',
    bookingId: booking._id,
  });

  // Find worker's userId to notify them
  const workerForNotif = await Worker.findById(booking.workerId).populate('userId', '_id');
  if (workerForNotif?.userId) {
    await Notification.create({
      userId: workerForNotif.userId._id,
      type: 'booking_confirmed',
      title: 'Booking Completed',
      message: 'A booking has been confirmed. Payment has been settled.',
      bookingId: booking._id,
    });
  }

  res.json(booking);
});

// Cancel booking (customer can cancel if pending, worker can cancel if accepted but not in-progress)
export const cancelBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const booking = await Booking.findById(bookingId);
  if (!booking) { res.status(404); throw new Error('Booking not found'); }

  const isCustomer = booking.customerId.toString() === req.user._id.toString();
  const worker = await Worker.findOne({ userId: req.user._id });
  const isWorker = worker && booking.workerId.toString() === worker._id.toString();

  if (!isCustomer && !isWorker) { res.status(403); throw new Error('Not authorized'); }

  if (isCustomer && booking.status !== 'pending') {
    res.status(409);
    throw new Error('Customers can only cancel pending bookings');
  }
  if (isWorker && !['accepted', 'in-progress'].includes(booking.status)) {
    res.status(409);
    throw new Error('Cannot cancel this booking');
  }

  booking.status = 'cancelled';
  await booking.save();

  const io = req.app.get('io');
  if (io) {
    const targetId = isCustomer ? booking.workerId : booking.customerId;
    io.to(`user:${targetId}`).emit('booking_cancelled', { bookingId: booking._id });
  }

  // Persist notification for the other party
  const cancelTargetId = isCustomer ? booking.workerId : booking.customerId;
  const cancelNotifUserId = isCustomer
    ? (await Worker.findById(booking.workerId).populate('userId', '_id'))?.userId?._id
    : booking.customerId;
  if (cancelNotifUserId) {
    await Notification.create({
      userId: cancelNotifUserId,
      type: 'booking_cancelled',
      title: 'Booking Cancelled',
      message: `A booking has been cancelled by the ${isCustomer ? 'customer' : 'worker'}.`,
      bookingId: booking._id,
    });
  }

  res.json(booking);
});

// Customer sets payment mode after booking is accepted
// Cash on Service: immediately confirms the booking (no payment needed now)
// Pay Before: sets paymentStatus to pending, customer proceeds to Pay Before page
export const setPaymentMode = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const { paymentMode } = req.body;

  if (!['cash-on-service', 'pay-before'].includes(paymentMode)) {
    res.status(400);
    throw new Error('Payment mode must be "cash-on-service" or "pay-before"');
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) { res.status(404); throw new Error('Booking not found'); }
  if (booking.customerId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }
  if (booking.status !== 'accepted') {
    res.status(409);
    throw new Error('Can only set payment mode on accepted bookings');
  }

  booking.paymentMode = paymentMode;
  if (paymentMode === 'cash-on-service') {
    // Cash on Service — no online payment, booking is confirmed immediately
    booking.paymentStatus = 'not-required';
    booking.status = 'confirmed';
    booking.confirmedAt = new Date();
  } else {
    // Pay Before — customer will pay via simulated checkout next
    booking.paymentStatus = 'pending';
  }
  await booking.save();

  // If cash-on-service, notify the worker that booking is confirmed
  if (paymentMode === 'cash-on-service') {
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${booking.workerId}`).emit('booking_confirmed', { bookingId: booking._id });
    }
    const workerForNotif = await Worker.findById(booking.workerId).populate('userId', '_id');
    if (workerForNotif?.userId) {
      await Notification.create({
        userId: workerForNotif.userId._id,
        type: 'booking_confirmed',
        title: 'Booking Confirmed',
        message: 'Customer selected Cash on Service. You can start work when ready.',
        bookingId: booking._id,
      });
    }
  }

  res.json(booking);
});

// Simulated payment — no real Razorpay call. Recalculates server-side, marks paid, confirms booking.
// SIMULATED PAYMENT — no live payment gateway account exists yet. This directly marks payment as successful.
// Replace with real Razorpay (or another gateway) integration before any real money is involved.
export const simulatePayment = asyncHandler(async (req, res) => {
  const { bookingId, couponCode } = req.body;

  if (!bookingId) {
    res.status(400);
    throw new Error('Booking ID is required');
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) { res.status(404); throw new Error('Booking not found'); }
  if (booking.customerId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }
  if (booking.status !== 'accepted') {
    res.status(409);
    throw new Error('Booking must be in accepted state to pay');
  }
  if (booking.paymentMode !== 'pay-before') {
    res.status(409);
    throw new Error('Payment mode must be pay-before');
  }

  // Server-side recalculation of final total
  let finalAmount = booking.totalAmount;
  let discount = 0;

  if (couponCode) {
    const Coupon = (await import('../models/Coupon.js')).default;
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase().trim() });
    if (coupon && coupon.isActive && (!coupon.expiresAt || coupon.expiresAt >= new Date())) {
      if (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) {
        if (booking.totalAmount >= (coupon.minBookingAmount || 0)) {
          if (coupon.discountType === 'flat') {
            discount = coupon.discountValue;
          } else {
            discount = Math.round(booking.totalAmount * coupon.discountValue / 100);
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
              discount = coupon.maxDiscount;
            }
          }
          if (discount >= booking.totalAmount) {
            discount = booking.totalAmount - 1;
          }
          finalAmount = booking.totalAmount - discount;
          // Increment coupon usage
          coupon.usedCount = (coupon.usedCount || 0) + 1;
          await coupon.save();
        }
      }
    }
  }

  // Mark payment as paid and confirm the booking
  booking.paymentStatus = 'paid';
  booking.status = 'confirmed';
  booking.confirmedAt = new Date();
  await booking.save();

  // Notify the worker
  const io = req.app.get('io');
  if (io) {
    io.to(`user:${booking.workerId}`).emit('booking_confirmed', { bookingId: booking._id });
  }
  const workerForNotif = await Worker.findById(booking.workerId).populate('userId', '_id');
  if (workerForNotif?.userId) {
    await Notification.create({
      userId: workerForNotif.userId._id,
      type: 'booking_confirmed',
      title: 'Booking Confirmed',
      message: 'Customer has paid online. You can start work when ready.',
      bookingId: booking._id,
    });
  }

  res.json({
    success: true,
    bookingId: booking._id,
    finalAmount,
    discount,
    paymentStatus: 'paid',
    status: 'confirmed',
  });
});

// Auto-expire pending bookings older than 5 minutes (admin endpoint / manual trigger)
// Uses targeted updateMany to avoid full-document schema validation on stale pre-pivot data.
export const autoExpireBookings = asyncHandler(async (req, res) => {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  // Lean query — only fetch IDs and foreign keys needed for notifications
  const expiredBookings = await Booking.find({
    status: 'pending',
    createdAt: { $lt: fiveMinutesAgo },
    autoExpired: { $ne: true },
  }).select('_id customerId workerId').lean();

  if (expiredBookings.length === 0) {
    return res.json({ expiredCount: 0 });
  }

  // Bulk update — skip validation since we're only touching status/autoExpired/expiredAt
  await Booking.updateMany(
    { _id: { $in: expiredBookings.map(b => b._id) } },
    { $set: { status: 'rejected', autoExpired: true, expiredAt: new Date() } },
    { runValidators: false }
  );

  const io = req.app.get('io');
  let expiredCount = 0;

  for (const booking of expiredBookings) {
    if (io) {
      io.to(`user:${booking.customerId}`).emit('booking_rejected', {
        bookingId: booking._id,
        status: 'rejected',
        autoExpired: true,
      });
    }

    await Notification.create({
      userId: booking.customerId,
      type: 'booking_auto_expired',
      title: 'Booking Request Expired',
      message: 'Your booking request expired because the worker did not respond within 5 minutes.',
      bookingId: booking._id,
    });

    const workerForNotif = await Worker.findById(booking.workerId).select('userId').populate('userId', '_id');
    if (workerForNotif?.userId) {
      await Notification.create({
        userId: workerForNotif.userId._id,
        type: 'booking_auto_expired',
        title: 'Booking Request Expired',
        message: 'A booking request expired because it was not responded to within 5 minutes.',
        bookingId: booking._id,
      });
    }

    expiredCount++;
  }

  res.json({ expiredCount });
});
