---
name: react-development
description: Systematic approach to building React components with hooks, state management, and best practices. Use when creating React components, implementing hooks patterns, optimizing performance, or architecting React applications.
---

# React Development

Systematic approach to building React components with hooks, state management, and best practices. Use when creating React components, implementing hooks patterns, optimizing performance, or architecting React applications.

## Common Queries

Example user requests that should trigger this skill:

1. "Create a React component for displaying user profiles"
2. "Add state management to this form component"
3. "Implement a custom hook for fetching data"
4. "Optimize this component with useMemo"
5. "How do I handle form validation in React?"
6. "Build a reusable modal component"
7. "Add pagination to this list component"
8. "Fix the re-rendering issue in this component"

## When to Use This Skill

Use this skill for React-related tasks:
- Building new React components with hooks
- Implementing form handling with useState
- Setting up data fetching with useEffect
- Creating custom hooks for reusable logic
- Optimizing component performance with useCallback/useMemo
- Managing DOM interactions with useRef
- Setting up local storage integration
- Component architecture and state design

## Core React Hooks Patterns

### useState for Form Handling

#### Basic Form State
```javascript
import { useState } from 'react';

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Name"
      />
      <input
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
      />
      <textarea
        name="message"
        value={formData.message}
        onChange={handleChange}
        placeholder="Message"
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

#### Form with Validation
```javascript
import { useState } from 'react';

function ValidatedForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'email':
        if (!value) {
          newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          newErrors.email = 'Email is invalid';
        } else {
          delete newErrors.email;
        }
        break;
      case 'password':
        if (!value) {
          newErrors.password = 'Password is required';
        } else if (value.length < 8) {
          newErrors.password = 'Password must be at least 8 characters';
        } else {
          delete newErrors.password;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const isValid = Object.keys(errors).length === 0 &&
                  Object.values(touched).some(Boolean);

  return (
    <form>
      <input
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Email"
      />
      {errors.email && touched.email && (
        <span className="error">{errors.email}</span>
      )}

      <input
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Password"
      />
      {errors.password && touched.password && (
        <span className="error">{errors.password}</span>
      )}

      <button type="submit" disabled={!isValid}>
        Submit
      </button>
    </form>
  );
}
```

### useEffect for Data Fetching

#### Basic Data Fetching
```javascript
import { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/${userId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }

        const userData = await response.json();
        setUser(userData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>No user found</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

#### Data Fetching with Cleanup
```javascript
import { useState, useEffect } from 'react';

function SearchResults({ query }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [controller, setController] = useState(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const abortController = new AbortController();
    setController(abortController);

    const search = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: abortController.signal
        });

        if (!response.ok) {
          throw new Error('Search failed');
        }

        const data = await response.json();
        setResults(data.results);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Search error:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(search, 300);

    return () => {
      clearTimeout(timeoutId);
      abortController.abort();
    };
  }, [query]);

  return (
    <div>
      {loading && <div>Searching...</div>}
      <ul>
        {results.map(result => (
          <li key={result.id}>{result.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

#### Real-time Data with Polling
```javascript
import { useState, useEffect, useRef } from 'react';

function StockTicker({ symbol }) {
  const [price, setPrice] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch(`/api/stocks/${symbol}/price`);
        const data = await response.json();
        setPrice(data.price);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Failed to fetch stock price:', error);
      }
    };

    // Initial fetch
    fetchPrice();

    // Set up polling every 5 seconds
    intervalRef.current = setInterval(fetchPrice, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [symbol]);

  return (
    <div>
      <h2>{symbol}</h2>
      <p>Price: ${price?.toFixed(2)}</p>
      {lastUpdate && (
        <p>Last updated: {lastUpdate.toLocaleTimeString()}</p>
      )}
    </div>
  );
}
```

### useCallback for Event Handlers

#### Optimized Event Handlers
```javascript
import { useState, useCallback, memo } from 'react';

const ListItem = memo(({ item, onSelect, onDelete }) => {
  console.log(`Rendering ${item.id}`);

  return (
    <div>
      <span>{item.name}</span>
      <button onClick={() => onSelect(item)}>Select</button>
      <button onClick={() => onDelete(item.id)}>Delete</button>
    </div>
  );
});

