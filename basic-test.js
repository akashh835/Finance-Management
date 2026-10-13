// Basic test file
console.log('Running basic tests...');

// Test 1: Simple addition
console.log('Test 1: Simple addition');
if (1 + 1 === 2) {
  console.log('✅ Test 1 passed');
} else {
  console.error('❌ Test 1 failed');
}

// Test 2: String concatenation
console.log('Test 2: String concatenation');
if ('hello ' + 'world' === 'hello world') {
  console.log('✅ Test 2 passed');
} else {
  console.error('❌ Test 2 failed');
}

// Test 3: Object equality
console.log('Test 3: Object equality');
const obj1 = { name: 'John', age: 30 };
const obj2 = { name: 'John', age: 30 };
if (JSON.stringify(obj1) === JSON.stringify(obj2)) {
  console.log('✅ Test 3 passed');
} else {
  console.error('❌ Test 3 failed');
}

console.log('All tests completed!');
