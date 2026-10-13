import { useState, useEffect } from 'react'
import { useFinance } from '../hooks/useFinance'
import { useCurrency } from '../hooks/useCurrency'
import ExpenseItem from '../components/ExpenseItem'
import { formatDate, getTodayFormatted } from '../utils/dateUtils'

function Expenses() {
  const { expenses, budgets, categories, addExpense, updateExpense, deleteExpense } = useFinance()
  const { supportedCurrencies, preferredCurrency } = useCurrency()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: getTodayFormatted(),
    type: 'expense',
    categoryId: '',
    budgetId: '',
    notes: '',
    currency: 'USD'
  })

  const [filteredExpenses, setFilteredExpenses] = useState([])
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    budget: 'all',
    dateRange: 'all',
    searchQuery: '',
  })

  // Set default currency to preferred currency
  useEffect(() => {
    if (!editingExpense) {
      setFormData(prev => ({
        ...prev,
        currency: preferredCurrency
      }));
    }
  }, [preferredCurrency, editingExpense]);

  // Apply filters whenever expenses or filters change
  useEffect(() => {
    let result = [...expenses]

    // Filter by type
    if (filters.type !== 'all') {
      result = result.filter(expense => expense.type === filters.type)
    }

    // Filter by category
    if (filters.category !== 'all') {
      result = result.filter(expense => expense.categoryId === filters.category)
    }

    // Filter by budget
    if (filters.budget !== 'all') {
      result = result.filter(expense => expense.budgetId === filters.budget)
    }

    // Filter by date range
    if (filters.dateRange !== 'all') {
      const now = new Date()
      let startDate

      switch (filters.dateRange) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0))
          break
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7))
          break
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1))
          break
        case 'year':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1))
          break
      }

      result = result.filter(expense => new Date(expense.date) >= startDate)
    }

    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      result = result.filter(expense =>
        expense.description.toLowerCase().includes(query) ||
        expense.notes?.toLowerCase().includes(query)
      )
    }

    // Sort by date (newest first)
    result.sort((a, b) => new Date(b.date) - new Date(a.date))

    setFilteredExpenses(result)
  }, [expenses, filters])

  const handleOpenModal = (expense = null) => {
    if (expense) {
      setEditingExpense(expense)
      setFormData({
        description: expense.description,
        amount: expense.amount,
        date: formatDate(expense.date, 'yyyy-MM-dd', getTodayFormatted()),
        type: expense.type,
        categoryId: expense.categoryId,
        budgetId: expense.budgetId || '',
        notes: expense.notes || '',
        currency: expense.currency || 'USD'
      })
    } else {
      setEditingExpense(null)
      setFormData({
        description: '',
        amount: '',
        date: getTodayFormatted(),
        type: 'expense',
        categoryId: categories.length > 0 ? categories[0].id : '',
        budgetId: '',
        notes: '',
        currency: 'USD'
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingExpense(null)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault();
  
    // Validate category selection
    const selectedCategory = categories.find(cat => cat.id === formData.categoryId);
    if (!selectedCategory) {
      console.error('Invalid category selected:', formData.categoryId);
      alert('Please select a valid category');
      return;
    }
  
    // Prepare expense data
    const expenseData = {
      ...formData,
      amount: Number(formData.amount), // Ensure amount is a number
      date: new Date(formData.date).toISOString(), // Convert date to ISO format
      categoryId: selectedCategory.id, // Ensure categoryId is valid
      description: formData.description.trim() || 'Untitled Transaction', // Default description
    };
  
    console.log('Submitting expense data:', expenseData);
  
    // Add or update the expense
    if (editingExpense) {
      updateExpense(editingExpense.id, expenseData)
        .then(() => console.log('Expense updated successfully'))
        .catch(err => console.error('Failed to update expense:', err));
    } else {
      addExpense(expenseData)
        .then(() => console.log('Expense added successfully'))
        .catch(err => console.error('Failed to add expense:', err));
    }
  
    // Close the modal
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      deleteExpense(id)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
        <button
          onClick={() => handleOpenModal()}
          className="btn btn-primary flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type
            </label>
            <select
              id="type"
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="input"
            >
              <option value="all">All Types</option>
              <option value="expense">Expenses</option>
              <option value="income">Income</option>
            </select>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="input"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
  <option key={category.id} value={category.id}>
    {category.name}
  </option>
))}
            </select>
          </div>

          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Budget
            </label>
            <select
              id="budget"
              name="budget"
              value={filters.budget}
              onChange={handleFilterChange}
              className="input"
            >
              <option value="all">All Budgets</option>
              {budgets.map(budget => (
                <option key={budget.id} value={budget.id}>
                  {budget.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date Range
            </label>
            <select
              id="dateRange"
              name="dateRange"
              value={filters.dateRange}
              onChange={handleFilterChange}
              className="input"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last Year</option>
            </select>
          </div>

          <div>
            <label htmlFor="searchQuery" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <input
              type="text"
              id="searchQuery"
              name="searchQuery"
              value={filters.searchQuery}
              onChange={handleFilterChange}
              className="input"
              placeholder="Search transactions..."
            />
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Transactions ({filteredExpenses.length})
        </h2>

        {filteredExpenses.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredExpenses.map(expense => (
              <ExpenseItem
                key={expense.id}
                expense={expense}
                onEdit={handleOpenModal}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No transactions found</h3>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              {expenses.length === 0
                ? "You haven't recorded any transactions yet."
                : "No transactions match your current filters."}
            </p>
            {expenses.length === 0 && (
              <button
                onClick={() => handleOpenModal()}
                className="mt-4 btn btn-primary"
              >
                Add Your First Transaction
              </button>
            )}
          </div>
        )}
      </div>

      {/* Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {editingExpense ? 'Edit Transaction' : 'Add Transaction'}
              </h3>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Type
                    </label>
                    <div className="flex space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="type"
                          value="expense"
                          checked={formData.type === 'expense'}
                          onChange={handleChange}
                          className="form-radio text-expense"
                        />
                        <span className="ml-2 text-gray-700 dark:text-gray-300">Expense</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="type"
                          value="income"
                          checked={formData.type === 'income'}
                          onChange={handleChange}
                          className="form-radio text-income"
                        />
                        <span className="ml-2 text-gray-700 dark:text-gray-300">Income</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      className="input"
                      placeholder="e.g., Grocery shopping, Salary, etc."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Amount
                      </label>
                      <input
                        type="number"
                        id="amount"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        required
                        min="0"
                        step="0.01"
                        className="input"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label htmlFor="currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Currency
                      </label>
                      <select
                        id="currency"
                        name="currency"
                        value={formData.currency}
                        onChange={handleChange}
                        className="input"
                      >
                        {supportedCurrencies && supportedCurrencies.length > 0 ? (
                          supportedCurrencies.map((currency) => (
                            <option key={currency.code} value={currency.code}>
                              {currency.code} - {currency.name}
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="USD">USD - US Dollar</option>
                            <option value="EUR">EUR - Euro</option>
                            <option value="GBP">GBP - British Pound</option>
                            <option value="JPY">JPY - Japanese Yen</option>
                            <option value="CAD">CAD - Canadian Dollar</option>
                            <option value="AUD">AUD - Australian Dollar</option>
                            <option value="INR">INR - Indian Rupee</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      className="input"
                    />
                  </div>

                  <div>
                    <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      id="categoryId"
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleChange}
                      required
                      className="input"
                    >
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.type === 'expense' && (
                    <div>
                      <label htmlFor="budgetId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Budget (Optional)
                      </label>
                      <select
                        id="budgetId"
                        name="budgetId"
                        value={formData.budgetId}
                        onChange={handleChange}
                        className="input"
                      >
                        <option value="">No Budget</option>
                        {budgets.map(budget => (
                          <option key={budget.id} value={budget.id}>
                            {budget.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Notes (Optional)
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      className="input"
                      rows="3"
                      placeholder="Add any additional details..."
                    ></textarea>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    {editingExpense ? 'Update Transaction' : 'Add Transaction'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Expenses
