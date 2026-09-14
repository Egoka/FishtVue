---
name: playwright-testing
description: E2E testing with Playwright MCP using accessibility tree automation. Use for automated testing, form validation, user flow testing, regression testing, and accessibility verification.
---

# Playwright Testing Skill

## Browser Session Isolation

**`session_id` is required on every browser tool call.** Use `"primary"` for the entrypoint browser, or `create_browser_session` for isolation.

```
# For single-agent work — use the primary session:
session_id: "primary"

# For concurrent work — create an isolated session:
create_browser_session() → { session_id: "sess_0", ... }
# Pass session_id to all subsequent browser tool calls
# When done:
destroy_browser_session({ session_id: "sess_0" })
```

Concurrent usage of the **primary session** causes page state conflicts (navigations overwrite each other). Always create isolated sessions for parallel browser work.

Automate end-to-end testing using Playwright MCP with accessibility tree-based interactions for reliable, maintainable tests.

## When to Use This Skill

- End-to-end testing of web applications
- Form validation and submission testing
- User flow testing (login, checkout, etc.)
- Regression testing in CI/CD pipelines
- Accessibility verification and compliance testing
- Cross-browser testing (Chromium, Firefox, WebKit)
- Being orchestrated by qa-resolution-planner for systematic test campaigns

## Common Queries

Example user requests that should trigger this skill:

1. "Write an E2E test for the login flow"
2. "Automate the user registration journey"
3. "Create a test that verifies the checkout process"
4. "Test the form validation across different browsers"
5. "Set up regression tests for the dashboard"
6. "Verify accessibility compliance for the signup page"
7. "Record a test for the password reset flow"
8. "Add integration tests for the shopping cart"
9. "Plan E2E test campaign for my app"
10. "Create systematic E2E test coverage plan"
11. "Analyze routes for E2E testing"

## Key Difference from Chrome DevTools

**Playwright MCP uses accessibility tree, NOT screenshots/UIDs:**

| Feature | Chrome DevTools | Playwright |
|---------|----------------|------------|
| Element finding | UIDs from snapshot | Accessibility roles/names |
| Primary use | Debugging, live inspection | E2E testing, automation |
| Best for | Single-page interactions | Multi-page test flows |
| CI/CD | Requires browser visible | Headless by default |

## Tool Discovery

Tool names vary by environment: `mcp__playwright__*` (standard) or `mcp__mcp-proxy__*` (proxy mode).

**Discover tools:** `search_tools({ query: "playwright" })`

**Core capabilities:** Browser launch, page navigation, accessibility snapshot, element interaction, assertions, tracing, screenshots.

## Essential Workflow

### The Accessibility Tree Approach

**Unlike Chrome DevTools, Playwright uses accessibility tree for element identification:**

```javascript
// 1. Navigate to page
playwright_navigate({ url: "https://example.com" })

// 2. Get accessibility snapshot (NOT visual snapshot)
playwright_snapshot()
// Returns accessibility tree with roles:
// - role: "button", name: "Submit"
// - role: "textbox", name: "Email"
// - role: "link", name: "Sign up"

// 3. Interact using accessibility selectors
playwright_click({ role: "button", name: "Submit" })
playwright_fill({ role: "textbox", name: "Email", value: "test@example.com" })
```

### Step-by-Step Testing Flow

**Step 1: Discover Tools**
```javascript
search_tools({ query: "playwright" })
```

**Step 2: Launch Browser**
```javascript
// Tool name discovered via search_tools
playwright_launch({ headless: true })
```

**Step 3: Navigate**
```javascript
playwright_navigate({ url: "http://localhost:3000" })
```

**Step 4: Get Accessibility Tree**
```javascript
// This returns the accessibility tree, not a visual snapshot
playwright_snapshot()

// Example output:
// - document
//   - navigation
//     - link "Home"
//     - link "About"
//   - main
//     - heading "Welcome"
//     - form
//       - textbox "Email"
//       - textbox "Password"
//       - button "Login"
```

