---
name: task-management
description: Manages existing backlog tasks using backlog.md CLI. Use when updating task status, checking acceptance criteria, or managing task workflow. For CREATING new tasks, use the task-maker agent instead.
---

# Task Management Skill

This skill helps you manage existing backlog tasks using the backlog.md CLI. **For creating NEW tasks, use the task-maker agent instead** (automatically triggered by "create task" patterns).

## When to Use This Skill

- Starting work on an existing task
- Updating task progress and status
- Checking acceptance criteria
- Managing task lifecycle (draft → pending → in progress → done)
- Understanding the task template structure
- Documenting blockers and progress

## Common Queries

Example user queries that should route to this skill:

1. "What tasks are there?"
2. "Show me my current tasks"
3. "List all pending tasks"
4. "Update task status to in-progress"
5. "Mark task 42 as complete"
6. "What tasks are blocked?"
7. "Check acceptance criteria for current task"
8. "View task dependencies"
9. "Show tasks by priority"
10. "What's the status of task 50?"

## 📁 Task File Location (CRITICAL)

**ALL task files MUST be created in `backlog/tasks/` (relative to where `.claude/` is located):**
- ✅ **Correct:** `backlog/tasks/task-42-authentication.md`
- ❌ **Wrong:** `backlog/tasks/frontend/task-42-authentication.md` ← subdirectory WITHIN backlog/tasks/
- ❌ **Wrong:** `backlog/pending/task-42-authentication.md`
- ❌ **Wrong:** `backlog/task-42-authentication.md`

**CRITICAL CLARIFICATION - What "subdirectory" means:**
- ❌ **WRONG:** Subdirectories **inside** `backlog/tasks/` like `backlog/tasks/frontend/`
- ✅ **OK:** Project itself is in a subfolder (e.g., `monorepo/api/.claude/` → tasks go in `monorepo/api/backlog/tasks/`)

