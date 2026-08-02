---
name: sequential-thinking
description: Structured multi-step reasoning via Sequential Thinking MCP. Use for architecture decisions with 3+ options, library comparisons, debugging complex issues, trade-off analysis, or decisions requiring hypothesis testing. Provides dynamic reasoning chains with branching and revision support.
---

# Sequential Thinking Skill

Use Sequential Thinking (MCP tool) for complex decisions requiring multi-step reasoning, hypothesis tracking, or structured analysis.

## What is Sequential Thinking?

Sequential Thinking is an MCP server that provides:
- Dynamic reasoning chains that can grow or terminate based on analysis
- Branching support for exploring alternative approaches
- Persistent thought tracking within a session
- Structured output for complex decision documentation

## When to Use This Skill

**TRIGGER CONDITIONS - Use Sequential Thinking when:**

1. **Complex Architectural Decisions**
   - Choosing between 3+ viable technology options
   - Designing system with multiple interacting components
   - Trade-off analysis with competing concerns
   - Migration strategy planning

2. **Multi-Step Debugging**
   - Root cause analysis requiring hypothesis testing
   - Issues spanning multiple system layers
   - Performance problems with unclear source
   - Integration failures between services

3. **Complex Task Breakdown**
   - Features with 5+ acceptance criteria
   - Cross-cutting concerns (security, performance, accessibility)
   - Tasks requiring multiple specialized agents
   - Uncertain scope requiring iterative refinement

4. **Technology Comparisons**
   - Library selection with multiple candidates
   - Framework evaluation for specific use case
   - Infrastructure decisions (cloud, deployment, etc.)

## When NOT to Use This Skill

**EXIT CONDITIONS - Do NOT use Sequential Thinking when:**

1. **Simple Questions**
   - Direct answers exist in documentation
   - Single-step operations
   - Well-documented patterns in codebase
   - Standard CRUD operations

2. **Time-Sensitive Operations**
   - Real-time user interactions
   - Simple file operations
   - Straightforward bug fixes
   - Documentation updates

3. **Already Decided**
   - Architecture already documented
   - Technology stack is fixed
   - Pattern is established in codebase
   - User has specified approach

4. **Low Complexity Tasks**
   - Tasks with < 3 acceptance criteria
   - Single-file changes
   - Cosmetic/styling updates
   - Test additions for existing code

## Common Queries

Example queries that would trigger this skill:

1. "Help me think through the trade-offs between PostgreSQL and MongoDB for this use case"
2. "Compare these three authentication approaches and help me decide"
3. "I need to analyze the pros and cons of microservices vs monolith"
4. "Walk me through the decision process for choosing a cloud provider"
5. "Help me reason through this complex debugging scenario step by step"
6. "Analyze the architectural implications of adding real-time features"
7. "I'm stuck between multiple solutions - help me think this through"
8. "Break down this complex feature into a logical implementation sequence"
9. "Help me evaluate the risks and benefits of this migration strategy"
10. "Think through the performance implications of each caching approach"

## Tool Parameters

### Core Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `thought` | string | Yes | Current reasoning step (be specific!) |
| `thoughtNumber` | number | Yes | Position in chain (1-indexed) |
| `totalThoughts` | number | Yes | Estimated total (can revise up/down) |
| `nextThoughtNeeded` | boolean | Yes | `false` to conclude thinking |

### Branching Parameters (Optional)

| Parameter | Type | Description |
|-----------|------|-------------|
| `branchId` | string | Unique ID for this branch (e.g., "approach-a") |
| `branchFromThought` | number | Thought number to branch from |

## Usage Patterns

### Pattern 1: Linear Analysis (Most Common)

```typescript
// Thought 1: Problem definition
sequential_thinking({
  thought: "Analyzing authentication options for Next.js 14 app. Requirements: OAuth support, session management, role-based access.",
  thoughtNumber: 1,
  totalThoughts: 4,
  nextThoughtNeeded: true
})

// Thought 2: Option evaluation
sequential_thinking({
  thought: "Evaluating NextAuth.js v5: Pros - official, wide adoption, OAuth built-in. Cons - session-based by default, learning curve for v5 API.",
  thoughtNumber: 2,
  totalThoughts: 4,
  nextThoughtNeeded: true
})

// Thought 3: Alternative evaluation
sequential_thinking({
  thought: "Evaluating Clerk: Pros - fully managed, excellent DX, built-in components. Cons - vendor lock-in, pricing at scale, less customization.",
  thoughtNumber: 3,
  totalThoughts: 4,
  nextThoughtNeeded: true
})

// Thought 4: Decision (MUST set nextThoughtNeeded: false)
sequential_thinking({
  thought: "DECISION: NextAuth.js v5 selected. Rationale: Team already has experience, avoids vendor lock-in, sufficient for MVP scale. Migration to managed solution possible later if needed.",
  thoughtNumber: 4,
  totalThoughts: 4,
  nextThoughtNeeded: false  // CRITICAL: Stop thinking
})
```

### Pattern 2: Branching Analysis (Complex Decisions)

