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

// src/templates/.claude/hooks/core/workflow-state.ts
init_path_resolver();
init_session_state();
import crypto from "node:crypto";
import fs3 from "node:fs/promises";
import fsSync2 from "node:fs";
import path4 from "node:path";
var MINUTES_IN_HOUR = 60;
var MILLISECONDS_PER_SECOND = 1e3;
var STATE_TTL_MINUTES = 30;
var STATE_TTL = STATE_TTL_MINUTES * MINUTES_IN_HOUR * MILLISECONDS_PER_SECOND;
async function clearWorkflowState(sessionId) {
  const resolvedSessionId = sessionId ?? getSessionId();
  const stateFile = getWorkflowStateFile(resolvedSessionId);
  try {
    await fs3.unlink(stateFile);
  } catch (error) {
    if (error instanceof Error && isNodeError(error) && error.code !== "ENOENT") {
      console.error("Failed to clear workflow state:", error);
    }
  }
}
async function getFeaturePlannerState() {
  const sessionId = getSessionId();
  const stateFile = getWorkflowStateFile(sessionId);
  try {
    const content = await fs3.readFile(stateFile, "utf8");
    const state = JSON.parse(content);
    const age = Date.now() - new Date(state.timestamp).getTime();
    if (age > STATE_TTL) {
      await clearWorkflowState();
      return void 0;
    }
    if (state.featurePlannerOutput === void 0) {
      return void 0;
    }
    return {
      status: state.featurePlannerOutput.status,
      taskCount: state.featurePlannerOutput.taskCount,
      taskIds: state.featurePlannerOutput.taskIds
    };
  } catch (error) {
    if (error instanceof Error && isNodeError(error) && error.code === "ENOENT") {
      return void 0;
    }
    console.error("Failed to read workflow state:", error);
    return void 0;
  }
}
var IMPLEMENTATION_AGENT_TYPES = [
  "frontend-engineer",
  "backend-engineer",
  "devops-engineer",
  "fullstacktard",
  "erlich-bachman",
  "css-fixer",
  "lint-fixer",
  "auto-fixer",
  "qa-engineer",
  "v0-ui-generator",
  "3d-engineer",
  "code-reviewer"
];
async function getWorkflowState(sessionId) {
  const resolvedSessionId = sessionId ?? getSessionId();
  const stateFile = getWorkflowStateFile(resolvedSessionId);
  try {
    const content = await fs3.readFile(stateFile, "utf8");
    const state = JSON.parse(content);
    const age = Date.now() - new Date(state.timestamp).getTime();
    if (age > STATE_TTL) {
      await clearWorkflowState(resolvedSessionId);
      return void 0;
    }
    if (state.sessionId && state.sessionId !== resolvedSessionId) {
      console.warn(
        `[workflow-state] Session ID mismatch: stored="${state.sessionId}", current="${resolvedSessionId}". This may occur after process restart. State returned as-is (no claim).`
      );
    }
    return state;
  } catch (error) {
    if (error instanceof Error && isNodeError(error) && error.code === "ENOENT") {
      return void 0;
    }
    if (error instanceof SyntaxError) {
      console.error("Corrupted workflow state file - deleting and starting fresh:", error);
      try {
        await fs3.unlink(stateFile);
      } catch {
      }
      return void 0;
    }
    console.error("Failed to read workflow state:", error);
    return void 0;
  }
}
async function transitionWorkflowPhase(newStatus) {
  const sessionId = getSessionId();
  const stateFile = getWorkflowStateFile(sessionId);
  const INDENT_SPACES = 2;
  try {
    const content = await fs3.readFile(stateFile, "utf8");
    const parsed = JSON.parse(content);
    if (parsed.featurePlannerOutput === void 0) {
      console.warn("No feature-planner workflow to transition");
      return;
    }
    parsed.featurePlannerOutput.status = newStatus;
    parsed.timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const tempFile = `${stateFile}.${String(process.pid)}.tmp`;
    await fs3.writeFile(tempFile, JSON.stringify(parsed, void 0, INDENT_SPACES), "utf8");
    await fs3.rename(tempFile, stateFile);
  } catch (error) {
    if (error instanceof Error && isNodeError(error) && error.code === "ENOENT") {
      console.warn("No workflow state to transition");
      return;
    }
    console.error("Failed to transition workflow phase:", error);
  }
}
function getWorkflowStateFile(sessionId) {
  return resolveProjectPath(".claude", "logs", `session-${sessionId}`, "workflow-state.json");
}
async function getActiveWorkflowPhase() {
  const state = await getWorkflowState();
  if (state?.workflows === void 0 || state.workflows.length === 0) {
    return void 0;
  }
  const running = state.workflows.find((w) => w.status === "running");
  if (running === void 0) {
    return void 0;
  }
  return {
    phase: running.current_phase,
    workflowId: running.workflow_id,
    workflowName: running.workflow_name
  };
}
function isNodeError(error) {
  return "code" in error;
}

