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

// src/templates/.claude/hooks/orchestration/task-outcome-tracker.ts
import { createHash } from "node:crypto";

// src/templates/.claude/scripts/hook-utils.js
function outputEmpty() {
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

// src/templates/.claude/hooks/core/workflow-state.ts
init_path_resolver();
init_session_state();
import crypto from "node:crypto";
import fs3 from "node:fs/promises";
import fsSync2 from "node:fs";
import path4 from "node:path";
var DURABLE_WORKFLOWS_DIR = "workflows";
var DURABLE_ACTIVE_DIR = "active";
var JSON_INDENT = 2;
function getDurableWorkflowsDir() {
  return resolveProjectPath(".claude", DURABLE_WORKFLOWS_DIR, DURABLE_ACTIVE_DIR);
}
function getDurableWorkflowPath(workflowId) {
  return path4.join(getDurableWorkflowsDir(), `${workflowId}.json`);
}
function ensureDurableDir() {
  const dir = getDurableWorkflowsDir();
  if (!fsSync2.existsSync(dir)) {
    fsSync2.mkdirSync(dir, { recursive: true });
  }
}
function saveDurableWorkflowState(workflow) {
  ensureDurableDir();
  const statePath = getDurableWorkflowPath(workflow.workflow_id);
  const tempFile = `${statePath}.${String(process.pid)}.tmp`;
  try {
    fsSync2.writeFileSync(tempFile, JSON.stringify(workflow, void 0, JSON_INDENT), "utf-8");
    fsSync2.renameSync(tempFile, statePath);
  } catch (error) {
    console.error("[workflow-state] Failed to save durable workflow state:", error);
    try {
      fsSync2.unlinkSync(tempFile);
    } catch {
    }
  }
}
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
async function saveWorkflowState(state) {
  const stateFile = getWorkflowStateFile(state.sessionId);
  const INDENT_SPACES = 2;
  state.timestamp = (/* @__PURE__ */ new Date()).toISOString();
  const tempFile = `${stateFile}.${String(process.pid)}.tmp`;
  try {
    await fs3.writeFile(tempFile, JSON.stringify(state, void 0, INDENT_SPACES), "utf8");
    await fs3.rename(tempFile, stateFile);
  } catch (error) {
    console.error("Failed to save workflow state:", error);
    try {
      await fs3.unlink(tempFile);
    } catch {
    }
  }
  if (state.workflows) {
    for (const workflow of state.workflows) {
      if (workflow.status === "running" || workflow.status === "awaiting_aggregation") {
        try {
          saveDurableWorkflowState(workflow);
        } catch (error) {
          console.error("[workflow-state] Durable write-through failed:", error);
        }
      }
    }
  }
}
async function updateAgentStatus(workflowId, agentId, status, failureReason) {
  const state = await getWorkflowState();
  if (state === void 0 || state.workflows === void 0) {
    console.error("[workflow-state] Cannot update agent status: no workflow state");
    return false;
  }
  const workflow = state.workflows.find((w) => w.workflow_id === workflowId);
  if (workflow === void 0) {
    console.error(`[workflow-state] Cannot update agent status: workflow ${workflowId} not found`);
    return false;
  }
  if (!workflow.current_phase.spawned_agent_records) {
    console.error("[workflow-state] Cannot update agent status: no spawned_agent_records");
    return false;
  }
  const recordIndex = workflow.current_phase.spawned_agent_records.findIndex(
    (r) => r.agent_id === agentId
  );
  if (recordIndex === -1) {
    console.error(`[workflow-state] Cannot update agent status: agent ${agentId} not found`);
    return false;
  }
  const record = workflow.current_phase.spawned_agent_records[recordIndex];
  if (record === void 0) {
    return false;
  }
  record.status = status;
  if (status === "completed" || status === "failed" || status === "stale") {
    record.completed_at = (/* @__PURE__ */ new Date()).toISOString();
  }
  if (status === "failed" && failureReason !== void 0) {
    record.failure_reason = failureReason;
  }
  if (status === "failed") {
    record.retry_count++;
  }
  await saveWorkflowState(state);
  return true;
}
function getWorkflowStateFile(sessionId) {
  return resolveProjectPath(".claude", "logs", `session-${sessionId}`, "workflow-state.json");
}
function isNodeError(error) {
  return "code" in error;
}

// src/templates/.claude/hooks/orchestration/task-outcome-tracker.ts
var RATE_LIMIT_PATTERNS = [
  /rate[_\s]?limit/i,
  // "rate limit", "rate_limit", "ratelimit"
  /too\s*many\s*requests/i,
  // "too many requests"
  /429/,
  // HTTP status code
  /quota\s*exceeded/i,
  // "quota exceeded"
  /throttl/i,
  // "throttle", "throttling", "throttled"
  /hit your limit/i,
  // Claude-specific message
  /resets at/i,
  // Rate limit reset message
  /try again later/i,
  // Generic retry message
  /slow\s*down/i
  // "slow down" message
];
var CANCELLATION_PATTERNS = [
  /cancel+ed/i,
  // "cancelled", "canceled" (both spellings)
  /user[_\s]?cancel/i,
  // "user cancel", "user_cancel"
  /abort/i,
  // "abort", "aborted", "aborting"
  /interrupt/i,
  // "interrupt", "interrupted"
  /terminated\s*by\s*user/i,
  // "terminated by user"
  /execution stopped/i,
  // More specific to avoid false positives
  /stopped prematurely/i
];
var TIMEOUT_PATTERN = /timeout/i;
var ERROR_PATTERNS = [
  /\berror\b/i,
  /\bfailed\b/i,
  /\bexception\b/i,
  /\bcrash/i,
  /fatal/i,
  /unhandled/i
];
var SUCCESS_PATTERNS = [
  /no errors?\b/i,
  /\b0 errors?\b/i,
  /errors?: 0\b/i,
  /successfully completed/i,
  /completed successfully/i,
  /all tests pass/i,
  /passed all/i
];
function hasSuccessPattern(responseText) {
  for (const pattern of SUCCESS_PATTERNS) {
    if (pattern.test(responseText)) {
      return true;
    }
  }
  return false;
}
function detectFailureType(responseText) {
  if (hasSuccessPattern(responseText)) {
    return null;
  }
  for (const pattern of RATE_LIMIT_PATTERNS) {
    if (pattern.test(responseText)) {
      return "rate_limit";
    }
  }
  for (const pattern of CANCELLATION_PATTERNS) {
    if (pattern.test(responseText)) {
      return "cancelled";
    }
  }
  if (TIMEOUT_PATTERN.test(responseText)) {
    return "timeout";
  }
  for (const pattern of ERROR_PATTERNS) {
    if (pattern.test(responseText)) {
      return "error";
    }
  }
  return null;
}
function hashPrompt(prompt) {
  return createHash("sha256").update(prompt).digest("hex");
}
function extractAgentId(event, responseText) {
  const agentIdMatch = /"agent_id"\s*:\s*"([^"]+)"/.exec(responseText);
  if (agentIdMatch?.[1]) {
    return agentIdMatch[1];
  }
  const toolInput = event.tool_input ?? event.parameters;
  if (toolInput === void 0) {
    return null;
  }
  const subagentType = toolInput.subagent_type;
  const prompt = toolInput.prompt;
  if (typeof subagentType !== "string" || typeof prompt !== "string") {
    return null;
  }
  const promptHash = hashPrompt(prompt);
  const shortHash = promptHash.slice(0, 8);
  return `${subagentType}-${shortHash}`;
}
var DASHBOARD_PORT = 3850;
var ROTATION_TIMEOUT_MS = 3e3;
async function triggerAccountRotation() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), ROTATION_TIMEOUT_MS);
    const response = await fetch(`http://localhost:${String(DASHBOARD_PORT)}/api/accounts/rotate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!response.ok) {
      const body = await response.text();
      return { success: false, error: `HTTP ${String(response.status)}: ${body}` };
    }
    const result = await response.json();
    return { success: result.success, newAccountId: result.newAccountId };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}
async function processTaskOutcome(event) {
  const startTime = performance.now();
  const toolResult = event.tool_response ?? event.toolResult;
  let responseText = "";
  if (typeof toolResult === "string") {
    responseText = toolResult;
  } else if (toolResult?.output !== void 0 && typeof toolResult.output === "string") {
    responseText = toolResult.output;
  }
  if (responseText.length === 0) {
    outputEmpty();
    return;
  }
  const failureReason = detectFailureType(responseText);
  if (failureReason === null) {
    logHookActivity("task-outcome-tracker", "PostToolUse", {
      details: "No failure pattern detected",
      status: "success"
    });
    outputEmpty();
    return;
  }
  const state = await getWorkflowState();
  if (state?.workflows === void 0 || state.workflows.length === 0) {
    logHookActivity("task-outcome-tracker", "PostToolUse", {
      details: "No active workflows found",
      failureReason,
      status: "skipped"
    });
    outputEmpty();
    return;
  }
  const runningWorkflow = state.workflows.find(
    (w) => w.status === "running" || w.current_phase.status === "running"
  );
  if (runningWorkflow === void 0) {
    logHookActivity("task-outcome-tracker", "PostToolUse", {
      details: "No running workflow found",
      failureReason,
      status: "skipped"
    });
    outputEmpty();
    return;
  }
  const agentId = extractAgentId(event, responseText);
  if (agentId === null) {
    logHookActivity("task-outcome-tracker", "PostToolUse", {
      details: "Failure detected but could not extract agent ID from Task tool input or response",
      failureReason,
      status: "warning"
    });
    outputEmpty();
    return;
  }
  try {
    const updated = await updateAgentStatus(
      runningWorkflow.workflow_id,
      agentId,
      "failed",
      failureReason
    );
    const toolInput = event.tool_input ?? event.parameters;
    const subagentType = typeof toolInput?.subagent_type === "string" ? toolInput.subagent_type : "unknown";
    if (updated) {
      logHookActivity("task-outcome-tracker", "PostToolUse", {
        agentId,
        details: `Agent ${agentId} marked as failed: ${failureReason}`,
        failureReason,
        status: "success",
        subagentType,
        workflowId: runningWorkflow.workflow_id
      });
    } else {
      logHookActivity("task-outcome-tracker", "PostToolUse", {
        agentId,
        details: `Agent ${agentId} not found in workflow records (may be non-workflow spawn)`,
        failureReason,
        status: "warning",
        subagentType,
        workflowId: runningWorkflow.workflow_id
      });
    }
  } catch (error) {
    logHookActivity("task-outcome-tracker", "PostToolUse", {
      details: "Failed to update agent status",
      error: error instanceof Error ? error.message : String(error),
      status: "error"
    });
  }
  if (failureReason === "rate_limit") {
    const rotationResult = await triggerAccountRotation();
    if (rotationResult.success) {
      logHookActivity("task-outcome-tracker", "PostToolUse", {
        details: `Account rotated to ${rotationResult.newAccountId ?? "unknown"} after rate limit`,
        status: "success"
      });
      safeJsonOutput({
        hookSpecificOutput: {
          additionalContext: `[RATE LIMIT RECOVERY] Account was automatically rotated to ${rotationResult.newAccountId ?? "a new account"}. You can retry the failed agent immediately.`
        }
      });
    } else {
      logHookActivity("task-outcome-tracker", "PostToolUse", {
        details: `Account rotation failed: ${rotationResult.error ?? "unknown"}`,
        status: "warning"
      });
      outputEmpty();
    }
  } else {
    outputEmpty();
  }
  const endTime = performance.now();
  const executionTime = endTime - startTime;
  const performanceThresholdMs = 10;
  const decimalPlaces = 2;
  if (executionTime > performanceThresholdMs) {
    logHookActivity("task-outcome-tracker", "PostToolUse", {
      details: `Hook execution exceeded 10ms: ${executionTime.toFixed(decimalPlaces)}ms`,
      executionTime,
      status: "warning"
    });
  }
}
var inputData = "";
process.stdin.on("data", (chunk) => {
  inputData += chunk.toString();
});
process.stdin.on("end", () => {
  void (async () => {
    try {
      const event = JSON.parse(inputData);
      const toolName = event.tool_name ?? event.toolName ?? "";
      if (toolName !== "Task") {
        outputEmpty();
        return;
      }
      await processTaskOutcome(event);
      exitSuccess();
    } catch (error) {
      console.error("[task-outcome-tracker] Error:", error);
      outputEmpty();
      exitSuccess();
    }
  })();
});
