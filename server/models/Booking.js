import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker',
      required: true,
    },
    bookingType: {
      type: String,
      enum: ['hourly', 'full-day'],
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    scheduledTime: {
      type: String,
      required: true,
      trim: true,
    },
    serviceAddress: {
      type: String,
      required: true,
      trim: true,
    },
    estimatedPayment: {
      type: Number,
      required: true,
      min: 300,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'confirmed', 'in-progress', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
