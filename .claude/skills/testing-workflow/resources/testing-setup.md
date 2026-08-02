# Testing Setup & Configuration

## Framework: Vitest

This project uses Vitest for testing - a fast, ESM-native test runner built for modern JavaScript projects.

## Running Quality Checks

**MANDATORY: Always run ALL quality checks before completing any task:**

```bash
# REQUIRED - Run before marking ANY task complete:
npm test           # All tests MUST pass
npm run lint       # No lint errors allowed
npm run lint:fix   # Fix auto-fixable issues first
npm run typecheck  # No type errors (for TypeScript projects)

# Optional during development:
npm run test:watch           # Run tests in watch mode
npm run test:coverage        # Run tests with coverage report
npm run test:coverage:watch  # Run tests with coverage in watch mode
npm run test:coverage:ui     # Run tests with coverage in UI
npm run test:coverage:report # Generate coverage and open HTML report
npm test -- user.test        # Run tests matching a pattern
```

**Quality Check Requirements (ALL MANDATORY):**
1. **npm test** - All tests MUST pass completely
2. **npm run lint** - NO lint errors allowed
3. **npm run lint:fix** - Run first to fix auto-fixable issues
4. **npm run typecheck** - NO type errors (for TypeScript projects)

**NEVER mark a task complete without ALL checks passing!**

## Test File Structure

Organize tests according to your project's conventions. Common patterns include:

```
__tests__/          # Tests alongside source files (Jest convention)
test/              # Tests in dedicated directory
spec/              # Alternative test directory (Jasmine convention)
```

Or organized by test type:
```
your-test-dir/
├── unit/           # Unit tests for individual functions
├── integration/    # Integration tests for multiple components
└── e2e/           # End-to-end tests (if applicable)
```

## Writing Tests

### Basic Test Structure

```javascript
import { describe, it, expect } from 'vitest';
import { functionToTest } from '../lib/module.js';

describe('Module Name', () => {
  it('should do something specific', () => {
    const result = functionToTest(input);
    expect(result).toBe(expectedOutput);
  });
});
```

### Common Matchers

```javascript
// Equality
expect(value).toBe(4);                  // Strict equality
expect(value).toEqual({ name: 'John' }); // Deep equality

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();

// Numbers
expect(value).toBeGreaterThan(3);
expect(value).toBeLessThanOrEqual(4.5);
expect(value).toBeCloseTo(0.3);

// Strings
expect('team').toMatch(/I/);
expect('Christoph').toContain('stop');

// Arrays
expect(['Alice', 'Bob']).toContain('Alice');
expect(array).toHaveLength(3);

// Exceptions
expect(() => functionThatThrows()).toThrow();
expect(() => functionThatThrows()).toThrow('specific error');
```

### Async Testing

```javascript
// Using async/await
it('should fetch data', async () => {
  const data = await fetchData();
  expect(data).toEqual({ id: 1, name: 'User' });
});

// Using promises
it('should resolve promise', () => {
  return expect(fetchData()).resolves.toEqual({ id: 1 });
});

it('should reject promise', () => {
  return expect(fetchError()).rejects.toThrow('Error message');
});
```

### Mocking

```javascript
import { vi } from 'vitest';

// Mock a module
vi.mock('../lib/database', () => ({
  getUser: vi.fn(() => ({ id: 1, name: 'John' }))
}));

// Mock a function
const mockFn = vi.fn();
mockFn.mockReturnValue(42);
mockFn.mockResolvedValue('async value');

// Spy on existing function
const spy = vi.spyOn(object, 'method');
expect(spy).toHaveBeenCalledWith(arg1, arg2);
expect(spy).toHaveBeenCalledTimes(1);
```

## Configuration

The `vitest.config.js` file controls test behavior:

```javascript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: 'coverage',
      exclude: [
        'node_modules/',
        'dist/',
        'coverage/',
        '**/*.config.js',
        '**/*.config.ts',
        '**/*.spec.ts',
        '**/*.test.ts'
      ],
      include: [
        'src/**/*.{js,ts,jsx,tsx}',
        'lib/**/*.{js,ts,jsx,tsx}'
      ],
      thresholds: {
        global: {
          branches: 75,
          functions: 80,
          lines: 80,
          statements: 80
        }
      },
      clean: true,
      all: true
    }
  }
});
```

