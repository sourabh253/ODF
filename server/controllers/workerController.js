import asyncHandler from '../utils/asyncHandler.js';
import Worker from '../models/Worker.js';

export const completeWorkerProfile = asyncHandler(async (req, res) => {
  const existingWorker = await Worker.findOne({ userId: req.user._id });
  if (existingWorker) {
    res.status(400);
    throw new Error('Worker profile already exists');
  }

  const {
    profilePhotoUrl,
    gender,
    dob,
    address,
    city,
    state,
    pinCode,
    occupation,
    skills,
    experienceYears,
    workingHours,
    languagesKnown,
    identityInfo,
    bankDetails,
    emergencyContact,
    agreedToTerms
  } = req.body;

  if (!Array.isArray(skills) || skills.length === 0) {
    res.status(400);
    throw new Error('At least one skill is required');
  }

  if (!Array.isArray(languagesKnown) || languagesKnown.length === 0) {
    res.status(400);
    throw new Error('At least one known language is required');
  }

  if (agreedToTerms !== true) {
    res.status(400);
    throw new Error('You must agree to the Terms & Conditions');
  }

  const worker = await Worker.create({
    userId: req.user._id,
    profilePhotoUrl,
    gender,
    dob,
    address,
    city,
    state,
    pinCode,
    occupation,
    skills,
    experienceYears,
    workingHours,
    languagesKnown,
    identityInfo,
    bankDetails,
    emergencyContact,
    agreedToTerms
  });

  res.status(201).json(worker);
});

export const getMyWorkerProfile = asyncHandler(async (req, res) => {
  const worker = await Worker.findOne({ userId: req.user._id }).populate('userId', 'fullName email phone');
  
  if (worker) {
    res.json(worker);
  } else {
    res.status(404);
    throw new Error('Worker profile not found');
  }
});

export const updateWorkerProfile = asyncHandler(async (req, res) => {
  const worker = await Worker.findOne({ userId: req.user._id });

  if (worker) {
    // Assign updates carefully to avoid overriding stats
    const updateData = { ...req.body };
    delete updateData.totalReviews;
    delete updateData.totalJobsCompleted;
    delete updateData.totalJobsRejected;
    delete updateData.rating;
    delete updateData.userId; // shouldn't change
    delete updateData._id;

    Object.assign(worker, updateData);
    
    const updatedWorker = await worker.save();
    res.json(updatedWorker);
  } else {
    res.status(404);
    throw new Error('Worker profile not found');
  }
});

export const updateAvailability = asyncHandler(async (req, res) => {
  const worker = await Worker.findOne({ userId: req.user._id });

  if (worker) {
    worker.isAvailable = req.body.isAvailable;
    const updatedWorker = await worker.save();
    res.json({ isAvailable: updatedWorker.isAvailable });
  } else {
    res.status(404);
    throw new Error('Worker profile not found');
  }
});
