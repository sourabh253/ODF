import asyncHandler from '../utils/asyncHandler.js';
import Worker from '../models/Worker.js';

export const searchWorkers = asyncHandler(async (req, res) => {
  const { skill, city } = req.query;
  const filters = { isAvailable: true };

  if (skill) filters.skills = skill;
  if (city) filters.city = { $regex: city.trim(), $options: 'i' };

  const workers = await Worker.find(filters)
    .populate('userId', 'fullName email phone')
    .select('-identityInfo -bankDetails -emergencyContact')
    .sort({ rating: -1, totalReviews: -1 });

  res.json(workers);
});

export const getWorkerById = asyncHandler(async (req, res) => {
  const worker = await Worker.findById(req.params.workerId)
    .populate('userId', 'fullName email phone')
    .select('-identityInfo -bankDetails -emergencyContact');

  if (!worker) {
    res.status(404);
    throw new Error('Worker profile not found');
  }

  res.json(worker);
});
