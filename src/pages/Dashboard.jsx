import { useState, useEffect } from 'react'
import { useFinance } from '../hooks/useFinance'
import { useAuth } from '../hooks/useAuth'
import { useCurrency } from '../hooks/useCurrency'
import StatCard from '../components/StatCard'
import { formatDate } from '../utils/dateUtils'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

function Dashboard() {
  const { user } = useAuth()
  const { formatAmount } = useCurrency()
  const {
    expenses,
    categories,
    budgets,
    loading,
    getTotalIncome,
    getTotalExpenses,
    getNetIncome,
    getCategorySpent
  } = useFinance() || {}

  const [recentExpenses, setRecentExpenses] = useState([])
  const [chartData, setChartData] = useState(null)

  useEffect(() => {
    if (expenses && expenses.length > 0 && categories && categories.length > 0) {
      // Get recent expenses
      const sorted = [...expenses]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)

      setRecentExpenses(sorted)

      // Prepare chart data
      const categoryData = categories.map(category => ({
        name: category.name,
        amount: getCategorySpent(category.id),
        color: category.color,
      }))

      // Sort by amount and take top 5
      const topCategories = categoryData
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5)

      setChartData({
        labels: topCategories.map(cat => cat.name),
        datasets: [
          {
            label: 'Spending by Category',
            data: topCategories.map(cat => cat.amount),
            backgroundColor: topCategories.map(cat => cat.color),
            borderColor: topCategories.map(cat => cat.color),
            borderWidth: 1,
          },
        ],
      })
    }
  }, [expenses, categories, getCategorySpent])

  const totalIncome = getTotalIncome ? getTotalIncome() : 0
  const totalExpenses = getTotalExpenses ? getTotalExpenses() : 0
  const netIncome = getNetIncome ? getNetIncome() : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your financial data...</p>
        </div>
      </div>
    )
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Income"
          value={formatAmount(totalIncome, 'USD')}
          color="income"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <StatCard
          title="Total Expenses"
          value={formatAmount(totalExpenses, 'USD')}
          color="expense"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />

        <StatCard
          title="Net Income"
          value={formatAmount(netIncome, 'USD')}
          color={netIncome >= 0 ? "income" : "expense"}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Spending by Category
          </h2>
          {chartData && (
            <Bar
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return '$' + value;
                      }
                    }
                  }
                }
              }}
            />
          )}
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Transactions
          </h2>

          {recentExpenses.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentExpenses.map(expense => {
                const category = categories && categories.find ?
                  (categories.find(cat => cat.id === expense.categoryId) || { name: 'Uncategorized', color: '#6b7280' }) :
                  { name: 'Uncategorized', color: '#6b7280' }

                return (
                  <div key={expense.id} className="py-3 flex justify-between items-center">
                    <div className="flex items-center">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                        style={{ backgroundColor: category.color + '20', color: category.color }}
                      >
                        {expense.type === 'income' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{expense.description}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {category.name} • {formatDate(expense.date)}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-medium ${expense.type === 'income' ? 'text-income' : 'text-expense'}`}>
                      {expense.type === 'income' ? '+' : '-'}
                      {formatAmount(expense.amount, expense.currency || 'USD')}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No recent transactions</p>
          )}
        </div>
      </div>

      <div className="card">
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
                : 0

              const progress = budget.amount > 0 ? (spent / budget.amount) * 100 : 0
              let progressColor = 'bg-primary-600'
              if (progress >= 75) progressColor = 'bg-expense'
              else if (progress >= 50) progressColor = 'bg-savings'

              return (
                <div key={budget.id}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{budget.name}</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {formatAmount(spent, budget.currency || 'USD')}
                      {' of '}
                      {formatAmount(budget.amount, budget.currency || 'USD')}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                      className={`${progressColor} h-2.5 rounded-full`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No budgets created yet</p>
        )}
      </div>
    </div>
  )
}

export default Dashboard
