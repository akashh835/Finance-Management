import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useFinance } from '../hooks/useFinance';
import StatCard from '../components/StatCard';

// Try to import chart.js components
let Bar, ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend;
try {
  const chartjs = require('chart.js');
  const reactChartjs = require('react-chartjs-2');

  Bar = reactChartjs.Bar;
  ChartJS = chartjs.Chart;
  CategoryScale = chartjs.CategoryScale;
  LinearScale = chartjs.LinearScale;
  BarElement = chartjs.BarElement;
  Title = chartjs.Title;
  Tooltip = chartjs.Tooltip;
  Legend = chartjs.Legend;

  // Register ChartJS components if available
  if (ChartJS && ChartJS.register) {
    ChartJS.register(
      CategoryScale,
      LinearScale,
      BarElement,
      Title,
      Tooltip,
      Legend
    );
  }
} catch (e) {
  console.error('Error loading chart libraries:', e);
}

// Import format from date-fns if available, otherwise use a fallback
let format;
try {
  format = require('date-fns').format;
} catch (e) {
  // Fallback format function if date-fns is not available
  format = (date, formatStr) => {
    const d = new Date(date);
    return d.toLocaleDateString();
  };
}



function DashboardSimple() {
  const { user } = useAuth();
  const {
    expenses,
    categories,
    budgets,
    loading,
    getCategorySpent
  } = useFinance() || {};

  const [recentExpenses, setRecentExpenses] = useState([]);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (expenses && expenses.length > 0 && categories && categories.length > 0 && getCategorySpent) {
      // Get recent expenses
      const sorted = [...expenses]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

      setRecentExpenses(sorted);

      // Prepare chart data
      const categoryData = categories.map(category => ({
        name: category.name,
        amount: getCategorySpent(category.id),
        color: category.color,
      }));

      // Sort by amount and take top 5
      const topCategories = categoryData
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

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
      });
    }
  }, [expenses, categories, getCategorySpent]);

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

  // Calculate totals
  const totalIncome = expenses
    ? expenses
        .filter(expense => expense.type === 'income')
        .reduce((total, expense) => total + Number(expense.amount), 0)
    : 0;

  const totalExpenses = expenses
    ? expenses
        .filter(expense => expense.type === 'expense')
        .reduce((total, expense) => total + Number(expense.amount), 0)
    : 0;

  const netIncome = totalIncome - totalExpenses;

  // Get recent expenses
  const recentExpenses = expenses
    ? [...expenses]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
    : [];

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
        <StatCard
          title="Total Income"
          value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalIncome)}
          color="income"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <StatCard
          title="Total Expenses"
          value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalExpenses)}
          color="expense"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />

        <StatCard
          title="Net Income"
          value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(netIncome)}
          color={netIncome >= 0 ? "income" : "expense"}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
      </div>

      {/* Charts and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Spending by Category
          </h2>
          {chartData && Bar ? (
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
          ) : (
            <div className="p-4 text-center">
              <p className="text-gray-500 dark:text-gray-400">Chart visualization is loading or unavailable.</p>
              <div className="mt-4">
                {chartData && chartData.labels && chartData.labels.map((label, index) => (
                  <div key={index} className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      ${chartData.datasets[0].data[index].toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Transactions
        </h2>

        {recentExpenses.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentExpenses.map(expense => (
              <div key={expense.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{expense.description}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(expense.date).toLocaleDateString()}
                  </p>
                </div>
                <span className={`text-sm font-medium ${expense.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {expense.type === 'income' ? '+' : '-'}
                  ${Number(expense.amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No recent transactions</p>
        )}
      </div>

      {/* Budget Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Budget Status
        </h2>

        {budgets && budgets.length > 0 ? (
          <div className="space-y-4">
            {budgets.map(budget => {
              const spent = expenses
                ? expenses
                    .filter(e => e.budgetId === budget.id && e.type === 'expense')
                    .reduce((sum, e) => sum + Number(e.amount), 0)
                : 0;

              const progress = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
              let progressColor = 'bg-blue-600';
              if (progress >= 75) progressColor = 'bg-red-600';
              else if (progress >= 50) progressColor = 'bg-yellow-600';

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
                      className={`${progressColor} h-2.5 rounded-full`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
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

export default DashboardSimple;
