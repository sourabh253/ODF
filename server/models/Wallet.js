import mongoose from 'mongoose';

const walletTransactionSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
  },
  type: {
    type: String,
    enum: ['platform-fee-deduction', 'earning-credit', 'withdrawal', 'manual-adjustment'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  balanceAfter: {
    type: Number,
    required: true,
  },
  note: {
    type: String,
    default: '',
  },
}, { timestamps: true });

const walletSchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker',
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      default: 0,
      // No min constraint — cash bookings can legitimately take wallet negative
    },
    transactions: [walletTransactionSchema],
  },
  { timestamps: true }
);

const Wallet = mongoose.model('Wallet', walletSchema);
export default Wallet;
