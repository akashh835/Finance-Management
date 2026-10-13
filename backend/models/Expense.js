import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, 'Please add a description'],
    trim: true,
    maxlength: [100, 'Description cannot be more than 100 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Please add an amount'],
    min: [0, 'Amount cannot be negative']
  },
  type: {
    type: String,
    enum: ['expense', 'income', 'transfer'],
    default: 'expense'
  },
  date: {
    type: Date,
    default: Date.now,
    required: [true, 'Please add a date']
  },
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    required: [true, 'Please select a category']
  },
  budget: {
    type: mongoose.Schema.ObjectId,
    ref: 'Budget'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'mobile_payment', 'check', 'other'],
    default: 'cash'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    },
    address: String
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  tags: [String],
  receipt: {
    url: String,
    filename: String,
    mimetype: String,
    size: Number,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringDetails: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly']
    },
    endDate: Date,
    nextOccurrence: Date
  },
  currency: {
    code: {
      type: String,
      default: 'USD'
    },
    exchangeRate: {
      type: Number,
      default: 1
    },
    originalAmount: {
      type: Number
    }
  },
  shared: {
    type: Boolean,
    default: false
  },
  sharedWith: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    amount: {
      type: Number
    },
    settled: {
      type: Boolean,
      default: false
    }
  }],
  bankTransaction: {
    id: String,
    accountId: String,
    merchantName: String,
    pending: Boolean
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

// Create index for faster queries
ExpenseSchema.index({ user: 1, date: -1 });
ExpenseSchema.index({ category: 1, date: -1 });
ExpenseSchema.index({ budget: 1, date: -1 });
ExpenseSchema.index({ type: 1, date: -1 });

// Middleware to update budget when expense is created/updated/deleted
ExpenseSchema.post('save', async function() {
  if (this.budget) {
    await this.model('Budget').findByIdAndUpdate(this.budget, {});
  }
});

ExpenseSchema.pre('remove', async function() {
  if (this.budget) {
    await this.model('Budget').findByIdAndUpdate(this.budget, {});
  }
});

// Static method to get total expenses for a user
ExpenseSchema.statics.getTotalExpenses = async function(userId, startDate, endDate) {
  const query = {
    user: mongoose.Types.ObjectId(userId),
    type: 'expense'
  };

  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const result = await this.aggregate([
    {
      $match: query
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ]);

  return result.length > 0 ? result[0].total : 0;
};

// Static method to get total income for a user
ExpenseSchema.statics.getTotalIncome = async function(userId, startDate, endDate) {
  const query = {
    user: mongoose.Types.ObjectId(userId),
    type: 'income'
  };

  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const result = await this.aggregate([
    {
      $match: query
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ]);

  return result.length > 0 ? result[0].total : 0;
};

// Static method to get expenses by category
ExpenseSchema.statics.getExpensesByCategory = async function(userId, startDate, endDate) {
  const query = {
    user: mongoose.Types.ObjectId(userId),
    type: 'expense'
  };

  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  return await this.aggregate([
    {
      $match: query
    },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' }
      }
    },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'categoryDetails'
      }
    },
    {
      $unwind: '$categoryDetails'
    },
    {
      $project: {
        _id: 1,
        total: 1,
        name: '$categoryDetails.name',
        color: '$categoryDetails.color'
      }
    },
    {
      $sort: { total: -1 }
    }
  ]);
};

export default mongoose.model('Expense', ExpenseSchema);
