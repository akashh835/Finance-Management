// Import the test runner
const { test, expect, fn, runTests } = require('./node-runner');

// Mock API
const api = {
  post: fn(),
  get: fn(),
  put: fn(),
  delete: fn()
};

// Mock localStorage
const localStorage = {
  items: {},
  getItem: fn().mockImplementation(key => localStorage.items[key]),
  setItem: fn().mockImplementation((key, value) => {
    localStorage.items[key] = value;
  }),
  removeItem: fn().mockImplementation(key => {
    delete localStorage.items[key];
  })
};

// Auth service
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

// Define tests
test('simple test', () => {
  expect(1 + 1).toBe(2);
});

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
  expect(api.post).toBeCalled();
  expect(api.post).toBeCalledWith('/auth/login', credentials);
  expect(result).toEqual(mockResponse.data);
  expect(localStorage.setItem).toBeCalled();
});

test('register should call API with correct parameters', async () => {
  // Arrange
  const userData = { name: 'Test User', email: 'test@example.com', password: 'password123' };
  const mockResponse = { 
    data: { 
      token: 'fake-token', 
      user: { id: '123', name: 'Test User', email: 'test@example.com' } 
    } 
  };
  api.post.mockResolvedValue(mockResponse);
  
  // Act
  const result = await authService.register(userData);
  
  // Assert
  expect(api.post).toBeCalled();
  expect(api.post).toBeCalledWith('/auth/register', userData);
  expect(result).toEqual(mockResponse.data);
  expect(localStorage.setItem).toBeCalled();
});

test('logout should call API and remove items from localStorage', async () => {
  // Arrange
  const mockResponse = { data: { success: true } };
  api.post.mockResolvedValue(mockResponse);
  
  // Act
  const result = await authService.logout();
  
  // Assert
  expect(api.post).toBeCalled();
  expect(api.post).toBeCalledWith('/auth/logout');
  expect(localStorage.removeItem).toBeCalled();
});

// Run all tests
runTests();
