// Import the custom test runner
const { test, expect, runTests } = require('./custom-test-runner');

// Mock API module
const api = {
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
};

// Mock localStorage
const localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
};

// Create a mock implementation of authService
const authService = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to login');
    }
  },
  
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to register');
    }
  },
  
  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to logout');
    }
  }
};

// Test cases
test('login should call API with correct parameters', async () => {
  // Arrange
  const credentials = { email: 'test@example.com', password: 'password123' };
  const mockResponse = { 
    data: { 
      token: 'fake-token', 
      user: { id: '123', name: 'Test User', email: 'test@example.com' } 
    } 
  };
  api.post.mockResolvedValue(mockResponse);
  
  // Act
  const result = await authService.login(credentials);
  
  // Assert
  expect(api.post.mock.calls[0][0]).toBe('/auth/login');
  expect(api.post.mock.calls[0][1]).toEqual(credentials);
  expect(result).toEqual(mockResponse.data);
  expect(localStorage.setItem.mock.calls[0][0]).toBe('token');
  expect(localStorage.setItem.mock.calls[0][1]).toBe('fake-token');
});

// Run all tests
runTests();
