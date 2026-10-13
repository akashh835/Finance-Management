import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useFinance } from '../hooks/useFinance';

function DashboardBasic() {
  const { user } = useAuth();
  const { 
    expenses, 
    categories, 
    budgets, 
    loading,
    getTotalIncome,
    getTotalExpenses,
    getNetIncome
  } = useFinance() || {};

  const [recentExpenses, setRecentExpenses] = useState([]);
  const [topCategories, setTopCategories] = useState([]);

  useEffect(() => {
    if (expenses && expenses.length > 0) {
      // Get recent expenses
      const sorted = [...expenses]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
      
      setRecentExpenses(sorted);
    }
    
    if (expenses && expenses.length > 0 && categories && categories.length > 0) {
      // Calculate spending by category
      const categorySpending = categories.map(category => {
        const amount = expenses
          .filter(expense => expense.categoryId === category.id && expense.type === 'expense')
          .reduce((sum, expense) => sum + Number(expense.amount), 0);
        
        return {
          id: category.id,
          name: category.name,
          amount,
          color: category.color
        };
      });
      
      // Sort by amount and take top 5
      const top = categorySpending
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);
      
      setTopCategories(top);
    }
  }, [expenses, categories]);

  const totalIncome = getTotalIncome ? getTotalIncome() : 0;
  const totalExpenses = getTotalExpenses ? getTotalExpenses() : 0;
  const netIncome = getNetIncome ? getNetIncome() : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name || 'User'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here's an overview of your finances
        </p>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Total Income</h3>
          <p className="text-2xl font-bold text-green-600">
            ${totalIncome.toFixed(2)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Total Expenses</h3>
          <p className="text-2xl font-bold text-red-600">
            ${totalExpenses.toFixed(2)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Net Income</h3>
          <p className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${netIncome.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Charts and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Spending by Category
          </h2>
          
          {topCategories.length > 0 ? (
            <div className="space-y-4">
              {topCategories.map(category => {
                const percentage = totalExpenses > 0 
                  ? (category.amount / totalExpenses) * 100 
                  : 0;
                
                return (
                  <div key={category.id}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {category.name}
                      </span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        ${category.amount.toFixed(2)} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="h-2.5 rounded-full" 
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: category.color || '#3b82f6'
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No spending data available</p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Transactions
          </h2>

          {recentExpenses.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentExpenses.map(expense => {
                const category = categories && categories.find
                  ? (categories.find(cat => cat.id === expense.categoryId) || { name: 'Uncategorized', color: '#6b7280' })
                  : { name: 'Uncategorized', color: '#6b7280' };

                return (
                  <div key={expense.id} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {expense.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {category.name} • {new Date(expense.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`text-sm font-medium ${expense.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {expense.type === 'income' ? '+' : '-'}
                      ${Number(expense.amount).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No recent transactions</p>
          )}
        </div>
      </div>

      {/* Budget Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Budget Status
        </h2>

        {budgets && budgets.length > 0 ? (
          <div className="space-y-4">
            {budgets.map(budget => {
              const spent = expenses && expenses.filter
                ? expenses
                    .filter(e => e.budgetId === budget.id && e.type === 'expense')
                    .reduce((sum, e) => sum + Number(e.amount), 0)
                : 0;

              const progress = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
              let progressColor = '#3b82f6'; // blue
              if (progress >= 75) progressColor = '#ef4444'; // red
              else if (progress >= 50) progressColor = '#f59e0b'; // yellow

              return (
                <div key={budget.id}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{budget.name}</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      ${spent.toFixed(2)} of ${budget.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full"
                      style={{ 
                        width: `${Math.min(progress, 100)}%`,
                        backgroundColor: progressColor
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No budgets created yet</p>
        )}
      </div>
    </div>
  );
}

export default DashboardBasic;
