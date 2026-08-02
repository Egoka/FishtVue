---
name: chrome-devtools
description: Browser automation and testing using Chrome DevTools MCP. Use when automating browser tasks, testing web apps, debugging frontend issues, taking screenshots, analyzing performance, or scraping web content.
---

# Chrome DevTools Skill

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

Automate browser interactions, test web applications, debug frontend issues, and analyze performance using the Chrome DevTools MCP.

## When to Use This Skill

- Automating browser tasks (form filling, clicking, navigation)
- Testing web application workflows
- Taking screenshots of pages or elements
- Debugging console errors and network requests
- Analyzing page performance
- Scraping web content
- Testing responsive designs

## Common Queries

Example user requests that should trigger this skill:

1. "Take a screenshot of the current page"
2. "Click on the submit button"
3. "Check for console errors in the browser"
4. "Navigate to localhost:3000 and fill the login form"
5. "Debug why this page is loading slowly"
6. "Inspect the network requests on this page"
7. "What's the current page title?"
8. "Scroll down and take a full-page screenshot"

## ⚠️ CRITICAL WARNING - Screenshot Bug

**This bug can make your entire conversation unusable. Read this carefully.**

### The Problem

The chrome-devtools MCP server has a critical bug where PNG screenshots are incorrectly labeled as `image/jpeg`. Once this malformed image enters the conversation history, **every subsequent message fails** with:

```
API Error: 400
Image does not match the provided media type image/jpeg
```

You'll be stuck in an infinite error loop. The only fix is to **restart Claude Code entirely**.

### The Solution: ALWAYS Save to File

**NEVER take screenshots without specifying `filePath`:**

```javascript
// ✅ SAFE - Saves to file, no conversation pollution
// Tool name varies by environment (see Tool Discovery section below)
screenshot_tool({
  format: "png",
  filePath: "./screenshots/page.png"
})

// ✅ SAFE - Dynamic filename
screenshot_tool({
  format: "png",
  filePath: `./screenshots/screenshot-${Date.now()}.png`
})

// ❌ DANGEROUS - Will break your session
screenshot_tool({
  format: "png"
})
```

### If You Absolutely Need Inline Screenshots

Use JPEG format (appears less affected by the bug):

```javascript
// Safer for inline (but still risky)
screenshot_tool({
  format: "jpeg",
  quality: 90
})
```

### If You Get Stuck in the Error Loop

1. **Stop sending messages** - They will all fail
2. **Exit Claude Code** - `Ctrl+C` or close terminal
3. **Restart Claude Code** - Start fresh conversation
4. **Don't repeat the mistake** - Always use `filePath`

### Why This Matters

This isn't just an inconvenience - it **completely breaks Claude Code** until restart. You'll lose:
- Current conversation context
- Any work in progress
- Time trying to debug the error

**Always use `filePath` for screenshots. No exceptions.**

## Tool Discovery

**IMPORTANT: Tool names vary by environment configuration.**

Chrome DevTools capabilities may be exposed through different tool name prefixes depending on your MCP server setup:

- **Standard mode:** `mcp__chrome-devtools__*` (direct access to server)
- **Proxy mode:** `mcp__mcp-proxy__*` (access through proxy server)

### How to Discover Available Tools

**Always use `search_tools` to find the correct tool names for your environment:**

```javascript
// Search for Chrome DevTools browser automation capabilities
search_tools({ query: "chrome devtools browser" })

// Search for specific capabilities
search_tools({ query: "screenshot capture" })
search_tools({ query: "page navigation" })
search_tools({ query: "element interaction click fill" })
```

### Core Capabilities to Search For

When working with Chrome DevTools, search for these major capability categories:

1. **Page Content Capture** - Get page text with element UIDs for interaction
2. **Visual Screenshot** - Capture page images (ALWAYS use `filePath` parameter)
3. **Page Navigation** - Navigate URLs, reload, go back/forward
4. **Element Interaction** - Click elements, fill forms, type input
5. **Script Execution** - Run JavaScript in the page context
6. **Console & Network Analysis** - Debug console errors, network requests
7. **Performance Monitoring** - Trace performance, Core Web Vitals
8. **Tab Management** - List, switch, create, close browser tabs
9. **Page Configuration** - Resize viewport, emulate network conditions

