---
id: task-986
title: Update feature-planner agent for workflow state integration
status: To Do
reviewed: false
review_date: null
review_result: null
type: backend
assignee: [backend-engineer]
created_date: '2026-01-14'
labels:
  - workflow
  - orchestration
  - feature-planner
  - enhancement
dependencies: [task-979, task-980, task-981, task-982]
feature_spec: ''
priority: medium
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

## Context

**Standalone Task** - This task is not part of a larger feature brief.

This is a P3 (Enhancement) task that depends on P0 tasks (task-979, task-980, task-981, task-982) being completed first. Those foundational tasks establish the workflow state tracking infrastructure that this task will integrate with.

## Description

Update the feature-planner agent to properly integrate with the new workflow state tracking system. Currently, feature-planner outputs JSON that is processed by agent-orchestrator, but the workflow context (workflow_id) is not explicitly propagated through the agent's output schema and prompt instructions.

**Why this is needed:**
- Workflow state tracking needs consistent workflow_id across all phases
- Feature-planner spawns multiple task-maker agents that need workflow context
- The orchestration system needs to track which tasks belong to which workflow
- Without explicit workflow_id in feature-planner output, workflow continuity may break

**Current State:**
- agent-orchestrator already extracts `backlog_task_id` from feature-planner output (lines 151-239)
- workflow-state.ts has `setFeaturePlannerOutput()` for recording feature-planner output
- Feature-planner schema lacks explicit `workflow_id` field
- Feature-planner prompt doesn't instruct including workflow context in output

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

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Documentation updated/created for this change
- [ ] #2 All unclear requirements have been clarified with user
- [ ] #3 Implementation Summary section filled out completely
- [ ] #4 External integrations verified working (e.g., notifications received, not just sent)
- [ ] #5 Feature-planner schema updated to include workflow_id field in appropriate location
- [ ] #6 Feature-planner agent prompt updated with instructions for workflow context handling
- [ ] #7 Agent-orchestrator properly extracts and propagates workflow_id from feature-planner output
- [ ] #8 Workflow state correctly records feature-planner output with workflow context
- [ ] #9 Task-maker agents spawned by feature-planner receive workflow_id in their payload
- [ ] #10 No lint errors in changed files (`npm run lint -- <changed-files>`)
- [ ] #11 No TypeScript errors in changed files (`npm run typecheck`)
- [ ] #12 Unit tests pass for workflow state integration
<!-- AC:END -->

## Implementation Plan

### Phase 1: Schema Update

1. **Update feature-planner.schema.json**
   - File: `packages/claude-workflow/src/output-types/feature-planner.schema.json`
   - Add `workflow_id` field to metadata section:
     ```json
     "metadata": {
       "properties": {
         "workflow_id": {
           "type": "string",
           "description": "Workflow identifier for tracking multi-phase orchestration",
           "pattern": "^[a-zA-Z0-9-_]+$"
         }
       }
     }
     ```
   - Consider adding to `nextAction.payload` for spawned agent context

### Phase 2: Agent Prompt Update

2. **Update feature-planner.md agent prompt**
   - File: `packages/claude-workflow/src/templates/.claude/agents/feature-planner.md`
   - Add section on workflow context handling
   - Update JSON output examples to include workflow_id
   - Ensure instructions for propagating workflow_id to task-maker payloads:
     ```json
     "nextAction": {
       "type": "spawn_multiple",
       "agents": [{
         "payload": {
           "workflow_id": "{current_workflow_id}",
           "task_spec": { ... }
         }
       }]
     }
     ```

### Phase 3: Orchestrator Integration

3. **Update agent-orchestrator.ts**
   - File: `packages/claude-workflow/src/templates/.claude/hooks/orchestration/agent-orchestrator.ts`
   - Enhance feature-planner output processing (lines 151-239):
     ```typescript
     // Extract workflow_id from feature-planner metadata
     const workflowId = orchestrationData.metadata?.workflow_id;

     // Pass workflow_id when recording workflow state
     await workflowStateModule.setFeaturePlannerOutput(
       {
         agentId: orchestrationData.agent_id ?? "unknown",
         timestamp: new Date().toISOString(),
         workflowId: workflowId
       },
       taskIds.length,
       taskIds
     );
     ```
   - Ensure workflow_id is included in spawned task-maker payloads

