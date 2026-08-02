# React Performance Optimization Guide

## When to Optimize

1. **Profile First**: Use React DevTools Profiler to identify bottlenecks
2. **Measure, Don't Guess**: Only optimize after identifying actual performance issues
3. **User Experience Focus**: Optimize for perceived performance, not just metrics

## Memoization Techniques

### React.memo
```javascript
const ExpensiveComponent = React.memo(function ExpensiveComponent({ data }) {
  return <div>{/* Expensive rendering */}</div>;
});

// Custom comparison function
const MemoComponent = React.memo(Component, (prevProps, nextProps) => {
  return prevProps.id === nextProps.id;
});
```

### useCallback Best Practices
```javascript
// Good: Stable reference for child components
const handleClick = useCallback((id) => {
  onItemClick(id);
}, [onItemClick]);

// Bad: Unnecessary memoization
const simpleCallback = useCallback(() => {
  console.log('clicked');
}, []); // This could be defined directly

// Good: Memoize expensive computations
const expensiveCallback = useCallback(() => {
  return expensiveCalculation(data);
}, [data]);
```

### useMemo Best Practices
```javascript
// Good: Expensive calculations
const filteredData = useMemo(() => {
  return data.filter(item => item.active).sort((a, b) => a.date - b.date);
}, [data]);

// Good: Prevent object recreation
const style = useMemo(() => ({
  color: theme.primary,
  fontSize: '16px'
}), [theme.primary]);

// Bad: Memoizing cheap operations
const doubled = useMemo(() => count * 2, [count]); // Just use count * 2 directly
```

## State Optimization

### State Colocation
```javascript
// Good: Keep state local
function UserProfile() {
  const [isEditing, setIsEditing] = useState(false);
  // State is kept where it's needed
}

// Avoid: Lifting state unnecessarily
function App() {
  const [isEditing, setIsEditing] = useState(false); // Unnecessary global state
  return <UserProfile isEditing={isEditing} onEdit={setIsEditing} />;
}
```

### State Normalization
```javascript
// Good: Normalized state
const [entities, setEntities] = useState({
  users: {
    '1': { id: '1', name: 'John' },
    '2': { id: '2', name: 'Jane' }
  },
  posts: {
    '101': { id: '101', authorId: '1', title: 'Hello' }
  }
});

// Avoid: Nested arrays
const [data, setData] = useState([
  {
    user: { id: '1', name: 'John' },
    posts: [{ id: '101', title: 'Hello' }]
  }
]);
```

## Component Optimization

### Component Splitting
```javascript
// Good: Split large components
function UserProfile({ user }) {
  return (
    <div>
      <UserInfo user={user} />
      <UserPosts posts={user.posts} />
      <UserSettings settings={user.settings} />
    </div>
  );
}

// Each component handles its own rendering logic
```

### Virtual Lists
```javascript
import { FixedSizeList as List } from 'react-window';

function VirtualizedList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      {items[index].name}
    </div>
  );

  return (
    <List
      height={600}
      itemCount={items.length}
      itemSize={50}
    >
      {Row}
    </List>
  );
}
```

## Effect Optimization

### Effect Dependencies
```javascript
// Good: Minimal dependencies
useEffect(() => {
  fetchUserData(userId);
}, [userId]); // Only depends on userId

// Bad: Missing dependencies
useEffect(() => {
  fetchUserData(userId);
}, []); // Missing userId dependency

// Good: Use useCallback to stabilize functions
const fetchData = useCallback(() => {
  fetchUserData(userId);
}, [userId]);

useEffect(() => {
  fetchData();
}, [fetchData]);
```

### Effect Cleanup
```javascript
useEffect(() => {
  const controller = new AbortController();

  fetchData(signal).then(data => {
    // Handle data
  });

  return () => {
    controller.abort(); // Cleanup
  };
}, [url]);
```

## Bundle Optimization

### Code Splitting
```javascript
import { lazy, Suspense } from 'react';

const LazyComponent = lazy(() => import('./LazyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}
```

### Dynamic Imports
```javascript
const loadChart = async () => {
  const { Chart } = await import('./Chart');
  // Use chart
};
```

## Image and Asset Optimization

### Image Lazy Loading
```javascript
function LazyImage({ src, alt }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef}>
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          style={{ opacity: isLoaded ? 1 : 0 }}
        />
      )}
    </div>
  );
}
```

## Performance Monitoring

### React DevTools Profiler
```javascript
// Profile component wraps
import { Profiler } from 'react';

function onRenderCallback(id, phase, actualDuration) {
  console.log('Component:', id);
  console.log('Phase:', phase);
  console.log('Duration:', actualDuration);
}

function App() {
  return (
    <Profiler id="UserProfile" onRender={onRenderCallback}>
      <UserProfile />
    </Profiler>
  );
}
```

### Web Vitals
```javascript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

## Performance Anti-Patterns

### Avoid These
```javascript
// Bad: Inline functions in render
function BadComponent({ items }) {
  return items.map(item => (
    <button onClick={() => handleClick(item.id)}>
      {item.name}
    </button>
  ));
}

// Good: Use useCallback
function GoodComponent({ items }) {
  const handleClick = useCallback((id) => {
    // Handle click
  }, []);

  return items.map(item => (
    <button onClick={() => handleClick(item.id)}>
      {item.name}
    </button>
  ));
}

// Bad: Creating objects in render
function BadComponent() {
  return (
    <div style={{ color: 'red', fontSize: '16px' }}>
      Content
    </div>
  );
}

// Good: Use useMemo for styles
function GoodComponent() {
  const style = useMemo(() => ({
    color: 'red',
    fontSize: '16px'
  }), []);

  return <div style={style}>Content</div>;
}
```

## Testing Performance

### Performance Tests
```javascript
import { render } from '@testing-library/react';
import { performance } from 'perf_hooks';

describe('Performance Tests', () => {
  it('renders large list quickly', () => {
    const items = Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`
    }));

    const start = performance.now();
    render(<VirtualList items={items} />);
    const end = performance.now();

    expect(end - start).toBeLessThan(100); // Should render in under 100ms
  });
});
```

## Monitoring Tools

### React DevTools
- Component Profiler
- Component tree inspection
- Props and state viewer

### Browser DevTools
- Performance tab
- Memory tab
- Network tab

### Third-party Tools
- Sentry for performance monitoring
- Lighthouse for audit scores
- Bundle analyzer for size analysis