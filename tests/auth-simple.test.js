import { describe, it, expect, vi } from 'vitest';
import * as authService from '../src/services/authService';
import api from '../src/services/api';

// Mock the API service
vi.mock('../src/services/api');

describe('Authentication Service - Simple Test', () => {
  it('login should call the API with correct parameters', async () => {
    // Arrange
    const credentials = { email: 'test@example.com', password: 'password123' };
    const mockResponse = { 
      data: { 
        success: true, 
        token: 'fake-token', 
        user: { id: '123', name: 'Test User', email: 'test@example.com' } 
      } 
    };
    api.post.mockResolvedValue(mockResponse);
    
    // Act
    const result = await authService.login(credentials);
    
    // Assert
    expect(api.post).toHaveBeenCalledWith('/auth/login', credentials);
    expect(result).toEqual(mockResponse.data);
  });
});
