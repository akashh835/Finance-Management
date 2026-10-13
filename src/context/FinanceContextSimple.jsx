import { createContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

export const FinanceContext = createContext();

// Mock data for the finance context
const mockData = {
  categories: [
    { id: '1', name: 'Food & Dining', color: '#FF5733', icon: 'utensils' },
    { id: '2', name: 'Transportation', color: '#33A8FF', icon: 'car' },
    { id: '3', name: 'Housing', color: '#33FF57', icon: 'home' },
    { id: '4', name: 'Entertainment', color: '#A833FF', icon: 'film' },
    { id: '5', name: 'Shopping', color: '#FF33A8', icon: 'shopping-bag' },
    { id: '6', name: 'Utilities', color: '#33FFA8', icon: 'bolt' },
    { id: '7', name: 'Healthcare', color: '#FF3333', icon: 'medkit' },
    { id: '8', name: 'Income', color: '#33FF33', icon: 'money-bill' }
  ],
  budgets: [
    { id: '1', name: 'Monthly Budget', amount: 2000, period: 'monthly', startDate: '2023-01-01', endDate: '2023-12-31' },
    { id: '2', name: 'Groceries', amount: 500, period: 'monthly', startDate: '2023-01-01', endDate: '2023-12-31' },
    { id: '3', name: 'Entertainment', amount: 200, period: 'monthly', startDate: '2023-01-01', endDate: '2023-12-31' }
  ],
  expenses: [
    { id: '1', description: 'Grocery shopping', amount: 85.75, date: '2023-05-15', type: 'expense', categoryId: '1', budgetId: '2' },
    { id: '2', description: 'Movie tickets', amount: 25.50, date: '2023-05-18', type: 'expense', categoryId: '4', budgetId: '3' },
    { id: '3', description: 'Gas', amount: 45.00, date: '2023-05-20', type: 'expense', categoryId: '2', budgetId: '1' },
    { id: '4', description: 'Rent', amount: 1200.00, date: '2023-05-01', type: 'expense', categoryId: '3', budgetId: '1' },
    { id: '5', description: 'Salary', amount: 3500.00, date: '2023-05-01', type: 'income', categoryId: '8', budgetId: null },
    { id: '6', description: 'Freelance work', amount: 500.00, date: '2023-05-10', type: 'income', categoryId: '8', budgetId: null },
    { id: '7', description: 'Restaurant dinner', amount: 65.30, date: '2023-05-22', type: 'expense', categoryId: '1', budgetId: '1' },
    { id: '8', description: 'Electric bill', amount: 95.40, date: '2023-05-05', type: 'expense', categoryId: '6', budgetId: '1' },
    { id: '9', description: 'Internet bill', amount: 75.00, date: '2023-05-05', type: 'expense', categoryId: '6', budgetId: '1' },
    { id: '10', description: 'New shoes', amount: 120.00, date: '2023-05-12', type: 'expense', categoryId: '5', budgetId: '1' }
  ],
  goals: [
    { id: '1', name: 'Vacation Fund', targetAmount: 2000, currentAmount: 500, deadline: '2023-12-31', category: 'Travel' },
    { id: '2', name: 'Emergency Fund', targetAmount: 5000, currentAmount: 1500, deadline: '2023-12-31', category: 'Savings' },
    { id: '3', name: 'New Laptop', targetAmount: 1200, currentAmount: 300, deadline: '2023-09-30', category: 'Electronics' }
  ]
};

export function FinanceProvider({ children }) {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [preferredCurrency, setPreferredCurrency] = useState('USD');
  const [supportedCurrencies, setSupportedCurrencies] = useState([
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' }
  ]);

  // Load mock data when user changes
  useEffect(() => {
    const loadMockData = () => {
      if (user) {
        setLoading(true);
        // Simulate API delay
        setTimeout(() => {
          setBudgets(mockData.budgets);
          setExpenses(mockData.expenses);
          setCategories(mockData.categories);
          setGoals(mockData.goals);
          setLoading(false);
        }, 1000);
      } else {
        // Clear state if no user
        setBudgets([]);
        setExpenses([]);
        setCategories([]);
        setGoals([]);
        setLoading(false);
      }
    };

    loadMockData();
  }, [user]);

  // Summary calculations
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
        expense.budgetId === budgetId &&
        expense.type === 'expense'
      )
      .reduce((total, expense) => total + Number(expense.amount), 0);
  };

  const getCategorySpent = (categoryId) => {
    return expenses
      .filter(expense =>
        expense.categoryId === categoryId &&
        expense.type === 'expense'
      )
      .reduce((total, expense) => total + Number(expense.amount), 0);
  };

  // CRUD operations for budgets
  const addBudget = (budget) => {
    const newBudget = {
      ...budget,
      id: String(Date.now())
    };
    setBudgets([...budgets, newBudget]);
    return newBudget;
  };

  const updateBudget = (id, updatedBudget) => {
    const updated = budgets.map(budget =>
      budget.id === id ? { ...budget, ...updatedBudget } : budget
    );
    setBudgets(updated);
    return updated.find(budget => budget.id === id);
  };

  const deleteBudget = (id) => {
    setBudgets(budgets.filter(budget => budget.id !== id));
    return true;
  };

  // CRUD operations for expenses
  const addExpense = (expense) => {
    // Ensure categoryId is valid
    let categoryId = expense.categoryId;
    if (!categoryId || !categories.find(cat => cat.id === categoryId)) {
      console.warn('Invalid or missing categoryId, using default category');
      categoryId = categories.length > 0 ? categories[0].id : '1';
    }

    // Ensure required fields are present
    if (!expense.description) {
      console.warn('Missing description, using default');
      expense.description = 'Untitled Transaction';
    } else {
      console.log('Using description:', expense.description);
    }

    if (expense.amount === undefined || expense.amount === null || expense.amount === '') {
      console.warn('Missing amount, using 0');
      expense.amount = 0;
    }

    const newExpense = {
      ...expense,
      id: String(Date.now()),
      date: expense.date || new Date().toISOString().split('T')[0],
      categoryId: categoryId,
      description: expense.description,
      amount: Number(expense.amount),
      currency: expense.currency || 'USD'
    };

    console.log('Adding new expense:', newExpense);
    setExpenses([newExpense, ...expenses]);
    return newExpense;
  };

  const updateExpense = (id, updatedExpense) => {
    const updated = expenses.map(expense =>
      expense.id === id ? { ...expense, ...updatedExpense } : expense
    );
    setExpenses(updated);
    return updated.find(expense => expense.id === id);
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
    return true;
  };

  // CRUD operations for categories
  const addCategory = (category) => {
    const newCategory = {
      ...category,
      id: String(Date.now())
    };
    setCategories([...categories, newCategory]);
    return newCategory;
  };

  const updateCategory = (id, updatedCategory) => {
    const updated = categories.map(category =>
      category.id === id ? { ...category, ...updatedCategory } : category
    );
    setCategories(updated);
    return updated.find(category => category.id === id);
  };

  const deleteCategory = (id) => {
    setCategories(categories.filter(category => category.id !== id));
    return true;
  };

  // CRUD operations for goals
  const addGoal = (goal) => {
    const newGoal = {
      ...goal,
      id: String(Date.now()),
      currentAmount: goal.currentAmount || 0
    };
    setGoals([...goals, newGoal]);
    return newGoal;
  };

  const updateGoal = (id, updatedGoal) => {
    const updated = goals.map(goal =>
      goal.id === id ? { ...goal, ...updatedGoal } : goal
    );
    setGoals(updated);
    return updated.find(goal => goal.id === id);
  };

  const deleteGoal = (id) => {
    setGoals(goals.filter(goal => goal.id !== id));
    return true;
  };

  const contributeToGoal = (id, amount) => {
    const updated = goals.map(goal =>
      goal.id === id ? {
        ...goal,
        currentAmount: Number(goal.currentAmount) + Number(amount)
      } : goal
    );
    setGoals(updated);
    return updated.find(goal => goal.id === id);
  };

  // Currency functions
  const updatePreferredCurrency = (currency) => {
    setPreferredCurrency(currency);
    return currency;
  };

  const formatCurrency = (amount, currencyCode = preferredCurrency) => {
    const currency = supportedCurrencies.find(c => c.code === currencyCode) || supportedCurrencies[0];
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    try {
      return formatter.format(amount);
    } catch (error) {
      console.error('Error formatting currency:', error);
      return `${currency.symbol}${amount.toFixed(2)}`;
    }
  };

  const convertCurrency = async (amount, fromCurrency, toCurrency) => {
    // Mock conversion rates
    const mockRates = {
      USD: { EUR: 0.85, GBP: 0.75, JPY: 110.0, CAD: 1.25, AUD: 1.35, INR: 83.0, USD: 1.0 },
      EUR: { USD: 1.18, GBP: 0.88, JPY: 129.5, CAD: 1.47, AUD: 1.59, INR: 97.5, EUR: 1.0 },
      GBP: { USD: 1.33, EUR: 1.14, JPY: 146.7, CAD: 1.67, AUD: 1.80, INR: 110.0, GBP: 1.0 },
      JPY: { USD: 0.0091, EUR: 0.0077, GBP: 0.0068, CAD: 0.0114, AUD: 0.0123, INR: 0.75, JPY: 1.0 },
      CAD: { USD: 0.80, EUR: 0.68, GBP: 0.60, JPY: 88.0, AUD: 1.08, INR: 66.5, CAD: 1.0 },
      AUD: { USD: 0.74, EUR: 0.63, GBP: 0.56, JPY: 81.5, CAD: 0.93, INR: 61.5, AUD: 1.0 },
      INR: { USD: 0.012, EUR: 0.0103, GBP: 0.0091, JPY: 1.33, CAD: 0.015, AUD: 0.0163, INR: 1.0 }
    };

    // If currencies are the same, no conversion needed
    if (fromCurrency === toCurrency) {
      return amount;
    }

    // Get conversion rate
    const rate = mockRates[fromCurrency] && mockRates[fromCurrency][toCurrency]
      ? mockRates[fromCurrency][toCurrency]
      : 1;

    // Return converted amount
    return amount * rate;
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
      // Expense functions
      addExpense,
      updateExpense,
      deleteExpense,
      // Category functions
      addCategory,
      updateCategory,
      deleteCategory,
      // Goal functions
      addGoal,
      updateGoal,
      deleteGoal,
      contributeToGoal,
      // Summary calculations
      getTotalIncome,
      getTotalExpenses,
      getNetIncome,
      getBudgetSpent,
      getCategorySpent,
      // Currency functions
      preferredCurrency,
      supportedCurrencies,
      updatePreferredCurrency,
      formatCurrency,
      convertCurrency
    }}>
      {children}
    </FinanceContext.Provider>
  );
}
