import asyncHandler from '../utils/asyncHandler.js';
import razorpay from '../config/razorpay.js';
import Booking from '../models/Booking.js';
import Coupon from '../models/Coupon.js';
import crypto from 'crypto';

// Create Razorpay order
export const createOrder = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;

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

  if (booking.paymentStatus === 'paid') {
    res.status(400);
    throw new Error('Booking is already paid');
  }

  const order = await razorpay.orders.create({
    amount: booking.totalAmount * 100, // Razorpay expects paise
    currency: 'INR',
    receipt: `booking_${booking._id}`,
  });

  booking.razorpayOrderId = order.id;
  booking.paymentMode = 'pay-before';
  booking.paymentStatus = 'pending';
  await booking.save();

  res.json({
    orderId: order.id,
    amount: booking.totalAmount,
    currency: 'INR',
    key: process.env.RAZORPAY_KEY_ID,
  });
});

// Verify payment and confirm
export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
    res.status(400);
    throw new Error('All payment details are required');
  }

  // Server-side signature verification
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    res.status(400);
    throw new Error('Payment verification failed — invalid signature');
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) { res.status(404); throw new Error('Booking not found'); }

  booking.razorpayPaymentId = razorpay_payment_id;
  booking.paymentStatus = 'paid';
  booking.paymentMode = 'pay-before';
  booking.amountPaid = booking.totalAmount;

  // A verified payment is what unlocks work: mirror the simulated path so the
  // worker can move the booking to in-progress.
  if (booking.status === 'accepted') {
    booking.status = 'confirmed';
    booking.confirmedAt = new Date();
  }
  await booking.save();

  res.json({ message: 'Payment verified successfully', bookingId: booking._id });
});

// Validate coupon and return discount amount
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, bookingId } = req.body;

  if (!code || !bookingId) {
    res.status(400);
    throw new Error('Coupon code and booking ID are required');
  }

  const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
  if (!coupon) {
    res.status(400);
    throw new Error('Invalid coupon code');
  }

  if (!coupon.isActive) {
    res.status(400);
    throw new Error('This coupon is no longer active');
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    res.status(400);
    throw new Error('This coupon has expired');
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    res.status(400);
    throw new Error('This coupon has reached its usage limit');
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) { res.status(404); throw new Error('Booking not found'); }
  if (booking.customerId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  if (booking.totalAmount < coupon.minBookingAmount) {
    res.status(400);
    throw new Error(`Minimum booking amount of ₹${coupon.minBookingAmount} required for this coupon`);
  }

  let discount = 0;
  if (coupon.discountType === 'flat') {
    discount = coupon.discountValue;
  } else {
    discount = Math.round(booking.totalAmount * coupon.discountValue / 100);
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  }

  // Don't let discount exceed total
  if (discount >= booking.totalAmount) {
    discount = booking.totalAmount - 1; // keep at least ₹1
  }

  res.json({
    valid: true,
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discount,
    finalAmount: booking.totalAmount - discount,
  });
});
