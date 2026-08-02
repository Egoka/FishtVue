# React Testing Guide

## Testing Philosophy

1. **Test Behavior, Not Implementation**: Focus on what the component does, not how it does it
2. **User-Centric Tests**: Test from the user's perspective
3. **Accessibility Testing**: Ensure components are accessible
4. **Positive and Negative Cases**: Test both happy paths and error conditions

## Testing Tools

### Recommended Stack
```javascript
// package.json
{
  "devDependencies": {
    "@testing-library/react": "^13.0.0",
    "@testing-library/jest-dom": "^5.16.0",
    "@testing-library/user-event": "^14.0.0",
    "vitest": "^0.30.0",
    "jsdom": "^21.0.0"
  }
}
```

### Setup Configuration
```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    globals: true
  }
});
```

```javascript
// src/test/setup.js
import '@testing-library/jest-dom';
```

## Component Testing Patterns

### Basic Component Test
```javascript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Button from './Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    screen.getByRole('button').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Form Testing
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from './LoginForm';

describe('LoginForm', () => {
  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(<LoginForm onSubmit={handleSubmit} />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(handleSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });

  it('shows validation errors for invalid data', async () => {
    const user = userEvent.setup();

    render(<LoginForm onSubmit={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });
});
```

### Async Component Testing
```javascript
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UserProfile from './UserProfile';

// Mock fetch
global.fetch = vi.fn();

describe('UserProfile', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('shows loading state initially', () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ name: 'John Doe', email: 'john@example.com' })
    });

    render(<UserProfile userId="1" />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays user data after successful fetch', async () => {
    const mockUser = { name: 'John Doe', email: 'john@example.com' };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser
    });

    render(<UserProfile userId="1" />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });
  });

  it('displays error message when fetch fails', async () => {
    fetch.mockRejectedValueOnce(new Error('Failed to fetch'));

    render(<UserProfile userId="1" />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
```

## Custom Hook Testing

### Basic Hook Test
```javascript
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('initializes with default value', () => {
    const { result } = renderHook(() => useCounter());

    expect(result.current.count).toBe(0);
    expect(typeof result.current.increment).toBe('function');
    expect(typeof result.current.decrement).toBe('function');
    expect(typeof result.current.reset).toBe('function');
  });

  it('increments count', () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  it('decrements count', () => {
    const { result } = renderHook(() => useCounter(5));

    act(() => {
      result.current.decrement();
    });

    expect(result.current.count).toBe(4);
  });

  it('resets to initial value', () => {
    const { result } = renderHook(() => useCounter(10));

    act(() => {
      result.current.increment();
      result.current.increment();
      result.current.reset();
    });

    expect(result.current.count).toBe(10);
  });
});
```

### Async Hook Test
```javascript
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useApiCall } from './useApiCall';

global.fetch = vi.fn();

describe('useApiCall', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('fetches data successfully', async () => {
    const mockData = { message: 'Success' };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    });

    const { result } = renderHook(() => useApiCall('/api/test'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBe(null);
    });
  });

  it('handles fetch errors', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useApiCall('/api/test'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Network error');
      expect(result.current.data).toBe(null);
    });
  });

  it('can refetch data', async () => {
    const mockData1 = { message: 'First call' };
    const mockData2 = { message: 'Second call' };

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockData1
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockData2
      });

    const { result } = renderHook(() => useApiCall('/api/test', { autoExecute: false }));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.data).toEqual(mockData1);

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.data).toEqual(mockData2);
  });
});
```

## Integration Testing

### Multi-Component Integration
```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App Integration', () => {
  it('completes user registration flow', async () => {
    const user = userEvent.setup();

    render(<App />);

    // Navigate to registration
    await user.click(screen.getByRole('link', { name: /register/i }));

    // Fill out form
    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');

    // Submit form
    await user.click(screen.getByRole('button', { name: /register/i }));

    // Verify success
    await waitFor(() => {
      expect(screen.getByText(/registration successful/i)).toBeInTheDocument();
      expect(screen.getByText(/welcome john doe/i)).toBeInTheDocument();
    });
  });
});
```

### API Integration Testing
```javascript
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import TodoList from './TodoList';

const server = setupServer(
  rest.get('/api/todos', (req, res, ctx) => {
    return res(ctx.json([
      { id: 1, text: 'Learn React', completed: false },
      { id: 2, text: 'Write tests', completed: true }
    ]));
  }),
  rest.post('/api/todos', (req, res, ctx) => {
    return res(ctx.json({ id: 3, text: req.body.text, completed: false }));
  })
);

describe('TodoList API Integration', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('loads and displays todos', async () => {
    render(<TodoList />);

    await waitFor(() => {
      expect(screen.getByText('Learn React')).toBeInTheDocument();
      expect(screen.getByText('Write tests')).toBeInTheDocument();
    });
  });

  it('adds new todo', async () => {
    render(<TodoList />);

    await userEvent.type(screen.getByPlaceholderText(/add new todo/i), 'New task');
    await userEvent.click(screen.getByRole('button', { name: /add/i }));

    await waitFor(() => {
      expect(screen.getByText('New task')).toBeInTheDocument();
    });
  });
});
```

