// Mock data for the application
const mockData = {
  users: [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      emailVerified: true,
      role: 'user',
      preferences: {
        currency: 'USD',
        language: 'en',
        theme: 'system'
      },
      twoFactorEnabled: false
    }
  ],
  categories: [
    { id: '1', name: 'Food & Dining', color: '#FF5733', icon: 'restaurant' },
    { id: '2', name: 'Transportation', color: '#33A8FF', icon: 'directions_car' },
    { id: '3', name: 'Housing', color: '#33FF57', icon: 'home' },
    { id: '4', name: 'Entertainment', color: '#A833FF', icon: 'movie' },
    { id: '5', name: 'Shopping', color: '#FF33A8', icon: 'shopping_bag' },
    { id: '6', name: 'Utilities', color: '#33FFA8', icon: 'power' },
    { id: '7', name: 'Health', color: '#FFA833', icon: 'favorite' },
    { id: '8', name: 'Income', color: '#57FF33', icon: 'attach_money' }
  ],
  budgets: [
    { id: '1', name: 'Monthly Budget', amount: 2000, period: 'monthly', categoryIds: ['1', '2', '3', '6'] },
    { id: '2', name: 'Groceries', amount: 500, period: 'monthly', categoryIds: ['1'] },
    { id: '3', name: 'Entertainment', amount: 200, period: 'monthly', categoryIds: ['4'] }
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

// Helper function to simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to handle mock API requests
const mockApiRequest = async (endpoint, method, data = null, params = {}) => {
  // Simulate network delay
  await delay(300);

  console.log(`Mock API ${method} request to ${endpoint}`, { data, params });

  // Handle different API endpoints
  try {
    // Auth endpoints
    if (endpoint === '/auth/login') {
      const { email, password } = data;

      // For demo purposes, allow login with demo credentials
      if (email === 'demo@example.com' && password === 'password') {
        return {
          data: {
            token: `mock-jwt-token-${Date.now()}`,
            user: {
              id: '1',
              name: 'Demo User',
              email: 'demo@example.com',
              preferences: {
                currency: 'USD',
                language: 'en',
                theme: 'system'
              }
            }
          }
        };
      }

      // Check for existing user
      const user = mockData.users.find(u => u.email === email);

      if (!user || user.password !== password) {
        return {
          success: false,
          error: 'Invalid credentials'
        };
      }

      return {
        data: {
          token: `mock-jwt-token-${Date.now()}`,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            preferences: user.preferences
          }
        }
      };
    }

    // Finance API endpoints
    if (endpoint === '/categories') {
      return {
        data: {
          data: mockData.categories,
          count: mockData.categories.length
        }
      };
    }

    if (endpoint === '/budgets') {
      return {
        data: {
          data: mockData.budgets,
          count: mockData.budgets.length
        }
      };
    }

    if (endpoint === '/expenses') {
      if (method === 'GET') {
        return {
          data: {
            data: mockData.expenses,
            count: mockData.expenses.length
          }
        };
      } else if (method === 'POST') {
        // Create a new expense
        console.log('Received expense data:', data);

        // Ensure required fields are present
        if (!data.description) {
          console.warn('Missing description, using default');
          data.description = 'Untitled Transaction';
        } else {
          console.log('Using description:', data.description);
        }

        if (data.amount === undefined || data.amount === null || data.amount === '') {
          console.warn('Missing amount, using 0');
          data.amount = 0;
        }

        const newExpense = {
          id: String(mockData.expenses.length + 1),
          description: data.description,
          amount: Number(data.amount),
          date: data.date || new Date().toISOString(),
          type: data.type || 'expense',
          currency: data.currency || 'USD'
        };

        // Make sure categoryId is properly set
        if (data.categoryId) {
          const category = mockData.categories.find(c => c.id === data.categoryId);
          if (!category) {
            newExpense.categoryId = mockData.categories[0].id;
          } else {
            newExpense.categoryId = data.categoryId;
          }
        } else {
          newExpense.categoryId = mockData.categories[0].id;
        }

        mockData.expenses.unshift(newExpense);
        return { data: { data: newExpense } };
      }
    }

    if (endpoint === '/goals') {
      return {
        data: {
          data: mockData.goals,
          count: mockData.goals.length
        }
      };
    }

    // Currency API endpoints
    if (endpoint === '/currency/rates') {
      const base = params?.base || 'USD';
      const mockRates = {
        USD: { EUR: 0.85, GBP: 0.75, JPY: 110.0, CAD: 1.25, AUD: 1.35, INR: 83.0, USD: 1.0 },
        EUR: { USD: 1.18, GBP: 0.88, JPY: 129.5, CAD: 1.47, AUD: 1.59, INR: 97.5, EUR: 1.0 },
        GBP: { USD: 1.33, EUR: 1.14, JPY: 146.7, CAD: 1.67, AUD: 1.80, INR: 110.0, GBP: 1.0 },
        JPY: { USD: 0.0091, EUR: 0.0077, GBP: 0.0068, CAD: 0.0114, AUD: 0.0123, INR: 0.75, JPY: 1.0 },
        CAD: { USD: 0.80, EUR: 0.68, GBP: 0.60, JPY: 88.0, AUD: 1.08, INR: 66.5, CAD: 1.0 },
        AUD: { USD: 0.74, EUR: 0.63, GBP: 0.56, JPY: 81.5, CAD: 0.93, INR: 61.5, AUD: 1.0 },
        INR: { USD: 0.012, EUR: 0.0103, GBP: 0.0091, JPY: 1.33, CAD: 0.015, AUD: 0.0163, INR: 1.0 }
      };

      return {
        data: {
          data: mockRates[base] || mockRates.USD,
          base: base,
          timestamp: Date.now()
        }
      };
    }

    if (endpoint === '/currency/convert') {
      const { amount, from, to } = data;
      const mockRates = {
        USD: { EUR: 0.85, GBP: 0.75, JPY: 110.0, CAD: 1.25, AUD: 1.35, INR: 83.0, USD: 1.0 },
        EUR: { USD: 1.18, GBP: 0.88, JPY: 129.5, CAD: 1.47, AUD: 1.59, INR: 97.5, EUR: 1.0 },
        GBP: { USD: 1.33, EUR: 1.14, JPY: 146.7, CAD: 1.67, AUD: 1.80, INR: 110.0, GBP: 1.0 },
        JPY: { USD: 0.0091, EUR: 0.0077, GBP: 0.0068, CAD: 0.0114, AUD: 0.0123, INR: 0.75, JPY: 1.0 },
        CAD: { USD: 0.80, EUR: 0.68, GBP: 0.60, JPY: 88.0, AUD: 1.08, INR: 66.5, CAD: 1.0 },
        AUD: { USD: 0.74, EUR: 0.63, GBP: 0.56, JPY: 81.5, CAD: 0.93, INR: 61.5, AUD: 1.0 },
        INR: { USD: 0.012, EUR: 0.0103, GBP: 0.0091, JPY: 1.33, CAD: 0.015, AUD: 0.0163, INR: 1.0 }
      };

      const rate = (mockRates[from] && mockRates[from][to]) ? mockRates[from][to] : 1;
      const convertedAmount = amount * rate;

      return {
        data: {
          data: {
            amount: amount,
            from: from,
            to: to,
            rate: rate,
            result: convertedAmount,
            timestamp: Date.now()
          }
        }
      };
    }

    if (endpoint === '/currency/supported') {
      return {
        data: {
          data: [
            { code: 'USD', name: 'US Dollar', symbol: '$' },
            { code: 'EUR', name: 'Euro', symbol: '€' },
            { code: 'GBP', name: 'British Pound', symbol: '£' },
            { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
            { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
            { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
            { code: 'INR', name: 'Indian Rupee', symbol: '₹' }
          ]
        }
      };
    }

    // Default response for unhandled endpoints
    return {
      data: {
        message: `Mock API response for ${method} ${endpoint}`,
        data: [],
        count: 0
      }
    };

  } catch (error) {
    console.error('Mock API error:', error.message);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }
};

// API methods
const api = {
  get: async (url, params = {}) => {
    return mockApiRequest(url, 'GET', null, params);
  },

  post: async (url, data) => {
    return mockApiRequest(url, 'POST', data);
  },

  put: async (url, data) => {
    return mockApiRequest(url, 'PUT', data);
  },

  delete: async (url) => {
    return mockApiRequest(url, 'DELETE');
  },
};

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  verifyTwoFactor: (data) => api.post('/auth/verify-2fa', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.get('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.put(`/auth/reset-password/${token}`, { password }),
  updatePassword: (passwords) => api.put('/auth/update-password', passwords),
  enableTwoFactor: () => api.post('/auth/enable-2fa'),
  verifyTwoFactorSetup: (token) => api.post('/auth/verify-2fa-setup', { token }),
  disableTwoFactor: (password) => api.post('/auth/disable-2fa', { password })
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadProfileImage: (formData) => api.post('/users/profile/image', formData),
  deleteAccount: (password) => api.delete('/users', { password }),
  exportData: () => api.get('/users/data-export')
};

// Budget API
export const budgetAPI = {
  getBudgets: () => api.get('/budgets'),
  createBudget: (data) => api.post('/budgets', data),
  updateBudget: (id, data) => api.put(`/budgets/${id}`, data),
  deleteBudget: (id) => api.delete(`/budgets/${id}`)
};

// Expense API
export const expenseAPI = {
  getExpenses: (params) => api.get('/expenses', params),
  createExpense: (data) => api.post('/expenses', data),
  updateExpense: (id, data) => api.put(`/expenses/${id}`, data),
  deleteExpense: (id) => api.delete(`/expenses/${id}`)
};

// Category API
export const categoryAPI = {
  getCategories: () => api.get('/categories'),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`)
};

// Goal API
export const goalAPI = {
  getGoals: () => api.get('/goals'),
  createGoal: (data) => api.post('/goals', data),
  updateGoal: (id, data) => api.put(`/goals/${id}`, data),
  deleteGoal: (id) => api.delete(`/goals/${id}`),
  addContribution: (id, data) => api.post(`/goals/${id}/contribute`, data),
  addMilestone: (id, data) => api.post(`/goals/${id}/milestones`, data),
  removeMilestone: (id, milestoneId) => api.delete(`/goals/${id}/milestones/${milestoneId}`)
};

// Report API
export const reportAPI = {
  getIncomeVsExpenses: (params) => api.get('/reports/income-expenses', params),
  getSpendingByCategory: (params) => api.get('/reports/spending-by-category', params),
  getBudgetPerformance: (params) => api.get('/reports/budget-performance', params),
  getCashFlow: (params) => api.get('/reports/cash-flow', params),
  getNetWorth: () => api.get('/reports/net-worth'),
  getGoalsProgress: () => api.get('/reports/goals-progress')
};

// Currency API
export const currencyAPI = {
  getRates: (params) => api.get('/currency/rates', params),
  convert: (data) => api.post('/currency/convert', data),
  getSupportedCurrencies: () => api.get('/currency/supported')
};

// Bank Integration API
export const bankAPI = {
  createLinkToken: () => api.post('/bank/create-link-token'),
  exchangeToken: (data) => api.post('/bank/exchange-token', data),
  getAccounts: () => api.get('/bank/accounts'),
  getAccount: (id) => api.get(`/bank/accounts/${id}`),
  updateAccount: (id, data) => api.put(`/bank/accounts/${id}`, data),
  syncTransactions: (id) => api.post(`/bank/accounts/${id}/sync`),
  removeAccount: (id) => api.delete(`/bank/accounts/${id}`)
};

export default api;
