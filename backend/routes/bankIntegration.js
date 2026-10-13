import express from 'express';
import {
  createLinkToken,
  exchangeToken,
  getBankAccounts,
  getBankAccount,
  updateBankAccount,
  syncTransactions,
  removeBankAccount
} from '../controllers/bankIntegration.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/create-link-token', protect, createLinkToken);
router.post('/exchange-token', protect, exchangeToken);

router.route('/accounts')
  .get(protect, getBankAccounts);

router.route('/accounts/:id')
  .get(protect, getBankAccount)
  .put(protect, updateBankAccount)
  .delete(protect, removeBankAccount);

router.post('/accounts/:id/sync', protect, syncTransactions);

export default router;