### Finding Specialized Tools

For advanced capabilities, search with specific keywords:

```javascript
// Performance tools
search_tools({ query: "performance trace web vitals" })

// Network debugging
search_tools({ query: "network requests xhr fetch" })

// Console debugging
search_tools({ query: "console messages errors" })

// Dialog handling
search_tools({ query: "dialog alert confirm prompt" })
```

### Example: Discovering Screenshot Tool

```javascript
// 1. Search for screenshot capability
search_tools({ query: "screenshot capture" })

// Results might show:
// - mcp__chrome-devtools__take_screenshot (standard mode)
// - mcp__mcp-proxy__take_screenshot (proxy mode)

// 2. Use the discovered tool with REQUIRED filePath
discovered_screenshot_tool({
  format: "png",
  filePath: "./screenshots/page.png"
})
```

**Note:** The workflows and examples below use generic capability names like `take_snapshot`, `navigate_page`, etc. In practice, you'll use the actual tool name discovered via `search_tools` (e.g., `mcp__chrome-devtools__take_snapshot` or `mcp__mcp-proxy__take_snapshot`).

## Core Capabilities Overview

**Note:** Use `search_tools` to find the actual tool names in your environment. Tool names shown below are examples and may have different prefixes (`mcp__chrome-devtools__*` or `mcp__mcp-proxy__*`).

| Capability | Purpose | Search Keywords |
|------------|---------|-----------------|
| **Page Content Capture** | Get page content as accessible text with UIDs for interaction | `snapshot page content text` |
| **Visual Screenshot** | Capture screenshots (ALWAYS use `filePath` parameter) | `screenshot capture image` |
| **Page Navigation** | Navigate to URLs, go back/forward, reload pages | `navigate url page` |
| **Element Click** | Click on page elements using UIDs | `click element button` |
| **Input Filling** | Type text into input fields using UIDs | `fill input type text` |
| **Form Filling** | Fill multiple form fields at once | `form fill multiple fields` |
| **Tab Listing** | View all open browser tabs | `list pages tabs` |
| **Tab Selection** | Switch to a different browser tab | `select page tab switch` |
| **Script Execution** | Run JavaScript code in page context | `evaluate script javascript execute` |
| **Console Messages** | View console logs, warnings, and errors | `console messages logs errors` |
| **Network Requests** | Monitor network activity and API calls | `network requests xhr fetch` |
| **Performance Tracing** | Record and analyze page performance | `performance trace web vitals` |

## Essential Workflow

### Step 1: Discover Tools First

**Before using any Chrome DevTools capability, discover the available tools:**

```javascript
// Find page content capture tool
search_tools({ query: "snapshot page content" })

// Find element interaction tools
search_tools({ query: "click element" })
search_tools({ query: "fill input" })
```

### Step 2: Take a Snapshot

**Always start by capturing page content** to understand the page structure:

```javascript
// Use the snapshot tool discovered in Step 1
// Tool name will be mcp__chrome-devtools__take_snapshot or mcp__mcp-proxy__take_snapshot
snapshot_tool()
```

This returns:
- Page content as text
- Element UIDs for interaction
- Current page state

**Important:** Snapshots show `uid` values like `e45` - use these for clicks/fills.

### Step 3: Interact with Elements

Use the UIDs from the snapshot with discovered interaction tools:

```javascript
// Click a button
// Tool discovered via search_tools({ query: "click element" })
click_tool({ uid: "e45" })

// Fill an input
// Tool discovered via search_tools({ query: "fill input" })
fill_tool({ uid: "e23", value: "hello@example.com" })

// Fill multiple fields
// Tool discovered via search_tools({ query: "form fill" })
fill_form_tool({
  elements: [
    { uid: "e23", value: "hello@example.com" },
    { uid: "e24", value: "password123" }
  ]
})
```

### Step 4: Take New Snapshot After Changes

After interactions, take another snapshot to see the updated state.

