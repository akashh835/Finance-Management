import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as authService from '../../src/services/authService';
import api from '../../src/services/api';

// Mock the API service
vi.mock('../../src/services/api');

describe('Authentication Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true
    });
  });

  afterEach(() => {
    // Restore mocks after each test
    vi.restoreAllMocks();
  });

  describe('login', () => {
    it('should call the login API endpoint with correct parameters', async () => {
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
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'fake-token');
      expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockResponse.data.user));
    });

    it('should throw an error when login fails', async () => {
      // Arrange
      const credentials = { email: 'test@example.com', password: 'wrong-password' };
      const errorMessage = 'Invalid credentials';
      api.post.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(authService.login(credentials)).rejects.toThrow(errorMessage);
      expect(api.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('should call the register API endpoint with correct parameters', async () => {
      // Arrange
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };
      const mockResponse = {
        data: {
          success: true,
          token: 'fake-token',
          user: { id: '123', name: 'Test User', email: 'test@example.com' }
        }
      };
      api.post.mockResolvedValue(mockResponse);

      // Act
      const result = await authService.register(userData);

      // Assert
      expect(api.post).toHaveBeenCalledWith('/auth/register', userData);
      expect(result).toEqual(mockResponse.data);
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'fake-token');
      expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockResponse.data.user));
    });

    it('should throw an error when registration fails', async () => {
      // Arrange
      const userData = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123'
      };
      const errorMessage = 'Email already exists';
      api.post.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(authService.register(userData)).rejects.toThrow(errorMessage);
      expect(api.post).toHaveBeenCalledWith('/auth/register', userData);
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should remove token and user from localStorage', async () => {
      // Arrange
      const mockResponse = { data: { success: true } };
      api.post.mockResolvedValue(mockResponse);

      // Act
      await authService.logout();

      // Assert
      expect(api.post).toHaveBeenCalledWith('/auth/logout');
      expect(localStorage.removeItem).toHaveBeenCalledWith('token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    });
  });

  describe('refreshToken', () => {
    it('should call the refresh token API endpoint and update localStorage', async () => {
      // Arrange
      const mockToken = 'old-token';
      localStorage.getItem.mockReturnValue(mockToken);

      const mockResponse = {
        data: {
          success: true,
          token: 'new-token'
        }
      };
      api.post.mockResolvedValue(mockResponse);

      // Act
      const result = await authService.refreshToken();

      // Assert
      expect(api.post).toHaveBeenCalledWith('/auth/refresh-token');
      expect(result).toEqual(mockResponse.data);
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'new-token');
    });

    it('should throw an error when refresh token fails', async () => {
      // Arrange
      const mockToken = 'expired-token';
      localStorage.getItem.mockReturnValue(mockToken);

      const errorMessage = 'Invalid or expired token';
      api.post.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(authService.refreshToken()).rejects.toThrow(errorMessage);
      expect(api.post).toHaveBeenCalledWith('/auth/refresh-token');
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('forgotPassword', () => {
    it('should call the forgot password API endpoint with correct parameters', async () => {
      // Arrange
      const email = 'test@example.com';
      const mockResponse = { data: { success: true, message: 'Password reset email sent' } };
      api.post.mockResolvedValue(mockResponse);

      // Act
      const result = await authService.forgotPassword(email);

      // Assert
      expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', { email });
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw an error when forgot password request fails', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      const errorMessage = 'User not found';
      api.post.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(authService.forgotPassword(email)).rejects.toThrow(errorMessage);
      expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', { email });
    });
  });

  describe('resetPassword', () => {
    it('should call the reset password API endpoint with correct parameters', async () => {
      // Arrange
      const token = 'reset-token';
      const password = 'new-password123';
      const mockResponse = { data: { success: true, message: 'Password reset successful' } };
      api.post.mockResolvedValue(mockResponse);

      // Act
      const result = await authService.resetPassword(token, password);

      // Assert
      expect(api.post).toHaveBeenCalledWith(`/auth/reset-password/${token}`, { password });
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw an error when reset password request fails', async () => {
      // Arrange
      const token = 'invalid-token';
      const password = 'new-password123';
      const errorMessage = 'Invalid or expired token';
      api.post.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(authService.resetPassword(token, password)).rejects.toThrow(errorMessage);
      expect(api.post).toHaveBeenCalledWith(`/auth/reset-password/${token}`, { password });
    });
  });
});
