import Category from '../models/Category.js';

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Private
 */
export const getCategories = async (req, res) => {
  try {
    // Get system categories and user's custom categories
    const categories = await Category.find({
      $or: [
        { isSystem: true },
        { user: req.user.id }
      ]
    }).sort('name');
    
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Get single category
 * @route   GET /api/categories/:id
 * @access  Private
 */
export const getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }
    
    // Make sure user can access this category
    if (!category.isSystem && category.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this category'
      });
    }
    
    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Create new category
 * @route   POST /api/categories
 * @access  Private
 */
export const createCategory = async (req, res) => {
  try {
    // Add user to request body
    req.body.user = req.user.id;
    
    // Create category
    const category = await Category.create(req.body);
    
    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Update category
 * @route   PUT /api/categories/:id
 * @access  Private
 */
export const updateCategory = async (req, res) => {
  try {
    let category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }
    
    // Check if it's a system category
    if (category.isSystem) {
      return res.status(403).json({
        success: false,
        error: 'System categories cannot be modified'
      });
    }
    
    // Make sure user owns the category
    if (category.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this category'
      });
    }
    
    // Update category
    category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Delete category
 * @route   DELETE /api/categories/:id
 * @access  Private
 */
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }
    
    // Check if it's a system category
    if (category.isSystem) {
      return res.status(403).json({
        success: false,
        error: 'System categories cannot be deleted'
      });
    }
    
    // Make sure user owns the category
    if (category.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this category'
      });
    }
    
    await category.remove();
    
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
 * @desc    Initialize default categories for a new user
 * @route   POST /api/categories/init-defaults
 * @access  Private
 */
export const initDefaultCategories = async (req, res) => {
  try {
    // Check if user already has categories
    const existingCategories = await Category.find({ user: req.user.id });
    
    if (existingCategories.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'User already has categories'
      });
    }
    
    // Get default categories
    const defaultCategories = Category.getDefaultCategories();
    
    // Add user ID to each category
    const categoriesToCreate = defaultCategories.map(category => ({
      ...category,
      user: req.user.id,
      isSystem: false,
      isDefault: true
    }));
    
    // Create categories
    const categories = await Category.insertMany(categoriesToCreate);
    
    res.status(201).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
