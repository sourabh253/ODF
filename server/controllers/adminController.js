import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';
import Worker from '../models/Worker.js';
import Booking from '../models/Booking.js';
import Wallet from '../models/Wallet.js';
import Review from '../models/Review.js';

// Dashboard stats
export const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalCustomers, totalWorkers, totalBookings, completedBookings, activeBookings] = await Promise.all([
    User.countDocuments({ role: 'customer' }),
    User.countDocuments({ role: 'worker' }),
    Booking.countDocuments(),
    Booking.countDocuments({ status: 'completed' }),
    Booking.countDocuments({ status: { $in: ['pending', 'accepted', 'in-progress'] } }),
  ]);

  const totalRevenue = await Booking.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } },
  ]);

  res.json({
    totalCustomers,
    totalWorkers,
    totalBookings,
    completedBookings,
    activeBookings,
    totalRevenue: totalRevenue[0]?.total || 0,
  });
});

// List all customers
export const getCustomers = asyncHandler(async (req, res) => {
  const customers = await User.find({ role: 'customer' }).select('-passwordHash').sort({ createdAt: -1 });
  res.json(customers);
});

// List all workers
export const getWorkers = asyncHandler(async (req, res) => {
  const workers = await Worker.find()
    .populate('userId', 'fullName email phone isActive')
    .sort({ createdAt: -1 });
  res.json(workers);
});

// Get pending worker verifications
export const getPendingVerifications = asyncHandler(async (req, res) => {
  const workers = await Worker.find({ verificationStatus: 'pending' })
    .populate('userId', 'fullName email phone')
    .sort({ createdAt: -1 });
  res.json(workers);
});

// Update worker verification status
export const updateWorkerVerification = asyncHandler(async (req, res) => {
  const { workerId } = req.params;
  const { verificationStatus } = req.body;

  if (!['verified', 'rejected'].includes(verificationStatus)) {
    res.status(400);
    throw new Error('verificationStatus must be "verified" or "rejected"');
  }

  const worker = await Worker.findById(workerId);
  if (!worker) {
    res.status(404);
    throw new Error('Worker not found');
  }

  worker.verificationStatus = verificationStatus;
  await worker.save();

  res.json({ workerId: worker._id, verificationStatus: worker.verificationStatus });
});

// Toggle worker active status
export const toggleWorkerStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);
  if (!user || user.role !== 'worker') { res.status(404); throw new Error('Worker not found'); }

  user.isActive = !user.isActive;
  await user.save();
  res.json({ isActive: user.isActive });
});

// List all bookings
export const getBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find()
    .populate('customerId', 'fullName email phone')
    .populate({ path: 'workerId', populate: { path: 'userId', select: 'fullName email phone' } })
    .sort({ createdAt: -1 });
  res.json(bookings);
});

// List all wallets
export const getWallets = asyncHandler(async (req, res) => {
  const wallets = await Wallet.find()
    .populate({ path: 'workerId', populate: { path: 'userId', select: 'fullName email' } });
  res.json(wallets);
});

// Admin adjust wallet
export const adjustWallet = asyncHandler(async (req, res) => {
  const { workerUserId, amount, note } = req.body;
  if (!workerUserId || amount === undefined || !note) {
    res.status(400);
    throw new Error('Worker user ID, amount, and note are required');
  }

  const worker = await Worker.findOne({ userId: workerUserId });
  if (!worker) { res.status(404); throw new Error('Worker profile not found'); }

  let wallet = await Wallet.findOne({ workerId: worker._id });
  if (!wallet) {
    wallet = await Wallet.create({ workerId: worker._id, balance: 0, transactions: [] });
  }

  wallet.balance += Number(amount);
  wallet.transactions.push({
    type: 'manual-adjustment',
    amount: Number(amount),
    balanceAfter: wallet.balance,
    note,
  });

  await wallet.save();
  res.json(wallet);
});