### Configuration Options

- **provider**: Use 'v8' for optimal performance (default in modern Vitest)
- **reporter**: Array of report formats - 'text', 'json', 'html', 'lcov'
- **thresholds**: Minimum coverage percentages that must be met
- **exclude**: Files and patterns to exclude from coverage
- **include**: Files and patterns to include in coverage
- **all**: Collect coverage for all files, even those not touched by tests
- **clean**: Clean coverage report directories before each run

## Best Practices

1. **Test naming** - Use descriptive test names that explain what is being tested
2. **One assertion per test** - Keep tests focused on a single behavior
3. **Setup and teardown** - Use `beforeEach`, `afterEach` for common setup
4. **Mock external dependencies** - Don't make real API calls in unit tests
5. **Test edge cases** - Include tests for error conditions and boundaries

## Coverage Collection & Reporting

### Coverage Configuration

This project uses Vitest with v8 provider for coverage collection. The configuration is set up to:

- **Generate reports**: Text (CLI), JSON (CI), and HTML (detailed view)
- **Enforce thresholds**: Minimum coverage requirements prevent regressions
- **Exclude non-testable files**: Configuration files, test files, build outputs
- **Include source code**: All application source files in src/ and lib/

### Running Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# Generate coverage and open HTML report
npm run test:coverage:report

# Run tests with coverage in watch mode
npm run test:coverage:watch

# Run tests with coverage in UI
npm run test:coverage:ui

# Check only if coverage thresholds are met
npm run test:coverage:threshold

# View HTML report manually
open coverage/index.html
```

### Coverage Reports

After running `npm run test:coverage`:

1. **CLI Summary**: Text report shows overall coverage percentages
2. **HTML Report**: Open `coverage/index.html` for detailed file-by-file coverage
3. **JSON Report**: Machine-readable format for CI/CD integrations

### Coverage Thresholds

The project enforces minimum coverage thresholds:
- **Branches**: 75-85% (higher for critical backend code)
- **Functions**: 80-90%
- **Lines**: 80-90%
- **Statements**: 80-90%

If coverage falls below these thresholds, the build will fail.

### Improving Coverage

1. **Run coverage report**: `npm run test:coverage:report`
2. **Identify gaps**: Look for red uncovered lines in HTML report
3. **Write targeted tests**: Focus on uncovered branches and error paths
4. **Verify improvement**: Re-run coverage to confirm thresholds met

### Coverage Best Practices

1. **Test critical paths first**: Focus on business logic, error handling, edge cases
2. **Don't test trivial code**: Skip simple getters/setters, type definitions
3. **Use meaningful thresholds**: Balance coverage goals with development velocity
4. **Review coverage trends**: Monitor coverage changes over time, not just snapshots
5. **Exclude appropriately**: Don't include generated code, config files, or test utilities

### Project-Specific Coverage Templates

This project includes specialized coverage configurations for different project types:

- **Node.js Backend**: Higher thresholds for business logic and controllers
- **Frontend**: Moderate thresholds with DOM testing setup
- **Full-Stack**: Balanced approach for mixed client/server code
- **Monorepo**: Optimized for multi-package repositories

See `templates/coverage-templates/README.md` for detailed guidance on choosing the right configuration.

## Debugging Tests

```bash
# Run tests with Node debugger
node --inspect-brk ./node_modules/vitest/vitest.mjs --run

# Use console.log in tests (they will show in output)
it('debug test', () => {
  console.log('Debug value:', someVariable);
  expect(someVariable).toBe(expected);
});
```

## Common Issues

### "Cannot use import statement outside a module"
- Ensure `"type": "module"` is in package.json
- Use `.js` extension in imports

### "Module not found"
- Check relative import paths
- Ensure `.js` extension is included

### Tests timing out
- Increase timeout: `it('slow test', { timeout: 10000 }, async () => {})`
- Check for unresolved promises