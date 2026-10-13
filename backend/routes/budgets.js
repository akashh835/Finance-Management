import express from 'express';
import {
  getBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget,
  shareBudget,
  removeShare
} from '../controllers/budgets.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getBudgets)
  .post(protect, createBudget);

router.route('/:id')
  .get(protect, getBudget)
  .put(protect, updateBudget)
  .delete(protect, deleteBudget);

router.route('/:id/share')
  .post(protect, shareBudget);

router.route('/:id/share/:userId')
  .delete(protect, removeShare);

export default router;
