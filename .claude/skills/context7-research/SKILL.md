---
name: context7-research
description: Fetch current, version-specific library documentation via Context7 MCP. Use when implementing library code (React, Express, Prisma, etc.), verifying API signatures, checking method parameters, or avoiding outdated training data. Provides real-time access to official docs to eliminate API hallucinations.
---

# Context7 Research Skill

Use Context7 (MCP tool) to get current, accurate documentation for libraries and frameworks instead of relying on potentially outdated training data.

## What is Context7?

Context7 is an MCP server that:
- Fetches real-time documentation from official sources
- Filters by exact library versions
- Provides current API patterns (not outdated ones)
- Eliminates hallucinations about APIs

## When to Use This Skill

Use Context7 when:
- Working with unfamiliar libraries
- Using library with recent major version upgrade
- Debugging library-specific errors
- Verifying API usage is correct for your version
- Learning new framework patterns
- Checking breaking changes between versions

Don't need Context7 when:
- Using standard language features (JS, Python, etc.)
- Working with code you wrote (use Read tool)
- Following established internal patterns

## Common Queries

Example queries that would trigger this skill:

1. "What's the correct API for useQuery in TanStack Query v5?"
2. "Check the Next.js 14 docs for App Router middleware setup"
3. "Show me the Prisma schema syntax for many-to-many relations"
4. "Look up the Express.js error handling middleware signature"
5. "What parameters does React's useMemo hook accept?"
6. "Verify the Zod validation syntax for optional fields"
7. "Check if useState accepts a function as initial value in React 18"
8. "What's the correct import path for Tailwind CSS utilities?"
9. "Show me the TypeScript config options for strict mode"
10. "Look up the Vitest mock function API for spying on modules"

## Tool Discovery

Context7 provides library documentation capabilities through MCP tools. Tool names vary by environment configuration:

**Proxy mode:** `mcp__mcp-proxy__resolve-library-id`, `mcp__mcp-proxy__query-docs`
**Standard mode:** `mcp__context7__resolve-library-id`, `mcp__context7__query-docs`

In most cases, tool resolution happens automatically - you don't need to specify tool names. Just describe what you need and the system finds the right capability.

**To discover Context7 capabilities manually:**
```
search_tools(query="context7 library docs")
```

**Context7 provides two core capabilities:**
1. **Library Resolution** - Convert package names to Context7-compatible library IDs
2. **Documentation Retrieval** - Fetch current, version-specific documentation

**Typical two-step workflow:**
1. Resolve the library name (e.g., "next-auth") to get the Context7 library ID
2. Request documentation for that library ID (optionally filtered by version and topic)

## How to Use Context7

### Basic Pattern

```
use context7 to [what you need] for [library@version]
```

### Common Queries

**Check current API usage:**
```
use context7 to show how to use useQuery in @tanstack/react-query v5
```

**Get setup patterns:**
```
use context7 to show authentication setup for Next.js 14 App Router
```

**Find breaking changes:**
```
use context7 to list breaking changes between React Query v3 and v5
```

**Verify error resolution:**
```
use context7 to explain why "useQuery is not a function" error occurs in TanStack Query v5
```

**Research best practices:**
```
use context7 to explain current best practices for form handling in Next.js 14
```

**Check configuration:**
```
use context7 to show Prisma client setup for version 5.x
```

## Workflow Integration

### Before Starting Task

```bash
# 1. Check what versions you have
cat package.json | grep "library-name"

# 2. Research with Context7
"use context7 to show [what you need] for [library@version]"

# 3. Use findings in implementation
```

### During Debugging

```bash
# 1. Identify library in error
Error: Cannot find module '@tanstack/react-query'

# 2. Research with Context7
"use context7 to show correct import for TanStack Query v5"

# 3. Fix based on current docs
```

### During Code Review

```bash
# 1. See unfamiliar library usage
const data = useQuery('users', fetchUsers)

# 2. Verify with Context7
"use context7 to verify useQuery syntax for TanStack Query v5"

# 3. Discover it's outdated v3 syntax
useQuery({ queryKey: ['users'], queryFn: fetchUsers }) // v5 syntax
```

## Example Usage Scenarios

### Scenario 1: Adding Authentication

**You:** "I need to add authentication with NextAuth to a Next.js 14 app"

**Step 1 - Check version:**
```bash
npm search next-auth
# Latest: 5.0.0 (now called Auth.js)
```

**Step 2 - Research with Context7:**
```
use context7 to show authentication setup for NextAuth v5 with Next.js 14
```

**Step 3 - Implement based on findings:**
- Create `auth.ts` (not `[...nextauth].ts`)
- Use new configuration format
- Set up middleware correctly

### Scenario 2: Fixing Library Error

**Error:**
```
TypeError: queryClient.prefetchQuery is not a function
```

**Step 1 - Research with Context7:**
```
use context7 to show prefetchQuery usage in TanStack Query v5
```

