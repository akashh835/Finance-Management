import Expense from '../models/Expense.js';
import Budget from '../models/Budget.js';
import Category from '../models/Category.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Set up multer storage for receipts
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = './public/uploads/receipts';
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    cb(null, `receipt-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Check file type
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|pdf/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Error: Only JPEG, JPG, PNG, and PDF files are allowed'));
};

// Initialize upload
export const upload = multer({
  storage,
  limits: { fileSize: 5000000 }, // 5MB
  fileFilter
}).single('receipt');

/**
 * @desc    Get all expenses for a user
 * @route   GET /api/expenses
 * @access  Private
 */
export const getExpenses = async (req, res) => {
  try {
    // Build query
    const queryObj = { user: req.user.id };
    
    // Filter by type
    if (req.query.type) {
      queryObj.type = req.query.type;
    }
    
    // Filter by category
    if (req.query.category) {
      queryObj.category = req.query.category;
    }
    
    // Filter by budget
    if (req.query.budget) {
      queryObj.budget = req.query.budget;
    }
    
    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
      queryObj.date = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    } else if (req.query.startDate) {
      queryObj.date = { $gte: new Date(req.query.startDate) };
    } else if (req.query.endDate) {
      queryObj.date = { $lte: new Date(req.query.endDate) };
    }
    
    // Search by description or notes
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      queryObj.$or = [
        { description: searchRegex },
        { notes: searchRegex }
      ];
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Expense.countDocuments(queryObj);
    
    // Execute query
    const expenses = await Expense.find(queryObj)
      .populate('category', 'name color')
      .populate('budget', 'name')
      .sort({ date: -1 })
      .skip(startIndex)
      .limit(limit);
    
    // Pagination result
    const pagination = {};
    
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }
    
    res.status(200).json({
      success: true,
      count: expenses.length,
      pagination,
      total,
      data: expenses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Get single expense
 * @route   GET /api/expenses/:id
 * @access  Private
 */
export const getExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('category', 'name color')
      .populate('budget', 'name')
      .populate('sharedWith.user', 'name email');
    
    if (!expense) {
      return res.status(404).json({
        success: false,
        error: 'Expense not found'
      });
    }
    
    // Make sure user owns the expense or is shared with them
    if (
      expense.user.toString() !== req.user.id &&
      !expense.sharedWith.some(share => share.user._id.toString() === req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this expense'
      });
    }
    
    res.status(200).json({
      success: true,
      data: expense
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Create new expense
 * @route   POST /api/expenses
 * @access  Private
 */
export const createExpense = async (req, res) => {
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
    
    // Check if budget exists
    if (req.body.budget) {
      const budget = await Budget.findById(req.body.budget);
      if (!budget) {
        return res.status(404).json({
          success: false,
          error: 'Budget not found'
        });
      }
      
      // Check if user owns the budget or has permission
      if (
        budget.user.toString() !== req.user.id &&
        !budget.sharedWith.some(share => share.user.toString() === req.user.id)
      ) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to use this budget'
        });
      }
    }
    
    // Handle receipt if uploaded
    if (req.file) {
      req.body.receipt = {
        url: `/uploads/receipts/${req.file.filename}`,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size
      };
    }
    
    // Create expense
    const expense = await Expense.create(req.body);
    
    // Populate references for response
    const populatedExpense = await Expense.findById(expense._id)
      .populate('category', 'name color')
      .populate('budget', 'name');
    
    res.status(201).json({
      success: true,
      data: populatedExpense
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Update expense
 * @route   PUT /api/expenses/:id
 * @access  Private
 */
export const updateExpense = async (req, res) => {
  try {
    let expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      return res.status(404).json({
        success: false,
        error: 'Expense not found'
      });
    }
    
    // Make sure user owns the expense
    if (expense.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this expense'
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
    
    // Check if budget exists if it's being updated
    if (req.body.budget) {
      const budget = await Budget.findById(req.body.budget);
      if (!budget) {
        return res.status(404).json({
          success: false,
          error: 'Budget not found'
        });
      }
      
      // Check if user owns the budget or has permission
      if (
        budget.user.toString() !== req.user.id &&
        !budget.sharedWith.some(share => share.user.toString() === req.user.id)
      ) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to use this budget'
        });
      }
    }
    
    // Handle receipt if uploaded
    if (req.file) {
      // Delete old receipt if exists
      if (expense.receipt && expense.receipt.filename) {
        const oldReceiptPath = path.join('./public/uploads/receipts', expense.receipt.filename);
        if (fs.existsSync(oldReceiptPath)) {
          fs.unlinkSync(oldReceiptPath);
        }
      }
      
      req.body.receipt = {
        url: `/uploads/receipts/${req.file.filename}`,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size
      };
    }
    
    // Update expense
    expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('category', 'name color')
      .populate('budget', 'name');
    
    res.status(200).json({
      success: true,
      data: expense
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Delete expense
 * @route   DELETE /api/expenses/:id
 * @access  Private
 */
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      return res.status(404).json({
        success: false,
        error: 'Expense not found'
      });
    }
    
    // Make sure user owns the expense
    if (expense.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this expense'
      });
    }
    
    // Delete receipt if exists
    if (expense.receipt && expense.receipt.filename) {
      const receiptPath = path.join('./public/uploads/receipts', expense.receipt.filename);
      if (fs.existsSync(receiptPath)) {
        fs.unlinkSync(receiptPath);
      }
    }
    
    await expense.remove();
    
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
 * @desc    Upload receipt for expense
 * @route   POST /api/expenses/:id/receipt
 * @access  Private
 */
export const uploadReceipt = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      return res.status(404).json({
        success: false,
        error: 'Expense not found'
      });
    }
    
    // Make sure user owns the expense
    if (expense.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this expense'
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please upload a file'
      });
    }
    
    // Delete old receipt if exists
    if (expense.receipt && expense.receipt.filename) {
      const oldReceiptPath = path.join('./public/uploads/receipts', expense.receipt.filename);
      if (fs.existsSync(oldReceiptPath)) {
        fs.unlinkSync(oldReceiptPath);
      }
    }
    
    // Update expense with new receipt
    expense.receipt = {
      url: `/uploads/receipts/${req.file.filename}`,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadDate: Date.now()
    };
    
    await expense.save();
    
    res.status(200).json({
      success: true,
      data: expense.receipt
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Share expense with another user
 * @route   POST /api/expenses/:id/share
 * @access  Private
 */
export const shareExpense = async (req, res) => {
  try {
    const { email, amount } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email'
      });
    }
    
    // Find expense
    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      return res.status(404).json({
        success: false,
        error: 'Expense not found'
      });
    }
    
    // Make sure user owns the expense
    if (expense.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to share this expense'
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
    if (expense.sharedWith.some(share => share.user.toString() === userToShare._id.toString())) {
      return res.status(400).json({
        success: false,
        error: 'Expense already shared with this user'
      });
    }
    
    // Add user to sharedWith array
    expense.shared = true;
    expense.sharedWith.push({
      user: userToShare._id,
      amount: amount || expense.amount,
      settled: false
    });
    
    await expense.save();
    
    res.status(200).json({
      success: true,
      data: expense
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Mark shared expense as settled
 * @route   PUT /api/expenses/:id/settle/:userId
 * @access  Private
 */
export const settleExpense = async (req, res) => {
  try {
    // Find expense
    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      return res.status(404).json({
        success: false,
        error: 'Expense not found'
      });
    }
    
    // Make sure user owns the expense or is the one settling
    if (
      expense.user.toString() !== req.user.id &&
      req.params.userId !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to settle this expense'
      });
    }
    
    // Find the share and update settled status
    const shareIndex = expense.sharedWith.findIndex(
      share => share.user.toString() === req.params.userId
    );
    
    if (shareIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Share not found'
      });
    }
    
    expense.sharedWith[shareIndex].settled = true;
    
    await expense.save();
    
    res.status(200).json({
      success: true,
      data: expense
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
