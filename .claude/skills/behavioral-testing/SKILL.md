---
name: behavioral-testing
description: Write integration tests that run real Claude CLI sessions. Use when creating tests that verify agent spawning, workflow execution, prompt handling, or CLI behavior. Provides ClaudeCodeSession API, temp project scaffolding, and verification utilities.
---

# Behavioral Testing Skill

Write integration tests that spawn real Claude Code CLI processes, send prompts, and verify agent behavior.

## When to Use This Skill

- Writing tests that run actual Claude CLI sessions
- Testing agent spawning behavior (which agents get triggered)
- Verifying workflow execution patterns
- Testing multi-step conversation flows
- Validating hook execution
- Testing CLI output patterns

## Key Infrastructure Files

```
tests/lib/behavioral-testing/
├── session.ts        # ClaudeCodeSession - CLI process wrapper
├── temp-project.ts   # Temporary project scaffolding
├── io-debug.ts       # Output debugging utilities
└── verification.ts   # Assertion helpers
```

## Quick Start Template

```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { ClaudeCodeSession } from "../../lib/behavioral-testing/session.js";
import {
  createTempProject,
  initClaudeWorkflow,
  cleanupTempProject
} from "../../lib/behavioral-testing/temp-project.js";
import { detectAgentSpawn } from "../../lib/behavioral-testing/verification.js";
import { execaSync } from "execa";

// Check CLI at module load (skipIf evaluates before beforeAll)
let claudeCodeAvailable = false;
try {
  execaSync("claude", ["--version"]);
  claudeCodeAvailable = true;
} catch {
  console.warn("claude CLI not available - tests will be skipped");
}

describe("My Workflow Test", () => {
  let projectPath: string;
  let session: ClaudeCodeSession;

  beforeEach(async () => {
    if (!claudeCodeAvailable) return;

    projectPath = await createTempProject();
    await initClaudeWorkflow(projectPath, { skipPrompts: true });

    session = new ClaudeCodeSession({
      cwd: projectPath,
      timeout: 60000,
      verbose: true
    });

    await session.start();
  });

  afterEach(async () => {
    if (session) await session.stop();
    await cleanupTempProject(projectPath);
  });

  it("should spawn expected agent", async () => {
    await session.sendPrompt("Create a task for adding user validation");

    const spawned = await session.waitForAgent("task-maker", 120000);
    expect(spawned).toBe(true);

    const output = session.getOutput();
    expect(detectAgentSpawn(output, "task-maker")).toBe(true);
  }, 180000); // 3 min vitest timeout
});
```

---

## ClaudeCodeSession API

### Constructor Options

```typescript
interface ClaudeCodeSessionOptions {
  cwd: string;           // Working directory (required)
  timeout?: number;      // Default timeout in ms (default: 30000)
  command?: string;      // CLI command (default: 'claude')
  verbose?: boolean;     // Log output to console (default: false)
  printMode?: boolean;   // Use --print mode (default: true)
}
```

**Print Mode vs Interactive Mode:**
- `printMode: true` (default) - Spawns process per prompt with `--print --verbose --output-format stream-json`. Best for automation.
- `printMode: false` - Spawns persistent process, writes to stdin. Required for multi-turn conversations in same process.

### Lifecycle Methods

```typescript
// Start the session
await session.start();

// Send a prompt
await session.sendPrompt("Your prompt text here");

// Stop and cleanup
await session.stop(gracePeriod?: number);  // default 5000ms
```

### Wait Methods

```typescript
// Wait for specific agent to spawn
const spawned = await session.waitForAgent(
  agentName: string,     // e.g., "task-maker", "feature-planner"
  timeout?: number       // ms, defaults to session timeout
): Promise<boolean>;

// Wait for output matching pattern
const line = await session.waitForOutput(
  pattern: string | RegExp,
  timeout?: number
): Promise<string>;
```

### Output Capture

```typescript
// Get all stdout as single string
session.getOutput(): string;

// Get stdout as array of lines
session.getOutputLines(): string[];

// Get stderr output
session.getErrorOutput(): string;

// Get list of detected agent spawns
session.getAgentSpawns(): AgentSpawn[];
// Returns: [{ name: "task-maker", description: "Creating tasks" }, ...]
```

### State Checks

```typescript
session.isRunning(): boolean;  // Process is alive
session.isReady(): boolean;    // Ready to receive prompts
```

### Events

```typescript
session.on("ready", () => void);
session.on("exit", (info: { code: number | null, signal: string | null }) => void);
session.on("stopped", () => void);
session.on("prompt-sent", (text: string) => void);
session.on("output-line", (line: string) => void);
session.on("error-line", (line: string) => void);
session.on("agent-spawned", (agentName: string) => void);
session.on("output", (text: string) => void);
session.on("error", (text: string) => void);
```

