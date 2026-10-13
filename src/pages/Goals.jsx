import { useState } from 'react'
import { useFinance } from '../hooks/useFinance'
import GoalCard from '../components/GoalCard'
import { formatDate } from '../utils/dateUtils'

function Goals() {
  const { goals, addGoal, updateGoal, deleteGoal, contributeToGoal } = useFinance()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [contributingGoal, setContributingGoal] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    targetDate: '',
    description: '',
  })
  const [contributionAmount, setContributionAmount] = useState('')

  const handleOpenModal = (goal = null) => {
    if (goal) {
      setEditingGoal(goal)
      setFormData({
        name: goal.name,
        targetAmount: goal.targetAmount,
        targetDate: goal.targetDate ? format(new Date(goal.targetDate), 'yyyy-MM-dd') : '',
        description: goal.description || '',
      })
    } else {
      setEditingGoal(null)
      setFormData({
        name: '',
        targetAmount: '',
        targetDate: '',
        description: '',
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingGoal(null)
  }

  const handleOpenContributeModal = (goal) => {
    setContributingGoal(goal)
    setContributionAmount('')
    setIsContributeModalOpen(true)
  }

  const handleCloseContributeModal = () => {
    setIsContributeModalOpen(false)
    setContributingGoal(null)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const goalData = {
      ...formData,
      targetAmount: Number(formData.targetAmount),
      targetDate: formData.targetDate ? new Date(formData.targetDate).toISOString() : null,
    }

    if (editingGoal) {
      updateGoal(editingGoal.id, goalData)
    } else {
      addGoal(goalData)
    }

    handleCloseModal()
  }

  const handleContributeSubmit = (e) => {
    e.preventDefault()

    if (contributingGoal && contributionAmount) {
      contributeToGoal(contributingGoal.id, Number(contributionAmount))
      handleCloseContributeModal()
    }
  }

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this savings goal?')) {
      deleteGoal(id)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Savings Goals</h1>
        <button
          onClick={() => handleOpenModal()}
          className="btn btn-primary flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Goal
        </button>
      </div>

      {goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={handleOpenModal}
              onDelete={handleDelete}
              onContribute={handleOpenContributeModal}
            />
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No savings goals yet</h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Create your first savings goal to start tracking your progress.</p>
          <button
            onClick={() => handleOpenModal()}
            className="mt-4 btn btn-primary"
          >
            Create Goal
          </button>
        </div>
      )}

      {/* Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {editingGoal ? 'Edit Savings Goal' : 'Create Savings Goal'}
              </h3>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Goal Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="input"
                      placeholder="e.g., Vacation, Emergency Fund, etc."
                    />
                  </div>

                  <div>
                    <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Target Amount
                    </label>
                    <input
                      type="number"
                      id="targetAmount"
                      name="targetAmount"
                      value={formData.targetAmount}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      className="input"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Target Date (Optional)
                    </label>
                    <input
                      type="date"
                      id="targetDate"
                      name="targetDate"
                      value={formData.targetDate}
                      onChange={handleChange}
                      className="input"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description (Optional)
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="input"
                      rows="3"
                      placeholder="Add notes about this goal..."
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
                    {editingGoal ? 'Update Goal' : 'Create Goal'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Contribute Modal */}
      {isContributeModalOpen && contributingGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Add Contribution to {contributingGoal.name}
              </h3>

              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Current progress: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(contributingGoal.currentAmount)}
                  {' of '}
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(contributingGoal.targetAmount)}
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
                  <div
                    className="bg-savings h-2.5 rounded-full"
                    style={{ width: `${Math.min((contributingGoal.currentAmount / contributingGoal.targetAmount) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              <form onSubmit={handleContributeSubmit}>
                <div>
                  <label htmlFor="contributionAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contribution Amount
                  </label>
                  <input
                    type="number"
                    id="contributionAmount"
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(e.target.value)}
                    required
                    min="0.01"
                    step="0.01"
                    className="input"
                    placeholder="0.00"
                  />
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseContributeModal}
                    className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-secondary"
                  >
                    Add Contribution
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

export default Goals
