---
name: exa-research
description: Expert guidance for conducting neural/semantic research using EXA's web search and deep research capabilities. Use when you need semantic understanding and comprehensive research beyond keyword matching.
---

# EXA Research Skill

Expert guidance for conducting high-quality semantic research using EXA's neural search and deep research capabilities. Use when you need comprehensive, semantically-aware research that goes beyond traditional keyword matching.

## When to Use This Skill

Use EXA when:
- Conducting semantic/conceptual research (not just keyword matching)
- Exploring topics where natural language understanding is critical
- Running comprehensive deep research requiring exhaustive source coverage
- Finding content based on meaning and context, not just keywords
- Research requiring async workflows for thorough investigation
- Discovering related concepts and semantic connections

For quick factual queries or simple question-answering, consider using traditional search or web tools instead.

## Common Queries

Example queries that would trigger this skill:

1. "Search for best practices on microservices authentication in 2024"
2. "Find recent articles about React Server Components performance"
3. "Research current trends in AI-assisted code review tools"
4. "Search the web for comparisons between Bun and Node.js runtime"
5. "Find community discussions about Next.js 15 migration issues"
6. "Look up recent blog posts about TypeScript 5.4 features"
7. "Search for real-world case studies of serverless architecture"
8. "Find expert opinions on GraphQL vs REST for mobile APIs"
9. "Research emerging patterns for state management in React 2024"
10. "Search for security best practices for JWT token handling"

## Tool Discovery

**EXA tools are discovered dynamically using search_tools().**

### Step-by-Step Discovery Process

**Step 1: Search for EXA capabilities**

```javascript
// Find web search capability
const webSearch = search_tools({ query: "exa web search neural" });

// Find deep research capabilities
const deepStart = search_tools({ query: "exa deep researcher start" });
const deepCheck = search_tools({ query: "exa researcher check poll" });
```

**Step 2: Examine results**

search_tools returns an array of tool objects. Example results:

```javascript
// webSearch results might return:
[
  {
    name: "mcp__mcp-proxy__web_search_exa",
    description: "Perform neural web search using EXA..."
  }
]

// deepStart results might return:
[
  {
    name: "mcp__mcp-proxy__deep_researcher_start",
    description: "Start async deep research task..."
  }
]
```

**Step 3: Use the exact tool name from results**

```javascript
// CORRECT: Use exact name from search results
mcp__mcp-proxy__web_search_exa({
  query: "What are best practices for React performance optimization?"
})

// WRONG: Don't guess tool names
mcp__exa__search({...})  // May not exist in proxy mode
exa_web_search({...})    // Wrong format
```

### Environment-Specific Tool Names

| Environment | Web Search Tool | Deep Research Start | Deep Research Check |
|-------------|-----------------|---------------------|---------------------|
| Proxy Mode | `mcp__mcp-proxy__web_search_exa` | `mcp__mcp-proxy__deep_researcher_start` | `mcp__mcp-proxy__deep_researcher_check` |
| Standard Mode | `mcp__exa__web_search_exa` | `mcp__exa__deep_researcher_start` | `mcp__exa__deep_researcher_check` |

**Important:** Always use search_tools to confirm exact names - they may vary by configuration.

## Proxy Verification (Required for mcp__mcp-proxy__* tools)

If your discovered tools start with `mcp__mcp-proxy__`, verify the proxy is running before use.

### Quick Health Check

```bash
# Verify proxy is operational
curl -s http://localhost:4000/health

# Expected: {"status":"ok"} or {"status":"healthy"}
# Error: Connection refused or timeout
```

### Programmatic Check (in tool usage)

Before calling EXA tools, verify availability:

```javascript
// Step 1: Try a simple search first
const testResult = search_tools({ query: "exa" });

if (testResult.length === 0) {
  // No EXA tools available - proxy may be down or not configured
  console.log("EXA tools not available - using fallback");
  // Use WebSearch fallback (see Fallback Strategies section)
}
```

### Starting the Proxy

If proxy is not running:

```bash
# Option 1: Start via claude-workflow CLI
claude-workflow proxy start

# Option 2: Start manually with litellm
litellm --config .claude/ccproxy/config.yaml

# Option 3: Start via npm script (if configured)
npm run proxy
```

### Proxy Not Configured?

If you need to set up MCP proxy:

