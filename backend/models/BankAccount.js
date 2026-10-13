import mongoose from 'mongoose';

const BankAccountSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add an account name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  type: {
    type: String,
    enum: ['checking', 'savings', 'credit', 'investment', 'loan', 'mortgage', 'other'],
    required: [true, 'Please specify account type']
  },
  institution: {
    name: {
      type: String,
      required: [true, 'Please add institution name']
    },
    logo: String
  },
  accountNumber: {
    type: String,
    select: false // Not returned in queries by default
  },
  mask: {
    type: String,
    description: 'Last 4 digits of account number'
  },
  balance: {
    current: {
      type: Number,
      default: 0
    },
    available: {
      type: Number,
      default: 0
    },
    limit: {
      type: Number,
      description: 'Credit limit for credit accounts'
    }
  },
  currency: {
    type: String,
    default: 'USD'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  includeInNetWorth: {
    type: Boolean,
    default: true
  },
  plaidItemId: {
    type: String,
    select: false
  },
  plaidAccountId: {
    type: String,
    select: false
  },
  accessToken: {
    type: String,
    select: false
  },
  lastSync: {
    type: Date
  },
  syncStatus: {
    type: String,
    enum: ['success', 'error', 'pending', 'none'],
    default: 'none'
  },
  syncError: {
    message: String,
    code: String,
    timestamp: Date
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for transactions associated with this account
BankAccountSchema.virtual('transactions', {
  ref: 'Expense',
  localField: '_id',
  foreignField: 'bankTransaction.accountId',
  justOne: false
});

// Calculate utilization for credit accounts
BankAccountSchema.virtual('utilization').get(function() {
  if (this.type !== 'credit' || !this.balance.limit || this.balance.limit === 0) {
    return null;
  }
  return (this.balance.current / this.balance.limit) * 100;
});

// Static method to calculate net worth for a user
BankAccountSchema.statics.calculateNetWorth = async function(userId) {
  const accounts = await this.find({
    user: userId,
    includeInNetWorth: true,
    isActive: true
  });

  let netWorth = 0;
  
  accounts.forEach(account => {
    if (['checking', 'savings', 'investment'].includes(account.type)) {
      netWorth += account.balance.current;
    } else if (['loan', 'mortgage', 'credit'].includes(account.type)) {
      netWorth -= account.balance.current;
    }
  });

  return netWorth;
};

export default mongoose.model('BankAccount', BankAccountSchema);
