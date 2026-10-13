import express from 'express';
import {
  getIncomeVsExpenses,
  getSpendingByCategory,
  getBudgetPerformance,
  getCashFlow,
  getNetWorth,
  getGoalsProgress
} from '../controllers/reports.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/income-expenses', protect, getIncomeVsExpenses);
router.get('/spending-by-category', protect, getSpendingByCategory);
router.get('/budget-performance', protect, getBudgetPerformance);
router.get('/cash-flow', protect, getCashFlow);
router.get('/net-worth', protect, getNetWorth);
router.get('/goals-progress', protect, getGoalsProgress);

export default router;
