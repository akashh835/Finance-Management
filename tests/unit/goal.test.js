import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  getGoals, 
  getGoalById, 
  createGoal, 
  updateGoal, 
  deleteGoal,
  updateGoalProgress
} from '../../src/services/goalService';
import api from '../../src/services/api';

// Mock the API service
vi.mock('../../src/services/api');

describe('Goal Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    // Restore mocks after each test
    vi.restoreAllMocks();
  });
  
  describe('getGoals', () => {
    it('should fetch all goals', async () => {
      // Arrange
      const mockGoals = [
        { 
          id: '1', 
          name: 'Emergency Fund', 
          targetAmount: 5000, 
          currentAmount: 2000, 
          targetDate: '2023-12-31' 
        },
        { 
          id: '2', 
          name: 'Vacation', 
          targetAmount: 3000, 
          currentAmount: 500, 
          targetDate: '2023-06-30' 
        }
      ];
      const mockResponse = { data: { success: true, data: mockGoals } };
      api.get.mockResolvedValue(mockResponse);
      
      // Act
      const result = await getGoals();
      
      // Assert
      expect(api.get).toHaveBeenCalledWith('/goals');
      expect(result).toEqual(mockGoals);
    });
    
    it('should handle query parameters', async () => {
      // Arrange
      const mockGoals = [
        { 
          id: '1', 
          name: 'Emergency Fund', 
          targetAmount: 5000, 
          currentAmount: 2000, 
          targetDate: '2023-12-31' 
        }
      ];
      const mockResponse = { data: { success: true, data: mockGoals } };
      api.get.mockResolvedValue(mockResponse);
      
      const params = { status: 'active' };
      
      // Act
      const result = await getGoals(params);
      
      // Assert
      expect(api.get).toHaveBeenCalledWith('/goals', { params });
      expect(result).toEqual(mockGoals);
    });
    
    it('should throw an error when API call fails', async () => {
      // Arrange
      const errorMessage = 'Failed to fetch goals';
      api.get.mockRejectedValue(new Error(errorMessage));
      
      // Act & Assert
      await expect(getGoals()).rejects.toThrow(errorMessage);
      expect(api.get).toHaveBeenCalledWith('/goals');
    });
  });
  
  describe('getGoalById', () => {
    it('should fetch a goal by ID', async () => {
      // Arrange
      const goalId = '1';
      const mockGoal = { 
        id: goalId, 
        name: 'Emergency Fund', 
        targetAmount: 5000, 
        currentAmount: 2000, 
        targetDate: '2023-12-31',
        contributions: [
          { amount: 1000, date: '2023-01-15', notes: 'Initial contribution' },
          { amount: 1000, date: '2023-02-15', notes: 'Monthly contribution' }
        ]
      };
      const mockResponse = { data: { success: true, data: mockGoal } };
      api.get.mockResolvedValue(mockResponse);
      
      // Act
      const result = await getGoalById(goalId);
      
      // Assert
      expect(api.get).toHaveBeenCalledWith(`/goals/${goalId}`);
      expect(result).toEqual(mockGoal);
    });
    
    it('should throw an error when goal is not found', async () => {
      // Arrange
      const goalId = 'nonexistent';
      const errorMessage = 'Goal not found';
      api.get.mockRejectedValue(new Error(errorMessage));
      
      // Act & Assert
      await expect(getGoalById(goalId)).rejects.toThrow(errorMessage);
      expect(api.get).toHaveBeenCalledWith(`/goals/${goalId}`);
    });
  });
  
  describe('createGoal', () => {
    it('should create a new goal', async () => {
      // Arrange
      const goalData = { 
        name: 'New Car', 
        targetAmount: 20000, 
        currentAmount: 0, 
        targetDate: '2024-12-31',
        priority: 'medium'
      };
      const mockGoal = { 
        id: '3', 
        ...goalData, 
        createdAt: '2023-01-05T00:00:00.000Z',
        status: 'active'
      };
      const mockResponse = { data: { success: true, data: mockGoal } };
      api.post.mockResolvedValue(mockResponse);
      
      // Act
      const result = await createGoal(goalData);
      
      // Assert
      expect(api.post).toHaveBeenCalledWith('/goals', goalData);
      expect(result).toEqual(mockGoal);
    });
    
    it('should throw an error when goal creation fails', async () => {
      // Arrange
      const goalData = { name: 'Invalid Goal' }; // Missing required fields
      const errorMessage = 'Validation failed';
      api.post.mockRejectedValue(new Error(errorMessage));
      
      // Act & Assert
      await expect(createGoal(goalData)).rejects.toThrow(errorMessage);
      expect(api.post).toHaveBeenCalledWith('/goals', goalData);
    });
  });
  
  describe('updateGoal', () => {
    it('should update an existing goal', async () => {
      // Arrange
      const goalId = '1';
      const goalData = { 
        name: 'Emergency Fund (Updated)', 
        targetAmount: 6000 
      };
      const mockGoal = { 
        id: goalId, 
        name: 'Emergency Fund (Updated)', 
        targetAmount: 6000, 
        currentAmount: 2000, 
        targetDate: '2023-12-31',
        updatedAt: '2023-01-06T00:00:00.000Z' 
      };
      const mockResponse = { data: { success: true, data: mockGoal } };
      api.put.mockResolvedValue(mockResponse);
      
      // Act
      const result = await updateGoal(goalId, goalData);
      
      // Assert
      expect(api.put).toHaveBeenCalledWith(`/goals/${goalId}`, goalData);
      expect(result).toEqual(mockGoal);
    });
    
    it('should throw an error when goal update fails', async () => {
      // Arrange
      const goalId = 'nonexistent';
      const goalData = { name: 'Updated Goal' };
      const errorMessage = 'Goal not found';
      api.put.mockRejectedValue(new Error(errorMessage));
      
      // Act & Assert
      await expect(updateGoal(goalId, goalData)).rejects.toThrow(errorMessage);
      expect(api.put).toHaveBeenCalledWith(`/goals/${goalId}`, goalData);
    });
  });
  
  describe('deleteGoal', () => {
    it('should delete a goal', async () => {
      // Arrange
      const goalId = '1';
      const mockResponse = { data: { success: true, data: {} } };
      api.delete.mockResolvedValue(mockResponse);
      
      // Act
      const result = await deleteGoal(goalId);
      
      // Assert
      expect(api.delete).toHaveBeenCalledWith(`/goals/${goalId}`);
      expect(result).toEqual({});
    });
    
    it('should throw an error when goal deletion fails', async () => {
      // Arrange
      const goalId = 'nonexistent';
      const errorMessage = 'Goal not found';
      api.delete.mockRejectedValue(new Error(errorMessage));
      
      // Act & Assert
      await expect(deleteGoal(goalId)).rejects.toThrow(errorMessage);
      expect(api.delete).toHaveBeenCalledWith(`/goals/${goalId}`);
    });
  });
  
  describe('updateGoalProgress', () => {
    it('should update goal progress', async () => {
      // Arrange
      const goalId = '1';
      const progressData = { 
        amount: 1000, 
        date: '2023-03-15', 
        notes: 'Monthly contribution' 
      };
      const mockGoal = { 
        id: goalId, 
        name: 'Emergency Fund', 
        targetAmount: 5000, 
        currentAmount: 3000, // Updated amount
        targetDate: '2023-12-31',
        contributions: [
          { amount: 1000, date: '2023-01-15', notes: 'Initial contribution' },
          { amount: 1000, date: '2023-02-15', notes: 'Monthly contribution' },
          { amount: 1000, date: '2023-03-15', notes: 'Monthly contribution' }
        ],
        updatedAt: '2023-03-15T00:00:00.000Z' 
      };
      const mockResponse = { data: { success: true, data: mockGoal } };
      api.put.mockResolvedValue(mockResponse);
      
      // Act
      const result = await updateGoalProgress(goalId, progressData);
      
      // Assert
      expect(api.put).toHaveBeenCalledWith(`/goals/${goalId}/progress`, progressData);
      expect(result).toEqual(mockGoal);
    });
    
    it('should throw an error when progress update fails', async () => {
      // Arrange
      const goalId = 'nonexistent';
      const progressData = { amount: 1000 };
      const errorMessage = 'Goal not found';
      api.put.mockRejectedValue(new Error(errorMessage));
      
      // Act & Assert
      await expect(updateGoalProgress(goalId, progressData)).rejects.toThrow(errorMessage);
      expect(api.put).toHaveBeenCalledWith(`/goals/${goalId}/progress`, progressData);
    });
  });
});
