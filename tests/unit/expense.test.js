import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  getExpenses, 
  getExpenseById, 
  createExpense, 
  updateExpense, 
  deleteExpense,
  getExpenseStats,
  createBulkExpenses
} from '../../src/services/expenseService';
import api from '../../src/services/api';

// Mock the API service
vi.mock('../../src/services/api');

describe('Expense Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    // Restore mocks after each test
    vi.restoreAllMocks();
  });
  
  describe('getExpenses', () => {
    it('should fetch all expenses', async () => {
      // Arrange
      const mockExpenses = [
        { id: '1', description: 'Groceries', amount: 50, type: 'expense', date: '2023-01-05' },
        { id: '2', description: 'Salary', amount: 2000, type: 'income', date: '2023-01-01' }
      ];
      const mockResponse = { data: { success: true, data: mockExpenses } };
      api.get.mockResolvedValue(mockResponse);
      
      // Act
      const result = await getExpenses();
      
      // Assert
      expect(api.get).toHaveBeenCalledWith('/expenses');
      expect(result).toEqual(mockExpenses);
    });
    
    it('should handle query parameters', async () => {
      // Arrange
      const mockExpenses = [
        { id: '1', description: 'Groceries', amount: 50, type: 'expense', date: '2023-01-05' }
      ];
      const mockResponse = { data: { success: true, data: mockExpenses } };
      api.get.mockResolvedValue(mockResponse);
      
      const params = { 
        page: 1, 
        limit: 10, 
        sort: 'date', 
        type: 'expense',
        startDate: '2023-01-01',
        endDate: '2023-01-31'
      };
      
      // Act
      const result = await getExpenses(params);
      
      // Assert
      expect(api.get).toHaveBeenCalledWith('/expenses', { params });
      expect(result).toEqual(mockExpenses);
    });
    
    it('should throw an error when API call fails', async () => {
      // Arrange
      const errorMessage = 'Failed to fetch expenses';
      api.get.mockRejectedValue(new Error(errorMessage));
      
      // Act & Assert
      await expect(getExpenses()).rejects.toThrow(errorMessage);
      expect(api.get).toHaveBeenCalledWith('/expenses');
    });
  });
  
  describe('getExpenseById', () => {
    it('should fetch an expense by ID', async () => {
      // Arrange
      const expenseId = '1';
      const mockExpense = { 
        id: expenseId, 
        description: 'Groceries', 
        amount: 50, 
        type: 'expense', 
        date: '2023-01-05' 
      };
      const mockResponse = { data: { success: true, data: mockExpense } };
      api.get.mockResolvedValue(mockResponse);
      
      // Act
      const result = await getExpenseById(expenseId);
      
      // Assert
      expect(api.get).toHaveBeenCalledWith(`/expenses/${expenseId}`);
      expect(result).toEqual(mockExpense);
    });
    
    it('should throw an error when expense is not found', async () => {
      // Arrange
      const expenseId = 'nonexistent';
      const errorMessage = 'Expense not found';
      api.get.mockRejectedValue(new Error(errorMessage));
      
      // Act & Assert
      await expect(getExpenseById(expenseId)).rejects.toThrow(errorMessage);
      expect(api.get).toHaveBeenCalledWith(`/expenses/${expenseId}`);
    });
  });
  
  describe('createExpense', () => {
    it('should create a new expense', async () => {
      // Arrange
      const expenseData = { 
        description: 'Groceries', 
        amount: 50, 
        type: 'expense', 
        date: '2023-01-05',
        categoryId: '1'
      };
      const mockExpense = { 
        id: '3', 
        ...expenseData, 
        createdAt: '2023-01-05T00:00:00.000Z' 
      };
      const mockResponse = { data: { success: true, data: mockExpense } };
      api.post.mockResolvedValue(mockResponse);
      
      // Act
      const result = await createExpense(expenseData);
      
      // Assert
      expect(api.post).toHaveBeenCalledWith('/expenses', expenseData);
      expect(result).toEqual(mockExpense);
    });
    
    it('should throw an error when expense creation fails', async () => {
      // Arrange
      const expenseData = { description: 'Invalid Expense' }; // Missing required fields
      const errorMessage = 'Validation failed';
      api.post.mockRejectedValue(new Error(errorMessage));
      
      // Act & Assert
      await expect(createExpense(expenseData)).rejects.toThrow(errorMessage);
      expect(api.post).toHaveBeenCalledWith('/expenses', expenseData);
    });
  });
  
  describe('updateExpense', () => {
    it('should update an existing expense', async () => {
      // Arrange
      const expenseId = '1';
      const expenseData = { description: 'Updated Groceries', amount: 60 };
      const mockExpense = { 
        id: expenseId, 
        description: 'Updated Groceries', 
        amount: 60, 
        type: 'expense', 
        date: '2023-01-05',
        updatedAt: '2023-01-06T00:00:00.000Z' 
      };
      const mockResponse = { data: { success: true, data: mockExpense } };
      api.put.mockResolvedValue(mockResponse);
      
      // Act
      const result = await updateExpense(expenseId, expenseData);
      
      // Assert
      expect(api.put).toHaveBeenCalledWith(`/expenses/${expenseId}`, expenseData);
      expect(result).toEqual(mockExpense);
    });
    
    it('should throw an error when expense update fails', async () => {
      // Arrange
      const expenseId = 'nonexistent';
      const expenseData = { description: 'Updated Expense' };
      const errorMessage = 'Expense not found';
      api.put.mockRejectedValue(new Error(errorMessage));
      
      // Act & Assert
      await expect(updateExpense(expenseId, expenseData)).rejects.toThrow(errorMessage);
      expect(api.put).toHaveBeenCalledWith(`/expenses/${expenseId}`, expenseData);
    });
  });
  
  describe('deleteExpense', () => {
    it('should delete an expense', async () => {
      // Arrange
      const expenseId = '1';
      const mockResponse = { data: { success: true, data: {} } };
      api.delete.mockResolvedValue(mockResponse);
      
      // Act
      const result = await deleteExpense(expenseId);
      
      // Assert
      expect(api.delete).toHaveBeenCalledWith(`/expenses/${expenseId}`);
      expect(result).toEqual({});
    });
    
    it('should throw an error when expense deletion fails', async () => {
      // Arrange
      const expenseId = 'nonexistent';
      const errorMessage = 'Expense not found';
      api.delete.mockRejectedValue(new Error(errorMessage));
      
      // Act & Assert
      await expect(deleteExpense(expenseId)).rejects.toThrow(errorMessage);
      expect(api.delete).toHaveBeenCalledWith(`/expenses/${expenseId}`);
    });
  });
  
  describe('getExpenseStats', () => {
    it('should fetch expense statistics', async () => {
      // Arrange
      const mockStats = {
        totalIncome: 5000,
        totalExpenses: 3000,
        netIncome: 2000,
        expensesByCategory: [
          { category: 'Groceries', amount: 1000 },
          { category: 'Utilities', amount: 500 }
        ],
        monthlyTotals: [
          { month: 'Jan 2023', income: 5000, expenses: 3000 }
        ]
      };
      const mockResponse = { data: { success: true, data: mockStats } };
      api.get.mockResolvedValue(mockResponse);
      
      // Act
      const result = await getExpenseStats();
      
      // Assert
      expect(api.get).toHaveBeenCalledWith('/expenses/stats');
      expect(result).toEqual(mockStats);
    });
    
    it('should handle query parameters', async () => {
      // Arrange
      const mockStats = {
        totalIncome: 5000,
        totalExpenses: 3000,
        netIncome: 2000
      };
      const mockResponse = { data: { success: true, data: mockStats } };
      api.get.mockResolvedValue(mockResponse);
      
      const params = { 
        startDate: '2023-01-01',
        endDate: '2023-01-31'
      };
      
      // Act
      const result = await getExpenseStats(params);
      
      // Assert
      expect(api.get).toHaveBeenCalledWith('/expenses/stats', { params });
      expect(result).toEqual(mockStats);
    });
    
    it('should throw an error when API call fails', async () => {
      // Arrange
      const errorMessage = 'Failed to fetch expense statistics';
      api.get.mockRejectedValue(new Error(errorMessage));
      
      // Act & Assert
      await expect(getExpenseStats()).rejects.toThrow(errorMessage);
      expect(api.get).toHaveBeenCalledWith('/expenses/stats');
    });
  });
  
  describe('createBulkExpenses', () => {
    it('should create multiple expenses', async () => {
      // Arrange
      const expensesData = [
        { description: 'Groceries', amount: 50, type: 'expense', date: '2023-01-05', categoryId: '1' },
        { description: 'Utilities', amount: 100, type: 'expense', date: '2023-01-10', categoryId: '2' }
      ];
      const mockExpenses = expensesData.map((expense, index) => ({
        id: String(index + 1),
        ...expense,
        createdAt: '2023-01-05T00:00:00.000Z'
      }));
      const mockResponse = { data: { success: true, data: mockExpenses } };
      api.post.mockResolvedValue(mockResponse);
      
      // Act
      const result = await createBulkExpenses(expensesData);
      
      // Assert
      expect(api.post).toHaveBeenCalledWith('/expenses/bulk', { expenses: expensesData });
      expect(result).toEqual(mockExpenses);
    });
    
    it('should throw an error when bulk creation fails', async () => {
      // Arrange
      const expensesData = [
        { description: 'Invalid Expense' } // Missing required fields
      ];
      const errorMessage = 'Validation failed';
      api.post.mockRejectedValue(new Error(errorMessage));
      
      // Act & Assert
      await expect(createBulkExpenses(expensesData)).rejects.toThrow(errorMessage);
      expect(api.post).toHaveBeenCalledWith('/expenses/bulk', { expenses: expensesData });
    });
  });
});
