function StatCard({ title, value, icon, color = 'primary', change, changeType }) {
  const colorClasses = {
    primary: 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300',
    secondary: 'bg-secondary-100 text-secondary-600 dark:bg-secondary-900 dark:text-secondary-300',
    expense: 'bg-red-100 text-expense dark:bg-red-900 dark:text-red-300',
    income: 'bg-green-100 text-income dark:bg-green-900 dark:text-green-300',
    savings: 'bg-yellow-100 text-savings dark:bg-yellow-900 dark:text-yellow-300',
  }
  
  const changeClasses = {
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-600 dark:text-gray-400',
  }
  
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</h3>
          
          {change && (
            <p className={`text-sm mt-2 ${changeClasses[changeType]}`}>
              {changeType === 'positive' && '↑ '}
              {changeType === 'negative' && '↓ '}
              {change}
            </p>
          )}
        </div>
        
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

export default StatCard