## Best Practices

### CRITICAL: Always Save Screenshots to Files

**REQUIRED:** Always use `filePath` when taking screenshots to avoid breaking your session:

```javascript
// ✅ CORRECT - Safe, won't break session
// Tool name discovered via search_tools({ query: "screenshot" })
screenshot_tool({
  format: "png",
  filePath: "./screenshots/page.png"
})

// ❌ WRONG - Will break your session with API error
screenshot_tool({ format: "png" })
```

See the critical warning at the top of this document for full details.

### Always Specify Format for Screenshots

**REQUIRED:** Always explicitly declare the `format` parameter (and `filePath`) when taking screenshots:

```javascript
// ✅ CORRECT - Format and filePath explicitly declared
screenshot_tool({
  format: "png",
  filePath: "./screenshots/page.png"
})
screenshot_tool({
  format: "jpeg",
  quality: 85,
  filePath: "./screenshots/page.jpg"
})
screenshot_tool({
  format: "webp",
  quality: 90,
  filePath: "./screenshots/page.webp"
})

// ❌ WRONG - Format not specified
screenshot_tool()

// ❌ WRONG - No filePath (will break session)
screenshot_tool({ format: "png" })
```

**Format options:**
- `png` - Lossless, best for UI screenshots, larger file size (DEFAULT: use this when in doubt)
- `jpeg` - Lossy, use `quality` parameter (0-100), smaller files
- `webp` - Modern format, best compression with `quality` parameter

**When to use each:**
- Use `png` for documentation, UI testing, exact color matching
- Use `jpeg` (quality: 85-95) for general screenshots where file size matters
- Use `webp` (quality: 90) for web delivery with best compression

## Common Workflows

**Note:** Examples use generic capability names. Use `search_tools` to find actual tool names in your environment (e.g., `mcp__chrome-devtools__*` or `mcp__mcp-proxy__*`).

### Web App Testing

```javascript
// 1. Navigate to app
// Tool discovered via search_tools({ query: "navigate page url" })
navigate_tool({ type: "url", url: "http://localhost:3000" })

// 2. Take snapshot to find elements
// Tool discovered via search_tools({ query: "snapshot page content" })
snapshot_tool()

// 3. Fill login form
// Tool discovered via search_tools({ query: "form fill" })
fill_form_tool({
  elements: [
    { uid: "email-field-uid", value: "test@example.com" },
    { uid: "password-field-uid", value: "testpass" }
  ]
})

// 4. Click submit
// Tool discovered via search_tools({ query: "click element" })
click_tool({ uid: "submit-button-uid" })

// 5. Wait for navigation
// Tool discovered via search_tools({ query: "wait for text" })
wait_tool({ text: "Dashboard" })

// 6. Verify result with new snapshot
snapshot_tool()
```

### Screenshot Documentation

**IMPORTANT: Always use `filePath` to avoid breaking your session (see warning above).**

```javascript
// Discover screenshot tool first
search_tools({ query: "screenshot capture" })

// Full page screenshot - ALWAYS save to file
screenshot_tool({
  format: "png",
  fullPage: true,
  filePath: "./screenshots/full-page.png"
})

// Viewport only - ALWAYS save to file
screenshot_tool({
  format: "png",
  filePath: "./screenshots/viewport.png"
})

// Specific element - ALWAYS save to file
screenshot_tool({
  format: "png",
  uid: "e45",
  filePath: "./screenshots/element.png"
})

// Dynamic filename with timestamp
screenshot_tool({
  format: "png",
  filePath: `./screenshots/screenshot-${Date.now()}.png`,
  fullPage: true
})

// Compressed JPEG for large screenshots - still use filePath
screenshot_tool({
  format: "jpeg",
  quality: 85,
  fullPage: true,
  filePath: "./screenshots/large-page.jpg"
})
```

### Debugging Console Errors

```javascript
// Discover console tools
search_tools({ query: "console messages errors" })

// 1. List all console messages
list_console_tool()

// 2. Filter to errors only
list_console_tool({
  types: ["error", "warn"]
})

// 3. Get details on specific message
get_console_message_tool({ msgid: 5 })
```

