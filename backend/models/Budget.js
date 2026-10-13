import mongoose from 'mongoose';

const BudgetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a budget name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Please add a budget amount'],
    min: [0, 'Budget amount cannot be negative']
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'],
    default: 'monthly'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    required: [true, 'Please select a category']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  isRecurring: {
    type: Boolean,
    default: true
  },
  rollover: {
    type: Boolean,
    default: false,
    description: 'Whether unused budget rolls over to next period'
  },
  rolloverAmount: {
    type: Number,
    default: 0
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
    permission: {
      type: String,
      enum: ['view', 'edit'],
      default: 'view'
    }
  }],
  alerts: {
    enabled: {
      type: Boolean,
      default: true
    },
    threshold: {
      type: Number,
      default: 80,
      description: 'Percentage threshold for budget alerts'
    }
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

// Virtual for expenses associated with this budget
BudgetSchema.virtual('expenses', {
  ref: 'Expense',
  localField: '_id',
  foreignField: 'budget',
  justOne: false
});

// Static method to calculate spent amount
BudgetSchema.statics.calculateSpent = async function(budgetId) {
  const result = await this.model('Expense').aggregate([
    {
      $match: {
        budget: mongoose.Types.ObjectId(budgetId),
        type: 'expense'
      }
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

// Method to check if budget is over limit
BudgetSchema.methods.isOverBudget = async function() {
  const spent = await this.model('Budget').calculateSpent(this._id);
  return spent > this.amount;
};

// Method to calculate remaining budget
BudgetSchema.methods.calculateRemaining = async function() {
  const spent = await this.model('Budget').calculateSpent(this._id);
  return this.amount - spent;
};

export default mongoose.model('Budget', BudgetSchema);