```bash
# Initialize proxy configuration
claude-workflow scaffold ccproxy

# Configure EXA API key
export EXA_API_KEY=your_api_key_here

# Start proxy
claude-workflow proxy start
```

## Available Capabilities

EXA provides three primary research capabilities (tool names discovered via `search_tools()` as shown above):

### 1. Neural Web Search (`web_search_exa`)
- Semantic understanding beyond keyword matching
- Natural language queries perform better than keyword lists
- Returns semantically relevant results based on meaning
- Good for exploratory and conceptual research

### 2. Deep Researcher Start (`deep_researcher_start`)
- Initiates asynchronous comprehensive research task
- Returns task_id for polling
- Suitable for complex, multi-faceted research questions
- Provides exhaustive source coverage

### 3. Deep Researcher Check (`deep_researcher_check`)
- Polls for completion of deep research task
- Takes task_id from `deep_researcher_start`
- Returns status and results when complete
- Supports async workflow pattern

## Fallback Strategies

When EXA tools are unavailable, use these fallback approaches:

### Fallback 1: Built-in WebSearch

If no EXA tools found:

```javascript
// Instead of EXA neural search:
// mcp__mcp-proxy__web_search_exa({ query: "..." })

// Use built-in WebSearch:
WebSearch({ query: "Your research question here" })
```

**Limitations of WebSearch fallback:**
- Less semantic understanding (keyword-based)
- No neural ranking
- May return less relevant results

**Mitigation:** Use more explicit, keyword-rich queries:
- EXA: "What are emerging patterns for state management in React?"
- WebSearch: "React state management best practices 2024 Redux Zustand comparison"

### Fallback 2: WebFetch for Known Sources

If you know where the information lives:

```javascript
// Fetch specific documentation directly
WebFetch({
  url: "https://blog.logrocket.com/comparing-react-state-management-solutions/",
  prompt: "Extract key comparisons between state management libraries"
})
```

### Fallback 3: Multiple WebSearch Queries

Simulate deep research with multiple queries:

```javascript
// Instead of deep_researcher_start for comprehensive research:

// Break into multiple focused searches
WebSearch({ query: "React state management performance benchmarks 2024" })
WebSearch({ query: "Redux vs Zustand developer experience comparison" })
WebSearch({ query: "React Context API scalability limitations" })

// Synthesize results manually
```

### Fallback Decision Tree

```
EXA Tools Available?
|-- YES: Use EXA (preferred)
|   |-- Neural search provides best semantic results
|
|-- NO: Check fallback options
    |-- Need quick answer? -> WebSearch
    |-- Know specific sources? -> WebFetch
    |-- Need comprehensive research? -> Multiple WebSearch + synthesis
```

## Core Principles

### 1. Neural Search vs Keyword Search

**Traditional Keyword Search:**
- Matches exact words and phrases
- Misses semantically similar content
- Requires knowing exact terminology

**EXA Neural Search:**
- Understands meaning and context
- Finds semantically related content
- Works with conversational queries

**Example:**
```
Keyword query: "React hooks useState useEffect"
Neural query:  "How to manage component state and side effects in modern React applications"
```

The neural query finds more relevant results because it understands the concept, not just the keywords.

### 2. Natural Language Query Optimization

**Best Practices for Neural Search:**

**Be Conversational and Contextual:**
- Bad: "AI medical diagnosis accuracy 2024"
- Good: "What is the current state of AI-powered medical diagnosis systems and how accurate are they compared to human doctors?"

**Describe What You're Looking For:**
- Bad: "blockchain scalability"
- Good: "I'm looking for research on how blockchain networks are solving scalability challenges while maintaining decentralization"

**Include Intent and Context:**
- Bad: "React performance"
- Good: "I need to understand best practices for optimizing React application performance in large-scale enterprise applications"

**Avoid Keyword Stuffing:**
- Bad: "JavaScript framework comparison React Vue Angular performance benchmarks speed"
- Good: "Compare the performance characteristics of React, Vue, and Angular frameworks for building large web applications"

### 3. Deep Researcher Async Workflow

**CRITICAL: Deep researcher uses an asynchronous pattern with specific tool names.**

**Complete Example with Exact Tool Names:**

