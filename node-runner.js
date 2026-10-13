// Node.js test runner
const tests = [];
let passCount = 0;
let failCount = 0;

// Test function
function test(name, fn) {
  tests.push({ name, fn });
}

// Expect function
function expect(actual) {
  return {
    toBe(expected) {
      if (actual === expected) {
        return true;
      } else {
        throw new Error(`Expected ${expected} but got ${actual}`);
      }
    },
    toEqual(expected) {
      const actualStr = JSON.stringify(actual);
      const expectedStr = JSON.stringify(expected);
      if (actualStr === expectedStr) {
        return true;
      } else {
        throw new Error(`Expected ${expectedStr} but got ${actualStr}`);
      }
    },
    toBeCalled() {
      if (actual.mock && actual.mock.calls && actual.mock.calls.length > 0) {
        return true;
      } else {
        throw new Error('Expected function to be called');
      }
    },
    toBeCalledWith(...args) {
      if (!actual.mock || !actual.mock.calls || actual.mock.calls.length === 0) {
        throw new Error('Expected function to be called');
      }
      
      const lastCall = actual.mock.calls[actual.mock.calls.length - 1];
      const lastCallStr = JSON.stringify(lastCall);
      const expectedArgsStr = JSON.stringify(args);
      
      if (lastCallStr === expectedArgsStr) {
        return true;
      } else {
        throw new Error(`Expected function to be called with ${expectedArgsStr} but was called with ${lastCallStr}`);
      }
    }
  };
}

// Mock function
function fn() {
  const mockFn = function(...args) {
    mockFn.mock.calls.push(args);
    return mockFn.mockImplementation ? mockFn.mockImplementation(...args) : undefined;
  };
  
  mockFn.mock = {
    calls: []
  };
  
  mockFn.mockReturnValue = function(value) {
    mockFn.mockImplementation = () => value;
    return mockFn;
  };
  
  mockFn.mockResolvedValue = function(value) {
    mockFn.mockImplementation = () => Promise.resolve(value);
    return mockFn;
  };
  
  mockFn.mockRejectedValue = function(error) {
    mockFn.mockImplementation = () => Promise.reject(error);
    return mockFn;
  };
  
  return mockFn;
}

// Run all tests
async function runTests() {
  console.log('Running tests...\n');
  
  for (const { name, fn } of tests) {
    try {
      await fn();
      console.log(`✅ ${name}`);
      passCount++;
    } catch (error) {
      console.error(`❌ ${name}`);
      console.error(`   ${error.message}`);
      failCount++;
    }
  }
  
  console.log(`\nResults: ${passCount} passed, ${failCount} failed`);
  
  return { passCount, failCount };
}

// Export test functions
module.exports = { test, expect, fn, runTests };
