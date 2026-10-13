import express from 'express';
import {
  register,
  login,
  getMe,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  updatePassword,
  enableTwoFactor,
  verifyTwoFactorSetup,
  disableTwoFactor,
  verifyTwoFactor
} from '../controllers/auth.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-2fa', verifyTwoFactor);
router.get('/me', protect, getMe);
router.get('/logout', protect, logout);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.put('/update-password', protect, updatePassword);
router.post('/enable-2fa', protect, enableTwoFactor);
router.post('/verify-2fa-setup', protect, verifyTwoFactorSetup);
router.post('/disable-2fa', protect, disableTwoFactor);

export default router;