### Static Methods

```typescript
// Check if Claude CLI is installed and logged in
const auth = await ClaudeCodeSession.checkClaudeAuth();
// Returns: { installed: boolean, loggedIn: boolean, error?: string }
```

---

## Temp Project Utilities

### Create Isolated Test Project

```typescript
import {
  createTempProject,
  initClaudeWorkflow,
  cleanupTempProject
} from "../../lib/behavioral-testing/temp-project.js";

// Create temp directory with git repo and package.json
const projectPath = await createTempProject({
  template?: string,  // Copy from tests/fixtures/behavioral/projects/{template}
  prefix?: string     // Directory name prefix (default: "claude-test-")
});

// Initialize claude-workflow in the project
await initClaudeWorkflow(projectPath, {
  projectName?: string,   // default: "test-project"
  skipPrompts?: boolean,  // default: true
  timeout?: number        // default: 60000ms
});

// Clean up (safe - only deletes temp directories)
await cleanupTempProject(projectPath);
```

### Convenience Wrapper

```typescript
import { withTempProject } from "../../lib/behavioral-testing/temp-project.js";

it("test with auto-cleanup", withTempProject(async (projectPath) => {
  // Project created and initialized
  // Will be cleaned up automatically
  expect(existsSync(projectPath)).toBe(true);
}, {
  initWorkflow?: boolean,           // default: true
  initConfig?: InitClaudeWorkflowOptions
}));
```

### Verify Project Structure

```typescript
import { verifyProjectStructure } from "../../lib/behavioral-testing/temp-project.js";

const result = verifyProjectStructure(projectPath);
// Returns: { valid: boolean, errors: string[] }
```

---

## Verification Utilities

### Agent Spawn Detection

```typescript
import { detectAgentSpawn } from "../../lib/behavioral-testing/verification.js";

// Detects both patterns:
// - Interactive: ● agent-name(description)
// - JSON stream: "subagent_type": "agent-name"
const found = detectAgentSpawn(output, "task-maker");
```

### Hook Verification

```typescript
import {
  verifyHookFired,
  getHooksFired,
  countHookExecutions,
  parseHookLog
} from "../../lib/behavioral-testing/verification.js";

const logPath = ".claude/logs/hook-activity.log";

// Check if specific hook fired successfully
const fired = verifyHookFired(logPath, "UserPromptSubmit");

// Get all hooks that fired
const hooks = getHooksFired(logPath);  // ["UserPromptSubmit", "PostToolUse"]

// Count executions
const count = countHookExecutions(logPath, "UserPromptSubmit");

// Parse full log
const entries = parseHookLog(logPath);
// Returns: [{ timestamp, hook, status, message? }, ...]
```

### Task File Validation

```typescript
import {
  validateTaskYAML,
  extractAssignee,
  extractTaskMetadata,
  getTaskContent
} from "../../lib/behavioral-testing/verification.js";

// Validate task file structure
const result = validateTaskYAML("backlog/tasks/task-001.md");
// Returns: { valid: boolean, errors: string[], metadata: object | null }

// Extract assignee array
const assignees = extractAssignee("backlog/tasks/task-001.md");

// Get all frontmatter
const metadata = extractTaskMetadata("backlog/tasks/task-001.md");

// Get markdown body (without frontmatter)
const content = getTaskContent("backlog/tasks/task-001.md");
```

### Output Pattern Validation

```typescript
import { validateOutput } from "../../lib/behavioral-testing/verification.js";

const result = validateOutput(session.getOutput(), [
  /● feature-planner/,
  /Task created: task-/,
  "Implementation complete"
]);
// Returns: {
//   valid: boolean,
//   results: [{ pattern, found, match }],
//   missingPatterns: string[]
// }
```

### Spec File Verification

```typescript
import { verifySpecFileCreated } from "../../lib/behavioral-testing/verification.js";

const result = verifySpecFileCreated(projectPath, 42);  // or slug
// Returns: {
//   exists: boolean,
//   path: string | null,
//   contentLength: number,
//   hasMinimumContent: boolean,  // >100 chars
//   errors: string[]
// }
```

### Agent Output Persistence

```typescript
import {
  verifyAgentOutputPersisted,
  getAllAgentOutputs
} from "../../lib/behavioral-testing/verification.js";

// Check for specific agent output file
const result = verifyAgentOutputPersisted(projectPath, "architecture");
// Returns: { found, path, agentId, agentType, status, data }

// Get all agent outputs
const outputs = getAllAgentOutputs(projectPath, sessionId?);
```

---

## Debugging Utilities

### I/O Logging

