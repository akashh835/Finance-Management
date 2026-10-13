import assert from 'assert';

// Simple test
console.log('Running test...');
assert.strictEqual(1 + 1, 2, 'Addition works');
console.log('Test passed!');

// Test the auth service mock
const authService = {
  login: (credentials) => {
    console.log('Login called with:', credentials);
    return Promise.resolve({ token: 'fake-token' });
  }
};

// Run an async test
async function testLogin() {
  console.log('Testing login...');
  const credentials = { email: 'test@example.com', password: 'password123' };
  const result = await authService.login(credentials);
  assert.strictEqual(result.token, 'fake-token', 'Login returns token');
  console.log('Login test passed!');
}

// Run all tests
testLogin().then(() => {
  console.log('All tests passed!');
}).catch(error => {
  console.error('Test failed:', error);
});
