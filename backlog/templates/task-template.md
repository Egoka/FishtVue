---
id: task-{id}
title: {title}
status: To Do
reviewed: false  # Set to true by task-reviewer agent after passing review
review_date: null  # ISO date string when reviewed (e.g., '2025-11-28'), null if not reviewed yet
review_result: null  # Review outcome: 'passed' | 'needs-revision' | null (set by task-reviewer)
type: {frontend|backend|devops|documentation|testing|research}
assignee: [{REQUIRED-MUST-MATCH-TYPE}]
created_date: '{YYYY-MM-DD}'
labels:
  - {label1}
  - {label2}
dependencies: []
feature_spec: # Optional - only when task is part of a feature brief (e.g., backlog/specs/feature-002-user-auth.md)
priority: medium
early_finish_reason: null  # REQUIRED if status is 'Blocked' and not all ACs are checked
---

## Review Metadata

**These fields track task quality review status:**

- **`reviewed`** - Boolean flag set by task-reviewer agent
  - `false` (default) - Task not yet reviewed or failed review
  - `true` - Task passed quality review and ready for implementation

- **`review_date`** - ISO date string of when task was reviewed
  - `null` (default) - Not reviewed yet
  - `'2025-11-28'` - Date of last review

- **`review_result`** - Review outcome set by task-reviewer
  - `null` (default) - Not reviewed yet
  - `'passed'` - Task meets quality standards
  - `'needs-revision'` - Task requires improvements before implementation

**Review Workflow:**
1. Task-maker creates task → `reviewed: false`
2. Task-reviewer reviews task
3. If quality issues found → `review_result: 'needs-revision'`, task-maker re-runs
4. If quality passed → `reviewed: true, review_date: '{date}', review_result: 'passed'`
5. Blocking hooks prevent implementation until `reviewed: true`

**Backward Compatibility:**
Existing tasks without these fields continue to work normally. Fields are optional.

## Early Finish Rules

**`early_finish_reason`** - Required when task cannot be completed normally

This field MUST be set when:
- Status is set to "Blocked" before all ACs are checked
- Agent cannot complete task due to external blocker

**Valid reasons (require detailed explanation):**
- `external_dependency` - API down, service unreachable, third-party issue
- `missing_permissions` - Credentials/access user must provide
- `architecture_decision` - Discovered issue requiring user decision
- `requirement_conflict` - Conflicting requirements needing clarification
- `technical_impossibility` - Library/platform doesn't support required feature
- `missing_design` - Design/mockup required but not provided (frontend)
- `cost_approval` - Infrastructure cost exceeds limits (devops)
- `security_issue` - Security/compliance issue discovered

**NOT valid reasons (these are NOT blockers):**
- `context_limit` - Agent should compact and continue
- `time_constraint` - Agent should continue working
- `uncertainty` - Agent should ask user via AskUserQuestion
- `test_failures` - Agent should fix the tests
- `lint_errors` - Agent should fix the errors

**When set:** Agent must also fill out the "Early Finish Report" section below.

## ⚠️ CRITICAL: EVERY TASK REQUIRES A SPECIALIZED AGENT

**🚨 MAIN CLAUDE MUST ALWAYS SPAWN THE ASSIGNED AGENT - NEVER IMPLEMENT DIRECTLY! 🚨**

**Type → Agent Mapping (MANDATORY):**
```
type: frontend      → assignee: [frontend-engineer]
type: backend       → assignee: [backend-engineer]
type: devops        → assignee: [devops-engineer]
type: research      → assignee: [research]
type: testing       → assignee: [general-purpose]  ← Claude's built-in agent
type: documentation → assignee: [general-purpose]  ← Claude's built-in agent
```

**RULES FOR MAIN CLAUDE:**
- ✅ Every task MUST have a specific type (no empty/general)
- ✅ Every task MUST have assignee matching the type
- ✅ **MAIN CLAUDE spawns the assigned agent - NEVER implements directly**
- ❌ If task is too broad → use feature-planner to break it down FIRST
- ❌ NEVER create tasks without type and assignee
- ✅ **ALWAYS spawn the appropriate agent - do NOT implement in main window**

**IMPLEMENTATION IS FORBIDDEN IN MAIN CLAUDE WINDOW:**
- The main Claude window is for planning, coordination, and agent spawning
- All implementation work MUST be done by spawning the assigned specialized agent
- This ensures proper expertise, code quality, and adherence to patterns

**⚠️ NEVER perform git operations (add/commit/push/PR) without explicit user request ⚠️**

## Context

<!-- If feature_spec is set in frontmatter: -->
**Part of Feature:** [Feature Brief](../specs/feature-{id}-{slug}.md)

This task implements a component of the larger feature described in the feature brief above. See the feature brief for:
- Full product context and user stories
- Overall feature architecture
- How this task fits into the complete feature
- Related tasks and dependencies

<!-- If feature_spec is NOT set: -->
<!-- **Standalone Task** - This task is not part of a larger feature brief. -->

