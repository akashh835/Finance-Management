import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as budgetService from '../../src/services/budgetService';
import api from '../../src/services/api';

// Mock the API service
vi.mock('../../src/services/api');

describe('Budget Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore mocks after each test
    vi.restoreAllMocks();
  });

  describe('getBudgets', () => {
    it('should fetch all budgets', async () => {
      // Arrange
      const mockBudgets = [
        { id: '1', name: 'Monthly Budget', amount: 1000 },
        { id: '2', name: 'Groceries', amount: 300 }
      ];
      const mockResponse = { data: { success: true, data: mockBudgets } };
      api.get.mockResolvedValue(mockResponse);

      // Act
      const result = await budgetService.getBudgets();

      // Assert
      expect(api.get).toHaveBeenCalledWith('/budgets');
      expect(result).toEqual(mockBudgets);
    });

    it('should handle query parameters', async () => {
      // Arrange
      const mockBudgets = [
        { id: '1', name: 'Monthly Budget', amount: 1000 }
      ];
      const mockResponse = { data: { success: true, data: mockBudgets } };
      api.get.mockResolvedValue(mockResponse);

      const params = { page: 1, limit: 10, sort: 'name' };

      // Act
      const result = await budgetService.getBudgets(params);

      // Assert
      expect(api.get).toHaveBeenCalledWith('/budgets', { params });
      expect(result).toEqual(mockBudgets);
    });

    it('should throw an error when API call fails', async () => {
      // Arrange
      const errorMessage = 'Failed to fetch budgets';
      api.get.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(budgetService.getBudgets()).rejects.toThrow(errorMessage);
      expect(api.get).toHaveBeenCalledWith('/budgets');
    });
  });

  describe('getBudgetById', () => {
    it('should fetch a budget by ID', async () => {
      // Arrange
      const budgetId = '1';
      const mockBudget = { id: budgetId, name: 'Monthly Budget', amount: 1000 };
      const mockResponse = { data: { success: true, data: mockBudget } };
      api.get.mockResolvedValue(mockResponse);

      // Act
      const result = await budgetService.getBudgetById(budgetId);

      // Assert
      expect(api.get).toHaveBeenCalledWith(`/budgets/${budgetId}`);
      expect(result).toEqual(mockBudget);
    });

    it('should throw an error when budget is not found', async () => {
      // Arrange
      const budgetId = 'nonexistent';
      const errorMessage = 'Budget not found';
      api.get.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(budgetService.getBudgetById(budgetId)).rejects.toThrow(errorMessage);
      expect(api.get).toHaveBeenCalledWith(`/budgets/${budgetId}`);
    });
  });

  describe('createBudget', () => {
    it('should create a new budget', async () => {
      // Arrange
      const budgetData = {
        name: 'New Budget',
        amount: 500,
        startDate: '2023-01-01',
        endDate: '2023-01-31'
      };
      const mockBudget = {
        id: '3',
        ...budgetData,
        createdAt: '2023-01-01T00:00:00.000Z'
      };
      const mockResponse = { data: { success: true, data: mockBudget } };
      api.post.mockResolvedValue(mockResponse);

      // Act
      const result = await budgetService.createBudget(budgetData);

      // Assert
      expect(api.post).toHaveBeenCalledWith('/budgets', budgetData);
      expect(result).toEqual(mockBudget);
    });

    it('should throw an error when budget creation fails', async () => {
      // Arrange
      const budgetData = { name: 'Invalid Budget' }; // Missing required fields
      const errorMessage = 'Validation failed';
      api.post.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(budgetService.createBudget(budgetData)).rejects.toThrow(errorMessage);
      expect(api.post).toHaveBeenCalledWith('/budgets', budgetData);
    });
  });

  describe('updateBudget', () => {
    it('should update an existing budget', async () => {
      // Arrange
      const budgetId = '1';
      const budgetData = { name: 'Updated Budget', amount: 1200 };
      const mockBudget = {
        id: budgetId,
        ...budgetData,
        startDate: '2023-01-01',
        endDate: '2023-01-31',
        updatedAt: '2023-01-15T00:00:00.000Z'
      };
      const mockResponse = { data: { success: true, data: mockBudget } };
      api.put.mockResolvedValue(mockResponse);

      // Act
      const result = await budgetService.updateBudget(budgetId, budgetData);

      // Assert
      expect(api.put).toHaveBeenCalledWith(`/budgets/${budgetId}`, budgetData);
      expect(result).toEqual(mockBudget);
    });

    it('should throw an error when budget update fails', async () => {
      // Arrange
      const budgetId = 'nonexistent';
      const budgetData = { name: 'Updated Budget' };
      const errorMessage = 'Budget not found';
      api.put.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(budgetService.updateBudget(budgetId, budgetData)).rejects.toThrow(errorMessage);
      expect(api.put).toHaveBeenCalledWith(`/budgets/${budgetId}`, budgetData);
    });
  });

  describe('deleteBudget', () => {
    it('should delete a budget', async () => {
      // Arrange
      const budgetId = '1';
      const mockResponse = { data: { success: true, data: {} } };
      api.delete.mockResolvedValue(mockResponse);

      // Act
      const result = await budgetService.deleteBudget(budgetId);

      // Assert
      expect(api.delete).toHaveBeenCalledWith(`/budgets/${budgetId}`);
      expect(result).toEqual({});
    });

    it('should throw an error when budget deletion fails', async () => {
      // Arrange
      const budgetId = 'nonexistent';
      const errorMessage = 'Budget not found';
      api.delete.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(budgetService.deleteBudget(budgetId)).rejects.toThrow(errorMessage);
      expect(api.delete).toHaveBeenCalledWith(`/budgets/${budgetId}`);
    });
  });

  describe('getBudgetExpenses', () => {
    it('should fetch expenses for a budget', async () => {
      // Arrange
      const budgetId = '1';
      const mockExpenses = [
        { id: '1', description: 'Groceries', amount: 50, date: '2023-01-05' },
        { id: '2', description: 'Utilities', amount: 100, date: '2023-01-10' }
      ];
      const mockResponse = { data: { success: true, data: mockExpenses } };
      api.get.mockResolvedValue(mockResponse);

      // Act
      const result = await budgetService.getBudgetExpenses(budgetId);

      // Assert
      expect(api.get).toHaveBeenCalledWith(`/budgets/${budgetId}/expenses`);
      expect(result).toEqual(mockExpenses);
    });

    it('should handle query parameters', async () => {
      // Arrange
      const budgetId = '1';
      const mockExpenses = [
        { id: '1', description: 'Groceries', amount: 50, date: '2023-01-05' }
      ];
      const mockResponse = { data: { success: true, data: mockExpenses } };
      api.get.mockResolvedValue(mockResponse);

      const params = { page: 1, limit: 10, sort: 'date' };

      // Act
      const result = await budgetService.getBudgetExpenses(budgetId, params);

      // Assert
      expect(api.get).toHaveBeenCalledWith(`/budgets/${budgetId}/expenses`, { params });
      expect(result).toEqual(mockExpenses);
    });

    it('should throw an error when API call fails', async () => {
      // Arrange
      const budgetId = 'nonexistent';
      const errorMessage = 'Budget not found';
      api.get.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(budgetService.getBudgetExpenses(budgetId)).rejects.toThrow(errorMessage);
      expect(api.get).toHaveBeenCalledWith(`/budgets/${budgetId}/expenses`);
    });
  });
});