// src/templates/.claude/hooks/orchestration/phase-enforcement.ts
function buildBlockingResponse(toolName, workflowName, workflowStatus, reason) {
  const red = "\x1B[31m";
  const yellow = "\x1B[33m";
  const white = "\x1B[37m";
  const reset = "\x1B[0m";
  let message = `
${red}\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
`;
  message += "\u{1F6AB} WORKFLOW PHASE ENFORCEMENT\n";
  message += `\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501${reset}

`;
  message += `${yellow}\u26A0\uFE0F  Cannot use ${white}${toolName}${yellow} during aggregation phase.${reset}

`;
  message += `${white}Current Workflow Status:${reset}
`;
  message += `  Workflow: ${workflowName}
`;
  message += `  Phase: ${workflowStatus}
`;
  message += "  Waiting for: workflow-aggregator agent\n\n";
  message += `${white}Why this is blocked:${reset}
`;
  message += "  The multi-phase workflow is awaiting result aggregation.\n";
  message += "  You must spawn the aggregator agent before continuing.\n\n";
  message += `${white}Required Action:${reset}
`;
  message += `  Spawn aggregator: ${white}Task(subagent_type="workflow-aggregator")${reset}

`;
  message += `${yellow}\u26A0\uFE0F  Bypass: Set CLAUDE_WORKFLOW_BYPASS_HOOKS=1 (logged)${reset}
`;
  message += `${red}\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501${reset}
`;
  return {
    hookSpecificOutput: {
      additionalContext: reason ?? "Phase boundary enforcement",
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: message,
      systemMessage: `Tool blocked: ${toolName}. Spawn workflow-aggregator first.`
    }
  };
}
var IMPLEMENTATION_TOOLS = [
  "Edit",
  "Write",
  "NotebookEdit"
];
var ALWAYS_ALLOWED_TOOLS = [
  "Read",
  "Glob",
  "Grep",
  "WebFetch",
  "WebSearch",
  "TaskOutput",
  "TaskList",
  "TaskGet",
  "Bash",
  "AskUserQuestion",
  "EnterPlanMode",
  "ExitPlanMode"
];
var WORKFLOW_STATE_PATH_PATTERNS = [
  /\/\.claude\/logs\/session-[^/]+\/workflow-state\.json$/,
  /\/\.claude\/workflows\/active\/[^/]+\.json$/
];
function isWorkflowStateWrite(toolName, parameters) {
  if (toolName !== "Write") return false;
  const filePath = parameters.file_path;
  if (typeof filePath !== "string" || filePath.length === 0) return false;
  return WORKFLOW_STATE_PATH_PATTERNS.some((pattern) => pattern.test(filePath));
}
function buildFeaturePlannerBlockingResponse(toolName, workflowPhase, requiredAction) {
  const red = "\x1B[31m";
  const yellow = "\x1B[33m";
  const white = "\x1B[37m";
  const reset = "\x1B[0m";
  let message = `
${red}\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
`;
  message += "\u{1F6AB} WORKFLOW PHASE ENFORCEMENT\n";
  message += `\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501${reset}

`;
  message += `${yellow}\u26A0\uFE0F  Cannot use ${white}${toolName}${yellow} during ${workflowPhase} phase.${reset}

`;
  message += `${white}Current Phase:${reset} ${workflowPhase}

`;
  message += `${white}Why this is blocked:${reset}
`;
  if (workflowPhase === "pending_task_creation") {
    message += "  Feature planner output requires spawning task-maker agents.\n";
    message += "  You must spawn task-maker agents for EACH task before proceeding.\n\n";
  } else if (workflowPhase === "tasks_created") {
    message += "  All tasks have been created. Implementation agents must be spawned.\n";
    message += "  You must spawn the assigned implementation agents before proceeding.\n\n";
  }
  message += `${white}Required Action:${reset}
`;
  message += `  ${requiredAction}

`;
  message += `${yellow}\u26A0\uFE0F  Bypass: Set CLAUDE_WORKFLOW_BYPASS_HOOKS=1 (logged)${reset}
`;
  message += `${red}\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501${reset}
`;
  return {
    hookSpecificOutput: {
      additionalContext: `WORKFLOW ENFORCEMENT: ${requiredAction}`,
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: message,
      systemMessage: `Tool blocked: ${toolName}. ${requiredAction}`
    }
  };
}
function checkBypassMechanisms() {
  if (process.env.CLAUDE_WORKFLOW_BYPASS_HOOKS === "1") {
    return true;
  }
  return false;
}
function isAggregatorSpawn(toolName, parameters) {
  return toolName === "Task" && parameters.subagent_type === "workflow-aggregator";
}
function logAggregatorSpawn(workflowStatus) {
  try {
    logHookActivity("phase-enforcement", "PreToolUse", {
      action: "aggregator_spawned",
      message: "Aggregator spawn allowed during awaiting_aggregation phase",
      type: "PHASE_ENFORCEMENT_SUCCESS",
      workflowStatus
    });
  } catch (error) {
    console.error(
      "[phase-enforcement] Failed to log success:",
      error instanceof Error ? error.message : String(error)
    );
  }
}
function logBypass() {
  try {
    logHookActivity("phase-enforcement", "PreToolUse", {
      reason: "CLAUDE_WORKFLOW_BYPASS_HOOKS=1",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      type: "PHASE_ENFORCEMENT_BYPASS"
    });
  } catch (error) {
    console.error(
      "[phase-enforcement] Failed to log bypass:",
      error instanceof Error ? error.message : String(error)
    );
  }
}
function logPhaseViolation(toolName, parameters, workflowStatus) {
  try {
    logHookActivity("phase-enforcement", "PreToolUse", {
      blocked: true,
      parameters,
      requiredAction: "spawn workflow-aggregator",
      tool: toolName,
      type: "PHASE_ENFORCEMENT_VIOLATION",
      workflowStatus
    });
  } catch (error) {
    console.error(
      "[phase-enforcement] Failed to log violation:",
      error instanceof Error ? error.message : String(error)
    );
  }
}
function safeJsonOutput(obj) {
  try {
    const json = JSON.stringify(obj);
    console.log(json);
  } catch {
    console.log("{}");
  }
}
var RESEARCH_UTILITY_AGENTS = [
  "Explore",
  "research",
  "general-purpose",
  "Plan",
  "research-planner"
];
async function checkResearchPhaseEnforcement(toolName, parameters) {
  const activeWorkflow = await getActiveWorkflowPhase();
  if (activeWorkflow === void 0) {
    return null;
  }
  const { phase } = activeWorkflow;
  const phaseId = phase.id;
  if (phaseId !== "research_planning" && phaseId !== "research") {
    return null;
  }
  if (ALWAYS_ALLOWED_TOOLS.includes(toolName)) {
    return { allowed: true };
  }
  const inputStr = JSON.stringify(parameters);
  if (inputStr.includes("SKIP_WORKFLOW_ENFORCEMENT")) {
    return { allowed: true };
  }
  if (isWorkflowStateWrite(toolName, parameters)) {
    logHookActivity("phase-enforcement", "PreToolUse", {
      action: "workflow_state_write_allowed",
      file_path: String(parameters.file_path ?? ""),
      phase: phaseId,
      type: "PHASE_ENFORCEMENT_BYPASS"
    });
    return { allowed: true };
  }
  if (IMPLEMENTATION_TOOLS.includes(toolName)) {
    return {
      allowed: false,
      reason: `Direct implementation blocked during ${phaseId} phase. Complete research before implementing.`,
      workflowStatus: phaseId
    };
  }
  if (toolName === "Task") {
    const agentType = parameters.subagent_type ?? "";
    if (phaseId === "research_planning") {
      if (agentType === "research-planner" || RESEARCH_UTILITY_AGENTS.includes(agentType)) {
        return { allowed: true };
      }
      if (agentType === "feature-planner" || agentType === "task-maker" || IMPLEMENTATION_AGENT_TYPES.includes(agentType)) {
        return {
          allowed: false,
          reason: `Cannot spawn "${agentType}" during research_planning phase. The research-planner must complete first.`,
          workflowStatus: phaseId
        };
      }
      return { allowed: true };
    }
    if (phaseId === "research") {
      if (agentType === "research" || RESEARCH_UTILITY_AGENTS.includes(agentType)) {
        return { allowed: true };
      }
      if (agentType === "feature-planner" || agentType === "task-maker" || IMPLEMENTATION_AGENT_TYPES.includes(agentType)) {
        return {
          allowed: false,
          reason: `Cannot spawn "${agentType}" during research phase. All research agents must complete first.`,
          workflowStatus: phaseId
        };
      }
      return { allowed: true };
    }
  }
  return { allowed: true };
}
async function checkFeaturePlannerEnforcement(toolName, parameters) {
  const plannerState = await getFeaturePlannerState();
  if (plannerState === void 0) {
    return null;
  }
  const { status } = plannerState;
  if (status === "implementation_started" || status === "implementation_complete") {
    return null;
  }
  const inputStr = JSON.stringify(parameters);
  if (inputStr.includes("SKIP_WORKFLOW_ENFORCEMENT")) {
    return { allowed: true };
  }
  if (ALWAYS_ALLOWED_TOOLS.includes(toolName)) {
    return { allowed: true };
  }
  const RESEARCH_AGENTS = ["Explore", "research", "general-purpose", "Plan"];
  if (status === "pending_task_creation") {
    if (toolName === "Task") {
      const agentType = parameters.subagent_type ?? "";
      if (agentType === "task-maker") {
        return { allowed: true, workflowStatus: "pending_task_creation" };
      }
      if (RESEARCH_AGENTS.includes(agentType)) {
        return { allowed: true };
      }
      if (IMPLEMENTATION_AGENT_TYPES.includes(agentType)) {
        return {
          allowed: false,
          reason: `Cannot spawn "${agentType}" during pending_task_creation phase. Spawn task-maker agents first.`,
          workflowStatus: "pending_task_creation"
        };
      }
      return { allowed: true };
    }
    if (isWorkflowStateWrite(toolName, parameters)) {
      logHookActivity("phase-enforcement", "PreToolUse", {
        action: "workflow_state_write_allowed",
        file_path: String(parameters.file_path ?? ""),
        phase: "pending_task_creation",
        type: "PHASE_ENFORCEMENT_BYPASS"
      });
      return { allowed: true };
    }
    if (IMPLEMENTATION_TOOLS.includes(toolName)) {
      return {
        allowed: false,
        reason: "Direct implementation blocked. Feature planner output requires spawning task-maker agents first.",
        workflowStatus: "pending_task_creation"
      };
    }
    return { allowed: true };
  }
  if (status === "tasks_created") {
    if (toolName === "Task") {
      const agentType = parameters.subagent_type ?? "";
      if (IMPLEMENTATION_AGENT_TYPES.includes(agentType)) {
        try {
          await transitionWorkflowPhase("implementation_started");
        } catch {
        }
        return { allowed: true, workflowStatus: "tasks_created" };
      }
      if (RESEARCH_AGENTS.includes(agentType)) {
        return { allowed: true };
      }
      if (agentType === "task-maker") {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: `Cannot spawn "${agentType}" during tasks_created phase. Spawn implementation agents for the created tasks.`,
        workflowStatus: "tasks_created"
      };
    }
    if (isWorkflowStateWrite(toolName, parameters)) {
      logHookActivity("phase-enforcement", "PreToolUse", {
        action: "workflow_state_write_allowed",
        file_path: String(parameters.file_path ?? ""),
        phase: "tasks_created",
        type: "PHASE_ENFORCEMENT_BYPASS"
      });
      return { allowed: true };
    }
    if (IMPLEMENTATION_TOOLS.includes(toolName)) {
      return {
        allowed: false,
        reason: "Direct implementation blocked. Tasks are created - spawn the assigned implementation agents.",
        workflowStatus: "tasks_created"
      };
    }
    return { allowed: true };
  }
  return null;
}
function shouldAllowTool(toolName, parameters, workflows) {
  if (!workflows || workflows.length === 0) {
    return { allowed: true };
  }
  const awaitingAggregation = workflows.find(
    (w) => w.status === "awaiting_aggregation"
  );
  if (!awaitingAggregation) {
    return { allowed: true };
  }
  if (isAggregatorSpawn(toolName, parameters)) {
    return {
      allowed: true,
      workflowStatus: "awaiting_aggregation"
    };
  }
  if (isWorkflowStateWrite(toolName, parameters)) {
    logHookActivity("phase-enforcement", "PreToolUse", {
      action: "workflow_state_write_allowed",
      file_path: String(parameters.file_path ?? ""),
      phase: "awaiting_aggregation",
      type: "PHASE_ENFORCEMENT_BYPASS"
    });
    return { allowed: true };
  }
  return {
    allowed: false,
    reason: `Workflow "${awaitingAggregation.workflow_name}" requires aggregator spawn first`,
    workflowStatus: "awaiting_aggregation"
  };
}
var SLOW_HOOK_THRESHOLD_MS = 10;
var inputData = "";
process.stdin.on("data", (chunk) => {
  inputData += String(chunk);
});
process.stdin.on("end", async () => {
  const startTime = Date.now();
  try {
    const event = JSON.parse(inputData);
    if (checkBypassMechanisms()) {
      console.error("[phase-enforcement] Bypass enabled - allowing all tools");
      logBypass();
      safeJsonOutput({});
      process.exit(0);
    }
    const toolName = event.tool_name ?? event.toolName ?? event.tool?.name ?? "";
    const parameters = event.tool_input ?? event.toolInput ?? event.tool?.parameters ?? {};
    const researchPhaseDecision = await checkResearchPhaseEnforcement(toolName, parameters);
    if (researchPhaseDecision !== null) {
      if (researchPhaseDecision.allowed) {
        safeJsonOutput({});
        process.exit(0);
      }
      const phase = researchPhaseDecision.workflowStatus ?? "unknown";
      const requiredAction = phase === "research_planning" ? "Wait for research-planner to complete. Do NOT skip ahead to feature-planner or implementation." : "Wait for all research agents to complete. Do NOT skip ahead to feature-planner or implementation.";
      const response2 = buildFeaturePlannerBlockingResponse(
        toolName,
        phase,
        requiredAction
      );
      logPhaseViolation(toolName, parameters, phase);
      safeJsonOutput(response2);
      const executionTime2 = Date.now() - startTime;
      if (executionTime2 > SLOW_HOOK_THRESHOLD_MS) {
        const timeStr = String(executionTime2);
        const thresholdStr = String(SLOW_HOOK_THRESHOLD_MS);
        console.error(
          `[phase-enforcement] WARNING: Hook took ${timeStr}ms (exceeds ${thresholdStr}ms threshold)`
        );
      }
      process.exit(0);
    }
    const featurePlannerDecision = await checkFeaturePlannerEnforcement(toolName, parameters);
    if (featurePlannerDecision !== null) {
      if (featurePlannerDecision.allowed) {
        safeJsonOutput({});
        process.exit(0);
      }
      const phase = featurePlannerDecision.workflowStatus ?? "unknown";
      const requiredAction = phase === "pending_task_creation" ? "Spawn task-maker agents for each task. See workflow-state for task details. Do NOT implement directly." : "Spawn implementation agents for the created tasks. Do NOT implement directly.";
      const response2 = buildFeaturePlannerBlockingResponse(
        toolName,
        phase,
        requiredAction
      );
      logPhaseViolation(toolName, parameters, phase);
      safeJsonOutput(response2);
      const executionTime2 = Date.now() - startTime;
      if (executionTime2 > SLOW_HOOK_THRESHOLD_MS) {
        const timeStr = String(executionTime2);
        const thresholdStr = String(SLOW_HOOK_THRESHOLD_MS);
        console.error(
          `[phase-enforcement] WARNING: Hook took ${timeStr}ms (exceeds ${thresholdStr}ms threshold)`
        );
      }
      process.exit(0);
    }
    const state = await getWorkflowState();
    const decision = shouldAllowTool(toolName, parameters, state?.workflows);
    if (decision.allowed) {
      if (decision.workflowStatus === "awaiting_aggregation") {
        logAggregatorSpawn(decision.workflowStatus);
      }
      safeJsonOutput({});
      process.exit(0);
    }
    const workflow = state?.workflows?.find((w) => w.status === "awaiting_aggregation");
    const workflowName = workflow?.workflow_name ?? "unknown";
    const workflowStatus = decision.workflowStatus ?? "unknown";
    const response = buildBlockingResponse(
      toolName,
      workflowName,
      workflowStatus,
      decision.reason
    );
    logPhaseViolation(toolName, parameters, workflowStatus);
    safeJsonOutput(response);
    const executionTime = Date.now() - startTime;
    if (executionTime > SLOW_HOOK_THRESHOLD_MS) {
      const timeStr = String(executionTime);
      const thresholdStr = String(SLOW_HOOK_THRESHOLD_MS);
      console.error(
        `[phase-enforcement] WARNING: Hook took ${timeStr}ms (exceeds ${thresholdStr}ms threshold)`
      );
    }
    process.exit(0);
  } catch (error) {
    const executionTime = Date.now() - startTime;
    const timeStr = String(executionTime);
    console.error(
      `[phase-enforcement] Error after ${timeStr}ms:`,
      error instanceof Error ? error.message : String(error)
    );
    safeJsonOutput({});
    process.exit(0);
  }
});
