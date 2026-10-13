import { createContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  budgetAPI,
  expenseAPI,
  categoryAPI,
  goalAPI,
  reportAPI,
  currencyAPI
} from '../services/api';
import currencyService from '../services/currencyService';

export const FinanceContext = createContext();

export function FinanceProvider({ children }) {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [preferredCurrency, setPreferredCurrency] = useState('USD');
  const [exchangeRates, setExchangeRates] = useState({});
  const [supportedCurrencies, setSupportedCurrencies] = useState([]);

  // Load data from API when user changes
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setLoading(true);
        try {
          // Fetch categories first
          const categoriesResponse = await categoryAPI.getCategories();
          setCategories(categoriesResponse.data.data);

          // If no categories exist, initialize default ones
          if (categoriesResponse.data.count === 0) {
            try {
              const defaultCategoriesResponse = await categoryAPI.initDefaultCategories();
              setCategories(defaultCategoriesResponse.data.data);
            } catch (err) {
              console.error('Failed to initialize default categories:', err);
            }
          }

          // Fetch budgets
          const budgetsResponse = await budgetAPI.getBudgets();
          setBudgets(budgetsResponse.data.data);

          // Fetch expenses (most recent 100)
          const expensesResponse = await expenseAPI.getExpenses({ limit: 100 });
          setExpenses(expensesResponse.data.data);

          // Fetch goals
          const goalsResponse = await goalAPI.getGoals();
          setGoals(goalsResponse.data.data);

          // Set preferred currency from user preferences
          if (user.preferences && user.preferences.currency) {
            setPreferredCurrency(user.preferences.currency);
          }
        } catch (err) {
          console.error('Error fetching data:', err);
          setError('Failed to load data. Please try again later.');
        } finally {
          setLoading(false);
        }
      } else {
        // Clear state if no user
        setBudgets([]);
        setExpenses([]);
        setCategories([]);
        setGoals([]);
        setPreferredCurrency('USD');
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Load currency data
  useEffect(() => {
    const fetchCurrencyData = async () => {
      try {
        const response = await currencyAPI.getRates();
        if (response?.data?.data) {
          setExchangeRates(response.data.data);
        } else {
          throw new Error('Invalid response structure');
        }
      } catch (err) {
        console.error('Error fetching currency data:', err);
        setError('Failed to fetch currency data');
      }
    };
    if (user) {
      fetchCurrencyData();
    }
  }, [user, preferredCurrency]);

  // Budget functions
  const addBudget = async (budget) => {
    try {
      setError(null);
      const response = await budgetAPI.createBudget(budget);
      setBudgets([...budgets, response.data.data]);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create budget');
      throw err;
    }
  };

  const updateBudget = async (id, updatedBudget) => {
    try {
      setError(null);
      const response = await budgetAPI.updateBudget(id, updatedBudget);
      setBudgets(budgets.map(budget =>
        budget._id === id ? response.data.data : budget
      ));
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update budget');
      throw err;
    }
  };

  const deleteBudget = async (id) => {
    try {
      setError(null);
      await budgetAPI.deleteBudget(id);
      setBudgets(budgets.filter(budget => budget._id !== id));
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete budget');
      throw err;
    }
  };

  const shareBudget = async (id, email, permission) => {
    try {
      setError(null);
      const response = await budgetAPI.shareBudget(id, { email, permission });
      setBudgets(budgets.map(budget =>
        budget._id === id ? response.data.data : budget
      ));
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to share budget');
      throw err;
    }
  };

  // Expense functions
  const addExpense = async (expense) => {
    try {
      setError(null);
      const formData = new FormData();
  
      // Add all expense data to formData
      Object.keys(expense).forEach((key) => {
        if (key === 'receipt' && expense[key] instanceof File) {
          formData.append('receipt', expense[key]);
        } else if (expense[key] !== undefined && expense[key] !== null) {
          formData.append(key, expense[key]);
        }
      });
  
      // Ensure description is included
      if (!expense.description) {
        formData.append('description', 'Untitled Transaction');
      }
  
      const response = await expenseAPI.createExpense(formData);
      setExpenses([response.data.data, ...expenses]); // Add new expense to state
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create expense');
      throw err;
    }
  };

  const updateExpense = async (id, updatedExpense) => {
    try {
      setError(null);
      const formData = new FormData();

      // Add all expense data to formData
      Object.keys(updatedExpense).forEach(key => {
        if (key === 'receipt' && updatedExpense[key] instanceof File) {
          formData.append('receipt', updatedExpense[key]);
        } else if (updatedExpense[key] !== undefined && updatedExpense[key] !== null) {
          formData.append(key, updatedExpense[key]);
        }
      });

      const response = await expenseAPI.updateExpense(id, formData);
      setExpenses(expenses.map(expense =>
        expense._id === id ? response.data.data : expense
      ));
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update expense');
      throw err;
    }
  };

  const deleteExpense = async (id) => {
    try {
      setError(null);
      await expenseAPI.deleteExpense(id);
      setExpenses(expenses.filter(expense => expense._id !== id));
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete expense');
      throw err;
    }
  };

  const uploadReceipt = async (id, file) => {
    try {
      setError(null);
      const formData = new FormData();
      formData.append('receipt', file);

      const response = await expenseAPI.uploadReceipt(id, formData);

      setExpenses(expenses.map(expense =>
        expense._id === id ? { ...expense, receipt: response.data.data } : expense
      ));

      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload receipt');
      throw err;
    }
  };

  const shareExpense = async (id, email, amount) => {
    try {
      setError(null);
      const response = await expenseAPI.shareExpense(id, { email, amount });
      setExpenses(expenses.map(expense =>
        expense._id === id ? response.data.data : expense
      ));
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to share expense');
      throw err;
    }
  };

  // Category functions
  const addCategory = async (category) => {
    try {
      setError(null);
      const response = await categoryAPI.createCategory(category);
      setCategories([...categories, response.data.data]);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create category');
      throw err;
    }
  };

  const updateCategory = async (id, updatedCategory) => {
    try {
      setError(null);
      const response = await categoryAPI.updateCategory(id, updatedCategory);
      setCategories(categories.map(category =>
        category._id === id ? response.data.data : category
      ));
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update category');
      throw err;
    }
  };

  const deleteCategory = async (id) => {
    try {
      setError(null);
      await categoryAPI.deleteCategory(id);
      setCategories(categories.filter(category => category._id !== id));
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete category');
      throw err;
    }
  };

  // Goal functions
  const addGoal = async (goal) => {
    try {
      setError(null);
      const response = await goalAPI.createGoal(goal);
      setGoals([...goals, response.data.data]);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create goal');
      throw err;
    }
  };

  const updateGoal = async (id, updatedGoal) => {
    try {
      setError(null);
      const response = await goalAPI.updateGoal(id, updatedGoal);
      setGoals(goals.map(goal =>
        goal._id === id ? response.data.data : goal
      ));
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update goal');
      throw err;
    }
  };

  const deleteGoal = async (id) => {
    try {
      setError(null);
      await goalAPI.deleteGoal(id);
      setGoals(goals.filter(goal => goal._id !== id));
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete goal');
      throw err;
    }
  };

  const contributeToGoal = async (id, amount, notes = '') => {
    try {
      setError(null);
      const response = await goalAPI.addContribution(id, { amount, notes });
      setGoals(goals.map(goal =>
        goal._id === id ? response.data.data : goal
      ));
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add contribution');
      throw err;
    }
  };

  const addMilestone = async (goalId, milestone) => {
    try {
      setError(null);
      const response = await goalAPI.addMilestone(goalId, milestone);
      setGoals(goals.map(goal =>
        goal._id === goalId ? response.data.data : goal
      ));
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add milestone');
      throw err;
    }
  };

  const removeMilestone = async (goalId, milestoneId) => {
    try {
      setError(null);
      const response = await goalAPI.removeMilestone(goalId, milestoneId);
      setGoals(goals.map(goal =>
        goal._id === goalId ? response.data.data : goal
      ));
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove milestone');
      throw err;
    }
  };

  // Report functions
  const getIncomeVsExpensesReport = async (period = '6months') => {
    try {
      setError(null);
      const response = await reportAPI.getIncomeVsExpenses({ period });
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to get income vs expenses report');
      throw err;
    }
  };

  const getSpendingByCategoryReport = async (startDate, endDate) => {
    try {
      setError(null);
      const response = await reportAPI.getSpendingByCategory({ startDate, endDate });
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to get spending by category report');
      throw err;
    }
  };

  const getBudgetPerformanceReport = async (period = 'current') => {
    try {
      setError(null);
      const response = await reportAPI.getBudgetPerformance({ period });
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to get budget performance report');
      throw err;
    }
  };

  // Summary calculations (these will be replaced by API calls in the future)
  const getTotalIncome = () => {
    return expenses
      .filter(expense => expense.type === 'income')
      .reduce((total, expense) => total + Number(expense.amount), 0);
  };

  const getTotalExpenses = () => {
    return expenses
      .filter(expense => expense.type === 'expense')
      .reduce((total, expense) => total + Number(expense.amount), 0);
  };

  const getNetIncome = () => {
    return getTotalIncome() - getTotalExpenses();
  };

  const getBudgetSpent = (budgetId) => {
    return expenses
      .filter(expense =>
        expense.budget === budgetId &&
        expense.type === 'expense'
      )
      .reduce((total, expense) => total + Number(expense.amount), 0);
  };

  const getCategorySpent = (categoryId) => {
    return expenses
      .filter(expense =>
        expense.category === categoryId &&
        expense.type === 'expense'
      )
      .reduce((total, expense) => total + Number(expense.amount), 0);
  };

  // Currency functions
  const convertCurrency = async (amount, fromCurrency, toCurrency) => {
    // Handle null, undefined, or NaN amounts
    if (amount === null || amount === undefined || isNaN(amount)) {
      return 0;
    }

    // No conversion needed if currencies are the same
    if (fromCurrency === toCurrency) {
      return amount;
    }

    try {
      // Use the currencyService for conversion
      return await currencyService.convertCurrency(amount, fromCurrency, toCurrency);
    } catch (err) {
      console.error('Currency conversion failed:', err);
      return amount; // Return original amount if conversion fails
    }
  };

  const formatCurrency = (amount, currency = preferredCurrency) => {
    return currencyService.formatCurrency(amount, currency);
  };

  const updatePreferredCurrency = async (currency) => {
    if (currency === preferredCurrency) {
      return;
    }

    try {
      setPreferredCurrency(currency);

      // If user is logged in, update their preferences
      if (user) {
        // This would typically call an API to update user preferences
        console.log(`Updated user preferred currency to ${currency}`);
      }
    } catch (err) {
      console.error('Failed to update preferred currency:', err);
      setError('Failed to update currency preference');
    }
  };

  return (
    <FinanceContext.Provider value={{
      budgets,
      expenses,
      categories,
      goals,
      loading,
      error,
      // Budget functions
      addBudget,
      updateBudget,
      deleteBudget,
      shareBudget,
      // Expense functions
      addExpense,
      updateExpense,
      deleteExpense,
      uploadReceipt,
      shareExpense,
      // Category functions
      addCategory,
      updateCategory,
      deleteCategory,
      // Goal functions
      addGoal,
      updateGoal,
      deleteGoal,
      contributeToGoal,
      addMilestone,
      removeMilestone,
      // Report functions
      getIncomeVsExpensesReport,
      getSpendingByCategoryReport,
      getBudgetPerformanceReport,
      // Summary calculations
      getTotalIncome,
      getTotalExpenses,
      getNetIncome,
      getBudgetSpent,
      getCategorySpent,
      // Currency functions
      preferredCurrency,
      supportedCurrencies,
      convertCurrency,
      formatCurrency,
      updatePreferredCurrency
    }}>
      {children}
    </FinanceContext.Provider>
  );
}
