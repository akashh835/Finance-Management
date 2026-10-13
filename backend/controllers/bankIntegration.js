import BankAccount from '../models/BankAccount.js';
import Expense from '../models/Expense.js';
import Category from '../models/Category.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// This is a placeholder for Plaid API integration
// In a real implementation, you would use the Plaid Node.js client
const plaidClient = {
  createLinkToken: async (userId) => {
    // In a real implementation, this would call Plaid API
    return {
      link_token: `link-sandbox-${userId}-${Date.now()}`
    };
  },
  exchangePublicToken: async (publicToken) => {
    // In a real implementation, this would call Plaid API
    return {
      access_token: `access-sandbox-${Date.now()}`,
      item_id: `item-sandbox-${Date.now()}`
    };
  },
  getAccounts: async (accessToken) => {
    // In a real implementation, this would call Plaid API
    return {
      accounts: [
        {
          account_id: `account-${Date.now()}-1`,
          name: 'Checking Account',
          mask: '1234',
          type: 'depository',
          subtype: 'checking',
          balances: {
            current: 1000,
            available: 900,
            limit: null
          }
        },
        {
          account_id: `account-${Date.now()}-2`,
          name: 'Savings Account',
          mask: '5678',
          type: 'depository',
          subtype: 'savings',
          balances: {
            current: 5000,
            available: 5000,
            limit: null
          }
        },
        {
          account_id: `account-${Date.now()}-3`,
          name: 'Credit Card',
          mask: '9012',
          type: 'credit',
          subtype: 'credit card',
          balances: {
            current: 2000,
            available: 3000,
            limit: 5000
          }
        }
      ]
    };
  },
  getTransactions: async (accessToken, startDate, endDate) => {
    // In a real implementation, this would call Plaid API
    return {
      transactions: [
        {
          transaction_id: `tx-${Date.now()}-1`,
          account_id: `account-${Date.now()}-1`,
          amount: 50,
          date: new Date().toISOString().split('T')[0],
          name: 'Grocery Store',
          pending: false,
          category: ['Food and Drink', 'Groceries']
        },
        {
          transaction_id: `tx-${Date.now()}-2`,
          account_id: `account-${Date.now()}-1`,
          amount: 20,
          date: new Date().toISOString().split('T')[0],
          name: 'Restaurant',
          pending: false,
          category: ['Food and Drink', 'Restaurants']
        },
        {
          transaction_id: `tx-${Date.now()}-3`,
          account_id: `account-${Date.now()}-3`,
          amount: 100,
          date: new Date().toISOString().split('T')[0],
          name: 'Online Shopping',
          pending: false,
          category: ['Shops', 'Online Marketplaces']
        }
      ]
    };
  }
};

/**
 * @desc    Create a link token for Plaid Link
 * @route   POST /api/bank/create-link-token
 * @access  Private
 */