### Debugging Network Issues

```javascript
// Discover network tools
search_tools({ query: "network requests xhr" })

// 1. List all network requests
list_network_tool()

// 2. Filter to API calls
list_network_tool({
  resourceTypes: ["fetch", "xhr"]
})

// 3. Get request details
get_network_request_tool({ reqid: 12 })
```

### Performance Analysis

```javascript
// Discover performance tools
search_tools({ query: "performance trace" })

// 1. Start trace with page reload
start_trace_tool({
  reload: true,
  autoStop: true
})

// 2. Or start manual trace
start_trace_tool({
  reload: false,
  autoStop: false
})

// Do interactions...

stop_trace_tool()

// 3. Analyze specific insights
analyze_insight_tool({
  insightSetId: "set-id-from-results",
  insightName: "LCPBreakdown"
})
```

### Responsive Testing

```javascript
// Discover viewport and emulation tools
search_tools({ query: "resize viewport" })
search_tools({ query: "emulate network" })

// Resize to mobile
resize_tool({ width: 375, height: 667 })

// Take screenshot - ALWAYS save to file
screenshot_tool({
  format: "png",
  filePath: "./screenshots/mobile-view.png"
})

// Resize to tablet
resize_tool({ width: 768, height: 1024 })

// Take screenshot - ALWAYS save to file
screenshot_tool({
  format: "png",
  filePath: "./screenshots/tablet-view.png"
})

// Emulate slow network
emulate_tool({ networkConditions: "Slow 3G" })
```

### Multi-Tab Management

```javascript
// Discover tab management tools
search_tools({ query: "list pages tabs" })
search_tools({ query: "select switch page" })

// 1. List open pages
list_pages_tool()

// 2. Open new tab
new_page_tool({ url: "https://example.com" })

// 3. Switch to tab
select_page_tool({ pageIdx: 1 })

// 4. Close tab
close_page_tool({ pageIdx: 2 })
```

### Handling Dialogs

```javascript
// Discover dialog handling tool
search_tools({ query: "dialog alert confirm" })

// Accept alert/confirm
handle_dialog_tool({ action: "accept" })

// Dismiss
handle_dialog_tool({ action: "dismiss" })

// With prompt text
handle_dialog_tool({
  action: "accept",
  promptText: "my input"
})
```

### Running JavaScript

```javascript
// Discover script execution tool
search_tools({ query: "evaluate script javascript" })

// Get page title
evaluate_tool({
  function: "() => document.title"
})

// Get element text
evaluate_tool({
  function: "(el) => el.innerText",
  args: [{ uid: "e45" }]
})

// Scroll to element
evaluate_tool({
  function: "(el) => el.scrollIntoView()",
  args: [{ uid: "e45" }]
})

// Get localStorage
evaluate_tool({
  function: "() => JSON.stringify(localStorage)"
})
```

## Best Practices Summary

### DO:

1. **Always use search_tools first** - Discover tool names for your environment (proxy vs standard)
2. **Always use filePath for screenshots** - Prevents session-breaking bug (CRITICAL)
3. **Always snapshot first** - Get UIDs before interacting with elements
4. **Re-snapshot after changes** - Page state changes after interactions
5. **Use wait capabilities** - Wait for content before proceeding with interactions
6. **Prefer snapshots over screenshots** - Faster and provides element UIDs
7. **Use form fill for multiple fields** - More efficient than individual fill operations

### DON'T:

1. **Don't hardcode tool names** - Tool names vary by environment, always use search_tools
2. **Don't take screenshots without filePath** - WILL BREAK YOUR SESSION (see warning above)
3. **Don't guess UIDs** - Always get them from snapshot
4. **Don't skip waits** - Dynamic content needs time to load
5. **Don't assume page state** - Always verify with snapshot
6. **Don't ignore errors** - Check console messages when things fail

## Common Patterns

**Note:** Remember to use `search_tools` to discover actual tool names before using these patterns.

### Login Flow