```javascript
// Step 1: Discover the deep researcher tools
const startTools = search_tools({ query: "exa deep researcher start" });
const checkTools = search_tools({ query: "exa researcher check" });

// Example results:
// startTools = [{ name: "mcp__mcp-proxy__deep_researcher_start", ... }]
// checkTools = [{ name: "mcp__mcp-proxy__deep_researcher_check", ... }]

// Step 2: Start the research task (use exact name from discovery)
const startResponse = mcp__mcp-proxy__deep_researcher_start({
  query: "Comprehensive analysis of serverless architecture patterns for enterprise applications"
});
// Response: { task_id: "exa-research-abc123", status: "pending" }

// Step 3: Extract task_id
const taskId = startResponse.task_id;  // "exa-research-abc123"

// Step 4: Poll for completion (wait 10 seconds between checks)
let status = "pending";
let attempts = 0;
const maxAttempts = 60;  // 10 minutes max

while (status !== "complete" && attempts < maxAttempts) {
  // Wait 10 seconds
  await sleep(10000);

  // Check status (use exact name from discovery)
  const checkResponse = mcp__mcp-proxy__deep_researcher_check({
    task_id: taskId
  });

  status = checkResponse.status;
  attempts++;

  if (status === "complete") {
    // Success! Extract results
    const results = checkResponse.results;
    break;
  }

  if (status === "error") {
    // Handle error
    throw new Error(checkResponse.error);
  }
}

// Step 5: Use results
console.log(results);
```

**Important Notes:**
1. Always discover tool names first - don't hardcode
2. Extract task_id from start response
3. Use same task_id for all check calls
4. Wait 10 seconds between polls (avoid rate limiting)
5. Set reasonable timeout (10 minutes for complex research)

**Polling Best Practices:**

- **Polling Interval:** Wait 5-10 seconds between checks
- **Timeout:** Set reasonable timeout (5-10 minutes for complex research)
- **Error Handling:** Handle network errors and retry with backoff
- **Progress Tracking:** Monitor status field for progress updates

**Status Values:**
- `pending` - Task queued, not started yet
- `processing` - Research in progress
- `complete` - Research finished, results available
- `error` - Task failed (check error message)

### 4. When to Use EXA

**Use EXA when:**
- You need semantic understanding of concepts
- Exploring unfamiliar territory conceptually
- Research requires comprehensive source coverage
- Time is not critical (can wait for results)
- Finding semantically related content is important
- Natural language queries that describe intent
- Deep research requiring multiple sources

**Consider traditional search for:**
- Quick factual answers
- Simple question-answering scenarios
- Real-time information needs

## Common Patterns

### Pattern 1: Quick Semantic Search

```
Capability: Neural Web Search
(Discover tool: search_tools(query="exa web search"))

Query: "What are the emerging approaches to making large language models more efficient and cost-effective?"

Purpose: Find semantically relevant content about LLM efficiency
```

### Pattern 2: Exploratory Concept Research

```
Capability: Neural Web Search
(Discover tool: search_tools(query="exa web search"))

Query: "I'm exploring how modern web frameworks handle server-side rendering and static site generation. What are the current patterns and trade-offs?"

Purpose: Discover related concepts and approaches using semantic understanding
```

### Pattern 3: Comprehensive Deep Research

```
Capability: Deep Researcher (async workflow)
(Discover tools: search_tools(query="exa deep researcher"))

Step 1 - Start research:
deep_researcher_start(
  query: "Conduct comprehensive research on the security implications of AI-generated code in enterprise software development"
)
Returns: { task_id: "research-123" }

Step 2 - Poll for completion:
deep_researcher_check(task_id: "research-123")
Poll every 10 seconds until status === "complete"

Step 3 - Extract results:
Parse comprehensive research findings from results field

Purpose: Exhaustive research with multiple sources and perspectives
```

### Pattern 4: Semantic Discovery

```
Capability: Neural Web Search
(Discover tool: search_tools(query="exa web search"))

Query: "Show me innovative approaches to distributed systems consistency that go beyond traditional CAP theorem discussions"

Purpose: Discover novel concepts and non-obvious connections
```

### Pattern 5: Multi-Stage Research

For complex research tasks:

1. **Start with Neural Web Search** to explore the landscape
2. **Identify key areas** that need deeper investigation
3. **Use Deep Researcher** for comprehensive analysis of specific areas
4. **Combine findings** from multiple research tasks

## Deep Researcher Workflow Details

