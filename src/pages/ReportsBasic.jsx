import { useState, useEffect } from 'react';
import { useFinance } from '../hooks/useFinance';

function ReportsBasic() {
  const {
    expenses,
    categories,
    budgets,
    getTotalIncome,
    getTotalExpenses,
    getNetIncome
  } = useFinance() || {};
  const [selectedReport, setSelectedReport] = useState('income-vs-expenses');
  const [timeframe, setTimeframe] = useState('6months');
  const [showAllData, setShowAllData] = useState(false);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    if (expenses && categories) {
      generateReport();
    }
  }, [selectedReport, timeframe, expenses, categories]);

  const generateReport = () => {
    switch (selectedReport) {
      case 'income-vs-expenses':
        generateIncomeVsExpensesReport();
        break;
      case 'spending-by-category':
        generateSpendingByCategoryReport();
        break;
      case 'monthly-spending-trend':
        generateMonthlySpendingTrendReport();
        break;
      case 'budget-performance':
        generateBudgetPerformanceReport();
        break;
      case 'expense-breakdown':
        generateExpenseBreakdownReport();
        break;
      default:
        generateIncomeVsExpensesReport();
    }
  };

  const getTimeframeMonths = () => {
    const now = new Date();
    let months = [];

    const getMonthName = (date) => {
      return date.toLocaleString('default', { month: 'short' }) + ' ' + date.getFullYear();
    };

    const subMonths = (date, months) => {
      const newDate = new Date(date);
      newDate.setMonth(date.getMonth() - months);
      return newDate;
    };

    const getMonthRange = (numMonths) => {
      const result = [];
      for (let i = numMonths - 1; i >= 0; i--) {
        const month = subMonths(now, i);
        result.push({
          label: getMonthName(month),
          start: new Date(month.getFullYear(), month.getMonth(), 1),
          end: new Date(month.getFullYear(), month.getMonth() + 1, 0)
        });
      }
      return result;
    };

    switch (timeframe) {
      case '3months':
        months = getMonthRange(3);
        break;
      case '6months':
        months = getMonthRange(6);
        break;
      case '12months':
        months = getMonthRange(12);
        break;
    }

    return months;
  };

  const generateIncomeVsExpensesReport = () => {
    const months = getTimeframeMonths();

    // Get previous period months for comparison
    const getPreviousPeriodMonths = (months) => {
      const result = [];
      const firstMonth = new Date(months[0].start);

      // Calculate the start date for the previous period
      // (same number of months, but before the current period)
      const previousPeriodStart = new Date(firstMonth);
      previousPeriodStart.setMonth(firstMonth.getMonth() - months.length);

      for (let i = 0; i < months.length; i++) {
        const prevMonthDate = new Date(previousPeriodStart);
        prevMonthDate.setMonth(previousPeriodStart.getMonth() + i);

        result.push({
          label: prevMonthDate.toLocaleString('default', { month: 'short' }) + ' ' + prevMonthDate.getFullYear(),
          start: new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth(), 1),
          end: new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth() + 1, 0)
        });
      }

      return result;
    };

    const previousMonths = getPreviousPeriodMonths(months);

    const labels = months.map(month => month.label);
    const incomeData = [];
    const expenseData = [];
    const prevIncomeData = [];
    const prevExpenseData = [];

    // Current period data
    months.forEach(month => {
      const { start, end } = month;

      const monthlyExpenses = expenses.filter(expense => {
        const date = new Date(expense.date);
        return date >= start && date <= end;
      });

      const income = monthlyExpenses
        .filter(expense => expense.type === 'income')
        .reduce((sum, expense) => sum + Number(expense.amount), 0);

      const expense = monthlyExpenses
        .filter(expense => expense.type === 'expense')
        .reduce((sum, expense) => sum + Number(expense.amount), 0);

      incomeData.push(income);
      expenseData.push(expense);
    });

    // Previous period data
    previousMonths.forEach(month => {
      const { start, end } = month;

      const monthlyExpenses = expenses.filter(expense => {
        const date = new Date(expense.date);
        return date >= start && date <= end;
      });

      const income = monthlyExpenses
        .filter(expense => expense.type === 'income')
        .reduce((sum, expense) => sum + Number(expense.amount), 0);

      const expense = monthlyExpenses
        .filter(expense => expense.type === 'expense')
        .reduce((sum, expense) => sum + Number(expense.amount), 0);

      prevIncomeData.push(income);
      prevExpenseData.push(expense);
    });

    // Calculate period totals and changes
    const currentIncome = incomeData.reduce((sum, val) => sum + val, 0);
    const currentExpense = expenseData.reduce((sum, val) => sum + val, 0);
    const previousIncome = prevIncomeData.reduce((sum, val) => sum + val, 0);
    const previousExpense = prevExpenseData.reduce((sum, val) => sum + val, 0);

    const incomeChange = previousIncome > 0 ? ((currentIncome - previousIncome) / previousIncome) * 100 : 0;
    const expenseChange = previousExpense > 0 ? ((currentExpense - previousExpense) / previousExpense) * 100 : 0;

    setReportData({
      type: 'income-vs-expenses',
      labels,
      datasets: [
        {
          label: 'Income',
          data: incomeData,
          color: '#22c55e',
          previousData: prevIncomeData,
          total: currentIncome,
          previousTotal: previousIncome,
          change: incomeChange
        },
        {
          label: 'Expenses',
          data: expenseData,
          color: '#ef4444',
          previousData: prevExpenseData,
          total: currentExpense,
          previousTotal: previousExpense,
          change: expenseChange
        }
      ]
    });
  };

  const generateSpendingByCategoryReport = () => {
    // Get current and previous timeframes
    const months = getTimeframeMonths();
    const currentStart = months[0].start;
    const currentEnd = months[months.length - 1].end;

    // Calculate previous period dates
    const previousStart = new Date(currentStart);
    previousStart.setMonth(previousStart.getMonth() - months.length);
    const previousEnd = new Date(previousStart);
    previousEnd.setMonth(previousStart.getMonth() + months.length - 1);
    previousEnd.setDate(new Date(previousEnd.getFullYear(), previousEnd.getMonth() + 1, 0).getDate()); // Last day of the month

    // Filter expenses for current period
    const currentExpenses = expenses.filter(expense => {
      const date = new Date(expense.date);
      return date >= currentStart && date <= currentEnd && expense.type === 'expense';
    });

    // Filter expenses for previous period
    const previousExpenses = expenses.filter(expense => {
      const date = new Date(expense.date);
      return date >= previousStart && date <= previousEnd && expense.type === 'expense';
    });

    // Group current expenses by category
    const currentCategoryTotals = {};
    currentExpenses.forEach(expense => {
      if (!currentCategoryTotals[expense.categoryId]) {
        currentCategoryTotals[expense.categoryId] = 0;
      }
      currentCategoryTotals[expense.categoryId] += Number(expense.amount);
    });

    // Group previous expenses by category
    const previousCategoryTotals = {};
    previousExpenses.forEach(expense => {
      if (!previousCategoryTotals[expense.categoryId]) {
        previousCategoryTotals[expense.categoryId] = 0;
      }
      previousCategoryTotals[expense.categoryId] += Number(expense.amount);
    });

    // Prepare chart data for current period
    const categoryData = Object.entries(currentCategoryTotals).map(([categoryId, total]) => {
      const category = categories.find(c => c.id === categoryId) || { name: 'Uncategorized', color: '#6b7280' };
      const previousTotal = previousCategoryTotals[categoryId] || 0;
      const change = previousTotal > 0 ? ((total - previousTotal) / previousTotal) * 100 : 0;

      return {
        categoryId,
        name: category.name,
        total,
        previousTotal,
        change,
        color: category.color,
      };
    });

    // Sort by total amount (highest first)
    categoryData.sort((a, b) => b.total - a.total);

    // Calculate total spending for both periods
    const totalSpending = categoryData.reduce((sum, cat) => sum + cat.total, 0);
    const previousTotalSpending = Object.values(previousCategoryTotals).reduce((sum, total) => sum + total, 0);
    const totalChange = previousTotalSpending > 0 ? ((totalSpending - previousTotalSpending) / previousTotalSpending) * 100 : 0;

    // Add percentage to each category
    categoryData.forEach(cat => {
      cat.percentage = totalSpending > 0 ? (cat.total / totalSpending) * 100 : 0;
      cat.previousPercentage = previousTotalSpending > 0 ? (cat.previousTotal / previousTotalSpending) * 100 : 0;
    });

    setReportData({
      type: 'spending-by-category',
      categories: categoryData,
      total: totalSpending,
      previousTotal: previousTotalSpending,
      change: totalChange,
      periodLabel: `${months[0].label} - ${months[months.length - 1].label}`,
      previousPeriodLabel: `${new Date(previousStart).toLocaleString('default', { month: 'short' })} ${new Date(previousStart).getFullYear()} - ${new Date(previousEnd).toLocaleString('default', { month: 'short' })} ${new Date(previousEnd).getFullYear()}`
    });
  };

  const generateMonthlySpendingTrendReport = () => {
    const months = getTimeframeMonths();

    // Get previous period months for comparison
    const getPreviousPeriodMonths = (months) => {
      const result = [];
      const firstMonth = new Date(months[0].start);

      // Calculate the start date for the previous period
      // (same number of months, but before the current period)
      const previousPeriodStart = new Date(firstMonth);
      previousPeriodStart.setMonth(firstMonth.getMonth() - months.length);

      for (let i = 0; i < months.length; i++) {
        const prevMonthDate = new Date(previousPeriodStart);
        prevMonthDate.setMonth(previousPeriodStart.getMonth() + i);

        result.push({
          label: prevMonthDate.toLocaleString('default', { month: 'short' }) + ' ' + prevMonthDate.getFullYear(),
          start: new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth(), 1),
          end: new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth() + 1, 0)
        });
      }

      return result;
    };

    const previousMonths = getPreviousPeriodMonths(months);

    const labels = months.map(month => month.label);
    const spendingData = [];
    const prevSpendingData = [];

    // Current period data
    months.forEach(month => {
      const { start, end } = month;

      const monthlyExpenses = expenses.filter(expense => {
        const date = new Date(expense.date);
        return date >= start && date <= end && expense.type === 'expense';
      });

      const total = monthlyExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
      spendingData.push(total);
    });

    // Previous period data
    previousMonths.forEach(month => {
      const { start, end } = month;

      const monthlyExpenses = expenses.filter(expense => {
        const date = new Date(expense.date);
        return date >= start && date <= end && expense.type === 'expense';
      });

      const total = monthlyExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
      prevSpendingData.push(total);
    });

    // Calculate period totals and changes
    const currentTotal = spendingData.reduce((sum, val) => sum + val, 0);
    const previousTotal = prevSpendingData.reduce((sum, val) => sum + val, 0);
    const change = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;

    // Calculate average monthly spending
    const currentAvg = spendingData.length > 0 ? currentTotal / spendingData.length : 0;
    const previousAvg = prevSpendingData.length > 0 ? previousTotal / prevSpendingData.length : 0;

    setReportData({
      type: 'monthly-spending-trend',
      labels,
      data: spendingData,
      previousData: prevSpendingData,
      total: currentTotal,
      previousTotal,
      change,
      average: currentAvg,
      previousAverage: previousAvg
    });
  };

  const renderIncomeVsExpensesReport = () => {
    if (!reportData || reportData.type !== 'income-vs-expenses') return null;

    const { labels = [], datasets = [] } = reportData;

    // Ensure datasets has at least two entries
    if (datasets.length < 2) {
      return (
        <div className="p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">Insufficient data to generate this report.</p>
        </div>
      );
    }
    const maxValue = Math.max(
      ...datasets[0].data,
      ...datasets[1].data,
      ...datasets[0].previousData || [],
      ...datasets[1].previousData || []
    );

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-center">Income vs Expenses</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Legend</h4>
            <div className="flex flex-col space-y-2">
              {datasets.map((dataset, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-4 h-4 mr-2" style={{ backgroundColor: dataset.color }}></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{dataset.label}</span>
                </div>
              ))}
              <div className="flex items-center">
                <div className="w-4 h-4 mr-2 border border-gray-400 bg-gray-200"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Previous Period</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Total Income:</span>
                <div className="text-right">
                  <div className="text-sm font-medium text-green-600">
                    ${datasets[0].total.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">
                    vs ${datasets[0].previousTotal.toFixed(2)}
                    <span className={datasets[0].change >= 0 ? 'text-green-600 ml-1' : 'text-red-600 ml-1'}>
                      ({datasets[0].change >= 0 ? '+' : ''}{datasets[0].change.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Total Expenses:</span>
                <div className="text-right">
                  <div className="text-sm font-medium text-red-600">
                    ${datasets[1].total.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">
                    vs ${datasets[1].previousTotal.toFixed(2)}
                    <span className={datasets[1].change <= 0 ? 'text-green-600 ml-1' : 'text-red-600 ml-1'}>
                      ({datasets[1].change >= 0 ? '+' : ''}{datasets[1].change.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative h-64 mt-8 ml-8">
          {/* Horizontal grid lines */}
          <div className="absolute left-0 top-0 w-full h-full">
            {[0, 25, 50, 75, 100].map((percent) => (
              <div
                key={percent}
                className="absolute w-full border-t border-gray-200 dark:border-gray-700"
                style={{ bottom: `${percent}%` }}
              ></div>
            ))}
          </div>

          <div className="absolute left-0 bottom-0 w-full h-full flex items-end">
            {labels.map((label, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full flex justify-center space-x-2">
                  {datasets.map((dataset, dataIndex) => {
                    const height = maxValue > 0 ? (dataset.data[index] / maxValue) * 100 : 0;
                    const prevHeight = dataset.previousData && maxValue > 0 ?
                      (dataset.previousData[index] / maxValue) * 100 : 0;

                    return (
                      <div key={dataIndex} className="relative group">
                        {/* Previous period bar (behind current) */}
                        {dataset.previousData && dataset.previousData[index] > 0 && (
                          <div
                            className="w-8 rounded-t absolute bottom-0 left-0 opacity-30"
                            style={{
                              height: `${prevHeight}%`,
                              backgroundColor: dataset.color,
                              border: '1px dashed #666',
                              minHeight: '4px'
                            }}
                          ></div>
                        )}

                        {/* Current period bar */}
                        <div
                          className="w-8 rounded-t transition-all duration-200 hover:opacity-80 relative z-10"
                          style={{
                            height: `${height}%`,
                            backgroundColor: dataset.color,
                            minHeight: dataset.data[index] > 0 ? '4px' : '0'
                          }}
                        ></div>

                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity whitespace-nowrap z-20">
                          <div>{dataset.label}: ${dataset.data[index].toFixed(2)}</div>
                          {dataset.previousData && (
                            <div className="text-gray-300 text-xs">
                              Previous: ${dataset.previousData[index].toFixed(2)}
                              {dataset.previousData[index] > 0 && (
                                <span className={dataset.data[index] >= dataset.previousData[index] ? 'text-green-400 ml-1' : 'text-red-400 ml-1'}>
                                  ({((dataset.data[index] - dataset.previousData[index]) / dataset.previousData[index] * 100).toFixed(1)}%)
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 transform -rotate-45 origin-top-left">
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-600 dark:text-gray-400 pr-2">
            <div>${maxValue.toFixed(0)}</div>
            <div>${(maxValue * 0.75).toFixed(0)}</div>
            <div>${(maxValue * 0.5).toFixed(0)}</div>
            <div>${(maxValue * 0.25).toFixed(0)}</div>
            <div>$0</div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Breakdown</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Month</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Income</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">vs Prev</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Expenses</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">vs Prev</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {labels.map((label, index) => {
                  const income = datasets[0].data[index];
                  const expense = datasets[1].data[index];
                  const prevIncome = datasets[0].previousData ? datasets[0].previousData[index] : 0;
                  const prevExpense = datasets[1].previousData ? datasets[1].previousData[index] : 0;
                  const net = income - expense;

                  const incomeChange = prevIncome > 0 ? ((income - prevIncome) / prevIncome) * 100 : 0;
                  const expenseChange = prevExpense > 0 ? ((expense - prevExpense) / prevExpense) * 100 : 0;

                  return (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{label}</td>
                      <td className="px-4 py-2 text-sm text-right text-green-600">${income.toFixed(2)}</td>
                      <td className="px-4 py-2 text-xs text-right">
                        {prevIncome > 0 && (
                          <span className={incomeChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {incomeChange >= 0 ? '+' : ''}{incomeChange.toFixed(1)}%
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-sm text-right text-red-600">${expense.toFixed(2)}</td>
                      <td className="px-4 py-2 text-xs text-right">
                        {prevExpense > 0 && (
                          <span className={expenseChange <= 0 ? 'text-green-600' : 'text-red-600'}>
                            {expenseChange >= 0 ? '+' : ''}{expenseChange.toFixed(1)}%
                          </span>
                        )}
                      </td>
                      <td className={`px-4 py-2 text-sm text-right ${net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${net.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderSpendingByCategoryReport = () => {
    if (!reportData || reportData.type !== 'spending-by-category') return null;

    const { categories = [], total = 0, previousTotal = 0, change = 0, periodLabel = '', previousPeriodLabel = '' } = reportData;

    // Handle empty categories array
    if (!categories || categories.length === 0) {
      return (
        <div className="p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">No category data available for the selected period.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-center">Spending by Category</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Total Spending:</span>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    ${total.toFixed(2)}
                  </div>
                  {previousTotal > 0 && (
                    <div className="text-xs text-gray-500">
                      vs ${previousTotal.toFixed(2)}
                      <span className={change <= 0 ? 'text-green-600 ml-1' : 'text-red-600 ml-1'}>
                        ({change >= 0 ? '+' : ''}{change.toFixed(1)}%)
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Categories:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {categories.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Period:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {periodLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Top Categories</h4>
            <div className="space-y-2">
              {categories.slice(0, 3).map((category, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: category.color || '#3b82f6' }}
                      ></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        ${category.total.toFixed(2)} ({category.percentage.toFixed(1)}%)
                      </div>
                      {category.previousTotal > 0 && (
                        <div className="text-xs text-gray-500">
                          vs ${category.previousTotal.toFixed(2)}
                          <span className={category.change <= 0 ? 'text-green-600 ml-1' : 'text-red-600 ml-1'}>
                            ({category.change >= 0 ? '+' : ''}{category.change.toFixed(1)}%)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Pie chart visualization */}
          <div className="relative w-full h-64 flex justify-center items-center">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              {categories.map((category, index) => {
                // Calculate the pie slice
                const totalPercentage = categories.reduce((sum, cat) => sum + cat.percentage, 0) || 100;
                const startAngle = categories.slice(0, index).reduce((sum, cat) => sum + (cat.percentage / totalPercentage) * 360, 0);
                const endAngle = startAngle + (category.percentage / totalPercentage) * 360;

                // Convert angles to radians and calculate coordinates
                const startRad = (startAngle - 90) * Math.PI / 180;
                const endRad = (endAngle - 90) * Math.PI / 180;

                const x1 = 50 + 40 * Math.cos(startRad);
                const y1 = 50 + 40 * Math.sin(startRad);
                const x2 = 50 + 40 * Math.cos(endRad);
                const y2 = 50 + 40 * Math.sin(endRad);

                // Determine if the arc should be drawn as a large arc
                const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

                // Create the SVG path for the pie slice
                const path = [
                  `M 50 50`,
                  `L ${x1} ${y1}`,
                  `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                  `Z`
                ].join(' ');

                return (
                  <path
                    key={index}
                    d={path}
                    fill={category.color || '#3b82f6'}
                    stroke="#fff"
                    strokeWidth="0.5"
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    <title>{category.name}: ${category.total.toFixed(2)} ({category.percentage.toFixed(1)}%)</title>
                  </path>
                );
              })}
            </svg>
          </div>

          {/* Category list with progress bars */}
          <div className="space-y-4">
            {categories.map((category, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: category.color || '#3b82f6' }}
                    ></div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {category.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      ${category.total.toFixed(2)} ({category.percentage.toFixed(1)}%)
                    </div>
                    {category.previousTotal > 0 && (
                      <div className="text-xs text-gray-500">
                        vs ${category.previousTotal.toFixed(2)}
                        <span className={category.change <= 0 ? 'text-green-600 ml-1' : 'text-red-600 ml-1'}>
                          ({category.change >= 0 ? '+' : ''}{category.change.toFixed(1)}%)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-5 relative">
                  {/* Previous period bar (behind current) */}
                  {category.previousPercentage > 0 && (
                    <div
                      className="h-5 rounded-full absolute top-0 left-0 opacity-30"
                      style={{
                        width: `${category.previousPercentage}%`,
                        backgroundColor: category.color || '#3b82f6',
                        border: '1px dashed #666'
                      }}
                    ></div>
                  )}
                  {/* Current period bar */}
                  <div
                    className="h-5 rounded-full transition-all duration-300 relative z-10"
                    style={{
                      width: `${category.percentage}%`,
                      backgroundColor: category.color || '#3b82f6'
                    }}
                  >
                    <span className="absolute right-2 top-0 text-xs text-white font-medium leading-5">
                      {category.percentage > 10 ? `${category.percentage.toFixed(1)}%` : ''}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderMonthlySpendingTrendReport = () => {
    if (!reportData || reportData.type !== 'monthly-spending-trend') return null;

    const { labels, data, previousData = [], total = 0, previousTotal = 0, change = 0, average = 0, previousAverage = 0 } = reportData;
    // Handle empty data arrays
    if (!data || data.length === 0) {
      return (
        <div className="p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">Insufficient data to generate this report.</p>
        </div>
      );
    }

    const maxValue = Math.max(...data, ...(previousData || []));
    if (maxValue <= 0) {
      return (
        <div className="p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">No spending data available for the selected period.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-center">Monthly Spending Trend</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Average Monthly</h4>
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">${average.toFixed(2)}</p>
              {previousAverage > 0 && (
                <p className="text-xs text-gray-500">
                  vs ${previousAverage.toFixed(2)}
                  <span className={average <= previousAverage ? 'text-green-600 ml-1' : 'text-red-600 ml-1'}>
                    ({((average - previousAverage) / previousAverage * 100).toFixed(1)}%)
                  </span>
                </p>
              )}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Total Spending</h4>
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">${total.toFixed(2)}</p>
              {previousTotal > 0 && (
                <p className="text-xs text-gray-500">
                  vs ${previousTotal.toFixed(2)}
                  <span className={change <= 0 ? 'text-green-600 ml-1' : 'text-red-600 ml-1'}>
                    ({change >= 0 ? '+' : ''}{change.toFixed(1)}%)
                  </span>
                </p>
              )}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Period</h4>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{labels[0]} - {labels[labels.length - 1]}</p>
              {previousData && previousData.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">vs previous {previousData.length} months</p>
              )}
            </div>
          </div>
        </div>

        <div className="relative h-64 mt-8 ml-8">
          {/* Horizontal grid lines */}
          <div className="absolute left-0 top-0 w-full h-full">
            {[0, 25, 50, 75, 100].map((percent) => (
              <div
                key={percent}
                className="absolute w-full border-t border-gray-200 dark:border-gray-700"
                style={{ bottom: `${percent}%` }}
              ></div>
            ))}
          </div>

          {/* Line chart */}
          <div className="absolute left-0 bottom-0 w-full h-full">
            {/* Previous period line */}
            {previousData && previousData.length > 0 && (
              <svg className="absolute left-0 bottom-0 w-full h-full" preserveAspectRatio="none">
                <polyline
                  points={
                    labels.map((_, index) => {
                      const x = (index / (labels.length - 1)) * 100;
                      const y = maxValue > 0 ? 100 - ((previousData[index] / maxValue) * 100) : 0;
                      return `${x},${y}`;
                    }).join(' ')
                  }
                  fill="none"
                  stroke="#9ca3af"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            )}

            {/* Current period line and area */}
            <svg className="absolute left-0 bottom-0 w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              <polyline
                points={
                  labels.map((_, index) => {
                    const x = (index / (labels.length - 1)) * 100;
                    const y = maxValue > 0 ? 100 - ((data[index] / maxValue) * 100) : 0;
                    return `${x},${y}`;
                  }).join(' ')
                }
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
              <polygon
                points={
                  `0,100 ` +
                  labels.map((_, index) => {
                    const x = (index / (labels.length - 1)) * 100;
                    const y = maxValue > 0 ? 100 - ((data[index] / maxValue) * 100) : 0;
                    return `${x},${y}`;
                  }).join(' ') +
                  ` 100,100`
                }
                fill="url(#gradient)"
              />
            </svg>

            {/* Data points */}
            <div className="absolute left-0 bottom-0 w-full h-full flex justify-between items-end">
              {labels.map((label, index) => {
                const height = maxValue > 0 ? (data[index] / maxValue) * 100 : 0;
                const prevHeight = previousData && maxValue > 0 ? (previousData[index] / maxValue) * 100 : 0;

                return (
                  <div key={index} className="flex flex-col items-center relative group">
                    {/* Previous period point */}
                    {previousData && previousData[index] > 0 && (
                      <div
                        className="w-3 h-3 rounded-full bg-gray-300 border border-gray-500 absolute z-0"
                        style={{
                          bottom: `${prevHeight}%`
                        }}
                      ></div>
                    )}

                    {/* Current period point */}
                    <div
                      className="w-3 h-3 rounded-full bg-white border-2 border-blue-500 z-10 relative"
                      style={{
                        marginBottom: `${height}%`
                      }}
                    ></div>

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity whitespace-nowrap z-20">
                      <div>Current: ${data[index].toFixed(2)}</div>
                      {previousData && (
                        <div className="text-gray-300 text-xs">
                          Previous: ${previousData[index].toFixed(2)}
                          {previousData[index] > 0 && (
                            <span className={data[index] <= previousData[index] ? 'text-green-400 ml-1' : 'text-red-400 ml-1'}>
                              ({((data[index] - previousData[index]) / previousData[index] * 100).toFixed(1)}%)
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 transform -rotate-45 origin-top-left">
                      {label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-600 dark:text-gray-400 pr-2">
            <div>${maxValue.toFixed(0)}</div>
            <div>${(maxValue * 0.75).toFixed(0)}</div>
            <div>${(maxValue * 0.5).toFixed(0)}</div>
            <div>${(maxValue * 0.25).toFixed(0)}</div>
            <div>$0</div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Breakdown</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Month</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Spending</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">vs Prev Period</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">vs Prev Month</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {labels.map((label, index) => {
                  const current = data[index];
                  const prevPeriod = previousData ? previousData[index] : null;
                  const prevMonth = index > 0 ? data[index - 1] : null;

                  const vsLastPeriod = prevPeriod !== null ? ((current - prevPeriod) / prevPeriod) * 100 : null;
                  const vsLastMonth = prevMonth !== null ? ((current - prevMonth) / prevMonth) * 100 : null;

                  return (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{label}</td>
                      <td className="px-4 py-2 text-sm text-right text-gray-900 dark:text-white">${current.toFixed(2)}</td>
                      <td className="px-4 py-2 text-sm text-right">
                        {prevPeriod !== null ? (
                          <span className={vsLastPeriod <= 0 ? 'text-green-600' : 'text-red-600'}>
                            {vsLastPeriod >= 0 ? '+' : ''}{vsLastPeriod.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-sm text-right">
                        {vsLastMonth !== null ? (
                          <span className={vsLastMonth <= 0 ? 'text-green-600' : 'text-red-600'}>
                            {vsLastMonth >= 0 ? '+' : ''}{vsLastMonth.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const generateBudgetPerformanceReport = () => {
    if (!budgets || !expenses) {
      setReportData({
        type: 'budget-performance',
        budgets: [],
        timeframe: timeframe
      });
      return;
    }

    const months = getTimeframeMonths();
    const startDate = months[0].start;
    const endDate = months[months.length - 1].end;

    // Filter expenses within the selected timeframe
    const filteredExpenses = expenses.filter(expense => {
      const date = new Date(expense.date);
      return date >= startDate && date <= endDate && expense.type === 'expense';
    });

    // Calculate budget performance
    const budgetPerformance = budgets.map(budget => {
      // Get expenses for this budget
      const budgetExpenses = filteredExpenses.filter(expense => expense.budgetId === budget.id);
      const spent = budgetExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
      const remaining = budget.amount - spent;
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

      // Get category breakdown for this budget
      const categoryBreakdown = [];
      if (categories && categories.length > 0) {
        // Group expenses by category
        const expensesByCategory = {};
        budgetExpenses.forEach(expense => {
          if (!expensesByCategory[expense.categoryId]) {
            expensesByCategory[expense.categoryId] = 0;
          }
          expensesByCategory[expense.categoryId] += Number(expense.amount);
        });

        // Create category breakdown
        Object.entries(expensesByCategory).forEach(([categoryId, amount]) => {
          const category = categories.find(c => c.id === categoryId);
          if (category) {
            categoryBreakdown.push({
              id: categoryId,
              name: category.name,
              color: category.color,
              amount,
              percentage: spent > 0 ? (amount / spent) * 100 : 0
            });
          }
        });

        // Sort by amount (highest first)
        categoryBreakdown.sort((a, b) => b.amount - a.amount);
      }

      // Get expense history (monthly)
      const expenseHistory = [];
      months.forEach(month => {
        const monthlyExpenses = budgetExpenses.filter(expense => {
          const date = new Date(expense.date);
          return date >= month.start && date <= month.end;
        });

        const monthlyTotal = monthlyExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
        expenseHistory.push({
          month: month.label,
          amount: monthlyTotal,
          percentage: budget.amount > 0 ? (monthlyTotal / budget.amount) * 100 : 0
        });
      });

      return {
        id: budget.id,
        name: budget.name,
        amount: budget.amount,
        spent,
        remaining,
        percentage,
        categoryBreakdown,
        expenseHistory
      };
    });

    setReportData({
      type: 'budget-performance',
      budgets: budgetPerformance,
      timeframe: timeframe,
      periodLabel: `${months[0].label} - ${months[months.length - 1].label}`
    });
  };

  const generateExpenseBreakdownReport = () => {
    if (!expenses || !categories) {
      setReportData({
        type: 'expense-breakdown',
        expenses: [],
        timeframe: timeframe
      });
      return;
    }

    const months = getTimeframeMonths();
    const startDate = months[0].start;
    const endDate = months[months.length - 1].end;

    // Filter expenses within the selected timeframe
    const filteredExpenses = expenses.filter(expense => {
      const date = new Date(expense.date);
      return date >= startDate && date <= endDate && expense.type === 'expense';
    });

    // Sort expenses by date (newest first)
    filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Enrich expenses with category information
    const enrichedExpenses = filteredExpenses.map(expense => {
      const category = categories.find(c => c.id === expense.categoryId) || { name: 'Uncategorized', color: '#6b7280' };
      const budget = budgets && budgets.find(b => b.id === expense.budgetId);

      return {
        ...expense,
        categoryName: category.name,
        categoryColor: category.color,
        budgetName: budget ? budget.name : 'Unbudgeted',
        formattedDate: new Date(expense.date).toLocaleDateString()
      };
    });

    // Calculate summary statistics
    const totalAmount = enrichedExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    const averageAmount = enrichedExpenses.length > 0 ? totalAmount / enrichedExpenses.length : 0;
    const maxAmount = enrichedExpenses.length > 0 ? Math.max(...enrichedExpenses.map(e => Number(e.amount))) : 0;
    const minAmount = enrichedExpenses.length > 0 ? Math.min(...enrichedExpenses.map(e => Number(e.amount))) : 0;

    setReportData({
      type: 'expense-breakdown',
      expenses: enrichedExpenses,
      summary: {
        total: totalAmount,
        average: averageAmount,
        max: maxAmount,
        min: minAmount,
        count: enrichedExpenses.length
      },
      timeframe: timeframe,
      periodLabel: `${months[0].label} - ${months[months.length - 1].label}`
    });
  };

  const renderExpenseBreakdownReport = () => {
    if (!reportData || reportData.type !== 'expense-breakdown') return null;

    const { expenses, summary, periodLabel } = reportData;

    if (!expenses || expenses.length === 0) {
      return (
        <div className="p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">No expense data available for the selected period.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-center">Expense Breakdown</h3>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">{periodLabel}</p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Total Expenses</h4>
            <p className="text-lg font-bold text-gray-900 dark:text-white">${summary.total.toFixed(2)}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Average Expense</h4>
            <p className="text-lg font-bold text-gray-900 dark:text-white">${summary.average.toFixed(2)}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Largest Expense</h4>
            <p className="text-lg font-bold text-gray-900 dark:text-white">${summary.max.toFixed(2)}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Transaction Count</h4>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{summary.count}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">Expense Transactions</h4>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Budget</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{expense.formattedDate}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{expense.description}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: expense.categoryColor || '#3b82f6' }}
                        ></div>
                        <span className="text-gray-900 dark:text-white">{expense.categoryName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{expense.budgetName}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-red-600">${Number(expense.amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderBudgetPerformanceReport = () => {
    if (!reportData || reportData.type !== 'budget-performance') return null;

    const { budgets, periodLabel } = reportData;

    if (!budgets || budgets.length === 0) {
      return (
        <div className="p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">No budget data available for the selected period.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-center">Budget Performance</h3>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">{periodLabel}</p>

        <div className="grid grid-cols-1 gap-6">
          {budgets.map(budget => (
            <div key={budget.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">{budget.name}</h4>
                <div className="mt-2 flex justify-between">
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Budget: </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">${budget.amount.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Spent: </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">${budget.spent.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Remaining: </span>
                    <span className={`text-sm font-medium ${budget.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${budget.remaining.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="mb-2 flex justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {budget.percentage.toFixed(1)}% used
                  </span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    ${budget.spent.toFixed(2)} of ${budget.amount.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${budget.percentage > 100 ? 'bg-red-600' : budget.percentage > 75 ? 'bg-yellow-500' : 'bg-green-600'}`}
                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                  ></div>
                </div>

                {budget.categoryBreakdown.length > 0 && (
                  <div className="mt-6">
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Spending by Category</h5>
                    <div className="space-y-3">
                      {budget.categoryBreakdown.map(category => (
                        <div key={category.id} className="space-y-1">
                          <div className="flex justify-between">
                            <div className="flex items-center">
                              <div
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: category.color || '#3b82f6' }}
                              ></div>
                              <span className="text-sm text-gray-700 dark:text-gray-300">{category.name}</span>
                            </div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              ${category.amount.toFixed(2)} ({category.percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full"
                              style={{
                                width: `${category.percentage}%`,
                                backgroundColor: category.color || '#3b82f6'
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {budget.expenseHistory.length > 0 && (
                  <div className="mt-6">
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Monthly Spending</h5>
                    <div className="relative h-40">
                      <div className="absolute left-0 top-0 w-full h-full">
                        {/* Horizontal grid lines */}
                        {[0, 25, 50, 75, 100].map((percent) => (
                          <div
                            key={percent}
                            className="absolute w-full border-t border-gray-200 dark:border-gray-700"
                            style={{ bottom: `${percent}%` }}
                          ></div>
                        ))}
                      </div>

                      <div className="absolute left-0 bottom-0 w-full h-full flex items-end">
                        {budget.expenseHistory.map((month, index) => {
                          const height = month.percentage;
                          return (
                            <div key={index} className="flex-1 flex flex-col items-center">
                              <div
                                className={`w-6 rounded-t transition-all duration-200 hover:opacity-80 ${height > 100 ? 'bg-red-600' : height > 75 ? 'bg-yellow-500' : 'bg-green-600'}`}
                                style={{
                                  height: `${Math.min(height, 100)}%`,
                                  minHeight: height > 0 ? '4px' : '0'
                                }}
                              ></div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 transform -rotate-45 origin-top-left">
                                {month.month.split(' ')[0]}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderReport = () => {
    if (!reportData) return null;

    switch (reportData.type) {
      case 'income-vs-expenses':
        return renderIncomeVsExpensesReport();
      case 'spending-by-category':
        return renderSpendingByCategoryReport();
      case 'monthly-spending-trend':
        return renderMonthlySpendingTrendReport();
      case 'budget-performance':
        return renderBudgetPerformanceReport();
      case 'expense-breakdown':
        return renderExpenseBreakdownReport();
      default:
        return null;
    }
  };

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
              <option value="budget-performance">Budget Performance</option>
              <option value="expense-breakdown">Expense Breakdown</option>
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
        {expenses && expenses.length > 0 ? (
          renderReport()
        ) : (
          <div className="h-96 flex flex-col items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No data to display</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Add some transactions to see reports.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportsBasic;
