import express from 'express';
import { getWorkerById, searchWorkers } from '../controllers/customerController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, authorize('customer'));
router.get('/workers', searchWorkers);
router.get('/workers/:workerId', getWorkerById);

export default router;
