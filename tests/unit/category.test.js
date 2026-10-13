import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  getCategories, 
  getCategoryById, 
  createCategory, 
  updateCategory, 
  deleteCategory,
  getCategoryExpenses
} from '../../src/services/categoryService';
import api from '../../src/services/api';

// Mock the API service
vi.mock('../../src/services/api');

describe('Category Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    // Restore mocks after each test
    vi.restoreAllMocks();
  });
  
  describe('getCategories', () => {
    it('should fetch all categories', async () => {
      // Arrange
      const mockCategories = [
        { id: '1', name: 'Groceries', color: '#FF5733', type: 'expense' },
        { id: '2', name: 'Salary', color: '#33FF57', type: 'income' }
      ];
      const mockResponse = { data: { success: true, data: mockCategories } };
      api.get.mockResolvedValue(mockResponse);
      
      // Act
      const result = await getCategories();
      
      // Assert
      expect(api.get).toHaveBeenCalledWith('/categories');
      expect(result).toEqual(mockCategories);
    });
    
    it('should handle query parameters', async () => {
      // Arrange
      const mockCategories = [
        { id: '1', name: 'Groceries', color: '#FF5733', type: 'expense' }
      ];
      const mockResponse = { data: { success: true, data: mockCategories } };
      api.get.mockResolvedValue(mockResponse);
      
      const params = { type: 'expense' };
      
      // Act
      const result = await getCategories(params);
      
      // Assert
      expect(api.get).toHaveBeenCalledWith('/categories', { params });
      expect(result).toEqual(mockCategories);
    });
    
    it('should throw an error when API call fails', async () => {
      // Arrange
      const errorMessage = 'Failed to fetch categories';
      api.get.mockRejectedValue(new Error(errorMessage));
      
      // Act & Assert
      await expect(getCategories()).rejects.toThrow(errorMessage);
      expect(api.get).toHaveBeenCalledWith('/categories');
    });
  });
  
  describe('getCategoryById', () => {
    it('should fetch a category by ID', async () => {
      // Arrange
      const categoryId = '1';
      const mockCategory = { 
        id: categoryId, 
        name: 'Groceries', 
        color: '#FF5733', 
        type: 'expense' 
      };
      const mockResponse = { data: { success: true, data: mockCategory } };
      api.get.mockResolvedValue(mockResponse);
      
      // Act
      const result = await getCategoryById(categoryId);
      
      // Assert
      expect(api.get).toHaveBeenCalledWith(`/categories/${categoryId}`);
      expect(result).toEqual(mockCategory);
    });
    
    it('should throw an error when category is not found', async () => {
      // Arrange
      const categoryId = 'nonexistent';
      const errorMessage = 'Category not found';
      api.get.mockRejectedValue(new Error(errorMessage));
      
      // Act & Assert
      await expect(getCategoryById(categoryId)).rejects.toThrow(errorMessage);
      expect(api.get).toHaveBeenCalledWith(`/categories/${categoryId}`);
    });
  });
  
  describe('createCategory', () => {
    it('should create a new category', async () => {
      // Arrange
      const categoryData = { 
        name: 'Entertainment', 
        color: '#3357FF', 
        type: 'expense',
        icon: 'movie'
      };
      const mockCategory = { 
        id: '3', 
        ...categoryData, 
        createdAt: '2023-01-05T00:00:00.000Z' 
      };
      const mockResponse = { data: { success: true, data: mockCategory } };
      api.post.mockResolvedValue(mockResponse);
      
      // Act
      const result = await createCategory(categoryData);
      
      // Assert
      expect(api.post).toHaveBeenCalledWith('/categories', categoryData);
      expect(result).toEqual(mockCategory);
    });
    
    it('should throw an error when category creation fails', async () => {
      // Arrange
      const categoryData = { name: 'Invalid Category' }; // Missing required fields
      const errorMessage = 'Validation failed';
      api.post.mockRejectedValue(new Error(errorMessage));
      
      // Act & Assert
      await expect(createCategory(categoryData)).rejects.toThrow(errorMessage);
      expect(api.post).toHaveBeenCalledWith('/categories', categoryData);
    });
  });
  
  describe('updateCategory', () => {
    it('should update an existing category', async () => {
      // Arrange
      const categoryId = '1';
      const categoryData = { name: 'Food & Groceries', color: '#FF8C33' };
      const mockCategory = { 
        id: categoryId, 
        name: 'Food & Groceries', 
        color: '#FF8C33', 
        type: 'expense',
        updatedAt: '2023-01-06T00:00:00.000Z' 
      };
      const mockResponse = { data: { success: true, data: mockCategory } };
      api.put.mockResolvedValue(mockResponse);
      
      // Act
      const result = await updateCategory(categoryId, categoryData);
      
      // Assert
      expect(api.put).toHaveBeenCalledWith(`/categories/${categoryId}`, categoryData);
      expect(result).toEqual(mockCategory);
    });
    
    it('should throw an error when category update fails', async () => {
      // Arrange
      const categoryId = 'nonexistent';
      const categoryData = { name: 'Updated Category' };
      const errorMessage = 'Category not found';
      api.put.mockRejectedValue(new Error(errorMessage));
      
      // Act & Assert
      await expect(updateCategory(categoryId, categoryData)).rejects.toThrow(errorMessage);
      expect(api.put).toHaveBeenCalledWith(`/categories/${categoryId}`, categoryData);
    });
  });
  
  describe('deleteCategory', () => {
    it('should delete a category', async () => {
      // Arrange
      const categoryId = '1';
      const mockResponse = { data: { success: true, data: {} } };
      api.delete.mockResolvedValue(mockResponse);
      
      // Act
      const result = await deleteCategory(categoryId);
      
      // Assert
      expect(api.delete).toHaveBeenCalledWith(`/categories/${categoryId}`);
      expect(result).toEqual({});
    });
    
    it('should throw an error when category deletion fails', async () => {
      // Arrange
      const categoryId = 'nonexistent';
      const errorMessage = 'Category not found';
      api.delete.mockRejectedValue(new Error(errorMessage));
      
      // Act & Assert
      await expect(deleteCategory(categoryId)).rejects.toThrow(errorMessage);
      expect(api.delete).toHaveBeenCalledWith(`/categories/${categoryId}`);
    });
  });
  
  describe('getCategoryExpenses', () => {
    it('should fetch expenses for a category', async () => {
      // Arrange
      const categoryId = '1';
      const mockExpenses = [
        { id: '1', description: 'Groceries', amount: 50, date: '2023-01-05' },
        { id: '2', description: 'Supermarket', amount: 75, date: '2023-01-15' }
      ];
      const mockResponse = { data: { success: true, data: mockExpenses } };
      api.get.mockResolvedValue(mockResponse);
      
      // Act
      const result = await getCategoryExpenses(categoryId);
      
      // Assert
      expect(api.get).toHaveBeenCalledWith(`/categories/${categoryId}/expenses`);
      expect(result).toEqual(mockExpenses);
    });
    
    it('should handle query parameters', async () => {
      // Arrange
      const categoryId = '1';
      const mockExpenses = [
        { id: '1', description: 'Groceries', amount: 50, date: '2023-01-05' }
      ];
      const mockResponse = { data: { success: true, data: mockExpenses } };
      api.get.mockResolvedValue(mockResponse);
      
      const params = { 
        startDate: '2023-01-01',
        endDate: '2023-01-10'
      };
      
      // Act
      const result = await getCategoryExpenses(categoryId, params);
      
      // Assert
      expect(api.get).toHaveBeenCalledWith(`/categories/${categoryId}/expenses`, { params });
      expect(result).toEqual(mockExpenses);
    });
    
    it('should throw an error when API call fails', async () => {
      // Arrange
      const categoryId = 'nonexistent';
      const errorMessage = 'Category not found';
      api.get.mockRejectedValue(new Error(errorMessage));
      
      // Act & Assert
      await expect(getCategoryExpenses(categoryId)).rejects.toThrow(errorMessage);
      expect(api.get).toHaveBeenCalledWith(`/categories/${categoryId}/expenses`);
    });
  });
});
