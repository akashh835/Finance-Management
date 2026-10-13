import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import CurrencySelector from './CurrencySelector'

function Navbar() {
  const { user, logout } = useAuth()
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="px-4 py-3 lg:px-6 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Smart Budget Tracker
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <CurrencySelector />

          <div className="relative">
          <button
            type="button"
            className="flex items-center text-sm rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <span className="sr-only">Open user menu</span>
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-2 text-sm text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
                <div className="font-medium">{user?.name || 'User'}</div>
                <div className="text-gray-500 dark:text-gray-400 truncate">{user?.email}</div>
              </div>
              <button
                onClick={logout}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Sign out
              </button>
            </div>
          )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
