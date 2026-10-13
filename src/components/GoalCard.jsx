import { useCurrency } from '../hooks/useCurrency'
import { formatDate } from '../utils/dateUtils'

function GoalCard({ goal, onEdit, onDelete, onContribute }) {
  const { formatAmount } = useCurrency()
  const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0
  const remaining = goal.targetAmount - goal.currentAmount

  return (
    <div className="card">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{goal.name}</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(goal)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(goal.id)}
            className="text-gray-500 hover:text-expense dark:text-gray-400 dark:hover:text-red-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600 dark:text-gray-400">
            {formatAmount(goal.currentAmount, goal.currency || 'USD')}
            {' of '}
            {formatAmount(goal.targetAmount, goal.currency || 'USD')}
          </span>
          <span className="text-gray-600 dark:text-gray-400">
            {progress.toFixed(0)}%
          </span>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div
            className="bg-savings h-2.5 rounded-full"
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p>Target date: {goal.targetDate ? formatDate(goal.targetDate) : 'No target date'}</p>
        <p>Remaining: {formatAmount(remaining, goal.currency || 'USD')}</p>
      </div>

      <button
        onClick={() => onContribute(goal)}
        className="mt-4 w-full btn btn-secondary"
      >
        Add Contribution
      </button>
    </div>
  )
}

export default GoalCard