### Starting a Research Task

**Input Parameters:**
- `query` (required): Natural language research question
- `focus_areas` (optional): Specific aspects to emphasize

**Response:**
- `task_id`: Unique identifier for the research task
- `status`: Initial status (typically "pending")

**Example:**
```
Input:
{
  query: "Analyze the state of quantum computing for practical applications in 2024-2025"
}

Output:
{
  task_id: "exa-research-abc123",
  status: "pending"
}
```

### Polling for Results

**Input Parameters:**
- `task_id` (required): The task_id from deep_researcher_start

**Response Fields:**
- `status`: Current status ("pending", "processing", "complete", "error")
- `progress`: Progress indicator (if available)
- `results`: Research findings (when status is "complete")
- `error`: Error message (when status is "error")

**Polling Strategy:**

**Recommended Interval:** 5-10 seconds
- Too frequent: May hit rate limits
- Too infrequent: Delays getting results

**Timeout Handling:**
- Set maximum polling attempts (e.g., 60 attempts = 10 minutes)
- Alert user if timeout occurs
- Consider breaking down query if consistently timing out

**Error Handling:**
- Network errors: Retry with exponential backoff
- Task errors: Report to user, don't retry automatically
- Timeout: Report to user, offer to retry with narrower scope

### Extracting Results

When `status === "complete"`, the `results` field contains:
- **Summary**: High-level overview of findings
- **Key Findings**: Main discoveries organized by topic
- **Sources**: List of sources consulted
- **Analysis**: Detailed analysis and synthesis

**Parse results carefully:**
- Check for structure of results object
- Extract relevant sections
- Format for user consumption
- Include source attribution

## Query Optimization for Neural Search

### Effective Query Patterns

**Conceptual Exploration:**
```
Good: "What are the fundamental trade-offs between different approaches to state management in modern web applications?"
Why: Asks about concepts and relationships, not just keywords
```

**Problem-Solution:**
```
Good: "I'm building a real-time collaborative editing system. What are the current approaches to handling conflict resolution and synchronization?"
Why: Provides context and describes the problem space
```

**Comparative Understanding:**
```
Good: "Help me understand how different NoSQL databases approach consistency and availability trade-offs"
Why: Seeks understanding of relationships and comparisons
```

### Ineffective Query Patterns

**Keyword Lists:**
```
Bad: "React hooks useState useEffect useContext"
Why: No semantic context, just keywords
Better: "Explain how React hooks enable state and side effect management in functional components"
```

**Over-Specification:**
```
Bad: "Show me exactly how to implement JWT authentication with refresh tokens in Node.js Express using bcrypt for password hashing"
Why: Too specific, limits semantic exploration
Better: "What are the current best practices for implementing secure authentication in Node.js applications?"
```

**Search Instructions:**
```
Bad: "Search for information about GraphQL vs REST"
Why: EXA always searches, don't need to instruct it
Better: "Compare GraphQL and REST APIs for building modern web services, focusing on performance and developer experience"
```

## Error Handling and Troubleshooting

### Quick Diagnostic Table

| Symptom | Check | Fix |
|---------|-------|-----|
| Tool not found | Run `search_tools({ query: "exa" })` | Use exact returned name |
| Connection refused | `curl http://localhost:4000/health` | Start proxy |
| 401 Unauthorized | Check `EXA_API_KEY` env var | Set/fix API key |
| 429 Rate limited | Request frequency | Add delays (10+ seconds) |
| Timeout | Query complexity | Narrow query scope |
| Bad results | Query format | Use natural language |

### Common Issues

**Issue 1: "Tool not found" errors**

Symptom: Calling `mcp__exa__search` fails with "tool not found"

Cause: Wrong tool name or namespace

Solution:
```javascript
// 1. Discover correct tool name
const tools = search_tools({ query: "exa" });
console.log(tools);  // See actual available tools

// 2. Use exact name from results
// If results show mcp__mcp-proxy__web_search_exa, use that exact name
```

**Issue 2: Connection refused / Proxy errors**

Symptom: `mcp__mcp-proxy__*` tools fail with connection errors

Cause: MCP proxy not running

Solution:
```bash
# Check proxy status
curl http://localhost:4000/health

# Start proxy if not running
claude-workflow proxy start
```

**Issue 3: API key errors / 401 Unauthorized**

