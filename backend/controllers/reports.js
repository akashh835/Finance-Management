import Expense from '../models/Expense.js';
import Budget from '../models/Budget.js';
import Category from '../models/Category.js';
import BankAccount from '../models/BankAccount.js';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

/**
 * @desc    Get income vs expenses report
 * @route   GET /api/reports/income-expenses
 * @access  Private
 */
export const getIncomeVsExpenses = async (req, res) => {
  try {
    const { period = '6months' } = req.query;
    
    // Determine number of months to look back
    let monthsToLookBack;
    switch (period) {
      case '3months':
        monthsToLookBack = 3;
        break;
      case '6months':
        monthsToLookBack = 6;
        break;
      case '12months':
        monthsToLookBack = 12;
        break;
      default:
        monthsToLookBack = 6;
    }
    
    const now = new Date();
    const result = [];
    
    // Generate data for each month
    for (let i = monthsToLookBack - 1; i >= 0; i--) {
      const currentMonth = subMonths(now, i);
      const startDate = startOfMonth(currentMonth);
      const endDate = endOfMonth(currentMonth);
      
      // Get income for the month
      const income = await Expense.getTotalIncome(req.user.id, startDate, endDate);
      
      // Get expenses for the month
      const expenses = await Expense.getTotalExpenses(req.user.id, startDate, endDate);
      
      result.push({
        month: format(currentMonth, 'MMM yyyy'),
        income,
        expenses,
        net: income - expenses
      });
    }
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Get spending by category report
 * @route   GET /api/reports/spending-by-category
 * @access  Private
 */
export const getSpendingByCategory = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Get expenses grouped by category
    const categoryExpenses = await Expense.getExpensesByCategory(
      req.user.id,
      startDate ? new Date(startDate) : subMonths(new Date(), 6),
      endDate ? new Date(endDate) : new Date()
    );
    
    res.status(200).json({
      success: true,
      data: categoryExpenses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Get budget performance report
 * @route   GET /api/reports/budget-performance
 * @access  Private
 */
export const getBudgetPerformance = async (req, res) => {
  try {
    const { period = 'current' } = req.query;
    
    let startDate, endDate;
    const now = new Date();
    
    // Determine date range based on period
    switch (period) {
      case 'current':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'previous':
        startDate = startOfMonth(subMonths(now, 1));
        endDate = endOfMonth(subMonths(now, 1));
        break;
      case 'last3':
        startDate = startOfMonth(subMonths(now, 2));
        endDate = endOfMonth(now);
        break;
      case 'last6':
        startDate = startOfMonth(subMonths(now, 5));
        endDate = endOfMonth(now);
        break;
      default:
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
    }
    
    // Get all budgets
    const budgets = await Budget.find({ user: req.user.id })
      .populate('category', 'name color');
    
    // Calculate performance for each budget
    const budgetPerformance = [];
    
    for (const budget of budgets) {
      // Get expenses for this budget in the date range
      const expenses = await Expense.find({
        user: req.user.id,
        budget: budget._id,
        type: 'expense',
        date: { $gte: startDate, $lte: endDate }
      });
      
      const spent = expenses.reduce((total, expense) => total + expense.amount, 0);
      const remaining = budget.amount - spent;
      const percentUsed = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      
      budgetPerformance.push({
        budget: {
          id: budget._id,
          name: budget.name,
          amount: budget.amount,
          category: budget.category
        },
        spent,
        remaining,
        percentUsed,
        status: percentUsed > 100 ? 'over' : percentUsed >= 90 ? 'warning' : 'good'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        period: {
          startDate,
          endDate
        },
        budgets: budgetPerformance
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Get cash flow report
 * @route   GET /api/reports/cash-flow
 * @access  Private
 */
export const getCashFlow = async (req, res) => {
  try {
    const { period = '12months' } = req.query;
    
    // Determine number of months to look back
    let monthsToLookBack;
    switch (period) {
      case '3months':
        monthsToLookBack = 3;
        break;
      case '6months':
        monthsToLookBack = 6;
        break;
      case '12months':
        monthsToLookBack = 12;
        break;
      default:
        monthsToLookBack = 12;
    }
    
    const now = new Date();
    const result = [];
    
    // Generate data for each month
    for (let i = monthsToLookBack - 1; i >= 0; i--) {
      const currentMonth = subMonths(now, i);
      const startDate = startOfMonth(currentMonth);
      const endDate = endOfMonth(currentMonth);
      
      // Get all expenses for the month
      const expenses = await Expense.find({
        user: req.user.id,
        date: { $gte: startDate, $lte: endDate }
      }).sort('date');
      
      // Calculate running balance
      let runningBalance = 0;
      const dailyCashFlow = {};
      
      expenses.forEach(expense => {
        const day = format(new Date(expense.date), 'yyyy-MM-dd');
        
        if (!dailyCashFlow[day]) {
          dailyCashFlow[day] = {
            date: day,
            income: 0,
            expenses: 0,
            net: 0,
            balance: 0
          };
        }
        
        if (expense.type === 'income') {
          dailyCashFlow[day].income += expense.amount;
          runningBalance += expense.amount;
        } else {
          dailyCashFlow[day].expenses += expense.amount;
          runningBalance -= expense.amount;
        }
        
        dailyCashFlow[day].net = dailyCashFlow[day].income - dailyCashFlow[day].expenses;
        dailyCashFlow[day].balance = runningBalance;
      });
      
      result.push({
        month: format(currentMonth, 'MMM yyyy'),
        cashFlow: Object.values(dailyCashFlow)
      });
    }
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Get net worth report
 * @route   GET /api/reports/net-worth
 * @access  Private
 */
export const getNetWorth = async (req, res) => {
  try {
    // Calculate net worth from bank accounts
    const netWorth = await BankAccount.calculateNetWorth(req.user.id);
    
    // Get account balances by type
    const accounts = await BankAccount.find({
      user: req.user.id,
      isActive: true
    });
    
    const assetAccounts = accounts.filter(account => 
      ['checking', 'savings', 'investment'].includes(account.type)
    );
    
    const liabilityAccounts = accounts.filter(account => 
      ['loan', 'mortgage', 'credit'].includes(account.type)
    );
    
    const assets = assetAccounts.reduce(
      (total, account) => total + account.balance.current,
      0
    );
    
    const liabilities = liabilityAccounts.reduce(
      (total, account) => total + account.balance.current,
      0
    );
    
    // Group accounts by type
    const accountsByType = {};
    accounts.forEach(account => {
      if (!accountsByType[account.type]) {
        accountsByType[account.type] = {
          type: account.type,
          total: 0,
          accounts: []
        };
      }
      
      accountsByType[account.type].total += account.balance.current;
      accountsByType[account.type].accounts.push({
        id: account._id,
        name: account.name,
        institution: account.institution.name,
        balance: account.balance.current
      });
    });
    
    res.status(200).json({
      success: true,
      data: {
        netWorth,
        assets,
        liabilities,
        accountsByType: Object.values(accountsByType)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Get savings goals progress report
 * @route   GET /api/reports/goals-progress
 * @access  Private
 */
export const getGoalsProgress = async (req, res) => {
  try {
    // Get all goals
    const goals = await Goal.find({ user: req.user.id });
    
    // Calculate progress for each goal
    const goalsProgress = goals.map(goal => {
      const progressPercentage = goal.progressPercentage;
      const remainingAmount = goal.remainingAmount;
      const daysRemaining = goal.daysRemaining;
      const dailySavingsNeeded = goal.dailySavingsNeeded;
      
      // Calculate monthly contribution rate
      const monthsActive = goal.createdAt 
        ? Math.max(1, (new Date() - new Date(goal.createdAt)) / (1000 * 60 * 60 * 24 * 30))
        : 1;
      
      const monthlyContributionRate = goal.currentAmount / monthsActive;
      
      // Estimate completion date based on current rate
      let estimatedCompletionDate = null;
      if (monthlyContributionRate > 0) {
        const monthsToCompletion = remainingAmount / monthlyContributionRate;
        estimatedCompletionDate = new Date();
        estimatedCompletionDate.setMonth(estimatedCompletionDate.getMonth() + monthsToCompletion);
      }
      
      return {
        id: goal._id,
        name: goal.name,
        type: goal.type,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        targetDate: goal.targetDate,
        progressPercentage,
        remainingAmount,
        daysRemaining,
        dailySavingsNeeded,
        monthlyContributionRate,
        estimatedCompletionDate,
        onTrack: goal.targetDate 
          ? (estimatedCompletionDate && estimatedCompletionDate <= new Date(goal.targetDate))
          : true
      };
    });
    
    res.status(200).json({
      success: true,
      data: goalsProgress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
