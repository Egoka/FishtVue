#!/usr/bin/env node
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};

// src/templates/.claude/hooks/core/path-resolver.ts
import fs from "node:fs";
import path from "node:path";
function resolveProjectPath(...segments) {
  return path.resolve(resolveProjectRoot(), ...segments);
}
function resolveProjectRoot() {
  try {
    const configDir = findConfigDir();
    if (configDir !== void 0 && configDir !== "") {
      const configPath = path.join(configDir, ".claude", "workflow-config.json");
      try {
        const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
        if (config._projectRoot !== void 0 && config._projectRoot !== "") {
          const normalizedRoot = path.resolve(config._projectRoot);
          try {
            fs.statSync(normalizedRoot);
            return normalizedRoot;
          } catch (error) {
            console.warn(`[path-resolver] _projectRoot not accessible: ${normalizedRoot}, ${error instanceof Error ? error.message : String(error)}`);
          }
        }
      } catch (error) {
        console.warn(`[path-resolver] Failed to read workflow-config.json: ${error instanceof Error ? error.message : String(error)}`);
      }
      return configDir;
    }
  } catch (error) {
    console.warn(`[path-resolver] Directory traversal failed: ${error instanceof Error ? error.message : String(error)}`);
  }
  return path.resolve(process.cwd());
}
function findConfigDir() {
  let currentDir = path.resolve(process.cwd());
  const root = path.parse(currentDir).root;
  while (currentDir !== root) {
    const configPath = path.join(currentDir, ".claude", "workflow-config.json");
    try {
      fs.statSync(configPath);
      return currentDir;
    } catch (error) {
      if (error.code !== "ENOENT") {
        console.warn(`[path-resolver] Error checking ${configPath}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    currentDir = path.dirname(currentDir);
  }
  const rootConfigPath = path.join(root, ".claude", "workflow-config.json");
  try {
    fs.statSync(rootConfigPath);
    return root;
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.warn(`[path-resolver] Error checking ${rootConfigPath}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  return void 0;
}
var init_path_resolver = __esm({
  "src/templates/.claude/hooks/core/path-resolver.ts"() {
    "use strict";
  }
});

// src/templates/.claude/hooks/core/session-state.ts
import {
  closeSync,
  constants,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  readdirSync,
  unlinkSync
} from "node:fs";
import path2 from "node:path";
function getSessionId() {
  const envSessionId = process.env.CLAUDE_SESSION_ID;
  if (envSessionId !== void 0 && envSessionId.trim() !== "") {
    return envSessionId.trim();
  }
  const existingId = findExistingSessionIdForPid();
  if (existingId) {
    return existingId;
  }
  const timestamp = Math.floor(Date.now() / 1e3);
  const claudePid = process.ppid || process.pid;
  return `${timestamp}-${claudePid}`;
}
function getParentPid(pid) {
  try {
    const statPath = `/proc/${pid}/stat`;
    if (!existsSync(statPath)) {
      return void 0;
    }
    const stat = readFileSync(statPath, "utf8");
    const closeParen = stat.lastIndexOf(")");
    if (closeParen === -1) return void 0;
    const fields = stat.substring(closeParen + 2).split(" ");
    const ppid = parseInt(fields[1], 10);
    return isNaN(ppid) ? void 0 : ppid;
  } catch {
    return void 0;
  }
}
function findExistingSessionIdForPid() {
  const logsDir = resolveProjectPath(".claude", "logs");
  let sessionPids;
  try {
    const entries = readdirSync(logsDir, { withFileTypes: true });
    sessionPids = /* @__PURE__ */ new Map();
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name.startsWith("session-")) {
        const match = entry.name.match(/session-(\d+-\d+)$/);
        if (match) {
          const pidMatch = entry.name.match(/session-\d+-(\d+)$/);
          if (pidMatch) {
            sessionPids.set(parseInt(pidMatch[1], 10), match[1]);
          }
        }
      }
    }
  } catch {
    return void 0;
  }
  if (sessionPids.size === 0) {
    return void 0;
  }
  let currentPid = process.ppid || process.pid;
  const maxDepth = 20;
  for (let depth = 0; depth < maxDepth && currentPid > 1; depth++) {
    const sessionId = sessionPids.get(currentPid);
    if (sessionId) {
      return sessionId;
    }
    const parentPid = getParentPid(currentPid);
    if (parentPid === void 0) break;
    currentPid = parentPid;
  }
  return void 0;
}
var init_session_state = __esm({
  "src/templates/.claude/hooks/core/session-state.ts"() {
    "use strict";
    init_path_resolver();
  }
});

// src/templates/.claude/scripts/session-logger.ts
import fsSync from "node:fs";
import fs2 from "node:fs/promises";
import path3 from "node:path";
function getParentPid2(pid) {
  try {
    const statPath = `/proc/${pid}/stat`;
    if (!fsSync.existsSync(statPath)) {
      return void 0;
    }
    const stat = fsSync.readFileSync(statPath, "utf8");
    const closeParen = stat.lastIndexOf(")");
    if (closeParen === -1) return void 0;
    const fields = stat.substring(closeParen + 2).split(" ");
    const ppid = parseInt(fields[1], 10);
    return isNaN(ppid) ? void 0 : ppid;
  } catch {
    return void 0;
  }
}
function findSessionFolderByProcessTree() {
  const logsDir = resolveProjectPath(".claude", "logs");
  const sessionPids = /* @__PURE__ */ new Map();
  try {
    const entries = fsSync.readdirSync(logsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name.startsWith("session-")) {
        const match = entry.name.match(/session-\d+-(\d+)$/);
        if (match) {
          sessionPids.set(parseInt(match[1], 10), entry.name);
        }
      }
    }
  } catch {
    return void 0;
  }
  if (sessionPids.size === 0) {
    return void 0;
  }
  let currentPid = process.ppid || process.pid;
  const maxDepth = 20;
  for (let depth = 0; depth < maxDepth && currentPid > 1; depth++) {
    const folder = sessionPids.get(currentPid);
    if (folder) {
      return folder;
    }
    const parentPid = getParentPid2(currentPid);
    if (parentPid === void 0) break;
    currentPid = parentPid;
  }
  return void 0;
}
function readGlobalAgentContextFile() {
  try {
    const contextPath = resolveProjectPath(".claude", "agent-context.json");
    if (!fsSync.existsSync(contextPath)) {
      return void 0;
    }
    const content = fsSync.readFileSync(contextPath, "utf8");
    return JSON.parse(content);
  } catch {
    return void 0;
  }
}
function readAgentContextFile(_sessionId) {
  try {
    const logsDir = resolveProjectPath(".claude", "logs");
    const sessionFolder = findSessionFolderByProcessTree();
    if (!sessionFolder) {
      return void 0;
    }
    const contextPath = path3.join(logsDir, sessionFolder, "agent-context.json");
    if (!fsSync.existsSync(contextPath)) {
      return void 0;
    }
    const content = fsSync.readFileSync(contextPath, "utf8");
    return JSON.parse(content);
  } catch {
    return void 0;
  }
}
function readAgentFromWorkflowState(_sessionId) {
  try {
    const logsDir = resolveProjectPath(".claude", "logs");
    const sessionFolder = findSessionFolderByProcessTree();
    if (!sessionFolder) {
      return void 0;
    }
    const statePath = path3.join(logsDir, sessionFolder, "workflow-state.json");
    if (!fsSync.existsSync(statePath)) {
      return void 0;
    }
    const content = fsSync.readFileSync(statePath, "utf8");
    const state = JSON.parse(content);
    if (state.workflows && Array.isArray(state.workflows)) {
      for (const workflow of state.workflows) {
        if (workflow.status === "running" && workflow.current_phase?.status === "running" && workflow.current_phase?.agent) {
          return workflow.current_phase.agent;
        }
      }
    }
    return void 0;
  } catch {
    return void 0;
  }
}
function detectAgentContext() {
  const MILLISECONDS_TO_SECONDS = 1e3;
  const envAgentName = process.env.CLAUDE_AGENT_NAME;
  if (envAgentName) {
    const envAgentPid = process.env.CLAUDE_AGENT_PID ? parseInt(process.env.CLAUDE_AGENT_PID, 10) : process.ppid;
    return {
      agentName: envAgentName,
      agentPid: envAgentPid,
      isAgent: true,
      timestamp: Math.floor(Date.now() / MILLISECONDS_TO_SECONDS)
    };
  }
  try {
    const globalContextFile = readGlobalAgentContextFile();
    if (globalContextFile && globalContextFile.agentName) {
      process.stderr.write(`[agent-context] Detected agent from global file: ${globalContextFile.agentName}
`);
      return {
        agentName: globalContextFile.agentName,
        agentPid: globalContextFile.parentPid,
        isAgent: true,
        timestamp: Math.floor(new Date(globalContextFile.startedAt).getTime() / MILLISECONDS_TO_SECONDS)
      };
    }
  } catch {
  }
  try {
    const sessionId = getSessionId();
    const workflowAgent = readAgentFromWorkflowState(sessionId);
    if (workflowAgent) {
      process.stderr.write(`[agent-context] Detected agent from workflow-state: ${workflowAgent}
`);
      return {
        agentName: workflowAgent,
        agentPid: process.ppid,
        isAgent: true,
        timestamp: Math.floor(Date.now() / MILLISECONDS_TO_SECONDS)
      };
    }
  } catch (error) {
    process.stderr.write(`[agent-context] workflow-state detection failed: ${error instanceof Error ? error.message : String(error)}
`);
  }
  try {
    const sessionId = getSessionId();
    const contextFile = readAgentContextFile(sessionId);
    if (contextFile && contextFile.agentName) {
      return {
        agentName: contextFile.agentName,
        agentPid: contextFile.parentPid,
        isAgent: true,
        timestamp: Math.floor(new Date(contextFile.startedAt).getTime() / MILLISECONDS_TO_SECONDS)
      };
    }
  } catch {
  }
  try {
    const ppid = process.ppid;
    if (!ppid || ppid === 1) {
      return { agentName: void 0, agentPid: void 0, isAgent: false, timestamp: void 0 };
    }
    const cmdlinePath = `/proc/${String(ppid)}/cmdline`;
    if (!fsSync.existsSync(cmdlinePath)) {
      return { agentName: void 0, agentPid: void 0, isAgent: false, timestamp: void 0 };
    }
    const cmdline = fsSync.readFileSync(cmdlinePath, "utf8").split("\0").join(" ");
    const agentMatch = /\.claude\/agents\/([^/\s]+)\.md/.exec(cmdline);
    if (agentMatch) {
      return {
        agentName: agentMatch[1],
        agentPid: ppid,
        isAgent: true,
        timestamp: Math.floor(Date.now() / MILLISECONDS_TO_SECONDS)
      };
    }
    return { agentName: void 0, agentPid: void 0, isAgent: false, timestamp: void 0 };
  } catch {
    return { agentName: void 0, agentPid: void 0, isAgent: false, timestamp: void 0 };
  }
}
async function ensureSessionFolder(sessionId) {
  const logsDir = resolveProjectPath(".claude", "logs");
  const folderName = getOrCreateSessionFolder(sessionId);
  const sessionDir = path3.join(logsDir, folderName);
  try {
    await fs2.mkdir(sessionDir, { recursive: true });
    return sessionDir;
  } catch (error) {
    if (error.code !== "EEXIST") {
      throw error;
    }
    return sessionDir;
  }
}
function findSessionFolder(sessionId) {
  const logsDir = resolveProjectPath(".claude", "logs");
  try {
    const entries = fsSync.readdirSync(logsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (entry.name === `session-${sessionId}` || entry.name.endsWith(`-${sessionId}`)) {
          return entry.name;
        }
      }
    }
  } catch {
  }
  return void 0;
}
function getOrCreateSessionFolder(sessionId) {
  const existing = findSessionFolder(sessionId);
  if (existing) return existing;
  const MILLISECONDS_TO_SECONDS = 1e3;
  const timestamp = Math.floor(Date.now() / MILLISECONDS_TO_SECONDS);
  return `session-${String(timestamp)}-${sessionId}`;
}
function getSessionLogPath(sessionId, logType, sessionDir = void 0) {
  const filename = LOG_FILENAMES[logType];
  if (!filename) {
    throw new Error(
      `Invalid log type: "${logType}". Valid types: ${Object.keys(LOG_FILENAMES).join(", ")}`
    );
  }
  const logsDir = resolveProjectPath(".claude", "logs");
  const agentContext = detectAgentContext();
  sessionDir ??= path3.join(logsDir, getOrCreateSessionFolder(sessionId));
  if (agentContext.isAgent) {
    const agentTimestamp = agentContext.timestamp ?? Math.floor(Date.now() / 1e3);
    const agentFolder = `agent-${String(agentTimestamp)}-${String(agentContext.agentPid)}`;
    const agentDir = path3.join(sessionDir, agentFolder);
    try {
      fsSync.mkdirSync(agentDir, { recursive: true });
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code !== "EEXIST") {
        console.error(`Failed to create agent folder: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    if (logType === "hook-state") {
      return path3.join(agentDir, "hook-state.jsonl");
    }
    return path3.join(agentDir, filename);
  }
  if (logType === "hook-state") {
    return path3.join(sessionDir, "hook-state.jsonl");
  }
  return path3.join(sessionDir, filename);
}
async function writeToSessionLog(logType, data, options = {}) {
  const sessionId = options.sessionId ?? getSessionId();
  const append = options.append ?? true;
  await ensureSessionFolder(sessionId);
  const logPath = getSessionLogPath(sessionId, logType);
  let content = typeof data === "string" ? data : JSON.stringify(data);
  content += "\n";
  try {
    if (append) {
      await fs2.appendFile(logPath, content, "utf8");
    } else {
      const tempFile = `${logPath}.${String(process.pid)}.tmp`;
      await fs2.writeFile(tempFile, content, "utf8");
      await fs2.rename(tempFile, logPath);
    }
  } catch (error) {
    throw new Error(`Failed to write to ${logType} log: ${error instanceof Error ? error.message : String(error)}`);
  }
}
var LOG_FILENAMES;
var init_session_logger = __esm({
  "src/templates/.claude/scripts/session-logger.ts"() {
    "use strict";
    init_path_resolver();
    init_session_state();
    LOG_FILENAMES = {
      "agent-orchestration": "agent-orchestration.log",
      "agent-spawning": "agent-spawning.log",
      "campaign-state": "campaign-state.log",
      "compliance": "compliance.jsonl",
      "config-changes": "config-changes.jsonl",
      "file-changes": "file-changes.log",
      "hook-activity": "hook-activity.log",
      "hook-state": "hook-state.jsonl",
      // Changed from .json to .jsonl (append-only)
      "tokens": "tokens.jsonl"
    };
  }
});

// src/templates/.claude/hooks/compliance/path-validator.ts
init_session_logger();
import path4 from "node:path";

// src/templates/.claude/scripts/hook-utils.js
function outputEmpty() {
}
function outputAllow() {
  console.log('{"permissionDecision":"allow"}');
}
function safeJsonOutput(obj) {
  try {
    const json = JSON.stringify(obj);
    console.log(json);
  } catch (error) {
    process.stderr.write(`[hook-utils] JSON stringify failed: ${error instanceof Error ? error.message : String(error)}
`);
    outputEmpty();
  }
}
function exitSuccess() {
  process.exit(0);
}

// src/templates/.claude/hooks/core/hook-logger.ts
init_session_logger();
function logHookActivity(hookName, eventName, result) {
  try {
    const logEntry = {
      details: result.details ?? void 0,
      error: result.error === void 0 ? void 0 : formatError(result.error),
      event: eventName,
      hook: hookName,
      status: result.status,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      // Include any additional data from the result
      ...Object.fromEntries(
        Object.entries(result).filter(
          ([key]) => !["details", "error", "status"].includes(key)
        )
      )
    };
    void writeToSessionLog("hook-activity", logEntry);
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    process.stderr.write(`[hook-logger] Error: ${errorMessage}
`);
  }
}
function formatError(error) {
  if (isErrorLike(error)) {
    return {
      message: error.message,
      stack: error.stack
    };
  }
  if (typeof error === "string") {
    return {
      message: error,
      stack: void 0
    };
  }
  if (typeof error === "object" && error !== null) {
    if (Array.isArray(error)) {
      return {
        message: JSON.stringify(error),
        stack: void 0
      };
    }
    return {
      message: JSON.stringify(error),
      stack: void 0
    };
  }
  return {
    message: JSON.stringify(error),
    stack: void 0
  };
}
function getErrorMessage(error) {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  if (typeof error === "object" && error !== null) {
    if ("message" in error && typeof error.message === "string") {
      return error.message;
    }
    return "Error object (details unavailable)";
  }
  return "Unknown error";
}
function isErrorLike(value) {
  return typeof value === "object" && value !== null && "message" in value && typeof value.message === "string";
}

// src/templates/.claude/hooks/compliance/path-validator.ts
init_path_resolver();
var TOOL_EDIT = "Edit";
var TOOL_WRITE = "Write";
var TOOL_BASH = "Bash";
var VALIDATION_RULES = [
  // Rule 0: Feature-planner can only Edit files in backlog/specs/ (its own spec files)
  {
    name: "feature-planner-edit-enforcer",
    agentFilter: "feature-planner",
    toolFilter: [TOOL_EDIT],
    pattern: /^backlog\/specs\/feature-[0-9]+-[a-z0-9-]+\.md$/,
    shouldMatch: true,
    // BLOCK if doesn't match (can only edit spec files)
    errorTitle: "FEATURE-PLANNER CANNOT EDIT THIS FILE",
    errorHelp: "Feature-planner can only edit its own spec files in backlog/specs/",
    examplePaths: [
      "backlog/specs/feature-123-user-authentication.md",
      "backlog/specs/feature-456-payment-integration.md"
    ],
    additionalContext: [
      "\u2022 feature-planner defines WHAT needs to be built, not HOW",
      "\u2022 Editing code is the job of implementation agents (backend-engineer, frontend-engineer)",
      "\u2022 You can only edit feature spec files you've created",
      "\u2022 Spec files must be in backlog/specs/ with correct naming"
    ]
  },
  // Rule 1: Block task files in subdirectories of backlog/tasks/
  {
    name: "task-subdirectory-blocker",
    agentFilter: void 0,
    // Applies to all agents
    pattern: /^backlog\/tasks\/[^/]+\/.*\.md$/,
    shouldMatch: false,
    // BLOCK if matches (task in subdirectory = invalid)
    errorTitle: "INVALID TASK FILE PATH",
    errorHelp: "Cannot create task files in subdirectories of backlog/tasks/",
    additionalContext: [
      "\u2022 The backlog CLI requires tasks in backlog/tasks/ (flat structure)",
      "\u2022 Subdirectories are NOT valid locations",
      "\u2022 Even if subdirectories exist, they should be IGNORED",
      "\u2022 Task files must be created directly in backlog/tasks/"
    ]
  },
  // Rule 2: Enforce feature-planner can only write to backlog/specs/ with correct naming
  {
    name: "feature-spec-enforcer",
    agentFilter: "feature-planner",
    // Only applies to feature-planner agent
    toolFilter: [TOOL_WRITE],
    // Only applies to Write (Edit is already blocked above)
    pattern: /^backlog\/specs\/feature-[0-9]+-[a-z0-9-]+\.md$/,
    shouldMatch: true,
    // BLOCK if doesn't match (wrong naming = invalid)
    errorTitle: "INVALID FEATURE SPEC PATH",
    errorHelp: "Feature-planner can ONLY write to backlog/specs/ with correct naming",
    examplePaths: [
      "backlog/specs/feature-123-user-authentication.md",
      "backlog/specs/feature-456-payment-integration.md"
    ],
    additionalContext: [
      "\u2022 Feature specs must be in backlog/specs/ directory",
      '\u2022 Filename must start with "feature-" followed by numeric ID',
      "\u2022 Must use kebab-case slug (lowercase, hyphens only)",
      "\u2022 Must end with .md extension"
    ]
  },
  // Rule 3: Logo-designer can ONLY write to .claude/logos/ directory
  // No toolFilter - applies to both Write and Edit (logos + metadata files)
  {
    name: "logo-designer-path-enforcer",
    agentFilter: "logo-designer",
    includeBash: true,
    // Also intercepts Bash downloads (curl -o, wget -O)
    pattern: /^\.claude\/logos\//,
    shouldMatch: true,
    // BLOCK if doesn't match (must be in .claude/logos/)
    errorTitle: "LOGO-DESIGNER: INVALID OUTPUT PATH",
    errorHelp: "Logo-designer can ONLY save files to .claude/logos/{timestamp}/",
    examplePaths: [
      ".claude/logos/1705849200000/ideogram-1.png",
      ".claude/logos/1705849200000/metadata.json",
      ".claude/logos/manifest.json"
    ],
    additionalContext: [
      "\u2022 ALL logos MUST be saved to .claude/logos/{timestamp}/",
      "\u2022 manifest.json MUST be at .claude/logos/manifest.json",
      "\u2022 metadata.json MUST be in the run folder",
      "\u2022 NEVER save to frontend/, public/, or assets/ directories",
      "\u2022 This preserves logo history and enables the gallery feature",
      "\u2022 Bash downloads (curl/wget) are also validated"
    ]
  },
  // Rule 4: Banner-designer can ONLY write to .claude/banners/ directory
  {
    name: "banner-designer-path-enforcer",
    agentFilter: "banner-designer",
    includeBash: true,
    // Also intercepts Bash downloads (curl -o, wget -O)
    pattern: /^\.claude\/banners\//,
    shouldMatch: true,
    // BLOCK if doesn't match (must be in .claude/banners/)
    errorTitle: "BANNER-DESIGNER: INVALID OUTPUT PATH",
    errorHelp: "Banner-designer can ONLY save files to .claude/banners/{timestamp}/",
    examplePaths: [
      ".claude/banners/1705849200000/ideogram-1.png",
      ".claude/banners/1705849200000/metadata.json",
      ".claude/banners/manifest.json"
    ],
    additionalContext: [
      "\u2022 ALL banners MUST be saved to .claude/banners/{timestamp}/",
      "\u2022 manifest.json MUST be at .claude/banners/manifest.json",
      "\u2022 metadata.json MUST be in the run folder",
      "\u2022 NEVER save to frontend/, public/, or assets/ directories",
      "\u2022 This preserves banner history and enables the gallery feature",
      "\u2022 Bash downloads (curl/wget) are also validated"
    ]
  },
  // Rule 5: surreal-clip-generator can ONLY write to .claude/video/surreal/ directory
  {
    name: "surreal-clip-generator-path-enforcer",
    agentFilter: "surreal-clip-generator",
    includeBash: true,
    // Intercepts curl/wget/ffmpeg downloads
    pattern: /^\.claude\/video\/surreal\//,
    shouldMatch: true,
    // BLOCK if doesn't match (must be in .claude/video/surreal/)
    errorTitle: "SURREAL-CLIP-GENERATOR: INVALID OUTPUT PATH",
    errorHelp: "surreal-clip-generator can ONLY save files to .claude/video/surreal/{run-id}/",
    examplePaths: [
      ".claude/video/surreal/video-20260209-melting-clocks/clips/clip-01-melting.mp4",
      ".claude/video/surreal/video-20260209-melting-clocks/metadata/clip-01-melting.json"
    ],
    additionalContext: [
      "\u2022 ALL clips MUST be saved to .claude/video/surreal/{run-id}/clips/",
      "\u2022 Metadata MUST be in .claude/video/surreal/{run-id}/metadata/",
      "\u2022 NEVER save to /tmp/, ~/Downloads, or project root",
      "\u2022 Gallery-first storage ensures clips persist across sessions",
      "\u2022 Bash downloads (curl/wget/ffmpeg) are also validated"
    ]
  },
  // Rule 6: surreal-clip-compositor can ONLY write to .claude/video/ directory
  {
    name: "surreal-clip-compositor-path-enforcer",
    agentFilter: "surreal-clip-compositor",
    includeBash: true,
    // Intercepts ffmpeg/cp commands
    pattern: /^\.claude\/video\//,
    shouldMatch: true,
    // BLOCK if doesn't match (must be in .claude/video/)
    errorTitle: "SURREAL-CLIP-COMPOSITOR: INVALID OUTPUT PATH",
    errorHelp: "surreal-clip-compositor can ONLY save files to .claude/video/",
    examplePaths: [
      ".claude/video/surreal/video-20260209-melting-clocks/output.mp4",
      ".claude/video/surreal/video-20260209-melting-clocks/thumbnail.png",
      ".claude/video/manifest.json"
    ],
    additionalContext: [
      "\u2022 Final output MUST be at .claude/video/surreal/{run-id}/output.mp4",
      "\u2022 Thumbnail MUST be at .claude/video/surreal/{run-id}/thumbnail.png",
      "\u2022 Gallery manifest is at .claude/video/manifest.json",
      "\u2022 NEVER save final output to /tmp/ or outside the gallery directory",
      "\u2022 Bash commands (ffmpeg/cp) are also validated"
    ]
  },
  // Rule 7: demo-recorder can ONLY write to .claude/video/ directory
  {
    name: "demo-recorder-path-enforcer",
    agentFilter: "demo-recorder",
    includeBash: true,
    // Intercepts ffmpeg/cp commands
    pattern: /^\.claude\/video\//,
    shouldMatch: true,
    // BLOCK if doesn't match
    errorTitle: "DEMO-RECORDER: INVALID OUTPUT PATH",
    errorHelp: "demo-recorder can ONLY save files to .claude/video/",
    examplePaths: [
      ".claude/video/demo/video-20260209-product-demo/output.mp4",
      ".claude/video/demo/video-20260209-product-demo/thumbnail.png",
      ".claude/video/demo/video-20260209-product-demo/prompt.md",
      ".claude/video/manifest.json"
    ],
    additionalContext: [
      "\u2022 Final output MUST be in .claude/video/demo/{run-id}/",
      "\u2022 Prompt files MUST be in .claude/video/demo/{run-id}/",
      "\u2022 Gallery manifest is at .claude/video/manifest.json",
      "\u2022 NEVER save to project root, video-prompts/, /tmp/, or assets/",
      "\u2022 Bash commands (ffmpeg/cp) are also validated"
    ]
  },
  // Rule 8: demo-planner can ONLY write to .claude/video/ directory
  {
    name: "demo-planner-path-enforcer",
    agentFilter: "demo-planner",
    pattern: /^\.claude\/video\//,
    shouldMatch: true,
    // BLOCK if doesn't match
    errorTitle: "DEMO-PLANNER: INVALID OUTPUT PATH",
    errorHelp: "demo-planner can ONLY write files to .claude/video/",
    examplePaths: [
      ".claude/video/demo/video-20260209-product-demo/prompt.md"
    ],
    additionalContext: [
      "\u2022 Prompt files MUST be in .claude/video/demo/{run-id}/",
      "\u2022 NEVER write to video-prompts/ or project root",
      "\u2022 All video workflow files belong under .claude/video/"
    ]
  },
  // Rule 9: demo-reviewer can ONLY write to .claude/video/manifest.json
  {
    name: "demo-reviewer-path-enforcer",
    agentFilter: "demo-reviewer",
    includeBash: true,
    pattern: /^\.claude\/video\/manifest\.json$/,
    shouldMatch: true,
    // BLOCK if doesn't match
    errorTitle: "DEMO-REVIEWER: CANNOT WRITE FILES",
    errorHelp: "demo-reviewer can ONLY write to .claude/video/manifest.json (gallery manifest on QA pass)",
    examplePaths: [
      ".claude/video/manifest.json"
    ],
    additionalContext: [
      "\u2022 demo-reviewer is an analysis agent -- it reads videos, not writes them",
      "\u2022 The only file it writes is the gallery manifest when QA passes",
      "\u2022 /tmp/mcp-media/ copies are via Bash cp to shared volume (allowed as temp)"
    ]
  }
];
function formatBlockMessage(rule, attemptedPath) {
  const red = "\x1B[31m";
  const yellow = "\x1B[33m";
  const cyan = "\x1B[36m";
  const white = "\x1B[37m";
  const reset = "\x1B[0m";
  let output = `
${red}\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
`;
  output += `\u{1F6AB} ${rule.errorTitle}
`;
  output += `\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501${reset}

`;
  output += `${yellow}\u26A0\uFE0F  ${rule.errorHelp}${reset}

`;
  output += `${white}Attempted path:${reset}
`;
  output += `  ${red}${attemptedPath}${reset}

`;
  if (rule.examplePaths && rule.examplePaths.length > 0) {
    output += `${white}Valid examples:${reset}
`;
    for (const example of rule.examplePaths) {
      output += `  ${cyan}${example}${reset}
`;
    }
    output += "\n";
  }
  if (rule.additionalContext && rule.additionalContext.length > 0) {
    output += `${white}Why this is blocked:${reset}
`;
    for (const context of rule.additionalContext) {
      output += `  ${context}
`;
    }
    output += "\n";
  }
  if (rule.name === "task-subdirectory-blocker") {
    const parts = attemptedPath.split("/");
    const filename = parts[parts.length - 1] ?? "";
    output += `${white}Correct path:${reset}
`;
    output += `  ${cyan}backlog/tasks/${filename}${reset}

`;
    output += `${cyan}Action Required:${reset}
`;
    output += `  Change file path to: backlog/tasks/${filename}

`;
  } else {
    output += `${cyan}Action Required:${reset}
`;
    output += "  Change file path to match the required pattern\n\n";
  }
  output += `${cyan}\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501${reset}
`;
  return output;
}
function evaluateRule(rule, normalizedPath, toolName, agentContext) {
  if (rule.agentFilter !== void 0) {
    if (!agentContext.isAgent || agentContext.agentName !== rule.agentFilter) {
      return { shouldBlock: false };
    }
  }
  const isBashWithInclude = toolName === TOOL_BASH && rule.includeBash === true;
  if (!isBashWithInclude && rule.toolFilter !== void 0 && !rule.toolFilter.includes(toolName)) {
    return { shouldBlock: false };
  }
  if (rule.blockAllOperations === true) {
    return {
      shouldBlock: true,
      reason: formatBlockMessage(rule, normalizedPath)
    };
  }
  const matches = rule.pattern.test(normalizedPath);
  const shouldBlock = rule.shouldMatch ? !matches : matches;
  if (shouldBlock) {
    return {
      shouldBlock: true,
      reason: formatBlockMessage(rule, normalizedPath)
    };
  }
  return { shouldBlock: false };
}
var DOCKER_PATH_MAPPINGS = [
  { docker: "/app/video-gallery/", host: ".claude/video/" },
  { docker: "/app/video-output/", host: ".claude/video/" }
];
function normalizeDockerPath(filePath) {
  for (const mapping of DOCKER_PATH_MAPPINGS) {
    if (filePath.startsWith(mapping.docker)) {
      return mapping.host + filePath.slice(mapping.docker.length);
    }
  }
  return filePath;
}
function extractBashOutputPaths(command) {
  const paths = [];
  const curlDashO = /\bcurl\b[^|;]*?(?:-o|--output)\s+["']?([^\s"';|>]+)["']?/g;
  let match;
  while ((match = curlDashO.exec(command)) !== null) {
    if (match[1]) paths.push(match[1]);
  }
  const wgetDashO = /\bwget\b[^|;]*?(?:-O|--output-document[= ])\s*["']?([^\s"';|>]+)["']?/g;
  while ((match = wgetDashO.exec(command)) !== null) {
    if (match[1]) paths.push(match[1]);
  }
  const redirect = /(?<![2&])>{1,2}\s*["']?([^\s"';|>]+)["']?/g;
  while ((match = redirect.exec(command)) !== null) {
    if (match[1]) paths.push(match[1]);
  }
  const teeMatch = /\btee\b\s+(?:-[a-z]\s+)*["']?([^\s"';|>]+)["']?/g;
  while ((match = teeMatch.exec(command)) !== null) {
    if (match[1]) paths.push(match[1]);
  }
  const cpMatch = /\bcp\b\s+(?:-[a-zA-Z]+\s+)*(?:["']?[^\s"';|>]+["']?\s+)+["']?([^\s"';|>]+)["']?/g;
  while ((match = cpMatch.exec(command)) !== null) {
    if (match[1]) paths.push(match[1]);
  }
  const ffmpegMatch = /\bffmpeg\b.*?\s["']?([^\s"';|>]+\.(?:mp4|mkv|webm|mov|avi|png|jpg|jpeg|mp3|wav|aac|gif))["']?\s*$/gm;
  while ((match = ffmpegMatch.exec(command)) !== null) {
    if (match[1]) paths.push(match[1]);
  }
  return paths;
}
function hasBashRulesForAgent(agentName) {
  if (!agentName) return false;
  return VALIDATION_RULES.some(
    (rule) => rule.includeBash === true && rule.agentFilter === agentName
  );
}
var inputData = "";
process.stdin.on("data", (chunk) => {
  inputData += chunk.toString();
});
process.stdin.on("end", () => {
  try {
    const event = JSON.parse(inputData);
    const toolName = event.tool_name ?? event.toolName ?? "";
    const toolInput = event.tool_input ?? event.toolInput ?? {};
    const agentContext = detectAgentContext();
    if (toolName === TOOL_BASH) {
      if (!agentContext.isAgent || !hasBashRulesForAgent(agentContext.agentName)) {
        outputAllow();
        exitSuccess();
      }
      const command = toolInput.command ?? "";
      const outputPaths = extractBashOutputPaths(command);
      if (outputPaths.length === 0) {
        logHookActivity("path-validator", "PreToolUse", {
          details: `Bash command has no file outputs, allowing`,
          status: "success"
        });
        outputAllow();
        exitSuccess();
      }
      for (const outputPath of outputPaths) {
        const dockerNormalized = normalizeDockerPath(outputPath);
        const normalizedPath2 = dockerNormalized.startsWith("/") ? path4.relative(resolveProjectRoot(), dockerNormalized) : dockerNormalized;
        for (const rule of VALIDATION_RULES) {
          if (!rule.includeBash) continue;
          const result = evaluateRule(rule, normalizedPath2, toolName, agentContext);
          if (result.shouldBlock) {
            logHookActivity("path-validator", "PreToolUse", {
              details: `Bash blocked by rule '${rule.name}': ${normalizedPath2} (command: ${command.slice(0, 100)})`,
              status: "blocked"
            });
            const response = {
              hookSpecificOutput: {
                block: {
                  reason: result.reason
                },
                hookEventName: "PreToolUse"
              }
            };
            safeJsonOutput(response);
            exitSuccess();
          }
        }
      }
      logHookActivity("path-validator", "PreToolUse", {
        details: `Bash outputs validated: ${outputPaths.join(", ")}`,
        status: "success"
      });
      outputAllow();
      exitSuccess();
    }
    if (![TOOL_EDIT, TOOL_WRITE].includes(toolName)) {
      logHookActivity("path-validator", "PreToolUse", {
        details: `Tool ${toolName} is not Write/Edit/Bash, allowing`,
        status: "success"
      });
      outputAllow();
      exitSuccess();
    }
    const filePath = toolInput.file_path ?? "";
    const normalizedPath = filePath.startsWith("/") ? path4.relative(resolveProjectRoot(), filePath) : filePath;
    for (const rule of VALIDATION_RULES) {
      const result = evaluateRule(rule, normalizedPath, toolName, agentContext);
      if (result.shouldBlock) {
        logHookActivity("path-validator", "PreToolUse", {
          details: `Blocked by rule '${rule.name}': ${normalizedPath}`,
          status: "blocked"
        });
        const response = {
          hookSpecificOutput: {
            block: {
              reason: result.reason
            },
            hookEventName: "PreToolUse"
          }
        };
        safeJsonOutput(response);
        exitSuccess();
      }
    }
    logHookActivity("path-validator", "PreToolUse", {
      details: `Allowed file operation: ${normalizedPath}`,
      status: "success"
    });
    outputAllow();
    exitSuccess();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logHookActivity("path-validator", "PreToolUse", {
      error: errorMessage,
      status: "error"
    });
    console.error("Path validator hook error:", errorMessage);
    outputAllow();
    exitSuccess();
  }
});