**Step 2 - Discover the issue:**
- API signature changed in v5
- Old: `queryClient.prefetchQuery('key', fn)`
- New: `queryClient.prefetchQuery({ queryKey: ['key'], queryFn: fn })`

**Step 3 - Fix with correct syntax**

### Scenario 3: Version Upgrade

**Task:** Upgrade from React Query v3 to v5

**Step 1 - Research breaking changes:**
```
use context7 to list all breaking changes between @tanstack/react-query v3 and v5
```

**Step 2 - Document findings:**
- Package renamed: `react-query` → `@tanstack/react-query`
- Hook signatures changed to object syntax
- `useInfiniteQuery` changes
- QueryClient configuration changes

**Step 3 - Update code systematically**

## Best Practices

### DO:

✅ **Specify exact versions**
```
use context7 for Next.js 14.2.3  ✓
use context7 for Next.js         ✗ (too vague)
```

✅ **Be specific about what you need**
```
use context7 to show useEffect cleanup patterns in React 18  ✓
use context7 for React                                       ✗ (too broad)
```

✅ **Use for external libraries, not basics**
```
use context7 for NextAuth.js v5 setup     ✓ (external library)
use context7 for JavaScript async/await   ✗ (language feature)
```

✅ **Check version first**
```bash
cat package.json | grep "next"  # Find version
use context7 for Next.js 14.2.3 # Use exact version
```

### DON'T:

❌ **Don't use for internal code**
```
use context7 to explain my auth service  ✗ (use Read tool instead)
```

❌ **Don't skip after major upgrades**
```
Upgraded library → MUST use Context7 to check breaking changes
```

❌ **Don't ignore Context7 findings**
```
Context7 says v5 uses different syntax → Update your code!
```

❌ **Don't use for basic language features**
```
use context7 for JavaScript loops  ✗ (not needed)
```

## Integration with Agents

**task-finalizer agent:**
- Automatically uses Context7 when finalizing tasks
- Adds Context7 findings to implementation notes

**debugger agent:**
- Can use Context7 to verify library API usage
- Helps identify if error is from API misuse

**code-reviewer agent:**
- Can use Context7 to check API correctness
- Verifies code uses current patterns

## Quick Reference Card

| Situation | Context7 Query Example |
|-----------|----------------------|
| **API usage** | `use context7 to show [function] usage in [library@version]` |
| **Setup** | `use context7 to show setup for [library@version]` |
| **Breaking changes** | `use context7 to list breaking changes [library@v1] to [library@v2]` |
| **Error resolution** | `use context7 to explain [error] in [library@version]` |
| **Best practices** | `use context7 to show best practices for [use-case] in [library]` |
| **Configuration** | `use context7 to show config for [library@version]` |

## Real vs Hallucinated APIs

### Without Context7 (Risky)

Claude might suggest:
```typescript
// This might be from v3, v4, or not exist at all!
const data = useQuery('users', fetchUsers)
```

### With Context7 (Accurate)

Claude verifies with Context7:
```typescript
// Verified current v5 syntax from official docs
const { data } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers
})
```

## Pro Tips

1. **Always check version first** - Different versions = different APIs
2. **Use Context7 after upgrades** - Breaking changes are common
3. **Verify in errors** - Is it your code or wrong API usage?
4. **Document findings** - Add Context7 discoveries to task notes
5. **Share patterns** - If Context7 reveals new patterns, update team docs

## Tool Search Tool Integration

When the Context7 MCP server has `defer_loading: true` configured, tools are discovered on-demand using the Tool Search Tool. This reduces initial token usage while maintaining full functionality.

**How it works:**
1. Common Context7 capabilities (Library Resolution and Documentation Retrieval) can be marked to load immediately
2. Specialized tools are discovered dynamically when needed
3. Claude searches for tools by name and description
4. Matching tools are loaded into context on-demand

**Configuration in `.mcp.json`:**
```json
{
  "mcpServers": {
    "context7": {
      "default_config": {
        "defer_loading": true
      },
      "configs": {
        "[library-resolution-tool-name]": {
          "defer_loading": false
        },
        "[documentation-retrieval-tool-name]": {
          "defer_loading": false
        }
      }
    }
  }
}
```

**Note:** Replace `[library-resolution-tool-name]` and `[documentation-retrieval-tool-name]` with the actual tool names from your environment (see "Tool Discovery" section above for naming variations).

**No workflow changes required** - tool discovery happens automatically. The only difference is reduced initial token usage (~85% reduction with multiple MCP servers).

**Learn more:** See `docs/deferred-mcp-loading.md` for comprehensive guide.

## Summary

Context7 eliminates API hallucinations by providing real, current documentation.

**Simple workflow:**
1. Check library version: `cat package.json | grep "library"`
2. Ask Context7: `use context7 to [query] for [library@version]`
3. Implement with confidence using current, verified patterns

**Key benefit:** Never implement outdated APIs again!
