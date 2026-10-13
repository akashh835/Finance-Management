import express from 'express';
import {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  uploadReceipt,
  shareExpense,
  settleExpense,
  upload
} from '../controllers/expenses.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getExpenses)
  .post(protect, upload, createExpense);

router.route('/:id')
  .get(protect, getExpense)
  .put(protect, upload, updateExpense)
  .delete(protect, deleteExpense);

router.route('/:id/receipt')
  .post(protect, upload, uploadReceipt);

router.route('/:id/share')
  .post(protect, shareExpense);

router.route('/:id/settle/:userId')
  .put(protect, settleExpense);

export default router;
