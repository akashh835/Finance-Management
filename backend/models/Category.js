import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a category name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  type: {
    type: String,
    enum: ['expense', 'income', 'both'],
    default: 'expense'
  },
  color: {
    type: String,
    default: '#6b7280'
  },
  icon: {
    type: String
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot be more than 200 characters']
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isSystem: {
    type: Boolean,
    default: false,
    description: 'System categories cannot be modified by users'
  },
  parent: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    description: 'Parent category for hierarchical categorization'
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    description: 'User who created this category, null for system categories'
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

// Virtual for subcategories
CategorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent',
  justOne: false
});

// Virtual for expenses in this category
CategorySchema.virtual('expenses', {
  ref: 'Expense',
  localField: '_id',
  foreignField: 'category',
  justOne: false
});

// Virtual for budgets in this category
CategorySchema.virtual('budgets', {
  ref: 'Budget',
  localField: '_id',
  foreignField: 'category',
  justOne: false
});

// Static method to get default categories
CategorySchema.statics.getDefaultCategories = function() {
  return [
    { name: 'Housing', type: 'expense', color: '#4b5563', isDefault: true, isSystem: true },
    { name: 'Transportation', type: 'expense', color: '#ef4444', isDefault: true, isSystem: true },
    { name: 'Food', type: 'expense', color: '#f59e0b', isDefault: true, isSystem: true },
    { name: 'Utilities', type: 'expense', color: '#3b82f6', isDefault: true, isSystem: true },
    { name: 'Entertainment', type: 'expense', color: '#8b5cf6', isDefault: true, isSystem: true },
    { name: 'Healthcare', type: 'expense', color: '#ec4899', isDefault: true, isSystem: true },
    { name: 'Personal', type: 'expense', color: '#10b981', isDefault: true, isSystem: true },
    { name: 'Education', type: 'expense', color: '#6366f1', isDefault: true, isSystem: true },
    { name: 'Savings', type: 'expense', color: '#14b8a6', isDefault: true, isSystem: true },
    { name: 'Debt', type: 'expense', color: '#dc2626', isDefault: true, isSystem: true },
    { name: 'Gifts & Donations', type: 'expense', color: '#d946ef', isDefault: true, isSystem: true },
    { name: 'Taxes', type: 'expense', color: '#64748b', isDefault: true, isSystem: true },
    { name: 'Other Expenses', type: 'expense', color: '#6b7280', isDefault: true, isSystem: true },
    { name: 'Salary', type: 'income', color: '#22c55e', isDefault: true, isSystem: true },
    { name: 'Business', type: 'income', color: '#0ea5e9', isDefault: true, isSystem: true },
    { name: 'Investments', type: 'income', color: '#eab308', isDefault: true, isSystem: true },
    { name: 'Gifts', type: 'income', color: '#d946ef', isDefault: true, isSystem: true },
    { name: 'Other Income', type: 'income', color: '#6b7280', isDefault: true, isSystem: true }
  ];
};

export default mongoose.model('Category', CategorySchema);
