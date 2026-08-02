---
name: testing-workflow
description: Implements systematic testing workflows using Vitest. Use when writing tests, improving coverage, debugging test failures, or setting up testing infrastructure. Ensures tests are reliable, maintainable, and comprehensive.
---

# Testing Workflow Skill

This skill provides structured workflows for writing, running, and maintaining tests using Vitest in JavaScript/TypeScript projects.

## When to Use This Skill

- Writing tests for new features
- Adding tests to legacy code
- Debugging failing tests
- Improving test coverage
- Setting up testing infrastructure
- Refactoring tests for maintainability

## Common Queries

Example user queries that should route to this skill:

1. "Run the tests"
2. "Write tests for this function"
3. "Why is this test failing?"
4. "How do I mock this dependency?"
5. "Check test coverage"
6. "Add unit tests for the user service"
7. "Fix the failing test"
8. "Show me how to test async code"
9. "Set up testing for this project"
10. "Debug this test failure"

## Core Testing Workflow

### Step 1: Write the Test File

**Location:** Place test files adjacent to source files or in your preferred test directory (e.g., `__tests__/`, `test/`, `spec/`)

```javascript
// Example: utils/formatter.test.js (or __tests__/formatter.test.js)
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { formatUser, formatDate } from './formatter.js';

describe('formatUser', () => {
  it('formats user object correctly', () => {
    const user = { firstName: 'John', lastName: 'Doe' };
    expect(formatUser(user)).toBe('John Doe');
  });

  it('handles missing lastName', () => {
    const user = { firstName: 'John' };
    expect(formatUser(user)).toBe('John');
  });

  it('handles empty object', () => {
    expect(formatUser({})).toBe('Unknown');
  });
});
```

### Step 2: Run Tests

```bash
# Run all tests
npm test

# Run specific file
npm test formatter.test

# Run in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage
```

### Step 3: Verify Coverage

Check coverage report:
- **Statements:** Aim for 80%+
- **Branches:** Aim for 75%+
- **Functions:** Aim for 80%+
- **Lines:** Aim for 80%+

### Step 4: Fix Failing Tests

When tests fail:
1. Read error message carefully
2. Identify assertion that failed
3. Check expected vs actual values
4. Fix code or adjust test
5. Re-run tests

## Test Organization Patterns

### Group Related Tests

```javascript
describe('User Management', () => {
  describe('create user', () => {
    it('creates user with valid data', () => { });
    it('throws error with invalid email', () => { });
    it('throws error with duplicate username', () => { });
  });

  describe('update user', () => {
    it('updates user fields', () => { });
    it('prevents changing username', () => { });
  });
});
```

### Use Setup and Teardown

```javascript
describe('Database tests', () => {
  let db;

  beforeEach(async () => {
    db = await createTestDatabase();
    await db.seed();
  });

  afterEach(async () => {
    await db.cleanup();
    await db.close();
  });

  it('queries users correctly', async () => {
    const users = await db.query('SELECT * FROM users');
    expect(users).toHaveLength(3);
  });
});
```

## Testing Patterns

### Testing Async Functions

```javascript
it('fetches user data', async () => {
  const user = await fetchUser(1);
  expect(user).toEqual({
    id: 1,
    name: 'John Doe',
    email: 'john@example.com'
  });
});

// Test error handling
it('throws on invalid user ID', async () => {
  await expect(fetchUser(-1)).rejects.toThrow('Invalid user ID');
});
```

### Testing with Mocks

```javascript
import { vi } from 'vitest';

it('calls API with correct parameters', async () => {
  const apiMock = vi.fn().mockResolvedValue({ success: true });
  const service = new UserService(apiMock);

  await service.createUser({ name: 'John' });

  expect(apiMock).toHaveBeenCalledWith('/users', {
    method: 'POST',
    body: { name: 'John' }
  });
});
```

### Testing Error Cases

```javascript
describe('error handling', () => {
  it('throws TypeError for null input', () => {
    expect(() => processData(null)).toThrow(TypeError);
  });

  it('throws with descriptive message', () => {
    expect(() => processData(null)).toThrow('Input cannot be null');
  });

  it('handles network errors gracefully', async () => {
    const result = await fetchWithRetry(flakyUrl);
    expect(result.error).toBe('Max retries exceeded');
  });
});
```

### Snapshot Testing

```javascript
it('renders component correctly', () => {
  const output = renderComponent({ title: 'Hello' });
  expect(output).toMatchSnapshot();
});

// Update snapshots when intentional changes made
// npm test -- -u
```

## Test-Driven Development (TDD) Workflow

### Red-Green-Refactor Cycle

1. **Red:** Write failing test
   ```javascript
   it('calculates total price with tax', () => {
     expect(calculateTotal(100, 0.1)).toBe(110);
   });
   ```

2. **Green:** Write minimal code to pass
   ```javascript
   function calculateTotal(price, taxRate) {
     return price + (price * taxRate);
   }
   ```

3. **Refactor:** Improve code quality
   ```javascript
   function calculateTotal(price, taxRate) {
     if (price < 0) throw new Error('Price cannot be negative');
     if (taxRate < 0 || taxRate > 1) throw new Error('Invalid tax rate');
     return price * (1 + taxRate);
   }
   ```

4. **Add edge case tests**
   ```javascript
   it('throws on negative price', () => {
     expect(() => calculateTotal(-10, 0.1)).toThrow();
   });
   ```

## Coverage Improvement Workflow

### Step 1: Generate Coverage Report

```bash
npm test -- --coverage
```

### Step 2: Identify Gaps

