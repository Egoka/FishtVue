---
name: workflow-generator
description: Create new claude-workflow YAML workflows interactively. Use when building multi-phase agent pipelines, defining workflow orchestration, creating slash commands with agent sequences, or designing automated workflows with conditions and retry loops.
---

# Workflow Generator

Interactively create new claude-workflow YAML workflow definitions. Guides you through phases, agents, conditions, entry commands, and output schemas.

## When to Use This Skill

- Creating a new multi-phase workflow from scratch
- Designing an agent orchestration pipeline
- Adding a slash command that triggers a workflow
- Building retry loops, conditional branching, or parallel agent patterns
- Converting a manual multi-step process into an automated workflow

## When NOT to Use This Skill

- **Single agent tasks** - Just spawn the agent directly, no workflow needed
- **Modifying existing workflows** - Edit the YAML file directly
- **Creating agents** - Use the `agent-developer` skill
- **Creating skills** - Use the `skill-developer` skill

## Common Queries

1. "Create a new workflow for deploying to production"
2. "Build a workflow that does X then Y then Z"
3. "I need a multi-phase pipeline with retry"
4. "Create a slash command workflow for code review"
5. "Design a workflow with parallel agents"
6. "Help me create a workflow YAML"
7. "New workflow for content generation"
8. "Build an automated testing pipeline workflow"

## Interactive Creation Process

### Step 1: Understand the Goal

Ask the user:
- **What does this workflow accomplish end-to-end?**
- **What are the major steps/phases?**
- **Should any phase run multiple agents in parallel?**
- **Does any phase need retry on failure?**
- **Should this have a slash command trigger?**

### Step 2: Select Agents Per Phase

Each phase needs an agent. Available agents:

| Category | Agents |
|----------|--------|
| **Planning** | `feature-planner`, `research-planner`, `v0-planner`, `cto-architect`, `backlog-plan-generator` |
| **Research** | `research`, `Explore` |
| **Implementation** | `frontend-engineer`, `backend-engineer`, `devops-engineer`, `3d-engineer` |
| **Code Quality** | `code-reviewer`, `lint-fixer`, `lint-resolution-planner`, `auto-fixer`, `debugger` |
| **Testing** | `qa-engineer`, `qa-resolution-planner` |
| **Tasks** | `task-maker`, `task-reviewer`, `task-status-auditor` |
| **UI Generation** | `v0-ui-generator`, `ui-style-analyzer`, `style-guide-generator` |
| **Setup/Config** | `config-setup-agent`, `cleanup-agent` |
| **Video** | `demo-planner`, `demo-recorder`, `demo-reviewer`, `surreal-clip-generator`, `surreal-clip-compositor`, `surreal-video-reviewer` |
| **Migration** | `tailwind-migration-planner`, `tailwind-migrator`, `vue-react-planner`, `vue-react-converter` |
| **Docs/PR** | `docs-generator`, `pr-document-maker`, `pitch-deck-generator` |
| **X/Twitter** | `x-account-creator`, `x-account-operator`, `x-profile-setup`, `email-provisioner` |
| **Orchestration** | `workflow-aggregator` |
| **Other** | `domain-namer`, `domain-purchaser`, `logo-designer`, `rigging-agent`, `scene-configurator`, `skill-analyzer`, `agent-analyzer` |

If no existing agent fits, note it -- the user may need to create one first using the `agent-developer` skill.

### Step 3: Design Phase Transitions

Choose a pattern for each transition:

**Linear** (most common):
```yaml
next: next_phase_id
next_conditions: []
```

**Retry loop** (phase retries itself on failure):
```yaml
next: next_phase_id
max_iterations: 3
next_conditions:
  - condition: any_failed
    next_phase: same_phase_id
  - condition: all_passed
    next_phase: next_phase_id
```

**QA feedback loop** (reviewer sends back to worker):
```yaml
# On the review phase:
next_conditions:
  - condition: all_passed
    next_phase: null  # done
  - condition: any_failed
    next_phase: worker_phase_id  # redo
```

**Terminal phase** (workflow ends):
```yaml
next: null
next_conditions: []
```

### Step 4: Configure Agent Counts

| Value | When to Use |
|-------|-------------|
| `count: 1` | Planning, review, verification, aggregation phases |
| `count: N` | Fixed parallel agents (e.g., always 3 reviewers) |
| `count: from_previous` | One agent per result from previous phase |
| `count: from_previous` + `count_field` | Extract count from specific JSON path |
| `count: failed_only` | Respawn only for failed items |
| `count: by_assignment` | Dynamic agent type based on task data |

When using `from_previous` with a planner that outputs structured JSON, specify `count_field`:
```yaml
count: from_previous
count_field: results.fix_groups      # dot-path into previous output
```

### Step 5: Add Optional Features

**Entry point** (slash command trigger):
```yaml
entry:
  command: /my-workflow
  aliases:
    - /mw
    - /my-wf
  auto_detect:
    keywords: ["relevant", "trigger", "words"]
    min_score: 2
```

**Global settings:**
```yaml
settings:
  max_concurrent_agents: 3    # parallel limit
  agent_timeout_ms: 300000    # 5 min per agent
  retry_failed_agents: true
  max_retries: 2
```

**Phase context** (extra instructions for agents):
```yaml
context:
  instruction: "Focus on security aspects only."
  include_files:
    - package.json
    - tsconfig.json
```

**Output schema** (typed agent output for orchestration):
```yaml
output_schema: my-planner.schema.json
```

**Aggregation** (for collecting multi-agent results):
```yaml
aggregation: collect_all
# or expanded:
aggregation:
  mode: collect_all    # collect_all | first_success | majority
  timeout_ms: 30000
```

