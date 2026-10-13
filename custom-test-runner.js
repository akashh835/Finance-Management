// Custom test runner
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
      if (JSON.stringify(actual) === JSON.stringify(expected)) {
        return true;
      } else {
        throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
      }
    }
  };
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
}

// Export test functions
module.exports = { test, expect, runTests };