```javascript
// Discover required tools
search_tools({ query: "navigate page url" })
search_tools({ query: "snapshot page content" })
search_tools({ query: "form fill" })
search_tools({ query: "click element" })
search_tools({ query: "wait for text" })

// 1. Navigate
navigate_tool({ type: "url", url: "https://app.com/login" })

// 2. Snapshot to get field UIDs
snapshot_tool()

// 3. Fill credentials
fill_form_tool({
  elements: [
    { uid: "email-uid", value: "user@example.com" },
    { uid: "pass-uid", value: "password" }
  ]
})

// 4. Click login
click_tool({ uid: "login-btn-uid" })

// 5. Wait for redirect
wait_tool({ text: "Welcome" })

// 6. Verify logged in
snapshot_tool()
```

### Form Validation Testing

```javascript
// Discover required tools
search_tools({ query: "fill input" })
search_tools({ query: "click element" })
search_tools({ query: "snapshot page" })

// 1. Fill invalid data
fill_tool({ uid: "email-uid", value: "not-an-email" })

// 2. Submit
click_tool({ uid: "submit-uid" })

// 3. Snapshot to check error message
snapshot_tool()
// Look for validation error in output
```

### E2E Test Flow

```javascript
// Test: User can add item to cart

// Discover required tools
search_tools({ query: "navigate url" })
search_tools({ query: "snapshot page" })
search_tools({ query: "click element" })
search_tools({ query: "wait for text" })

// 1. Go to product page
navigate_tool({ type: "url", url: "https://shop.com/product/123" })
snapshot_tool()

// 2. Click add to cart
click_tool({ uid: "add-cart-uid" })
wait_tool({ text: "Added to cart" })

// 3. Go to cart
navigate_tool({ type: "url", url: "https://shop.com/cart" })
snapshot_tool()

// 4. Verify item in cart
// Check snapshot output for product name
```

## Troubleshooting

### Element Not Found

**Issue:** Click/fill fails with "element not found"

**Solution:**
1. Take fresh snapshot using snapshot tool
2. Verify UID exists in output
3. Element may have changed - get new UID from updated snapshot

### Page Not Loading

**Issue:** Snapshot shows blank or loading state

**Solution:**
```javascript
// Discover wait tool
search_tools({ query: "wait for text" })

// Wait for specific content
wait_tool({ text: "Expected content", timeout: 10000 })

// Then snapshot
snapshot_tool()
```

### Dynamic Content

**Issue:** Elements appear after JavaScript runs

**Solution:**
```javascript
// Discover wait tool
search_tools({ query: "wait for text" })

// Wait for the dynamic element
wait_tool({ text: "Dynamic content" })

// Or wait fixed time via script execution
search_tools({ query: "evaluate script" })
evaluate_tool({
  function: "() => new Promise(r => setTimeout(r, 2000))"
})
```

### Wrong Page/Tab

**Issue:** Actions happening on wrong page

**Solution:**
```javascript
// Discover page management tools
search_tools({ query: "list pages tabs" })
search_tools({ query: "select page" })

// List all pages
list_pages_tool()

// Select correct one
select_page_tool({ pageIdx: 0 })

// Verify
snapshot_tool()
```

### WSL + Windows Chrome Connection Issues

**Issue:** `Protocol error (Target.setDiscoverTargets): Target closed`

This occurs when Chrome is running on Windows but Claude Code is in WSL.

**Solution:**

1. **Start Chrome with remote debugging on Windows:**
   ```cmd
   chrome.exe --remote-debugging-port=9222 --remote-debugging-address=0.0.0.0 --user-data-dir="C:\chrome-dev-profile"
   ```

2. **Enable WSL mirrored networking** (add to `C:\Users\<user>\.wslconfig`):
   ```ini
   [wsl2]
   networkingMode=mirrored
   ```

3. **Add `--browserUrl` to MCP config:**
   ```json
   {
     "chrome-devtools": {
       "args": ["-y", "chrome-devtools-mcp@latest", "--browserUrl=http://localhost:9222"]
     }
   }
   ```

4. **Full restart Claude Code** - `/mcp` reconnect won't reset stale connections