```typescript
import { logIO } from "../../lib/behavioral-testing/io-debug.js";

logIO("in", "prompt text");   // [timestamp] [IN ] prompt text
logIO("out", "response");     // [timestamp] [OUT] response
logIO("err", "error msg");    // [timestamp] [ERR] error msg
```

### Dump Output to File

```typescript
import { dumpOutput, dumpSessionState } from "../../lib/behavioral-testing/io-debug.js";

// Dump raw output to tests/debug/
const path = dumpOutput(session.getOutput(), "test-name");

// Dump full session state as JSON
const path = dumpSessionState(session, "test-name");
```

### Parse Output Structure

```typescript
import { parseOutput, formatOutput, getAgentTimeline } from "../../lib/behavioral-testing/io-debug.js";

// Parse into structured format
const parsed = parseOutput(session.getOutput());
// Returns: {
//   lines: string[],
//   agents: [{ name, description, line }],
//   errors: string[],
//   sections: [{ title, lines }],
//   lineCount: number,
//   hasErrors: boolean,
//   hasAgents: boolean
// }

// Pretty-print for console
console.log(formatOutput(output, {
  maxLines: 50,
  showLineNumbers: true,
  highlightAgents: true
}));

// Get agent spawn timeline
const timeline = getAgentTimeline(output);
// Returns: [{ index, name, description, line }]
```

---

## Test Patterns

### Single Agent Spawn Test

```typescript
it("spawns task-maker for simple task", async () => {
  await session.sendPrompt("Create a task for adding email validation");

  const spawned = await session.waitForAgent("task-maker", 120000);
  expect(spawned).toBe(true);

  // Verify no other agents spawned
  const agents = session.getAgentSpawns();
  expect(agents).toHaveLength(1);
  expect(agents[0].name).toBe("task-maker");
}, 180000);
```

### Multi-Agent Workflow Test

```typescript
it("spawns feature-planner then task-maker for complex feature", async () => {
  await session.sendPrompt("Plan auth system with login, signup, and password reset");

  // First: feature-planner
  const fpSpawned = await session.waitForAgent("feature-planner", 60000);
  expect(fpSpawned).toBe(true);

  // Then: task-maker (spawned by feature-planner)
  const tmSpawned = await session.waitForAgent("task-maker", 120000);
  expect(tmSpawned).toBe(true);

  const agents = session.getAgentSpawns();
  expect(agents[0].name).toBe("feature-planner");
  expect(agents.some(a => a.name === "task-maker")).toBe(true);
}, 240000);
```

### Multi-Step Conversation Test

```typescript
it("maintains context across prompts", async () => {
  // Step 1: Create something
  await session.sendPrompt("Create a task for user registration");
  await session.waitForAgent("task-maker", 60000);

  // Step 2: Ask about it
  await session.sendPrompt("What acceptance criteria did you add?");
  await new Promise(r => setTimeout(r, 5000));

  // Step 3: Modify it
  await session.sendPrompt("Add email verification to the criteria");
  await new Promise(r => setTimeout(r, 5000));

  const output = session.getOutput();
  expect(output).toContain("registration");
  expect(output).toContain("email");
}, 180000);
```

### Negative Test (Agent Should NOT Spawn)

```typescript
it("does NOT spawn feature-planner for simple task", async () => {
  await session.sendPrompt("Fix the typo in the error message");

  // Wait for task-maker (should spawn)
  await session.waitForAgent("task-maker", 60000);

  // Verify feature-planner did NOT spawn
  const output = session.getOutput();
  expect(detectAgentSpawn(output, "feature-planner")).toBe(false);
}, 120000);
```

### Hook Execution Test

```typescript
it("fires UserPromptSubmit hook", async () => {
  await session.sendPrompt("Any prompt");
  await new Promise(r => setTimeout(r, 5000));

  const logPath = join(projectPath, ".claude/logs/hook-activity.log");
  expect(verifyHookFired(logPath, "UserPromptSubmit")).toBe(true);
}, 60000);
```

### Output Pattern Test

```typescript
it("produces expected output patterns", async () => {
  await session.sendPrompt("Create a task for X");
  await session.waitForOutput(/task.*created|Task tool/i, 60000);

  const validation = validateOutput(session.getOutput(), [
    /● task-maker/,
    /backlog\/tasks\//
  ]);

  expect(validation.valid).toBe(true);
}, 120000);
```

---

## Critical Implementation Notes

### PTY Requirement

Claude CLI buffers output when not connected to a terminal. The session wrapper uses the `script` command to create a PTY:

```typescript
// Internally uses:
spawn("script", ["-q", "-c", claudeCmd, outputFile], { ... });
```

This ensures output is flushed in real-time.

### Timeout Guidelines

