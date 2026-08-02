---
name: ref-research
description: Token-efficient documentation search via Ref Tools MCP with 50-70% savings. Use when researching large documentation sets, searching private repository docs, querying PDF documentation, or performing repeated searches (session deduplication). Optimized for full sentence queries, not keywords.
---

# Ref Research Skill

Use Ref Tools MCP for token-efficient documentation search when you need to minimize token usage while researching across large documentation sets, private repositories, or PDF files.

## What is Ref Tools?

Ref Tools is an MCP server that:
- Provides 50-70% token savings vs traditional documentation search
- Uses session-based deduplication (repeated searches don't re-send same content)
- Supports private repository documentation
- Supports PDF documentation search
- Optimized for full sentence queries (not keyword-based)

## When to Use This Skill

### Use Ref Tools when:
- Need token efficiency for large documentation searches
- Searching private repository documentation
- Searching PDF documentation
- Performing multiple related searches in a session
- Research requires broad documentation coverage
- Token budget is a concern

### Use Context7 instead when:
- Need specific library version documentation
- Working with npm package APIs
- Need official API reference (not prose docs)
- Speed is more important than token savings

### Decision Tree: Ref vs Context7

```
Documentation Research Need?
|
+-- Need specific library API reference?
|   |
|   YES -> Use Context7
|   |      - Exact API signatures
|   |      - Version-specific docs
|   |      - npm package documentation
|   |
|   NO -> Continue...
|
+-- Searching private repos or PDFs?
|   |
|   YES -> Use Ref Tools (Context7 doesn't support these)
|   |
|   NO -> Continue...
|
+-- Token efficiency critical?
|   |
|   YES -> Use Ref Tools (50-70% savings)
|   |
|   NO -> Either works, Context7 may be faster
|
+-- Multiple related searches planned?
    |
    YES -> Use Ref Tools (session deduplication)
    |
    NO -> Either works
```

## Common Queries

Example queries that would trigger this skill:

1. "Look up the function signature for our internal auth library"
2. "Search the private repo docs for deployment configuration"
3. "Find documentation about the company's API rate limiting policy"
4. "Search the PDF specification for WebSocket protocol handshake"
5. "Look up how to configure our custom logging middleware"
6. "Find the internal style guide for React component patterns"
7. "Search documentation for the team's database migration process"
8. "Look up the API contract for the payment service integration"
9. "Find docs explaining the caching strategy in our architecture"
10. "Search the technical specs for the authentication flow diagram"

## Tool Discovery

Ref Tools provides documentation search capabilities through MCP tools. Tool names vary by environment configuration:

**Proxy mode:** `mcp__mcp-proxy__ref_search_documentation`, `mcp__mcp-proxy__ref_read_url`
**Standard mode:** `mcp__ref__search_documentation`, `mcp__ref__read_url`

**To discover Ref Tools capabilities manually:**
```
search_tools(query="ref documentation search")
```

**Ref Tools provides two core capabilities:**
1. **Documentation Search** - Search across documentation with natural language queries
2. **URL Reading** - Read specific documentation URLs for detailed content

## How to Use Ref Tools

### Query Optimization

**CRITICAL:** Ref Tools works best with full sentence queries, NOT keywords.

**Good queries (full sentences):**
```
"How do I configure authentication middleware in Express.js?"
"What are the best practices for error handling in React applications?"
"Explain the differences between useEffect and useLayoutEffect"
```

**Poor queries (keywords):**
```
"express auth middleware"
"react error handling"
"useEffect useLayoutEffect"
```

### Search -> Read Pattern

Ref Tools is designed for iterative research:

**Step 1: Broad search**
```javascript
ref_search_documentation({
  query: "How do I implement rate limiting in Express.js applications?"
})
// Returns: List of relevant documentation URLs with snippets
```

**Step 2: Deep read on relevant results**
```javascript
ref_read_url({
  url: "https://expressjs.com/en/advanced/best-practice-security.html"
})
// Returns: Full page content (deduplicated in session)
```

**Step 3: Follow-up search (benefits from deduplication)**
```javascript
ref_search_documentation({
  query: "What middleware options exist for Express rate limiting?"
})
// Returns: Additional results, previously seen content is deduplicated
```

### Session-Based Deduplication

Within a single session:
- First search for a topic sends full documentation content
- Subsequent searches referencing same content sends only new information
- Token usage decreases as you research more within same topic area
- **Tip:** Group related research queries together for maximum savings

## Workflow Integration

### Before Starting Research Task

```bash
# 1. Determine research scope
# Large/broad research -> Ref Tools
# Specific library API -> Context7

# 2. Use Ref Tools for broad research
"use ref tools to research authentication patterns in Node.js"

# 3. Switch to Context7 for specific library details
"use context7 to show passport.js strategy configuration"
```

### Combined Research Pattern

```bash
# Phase 1: Broad research with Ref Tools (token efficient)
ref_search_documentation: "Best practices for API authentication in 2024"

# Phase 2: Narrow down options
ref_read_url: [read top 2-3 results]

# Phase 3: Specific library details with Context7
context7: "Show JWT setup for passport.js v0.7"
```

## Common Patterns

### Pattern 1: Architecture Research

```javascript
// Broad architecture research
ref_search_documentation({
  query: "What are the recommended patterns for microservices authentication?"
})

// Deep dive into specific approach
ref_read_url({
  url: "https://docs.example.com/microservices-auth-patterns"
})
```

### Pattern 2: Framework Comparison

```javascript
// Compare frameworks
ref_search_documentation({
  query: "Compare Next.js and Remix for server-side rendering in 2024"
})

// Read detailed comparison
ref_read_url({
  url: "https://comparison-site.com/nextjs-vs-remix"
})

// Follow up with specific framework docs via Context7
// (switch to Context7 for version-specific API details)
```

### Pattern 3: Private Repository Documentation

```javascript
// Search private docs (Ref Tools exclusive feature)
ref_search_documentation({
  query: "How do I use our internal authentication library?",
  private_repos: true  // Ref Tools supports this
})
```

## Best Practices

### DO:

**Use full sentence queries**
```
"How do I handle file uploads in Express.js?"  (good)
"express file upload"                           (bad)
```

**Group related research**
```
// Session 1: All auth-related queries (deduplication benefits)
"Authentication best practices"
"OAuth implementation patterns"
"JWT vs session tokens"

// Session 2: Different topic
"Database optimization techniques"
```

**Combine with Context7 for specific APIs**
```
// Ref: Broad research
ref_search_documentation: "Rate limiting strategies for APIs"

// Context7: Specific library
context7: "Show express-rate-limit configuration options"
```

### DON'T:

**Don't use for simple API lookups**
```
// Use Context7 instead for specific API:
ref_search_documentation: "React useState signature"  (bad)
context7: "React useState hook"                        (good)
```

**Don't spread related queries across sessions**
```
// Bad: Loses deduplication benefits
Session 1: "Auth patterns"
Session 2: "More auth patterns"  <- no deduplication with session 1
```

**Don't use keyword queries**
```
ref_search_documentation: "auth express jwt"  (bad)
ref_search_documentation: "How do I implement JWT authentication in Express?"  (good)
```

## API Key Requirements

Ref Tools requires an API key:
- Paid service with 200 free searches
- Set `REF_API_KEY` environment variable
- Configure in `.mcp.json` or `.env`

**Environment setup:**
```bash
export REF_API_KEY="your-api-key"
```

## Integration with Other Tools

**Combine with Context7:**
- Use Ref for broad research, Context7 for specific library APIs
- Ref saves tokens on prose documentation, Context7 better for code examples

**Combine with EXA:**
- Use EXA for recent web content, Ref for established documentation
- Ref better for technical docs, EXA better for community discussions

**Combine with Explore agent:**
- Use Explore for codebase analysis
- Use Ref for external documentation research
- Combine findings for implementation decisions

## Summary

Ref Tools excels at token-efficient documentation research:

**Simple workflow:**
1. Use full sentence queries (not keywords)
2. Group related searches in same session (deduplication)
3. Use search -> read iterative pattern
4. Combine with Context7 for specific library APIs

**Key benefit:** 50-70% token savings on documentation research with session deduplication!
