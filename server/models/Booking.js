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
    selectedServices: [{
      serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceCatalog', required: true },
      serviceName: { type: String, required: true },
      mainCategory: { type: String },
      category: { type: String, required: true },
      subCategory: { type: String, required: true },
      unitPrice: { type: Number, required: true },
      quantity: { type: Number, required: true, min: 1 },
      lineTotal: { type: Number, required: true },
    }],
    servicesTotal: { type: Number, required: true },
    inspectionFee: { type: Number, required: true, default: 80 },
    tip: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    customerLocation: {
      address: String,
      lat: Number,
      lng: Number,
    },
    status: {
      type: String,
      enum: [
        'pending',
        'accepted',
        'rejected',
        'in-progress',
        'work-completed-pending-confirmation',
        'completed',
        'cancelled',
      ],
      default: 'pending',
    },
    paymentMode: {
      type: String,
      enum: ['cash-on-service', 'pay-before', null],
      default: null,
    },
    paymentStatus: {
      type: String,
      enum: ['not-required', 'pending', 'paid', 'settled'],
      default: 'not-required',
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    acceptedAt: { type: Date },
    workCompletedAt: { type: Date },
    confirmedAt: { type: Date },
  },
  { timestamps: true }
);

bookingSchema.index({ customerId: 1, createdAt: -1 });
bookingSchema.index({ workerId: 1, status: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