**Step 5: Interact via Accessibility**
```javascript
// Fill form using accessibility roles
playwright_fill({ role: "textbox", name: "Email", value: "user@test.com" })
playwright_fill({ role: "textbox", name: "Password", value: "password123" })

// Click using accessibility
playwright_click({ role: "button", name: "Login" })
```

**Step 6: Verify State**
```javascript
// Take new snapshot to verify state change
playwright_snapshot()
// Should show logged-in state
```

## Best Practices

### DO:

1. **Use accessibility selectors** - More reliable than CSS selectors
2. **Run headless in CI** - Faster, no display needed
3. **Enable tracing for failures** - Helps debug flaky tests
4. **Wait for navigation** - Don't assume instant page loads
5. **Snapshot before interacting** - Understand the accessibility tree
6. **Use descriptive accessibility names** - Makes selectors readable

### DON'T:

1. **Don't rely on visual coordinates** - Breaks on layout changes
2. **Don't hardcode timeouts** - Use proper waits
3. **Don't skip the accessibility snapshot** - You need it for selectors
4. **Don't mix with chrome-devtools** - Choose one per test flow
5. **Don't assume element visibility** - Check accessibility tree

### Headless Testing Best Practices

**For CI/CD environments:**

```javascript
// Launch in headless mode (default for CI)
playwright_launch({
  headless: true,
  // Chromium is most reliable for testing
  browser: "chromium"
})

// Set viewport for consistent tests
playwright_setViewport({ width: 1280, height: 720 })
```

**For local debugging:**

```javascript
// Launch with visible browser
playwright_launch({
  headless: false,
  slowMo: 100  // Slow down for visibility
})
```

## Common Patterns

### Login Flow Testing

```javascript
// Discover tools first
search_tools({ query: "playwright" })

// 1. Navigate to login
playwright_navigate({ url: "https://app.com/login" })

// 2. Get accessibility tree
playwright_snapshot()

// 3. Fill credentials
playwright_fill({ role: "textbox", name: "Email", value: "test@example.com" })
playwright_fill({ role: "textbox", name: "Password", value: "password123" })

// 4. Submit
playwright_click({ role: "button", name: "Sign in" })

// 5. Wait for navigation
playwright_waitForNavigation()

// 6. Verify logged in state
playwright_snapshot()
// Check for dashboard elements in accessibility tree
```

### Form Validation Testing

```javascript
// 1. Navigate to form
playwright_navigate({ url: "https://app.com/signup" })
playwright_snapshot()

// 2. Submit empty form
playwright_click({ role: "button", name: "Submit" })

// 3. Check for error states
playwright_snapshot()
// Accessibility tree should show error messages

// 4. Fill invalid data
playwright_fill({ role: "textbox", name: "Email", value: "not-an-email" })
playwright_click({ role: "button", name: "Submit" })

// 5. Verify validation error
playwright_snapshot()
// Should show "Invalid email" in accessibility tree
```

### Multi-Page Flow Testing

```javascript
// E-commerce checkout flow
// 1. Product page
playwright_navigate({ url: "https://shop.com/product/123" })
playwright_snapshot()
playwright_click({ role: "button", name: "Add to cart" })

// 2. Cart page
playwright_navigate({ url: "https://shop.com/cart" })
playwright_snapshot()
playwright_click({ role: "button", name: "Checkout" })

// 3. Checkout page
playwright_waitForNavigation()
playwright_snapshot()
// Fill shipping info...
```

### Accessibility Compliance Testing

```javascript
// Verify ARIA labels and roles
playwright_navigate({ url: "https://app.com" })
const snapshot = playwright_snapshot()

// The accessibility tree reveals:
// - Missing labels (unlabeled inputs)
// - Improper roles (div used as button)
// - Missing headings structure
// - Keyboard navigation issues

// Report findings to qa-engineer agent
```

## Tracing for Debugging

**Enable tracing to debug test failures:**

```javascript
// Start tracing before test
playwright_startTracing({ screenshots: true, snapshots: true })

// Run test steps...
playwright_navigate({ url: "https://app.com" })
playwright_click({ role: "button", name: "Submit" })

// Stop tracing and save
playwright_stopTracing({ path: "./traces/test-run.zip" })
```