```typescript
// Main branch: Initial analysis
sequential_thinking({
  thought: "Database selection for multi-tenant SaaS. Options: PostgreSQL with RLS, MongoDB with tenant collections, separate databases per tenant.",
  thoughtNumber: 1,
  totalThoughts: 3,
  nextThoughtNeeded: true
})

// Branch A: Explore PostgreSQL path
sequential_thinking({
  thought: "PostgreSQL + RLS path: Row-level security provides tenant isolation. Single database simplifies operations. Query performance may degrade at scale without careful indexing.",
  thoughtNumber: 2,
  totalThoughts: 4,
  branchId: "postgres-rls",
  branchFromThought: 1,
  nextThoughtNeeded: true
})

// Branch B: Explore MongoDB path
sequential_thinking({
  thought: "MongoDB path: Tenant per collection allows flexible schemas. Horizontal scaling easier. Complex cross-tenant queries become difficult.",
  thoughtNumber: 2,
  totalThoughts: 4,
  branchId: "mongodb",
  branchFromThought: 1,
  nextThoughtNeeded: true
})

// Return to main, make decision
sequential_thinking({
  thought: "DECISION after branch analysis: PostgreSQL + RLS. Team expertise exists, RLS provides audit trail, single-database operations align with small team. MongoDB flexibility not needed for current schema stability.",
  thoughtNumber: 3,
  totalThoughts: 3,
  nextThoughtNeeded: false
})
```

### Pattern 3: Debugging Hypothesis Testing

```typescript
// Hypothesis 1
sequential_thinking({
  thought: "Performance degradation in /api/users endpoint. Hypothesis 1: N+1 query problem. Evidence: Response time scales linearly with user count.",
  thoughtNumber: 1,
  totalThoughts: 4,
  nextThoughtNeeded: true
})

// Test hypothesis
sequential_thinking({
  thought: "Testing H1: Analyzed SQL logs. Found 1 query per user for profile images. Confirmed N+1 pattern. Solution: Add eager loading.",
  thoughtNumber: 2,
  totalThoughts: 3,  // Reduced - found issue early
  nextThoughtNeeded: true
})

// Resolution
sequential_thinking({
  thought: "RESOLUTION: Added .include({ profileImage: true }) to user query. Response time now O(1) regardless of user count. P95 improved from 2.3s to 180ms.",
  thoughtNumber: 3,
  totalThoughts: 3,
  nextThoughtNeeded: false
})
```

## Integration with Agents

### cto-architect Agent

Use Sequential Thinking in **Phase 1.5** for complex architecture decisions:

```markdown
### Phase 1.5: Complex Decision Analysis (When Needed)

**TRIGGER:** If Phase 1 requirements reveal 3+ viable technology options
OR significant architectural trade-offs exist.

Use Sequential Thinking to:
1. Document the decision space
2. Evaluate each option against requirements
3. Consider team expertise and constraints
4. Make documented decision with rationale

**EXIT:** Conclude with DECISION thought, continue to Phase 2.
```

### task-maker Agent

Use Sequential Thinking when **complexity threshold exceeded**:

```markdown
### Complexity Detection

**TRIGGER Sequential Thinking if:**
- Task has 5+ acceptance criteria
- Multiple agent types involved (frontend + backend + devops)
- External integrations with unknown APIs
- Security-sensitive implementations
- Performance-critical paths

**SKIP if:**
- Task is single-type (only frontend, only backend)
- Well-documented pattern exists in codebase
- Task has < 5 acceptance criteria
- Direct implementation path is clear
```

## Exit Criteria (CRITICAL)

**ALWAYS set `nextThoughtNeeded: false` when:**

1. Decision is made (include "DECISION:" prefix in thought)
2. Root cause identified (include "RESOLUTION:" prefix)
3. All options evaluated and ranked
4. Analysis complete - action items clear
5. Maximum thoughts reached (typically 5-7 for most decisions)

**WARNING:** Failing to set `nextThoughtNeeded: false` causes indefinite loops!

## Anti-Patterns to Avoid

### Anti-Pattern 1: Over-Thinking Simple Decisions

```typescript
// BAD: Using sequential thinking for trivial choice
sequential_thinking({
  thought: "Should I use let or const for this variable...",
  // This is obvious - just use const! Don't invoke sequential thinking.
})
```

### Anti-Pattern 2: Missing Exit Condition

```typescript
// BAD: Never setting nextThoughtNeeded: false
sequential_thinking({
  thought: "Final decision made: Use PostgreSQL",
  thoughtNumber: 5,
  totalThoughts: 5,
  nextThoughtNeeded: true  // WRONG! Should be false
})
```

### Anti-Pattern 3: Vague Thoughts

```typescript
// BAD: Non-specific thinking
sequential_thinking({
  thought: "Thinking about databases...",  // Too vague!
  // Should be: "Evaluating PostgreSQL vs MongoDB for multi-tenant SaaS with 10k expected users..."
})
```

## Best Practices

### DO:
- Start with clear problem statement in thought 1
- Be specific in each thought (include metrics, constraints)
- Revise totalThoughts as clarity emerges
- Use branching for genuinely different approaches
- ALWAYS terminate with nextThoughtNeeded: false
- Prefix conclusions with DECISION: or RESOLUTION:

### DON'T:
- Use for simple, obvious decisions
- Continue thinking after decision is clear
- Use vague or generic thought content
- Skip the exit condition
- Over-branch (2-3 branches max)
- Use for time-sensitive operations

## Quick Reference

| Scenario | Use Sequential Thinking? | Thoughts Estimate |
|----------|-------------------------|-------------------|
| Auth library selection | Yes | 3-4 |
| Database architecture | Yes, with branches | 4-6 |
| Bug root cause analysis | Yes | 2-4 |
| Task breakdown (5+ ACs) | Yes | 3-5 |
| Simple CRUD endpoint | No | - |
| CSS styling update | No | - |
| Well-documented pattern | No | - |
| Single-file bug fix | No | - |

## Tool Discovery

Sequential Thinking capabilities are available through MCP. Tool names vary by environment:

**Standard mode:** `mcp__sequential-thinking__*`
**Proxy mode:** `mcp__mcp-proxy__sequential-thinking`

To discover:
```
search_tools(query="sequential thinking")
```