## Description

{Clear, concise description of what needs to be done and WHY it is needed}

## Implementation Summary

**Complete this section after implementation is finished:**

### TLDR
{1-2 sentence summary of what was actually implemented}

### What Changed
- {List key changes/additions made}
- {New files created}
- {Modified functionality}
- {Dependencies added/updated}

### Technical Decisions
- {Important technical decisions made during implementation}
- {Why certain approaches were chosen}
- {Deviations from original plan and reasoning}

### Known Limitations
- {Any limitations or edge cases}
- {Future improvement suggestions}
- {Known issues or TODOs}

## Early Finish Report

**⚠️ REQUIRED if task status is "Blocked" and not all ACs are checked.**

### Blocker Type
<!-- One of: external_dependency | missing_permissions | architecture_decision | requirement_conflict | technical_impossibility | missing_design | cost_approval | security_issue -->
{blocker_type}

### Description
{Detailed explanation of what is blocking completion - be specific}

### Unchecked Acceptance Criteria
<!-- List which ACs remain unchecked and WHY each cannot be completed -->
- AC #{N}: {reason this AC cannot be completed}
- AC #{N}: {reason this AC cannot be completed}

### Resolution Required
{Exactly what the user/team needs to do to unblock this task}

### Attempted Solutions
<!-- What did you try before declaring this blocked? -->
1. {Attempted solution 1 and why it failed}
2. {Attempted solution 2 and why it failed}

### Work Completed
<!-- What was accomplished before hitting the blocker? -->
- {List partial work that was completed}
- {Files created/modified}

---

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Documentation updated/created for this change
- [ ] #2 All unclear requirements have been clarified with user
- [ ] #5 Implementation Summary section filled out completely
- [ ] #7 External integrations verified working (e.g., notifications received, not just sent)
- [ ] #8 {Specific, measurable criterion 1}
- [ ] #9 {Specific, measurable criterion 2}
- [ ] #10 {Specific, measurable criterion 3}
<!-- AC:END -->


## Implementation Plan

1. {Step-by-step implementation details}
2. {Technical approach}
3. {Dependencies and considerations}
4. {For trading tasks: Note any financial values that need user approval}

## Git Workflow

**Work directly on main branch:**
- Commit changes directly to main
- Push to remote when ready
- User controls all git operations

## Documentation Plan

**MANDATORY - Specify exactly what documentation will be updated:**

- [ ] {File/section that will be updated}
- [ ] {New documentation to be created}
- [ ] {CLAUDE.md updates required}
- [ ] {README updates if applicable}
- [ ] Create single comprehensive documentation file per service/feature (e.g., documentation/api/README.md)

## Dependencies

- {task-xxx (if applicable)}
- {External dependencies}

## Progress Log

**MANDATORY - Update after EVERY code change for session continuity:**
**🔴 CRITICAL: Check off acceptance criteria IMMEDIATELY as they are completed - NOT ALL AT THE END! 🔴**

**UPDATE IN REAL-TIME:**
- Check each AC with `backlog task edit {id} --check-ac N` IMMEDIATELY after completing it
- NEVER wait to batch check multiple ACs at once
- Update progress log after EACH significant step
- Document blockers THE MOMENT they occur

**Example progress entries:**
- YYYY-MM-DD HH:MM - Started task, set status to "In Progress"
- YYYY-MM-DD HH:MM - Completed documentation update → CHECKED AC #2 immediately
- YYYY-MM-DD HH:MM - Files modified: [list files]
- YYYY-MM-DD HH:MM - Clarified requirements with user → CHECKED AC #3 immediately
- YYYY-MM-DD HH:MM - All tests passing → CHECKED AC #5 immediately
- YYYY-MM-DD HH:MM - Fixed all lint errors → CHECKED AC #6 immediately
- YYYY-MM-DD HH:MM - TypeScript checks passing → CHECKED AC #7 immediately
- YYYY-MM-DD HH:MM - Next steps for continuation
- YYYY-MM-DD HH:MM - Any blockers or issues encountered

## Clarification Log

**MANDATORY - Record ALL clarifications with user:**

- YYYY-MM-DD HH:MM - Question: [exact question asked]
- YYYY-MM-DD HH:MM - Response: [user's response]
- YYYY-MM-DD HH:MM - Action: [how task was updated]


## Notes

{Additional context, decisions, or considerations}

---

## CRITICAL TASK RULES

**For complete task workflows and CLI commands, see `.claude/skills/task-management/resources/backlog-reference.md`.**

1. **Documentation:** Required for every task
2. **Unclear requirements:** STOP → ASK → LOG → PROCEED
3. **Git workflow:** Work directly on main branch, user controls all git operations
4. **Progress Log:** Update after EVERY code change + CHECK OFF completed criteria
5. **Clarifications:** Log all questions and responses with timestamps

**Session continuity:** Check Progress Log when starting, update before ending
