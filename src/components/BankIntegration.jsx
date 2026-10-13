import { useState, useEffect } from 'react';
import { useFinance } from '../hooks/useFinance';
import { bankAPI } from '../services/api';

function BankIntegration() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [linkToken, setLinkToken] = useState(null);
  const [isLinkReady, setIsLinkReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState({});
  
  useEffect(() => {
    // Load bank accounts
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        const response = await bankAPI.getAccounts();
        setAccounts(response.data.data);
      } catch (err) {
        setError('Failed to load bank accounts');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAccounts();
    
    // Load Plaid Link script
    const script = document.createElement('script');
    script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
    script.async = true;
    script.onload = () => setIsLinkReady(true);
    document.body.appendChild(script);
    
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);
  
  const handleAddAccount = async () => {
    try {
      // Get a link token from our server
      const response = await bankAPI.createLinkToken();
      setLinkToken(response.data.data.link_token);
      
      // Initialize Plaid Link
      if (window.Plaid && isLinkReady) {
        const handler = window.Plaid.create({
          token: response.data.data.link_token,
          onSuccess: async (publicToken, metadata) => {
            try {
              // Exchange public token for access token
              const exchangeResponse = await bankAPI.exchangeToken({
                publicToken,
                metadata
              });
              
              // Update accounts list
              setAccounts(prev => [...prev, ...exchangeResponse.data.data.accounts]);
            } catch (err) {
              setError('Failed to link account');
              console.error(err);
            }
          },
          onExit: (err, metadata) => {
            if (err) {
              setError('Error linking account');
              console.error(err);
            }
          },
          onEvent: (eventName, metadata) => {
            console.log('Plaid event:', eventName, metadata);
          }
        });
        
        handler.open();
      }
    } catch (err) {
      setError('Failed to initialize account linking');
      console.error(err);
    }
  };
  
  const handleSyncAccount = async (accountId) => {
    try {
      setSyncStatus(prev => ({ ...prev, [accountId]: 'syncing' }));
      const response = await bankAPI.syncTransactions(accountId);
      setSyncStatus(prev => ({ ...prev, [accountId]: 'success' }));
      
      // Show success message
      alert(`Successfully synced ${response.data.data.newTransactions} new transactions`);
    } catch (err) {
      setSyncStatus(prev => ({ ...prev, [accountId]: 'error' }));
      setError(`Failed to sync account: ${err.response?.data?.error || err.message}`);
    }
  };
  
  const handleRemoveAccount = async (accountId) => {
    if (confirm('Are you sure you want to remove this account?')) {
      try {
        await bankAPI.removeAccount(accountId);
        setAccounts(accounts.filter(account => account._id !== accountId));
      } catch (err) {
        setError('Failed to remove account');
        console.error(err);
      }
    }
  };
  
  if (loading) {
    return <div className="card p-6 text-center">Loading bank accounts...</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Linked Bank Accounts</h2>
        <button
          onClick={handleAddAccount}
          className="btn btn-primary"
          disabled={!isLinkReady}
        >
          Link New Account
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError(null)}
          >
            <span className="sr-only">Dismiss</span>
            <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      
      {accounts.length === 0 ? (
        <div className="card p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You haven't linked any bank accounts yet. Link your accounts to automatically import transactions.
          </p>
          <button
            onClick={handleAddAccount}
            className="btn btn-primary"
            disabled={!isLinkReady}
          >
            Link Your First Account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map(account => (
            <div key={account._id} className="card">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{account.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {account.institution.name} • {account.type} • ••••{account.mask}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSyncAccount(account._id)}
                    className={`p-1 rounded-md ${
                      syncStatus[account._id] === 'syncing'
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    disabled={syncStatus[account._id] === 'syncing'}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleRemoveAccount(account._id)}
                    className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-expense"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Current Balance</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: account.currency || 'USD' }).format(account.balance.current)}
                  </span>
                </div>
                
                {account.type === 'credit' && account.balance.limit && (
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Credit Utilization</span>
                    <span className={`font-medium ${
                      (account.balance.current / account.balance.limit) * 100 > 30
                        ? 'text-expense'
                        : 'text-income'
                    }`}>
                      {((account.balance.current / account.balance.limit) * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Last Synced</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {account.lastSync 
                      ? new Date(account.lastSync).toLocaleString()
                      : 'Never'}
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => handleSyncAccount(account._id)}
                className={`mt-4 w-full btn ${
                  syncStatus[account._id] === 'syncing'
                    ? 'btn-disabled'
                    : 'btn-secondary'
                }`}
                disabled={syncStatus[account._id] === 'syncing'}
              >
                {syncStatus[account._id] === 'syncing'
                  ? 'Syncing...'
                  : 'Sync Transactions'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BankIntegration;