### Phase 4: Workflow State Integration

4. **Update workflow-state.ts if needed**
   - File: `packages/claude-workflow/src/templates/.claude/hooks/core/workflow-state.ts`
   - Verify `setFeaturePlannerOutput()` accepts workflow_id parameter
   - Update interface types if needed:
     ```typescript
     interface FeaturePlannerContext {
       agentId: string;
       timestamp: string;
       workflowId?: string;
     }
     ```

### Phase 5: Testing

5. **Test the integration**
   - Verify workflow_id flows from feature-planner to task-maker
   - Test multi-task feature planning scenarios
   - Verify workflow state correctly tracks all tasks in a workflow

## Codebase Patterns to Reference

**Existing workflow_id patterns:**
- `packages/claude-workflow/src/templates/.claude/hooks/core/workflow-state.ts` - Core workflow tracking
- `packages/claude-workflow/src/templates/.claude/hooks/orchestration/workflow-state-manager.ts` - Multi-phase workflow management

**Agent output schema patterns:**
- `packages/claude-workflow/src/output-types/feature-planner.schema.json` - Current schema structure
- Agent-orchestrator lines 151-239 for feature-planner output processing

## Git Workflow

**Work directly on main branch:**
- Commit changes directly to main
- Push to remote when ready
- User controls all git operations

## Documentation Plan

**MANDATORY - Specify exactly what documentation will be updated:**

- [ ] Update feature-planner.schema.json with workflow_id field documentation
- [ ] Update feature-planner.md with workflow context handling instructions
- [ ] Add inline code comments explaining workflow_id propagation
- [ ] Update any relevant architecture docs if they exist

## Dependencies

- **task-979** - P0 foundational workflow state task
- **task-980** - P0 foundational workflow state task
- **task-981** - P0 foundational workflow state task
- **task-982** - P0 foundational workflow state task

All P0 tasks must be completed before this P3 enhancement can be implemented.

## Progress Log

**MANDATORY - Update after EVERY code change for session continuity:**

- 2026-01-14 - Task created by task-maker agent
- {Next entry after work begins}

## Clarification Log

**MANDATORY - Record ALL clarifications with user:**

- {No clarifications yet - task just created}

## Notes

### Key Code Locations

1. **Feature-planner schema:** `packages/claude-workflow/src/output-types/feature-planner.schema.json`
2. **Feature-planner prompt:** `packages/claude-workflow/src/templates/.claude/agents/feature-planner.md`
3. **Agent orchestrator:** `packages/claude-workflow/src/templates/.claude/hooks/orchestration/agent-orchestrator.ts` (lines 151-239)
4. **Workflow state:** `packages/claude-workflow/src/templates/.claude/hooks/core/workflow-state.ts`
5. **Workflow state manager:** `packages/claude-workflow/src/templates/.claude/hooks/orchestration/workflow-state-manager.ts`

### Technical Considerations

- The feature-planner agent is a large prompt file (~25K tokens) - changes should be surgical
- Schema changes must maintain backward compatibility with existing feature-planner outputs
- Consider how workflow_id is generated/assigned - may need to be passed from orchestrator or auto-generated
- Ensure workflow_id naming follows existing pattern in workflow-state-manager.ts

### Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing feature-planner outputs | High | Make workflow_id optional in schema, handle missing values gracefully |
| Large prompt file modifications | Medium | Make minimal, focused changes with clear comments |
| Workflow state compatibility | Medium | Verify interface types before/after changes |

---

## CRITICAL TASK RULES

**For complete task workflows and CLI commands, see `.claude/skills/task-management/resources/backlog-reference.md`.**

1. **Documentation:** Required for every task
2. **Unclear requirements:** STOP → ASK → LOG → PROCEED
3. **Git workflow:** Work directly on main branch, user controls all git operations
4. **Progress Log:** Update after EVERY code change + CHECK OFF completed criteria
5. **Clarifications:** Log all questions and responses with timestamps

**Session continuity:** Check Progress Log when starting, update before ending
