# Utility Scripts

This directory contains utility modules used by Claude Code hooks and the workflow system.

## Session Logger (`session-logger.ts`)

Provides session-isolated logging for Claude Code hooks.

### Key Features

- **Session Isolation**: Each Claude Code session gets its own log folder (`.claude/logs/session-{timestamp}-{id}/`)
- **Agent Detection & Isolation**: Automatically detects agent context via process tree walking and isolates agent logs in subfolders
- **Timestamped Folders**: Session folders include Unix timestamp to prevent collisions on system reboot
- **Process-Level Hook State**: Each process gets its own hook state file to prevent race conditions
- **Atomic Writes**: Temp file + rename pattern prevents log corruption
- **Metadata Tracking**: Automatic session and agent metadata with git info and event counters
- **Backward Compatibility**: Supports old folder formats and flat structure

### Usage Examples

#### Write to Session Log

```javascript
import { writeToSessionLog } from './session-logger.ts';

// Write hook activity
await writeToSessionLog('hook-activity', {
  hook: 'preToolUse',
  timestamp: Date.now(),
  result: 'success'
});

// Write compliance event
await writeToSessionLog('compliance', {
  rule: 'subprocess-validation',
  status: 'pass',
  details: 'All checks passed'
});

// Write agent spawning event
await writeToSessionLog('agent-spawning', {
  agent: 'task-maker',
  timestamp: Date.now(),
  context: 'User requested task creation'
});

// Write hook state (process-specific)
await writeToSessionLog('hook-state', {
  activeSkills: ['testing-workflow'],
  lastCheck: Date.now()
});
```

#### Read Session Logs

```javascript
import { readSessionLog, readOldFlatLogs } from './session-logger.ts';

// Read session-specific log (with backward compatibility fallback)
const logs = await readSessionLog('hook-activity');

// Read only from old flat structure
const oldLogs = await readOldFlatLogs('compliance');
```

#### Get Log Paths

```javascript
import { getSessionLogPath, getSessionId } from './session-logger.ts';

const sessionId = getSessionId();
const logPath = getSessionLogPath(sessionId, 'hook-activity');
console.log(`Logs written to: ${logPath}`);
```

### Log Types

- **`hook-activity`**: General hook execution logs (`.log` format)
- **`compliance`**: Compliance check results (`.jsonl` format - JSON Lines)
- **`agent-spawning`**: Agent spawning events (`.log` format)
- **`hook-state`**: Process-specific hook state (`.json` format, includes PID)

### Process-Level Hook State Isolation

**CRITICAL**: Hook state files are process-specific to prevent race conditions.

```
.claude/logs/session-abc123/
├── hook-state-1000.json  # Main session (PID 1000)
├── hook-state-2000.json  # Agent 1 (PID 2000)
├── hook-state-3000.json  # Agent 2 (PID 3000)
├── hook-activity.log     # Shared across session
└── metadata.json         # Session metadata
```

**Why this matters:**
- Main session and agents share `CLAUDE_SESSION_ID`
- But they have different process IDs
- Each process reads/writes its own hook state
- Prevents concurrent write conflicts

### Session Folder Structure

**Updated with agent detection (task-064)**

```
.claude/logs/
├── session-1764013488-abc123/       # Timestamped main session folder
│   ├── metadata.json                # Main session metadata
│   ├── hook-activity.log            # Hook execution log (main session)
│   ├── compliance.jsonl             # Compliance events (main session)
│   ├── agent-spawning.log           # Agent spawning events
│   ├── hook-state-1000.json         # Hook state for main session PID 1000
│   ├── agent-1764013500-2001/       # Agent subfolder (task-maker)
│   │   ├── metadata.json            # Agent metadata
│   │   ├── hook-activity.log        # Agent's hook execution log
│   │   ├── compliance.jsonl         # Agent's compliance events
│   │   └── hook-state-2001.json     # Agent's hook state
│   └── agent-1764013520-3001/       # Another agent subfolder
│       └── ...
├── session-1764015000-def456/       # Different session (concurrent)
│   └── ...
└── session-abc123/                  # Old format (backward compatibility)
    └── ...
```

**Agent Detection:**
- Automatically detects when running inside an agent via process tree walking
- Agent logs isolated to `agent-{timestamp}-{pid}/` subfolders
- Main session and agent logs kept separate for clarity
- Each agent has its own metadata and event counters

### Session Metadata

Each session automatically tracks:

```json
{
  "sessionId": "abc123",
  "startTime": "2025-11-25T01:00:00.000Z",
  "endTime": null,
  "status": "active",
  "gitBranch": "main",
  "gitCommit": "a1b2c3d4",
  "claudeCodeVersion": null,
  "workflowVersion": "1.0.14",
  "eventCounts": {
    "hookExecutions": 42,
    "complianceSuccesses": 38,
    "complianceViolations": 4,
    "agentSpawns": 3
  },
  "lastActivity": "2025-11-25T01:30:00.000Z"
}
```

### Breaking Changes

**CLAUDE_SESSION_ID Required**

Previous hook utilities used `process.ppid` as fallback when `CLAUDE_SESSION_ID` was not set. The new session-logger **requires** `CLAUDE_SESSION_ID` and throws an error if not present.

**Migration:**
- Ensure all hooks run within Claude Code environment where `CLAUDE_SESSION_ID` is automatically provided
- For testing outside Claude Code, manually set `CLAUDE_SESSION_ID` environment variable
- Error message will guide you if the variable is missing

### API Reference

See JSDoc documentation in `session-logger.ts` for complete API details.

#### Exported Functions

- `getSessionId()`: Get current session ID from `CLAUDE_SESSION_ID` env var
- `detectAgentContext()`: **NEW** - Detect if running inside agent context via process tree walking
  - Returns: `{isAgent: boolean, agentName: string|null, agentPid: number|null, timestamp: number|null}`
  - Uses Linux `/proc` filesystem to walk parent process chain
  - Looks for pattern: `.claude/agents/{agent-name}.md` in parent cmdline
  - Gracefully falls back on non-Linux systems (returns `isAgent: false`)
- `ensureSessionFolder(sessionId)`: Create session folder structure with timestamp
- `findExistingSessionFolder(sessionId)`: **NEW** - Find existing session folder (with or without timestamp)
- `getSessionLogPath(sessionId, logType)`: Get path to session or agent log file (auto-detects context)
- `writeToSessionLog(logType, data, options)`: Write data to session or agent log (auto-detects context)
- `readSessionLog(logType, sessionId)`: Read session log with backward compatibility (tries all formats)
- `readOldFlatLogs(logType)`: Read from old flat log structure or old session folders

#### Constants

- `LOG_FILENAMES`: Mapping of log types to filenames

### Testing

Comprehensive test suite in `tests/lib/session-logger.test.js` with 49 test cases covering:

- All exported functions
- Error conditions and edge cases
- Process-specific hook state isolation
- Atomic write operations
- Backward compatibility
- Integration scenarios

Run tests:
```bash
npm test -- tests/lib/session-logger.test.js
```

### Design Patterns

**Atomic Writes**
```javascript
// Temp file with PID to prevent collisions
const tempFile = `${logPath}.${process.pid}.tmp`;

try {
  await fs.writeFile(tempFile, content, 'utf-8');
  await fs.rename(tempFile, logPath); // Atomic operation
} catch (err) {
  await fs.unlink(tempFile); // Clean up on error
  throw err;
}
```

**Non-Blocking Metadata**
```javascript
try {
  await updateMetadata(sessionId, sessionDir, logType);
} catch (err) {
  // Metadata failures don't break logging
  console.error('Failed to update metadata:', err.message);
}
```

## Other Utility Scripts

### Hook State (`hook-state.js`)

Shared hook state management system integrated with session-logger.ts (refactored in task-41).

**Key Features:**
- Session-isolated state storage with process-level isolation
- Integration with session-logger.ts for consistent path management
- Automatic agent detection and folder isolation
- Backward compatibility with old root-level state files
- Atomic writes with temp file pattern
- Automatic cleanup of stale state files (>24h)

**Integration with session-logger.ts:**
- Uses `getSessionId()` for consistent session identification
- Uses `getSessionLogPath()` for process-specific file paths (`.claude/logs/session-{id}/hook-state-{pid}.json`)
- Uses `ensureSessionFolder()` for session folder creation
- Supports agent subfolders automatically (`.claude/logs/session-{id}/agent-{agentPid}/hook-state-{hookPid}.json`)

**Exports:**
- `readState()`: Read current hook state
- `writeState(state)`: Write state atomically

**Used by hooks:**
- `logger-posttooluse.js`: Logs tool usage

### Analytics Viewer (`view-analytics.js`)

CLI tool for viewing session analytics and logs.

### Project Structure (`update-project-structure.js`)

Generates `.claude/project-structure.md` for documentation.

### Task Validator (`validate-task.js`)

Validates task file structure and completeness.

## Contributing

When adding new utility scripts:

1. Use ESM module syntax (`import`/`export`)
2. Include comprehensive JSDoc documentation
3. Write unit tests in `tests/lib/`
4. Update this README with usage examples
5. Follow atomic operation patterns for file writes
6. Handle errors gracefully with descriptive messages
