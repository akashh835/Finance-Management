import Goal from '../models/Goal.js';

/**
 * @desc    Get all goals for a user
 * @route   GET /api/goals
 * @access  Private
 */
export const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort('-priority');
    
    res.status(200).json({
      success: true,
      count: goals.length,
      data: goals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Get single goal
 * @route   GET /api/goals/:id
 * @access  Private
 */
export const getGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id)
      .populate('sharedWith.user', 'name email')
      .populate('contributions.user', 'name email');
    
    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found'
      });
    }
    
    // Make sure user owns the goal or is shared with them
    if (
      goal.user.toString() !== req.user.id &&
      !goal.sharedWith.some(share => share.user._id.toString() === req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this goal'
      });
    }
    
    res.status(200).json({
      success: true,
      data: goal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Create new goal
 * @route   POST /api/goals
 * @access  Private
 */
export const createGoal = async (req, res) => {
  try {
    // Add user to request body
    req.body.user = req.user.id;
    
    // Create goal
    const goal = await Goal.create(req.body);
    
    res.status(201).json({
      success: true,
      data: goal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Update goal
 * @route   PUT /api/goals/:id
 * @access  Private
 */
export const updateGoal = async (req, res) => {
  try {
    let goal = await Goal.findById(req.params.id);
    
    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found'
      });
    }
    
    // Make sure user owns the goal or has edit permission
    if (
      goal.user.toString() !== req.user.id &&
      !goal.sharedWith.some(share => 
        share.user.toString() === req.user.id && 
        share.permission === 'edit'
      )
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this goal'
      });
    }
    
    // Update goal
    goal = await Goal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: goal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Delete goal
 * @route   DELETE /api/goals/:id
 * @access  Private
 */
export const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    
    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found'
      });
    }
    
    // Make sure user owns the goal
    if (goal.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this goal'
      });
    }
    
    await goal.remove();
    
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
 * @desc    Add contribution to goal
 * @route   POST /api/goals/:id/contribute
 * @access  Private
 */
export const addContribution = async (req, res) => {
  try {
    const { amount, notes } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid contribution amount'
      });
    }
    
    const goal = await Goal.findById(req.params.id);
    
    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found'
      });
    }
    
    // Make sure user owns the goal or has contribute permission
    if (
      goal.user.toString() !== req.user.id &&
      !goal.sharedWith.some(share => 
        share.user.toString() === req.user.id && 
        ['contribute', 'edit'].includes(share.permission)
      )
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to contribute to this goal'
      });
    }
    
    // Add contribution
    await goal.addContribution(amount, req.user.id, notes);
    
    // Get updated goal with populated fields
    const updatedGoal = await Goal.findById(goal._id)
      .populate('contributions.user', 'name email');
    
    res.status(200).json({
      success: true,
      data: updatedGoal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Share goal with another user
 * @route   POST /api/goals/:id/share
 * @access  Private
 */
export const shareGoal = async (req, res) => {
  try {
    const { email, permission } = req.body;
    
    if (!email || !permission) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and permission'
      });
    }
    
    // Find goal
    const goal = await Goal.findById(req.params.id);
    
    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found'
      });
    }
    
    // Make sure user owns the goal
    if (goal.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to share this goal'
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
    if (goal.sharedWith.some(share => share.user.toString() === userToShare._id.toString())) {
      return res.status(400).json({
        success: false,
        error: 'Goal already shared with this user'
      });
    }
    
    // Add user to sharedWith array
    goal.shared = true;
    goal.sharedWith.push({
      user: userToShare._id,
      permission
    });
    
    await goal.save();
    
    res.status(200).json({
      success: true,
      data: goal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Remove share from goal
 * @route   DELETE /api/goals/:id/share/:userId
 * @access  Private
 */
export const removeShare = async (req, res) => {
  try {
    // Find goal
    const goal = await Goal.findById(req.params.id);
    
    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found'
      });
    }
    
    // Make sure user owns the goal
    if (goal.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to modify sharing for this goal'
      });
    }
    
    // Remove user from sharedWith array
    goal.sharedWith = goal.sharedWith.filter(
      share => share.user.toString() !== req.params.userId
    );
    
    // If no more shares, set shared to false
    if (goal.sharedWith.length === 0) {
      goal.shared = false;
    }
    
    await goal.save();
    
    res.status(200).json({
      success: true,
      data: goal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Add milestone to goal
 * @route   POST /api/goals/:id/milestones
 * @access  Private
 */
export const addMilestone = async (req, res) => {
  try {
    const { name, amount } = req.body;
    
    if (!name || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name and amount for milestone'
      });
    }
    
    const goal = await Goal.findById(req.params.id);
    
    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found'
      });
    }
    
    // Make sure user owns the goal or has edit permission
    if (
      goal.user.toString() !== req.user.id &&
      !goal.sharedWith.some(share => 
        share.user.toString() === req.user.id && 
        share.permission === 'edit'
      )
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to add milestones to this goal'
      });
    }
    
    // Add milestone
    goal.milestones.push({
      name,
      amount: Number(amount),
      reached: goal.currentAmount >= Number(amount),
      reachedDate: goal.currentAmount >= Number(amount) ? Date.now() : undefined
    });
    
    // Sort milestones by amount
    goal.milestones.sort((a, b) => a.amount - b.amount);
    
    await goal.save();
    
    res.status(200).json({
      success: true,
      data: goal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Remove milestone from goal
 * @route   DELETE /api/goals/:id/milestones/:milestoneId
 * @access  Private
 */
export const removeMilestone = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    
    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found'
      });
    }
    
    // Make sure user owns the goal or has edit permission
    if (
      goal.user.toString() !== req.user.id &&
      !goal.sharedWith.some(share => 
        share.user.toString() === req.user.id && 
        share.permission === 'edit'
      )
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to remove milestones from this goal'
      });
    }
    
    // Remove milestone
    goal.milestones = goal.milestones.filter(
      milestone => milestone._id.toString() !== req.params.milestoneId
    );
    
    await goal.save();
    
    res.status(200).json({
      success: true,
      data: goal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
