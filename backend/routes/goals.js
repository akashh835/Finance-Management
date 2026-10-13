import express from 'express';
import {
  getGoals,
  getGoal,
  createGoal,
  updateGoal,
  deleteGoal,
  addContribution,
  shareGoal,
  removeShare,
  addMilestone,
  removeMilestone
} from '../controllers/goals.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getGoals)
  .post(protect, createGoal);

router.route('/:id')
  .get(protect, getGoal)
  .put(protect, updateGoal)
  .delete(protect, deleteGoal);

router.route('/:id/contribute')
  .post(protect, addContribution);

router.route('/:id/share')
  .post(protect, shareGoal);

router.route('/:id/share/:userId')
  .delete(protect, removeShare);

router.route('/:id/milestones')
  .post(protect, addMilestone);

router.route('/:id/milestones/:milestoneId')
  .delete(protect, removeMilestone);

export default router;
