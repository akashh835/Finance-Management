import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  uploadProfileImage,
  deleteUser,
  exportUserData,
  upload
} from '../controllers/users.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/profile/image', protect, upload, uploadProfileImage);
router.delete('/', protect, deleteUser);
router.get('/data-export', protect, exportUserData);

export default router;
