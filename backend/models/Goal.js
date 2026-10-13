import mongoose from 'mongoose';

const GoalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a goal name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  type: {
    type: String,
    enum: ['savings', 'debt_repayment', 'purchase', 'emergency_fund', 'retirement', 'education', 'travel', 'other'],
    default: 'savings'
  },
  targetAmount: {
    type: Number,
    required: [true, 'Please add a target amount'],
    min: [0, 'Target amount cannot be negative']
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: [0, 'Current amount cannot be negative']
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  targetDate: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  icon: {
    type: String
  },
  color: {
    type: String,
    default: '#f59e0b'
  },
  autoContribute: {
    enabled: {
      type: Boolean,
      default: false
    },
    amount: {
      type: Number,
      min: [0, 'Auto-contribute amount cannot be negative']
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'biweekly', 'monthly']
    },
    nextContribution: Date
  },
  milestones: [{
    name: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    reached: {
      type: Boolean,
      default: false
    },
    reachedDate: Date
  }],
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
      enum: ['view', 'contribute', 'edit'],
      default: 'view'
    }
  }],
  contributions: [{
    amount: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    notes: String,
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  }],
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

// Calculate progress percentage
GoalSchema.virtual('progressPercentage').get(function() {
  if (this.targetAmount === 0) return 0;
  return Math.min(100, (this.currentAmount / this.targetAmount) * 100);
});

// Calculate remaining amount
GoalSchema.virtual('remainingAmount').get(function() {
  return Math.max(0, this.targetAmount - this.currentAmount);
});

// Calculate days remaining until target date
GoalSchema.virtual('daysRemaining').get(function() {
  if (!this.targetDate) return null;
  const today = new Date();
  const targetDate = new Date(this.targetDate);
  const diffTime = targetDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Calculate daily savings needed to reach goal
GoalSchema.virtual('dailySavingsNeeded').get(function() {
  if (!this.targetDate) return null;
  const daysRemaining = this.daysRemaining;
  if (daysRemaining <= 0) return 0;
  return this.remainingAmount / daysRemaining;
});

// Method to add a contribution
GoalSchema.methods.addContribution = async function(amount, userId, notes = '') {
  this.currentAmount += amount;
  
  this.contributions.push({
    amount,
    date: Date.now(),
    notes,
    user: userId
  });

  // Check if any milestones have been reached
  if (this.milestones && this.milestones.length > 0) {
    this.milestones.forEach(milestone => {
      if (!milestone.reached && this.currentAmount >= milestone.amount) {
        milestone.reached = true;
        milestone.reachedDate = Date.now();
      }
    });
  }

  return this.save();
};

export default mongoose.model('Goal', GoalSchema);
