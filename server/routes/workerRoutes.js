import express from 'express';
import {
  completeWorkerProfile,
  getMyWorkerProfile,
  updateWorkerProfile,
  updateAvailability
} from '../controllers/workerController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth and worker role check to all routes in this file
router.use(protect);
router.use(authorize('worker'));

router.route('/profile')
  .post(completeWorkerProfile)
  .get(getMyWorkerProfile)
  .put(updateWorkerProfile);

router.put('/availability', updateAvailability);

export default router;
