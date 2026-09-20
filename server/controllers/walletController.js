import asyncHandler from '../utils/asyncHandler.js';
import Wallet from '../models/Wallet.js';
import Worker from '../models/Worker.js';
import Booking from '../models/Booking.js';

// Get worker's wallet
export const getWallet = asyncHandler(async (req, res) => {
  const worker = await Worker.findOne({ userId: req.user._id });
  if (!worker) { res.status(404); throw new Error('Worker profile not found'); }

  let wallet = await Wallet.findOne({ workerId: worker._id });
  if (!wallet) {
    wallet = await Wallet.create({ workerId: worker._id, balance: 0, transactions: [] });
  }

  res.json(wallet);
});

// Get wallet transaction history
export const getTransactions = asyncHandler(async (req, res) => {
  const worker = await Worker.findOne({ userId: req.user._id });
  if (!worker) { res.status(404); throw new Error('Worker profile not found'); }

  let wallet = await Wallet.findOne({ workerId: worker._id });
  if (!wallet) {
    wallet = await Wallet.create({ workerId: worker._id, balance: 0, transactions: [] });
  }

  res.json({
    balance: wallet.balance,
    transactions: wallet.transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
  });
});

// Withdraw from wallet
export const withdraw = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    res.status(400);
    throw new Error('Valid withdrawal amount is required');
  }

  const worker = await Worker.findOne({ userId: req.user._id });
  if (!worker) { res.status(404); throw new Error('Worker profile not found'); }

  // Block withdrawal if any booking is in-progress or pending confirmation
  const activeBooking = await Booking.findOne({
    workerId: worker._id,
    status: { $in: ['in-progress', 'work-completed-pending-confirmation'] },
  });
  if (activeBooking) {
    res.status(400);
    throw new Error('Cannot withdraw while a booking is active or pending confirmation');
  }

  let wallet = await Wallet.findOne({ workerId: worker._id });
  if (!wallet || wallet.balance < amount) {
    res.status(400);
    throw new Error('Insufficient wallet balance');
  }

  wallet.balance -= amount;
  wallet.transactions.push({
    type: 'withdrawal',
    amount: -amount,
    balanceAfter: wallet.balance,
    note: `Withdrawal of ₹${amount}`,
  });

  await wallet.save();
  res.json(wallet);
});

// Admin: adjust wallet balance (as a ledger transaction, not direct overwrite)
export const adminAdjustWallet = asyncHandler(async (req, res) => {
  const { workerId, amount, note } = req.body;
  if (!workerId || amount === undefined || !note) {
    res.status(400);
    throw new Error('Worker ID, amount, and note are required');
  }

  let wallet = await Wallet.findOne({ workerId });
  if (!wallet) {
    wallet = await Wallet.create({ workerId, balance: 0, transactions: [] });
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

// Admin: get any worker's wallet
export const adminGetWallet = asyncHandler(async (req, res) => {
  const { workerId } = req.params;
  let wallet = await Wallet.findOne({ workerId });
  if (!wallet) {
    wallet = await Wallet.create({ workerId, balance: 0, transactions: [] });
  }
  res.json(wallet);
});
