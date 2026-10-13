# Test Suite for Smart Budget Tracker

This directory contains all the tests for the Smart Budget Tracker application. The tests are organized into unit tests and integration tests.

## Test Structure

- `unit/`: Contains unit tests for individual components and functions
- `integration/`: Contains integration tests that test multiple components working together
- `e2e/`: Contains end-to-end tests that simulate user interactions

## Running Tests

To run all tests:

```bash
npm test
```

To run specific test suites:

```bash
# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run e2e tests only
npm run test:e2e
```

## Test Coverage

To generate a test coverage report:

```bash
npm run test:coverage
```

The coverage report will be available in the `coverage/` directory.
