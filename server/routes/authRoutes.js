import express from 'express';
import {
  registerCustomer,
  loginCustomer,
  registerWorker,
  loginWorker,
  loginAdmin,
  getMe,
  changePassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/customer/register', registerCustomer);
router.post('/customer/login', loginCustomer);
router.post('/worker/register', registerWorker);
router.post('/worker/login', loginWorker);
router.post('/admin/login', loginAdmin);
router.get('/me', protect, getMe);
router.patch('/change-password', protect, changePassword);

export default router;