**View trace:**
```bash
npx playwright show-trace traces/test-run.zip
```

## Integration with qa-engineer Agent

This skill is designed to work with the **qa-engineer** agent:

1. **qa-engineer** defines test scenarios and acceptance criteria
2. **playwright-testing** skill provides the technical execution
3. Results are reported back without attempting fixes

**Handoff pattern:**
```
qa-engineer agent:
  "Test login flow: verify email validation, error messages, successful login"

playwright-testing skill:
  - Execute test steps using accessibility tree
  - Capture results (pass/fail)
  - Record trace if failure
  - Return structured findings

qa-engineer agent:
  "Login form missing ARIA label on password field"
  "Validation error not announced to screen readers"
  [Does NOT attempt to fix - terminal agent]
```

## Integration with qa-resolution-planner Agent

For **systematic E2E test campaigns** (50+ test scenarios), use the **qa-resolution-planner** agent:

1. **qa-resolution-planner** analyzes routes and creates test orchestration plan
2. **qa-engineer** agents execute tests in parallel based on the plan
3. **playwright-testing** skill provides the technical execution for each agent

### When to Use qa-resolution-planner vs qa-engineer Directly

| Scenario | Use This Agent |
|----------|----------------|
| Single feature test, smoke test | qa-engineer |
| Full app E2E coverage, test campaigns (50+ tests) | qa-resolution-planner |
| Route coverage analysis, CI/CD test suite | qa-resolution-planner |

### Workflow Diagram

```
┌────────────────────────────────────────────────────────┐
│          E2E Test Campaign Workflow                    │
├────────────────────────────────────────────────────────┤
│  qa-resolution-planner                                 │
│  "Plan E2E test campaign for my app"                   │
│  - Analyze routes, identify scenarios                  │
│  - Create parallel execution plan                      │
│              ↓                                         │
│  qa-engineer (parallel swarm)                          │
│  [Agent1:Login] [Agent2:Checkout] [Agent3:Search] ...  │
│              ↓                                         │
│  playwright-testing skill                              │
│  - Accessibility tree navigation                       │
│  - Form filling, multi-page flows                      │
│  - Tracing and screenshots                             │
│              ↓                                         │
│  Test Results                                          │
│  - JSON report, coverage metrics, findings             │
└────────────────────────────────────────────────────────┘
```

### Trigger Phrases for qa-resolution-planner

- "Plan E2E test campaign for my app"
- "Create systematic E2E test coverage plan"
- "Analyze routes for E2E testing"

**Agent:** `.claude/agents/qa-resolution-planner.md`

## Troubleshooting

### Element Not Found

**Issue:** Accessibility selector doesn't match any element

**Solution:**
1. Take fresh accessibility snapshot
2. Verify exact role and name in tree
3. Check for typos in selector
4. Element may be dynamically loaded - add wait

### Test Flakiness

**Issue:** Test passes sometimes, fails other times

**Solution:**
1. Add explicit waits for navigation/content
2. Don't rely on timing - wait for specific elements
3. Use tracing to identify race conditions
4. Check for network-dependent content

### Headless vs Headed Differences

**Issue:** Test passes in headed mode, fails in headless

**Solution:**
1. Check viewport size (headless may have different default)
2. Verify fonts are loaded (may affect layout)
3. Check for browser-specific CSS

## Summary

1. **Discover tools first** - Use `search_tools({ query: "playwright" })`
2. **Use accessibility tree** - NOT visual snapshots or UIDs
3. **Snapshot before interacting** - Understand available elements
4. **Use accessibility selectors** - role + name, not CSS
5. **Run headless in CI** - Faster, more reliable
6. **Enable tracing** - Debug failures effectively
7. **Report, don't fix** - Let specialized agents handle fixes

**Key workflow:** Discover -> Launch -> Navigate -> Snapshot -> Interact -> Verify

**Remember:** Playwright MCP excels at E2E testing flows. For debugging or live inspection, use chrome-devtools instead.