Symptom: EXA calls return 401 or "invalid API key"

Cause: EXA_API_KEY not set or invalid

Solution:
```bash
# Set API key
export EXA_API_KEY=your_actual_key

# Verify it's set
echo $EXA_API_KEY

# Restart proxy to pick up new key
claude-workflow proxy restart
```

**Issue 4: Rate limiting / 429 errors**

Symptom: EXA calls return 429 Too Many Requests

Cause: Too many requests in short period

Solution:
```javascript
// Add delay between requests
await sleep(5000);  // Wait 5 seconds

// Or implement exponential backoff
const backoff = Math.min(1000 * Math.pow(2, attempt), 60000);
await sleep(backoff);
```

**Issue 5: Deep researcher timeout**

Symptom: Polling exceeds timeout without completion

Cause: Query too broad or EXA service overloaded

Solution:
```javascript
// Option 1: Narrow the query
// Bad: "Research everything about AI"
// Good: "Research transformer architecture improvements in 2024"

// Option 2: Increase timeout
const maxAttempts = 120;  // 20 minutes

// Option 3: Fall back to web search
if (timeout) {
  WebSearch({ query: "narrower version of query" });
}
```

**Issue 6: Empty or irrelevant results**

Symptom: EXA returns results that don't match query

Cause: Query not optimized for neural search

Solution:
```javascript
// Bad: Keyword-style query
mcp__mcp-proxy__web_search_exa({ query: "React hooks useState" })

// Good: Natural language query with context
mcp__mcp-proxy__web_search_exa({
  query: "How do I properly manage component state in React using hooks, specifically useState and useEffect for side effects?"
})
```

**Issue 7: Task Error Status**

Symptom: `status === "error"` in polling response

Cause: Query too broad/narrow or service error

Solution:
1. Check error message for specifics
2. Reformulate query if it's too broad/narrow
3. Retry with different phrasing
4. Fall back to Neural Web Search

## Best Practices

### DO:

✅ **Use natural language for queries**
```
Good: "What are the emerging trends in serverless architecture for 2024-2025?"
Bad: "serverless trends 2024 2025"
```

✅ **Provide context and intent**
```
Good: "I'm evaluating database options for a high-traffic e-commerce platform. What are the current best practices for handling inventory and order data at scale?"
```

✅ **Use Deep Researcher for comprehensive analysis**
```
When: Complex topics requiring multiple sources and perspectives
How: Start task, poll patiently, extract comprehensive results
```

✅ **Implement proper polling intervals**
```
Wait: 5-10 seconds between polling attempts
Timeout: Set reasonable limits (5-10 minutes)
```

✅ **Handle errors gracefully**
```
Network errors: Retry with backoff
Task errors: Report and offer alternatives
Timeouts: Suggest narrower scope
```

### DON'T:

❌ **Don't use keyword-style queries**
```
Bad: "React performance optimization techniques"
Good: "What are the current best practices for optimizing React application performance in production environments?"
```

❌ **Don't poll too frequently**
```
Bad: Poll every 1 second (may hit rate limits)
Good: Poll every 5-10 seconds
```

❌ **Don't ignore async workflow**
```
Bad: Expect deep_researcher_start to return results immediately
Good: Start task, get task_id, poll with deep_researcher_check
```

❌ **Don't use EXA for simple facts**
```
Bad: "What is the capital of France?"
Good: Use traditional search or web tools for simple facts
```

❌ **Don't forget error handling**
```
Bad: Poll indefinitely without timeout
Good: Set maximum attempts and handle timeouts
```

## Integration with Other Skills

**Combine with task-maker:**
After research, create implementation tasks based on findings from EXA research.

**Combine with documentation-writing:**
Turn comprehensive EXA research into structured technical documentation.

**Combine with feature-planner:**
Use EXA deep research to inform feature planning and architectural decisions.

**Combine with Context7:**
Use EXA to discover libraries/approaches, then Context7 to get specific API documentation.

## Examples

### Example 1: Semantic Web Search

```
Task: Explore current approaches to real-time collaboration

Query: "What are the current architectural patterns for building real-time collaborative applications, and how do they handle conflict resolution and state synchronization?"

Capability: Neural Web Search
(Discover tool: search_tools(query="exa web search"))

Why EXA: Semantic understanding needed to find related architectural concepts
```

