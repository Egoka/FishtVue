# React Hooks Cheatsheet

## Quick Reference

### useState
```javascript
const [state, setState] = useState(initialValue);

// Function update
setState(prevState => prevState + 1);

// Object update
setState(prevState => ({ ...prevState, key: newValue }));
```

### useEffect
```javascript
useEffect(() => {
  // Side effect logic
  return () => {
    // Cleanup function
  };
}, [dependencies]);
```

### useCallback
```javascript
const memoizedCallback = useCallback(
  () => {
    doSomething(a, b);
  },
  [a, b],
);
```

### useMemo
```javascript
const memoizedValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);
```

### useRef
```javascript
const refContainer = useRef(initialValue);

// Access DOM element
<input ref={refContainer} />

// Access current value
refContainer.current
```

## Common Patterns

### Form Handling
```javascript
const [formData, setFormData] = useState({
  username: '',
  email: '',
  password: ''
});

const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
};
```

### Data Fetching
```javascript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchData()
    .then(setData)
    .finally(() => setLoading(false));
}, [url]);
```

### Event Handlers
```javascript
const handleClick = useCallback((item) => {
  onItemSelect(item);
}, [onItemSelect]);
```

### Previous Value Hook
```javascript
function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
```

## Dependencies Array Rules

- Empty array `[]` - runs once on mount
- No array - runs on every render
- With dependencies - runs when any dependency changes

## Cleanup Functions

```javascript
useEffect(() => {
  const timer = setTimeout(() => {
    console.log('Timer fired');
  }, 1000);

  return () => clearTimeout(timer); // Cleanup
}, []);
```

## Custom Hook Template

```javascript
function useCustomHook(param1, param2) {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    // Effect logic
  }, [param1, param2]);

  const memoizedValue = useMemo(() => {
    // Expensive computation
  }, [state]);

  const memoizedCallback = useCallback(() => {
    // Callback logic
  }, [state]);

  return {
    state,
    memoizedValue,
    memoizedCallback
  };
}
```