Look for:
- Uncovered lines (red in coverage report)
- Uncovered branches (if/else not tested)
- Uncovered functions (never called)

### Step 3: Write Missing Tests

```javascript
// Coverage shows line 23 never executed (error path)
it('handles error path', () => {
  const errorInput = { invalid: true };
  expect(() => process(errorInput)).toThrow();
  // Line 23 now covered!
});
```

### Step 4: Verify Improvement

```bash
npm test -- --coverage
# Check that coverage percentage increased
```

## Common Testing Patterns

### Table-Driven Tests

```javascript
const testCases = [
  { input: 'hello', expected: 'HELLO' },
  { input: 'world', expected: 'WORLD' },
  { input: '', expected: '' },
  { input: '123', expected: '123' }
];

testCases.forEach(({ input, expected }) => {
  it(`transforms "${input}" to "${expected}"`, () => {
    expect(toUpperCase(input)).toBe(expected);
  });
});
```

### Testing with Fixtures

```javascript
import { readFileSync } from 'fs';
import { join } from 'path';

const fixture = readFileSync(
  join(__dirname, 'fixtures', 'sample-data.json'),
  'utf-8'
);

it('parses fixture data', () => {
  const parsed = parseData(fixture);
  expect(parsed).toHaveProperty('users');
});
```

### Spy on Function Calls

```javascript
it('logs errors correctly', () => {
  const logSpy = vi.spyOn(console, 'error');

  performAction();

  expect(logSpy).toHaveBeenCalledWith('Action failed');
  logSpy.mockRestore();
});
```

## Debugging Test Failures

### Step 1: Read Error Message

```
Expected: 42
Received: 41
```

Understand what's different.

### Step 2: Add Debug Logging

```javascript
it('calculates correct value', () => {
  const result = calculate(10);
  console.log('Result:', result); // Add debug log
  expect(result).toBe(42);
});
```

### Step 3: Isolate the Test

```bash
# Run only this test
npm test -- -t "calculates correct value"
```

### Step 4: Use Debugger

```javascript
it('calculates correct value', () => {
  const result = calculate(10);
  debugger; // Pause execution
  expect(result).toBe(42);
});
```

Run with: `node --inspect-brk node_modules/.bin/vitest`

### Step 5: Simplify Test

```javascript
// Break complex test into smaller pieces
it('step 1: initializes correctly', () => {
  const calc = new Calculator();
  expect(calc.value).toBe(0);
});

it('step 2: adds numbers', () => {
  const calc = new Calculator();
  calc.add(10);
  expect(calc.value).toBe(10);
});
```

## Testing Best Practices

1. **Test behavior, not implementation**
   - Bad: `expect(user.firstName).toBe('John')`
   - Good: `expect(user.getDisplayName()).toBe('John Doe')`

2. **One assertion per test (when possible)**
   ```javascript
   // Good
   it('sets firstName', () => expect(user.firstName).toBe('John'));
   it('sets lastName', () => expect(user.lastName).toBe('Doe'));
   ```

3. **Use descriptive test names**
   - Bad: `it('works')`
   - Good: `it('returns empty array when no users exist')`

4. **Arrange-Act-Assert pattern**
   ```javascript
   it('creates user', () => {
     // Arrange
     const userData = { name: 'John' };

     // Act
     const user = createUser(userData);

     // Assert
     expect(user.name).toBe('John');
   });
   ```

5. **Test edge cases**
   - Empty inputs
   - Null/undefined
   - Boundary values
   - Error conditions

6. **Keep tests independent**
   - Don't rely on test execution order
   - Clean up after each test
   - Don't share mutable state

7. **Mock external dependencies**
   - APIs
   - Databases
   - File system
   - Date/time

## Test Coverage Targets

**Production code:**
- Critical paths: 100%
- Business logic: 90%+
- Utilities: 80%+
- UI components: 70%+

**Don't test:**
- Third-party libraries
- Simple getters/setters
- Configuration files
- Type definitions

## Quick Reference

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage

# Run specific test file
npm test formatter.test

# Run tests matching pattern
npm test -- -t "user"

# Update snapshots
npm test -- -u

# Debug tests
node --inspect-brk node_modules/.bin/vitest
```

## Common Issues

### Issue: "Cannot find module"

**Solution:**
```javascript
// Use correct relative paths
import { func } from './utils.js'; // Include .js extension
```

### Issue: Tests timing out

**Solution:**
```javascript
// Increase timeout for slow tests
it('slow operation', async () => {
  // ...
}, 10000); // 10 second timeout
```

### Issue: Flaky tests (pass sometimes, fail others)

**Causes:**
- Race conditions
- Shared state between tests
- Date/time dependencies
- Random values

**Solutions:**
- Mock dates: `vi.setSystemTime(new Date('2024-01-01'))`
- Seed random: `Math.random = () => 0.5`
- Isolate state: Use `beforeEach` to reset
- Add explicit waits for async operations

### Issue: Mock not working

**Solution:**
```javascript
// Clear mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});
```

## Integration with CI/CD

```json
// package.json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ci": "vitest run --coverage --reporter=verbose"
  }
}
```

## Testing Workflow Summary

```
Write Test → Run → Fail → Write Code → Pass → Refactor → Add Edge Cases
    ↓         ↓     ↓        ↓          ↓       ↓           ↓
  TDD Red   Verify Error  Implement  Green   Improve   Coverage++
```

## Additional Resources

For detailed configuration and setup:
- **Testing Setup**: See `resources/testing-setup.md` for Vitest configuration, troubleshooting, and advanced patterns

This skill ensures comprehensive, maintainable tests that catch bugs early and provide confidence in code changes.