### Example 2: Comprehensive Deep Research

```
Task: Research AI safety and ethics comprehensively

Step 1 - Start research:
Query: "Conduct comprehensive research on AI safety practices and ethical considerations in deploying large language models in production environments"

Capability: Deep Researcher Start
(Discover tool: search_tools(query="exa research start"))

Step 2 - Poll for results:
task_id: [from step 1 response]

Capability: Deep Researcher Check
(Discover tool: search_tools(query="exa research check"))
Poll every 10 seconds until complete

Why EXA: Comprehensive analysis requiring exhaustive sources and deep investigation
```

### Example 3: Exploratory Concept Research

```
Task: Discover edge computing patterns

Query: "I'm interested in understanding how edge computing is evolving beyond simple CDN use cases. What are the innovative applications and architectural patterns emerging in this space?"

Capability: Neural Web Search
(Discover tool: search_tools(query="exa web search"))

Why EXA: Exploratory research requiring semantic understanding of emerging concepts
```

### Example 4: Multi-Stage Research Workflow

```
Task: Research and validate new technology adoption

Stage 1 - Explore landscape (EXA Neural Search):
"What are the current approaches to building offline-first web applications?"

Stage 2 - Deep dive (EXA Deep Researcher):
"Conduct comprehensive research on [specific approach from stage 1]"

Stage 3 - Verify specific claims (Web search):
"What is the current browser support for [specific API]?"

Stage 4 - Get documentation (Context7):
"Show me the API documentation for [chosen library]"
```

## Tool Search Tool Integration

When the EXA MCP server has `defer_loading: true` configured, tools are discovered on-demand using the Tool Search Tool. This reduces initial token usage while maintaining full functionality.

**How it works:**
1. Common EXA tools can be marked to load immediately with `defer_loading: false`
2. Specialized tools are discovered dynamically when needed
3. Claude searches for tools by name and description
4. Matching tools are loaded into context on-demand

**Configuration in `.mcp.json`:**
```json
{
  "mcpServers": {
    "exa": {
      "command": "npx",
      "args": ["-y", "@exa/mcp-server"],
      "env": {
        "EXA_API_KEY": "${EXA_API_KEY}"
      },
      "default_config": {
        "defer_loading": true
      },
      "configs": {
        "mcp__exa__web_search_exa": {
          "defer_loading": false
        }
      }
    }
  }
}
```

**No workflow changes required** - tool discovery happens automatically. The only difference is reduced initial token usage (~85% reduction with multiple MCP servers).

**Learn more:** See `docs/deferred-mcp-loading.md` for comprehensive guide.

## Success Metrics

Effective EXA research provides:
- Semantically relevant results matching conceptual intent
- Comprehensive coverage of topic (especially with deep researcher)
- Discovery of non-obvious connections and related concepts
- Sources that align with research goals
- Insights beyond what keyword search would provide

## Quick Reference Card

| Task Type | Tool | Query Pattern |
|-----------|------|---------------|
| **Semantic exploration** | Neural Web Search | "What are [concepts/approaches] for [problem/domain]?" |
| **Quick search** | Neural Web Search | "[Natural language description of what you're looking for]" |
| **Comprehensive research** | Deep Researcher | "Conduct research on [topic] focusing on [aspects]" |
| **Concept discovery** | Neural Web Search | "I'm exploring [topic]. What are the current [patterns/approaches]?" |
| **Async workflow** | Deep Researcher | Start → Poll → Extract results |

## EXA Research Decision Tree

```
Need research?
  ├─ Quick factual answer? → Traditional search tools
  ├─ Semantic/concept exploration? → EXA (Neural Web Search)
  ├─ Comprehensive deep dive? → EXA (Deep Researcher)
  └─ Current events/news? → Traditional web search
```

## Summary

EXA provides neural/semantic search capabilities for comprehensive research needs.

**Key Strengths:**
- Semantic understanding beyond keyword matching
- Natural language query processing
- Comprehensive deep research (async workflow)
- Conceptual exploration and discovery

**When to Choose EXA:**
- Exploratory research requiring semantic understanding
- Comprehensive analysis with exhaustive sources
- Finding content based on meaning, not just keywords
- Time allows for async deep research workflow

**Remember:** EXA excels at understanding what you're looking for conceptually. Use natural, conversational queries that describe your intent and context.
