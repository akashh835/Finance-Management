const { test, expect, runTests } = require('./custom-test-runner');

// Mock auth service
const authService = {
  login: (credentials) => {
    return Promise.resolve({ token: 'fake-token', user: { id: '123' } });
  },
  register: (userData) => {
    return Promise.resolve({ token: 'fake-token', user: { id: '123' } });
  }
};

// Test cases
test('simple test', () => {
  expect(1 + 1).toBe(2);
});

test('string test', () => {
  expect('hello ' + 'world').toBe('hello world');
});

test('object test', () => {
  expect({ name: 'John', age: 30 }).toEqual({ name: 'John', age: 30 });
});

test('login test', async () => {
  const credentials = { email: 'test@example.com', password: 'password123' };
  const result = await authService.login(credentials);
  expect(result.token).toBe('fake-token');
});

test('register test', async () => {
  const userData = { name: 'Test User', email: 'test@example.com', password: 'password123' };
  const result = await authService.register(userData);
  expect(result.token).toBe('fake-token');
});

// Run all tests
runTests();