function ItemList() {
  const [items, setItems] = useState([
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' }
  ]);

  const [selectedItem, setSelectedItem] = useState(null);

  const handleSelect = useCallback((item) => {
    setSelectedItem(item);
    console.log('Selected:', item);
  }, []);

  const handleDelete = useCallback((id) => {
    setItems(prev => prev.filter(item => item.id !== id));
    console.log('Deleted:', id);
  }, []);

  return (
    <div>
      {selectedItem && (
        <div>Selected: {selectedItem.name}</div>
      )}
      {items.map(item => (
        <ListItem
          key={item.id}
          item={item}
          onSelect={handleSelect}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
```

#### Complex Event Handler with Dependencies
```javascript
import { useState, useCallback } from 'react';

function AdvancedSearch({ onSearch }) {
  const [filters, setFilters] = useState({
    query: '',
    category: '',
    minPrice: '',
    maxPrice: ''
  });

  const handleFilterChange = useCallback((field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSearch = useCallback(() => {
    // Validate and prepare search params
    const searchParams = Object.entries(filters)
      .filter(([_, value]) => value !== '')
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});

    onSearch(searchParams);
  }, [filters, onSearch]);

  const handleReset = useCallback(() => {
    setFilters({
      query: '',
      category: '',
      minPrice: '',
      maxPrice: ''
    });
  }, []);

  return (
    <div>
      <input
        placeholder="Search..."
        value={filters.query}
        onChange={(e) => handleFilterChange('query', e.target.value)}
      />

      <select
        value={filters.category}
        onChange={(e) => handleFilterChange('category', e.target.value)}
      >
        <option value="">All Categories</option>
        <option value="electronics">Electronics</option>
        <option value="clothing">Clothing</option>
      </select>

      <input
        type="number"
        placeholder="Min Price"
        value={filters.minPrice}
        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
      />

      <input
        type="number"
        placeholder="Max Price"
        value={filters.maxPrice}
        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
      />

      <button onClick={handleSearch}>Search</button>
      <button onClick={handleReset}>Reset</button>
    </div>
  );
}
```

### useMemo for Expensive Computations

#### Data Processing and Filtering
```javascript
import { useState, useMemo } from 'react';

function ProductList({ products }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterCategory, setFilterCategory] = useState('all');

  const filteredAndSortedProducts = useMemo(() => {
    console.log('Processing products...');

    // Filter products
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, searchTerm, sortBy, filterCategory]);

  const statistics = useMemo(() => {
    if (filteredAndSortedProducts.length === 0) {
      return { count: 0, avgPrice: 0, maxPrice: 0, minPrice: 0 };
    }

    const prices = filteredAndSortedProducts.map(p => p.price);
    return {
      count: filteredAndSortedProducts.length,
      avgPrice: prices.reduce((a, b) => a + b, 0) / prices.length,
      maxPrice: Math.max(...prices),
      minPrice: Math.min(...prices)
    };
  }, [filteredAndSortedProducts]);

  return (
    <div>
      <div className="filters">
        <input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="books">Books</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="name">Name</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Rating</option>
        </select>
      </div>

      <div className="statistics">
        <p>Products found: {statistics.count}</p>
        <p>Average price: ${statistics.avgPrice.toFixed(2)}</p>
        <p>Price range: ${statistics.minPrice} - ${statistics.maxPrice}</p>
      </div>

      <div className="product-list">
        {filteredAndSortedProducts.map(product => (
          <div key={product.id} className="product">
            <h3>{product.name}</h3>
            <p>Price: ${product.price}</p>
            <p>Rating: {product.rating}/5</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### Chart Data Computation
```javascript
import { useState, useMemo } from 'react';

function SalesChart({ salesData }) {
  const [timeRange, setTimeRange] = useState('month');
  const [chartType, setChartType] = useState('line');

  const chartData = useMemo(() => {
    console.log('Computing chart data...');

    // Group sales data by time range
    const groupedData = salesData.reduce((acc, sale) => {
      const date = new Date(sale.date);
      let key;

      switch (timeRange) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'year':
          key = date.getFullYear().toString();
          break;
        default:
          key = date.toISOString().split('T')[0];
      }

      if (!acc[key]) {
        acc[key] = { date: key, total: 0, count: 0 };
      }

      acc[key].total += sale.amount;
      acc[key].count += 1;

      return acc;
    }, {});

    return Object.values(groupedData).sort((a, b) => a.date.localeCompare(b.date));
  }, [salesData, timeRange]);

  const chartStatistics = useMemo(() => {
    if (chartData.length === 0) return null;

    const totals = chartData.map(d => d.total);
    const maxTotal = Math.max(...totals);
    const minTotal = Math.min(...totals);
    const avgTotal = totals.reduce((a, b) => a + b, 0) / totals.length;

    return {
      maxTotal,
      minTotal,
      avgTotal,
      totalSales: totals.reduce((a, b) => a + b, 0),
      growthRate: chartData.length > 1
        ? ((totals[totals.length - 1] - totals[0]) / totals[0]) * 100
        : 0
    };
  }, [chartData]);

  return (
    <div>
      <div className="chart-controls">
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option value="day">Daily</option>
          <option value="week">Weekly</option>
          <option value="month">Monthly</option>
          <option value="year">Yearly</option>
        </select>

        <select
          value={chartType}
          onChange={(e) => setChartType(e.target.value)}
        >
          <option value="line">Line Chart</option>
          <option value="bar">Bar Chart</option>
          <option value="area">Area Chart</option>
        </select>
      </div>

      {chartStatistics && (
        <div className="chart-stats">
          <p>Total Sales: ${chartStatistics.totalSales.toLocaleString()}</p>
          <p>Average: ${chartStatistics.avgTotal.toFixed(2)}</p>
          <p>Growth: {chartStatistics.growthRate.toFixed(1)}%</p>
          <p>Range: ${chartStatistics.minTotal} - ${chartStatistics.maxTotal}</p>
        </div>
      )}

      <div className="chart-container">
        {/* Chart rendering component would go here */}
        <p>Chart data points: {chartData.length}</p>
      </div>
    </div>
  );
}
```

### useRef for DOM Access

#### Focus Management
```javascript
import { useRef, useEffect } from 'react';

function SearchForm() {
  const searchInputRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Auto-focus search input on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const handleClear = () => {
    setSearchTerm('');
    searchInputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <div className="search-form">
      <input
        ref={searchInputRef}
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      {searchTerm && (
        <button onClick={handleClear}>Clear</button>
      )}
    </div>
  );
}
```

#### Measurement and Dimensions
```javascript
import { useRef, useState, useEffect } from 'react';

function ResizeObserver() {
  const elementRef = useRef(null);
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0
  });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div>
      <div
        ref={elementRef}
        style={{
          width: '100%',
          height: '200px',
          border: '2px solid #ccc',
          padding: '20px',
          resize: 'both',
          overflow: 'auto'
        }}
      >
        <p>Resize this element!</p>
        <p>Width: {dimensions.width}px</p>
        <p>Height: {dimensions.height}px</p>
      </div>
    </div>
  );
}
```

#### Canvas Drawing
```javascript
import { useRef, useEffect, useState } from 'react';

function DrawingCanvas() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(2);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Set initial drawing style
    context.lineCap = 'round';
    context.lineJoin = 'round';
  }, []);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    setIsDrawing(true);
    context.beginPath();
    context.moveTo(
      e.clientX - rect.left,
      e.clientY - rect.top
    );
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    context.strokeStyle = color;
    context.lineWidth = brushSize;
    context.lineTo(
      e.clientX - rect.left,
      e.clientY - rect.top
    );
    context.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div>
      <div className="drawing-controls">
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
        <input
          type="range"
          min="1"
          max="20"
          value={brushSize}
          onChange={(e) => setBrushSize(e.target.value)}
        />
        <span>Brush size: {brushSize}px</span>
        <button onClick={clearCanvas}>Clear</button>
      </div>

      <canvas
        ref={canvasRef}
        style={{
          border: '1px solid #ccc',
          cursor: 'crosshair',
          display: 'block'
        }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
    </div>
  );
}
```

#### Scroll Position Tracking
```javascript
import { useRef, useState, useEffect } from 'react';

function ScrollProgress() {
  const containerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let scrollTimeout;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
      setScrollProgress(Math.max(0, Math.min(100, progress)));

      setIsScrolling(true);

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  const scrollToTop = () => {
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    const container = containerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div>
      <div className="scroll-progress-bar">
        <div
          style={{
            width: `${scrollProgress}%`,
            transition: isScrolling ? 'none' : 'width 0.3s ease'
          }}
        />
      </div>

      <div className="scroll-controls">
        <span>Progress: {scrollProgress.toFixed(1)}%</span>
        <button onClick={scrollToTop}>Top</button>
        <button onClick={scrollToBottom}>Bottom</button>
      </div>

      <div
        ref={containerRef}
        style={{
          height: '400px',
          overflow: 'auto',
          border: '1px solid #ccc',
          padding: '20px'
        }}
      >
        {Array.from({ length: 50 }, (_, i) => (
          <p key={i}>
            Section {i + 1}: Lorem ipsum dolor sit amet, consectetur
            adipiscing elit. Sed do eiusmod tempor incididunt ut labore
            et dolore magna aliqua.
          </p>
        ))}
      </div>
    </div>
  );
}
```

## Custom Hooks

### API Call Hook
```javascript
import { useState, useEffect, useCallback } from 'react';

function useApiCall(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);

  const execute = useCallback(async (customUrl = url, customOptions = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(customUrl, {
        ...options,
        ...customOptions,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
          ...customOptions.headers
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      setLastFetched(new Date());
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  const refetch = useCallback(() => {
    return execute();
  }, [execute]);

  useEffect(() => {
    if (url && options.autoExecute !== false) {
      execute();
    }
  }, [execute, url, options.autoExecute]);

  return {
    data,
    loading,
    error,
    execute,
    refetch,
    lastFetched
  };
}

// Usage example
function UserProfile({ userId }) {
  const { data: user, loading, error, refetch } = useApiCall(
    `/api/users/${userId}`,
    { autoExecute: true }
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>{user?.name}</h1>
      <p>{user?.email}</p>
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

### Local Storage Hook
```javascript
import { useState, useEffect } from 'react';

function useLocalStorage(key, initialValue) {
  // Get stored value from localStorage or use initialValue
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when state changes
  const setValue = (value) => {
    try {
      // Allow value to be a function for functional updates
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Sync with localStorage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key) {
        try {
          setStoredValue(e.newValue ? JSON.parse(e.newValue) : initialValue);
        } catch (error) {
          console.error(`Error parsing localStorage change for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue]);

  // Remove item from localStorage
  const removeValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue];
}

// Usage examples
function ThemeSwitcher() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className={theme}>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}

function ShoppingCart() {
  const [cart, setCart] = useLocalStorage('shopping-cart', []);

  const addToCart = (item) => {
    setCart(prevCart => [...prevCart, { ...item, id: Date.now() }]);
  };

  const removeFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <div>
      <h2>Shopping Cart ({cart.length} items)</h2>
      <ul>
        {cart.map(item => (
          <li key={item.id}>
            {item.name} - ${item.price}
            <button onClick={() => removeFromCart(item.id)}>Remove</button>
          </li>
        ))}
      </ul>
      <button onClick={clearCart}>Clear Cart</button>
    </div>
  );
}
```

### Debounced Value Hook
```javascript
import { useState, useEffect } from 'react';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Usage example
function SearchWithDebounce() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: searchResults, loading } = useApiCall(
    debouncedSearchTerm
      ? `/api/search?q=${encodeURIComponent(debouncedSearchTerm)}`
      : null
  );

  return (
    <div>
      <input
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {loading && <p>Searching...</p>}
      {searchResults && (
        <ul>
          {searchResults.map(result => (
            <li key={result.id}>{result.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### Pagination Hook
```javascript
import { useState, useCallback, useMemo } from 'react';

function usePagination(items, itemsPerPage = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  }, [items, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(items.length / itemsPerPage);
  }, [items.length, itemsPerPage]);

  const goToPage = useCallback((page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const firstPage = useCallback(() => {
    goToPage(1);
  }, [goToPage]);

  const lastPage = useCallback(() => {
    goToPage(totalPages);
  }, [goToPage, totalPages]);

  const pageNumbers = useMemo(() => {
    const pages = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage <= 3) {
        for (let i = 2; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  }, [totalPages, currentPage]);

  const resetPagination = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    currentPage,
    totalPages,
    paginatedItems,
    pageNumbers,
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    resetPagination,
    canGoNext: currentPage < totalPages,
    canGoPrev: currentPage > 1
  };
}

// Usage example
function DataList({ data }) {
  const {
    currentPage,
    totalPages,
    paginatedItems,
    pageNumbers,
    goToPage,
    nextPage,
    prevPage,
    canGoNext,
    canGoPrev
  } = usePagination(data, 5);

  return (
    <div>
      <div className="data-list">
        {paginatedItems.map(item => (
          <div key={item.id} className="data-item">
            <h3>{item.name}</h3>
            <p>{item.description}</p>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button
          onClick={prevPage}
          disabled={!canGoPrev}
        >
          Previous
        </button>

        {pageNumbers.map((pageNum, index) => (
          pageNum === '...' ? (
            <span key={`ellipsis-${index}`}>...</span>
          ) : (
            <button
              key={pageNum}
              onClick={() => goToPage(pageNum)}
              className={currentPage === pageNum ? 'active' : ''}
            >
              {pageNum}
            </button>
          )
        ))}

        <button
          onClick={nextPage}
          disabled={!canGoNext}
        >
          Next
        </button>
      </div>

      <div className="pagination-info">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
}
```

## Best Practices

### Performance Optimization

1. **Use useCallback for functions passed to child components**
2. **Use useMemo for expensive calculations**
3. **Avoid premature optimization - profile first**
4. **Keep dependencies arrays accurate and minimal**

### State Management

1. **Keep state as local as possible**
2. **Use multiple useState hooks instead of single large object**
3. **Lift state up when needed for component communication**
4. **Consider useReducer for complex state logic**

### Effect Management

1. **Always include cleanup functions**
2. **Specify all dependencies accurately**
3. **Use custom hooks to extract complex effect logic**
4. **Be careful with infinite loops in dependencies**

### Component Design

1. **Keep components small and focused**
2. **Use composition over inheritance**
3. **Implement proper error boundaries**
4. **Add loading and error states**

## Common Patterns

### Compound Components
```javascript
import { useState, createContext, useContext } from 'react';

const TabsContext = createContext();

function Tabs({ children, defaultTab = 0 }) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

function TabList({ children }) {
  return <div className="tab-list">{children}</div>;
}

function Tab({ children, index }) {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  const isActive = activeTab === index;

  return (
    <button
      className={`tab ${isActive ? 'active' : ''}`}
      onClick={() => setActiveTab(index)}
    >
      {children}
    </button>
  );
}

function TabPanels({ children }) {
  return <div className="tab-panels">{children}</div>;
}

function TabPanel({ children, index }) {
  const { activeTab } = useContext(TabsContext);
  const isActive = activeTab === index;

  return isActive ? <div className="tab-panel">{children}</div> : null;
}

// Usage
function App() {
  return (
    <Tabs>
      <TabList>
        <Tab index={0}>Profile</Tab>
        <Tab index={1}>Settings</Tab>
        <Tab index={2}>Notifications</Tab>
      </TabList>
      <TabPanels>
        <TabPanel index={0}>Profile content</TabPanel>
        <TabPanel index={1}>Settings content</TabPanel>
        <TabPanel index={2}>Notifications content</TabPanel>
      </TabPanels>
    </Tabs>
  );
}
```

### Render Props Pattern
```javascript
import { useState, useEffect } from 'react';

function MouseTracker({ render }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return render(position);
}

// Usage
function App() {
  return (
    <MouseTracker
      render={({ x, y }) => (
        <div>
          <h1>Mouse Position</h1>
          <p>X: {x}, Y: {y}</p>
        </div>
      )}
    />
  );
}
```

## Testing React Components

### Component Testing with Vitest
```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import UserProfile from './UserProfile';

// Mock fetch
global.fetch = vi.fn();

describe('UserProfile', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('displays loading state initially', () => {
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
      expect(screen.getByText('Error: Failed to fetch')).toBeInTheDocument();
    });
  });
});
```

### Custom Hook Testing
```javascript
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useApiCall } from './useApiCall';

global.fetch = vi.fn();

describe('useApiCall', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('initializes with correct default values', () => {
    const { result } = renderHook(() =>
      useApiCall('/api/test', { autoExecute: false })
    );

    expect(result.current.data).toBe(null);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('fetches data on execute', async () => {
    const mockData = { message: 'Success' };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    });

    const { result } = renderHook(() =>
      useApiCall('/api/test', { autoExecute: false })
    );

    act(() => {
      result.current.execute();
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });
});
```

## Resources

- [React Official Documentation](https://react.dev/)
- [React Hooks Reference](https://react.dev/reference/react)
- [React Patterns](https://reactpatterns.com/)
- [Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)