import Budget from '../models/Budget.js';
import Category from '../models/Category.js';

/**
 * @desc    Get all budgets for a user
 * @route   GET /api/budgets
 * @access  Private
 */
export const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user.id })
      .populate('category', 'name color')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: budgets.length,
      data: budgets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Get single budget
 * @route   GET /api/budgets/:id
 * @access  Private
 */
export const getBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id)
      .populate('category', 'name color')
      .populate('sharedWith.user', 'name email');

    if (!budget) {
      return res.status(404).json({
        success: false,
        error: 'Budget not found'
      });
    }

    // Make sure user owns the budget or is shared with them
    if (
      budget.user.toString() !== req.user.id &&
      !budget.sharedWith.some(share => share.user._id.toString() === req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this budget'
      });
    }

    // Calculate spent amount
    const spent = await Budget.calculateSpent(budget._id);
    const remaining = budget.amount - spent;
    const progress = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        ...budget.toObject(),
        spent,
        remaining,
        progress
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
 * @desc    Create new budget
 * @route   POST /api/budgets
 * @access  Private
 */
export const createBudget = async (req, res) => {
  try {
    // Add user to request body
    req.body.user = req.user.id;

    // Check if category exists
    if (req.body.category) {
      const category = await Category.findById(req.body.category);
      if (!category) {
        return res.status(404).json({
          success: false,
          error: 'Category not found'
        });
      }
    }

    // Create budget
    const budget = await Budget.create(req.body);

    res.status(201).json({
      success: true,
      data: budget
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Update budget
 * @route   PUT /api/budgets/:id
 * @access  Private
 */
export const updateBudget = async (req, res) => {
  try {
    let budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        error: 'Budget not found'
      });
    }

    // Make sure user owns the budget or has edit permission
    if (
      budget.user.toString() !== req.user.id &&
      !budget.sharedWith.some(share => 
        share.user.toString() === req.user.id && 
        share.permission === 'edit'
      )
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this budget'
      });
    }

    // Check if category exists if it's being updated
    if (req.body.category) {
      const category = await Category.findById(req.body.category);
      if (!category) {
        return res.status(404).json({
          success: false,
          error: 'Category not found'
        });
      }
    }

    // Update budget
    budget = await Budget.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: budget
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Delete budget
 * @route   DELETE /api/budgets/:id
 * @access  Private
 */
export const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        error: 'Budget not found'
      });
    }

    // Make sure user owns the budget
    if (budget.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this budget'
      });
    }

    await budget.remove();

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

/**
 * @desc    Share budget with another user
 * @route   POST /api/budgets/:id/share
 * @access  Private
 */
export const shareBudget = async (req, res) => {
  try {
    const { email, permission } = req.body;

    if (!email || !permission) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and permission'
      });
    }

    // Find budget
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        error: 'Budget not found'
      });
    }

    // Make sure user owns the budget
    if (budget.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to share this budget'
      });
    }

    // Find user to share with
    const userToShare = await User.findOne({ email });

    if (!userToShare) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if already shared
    if (budget.sharedWith.some(share => share.user.toString() === userToShare._id.toString())) {
      return res.status(400).json({
        success: false,
        error: 'Budget already shared with this user'
      });
    }

    // Add user to sharedWith array
    budget.shared = true;
    budget.sharedWith.push({
      user: userToShare._id,
      permission
    });

    await budget.save();

    res.status(200).json({
      success: true,
      data: budget
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Remove share from budget
 * @route   DELETE /api/budgets/:id/share/:userId
 * @access  Private
 */
export const removeShare = async (req, res) => {
  try {
    // Find budget
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        error: 'Budget not found'
      });
    }

    // Make sure user owns the budget
    if (budget.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to modify sharing for this budget'
      });
    }

    // Remove user from sharedWith array
    budget.sharedWith = budget.sharedWith.filter(
      share => share.user.toString() !== req.params.userId
    );

    // If no more shares, set shared to false
    if (budget.sharedWith.length === 0) {
      budget.shared = false;
    }

    await budget.save();

    res.status(200).json({
      success: true,
      data: budget
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
