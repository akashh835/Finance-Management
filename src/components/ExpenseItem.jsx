import { useFinance } from '../hooks/useFinance'
import { useCurrency } from '../hooks/useCurrency'
import { formatDate } from '../utils/dateUtils'

function ExpenseItem({ expense, onEdit, onDelete }) {
  const { categories } = useFinance()
  const { formatAmount } = useCurrency()

  // Debug the expense object
  console.log('Expense in ExpenseItem:', expense);

  // Find the category for this expense
  const category = categories.find(cat => cat.id === expense.categoryId) || { name: 'Uncategorized', color: '#6b7280' }

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
      <div className="flex items-center">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center mr-4"
          style={{ backgroundColor: category.color + '20', color: category.color }}
        >
          {expense.type === 'income' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">{expense.description}</h4>
          <div className="flex space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <span>{category.name}</span>
            <span>•</span>
            <span>
              {formatDate(expense.date)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center">
        <span className={`mr-4 font-medium ${expense.type === 'income' ? 'text-income' : 'text-expense'}`}>
          {expense.type === 'income' ? '+' : '-'}
          {formatAmount(expense.amount, expense.currency || 'USD')}
        </span>

        <div className="flex space-x-1">
          <button
            onClick={() => onEdit(expense)}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(expense.id)}
            className="p-1 text-gray-500 hover:text-expense dark:text-gray-400 dark:hover:text-red-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExpenseItem
