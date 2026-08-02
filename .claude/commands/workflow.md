---
description: Full feature development workflow with planning and review
argument-hint: <feature request>
---

$ARGUMENTS

---

## MANDATORY: Spawn Research-Planner First

You MUST spawn the research-planner agent as your FIRST action. Do NOT search files, read code, or do anything else first.

```
Task(subagent_type="research-planner", prompt="$ARGUMENTS")
```

Wait for the research-planner to complete. It will output JSON that identifies research topics for the next phase.

## CRITICAL: Follow Hook Orchestration Instructions

When the research-planner Task completes, you will receive orchestration instructions from the PostToolUse hook. These instructions tell you exactly which agents to spawn next.

**You MUST follow these instructions exactly:**
- If the hook says "Spawn N research agents", spawn that many research agents
- Each research agent gets a self-contained prompt with its specific topic
- Run the first research agent in foreground, subsequent ones in background

**Do NOT:**
- Enter Plan mode to decide what to do next
- Spawn a single research agent with all topics combined
- Skip research and go directly to planning

## Collecting Research and Spawning Feature-Planner

After ALL research agents complete:

1. **Collect research report paths** from the completed research agents' outputs (look for `results.research_report.report_path` in each agent's JSON output)
2. **Build enriched prompt** combining the original feature request with research findings:

```
Task(subagent_type="feature-planner", prompt="
ORIGINAL REQUEST: $ARGUMENTS

RESEARCH FINDINGS:
The following research reports have been completed. Read each one for context before planning.

Report paths:
- docs/research/<topic-1>.md
- docs/research/<topic-2>.md
- docs/research/<topic-3>.md
...

Incorporate these findings into your planning decisions - library choices, security considerations, architecture patterns, and edge cases should all be informed by the research.
")
```

3. Wait for the feature-planner to complete. It will output JSON with task breakdown.

## Spawning Task-Makers

When the feature-planner Task completes, you will receive orchestration instructions from the PostToolUse hook for spawning task-makers.

For each task in the feature-planner output, spawn a separate task-maker:

```
Task(subagent_type="task-maker", prompt="Pre-allocated Task ID: {task_id}\n\nFull Requirements:\n{requirements}")
```

The first task-maker runs in foreground (to create the task file), subsequent ones run in background for parallelism:
```
Task(subagent_type="task-maker", prompt="...", run_in_background=true)
```

## Workflow Sequence

1. **Research Planner** (FIRST) → Analyzes request from 8 angles, identifies 3-8 research topics
2. **Research Agents** → Spawn SEPARATE research agent for EACH topic (parallel), write to docs/research/
3. **Feature Planner** → Plans with research context, creates spec file, outputs task breakdown JSON
4. **Task Makers** → Spawn SEPARATE task-maker for EACH task (can run in parallel)
5. **Implementation Agents** → Spawn based on task-maker output (backend-engineer, frontend-engineer, etc.)
6. **Code Reviewers** → Review the implementation

Do not ask permission between stages. Ask questions only for unclear requirements.

---

## Skipping Failed Agents

If an agent repeatedly fails (e.g., due to persistent rate limiting or service unavailability), you can skip it:

### Syntax

```bash
/workflow skip <agent_id>
```

**Parameters:**
- `<agent_id>` - The unique identifier of the agent to skip (e.g., `research-001`, `task-maker-task_creation-0`, `backend-engineer-implementation-1`)

**Finding Agent IDs:**
Agent IDs follow the pattern: `{agent_type}-{phase_id}-{index}`
- Check workflow state: `cat .claude/logs/session-*/workflow-state.json`
- Look for `spawned_agent_ids` array in `current_phase`

### When to Use

| Situation | Recommendation |
|-----------|----------------|
| Agent failed 3+ times | Consider skipping if the service appears unavailable |
| External service down | Skip and implement manually or wait for service |
| Non-critical agent | Skip if workflow can proceed without this agent's output |
| Critical agent | Wait and retry, or abort the workflow |

### Effects

When you skip an agent:

1. **Status Change** - Agent status changes to `skipped` in workflow state (terminal state)
2. **Respawn Exclusion** - Agent will no longer appear in respawn instructions
3. **Workflow Continuation** - Workflow continues without that agent's contribution
4. **Phase Completion** - Skipped agents are counted as resolved, not pending

### Example

```bash
/workflow skip research-002
```

### Warning

**Skipping an agent means its intended work will not be completed automatically.**

- For critical workflow steps like `feature-planner` or `code-reviewer`, consider waiting for the rate limit to reset rather than skipping
- Other agents may depend on the skipped agent's output
- You may need to manually complete the skipped work later
- Document what was skipped for follow-up in a subsequent workflow