**Dynamic agent routing:**
```yaml
agent: by_assignment
assignment_field: results.task.assignee
agent_mapping:
  frontend: frontend-engineer
  backend: backend-engineer
  default: general-purpose
```

### Step 6: Generate the YAML

Write the workflow file to:
```
.claude/workflows/{workflow-name}.yml
```

Always include the schema reference on line 1:
```yaml
# yaml-language-server: $schema=../schemas/workflow.schema.json
```

### Step 7: Create Matching Command (Optional)

If the workflow has an `entry.command`, create a matching command file at:
```
.claude/commands/{command-name}.md
```

Command template:
```markdown
---
description: {description}
argument-hint: <brief or description>
---

# {Workflow Name}

$ARGUMENTS

## MANDATORY: Spawn {First Agent} First

You MUST immediately spawn the {first agent} agent:

\```
Task(subagent_type="{first-agent}", prompt="...")
\```

## CRITICAL: Follow Hook Orchestration Instructions

After each agent completes, the hook system will tell you what to spawn next.

**DO:**
- Spawn the first agent immediately
- Follow hook instructions for subsequent agents
- Wait for each phase to complete before proceeding

**DON'T:**
- Enter Plan mode to decide what to do
- Manually select which agents to spawn
- Skip phases or combine work
- Spawn agents the hooks didn't request
```

### Step 8: Validate

After generating, verify:
- [ ] `name` is kebab-case
- [ ] All phase `id` values are snake_case and unique
- [ ] Every `next` references a valid phase id or `null`
- [ ] Every `next_conditions[].next_phase` references a valid phase id or `null`
- [ ] Retry loops have `max_iterations` set
- [ ] `from_previous` phases follow a phase that produces multiple results
- [ ] Terminal phase has `next: null`
- [ ] No orphan phases (every phase is reachable)

## Complete Workflow Template

```yaml
# yaml-language-server: $schema=../schemas/workflow.schema.json

name: my-workflow
description: |
  What this workflow does end-to-end.
  Phase 1: ...
  Phase 2: ...

entry:
  command: /my-workflow
  aliases:
    - /mw

settings:
  max_concurrent_agents: 3
  agent_timeout_ms: 300000

phases:
  - id: planning
    agent: feature-planner
    count: 1
    description: Analyze requirements and create plan
    next: execution
    output_schema: feature-planner.schema.json

  - id: execution
    agent: frontend-engineer
    count: from_previous
    count_field: results.feature_plan.tasks
    description: Execute planned tasks in parallel
    next: review
    max_iterations: 3
    next_conditions:
      - condition: any_failed
        next_phase: execution
      - condition: all_passed
        next_phase: review

  - id: review
    agent: code-reviewer
    count: 1
    aggregation: collect_all
    description: Review all changes
    next: null

metadata:
  author: claude-workflow
  created: "YYYY-MM-DD"
  tags: [tag1, tag2]

version: "1.0.0"
```

## Workflow Patterns Cookbook

### Pattern: Planner -> Parallel Workers -> Reviewer
Best for: lint fixing, testing, migration, implementation
```
planner (count:1) -> workers (count:from_previous) -> reviewer (count:1)
```

### Pattern: Generator -> QA Feedback Loop
Best for: video, content, code generation with quality gates
```
generator (count:1) <-> reviewer (count:1, loops back on failure)
```

### Pattern: Sequential Pipeline
Best for: setup, onboarding, deployment
```
step1 (count:1) -> step2 (count:1) -> step3 (count:1)
```

### Pattern: Research -> Plan -> Execute -> Review
Best for: feature development, complex tasks
```
research-planner -> research (parallel) -> feature-planner -> task-maker (parallel) -> implementation (by_assignment) -> code-reviewer
```

### Pattern: Batch with Retry
Best for: account creation, data processing, bulk operations
```
prepare (count:1) -> execute (from_previous, max_iterations:3, retry on any_failed) -> finalize (count:1)
```

## Condition Reference

| Condition | True When | Common Use |
|-----------|-----------|------------|
| `all_passed` | Every agent in the phase succeeded | Advance to next phase |
| `any_failed` | At least one agent failed | Retry loop or escalation |
| `partial_success` | Some passed, some failed | Partial retry |

## Quick Reference

```yaml
# Required top-level fields
name: kebab-case-name
description: "What it does"
phases: [...]

# Required phase fields
id: snake_case_id
agent: agent-name
count: 1 | from_previous | failed_only | by_assignment
next: phase_id | null

# Optional phase fields
description: "Human readable"
next_conditions: [{condition: ..., next_phase: ...}]
max_iterations: 3
output_schema: schema-file.json
count_field: results.path.to.array
context: {instruction: "...", include_files: [...]}
aggregation: collect_all | {mode: ..., timeout_ms: ...}
settings: {retry_failed_agents: true, ...}
assignment_field: results.task.assignee
agent_mapping: {frontend: frontend-engineer, default: general-purpose}

# Optional top-level fields
entry: {command: /cmd, aliases: [...], auto_detect: {keywords: [...], min_score: 2}}
settings: {max_concurrent_agents: 3, agent_timeout_ms: 300000, ...}
version: "1.0.0"
metadata: {author: ..., created: "YYYY-MM-DD", tags: [...]}
global_timeout_ms: 600000
```

## File Locations

| File | Path |
|------|------|
| Workflow YAML | `.claude/workflows/{name}.yml` |
| Command file | `.claude/commands/{name}.md` |
| Agent definitions | `.claude/agents/{name}.md` |
| Output schemas | `src/output-types/{name}.schema.json` |
| Workflow schema | `.claude/schemas/workflow.schema.json` |