## Mocking Strategies

### Component Mocking
```javascript
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import UserProfile from './UserProfile';

// Mock child component
vi.mock('./UserAvatar', () => ({
  default: ({ userId }) => <div data-testid="user-avatar">{userId}</div>
}));

// Mock custom hook
vi.mock('./useUser', () => ({
  useUser: () => ({
    user: { id: '1', name: 'John Doe' },
    loading: false,
    error: null
  })
}));

describe('UserProfile with mocks', () => {
  it('renders mocked components', () => {
    render(<UserProfile userId="1" />);

    expect(screen.getByTestId('user-avatar')).toHaveTextContent('1');
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

### API Mocking
```javascript
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import DataFetcher from './DataFetcher';

describe('DataFetcher with API mocking', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('handles successful API response', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({ data: 'test data' })
    };

    fetch.mockResolvedValueOnce(mockResponse);

    render(<DataFetcher url="/api/test" />);

    await waitFor(() => {
      expect(screen.getByText('test data')).toBeInTheDocument();
    });
  });

  it('handles API error', async () => {
    fetch.mockRejectedValueOnce(new Error('API Error'));

    render(<DataFetcher url="/api/test" />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
```

## Accessibility Testing

### Accessibility Assertions
```javascript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Form from './Form';

describe('Form Accessibility', () => {
  it('has proper form labels', () => {
    render(<Form />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('provides error descriptions', () => {
    render(<Form error="Invalid email format" />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Invalid email format')).toBeInTheDocument();
  });

  it('has proper ARIA attributes', () => {
    render(<Form isLoading={true} />);

    expect(screen.getByRole('button', { name: /submit/i })).toHaveAttribute('aria-disabled', 'true');
  });
});
```

### Automated Accessibility Testing
```javascript
import { render, axe } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('Accessibility', () => {
  it('should not have any accessibility violations', async () => {
    const { container } = render(<App />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
```

## Test Utilities

### Custom Render Function
```javascript
// src/test/utils.js
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './ThemeContext';

const AllTheProviders = ({ children }) => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </BrowserRouter>
  );
};

const customRender = (ui, options = {}) =>
  render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

### Test Helpers
```javascript
// src/test/helpers.js
import userEvent from '@testing-library/user-event';

export const fillForm = async (fields, buttonLabel) => {
  const user = userEvent.setup();

  for (const [label, value] of Object.entries(fields)) {
    await user.type(screen.getByLabelText(new RegExp(label, 'i')), value);
  }

  if (buttonLabel) {
    await user.click(screen.getByRole('button', { name: new RegExp(buttonLabel, 'i') }));
  }
};

export const waitForElement = (text) =>
  waitFor(() => screen.getByText(new RegExp(text, 'i')));
```

## Best Practices

1. **Use findBy for async operations**: `screen.findByText()` instead of `screen.getByText()`
2. **Mock external dependencies**: APIs, third-party libraries
3. **Test user interactions**: Use `userEvent` over `fireEvent` for more realistic interactions
4. **Keep tests focused**: One behavior per test
5. **Use descriptive test names**: Should describe what the test does
6. **Test error states**: Don't just test happy paths
7. **Use semantic queries**: Prefer `getByRole`, `getByLabelText` over `getByTestId`
8. **Avoid testing implementation details**: Focus on behavior, not internal state

## Common Testing Scenarios

### Component Lifecycle
```javascript
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LifecycleComponent from './LifecycleComponent';

describe('LifecycleComponent', () => {
  it('calls effect on mount', () => {
    const onMount = vi.fn();

    render(<LifecycleComponent onMount={onMount} />);

    expect(onMount).toHaveBeenCalledTimes(1);
  });

  it('calls cleanup on unmount', () => {
    const onUnmount = vi.fn();
    const { unmount } = render(<LifecycleComponent onUnmount={onUnmount} />);

    unmount();

    expect(onUnmount).toHaveBeenCalledTimes(1);
  });
});
```

### Error Boundaries
```javascript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ErrorBoundary from './ErrorBoundary';

describe('ErrorBoundary', () => {
  // Suppress console errors for this test
  const originalError = console.error;
  beforeAll(() => {
    console.error = vi.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('catches and displays errors', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });
});
```