| Operation | Recommended Timeout |
|-----------|-------------------|
| Session start | 10-15 seconds |
| Simple agent spawn | 30-60 seconds |
| Complex agent spawn | 60-120 seconds |
| Multi-agent workflow | 120-180 seconds |
| Vitest test timeout | 1.5x operation timeout |

```typescript
// Always set vitest timeout higher than internal timeouts
it("test name", async () => {
  await session.waitForAgent("agent", 60000);  // 60s internal
}, 90000);  // 90s vitest timeout
```

### CLI Availability Check

Always check if CLI is available at module load time:

```typescript
let claudeCodeAvailable = false;
try {
  execaSync("claude", ["--version"]);
  claudeCodeAvailable = true;
} catch {
  console.warn("claude CLI not available");
}

// In beforeEach:
beforeEach(async () => {
  if (!claudeCodeAvailable) return;  // Skip setup
  // ...
});
```

### Cleanup Best Practices

```typescript
afterEach(async () => {
  // Always stop session first
  if (session) {
    try {
      await session.stop();
    } catch (error) {
      console.warn("Error stopping session:", error.message);
    }
  }

  // Then clean up project
  await cleanupTempProject(projectPath);
});
```

### Agent Spawn Detection Patterns

The session detects spawns via two patterns:

1. **Interactive mode:** `● agent-name(description)`
2. **Print mode (JSON stream):** `"subagent_type": "agent-name"`

Both are checked by `waitForAgent()` and `detectAgentSpawn()`.

---

## Common Gotchas

### 1. Test Passes Locally, Fails in CI

**Cause:** CI environments may not have Claude CLI or may have slower networks.

**Solution:**
```typescript
const skipInCI = process.env.CI === "true";
describe.skipIf(skipInCI)("Integration tests", () => { ... });
```

### 2. Timeout Waiting for Agent

**Causes:**
- Network latency to Claude API
- Agent takes longer than expected
- Wrong agent name (case-sensitive)

**Debug:**
```typescript
it("debug agent spawn", async () => {
  await session.sendPrompt("...");

  // Add periodic output logging
  const interval = setInterval(() => {
    console.log("Current output length:", session.getOutput().length);
    console.log("Agents so far:", session.getAgentSpawns());
  }, 5000);

  try {
    await session.waitForAgent("task-maker", 120000);
  } finally {
    clearInterval(interval);
    dumpOutput(session.getOutput(), "debug-agent-spawn");
  }
});
```

### 3. Process Not Cleaning Up

**Cause:** Session stop() not called or failed.

**Solution:** Wrap in try/finally:
```typescript
afterEach(async () => {
  try {
    await session?.stop();
  } catch { /* ignore */ }
  await cleanupTempProject(projectPath);
});
```

### 4. Output Not Captured

**Cause:** Print mode process finished before output was read.

**Solution:** Use events or add small delay:
```typescript
await session.sendPrompt("...");
await new Promise(r => setTimeout(r, 2000));  // Let output flush
const output = session.getOutput();
```

### 5. MCP Server Selection Prompt Blocking

**Cause:** `.mcp.json` triggers interactive prompt.

**Solution:** `initClaudeWorkflow()` automatically removes `.mcp.json`.

---

## Unit Tests (No Real Process)

For fast tests that don't need real Claude:

```typescript
describe("Unit Tests (No Real Process)", () => {
  it("detects agent patterns correctly", () => {
    const output = "● task-maker(Creating tasks)\nMore output";

    expect(detectAgentSpawn(output, "task-maker")).toBe(true);
    expect(detectAgentSpawn(output, "feature-planner")).toBe(false);
  });

  it("parses output structure", () => {
    const output = `
● feature-planner(Planning)
Error: Something failed
● task-maker(Creating)
    `.trim();

    const parsed = parseOutput(output);
    expect(parsed.agents).toHaveLength(2);
    expect(parsed.hasErrors).toBe(true);
  });
});
```

---

## File Locations

```
packages/claude-workflow/tests/
├── behavior/
│   ├── harness/
│   │   └── session-automation.test.ts  # Session wrapper tests
│   └── workflows/
│       ├── simple-task.test.ts         # Single agent tests
│       ├── multi-step.test.ts          # Multi-prompt tests
│       └── feature-planning.test.ts    # Complex workflow tests
└── lib/
    └── behavioral-testing/
        ├── session.ts                  # ClaudeCodeSession class
        ├── temp-project.ts             # Project scaffolding
        ├── io-debug.ts                 # Debug utilities
        └── verification.ts             # Assertion helpers
```

## Running Tests

```bash
# Run all behavioral tests
npm test -- tests/behavior/

# Run specific workflow test
npm test -- tests/behavior/workflows/simple-task.test.ts

# Run with verbose output
npm test -- tests/behavior/ --reporter=verbose

# Skip slow integration tests
CI=true npm test -- tests/behavior/
```