export const createLinkToken = async (req, res) => {
  try {
    const linkToken = await plaidClient.createLinkToken(req.user.id);
    
    res.status(200).json({
      success: true,
      data: linkToken
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Exchange public token for access token
 * @route   POST /api/bank/exchange-token
 * @access  Private
 */
export const exchangeToken = async (req, res) => {
  try {
    const { publicToken, metadata } = req.body;
    
    // Exchange public token for access token
    const tokenResponse = await plaidClient.exchangePublicToken(publicToken);
    
    // Get accounts from Plaid
    const accountsResponse = await plaidClient.getAccounts(tokenResponse.access_token);
    
    // Create bank accounts in our database
    const createdAccounts = [];
    
    for (const account of accountsResponse.accounts) {
      // Map Plaid account type to our account type
      let accountType;
      switch (account.type) {
        case 'depository':
          accountType = account.subtype === 'checking' ? 'checking' : 'savings';
          break;
        case 'credit':
          accountType = 'credit';
          break;
        case 'loan':
          accountType = account.subtype === 'mortgage' ? 'mortgage' : 'loan';
          break;
        case 'investment':
          accountType = 'investment';
          break;
        default:
          accountType = 'other';
      }
      
      // Create account in our database
      const bankAccount = await BankAccount.create({
        name: account.name,
        type: accountType,
        institution: {
          name: metadata.institution.name,
          logo: metadata.institution.logo
        },
        mask: account.mask,
        balance: {
          current: account.balances.current,
          available: account.balances.available,
          limit: account.balances.limit
        },
        plaidItemId: tokenResponse.item_id,
        plaidAccountId: account.account_id,
        accessToken: tokenResponse.access_token,
        lastSync: new Date(),
        syncStatus: 'success',
        user: req.user.id
      });
      
      createdAccounts.push({
        id: bankAccount._id,
        name: bankAccount.name,
        type: bankAccount.type,
        mask: bankAccount.mask,
        balance: bankAccount.balance
      });
    }
    
    res.status(201).json({
      success: true,
      data: {
        accounts: createdAccounts
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Get all bank accounts for a user
 * @route   GET /api/bank/accounts
 * @access  Private
 */
export const getBankAccounts = async (req, res) => {
  try {
    const accounts = await BankAccount.find({ user: req.user.id });
    
    res.status(200).json({
      success: true,
      count: accounts.length,
      data: accounts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Get single bank account
 * @route   GET /api/bank/accounts/:id
 * @access  Private
 */
export const getBankAccount = async (req, res) => {
  try {
    const account = await BankAccount.findById(req.params.id);
    
    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Account not found'
      });
    }
    
    // Make sure user owns the account
    if (account.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this account'
      });
    }
    
    res.status(200).json({
      success: true,
      data: account
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Update bank account
 * @route   PUT /api/bank/accounts/:id
 * @access  Private
 */
export const updateBankAccount = async (req, res) => {
  try {
    let account = await BankAccount.findById(req.params.id);
    
    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Account not found'
      });
    }
    
    // Make sure user owns the account
    if (account.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this account'
      });
    }
    
    // Only allow updating certain fields
    const allowedUpdates = {
      name: req.body.name,
      includeInNetWorth: req.body.includeInNetWorth,
      isActive: req.body.isActive
    };
    
    // Filter out undefined values
    const updates = Object.entries(allowedUpdates)
      .filter(([_, value]) => value !== undefined)
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});
    
    // Update account
    account = await BankAccount.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: account
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Sync transactions for an account
 * @route   POST /api/bank/accounts/:id/sync
 * @access  Private
 */
export const syncTransactions = async (req, res) => {
  try {
    const account = await BankAccount.findById(req.params.id).select('+accessToken');
    
    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Account not found'
      });
    }
    
    // Make sure user owns the account
    if (account.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to sync this account'
      });
    }
    
    // Update sync status
    account.syncStatus = 'pending';
    await account.save();
    
    try {
      // Get transactions from Plaid
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      const endDate = new Date();
      
      const transactionsResponse = await plaidClient.getTransactions(
        account.accessToken,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
      
      // Process transactions
      const newTransactions = [];
      
      for (const transaction of transactionsResponse.transactions) {
        // Skip if transaction already exists
        const existingTransaction = await Expense.findOne({
          'bankTransaction.id': transaction.transaction_id
        });
        
        if (existingTransaction) {
          continue;
        }
        
        // Find or create category
        let category;
        if (transaction.category && transaction.category.length > 0) {
          // Try to find matching category
          const categoryName = transaction.category[0];
          category = await Category.findOne({
            $or: [
              { name: categoryName },
              { name: { $regex: new RegExp(categoryName, 'i') } }
            ]
          });
          
          // If no category found, use "Other"
          if (!category) {
            category = await Category.findOne({ name: 'Other Expenses' });
          }
        } else {
          // Default to "Other" category
          category = await Category.findOne({ name: 'Other Expenses' });
        }
        
        // Create expense
        const expense = await Expense.create({
          description: transaction.name,
          amount: Math.abs(transaction.amount),
          type: transaction.amount > 0 ? 'income' : 'expense',
          date: new Date(transaction.date),
          category: category._id,
          paymentMethod: account.type === 'credit' ? 'credit_card' : 'bank_transfer',
          bankTransaction: {
            id: transaction.transaction_id,
            accountId: account._id,
            merchantName: transaction.name,
            pending: transaction.pending
          },
          user: req.user.id
        });
        
        newTransactions.push(expense);
      }
      
      // Update account with successful sync
      account.lastSync = new Date();
      account.syncStatus = 'success';
      account.syncError = undefined;
      await account.save();
      
      res.status(200).json({
        success: true,
        data: {
          newTransactions: newTransactions.length,
          lastSync: account.lastSync
        }
      });
    } catch (error) {
      // Update account with sync error
      account.syncStatus = 'error';
      account.syncError = {
        message: error.message,
        code: error.code,
        timestamp: new Date()
      };
      await account.save();
      
      throw error;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Remove bank account
 * @route   DELETE /api/bank/accounts/:id
 * @access  Private
 */
export const removeBankAccount = async (req, res) => {
  try {
    const account = await BankAccount.findById(req.params.id);
    
    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Account not found'
      });
    }
    
    // Make sure user owns the account
    if (account.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to remove this account'
      });
    }
    
    // Instead of deleting, mark as inactive
    account.isActive = false;
    await account.save();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
