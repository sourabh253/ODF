import mongoose from 'mongoose';

const workerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    profilePhotoUrl: { type: String, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    dob: { type: Date, required: true },
    
    // Location
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pinCode: { type: String, required: true },
    
    // Work Details
    occupation: { type: String, required: true },
    skills: { 
      type: [String], 
      required: true,
      validate: [v => v.length > 0, 'At least one skill is required']
    },
    experienceYears: { type: Number, required: true },
    hourlyCharge: { 
      type: Number, 
      required: true,
      min: [300, 'Minimum hourly charge is ₹300 per platform rules']
    },
    fullDayCharge: { type: Number, required: true },
    workingHours: { type: String, required: true },
    languagesKnown: { type: [String], required: true },
    
    // Identity & Bank
    identityInfo: {
      documentType: { type: String, required: true }, // e.g., Aadhar, PAN, Voter ID
      documentNumber: { type: String, required: true },
      documentUrl: { type: String, required: true }
    },
    bankDetails: {
      accountHolderName: { type: String, required: true },
      accountNumber: { type: String, required: true },
      ifscCode: { type: String, required: true },
      bankName: { type: String, required: true }
    },
    emergencyContact: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      relation: { type: String, required: true }
    },
    
    // Platform State
    isAvailable: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    totalJobsCompleted: { type: Number, default: 0 },
    totalJobsRejected: { type: Number, default: 0 },
    agreedToTerms: { type: Boolean, required: true }
  },
  { timestamps: true }
);

const Worker = mongoose.model('Worker', workerSchema);
export default Worker;
