import { useState, useEffect } from 'react'
import { useFinance } from '../hooks/useFinance'
import { format, startOfMonth, endOfMonth, subMonths, parseISO } from 'date-fns'
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js'
import { Bar, Line, Pie } from 'react-chartjs-2'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

function Reports() {
  const { expenses, categories } = useFinance()
  const [selectedReport, setSelectedReport] = useState('income-vs-expenses')
  const [timeframe, setTimeframe] = useState('6months')
  const [chartData, setChartData] = useState(null)
  
  useEffect(() => {
    generateReport()
  }, [selectedReport, timeframe, expenses, categories])
  
  const generateReport = () => {
    switch (selectedReport) {
      case 'income-vs-expenses':
        generateIncomeVsExpensesReport()
        break
      case 'spending-by-category':
        generateSpendingByCategoryReport()
        break
      case 'monthly-spending-trend':
        generateMonthlySpendingTrendReport()
        break
      default:
        generateIncomeVsExpensesReport()
    }
  }
  
  const getTimeframeMonths = () => {
    const now = new Date()
    let months = []
    
    switch (timeframe) {
      case '3months':
        for (let i = 2; i >= 0; i--) {
          const month = subMonths(now, i)
          months.push(month)
        }
        break
      case '6months':
        for (let i = 5; i >= 0; i--) {
          const month = subMonths(now, i)
          months.push(month)
        }
        break
      case '12months':
        for (let i = 11; i >= 0; i--) {
          const month = subMonths(now, i)
          months.push(month)
        }
        break
    }
    
    return months
  }
  
  const generateIncomeVsExpensesReport = () => {
    const months = getTimeframeMonths()
    
    const labels = months.map(month => format(month, 'MMM yyyy'))
    const incomeData = []
    const expenseData = []
    
    months.forEach(month => {
      const start = startOfMonth(month)
      const end = endOfMonth(month)
      
      const monthlyExpenses = expenses.filter(expense => {
        const date = parseISO(expense.date)
        return date >= start && date <= end
      })
      
      const income = monthlyExpenses
        .filter(expense => expense.type === 'income')
        .reduce((sum, expense) => sum + Number(expense.amount), 0)
      
      const expense = monthlyExpenses
        .filter(expense => expense.type === 'expense')
        .reduce((sum, expense) => sum + Number(expense.amount), 0)
      
      incomeData.push(income)
      expenseData.push(expense)
    })
    
    setChartData({
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Income',
            data: incomeData,
            backgroundColor: '#22c55e',
            borderColor: '#22c55e',
            borderWidth: 1,
          },
          {
            label: 'Expenses',
            data: expenseData,
            backgroundColor: '#ef4444',
            borderColor: '#ef4444',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Income vs Expenses',
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
      },
    })
  }
  
  const generateSpendingByCategoryReport = () => {
    // Filter expenses by timeframe
    const months = getTimeframeMonths()
    const start = startOfMonth(months[0])
    const end = endOfMonth(months[months.length - 1])
    
    const filteredExpenses = expenses.filter(expense => {
      const date = parseISO(expense.date)
      return date >= start && date <= end && expense.type === 'expense'
    })
    
    // Group expenses by category
    const categoryTotals = {}
    
    filteredExpenses.forEach(expense => {
      if (!categoryTotals[expense.categoryId]) {
        categoryTotals[expense.categoryId] = 0
      }
      categoryTotals[expense.categoryId] += Number(expense.amount)
    })
    
    // Prepare chart data
    const categoryData = Object.entries(categoryTotals).map(([categoryId, total]) => {
      const category = categories.find(c => c.id === categoryId) || { name: 'Uncategorized', color: '#6b7280' }
      return {
        categoryId,
        name: category.name,
        total,
        color: category.color,
      }
    })
    
    // Sort by total amount (highest first)
    categoryData.sort((a, b) => b.total - a.total)
    
    setChartData({
      type: 'pie',
      data: {
        labels: categoryData.map(cat => cat.name),
        datasets: [
          {
            data: categoryData.map(cat => cat.total),
            backgroundColor: categoryData.map(cat => cat.color),
            borderColor: categoryData.map(cat => cat.color),
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'right',
          },
          title: {
            display: true,
            text: 'Spending by Category',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: $${value} (${percentage}%)`;
              }
            }
          }
        },
      },
    })
  }
  
  const generateMonthlySpendingTrendReport = () => {
    const months = getTimeframeMonths()
    
    const labels = months.map(month => format(month, 'MMM yyyy'))
    const spendingData = []
    
    months.forEach(month => {
      const start = startOfMonth(month)
      const end = endOfMonth(month)
      
      const monthlyExpenses = expenses.filter(expense => {
        const date = parseISO(expense.date)
        return date >= start && date <= end && expense.type === 'expense'
      })
      
      const total = monthlyExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0)
      spendingData.push(total)
    })
    
    setChartData({
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Monthly Spending',
            data: spendingData,
            fill: true,
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderColor: '#3b82f6',
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Monthly Spending Trend',
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
      },
    })
  }
  
  const renderChart = () => {
    if (!chartData) return null
    
    switch (chartData.type) {
      case 'bar':
        return <Bar data={chartData.data} options={chartData.options} />
      case 'line':
        return <Line data={chartData.data} options={chartData.options} />
      case 'pie':
        return <Pie data={chartData.data} options={chartData.options} />
      default:
        return null
    }
  }
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Reports</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Analyze your financial data with visual reports
        </p>
      </div>
      
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <label htmlFor="report-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Report Type
            </label>
            <select
              id="report-type"
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="input max-w-xs"
            >
              <option value="income-vs-expenses">Income vs Expenses</option>
              <option value="spending-by-category">Spending by Category</option>
              <option value="monthly-spending-trend">Monthly Spending Trend</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="timeframe" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Timeframe
            </label>
            <select
              id="timeframe"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="input max-w-xs"
            >
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="12months">Last 12 Months</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="card">
        <div className="h-96">
          {expenses.length > 0 ? (
            renderChart()
          ) : (
            <div className="h-full flex flex-col items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No data to display</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Add some transactions to see reports.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Reports