**Verify connection from WSL:**
```bash
curl -s http://localhost:9222/json/version
```

See `docs/KNOWN-ISSUES.md` for detailed troubleshooting.

## Performance Insights

The performance tools provide Core Web Vitals and insights:

| Insight | What It Measures |
|---------|------------------|
| LCPBreakdown | Largest Contentful Paint components |
| CLSCulprits | Layout shift causes |
| DocumentLatency | Document load time |
| RenderBlocking | Resources blocking render |

## Quick Reference

**Note:** Use `search_tools` to discover actual tool names. Names shown are capabilities only.

| Action | Search Query | Key Parameters |
|--------|--------------|----------------|
| **Navigate** | `navigate page url` | `type`, `url` |
| **Snapshot** | `snapshot page content` | `verbose` |
| **Screenshot** | `screenshot capture` | `format` (REQUIRED), `filePath` (REQUIRED), `fullPage`, `uid`, `quality` |
| **Click** | `click element` | `uid`, `dblClick` |
| **Type** | `fill input` | `uid`, `value` |
| **Multi-fill** | `form fill` | `elements[]` |
| **Wait** | `wait for text` | `text`, `timeout` |
| **Run JS** | `evaluate script` | `function`, `args` |
| **Console** | `console messages` | `types[]` |
| **Network** | `network requests` | `resourceTypes[]` |
| **Resize** | `resize viewport` | `width`, `height` |
| **Emulate** | `emulate network` | `networkConditions`, `cpuThrottlingRate` |

## Tool Discovery Methods

Chrome DevTools capabilities can be accessed through different configurations:

### Standard Mode (Direct Access)

Tools are prefixed with `mcp__chrome-devtools__*`:

```javascript
// Example: Direct access to tools
mcp__chrome-devtools__take_snapshot()
mcp__chrome-devtools__take_screenshot({ format: "png", filePath: "./shot.png" })
```

### Proxy Mode (Proxied Access)

Tools are prefixed with `mcp__mcp-proxy__*` when accessed through a proxy server:

```javascript
// Example: Proxied access to same capabilities
mcp__mcp-proxy__take_snapshot()
mcp__mcp-proxy__take_screenshot({ format: "png", filePath: "./shot.png" })
```

### Deferred Loading Mode

When the Chrome DevTools MCP server has `defer_loading: true` configured, tools are discovered on-demand using `search_tools`. This reduces initial token usage while maintaining full functionality.

**Configuration in `.mcp.json`:**
```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-chrome-devtools"],
      "default_config": {
        "defer_loading": true
      },
      "configs": {
        "mcp__chrome-devtools__take_screenshot": {
          "defer_loading": false
        },
        "mcp__chrome-devtools__navigate_page": {
          "defer_loading": false
        },
        "mcp__chrome-devtools__take_snapshot": {
          "defer_loading": false
        }
      }
    }
  }
}
```

**Universal Approach:** Always use `search_tools` to discover capabilities - works with all modes (standard, proxy, deferred loading).

**Learn more:** See `docs/deferred-mcp-loading.md` for comprehensive guide.

## Integration with Other Skills

- **testing-workflow**: Use for E2E tests after unit tests
- **debugging**: Check console/network when debugging frontend
- **documentation-writing**: Generate screenshots for docs

## Summary

1. **CRITICAL: Always use search_tools first** - Discover tool names for your environment (proxy vs standard mode)
2. **CRITICAL: Always use filePath for screenshots** - Prevents session-breaking bug (see warning at top)
3. **Always snapshot first** - Get element UIDs before any interaction
4. **Use UIDs for all interactions** - Click, fill operations require UIDs from snapshot
5. **Re-snapshot after changes** - Verify page state after interactions
6. **Wait for content** - Dynamic pages need time to load before interaction
7. **Check console/network** - Debug issues by examining console errors and network requests

**The key workflow:** **Discover -> Snapshot -> Interact -> Verify** (and always save screenshots to files!)

**Remember:** Tool names vary by environment configuration. Always use `search_tools({ query: "chrome devtools browser" })` to discover available tools before use.
