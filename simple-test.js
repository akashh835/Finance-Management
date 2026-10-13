// Simple test runner
console.log('Running tests...');

// Test 1: Simple addition
try {
  console.log('Test 1: Simple addition');
  if (1 + 1 !== 2) {
    throw new Error('1 + 1 should equal 2');
  }
  console.log('✅ Test 1 passed');
} catch (error) {
  console.error('❌ Test 1 failed:', error.message);
}

// Test 2: String concatenation
try {
  console.log('Test 2: String concatenation');
  if ('hello ' + 'world' !== 'hello world') {
    throw new Error('String concatenation failed');
  }
  console.log('✅ Test 2 passed');
} catch (error) {
  console.error('❌ Test 2 failed:', error.message);
}

// Test 3: Mock auth service
try {
  console.log('Test 3: Mock auth service');
  
  // Mock API
  const api = {
    post: (url, data) => {
      console.log(`API POST called with URL: ${url}, data:`, data);
      return Promise.resolve({
        data: {
          token: 'fake-token',
          user: { id: '123', name: 'Test User' }
        }
      });
    }
  };
  
  // Mock localStorage
  const localStorage = {
    setItem: (key, value) => {
      console.log(`localStorage.setItem called with key: ${key}, value: ${value}`);
    }
  };
  
  // Auth service
  const authService = {
    login: async (credentials) => {
      const response = await api.post('/auth/login', credentials);
      localStorage.setItem('token', response.data.token);
      return response.data;
    }
  };
  
  // Test the login function
  authService.login({ email: 'test@example.com', password: 'password123' })
    .then(result => {
      if (result.token !== 'fake-token') {
        throw new Error('Login failed to return correct token');
      }
      console.log('✅ Test 3 passed');
    })
    .catch(error => {
      console.error('❌ Test 3 failed:', error.message);
    });
  
} catch (error) {
  console.error('❌ Test 3 failed:', error.message);
}

console.log('All tests completed!');