**IGNORE SUBDIRECTORIES WITHIN backlog/tasks/:**
- Even if `backlog/tasks/frontend/` or other subdirectories exist **inside backlog/tasks/**, **DO NOT use them**
- Subdirectories may exist from legacy projects or migrations
- They are **NOT** valid locations for new tasks
- Always create new tasks directly in `backlog/tasks/` (not in any subfolder of backlog/tasks/)

**Why this matters:**
- The backlog CLI expects tasks in `backlog/tasks/` (flat structure)
- Status changes and queries rely on this path
- Task templates and automation assume this structure

## ⚠️ CRITICAL: Task Creation vs Task Management

**This skill is for MANAGING existing tasks only.**

**For CREATING new tasks:**
- Use the **task-maker agent** instead (spawned automatically by Claude)
- task-maker provides:
  - Automatic library research using Context7 MCP tools
  - Codebase exploration for existing patterns
  - Implementation-ready tasks with detailed code snippets
  - All mandatory sections and acceptance criteria

**Trigger patterns for task-maker agent:**
- "Create a task to..."
- "I need to implement..."
- "Add a feature that..."
- "Build..."

**This skill (task-management) only handles:**
- Updating task status
- Checking acceptance criteria
- Managing task workflow
- Progress tracking

## Task Template Structure Reference

Every task MUST include:

**Frontmatter:**
```yaml
---
id: task-42
title: Clear, action-oriented title
status: To Do
type: frontend  # REQUIRED: frontend|backend|devops|testing|documentation|research
assignee: [frontend-engineer]  # Auto-assigned based on type
created_date: '2024-01-15'
labels:
  - feature  # or bug, enhancement, refactor, etc.
priority: medium  # or high, low
dependencies: []  # task-41, task-39
---
```

**⚠️ CRITICAL: Single Type Per Task Rule**

Every task must have EXACTLY ONE type:
- **`frontend`** → `assignee: [frontend-engineer]`
- **`backend`** → `assignee: [backend-engineer]`
- **`devops`** → `assignee: [devops-engineer]`
- **`testing`** → `assignee: [general-purpose]`
- **`documentation`** → `assignee: [general-purpose]`
- **`research`** → `assignee: [research]`

**Mixed-type tasks are NOT allowed:**
- ❌ "Fix UI bug and check API endpoint" (frontend + backend)
- ✅ Split into: task-A (frontend: fix UI) + task-B (backend: verify API)

**If you see a mixed-type task:**
1. Flag it immediately
2. Ask user to split it into separate tasks
3. Use feature-planner agent for multi-type features

**Required Sections:**
1. **Description** - What and why (be specific)
2. **Implementation Summary** - Fill out AFTER implementation
3. **Acceptance Criteria** - Core criteria + task-specific
4. **Implementation Plan** - Step-by-step technical approach
5. **Documentation Plan** - What docs will be updated
6. **Dependencies** - Related tasks or blockers
7. **Progress Log** - Session continuity (update frequently)
8. **Clarification Log** - User Q&A tracking
9. **Notes** - Additional context

### Step 3: Use Draft Status for Incomplete Tasks

```bash
# Mark as draft when details need refinement
backlog task edit 42 --draft

# Promote to "To Do" when ready for implementation
backlog task edit 42 --promote
```

## Task Status Lifecycle

| Status | Location | Action |
|--------|----------|--------|
| Not Started, In Progress, Blocked | `backlog/tasks/` | Active work |
| Done | `backlog/completed/` | **MUST move file** |

### Completing a Task - Quick Reference

```bash
# 1. Mark as Done
backlog task edit <id> -s "Done"

# 2. Move to completed (DON'T SKIP)
mv backlog/tasks/task-<id>-*.md backlog/completed/
```

**This is MANDATORY for all completed tasks.**

**Note:** For full completion workflow including implementation agents and post-merge cleanup, see the detailed "Completing a Task" section below.

## Task Workflow Commands

### Viewing Tasks

```bash
# View specific task (always use --plain for AI)
backlog task view 42 --plain

# List all tasks
backlog task list --plain

# List by status
backlog task list --status "To Do" --plain
backlog task list --status "In Progress" --plain
backlog task list --status "Done" --plain

# Search for tasks
backlog task list --plain | grep -i "authentication"
```

### Starting a Task

**⚠️ CRITICAL: Check for assigned agent FIRST!**

```bash
# 0. Read task file and check for assigned agent
backlog task view 42 --plain

# Look for frontmatter fields:
# - type: frontend|backend|devops|testing|documentation|research
# - assignee: [agent-name]

# If assignee field exists → SPAWN THAT AGENT/SKILL (do NOT implement directly)
# - assignee: [frontend-engineer] → spawn frontend-engineer agent
# - assignee: [backend-engineer] → spawn backend-engineer agent
# - assignee: [devops-engineer] → spawn devops-engineer agent
# - assignee: [research] → spawn research agent
# - assignee: [general-purpose] → spawn general-purpose agent (testing/documentation)
```

**If NO assigned agent, proceed with implementation:**

```bash
# 1. Mark as in progress
backlog task edit 42 -s "In Progress"

# 2. Check first AC immediately
backlog task edit 42 --check-ac 1
```

### During Implementation

**Update progress frequently:**

```bash
# Check ACs as you complete them (real-time, not batched)
backlog task edit 42 --check-ac 2
backlog task edit 42 --check-ac 3

# Document blockers immediately
backlog task edit 42 --notes "Blocked: Missing API credentials for service X"

# Append to existing notes
backlog task edit 42 --append-notes "Resolved: Got credentials from team"
```

**Update Progress Log (edit task file directly):**

The Progress Log section must be updated manually by editing the task file:

```markdown
## Progress Log

2024-01-15 10:30 - Started task, marked as "In Progress"
2024-01-15 11:20 - Implemented authentication module
2024-01-15 11:21 - Files modified: auth/service.js, auth/controller.js
2024-01-15 14:30 - Implementation Summary filled out → CHECKED AC #3
2024-01-15 14:31 - Created backlog/docs summary file
2024-01-15 15:00 - Blocked: Need clarification on token expiry time
```

### Completing a Task

**⚠️ CRITICAL FOR IMPLEMENTATION AGENTS (backend-engineer, frontend-engineer, devops-engineer):**

You MUST move tasks to completed **BEFORE your session ends**. Do NOT wait for PR creation - that happens separately by the user.

```bash
# MANDATORY before ending session:
backlog task edit <id> -s "Done"
mv backlog/tasks/task-<id>-*.md backlog/completed/
```

**Complete workflow for finishing a task:**

```bash
# 1. Fill out Implementation Summary in task file
# (Edit the task file to complete all subsections: TLDR, What Changed, Technical Decisions, Known Limitations)

# 2. Create post-implementation summary in backlog/docs (MANDATORY)
mkdir -p backlog/docs
cat > backlog/docs/task-42-implementation.md << 'EOF'
# Task 42: Authentication Implementation

## What Was Built
[Brief summary of implementation]

## Key Decisions
[Technical decisions made during implementation]

## Files Changed
- auth/service.js - Core authentication logic
- auth/controller.js - API endpoints
- tests/auth.test.js - Test coverage

## Known Issues/Limitations
[Any limitations or follow-up work needed]

## Testing Notes
[How to test the implementation - only if tests were specified]

## Related Tasks
[Links to related or follow-up tasks]
EOF

# 3. If tests were requested in ACs, ensure they pass
# npm test           # Only if AC includes "All tests pass"
# npm run lint       # Only if AC includes "No lint errors"
# npm run typecheck  # Only if AC includes "No TypeScript errors"

# 4. Mark task as Done (MANDATORY)
backlog task edit 42 -s "Done"

# 5. Move to completed folder (MANDATORY)
mv backlog/tasks/task-42-*.md backlog/completed/
```

**Note:** User handles all git operations (commit, push, PR) manually as they prefer.

## Task Template Structure

### Core Acceptance Criteria

These MUST be included in every task:

```markdown
<!-- AC:BEGIN -->
- [ ] #1 Documentation updated/created for this change
- [ ] #2 All unclear requirements have been clarified with user
- [ ] #3 Implementation Summary section filled out completely
- [ ] #4 External integrations verified working (e.g., notifications received, not just sent)
<!-- AC:END -->
```

Then add task-specific criteria:

```markdown
- [ ] #5 User can log in with email and password
- [ ] #6 JWT token generated with 1-hour expiry
- [ ] #7 Refresh token mechanism implemented
- [ ] #8 Password reset flow working
```

### Optional Test Criteria (add only if user specifies tests)

Only add these if the user explicitly requests tests or the task involves testable code:

```markdown
- [ ] All tests pass completely (`npm test`)
- [ ] No lint errors (`npm run lint`)
- [ ] No TypeScript errors (`npm run typecheck` for TS projects)
```

**When to add test criteria:**
- New functions, classes, or modules
- Bug fixes (need regression tests)
- API endpoints or services
- Business logic changes

**When to skip test criteria:**
- Pure UI/styling changes
- Documentation only
- Configuration changes
- Asset updates

### Implementation Summary Section

**Fill this out BEFORE marking task as Done:**

```markdown
## Implementation Summary

**⚠️ CRITICAL: FILL OUT BEFORE MARKING TASK AS DONE**

### TLDR
Implemented JWT-based authentication with refresh tokens and password reset flow.

### What Changed
- Created auth service with login/logout/refresh endpoints
- Added JWT middleware for protected routes
- Implemented password hashing with bcrypt
- Created password reset email flow
- Added auth tests with 95% coverage

### Technical Decisions
- Used JWT over sessions for stateless authentication
- Chose 1-hour access token + 7-day refresh token strategy
- Implemented bcrypt with salt rounds of 10 for password hashing
- Used nodemailer for password reset emails

### Known Limitations
- Password reset tokens expire after 1 hour
- No rate limiting on login attempts yet (TODO for next task)
- Email sending is synchronous (could be queued for better performance)
```

## Common Task Patterns

### Creating a Feature Task

```markdown
---
id: task-42
title: Add user authentication with JWT
status: To Do
labels:
  - feature
priority: high
---

## Description

Implement JWT-based authentication to secure API endpoints. Users need to log in
with email/password and receive tokens for subsequent requests.

**Why:** Currently all endpoints are public. We need authentication before launch.

## Implementation Plan

1. Install dependencies (jsonwebtoken, bcrypt)
2. Create auth service with login/logout/refresh methods
3. Add JWT middleware for protected routes
4. Implement password hashing
5. Add password reset flow
6. Write comprehensive tests
7. Update API documentation

[... rest of template ...]
```

### Creating a Bug Fix Task

```markdown
---
id: task-43
title: Fix memory leak in user service
status: To Do
labels:
  - bug
  - critical
priority: high
---

## Description

User service is leaking memory when processing large datasets. Memory usage
grows from 100MB to 2GB over 1 hour under load.

**Reproduction:**
1. Start server
2. Run load test with 10K users
3. Watch memory usage climb

**Impact:** Production servers crash after ~2 hours of load

## Implementation Plan

1. Profile memory usage to identify leak source
2. Add cleanup for event listeners/subscriptions
3. Fix any circular references
4. Add memory usage tests
5. Verify fix under load

[... rest of template ...]
```

### Creating a Refactor Task

```markdown
---
id: task-44
title: Refactor user service to use repository pattern
status: To Do
labels:
  - refactor
  - technical-debt
priority: medium
---

## Description

Extract database logic from user service into a repository layer. Current
implementation has database queries mixed with business logic.

**Why:** Improves testability and makes it easier to switch databases later.

## Implementation Plan

1. Create UserRepository class
2. Move all database queries from service to repository
3. Update service to use repository
4. Refactor tests to mock repository instead of database
5. Ensure all existing tests still pass

[... rest of template ...]
```

## Progress Log Best Practices

**Update after EVERY significant change:**

```markdown
## Progress Log

2024-01-15 10:00 - Started task, status → "In Progress"
2024-01-15 11:00 - Installed dependencies (jsonwebtoken, bcrypt)
2024-01-15 11:30 - Implemented auth service login method
2024-01-15 12:00 - Added JWT middleware
2024-01-15 12:01 - Files: auth/service.js, auth/middleware.js
2024-01-15 13:00 - Wrote auth service tests (if tests requested)
2024-01-15 13:30 - All tests passing (15 new tests, 100% coverage)
2024-01-15 14:00 - Updated API documentation → CHECKED AC #1
2024-01-15 14:30 - Tested login flow manually - working correctly
2024-01-15 14:45 - Implementation Summary filled out → CHECKED AC #3
2024-01-15 15:00 - Task marked as Done and moved to completed folder
```

## Clarification Log Best Practices

**Record ALL user clarifications:**

```markdown
## Clarification Log

2024-01-15 10:30 - Question: Should password reset tokens expire?
2024-01-15 10:35 - Response: Yes, 1 hour expiry
2024-01-15 10:36 - Action: Updated implementation plan to include token expiry

2024-01-15 12:00 - Question: Use sessions or JWT?
2024-01-15 12:05 - Response: JWT for stateless auth
2024-01-15 12:06 - Action: Updated technical approach to use JWT

2024-01-15 14:00 - Question: What should happen on token refresh failure?
2024-01-15 14:02 - Response: Return 401 and require login
2024-01-15 14:03 - Action: Added error handling for refresh failures
```

## CLI Command Reference

### Task Status Management

```bash
# Update status
backlog task edit 42 -s "To Do"
backlog task edit 42 -s "In Progress"
backlog task edit 42 -s "Done"

# Set priority
backlog task edit 42 --priority high
backlog task edit 42 --priority medium
backlog task edit 42 --priority low

# Mark as draft/promote
backlog task edit 42 --draft
backlog task edit 42 --promote
```

### Acceptance Criteria

```bash
# Check individual AC (do this IMMEDIATELY when completing each one)
backlog task edit 42 --check-ac 1
backlog task edit 42 --check-ac 2
backlog task edit 42 --check-ac 5

# Add new AC
backlog task edit 42 --ac "New acceptance criterion"
```

### Task Metadata

```bash
# Update title
backlog task edit 42 -t "New, clearer title"

# Update description
backlog task edit 42 -d "Updated description with more details"

# Add implementation plan
backlog task edit 42 --plan "1. Step one\n2. Step two\n3. Step three"

# Add/update notes
backlog task edit 42 --notes "Important context about this task"
backlog task edit 42 --append-notes "Additional note"
```

### Task Lifecycle

```bash
# Archive completed task
backlog task archive 42

# Demote to draft (if needs rework)
backlog task demote 42

# Move to completed manually
mv backlog/tasks/task-42-*.md backlog/completed/

# Clean up old completed tasks (interactive prompt)
backlog cleanup
```

## Task Creation Checklist

Before marking a task as ready:

- [ ] Copied from task-template.md (not created via CLI)
- [ ] Frontmatter filled out (id, title, status, labels, priority)
- [ ] Description explains WHAT and WHY
- [ ] Core ACs included + task-specific ACs
- [ ] Test ACs added only if user specified tests
- [ ] Implementation plan is detailed and step-by-step
- [ ] Documentation plan specifies exact files to update
- [ ] Dependencies listed
- [ ] If unsure about details, marked as draft

## Common Mistakes to Avoid

### Mistake: Creating Tasks via CLI

**Wrong:**
```bash
backlog task create "Add authentication"  # Missing all template sections!
```

**Right:**
```bash
cp .claude/templates/task-template.md backlog/tasks/task-42-auth.md
# Then edit the file to fill in all sections
```

### Mistake: Batching AC Checks

**Wrong:**
```bash
# After completing entire task
backlog task edit 42 --check-ac 1
backlog task edit 42 --check-ac 2
backlog task edit 42 --check-ac 5
backlog task edit 42 --check-ac 6
```

**Right:**
```bash
# Check each AC immediately after completing it
backlog task edit 42 --check-ac 1  # Right after updating documentation
# ... do work ...
backlog task edit 42 --check-ac 2  # Right after clarifying requirements
# ... do work ...
backlog task edit 42 --check-ac 3  # Right after Implementation Summary done
```

### Mistake: Not Updating Progress Log

**Wrong:**
- Complete entire task
- No progress log entries
- Next session: "Where was I? What did I do?"

**Right:**
- Update progress log after every significant step
- Check off ACs immediately
- Document blockers as they occur
- Makes session continuity seamless

### Mistake: Skipping Implementation Summary

**Wrong:**
- Mark task as Done without filling out Implementation Summary
- Next developer/reviewer has to dig through code to understand changes

**Right:**
- Fill out Implementation Summary BEFORE marking task as Done
- Document all changes, decisions, and limitations
- Provides clear context for future reference

## Quick Reference

```bash
# View task
backlog task view 42 --plain

# Start task
backlog task edit 42 -s "In Progress"

# Check AC immediately
backlog task edit 42 --check-ac 1

# Document blocker
backlog task edit 42 --notes "Blocked: Need API key"

# Complete task (tests only if specified)
# npm test && npm run lint  # Only if tests were requested
backlog task edit 42 -s "Done"
mv backlog/tasks/task-42-*.md backlog/completed/
```

## Integration with Other Skills/Agents

This skill works together with:

- **task-maker agent** - For creating new implementation-ready tasks with library research and code snippets
- **feature-planner agent** - For breaking down large features into multiple tasks
- **testing-workflow** - For writing tests (only if user specifies tests)
- **documentation-writing** - For updating docs (AC #1)

## Additional Resources

For detailed reference:
- **Task Template**: `.claude/templates/task-template.md` - Standard task template
- **CLI Commands**: See `resources/backlog-reference.md` for complete backlog CLI documentation

Use this skill whenever you need to create, update, or manage backlog tasks!
