#!/usr/bin/env node
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};

// src/templates/.claude/hooks/core/path-resolver.ts
import fs2 from "node:fs";
import path2 from "node:path";
function resolveProjectPath(...segments) {
  return path2.resolve(resolveProjectRoot(), ...segments);
}
function resolveProjectRoot() {
  try {
    const configDir = findConfigDir();
    if (configDir !== void 0 && configDir !== "") {
      const configPath = path2.join(configDir, ".claude", "workflow-config.json");
      try {
        const config = JSON.parse(fs2.readFileSync(configPath, "utf8"));
        if (config._projectRoot !== void 0 && config._projectRoot !== "") {
          const normalizedRoot = path2.resolve(config._projectRoot);
          try {
            fs2.statSync(normalizedRoot);
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
  return path2.resolve(process.cwd());
}
function findConfigDir() {
  let currentDir = path2.resolve(process.cwd());
  const root = path2.parse(currentDir).root;
  while (currentDir !== root) {
    const configPath = path2.join(currentDir, ".claude", "workflow-config.json");
    try {
      fs2.statSync(configPath);
      return currentDir;
    } catch (error) {
      if (error.code !== "ENOENT") {
        console.warn(`[path-resolver] Error checking ${configPath}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    currentDir = path2.dirname(currentDir);
  }
  const rootConfigPath = path2.join(root, ".claude", "workflow-config.json");
  try {
    fs2.statSync(rootConfigPath);
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
  existsSync as existsSync2,
  mkdirSync,
  openSync,
  readFileSync as readFileSync2,
  readdirSync,
  unlinkSync
} from "node:fs";
import path3 from "node:path";
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
    if (!existsSync2(statPath)) {
      return void 0;
    }
    const stat = readFileSync2(statPath, "utf8");
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
import fs3 from "node:fs/promises";
import path4 from "node:path";
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
    const contextPath = path4.join(logsDir, sessionFolder, "agent-context.json");
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
    const statePath = path4.join(logsDir, sessionFolder, "workflow-state.json");
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
  const sessionDir = path4.join(logsDir, folderName);
  try {
    await fs3.mkdir(sessionDir, { recursive: true });
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
  sessionDir ??= path4.join(logsDir, getOrCreateSessionFolder(sessionId));
  if (agentContext.isAgent) {
    const agentTimestamp = agentContext.timestamp ?? Math.floor(Date.now() / 1e3);
    const agentFolder = `agent-${String(agentTimestamp)}-${String(agentContext.agentPid)}`;
    const agentDir = path4.join(sessionDir, agentFolder);
    try {
      fsSync.mkdirSync(agentDir, { recursive: true });
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code !== "EEXIST") {
        console.error(`Failed to create agent folder: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    if (logType === "hook-state") {
      return path4.join(agentDir, "hook-state.jsonl");
    }
    return path4.join(agentDir, filename);
  }
  if (logType === "hook-state") {
    return path4.join(sessionDir, "hook-state.jsonl");
  }
  return path4.join(sessionDir, filename);
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
      await fs3.appendFile(logPath, content, "utf8");
    } else {
      const tempFile = `${logPath}.${String(process.pid)}.tmp`;
      await fs3.writeFile(tempFile, content, "utf8");
      await fs3.rename(tempFile, logPath);
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

// src/templates/.claude/hooks/orchestration/agent-orchestrator.ts
import fs5 from "node:fs/promises";

// src/lib/errors/orchestration-error.ts
import { randomBytes } from "node:crypto";
var ERROR_CATEGORIES = {
  CONFIGURATION: "configuration",
  IO: "io",
  ORCHESTRATION: "orchestration",
  PARSING: "parsing",
  SYSTEM: "system",
  VALIDATION: "validation"
};
var ERROR_SEVERITY = {
  CRITICAL: "critical",
  HIGH: "high",
  LOW: "low",
  MEDIUM: "medium"
};
var ERROR_CODES = {
  AGENT_JSON_EXTRACTION_FAILED: "AGENT_JSON_EXTRACTION_FAILED",
  AGENT_SPAWNING_FAILED: "AGENT_SPAWNING_FAILED",
  DIRECTORY_ACCESS_ERROR: "DIRECTORY_ACCESS_ERROR",
  // IO errors
  FILE_NOT_FOUND: "FILE_NOT_FOUND",
  FILE_READ_ERROR: "FILE_READ_ERROR",
  // Orchestration errors
  INFINITE_LOOP_DETECTED: "INFINITE_LOOP_DETECTED",
  INVALID_AGENT_TYPE: "INVALID_AGENT_TYPE",
  INVALID_CLI_ARGS: "INVALID_CLI_ARGS",
  // Validation errors
  INVALID_JSON_SCHEMA: "INVALID_JSON_SCHEMA",
  INVALID_LOG_PATH: "INVALID_LOG_PATH",
  INVALID_NEXT_ACTION: "INVALID_NEXT_ACTION",
  INVALID_STATUS_TYPE: "INVALID_STATUS_TYPE",
  // Parsing errors
  JSON_PARSE_ERROR: "JSON_PARSE_ERROR",
  LOG_FILE_PARSE_ERROR: "LOG_FILE_PARSE_ERROR",
  // System errors
  MEMORY_ERROR: "MEMORY_ERROR",
  // Configuration errors
  MISSING_HOOK_CONFIG: "MISSING_HOOK_CONFIG",
  MISSING_REQUIRED_FIELD: "MISSING_REQUIRED_FIELD",
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT_ERROR: "TIMEOUT_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR"
};
var RECOVERY_STRATEGIES = {
  FALLBACK: "fallback",
  RETRY: "retry",
  SKIP: "skip",
  TERMINATE: "terminate",
  USER_INPUT: "user_input"
};
var OrchestrationError = class _OrchestrationError extends Error {
  cause;
  correlationId;
  errorCategory;
  errorCode;
  errorContext;
  errorSeverity;
  filePath;
  lineNumber;
  operation;
  recoveryStrategy;
  sessionId;
  timestamp;
  // Properties with proper types (legacy getters for compatibility)
  get category() {
    return this.errorCategory;
  }
  get code() {
    return this.errorCode;
  }
  get context() {
    return this.errorContext;
  }
  get line() {
    return this.lineNumber;
  }
  get severity() {
    return this.errorSeverity;
  }
  /**
   * Create an OrchestrationError
   */
  constructor(message, options = {}) {
    super(message);
    this.name = "OrchestrationError";
    this.errorCategory = options.category ?? ERROR_CATEGORIES.SYSTEM;
    this.errorCode = options.code ?? ERROR_CODES.UNKNOWN_ERROR;
    this.errorSeverity = options.severity ?? ERROR_SEVERITY.MEDIUM;
    this.errorContext = options.context ?? {};
    this.cause = options.cause ?? void 0;
    this.correlationId = options.correlationId ?? this.generateCorrelationId();
    this.operation = options.operation ?? "unknown";
    this.filePath = options.filePath ?? void 0;
    this.lineNumber = options.line ?? void 0;
    this.sessionId = options.sessionId ?? void 0;
    this.recoveryStrategy = options.recoveryStrategy ?? this.determineRecoveryStrategy();
    this.timestamp = (/* @__PURE__ */ new Date()).toISOString();
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, new.target);
    this.enrichContext();
  }
  /**
   * Create an OrchestrationError from a generic Error
   */
  static fromError(error, options = {}) {
    const message = error instanceof _OrchestrationError ? error.message : `Orchestration error: ${error.message}`;
    return new _OrchestrationError(message, {
      category: options.category ?? ERROR_CATEGORIES.SYSTEM,
      cause: error,
      code: options.code ?? ERROR_CODES.UNKNOWN_ERROR,
      context: {
        originalError: error.name,
        originalMessage: error.message,
        ...options.context
      },
      ...options.operation !== void 0 && { operation: options.operation },
      ...options.sessionId !== void 0 && { sessionId: options.sessionId }
    });
  }
  /**
   * Determine recovery strategy based on error category and code
   */
  determineRecoveryStrategy() {
    switch (this.errorCategory) {
      case ERROR_CATEGORIES.CONFIGURATION: {
        return RECOVERY_STRATEGIES.USER_INPUT;
      }
      case ERROR_CATEGORIES.IO: {
        return RECOVERY_STRATEGIES.RETRY;
      }
      case ERROR_CATEGORIES.ORCHESTRATION: {
        return this.errorCode === ERROR_CODES.INFINITE_LOOP_DETECTED ? RECOVERY_STRATEGIES.TERMINATE : RECOVERY_STRATEGIES.FALLBACK;
      }
      case ERROR_CATEGORIES.PARSING: {
        return RECOVERY_STRATEGIES.SKIP;
      }
      case ERROR_CATEGORIES.SYSTEM: {
        return this.errorSeverity === ERROR_SEVERITY.CRITICAL ? RECOVERY_STRATEGIES.TERMINATE : RECOVERY_STRATEGIES.RETRY;
      }
      case ERROR_CATEGORIES.VALIDATION: {
        return RECOVERY_STRATEGIES.FALLBACK;
      }
      default: {
        return RECOVERY_STRATEGIES.FALLBACK;
      }
    }
  }
  /**
   * Enrich context with additional derived information
   */
  enrichContext() {
    const MINIMUM_STACK_LINES = 2;
    const RADIX_DECIMAL = 10;
    this.context.platform = process.platform;
    this.context.nodeVersion = process.version;
    const memUsage = process.memoryUsage();
    this.context.memoryUsage = `rss: ${String(memUsage.rss)}, heapUsed: ${String(memUsage.heapUsed)}`;
    if (this.stack !== void 0 && this.stack !== "") {
      const stackLines = this.stack.split("\n");
      if (stackLines.length > MINIMUM_STACK_LINES) {
        const userLine = stackLines.find(
          (line) => !line.includes("OrchestrationError.js") && !line.includes("node:internal")
        );
        if (userLine !== void 0 && userLine !== "") {
          const match = /\((.*?):(\d+):\d+\)/.exec(userLine);
          if (match?.[1] !== void 0 && match[2] !== void 0) {
            this.context.stackFile = match[1];
            this.context.stackLine = Number.parseInt(match[2], RADIX_DECIMAL);
          }
        }
      }
    }
  }
  /**
   * Generate a unique correlation ID for error tracking
   */
  generateCorrelationId() {
    const RANDOM_BYTES_LENGTH = 4;
    return `orch-error-${randomBytes(RANDOM_BYTES_LENGTH).toString("hex")}`;
  }
  /**
   * Get recovery guidance message
   */
  getRecoveryMessage() {
    const recoveryMessages = {
      [RECOVERY_STRATEGIES.FALLBACK]: "Continuing with alternative approach.",
      [RECOVERY_STRATEGIES.RETRY]: "The operation may succeed if attempted again.",
      [RECOVERY_STRATEGIES.SKIP]: "Skipping this item and continuing.",
      [RECOVERY_STRATEGIES.TERMINATE]: "Cannot continue. Please resolve the issue and restart.",
      [RECOVERY_STRATEGIES.USER_INPUT]: "Please check your configuration and try again."
    };
    return recoveryMessages[this.recoveryStrategy] ?? "No specific recovery guidance available.";
  }
  /**
   * Get user-friendly error message
   */
  getUserMessage() {
    const categoryMessages = {
      [ERROR_CATEGORIES.CONFIGURATION]: "Configuration or setup issue",
      [ERROR_CATEGORIES.IO]: "File or network access problem",
      [ERROR_CATEGORIES.ORCHESTRATION]: "Agent workflow or logic error",
      [ERROR_CATEGORIES.PARSING]: "Failed to process or read data",
      [ERROR_CATEGORIES.SYSTEM]: "System or resource error",
      [ERROR_CATEGORIES.VALIDATION]: "Invalid data format or missing required information"
    };
    const baseMessage = categoryMessages[this.category] ?? "An error occurred";
    const recoveryMessage = this.getRecoveryMessage();
    return `${baseMessage}. ${recoveryMessage}`;
  }
  /**
   * Check if this error is recoverable
   */
  isRecoverable() {
    return this.recoveryStrategy !== RECOVERY_STRATEGIES.TERMINATE;
  }
  /**
   * Check if this error should be retried
   */
  shouldRetry() {
    return this.recoveryStrategy === RECOVERY_STRATEGIES.RETRY;
  }
  /**
   * Convert error to JSON for logging/serialization
   */
  toJSON() {
    return {
      category: this.category,
      cause: this.cause === void 0 ? void 0 : {
        message: this.cause.message,
        name: this.cause.name,
        stack: this.cause.stack ?? void 0
      },
      code: this.code,
      context: this.context,
      correlationId: this.correlationId,
      filePath: this.filePath ?? void 0,
      line: this.line ?? void 0,
      message: this.message,
      name: this.name,
      operation: this.operation,
      recoveryStrategy: this.recoveryStrategy,
      sessionId: this.sessionId ?? void 0,
      severity: this.severity,
      stack: this.stack ?? void 0,
      timestamp: this.timestamp
    };
  }
  /**
   * Get a formatted error summary for logging
   */
  toLogString() {
    const parts = [
      `[${this.correlationId}]`,
      `${this.category}:${this.code}`,
      this.operation ? `(${this.operation})` : "",
      "-",
      this.message
    ].filter(Boolean);
    return parts.join(" ");
  }
};
function withSyncErrorHandling(operation, options = {}) {
  const {
    category = ERROR_CATEGORIES.SYSTEM,
    code,
    context = {},
    fallback,
    onError,
    operation: operationName = "unknown",
    sessionId
  } = options;
  try {
    return operation();
  } catch (error) {
    const orchError = error instanceof OrchestrationError ? error : OrchestrationError.fromError(error instanceof Error ? error : new Error(String(error)), {
      category,
      ...code !== void 0 && { code },
      context,
      operation: operationName,
      ...sessionId !== void 0 && { sessionId }
    });
    if (onError !== void 0) {
      onError(orchError);
    }
    if (fallback !== void 0) {
      return fallback(orchError);
    }
    throw orchError;
  }
}

// src/lib/validation/agent-validator.ts
import AjvDefault from "ajv";
import addFormatsDefault from "ajv-formats";

// src/lib/validation/schema-loader.ts
import * as fs from "node:fs";
import * as path from "node:path";
var SchemaLoader = class {
  basePath;
  cache;
  constructor() {
    this.cache = /* @__PURE__ */ new Map();
    this.basePath = path.resolve(".claude/schemas");
  }
  /**
   * Clear cache for specific schema or all schemas
   * @param schemaName - Specific schema to clear, or clear all if not provided
   */
  clearCache(schemaName) {
    if (schemaName !== void 0 && schemaName !== "") {
      this.cache.delete(schemaName);
    } else {
      this.cache.clear();
    }
  }
  /**
   * Close and cleanup resources
   */
  close() {
    this.cache.clear();
  }
  /**
   * Get cached schema without loading from disk
   * @param schemaName - Name of schema
   * @returns Cached schema or undefined if not cached
   */
  getCachedSchema(schemaName) {
    return this.cache.get(schemaName);
  }
  /**
   * Get statistics about loaded schemas
   * @returns Statistics object
   */
  getStats() {
    return {
      basePath: this.basePath,
      cachedSchemas: this.cache.size
    };
  }
  /**
   * Load schema from file with caching
   * @param schemaName - Name of schema file (without .json extension)
   * @returns Parsed schema object or undefined if not found
   */
  loadSchema(schemaName) {
    const cacheKey = schemaName;
    const cachedSchema = this.cache.get(cacheKey);
    if (cachedSchema !== void 0) {
      return cachedSchema;
    }
    try {
      const schemaPath = path.join(this.basePath, `${schemaName}.json`);
      if (!fs.existsSync(schemaPath)) {
        console.warn(`Schema file not found: ${schemaPath}`);
        return void 0;
      }
      const schemaContent = fs.readFileSync(schemaPath, "utf8");
      const schema = JSON.parse(schemaContent);
      this.cache.set(cacheKey, schema);
      return schema;
    } catch (error) {
      console.error(`Error loading schema ${schemaName}:`, error);
      return void 0;
    }
  }
};
var globalSchemaLoader = new SchemaLoader();
var schema_loader_default = globalSchemaLoader;

// src/lib/validation/agent-validator.ts
var Ajv = AjvDefault.default ?? AjvDefault;
var addFormats = addFormatsDefault.default ?? addFormatsDefault;
var AgentValidator = class {
  compiledValidators;
  schemaLoader;
  ajv = void 0;
  fallbackValidationEnabled;
  lastLoadAttempt;
  loadRetryDelay;
  constructor() {
    this.compiledValidators = /* @__PURE__ */ new Map();
    this.schemaLoader = schema_loader_default;
    this.lastLoadAttempt = 0;
    this.loadRetryDelay = 5e3;
    this.fallbackValidationEnabled = true;
    this.initialize();
  }
  /**
   * Create validation result object
   * @param {boolean} valid - Whether validation passed
   * @param {Array} errors - Array of error messages
   * @param {number} validationTime - Time taken to validate in ms
   * @param {boolean} isFallback - Whether fallback validation was used
   * @returns {Object} Validation result
   */
  createResult(valid, errors, validationTime, isFallback = false) {
    return {
      errors,
      isFallback,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      valid,
      validationTime
    };
  }
  /**
   * Clean up resources
   */
  destroy() {
    this.compiledValidators.clear();
    this.ajv = void 0;
  }
  /**
   * Validate agent JSON data against the universal schema
   * @param {Object} data - Agent JSON data to validate
   * @returns {Object} Validation result with validity and errors
   */
  /**
   * Format AJV errors into human-readable messages
   * @param {Array} ajvErrors - AJV error objects
   * @returns {Array} Formatted error messages
   */
  formatAjvErrors(ajvErrors) {
    const errors = [];
    for (const error of ajvErrors) {
      const path7 = error.instancePath || "root";
      const message = this.formatErrorMessage(error, path7);
      errors.push(message);
    }
    return errors;
  }
  /**
   * Format individual error message
   * @param {Object} error - AJV error object
   * @param {string} path - Error path
   * @returns {string} Formatted error message
   */
  formatErrorMessage(error, path7) {
    const { keyword, message, params } = error;
    const data = error.data;
    const typedParams = params;
    switch (keyword) {
      case "additionalProperties": {
        return `Additional property not allowed at ${path7}: ${String(typedParams.additionalProperty)}`;
      }
      case "const": {
        return `Value at ${path7} must be exactly ${JSON.stringify(typedParams.allowedValue)}`;
      }
      case "enum": {
        const allowedValues = typedParams.allowedValues;
        return `Invalid value at ${path7}: ${JSON.stringify(data)} not in allowed values [${allowedValues.join(", ")}]`;
      }
      case "format": {
        return `Invalid format at ${path7}: value ${JSON.stringify(data)} does not match ${String(typedParams.format)} format`;
      }
      case "maximum": {
        return `Value at ${path7} (${String(data)}) is above maximum (${String(typedParams.limit)})`;
      }
      case "minimum": {
        return `Value at ${path7} (${String(data)}) is below minimum (${String(typedParams.limit)})`;
      }
      case "oneOf": {
        return `Data at ${path7} does not match any of the allowed schemas`;
      }
      case "pattern": {
        return `Invalid pattern at ${path7}: value ${JSON.stringify(data)} does not match required pattern`;
      }
      case "required": {
        return `Missing required field: ${String(typedParams.missingProperty)} at ${path7}`;
      }
      case "type": {
        return `Invalid type at ${path7}: expected ${String(typedParams.type)}, got ${typeof data}`;
      }
      default: {
        return `${message ?? "Validation error"} at ${path7}`;
      }
    }
  }
  /**
   * Get validation statistics
   * @returns {Object} Statistics object
   */
  getStats() {
    return {
      compiledValidators: this.compiledValidators.size,
      fallbackEnabled: this.fallbackValidationEnabled,
      isInitialized: this.ajv !== void 0,
      schemaStats: this.schemaLoader.getStats()
    };
  }
  /**
   * Initialize AJV and load schema
   */
  initialize() {
    try {
      this.ajv = new Ajv({
        allErrors: true,
        // Report all errors, not just first one
        coerceTypes: false,
        // Don't coerce types
        removeAdditional: false,
        // Don't remove additional properties
        strict: false,
        // Allow more flexible validation
        useDefaults: false,
        // Don't fill in defaults
        verbose: true
        // Include more details in errors
      });
      addFormats(this.ajv);
      this.loadAndCompileSchema();
    } catch (error) {
      console.error("Failed to initialize AgentValidator:", error);
      this.ajv = void 0;
    }
  }
  /**
   * Load and compile the universal agent output schema
   */
  loadAndCompileSchema() {
    const now = Date.now();
    if (now - this.lastLoadAttempt < this.loadRetryDelay) {
      return false;
    }
    this.lastLoadAttempt = now;
    const schema = this.schemaLoader.loadSchema("agent-output-schema");
    if (schema === void 0) {
      console.warn("Failed to load agent-output-schema.json, validation will be disabled");
      return false;
    }
    try {
      if (this.ajv === void 0) {
        console.error("AJV not initialized");
        return false;
      }
      const validator = this.ajv.compile(schema);
      this.compiledValidators.set("agent-output-schema", validator);
      return true;
    } catch (error) {
      console.error("Failed to compile agent schema:", error);
      return false;
    }
  }
  /**
   * Perform fallback validation using basic checks
   * @param {Object} data - Data to validate
   * @param {number} startTime - Validation start time
   * @returns {Object} Validation result
   */
  performFallbackValidation(data, startTime) {
    console.warn("Using fallback validation - schema not available");
    const errors = [];
    if (data === null || typeof data !== "object" || Array.isArray(data)) {
      errors.push("Data must be a valid object");
      return this.createResult(false, errors, Date.now() - startTime, true);
    }
    const dataObj = data;
    const requiredFields = ["agent_id", "agent_type", "timestamp", "session_id", "schema_version", "status", "nextAction", "metadata"];
    for (const field of requiredFields) {
      if (!(field in dataObj)) {
        errors.push(`Missing required field: ${field}`);
      }
    }
    const validAgentTypes = ["task-management", "implementation", "review", "documentation", "ui-generation", "architecture", "research", "refactor", "debug", "explore"];
    const agentType = dataObj.agent_type;
    if (typeof agentType === "string" && agentType !== "" && !validAgentTypes.includes(agentType)) {
      errors.push(`Invalid agent_type: ${agentType}`);
    }
    const validStatuses = ["success", "failure", "partial", "blocked", "skipped"];
    const status = dataObj.status;
    if (typeof status === "string" && status !== "" && !validStatuses.includes(status)) {
      errors.push(`Invalid status: ${status}`);
    }
    const nextAction = dataObj.nextAction;
    if (typeof nextAction === "object" && nextAction !== null && !Array.isArray(nextAction)) {
      const nextActionObj = nextAction;
      const nextActionType = nextActionObj.type;
      if (typeof nextActionType !== "string" || nextActionType === "") {
        errors.push("nextAction missing required field: type");
      }
    }
    const validationTime = Date.now() - startTime;
    return this.createResult(errors.length === 0, errors, validationTime, true);
  }
  /**
   * Force reload of schema and recompile validators
   * @returns {boolean} Success status
   */
  reloadSchema() {
    this.compiledValidators.clear();
    this.schemaLoader.clearCache(void 0);
    return this.loadAndCompileSchema();
  }
  /**
   * Enable or disable fallback validation
   * @param {boolean} enabled - Whether to enable fallback validation
   */
  setFallbackValidation(enabled) {
    this.fallbackValidationEnabled = enabled;
  }
  validate(data) {
    const startTime = Date.now();
    if (this.ajv === void 0) {
      return this.createResult(false, ["AJV validator not initialized"], Date.now() - startTime);
    }
    const validator = this.compiledValidators.get("agent-output-schema");
    if (validator === void 0) {
      if (this.loadAndCompileSchema()) {
        return this.validate(data);
      }
      if (this.fallbackValidationEnabled) {
        return this.performFallbackValidation(data, startTime);
      }
      return this.createResult(false, ["Schema not loaded and fallback disabled"], Date.now() - startTime);
    }
    const isValid = validator(data);
    const validationTime = Date.now() - startTime;
    if (isValid) {
      return this.createResult(true, [], validationTime);
    }
    const errors = this.formatAjvErrors(validator.errors ?? []);
    return this.createResult(false, errors, validationTime);
  }
};
var globalAgentValidator = new AgentValidator();
var agent_validator_default = globalAgentValidator;

// src/templates/.claude/hooks/orchestration/agent-orchestrator.ts
init_session_logger();

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

// src/templates/.claude/hooks/core/event-writer.ts
init_path_resolver();
init_session_state();
import { openSync as openSync2, writeSync, closeSync as closeSync2, constants as constants2, mkdirSync as mkdirSync2, existsSync as existsSync3 } from "node:fs";
import path5 from "node:path";
function writeEventAtomic(event) {
  const eventsPath = resolveProjectPath(".claude", "logs", "events.jsonl");
  const dir = path5.dirname(eventsPath);
  if (!existsSync3(dir)) {
    mkdirSync2(dir, { recursive: true });
  }
  const fd = openSync2(eventsPath, constants2.O_WRONLY | constants2.O_APPEND | constants2.O_CREAT, 384);
  try {
    const line = JSON.stringify(event) + "\n";
    writeSync(fd, line);
  } finally {
    closeSync2(fd);
  }
}

// src/templates/.claude/hooks/core/workflow-logger.ts
var WORKFLOW_NAME_MAX_LENGTH = 100;
var DEFAULT_WORKFLOW_NAME = "Unnamed Workflow";
var PREFIXES_TO_REMOVE = [
  /^(please|can you|could you|i need you to|i want you to|i'd like you to|help me)\s+/i
];
function extractWorkflowName(prompt, maxLength = WORKFLOW_NAME_MAX_LENGTH) {
  if (!prompt || typeof prompt !== "string") {
    return DEFAULT_WORKFLOW_NAME;
  }
  const lines = prompt.split(/\r?\n/);
  const firstLine = lines.find((line) => line.trim().length > 0);
  if (!firstLine) {
    return DEFAULT_WORKFLOW_NAME;
  }
  let name = firstLine.trim();
  for (const prefix of PREFIXES_TO_REMOVE) {
    name = name.replace(prefix, "");
  }
  name = name.trim();
  if (name.length > 0 && name[0] === name[0].toLowerCase() && /^[a-z]/.test(name)) {
    name = name.charAt(0).toUpperCase() + name.slice(1);
  }
  if (!name) {
    return DEFAULT_WORKFLOW_NAME;
  }
  if (name.length > maxLength) {
    name = name.substring(0, maxLength - 3) + "...";
  }
  return name;
}
function logWorkflowStart(options) {
  const { prompt, projectPath, workflowId } = options;
  const workflowName = extractWorkflowName(prompt);
  const promptPreview = prompt.length > 200 ? prompt.substring(0, 200) + "..." : prompt;
  const message = `- workflow - \u{1F680} START: "${workflowName}"`;
  writeEventAtomic({
    ts: (/* @__PURE__ */ new Date()).toISOString(),
    type: "workflow_start",
    session: getSessionId(),
    workflowName,
    promptPreview,
    projectPath,
    workflowId,
    _message: message
  });
  return workflowName;
}
function logWorkflowCompleteEarly(options) {
  const { reason, stagesCompleted, workflowName, workflowId } = options;
  const displayName = workflowName ?? "Workflow";
  const message = `- workflow - \u2705 COMPLETE (early): "${displayName}" - ${reason} (${stagesCompleted.join(" \u2192 ")})`;
  writeEventAtomic({
    ts: (/* @__PURE__ */ new Date()).toISOString(),
    type: "workflow_complete",
    session: getSessionId(),
    taskId: 0,
    // No task ID for early completion
    stagesCompleted,
    earlyCompletion: true,
    earlyCompletionReason: reason,
    workflowName,
    workflowId,
    _message: message
  });
}

// src/templates/.claude/hooks/core/workflow-state.ts
init_path_resolver();
init_session_state();
import crypto from "node:crypto";
import fs4 from "node:fs/promises";
import fsSync2 from "node:fs";
import path6 from "node:path";
var DURABLE_WORKFLOWS_DIR = "workflows";
var DURABLE_ACTIVE_DIR = "active";
var JSON_INDENT = 2;
function getDurableWorkflowsDir() {
  return resolveProjectPath(".claude", DURABLE_WORKFLOWS_DIR, DURABLE_ACTIVE_DIR);
}
function getDurableWorkflowPath(workflowId) {
  return path6.join(getDurableWorkflowsDir(), `${workflowId}.json`);
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
var MAX_PROMPT_LENGTH = 5e3;
function hashPrompt(prompt) {
  return crypto.createHash("sha256").update(prompt).digest("hex");
}
function truncatePrompt(prompt) {
  if (prompt.length <= MAX_PROMPT_LENGTH) {
    return prompt;
  }
  return prompt.slice(0, MAX_PROMPT_LENGTH);
}
async function clearWorkflowState(sessionId) {
  const resolvedSessionId = sessionId ?? getSessionId();
  const stateFile = getWorkflowStateFile(resolvedSessionId);
  try {
    await fs4.unlink(stateFile);
  } catch (error) {
    if (error instanceof Error && isNodeError(error) && error.code !== "ENOENT") {
      console.error("Failed to clear workflow state:", error);
    }
  }
}
async function ensureSessionFolder2(sessionId) {
  const sessionDir = resolveProjectPath(".claude", "logs", `session-${sessionId}`);
  try {
    await fs4.mkdir(sessionDir, { recursive: true });
  } catch (error) {
    if (error instanceof Error && isNodeError(error) && error.code !== "EEXIST") {
      console.error("Failed to create session folder:", error);
    }
  }
}
async function getFeaturePlannerState() {
  const sessionId = getSessionId();
  const stateFile = getWorkflowStateFile(sessionId);
  try {
    const content = await fs4.readFile(stateFile, "utf8");
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
async function getTaskMakerProgress() {
  const sessionId = getSessionId();
  const stateFile = getWorkflowStateFile(sessionId);
  try {
    const content = await fs4.readFile(stateFile, "utf8");
    const state = JSON.parse(content);
    const age = Date.now() - new Date(state.timestamp).getTime();
    if (age > STATE_TTL) {
      return void 0;
    }
    if (state.featurePlannerOutput === void 0) {
      return void 0;
    }
    const total = state.featurePlannerOutput.taskCount;
    const completed = state.taskMakerSpawns?.length ?? 0;
    return {
      allDone: completed >= total,
      completed,
      total
    };
  } catch {
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
async function getWorkflowById(workflowId, sessionId) {
  const state = await getWorkflowState(sessionId);
  if (state?.workflows === void 0) {
    return void 0;
  }
  const workflow = state.workflows.find((w) => w.workflow_id === workflowId);
  return workflow ?? void 0;
}
async function getWorkflowState(sessionId) {
  const resolvedSessionId = sessionId ?? getSessionId();
  const stateFile = getWorkflowStateFile(resolvedSessionId);
  try {
    const content = await fs4.readFile(stateFile, "utf8");
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
        await fs4.unlink(stateFile);
      } catch {
      }
      return void 0;
    }
    console.error("Failed to read workflow state:", error);
    return void 0;
  }
}
async function registerSpawnedAgent(workflowId, agentId, subagentType, prompt, backgroundTaskId) {
  const state = await getWorkflowState();
  if (state === void 0) {
    console.error("[workflow-state] Cannot register agent: no workflow state");
    return;
  }
  if (state.workflows === void 0) {
    console.error("[workflow-state] Cannot register agent: no workflows in state");
    return;
  }
  const workflow = state.workflows.find((w) => w.workflow_id === workflowId);
  if (workflow === void 0) {
    console.error(`[workflow-state] Cannot register agent: workflow ${workflowId} not found`);
    return;
  }
  if (!workflow.current_phase.spawned_agent_ids) {
    workflow.current_phase.spawned_agent_ids = [];
  }
  if (!workflow.current_phase.spawned_agent_records) {
    workflow.current_phase.spawned_agent_records = [];
  }
  if (!workflow.current_phase.spawned_agent_ids.includes(agentId)) {
    workflow.current_phase.spawned_agent_ids.push(agentId);
    workflow.current_phase.agents_spawned = workflow.current_phase.spawned_agent_ids.length;
  }
  if (subagentType !== void 0 && prompt !== void 0) {
    const fullPromptHash = hashPrompt(prompt);
    const truncatedPrompt = truncatePrompt(prompt);
    const existingRecordIndex = workflow.current_phase.spawned_agent_records.findIndex(
      (r) => r.agent_id === agentId
    );
    if (existingRecordIndex === -1) {
      const record = {
        agent_id: agentId,
        background_task_id: backgroundTaskId,
        // Track background task ID if spawned with run_in_background: true
        depends_on: [],
        prompt: truncatedPrompt,
        prompt_hash: fullPromptHash,
        retry_count: 0,
        spawned_at: (/* @__PURE__ */ new Date()).toISOString(),
        status: "running",
        subagent_type: subagentType
      };
      workflow.current_phase.spawned_agent_records.push(record);
    } else {
      const existingRecord = workflow.current_phase.spawned_agent_records[existingRecordIndex];
      if (existingRecord !== void 0) {
        const updatedRecord = {
          agent_id: agentId,
          background_task_id: backgroundTaskId ?? existingRecord.background_task_id,
          // Preserve or update background task ID
          depends_on: existingRecord.depends_on,
          prompt: truncatedPrompt,
          prompt_hash: fullPromptHash,
          retry_count: existingRecord.retry_count + 1,
          spawned_at: (/* @__PURE__ */ new Date()).toISOString(),
          status: "running",
          subagent_type: subagentType
        };
        workflow.current_phase.spawned_agent_records[existingRecordIndex] = updatedRecord;
      }
    }
  }
  await saveWorkflowState(state);
}
async function saveWorkflowState(state) {
  const stateFile = getWorkflowStateFile(state.sessionId);
  const INDENT_SPACES = 2;
  state.timestamp = (/* @__PURE__ */ new Date()).toISOString();
  const tempFile = `${stateFile}.${String(process.pid)}.tmp`;
  try {
    await fs4.writeFile(tempFile, JSON.stringify(state, void 0, INDENT_SPACES), "utf8");
    await fs4.rename(tempFile, stateFile);
  } catch (error) {
    console.error("Failed to save workflow state:", error);
    try {
      await fs4.unlink(tempFile);
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
async function recordTaskMakerSpawn(taskId) {
  const sessionId = getSessionId();
  const stateFile = getWorkflowStateFile(sessionId);
  const INDENT_SPACES = 2;
  try {
    const content = await fs4.readFile(stateFile, "utf8");
    const parsed = JSON.parse(content);
    const state = {
      featurePlannerOutput: parsed.featurePlannerOutput,
      sessionId: parsed.sessionId ?? getSessionId(),
      taskMakerSpawns: parsed.taskMakerSpawns ?? [],
      timestamp: parsed.timestamp ?? (/* @__PURE__ */ new Date()).toISOString(),
      v0Workflows: parsed.v0Workflows,
      workflows: parsed.workflows
    };
    state.taskMakerSpawns.push({
      spawnedAt: (/* @__PURE__ */ new Date()).toISOString(),
      status: "spawned",
      taskId
    });
    if (state.featurePlannerOutput !== void 0 && state.taskMakerSpawns.length >= state.featurePlannerOutput.taskCount) {
      state.featurePlannerOutput.status = "tasks_created";
    }
    state.timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const tempFile = `${stateFile}.${String(process.pid)}.tmp`;
    await fs4.writeFile(tempFile, JSON.stringify(state, void 0, INDENT_SPACES), "utf8");
    await fs4.rename(tempFile, stateFile);
  } catch (error) {
    if (error instanceof Error && isNodeError(error) && error.code === "ENOENT") {
      console.warn("No workflow state to update for task-maker spawn");
      return;
    }
    console.error("Failed to record task-maker spawn:", error);
  }
}
async function transitionWorkflowPhase(newStatus) {
  const sessionId = getSessionId();
  const stateFile = getWorkflowStateFile(sessionId);
  const INDENT_SPACES = 2;
  try {
    const content = await fs4.readFile(stateFile, "utf8");
    const parsed = JSON.parse(content);
    if (parsed.featurePlannerOutput === void 0) {
      console.warn("No feature-planner workflow to transition");
      return;
    }
    parsed.featurePlannerOutput.status = newStatus;
    parsed.timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const tempFile = `${stateFile}.${String(process.pid)}.tmp`;
    await fs4.writeFile(tempFile, JSON.stringify(parsed, void 0, INDENT_SPACES), "utf8");
    await fs4.rename(tempFile, stateFile);
  } catch (error) {
    if (error instanceof Error && isNodeError(error) && error.code === "ENOENT") {
      console.warn("No workflow state to transition");
      return;
    }
    console.error("Failed to transition workflow phase:", error);
  }
}
async function setFeaturePlannerOutput(agentData, taskCount, taskIds) {
  const sessionId = getSessionId();
  await ensureSessionFolder2(sessionId);
  const INDENT_SPACES = 2;
  const stateFile = getWorkflowStateFile(sessionId);
  const state = {
    featurePlannerOutput: {
      agentId: agentData.agentId,
      status: "pending_task_creation",
      taskCount,
      taskIds,
      // Include workflowId if provided (task-986: workflow context propagation)
      ...agentData.workflowId !== void 0 ? { workflowId: agentData.workflowId } : {}
    },
    sessionId,
    taskMakerSpawns: [],
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  const tempFile = `${stateFile}.${String(process.pid)}.tmp`;
  try {
    await fs4.writeFile(tempFile, JSON.stringify(state, void 0, INDENT_SPACES), "utf8");
    await fs4.rename(tempFile, stateFile);
  } catch (error) {
    console.error("Failed to write workflow state:", error);
    try {
      await fs4.unlink(tempFile);
    } catch {
    }
  }
}
async function startPhase(workflowId, phaseId, phaseData, sessionId) {
  const resolvedSessionId = sessionId ?? getSessionId();
  await ensureSessionFolder2(resolvedSessionId);
  const stateFile = getWorkflowStateFile(resolvedSessionId);
  const INDENT_SPACES = 2;
  try {
    const content = await fs4.readFile(stateFile, "utf8");
    const state = JSON.parse(content);
    if (state.workflows === void 0) {
      throw new Error(`No workflows in state for session ${resolvedSessionId}`);
    }
    const workflowIndex = state.workflows.findIndex((w) => w.workflow_id === workflowId);
    if (workflowIndex === -1) {
      throw new Error(`Workflow ${workflowId} not found in session ${resolvedSessionId}`);
    }
    const workflow = state.workflows[workflowIndex];
    if (workflow === void 0) {
      throw new Error(`Workflow at index ${String(workflowIndex)} is undefined`);
    }
    if (workflow.current_phase.id !== phaseId) {
      throw new Error(
        `Cannot start phase ${phaseId}: current phase is ${workflow.current_phase.id}. Use WorkflowStateManager.transitionToPhase() to change phases.`
      );
    }
    if (phaseData.agents_spawned !== void 0) {
      workflow.current_phase.agents_spawned = phaseData.agents_spawned;
    }
    if (phaseData.agents_completed !== void 0) {
      workflow.current_phase.agents_completed = phaseData.agents_completed;
    }
    if (phaseData.agents_failed !== void 0) {
      workflow.current_phase.agents_failed = phaseData.agents_failed;
    }
    if (phaseData.status !== void 0) {
      workflow.current_phase.status = phaseData.status;
    }
    if (phaseData.started_at !== void 0) {
      workflow.current_phase.started_at = phaseData.started_at;
    }
    if (phaseData.spawned_agent_ids !== void 0) {
      workflow.current_phase.spawned_agent_ids = phaseData.spawned_agent_ids;
    }
    state.timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const tempFile = `${stateFile}.${String(process.pid)}.tmp`;
    await fs4.writeFile(tempFile, JSON.stringify(state, void 0, INDENT_SPACES), "utf8");
    await fs4.rename(tempFile, stateFile);
  } catch (error) {
    if (error instanceof Error && isNodeError(error) && error.code === "ENOENT") {
      throw new Error(`Workflow ${workflowId} not found in session ${resolvedSessionId}`);
    }
    console.error("Failed to start phase:", error);
    throw error;
  }
}
function getWorkflowStateFile(sessionId) {
  return resolveProjectPath(".claude", "logs", `session-${sessionId}`, "workflow-state.json");
}
async function transitionToNextPhase(workflowId, nextPhaseId, nextPhaseAgent, sessionId) {
  const state = await getWorkflowState(sessionId);
  if (state === void 0 || state.workflows === void 0) {
    console.warn(`[workflow-state] Cannot transition phase: no workflow state`);
    return;
  }
  const workflow = state.workflows.find((w) => w.workflow_id === workflowId);
  if (workflow === void 0) {
    console.warn(`[workflow-state] Cannot transition phase: workflow ${workflowId} not found`);
    return;
  }
  const DEFAULT_ITERATION = 1;
  const historyEntry = {
    completed_at: (/* @__PURE__ */ new Date()).toISOString(),
    iteration: workflow.iterations[workflow.current_phase.id] ?? DEFAULT_ITERATION,
    phase_id: workflow.current_phase.id,
    results: {
      agents_completed: workflow.current_phase.agents_completed,
      agents_failed: workflow.current_phase.agents_failed,
      agents_spawned: workflow.current_phase.agents_spawned
    },
    started_at: workflow.current_phase.started_at,
    status: "completed"
  };
  workflow.phase_history.push(historyEntry);
  workflow.current_phase = {
    agent: nextPhaseAgent,
    agents_completed: 0,
    agents_failed: 0,
    agents_spawned: 0,
    id: nextPhaseId,
    spawned_agent_ids: [],
    spawned_agent_records: [],
    started_at: (/* @__PURE__ */ new Date()).toISOString(),
    status: "running"
  };
  await saveWorkflowState(state);
}
async function isPhaseComplete(workflowId, sessionId) {
  const state = await getWorkflowState(sessionId);
  if (state === void 0 || state.workflows === void 0) {
    return false;
  }
  const workflow = state.workflows.find((w) => w.workflow_id === workflowId);
  if (workflow === void 0) {
    return false;
  }
  const phase = workflow.current_phase;
  if (phase.agents_spawned === 0) {
    return false;
  }
  const records = phase.spawned_agent_records ?? [];
  if (records.length > 0) {
    const terminalStatuses = /* @__PURE__ */ new Set(["completed", "failed", "skipped", "stale"]);
    return records.every((r) => terminalStatuses.has(r.status));
  }
  return phase.agents_completed + phase.agents_failed >= phase.agents_spawned;
}
function isNodeError(error) {
  return "code" in error;
}

// src/templates/.claude/hooks/types.ts
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isValidSpawnMultiplePayload(value) {
  if (!isRecord(value)) return false;
  if (!Array.isArray(value.agents)) return false;
  for (const agentItem of value.agents) {
    const agent = agentItem;
    if (!isRecord(agent)) return false;
    if (typeof agent.agent_name !== "string") return false;
    if (agent.payload !== void 0 && !isRecord(agent.payload)) {
      return false;
    }
  }
  if (value.integration_agent !== void 0) {
    if (!isRecord(value.integration_agent)) return false;
    if (typeof value.integration_agent.agent_name !== "string") return false;
    if (value.integration_agent.payload !== void 0 && !isRecord(value.integration_agent.payload)) {
      return false;
    }
  }
  if (value.workflow_context !== void 0) {
    if (!isRecord(value.workflow_context)) return false;
    if (typeof value.workflow_context.workflow_id !== "string") return false;
    if (typeof value.workflow_context.workflow_name !== "string") return false;
  }
  return true;
}

// src/templates/.claude/hooks/orchestration/agent-orchestrator.ts
var BLOCKED_PERCENT_THRESHOLD = 0.2;
var BLOCKED_PERCENT_MULTIPLIER = 100;
var ROUNDS_NEEDED_FOR_STALL_DETECTION = 2;
var DEFAULT_MAX_ROUNDS = 5;
var VALIDATION_TIME_WARNING_THRESHOLD = 5;
var SNIPPET_MAX_LENGTH = 100;
var JSON_INDENT_SPACES = 2;
var DEFAULT_MAX_CONCURRENT_AGENTS = Number.parseInt(
  process.env.CLAUDE_WORKFLOW_MAX_CONCURRENT_AGENTS ?? "3",
  10
);
var DEFAULT_AGENT_TIMEOUT_MS = Number.parseInt(
  process.env.CLAUDE_WORKFLOW_AGENT_TIMEOUT_MS ?? "1800000",
  10
);
var MIN_AGENT_TIMEOUT_MS = 5 * 60 * 1e3;
var AGENT_PROMPT_SUFFIX = `

RESPONSE FORMAT: Return ONLY your required JSON output. Do NOT include file contents, code snippets, explanations, or commentary in your response. Files written to disk are the deliverable - your response is just metadata for the orchestrator. If no JSON schema is required, respond with a single short status line.`;
var CONCISE_RESPONSE_INSTRUCTION = `
## CRITICAL: Agent Response Size Control
When constructing EACH agent's Task() call, you MUST append the following to the end of the agent's prompt:

"${AGENT_PROMPT_SUFFIX.trim()}"

This prevents context window overflow when multiple agents return results simultaneously.`;
var BACKGROUND_OUTPUT_TOOLS = ["TaskOutput", "BashOutput"];
var BACKGROUND_AGENT_TYPES = [
  "frontend-engineer",
  "backend-engineer",
  "devops-engineer",
  "deployment-engineer",
  // Deployment phases can run in parallel
  "documentation-writer",
  "research",
  "research-planner",
  "general-purpose",
  "task-maker"
  // Subsequent task-maker spawns can be backgrounded
];
function shouldRunInBackground(agentType, isFirstSpawn = false) {
  if (agentType === "task-maker" && isFirstSpawn) {
    return false;
  }
  return BACKGROUND_AGENT_TYPES.includes(agentType);
}
function outputEmpty() {
}
function safeJsonOutput(obj) {
  try {
    const json = JSON.stringify(obj);
    console.log(json);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    process.stderr.write(`[agent-orchestrator] JSON stringify failed: ${errorMessage}
`);
    outputEmpty();
  }
}
function toStr(value) {
  return value === void 0 ? "" : String(value);
}
var logError = (error, context) => {
  logHookActivity("agent-orchestrator", "PostToolUse", {
    context,
    error: error.toLogString(),
    status: "error"
  });
};
var isTestMode = Boolean(process.env.VITEST ?? process.env.NODE_ENV === "test");
if (!isTestMode) {
  let inputData = "";
  process.stdin.on("data", (chunk) => {
    inputData += String(chunk);
  });
  process.stdin.on("end", () => {
    void (async () => {
      try {
        const event = JSON.parse(inputData);
        const toolName = event.tool_name ?? event.toolName ?? "";
        const toolResult = event.tool_response ?? event.toolResult ?? {};
        if (BACKGROUND_OUTPUT_TOOLS.includes(toolName)) {
          await handleBackgroundOutputTool(toolName, toolResult);
          await checkForStuckAgents();
          outputEmpty();
          return;
        }
        if (toolName !== "Task") {
          outputEmpty();
          return;
        }
        let agentResponse = "";
        if (typeof toolResult === "string") {
          agentResponse = toolResult;
        } else if (typeof toolResult === "object" && "output" in toolResult && typeof toolResult.output === "string") {
          agentResponse = toolResult.output;
        } else {
          outputEmpty();
          return;
        }
        const orchestrationData = extractAgentJSON(agentResponse);
        if (orchestrationData === void 0) {
          logHookActivity("agent-orchestrator", "PostToolUse", {
            details: "No JSON output found in agent response",
            status: "success"
          });
          outputEmpty();
          return;
        }
        const validationResult = validateAgentJSON(orchestrationData);
        if (!validationResult.valid) {
          logHookActivity("agent-orchestrator", "PostToolUse", {
            details: `JSON validation failed: ${validationResult.errors.join(", ")}`,
            status: "error"
          });
          outputEmpty();
          return;
        }
        if (orchestrationData.agent_type === "architecture" && orchestrationData.results?.feature_plan?.tasks !== void 0 && Array.isArray(orchestrationData.results.feature_plan.tasks) && orchestrationData.results.feature_plan.tasks.length > 0) {
          try {
            const tasks = orchestrationData.results.feature_plan.tasks;
            const taskIds = tasks.filter((t) => typeof t.backlog_task_id === "number").map((t) => t.backlog_task_id);
            const metadataWorkflowId = orchestrationData.metadata?.workflow_id;
            const payloadWorkflowId = orchestrationData.nextAction?.payload?.workflow_id;
            const featurePlannerWorkflowId = typeof metadataWorkflowId === "string" && metadataWorkflowId.trim() ? metadataWorkflowId.trim() : typeof payloadWorkflowId === "string" && payloadWorkflowId.trim() ? payloadWorkflowId.trim() : orchestrationData.agent_id ?? `workflow-${String(Date.now())}`;
            if (taskIds.length > 0) {
              await setFeaturePlannerOutput(
                {
                  agentId: orchestrationData.agent_id ?? "unknown",
                  timestamp: (/* @__PURE__ */ new Date()).toISOString(),
                  workflowId: featurePlannerWorkflowId
                },
                taskIds.length,
                taskIds
              );
              try {
                await transitionToNextPhase(featurePlannerWorkflowId, "task_creation", "task-maker");
              } catch {
              }
              const featureName = orchestrationData.results.feature_plan.feature_name;
              const workflowName = typeof featureName === "string" && featureName.trim() ? featureName.trim() : `Feature with ${String(taskIds.length)} tasks`;
              logWorkflowStart({
                prompt: workflowName,
                projectPath: process.cwd(),
                workflowId: featurePlannerWorkflowId
              });
              logHookActivity("agent-orchestrator", "PostToolUse", {
                details: `Feature-planner completed with ${String(taskIds.length)} tasks - workflow enforcement active`,
                status: "success",
                taskCount: taskIds.length,
                taskIds,
                workflowId: featurePlannerWorkflowId,
                workflowState: "pending_task_creation"
              });
              void writeToSessionLog("agent-orchestration", {
                agentId: orchestrationData.agent_id,
                agentType: orchestrationData.agent_type,
                executionTime: orchestrationData.metadata?.execution_time_ms,
                nextAction: orchestrationData.nextAction,
                sessionId: orchestrationData.session_id,
                status: orchestrationData.status,
                timestamp: (/* @__PURE__ */ new Date()).toISOString(),
                workflowId: featurePlannerWorkflowId,
                workflowState: {
                  recorded: true,
                  state: "pending_task_creation",
                  taskCount: taskIds.length,
                  taskIds,
                  workflowId: featurePlannerWorkflowId
                }
              });
            } else {
              logHookActivity("agent-orchestrator", "PostToolUse", {
                details: "Feature-planner output has no valid backlog_task_id values",
                status: "warning",
                taskCount: tasks.length
              });
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const tasks = orchestrationData.results.feature_plan.tasks;
            logHookActivity("agent-orchestrator", "PostToolUse", {
              context: {
                agentId: orchestrationData.agent_id,
                taskCount: tasks.length
              },
              details: "Failed to record feature-planner workflow state",
              error: errorMessage,
              status: "error"
            });
          }
        } else if (orchestrationData.agent_type === "architecture" && orchestrationData.results?.feature_plan !== void 0) {
          const tasks = orchestrationData.results.feature_plan.tasks;
          const hasEmptyTasks = Array.isArray(tasks) && tasks.length === 0;
          const noNextAction = orchestrationData.nextAction?.type === "none";
          const isSkipped = orchestrationData.status === "skipped";
          const errorMessage = orchestrationData.error?.message ?? "";
          const featurePlanApproach = String(orchestrationData.results.feature_plan.planning_approach ?? "");
          const featureExistsPatterns = [
            "already exists",
            "already complete",
            "already implemented",
            "no additional work",
            "no implementation needed",
            "feature exists",
            "nothing to implement"
          ];
          const hasFeatureExistsPattern = featureExistsPatterns.some(
            (pattern) => errorMessage.toLowerCase().includes(pattern) || featurePlanApproach.toLowerCase().includes(pattern)
          );
          if (hasEmptyTasks || noNextAction || isSkipped || hasFeatureExistsPattern) {
            const featureName = String(orchestrationData.results.feature_plan.feature_name ?? "Unknown Feature");
            const reason = hasFeatureExistsPattern ? "Feature already exists in codebase" : isSkipped ? "Feature planning skipped" : noNextAction ? "No implementation required" : "Feature already complete (empty task list)";
            logWorkflowCompleteEarly({
              reason,
              stagesCompleted: ["feature_planning"],
              workflowName: featureName,
              workflowId: orchestrationData.agent_id ?? `workflow-${String(Date.now())}`
            });
            logHookActivity("agent-orchestrator", "PostToolUse", {
              details: `Workflow completed early: ${reason}`,
              featureName,
              reason,
              stagesCompleted: ["feature_planning"],
              status: "complete",
              workflowId: orchestrationData.agent_id
            });
            void writeToSessionLog("agent-orchestration", {
              agentId: orchestrationData.agent_id,
              agentType: orchestrationData.agent_type,
              earlyCompletion: true,
              earlyCompletionReason: reason,
              featureName,
              sessionId: orchestrationData.session_id,
              stagesCompleted: ["feature_planning"],
              status: "workflow_complete_early",
              timestamp: (/* @__PURE__ */ new Date()).toISOString()
            });
          }
        }
        const isResearchAgent = orchestrationData.agent_type === "research" || event.tool_input?.subagent_type === "research";
        if (isResearchAgent) {
          try {
            const researchWorkflowId = orchestrationData.metadata?.workflow_id ?? orchestrationData.agent_id;
            if (typeof researchWorkflowId === "string" && researchWorkflowId.trim()) {
              const wfId = researchWorkflowId.trim();
              const researchAgentId = orchestrationData.agent_id;
              if (typeof researchAgentId === "string") {
                await updateAgentStatus(wfId, researchAgentId, "completed");
              }
              const allDone = await isPhaseComplete(wfId);
              if (allDone) {
                await transitionToNextPhase(wfId, "planning", "feature-planner");
                logHookActivity("agent-orchestrator", "PostToolUse", {
                  details: "All research agents completed - transitioned to planning phase",
                  status: "success",
                  workflowId: wfId,
                  phaseTransition: "research \u2192 planning"
                });
              } else {
                logHookActivity("agent-orchestrator", "PostToolUse", {
                  details: `Research agent completed (phase not yet complete)`,
                  researchAgentId,
                  status: "info",
                  workflowId: wfId
                });
              }
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logHookActivity("agent-orchestrator", "PostToolUse", {
              details: "Failed to process research agent completion",
              error: errorMessage,
              status: "error"
            });
          }
        }
        const isTaskMaker = orchestrationData.agent_type === "task-management" || event.tool_input?.subagent_type === "task-maker";
        if (isTaskMaker) {
          try {
            const taskIdStr = orchestrationData.results?.task_id;
            const backlogTaskId = orchestrationData.results?.backlog_task_id;
            let taskId;
            if (typeof backlogTaskId === "number") {
              taskId = backlogTaskId;
            } else if (typeof taskIdStr === "string") {
              const match = taskIdStr.match(/task-(\d+)/);
              if (match?.[1] !== void 0) {
                taskId = parseInt(match[1], 10);
              }
            }
            if (taskId !== void 0 && !isNaN(taskId)) {
              await recordTaskMakerSpawn(taskId);
              const progress = await getTaskMakerProgress();
              if (progress?.allDone) {
                logHookActivity("agent-orchestrator", "PostToolUse", {
                  completed: progress.completed,
                  details: "All task-makers completed - state transitioned to tasks_created",
                  status: "success",
                  total: progress.total,
                  workflowState: "tasks_created"
                });
              } else if (progress !== void 0) {
                logHookActivity("agent-orchestrator", "PostToolUse", {
                  completed: progress.completed,
                  details: `Task-maker completed (${String(progress.completed)}/${String(progress.total)})`,
                  status: "info",
                  total: progress.total,
                  workflowState: "pending_task_creation"
                });
              }
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logHookActivity("agent-orchestrator", "PostToolUse", {
              details: "Failed to record task-maker completion",
              error: errorMessage,
              status: "error"
            });
          }
        }
        if (orchestrationData.nextAction?.type === "spawn_agent" && orchestrationData.nextAction.agent_name !== void 0) {
          const targetAgent = orchestrationData.nextAction.agent_name;
          if (typeof targetAgent === "string" && IMPLEMENTATION_AGENT_TYPES.includes(targetAgent)) {
            try {
              const plannerState = await getFeaturePlannerState();
              if (plannerState !== void 0 && plannerState.status === "tasks_created") {
                await transitionWorkflowPhase("implementation_started");
                logHookActivity("agent-orchestrator", "PostToolUse", {
                  details: `Implementation agent "${targetAgent}" detected - transitioned to implementation_started`,
                  status: "success",
                  workflowState: "implementation_started"
                });
              }
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : String(error);
              logHookActivity("agent-orchestrator", "PostToolUse", {
                details: "Failed to transition to implementation_started",
                error: errorMessage,
                status: "error"
              });
            }
          }
        }
        const orchestrationResult = await processOrchestration(orchestrationData);
        logHookActivity("agent-orchestrator", "PostToolUse", {
          agentType: orchestrationData.agent_type,
          decision: orchestrationResult.action,
          details: orchestrationResult.message,
          multiTaskCount: orchestrationResult.action === "spawn_agent_multi" && orchestrationData.nextAction?.payload !== void 0 ? orchestrationData.nextAction.payload.task_spec?.tasks === void 0 ? void 0 : orchestrationData.nextAction.payload.task_spec.tasks.length : void 0,
          // Multi-task tracking
          multiTaskDetected: orchestrationResult.action === "spawn_agent_multi",
          nextAction: orchestrationData.nextAction?.type ?? "none",
          preAllocatedIds: orchestrationResult.action === "spawn_agent_multi" && orchestrationData.nextAction?.payload !== void 0 ? orchestrationData.nextAction.payload.task_spec?.tasks === void 0 ? void 0 : orchestrationData.nextAction.payload.task_spec.tasks.map((t) => t.backlog_task_id) : void 0,
          status: "success"
        });
        void writeToSessionLog("agent-orchestration", {
          agentId: orchestrationData.agent_id,
          agentType: orchestrationData.agent_type,
          executionTime: orchestrationData.metadata?.execution_time_ms,
          nextAction: orchestrationData.nextAction,
          orchestrationDecision: orchestrationResult.action,
          sessionId: orchestrationData.session_id,
          status: orchestrationData.status,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
        let dependencySpawnInstructions = "";
        const workflowIdFromPayload = orchestrationData.nextAction?.payload?.workflow_id;
        const workflowIdFromContext = orchestrationData.nextAction?.payload?.workflow_context?.workflow_id;
        const workflowIdFromMetadata = orchestrationData.metadata?.workflow_id;
        const derivedWorkflowId = typeof workflowIdFromPayload === "string" ? workflowIdFromPayload : typeof workflowIdFromContext === "string" ? workflowIdFromContext : typeof workflowIdFromMetadata === "string" ? workflowIdFromMetadata : void 0;
        if (orchestrationData.agent_id !== void 0 && derivedWorkflowId !== void 0) {
          if (orchestrationData.status === "success") {
            await updateAgentStatus(
              derivedWorkflowId,
              orchestrationData.agent_id,
              "completed"
            );
            const dependencyResult = await checkAndSpawnDependents(
              orchestrationData.agent_id,
              derivedWorkflowId
            );
            if (dependencyResult !== void 0) {
              dependencySpawnInstructions = dependencyResult.spawnInstructions;
            }
          } else if (orchestrationData.status === "failure" || orchestrationData.status === "blocked") {
            const failureReasonStr = orchestrationData.error?.message ?? "Unknown failure";
            const mappedReason = mapFailureReason(failureReasonStr);
            await updateAgentStatus(
              derivedWorkflowId,
              orchestrationData.agent_id,
              "failed",
              mappedReason
            );
            await markDependentsBlocked(
              orchestrationData.agent_id,
              derivedWorkflowId,
              failureReasonStr
            );
          }
        }
        if (orchestrationResult.output === void 0 && dependencySpawnInstructions === "") {
          outputEmpty();
        } else if (dependencySpawnInstructions !== "" && orchestrationResult.output !== void 0) {
          const combinedOutput = {
            ...orchestrationResult.output,
            dependency_resolution: {
              instructions: dependencySpawnInstructions,
              type: "dependent_agents_ready"
            }
          };
          safeJsonOutput(combinedOutput);
        } else if (dependencySpawnInstructions !== "") {
          safeJsonOutput({
            dependency_resolution: {
              instructions: dependencySpawnInstructions,
              type: "dependent_agents_ready"
            }
          });
        } else {
          safeJsonOutput(orchestrationResult.output);
        }
      } catch (error) {
        const errorInstance = error instanceof Error ? error : new Error(String(error));
        const orchError = OrchestrationError.fromError(errorInstance, {
          category: ERROR_CATEGORIES.ORCHESTRATION,
          context: { stage: "main-processing" },
          operation: "processAgentOrchestration"
        });
        logError(orchError, {
          component: "agent-orchestrator",
          stage: "main-processing"
        });
        process.stderr.write(`[agent-orchestrator] Hook error: ${orchError.toLogString()}
`);
        outputEmpty();
        process.exit(0);
      }
    })();
  });
}
function aggregateDeferredErrors(agentReports, existingBacklog) {
  const newDeferred = [];
  for (const report of agentReports) {
    if (report.status !== "DEFERRED") {
      continue;
    }
    newDeferred.push(...report.deferredErrors);
  }
  const backlogMap = /* @__PURE__ */ new Map();
  for (const error of [...existingBacklog, ...newDeferred]) {
    const key = `${error.file}:${String(error.line)}:${error.rule}`;
    backlogMap.set(key, error);
  }
  return [...backlogMap.values()];
}
function checkEscalationTriggers(state, roundReport, previousRounds) {
  const escalations = [];
  const blockedPercent = roundReport.agentsSpawned === 0 ? 0 : roundReport.agentsBlocked / roundReport.agentsSpawned;
  if (blockedPercent > BLOCKED_PERCENT_THRESHOLD) {
    escalations.push(
      `ESCALATE: ${(blockedPercent * BLOCKED_PERCENT_MULTIPLIER).toFixed(0)}% agents BLOCKED - requires human intervention`
    );
  }
  if (previousRounds.length >= ROUNDS_NEEDED_FOR_STALL_DETECTION) {
    const twoRoundsAgo = previousRounds[previousRounds.length - ROUNDS_NEEDED_FOR_STALL_DETECTION];
    if (twoRoundsAgo && roundReport.deferredBacklogSize > twoRoundsAgo.deferredBacklogSize) {
      escalations.push(
        `ESCALATE: Deferred backlog growing (${String(twoRoundsAgo.deferredBacklogSize)} \u2192 ${String(roundReport.deferredBacklogSize)}) - dependency cycle suspected`
      );
    }
  }
  const recentRounds = previousRounds.slice(-ROUNDS_NEEDED_FOR_STALL_DETECTION);
  const lastRound = recentRounds[recentRounds.length - 1];
  const secondLastRound = recentRounds[recentRounds.length - ROUNDS_NEEDED_FOR_STALL_DETECTION];
  const hasProgress = recentRounds.length >= ROUNDS_NEEDED_FOR_STALL_DETECTION && lastRound && secondLastRound ? lastRound.totalErrorsRemaining < secondLastRound.totalErrorsRemaining : true;
  if (!hasProgress && recentRounds.length >= ROUNDS_NEEDED_FOR_STALL_DETECTION) {
    escalations.push(`ESCALATE: No progress for ${String(ROUNDS_NEEDED_FOR_STALL_DETECTION)} rounds - campaign stuck`);
  }
  const maxRounds = state.phases[state.currentPhase]?.maxRounds ?? DEFAULT_MAX_ROUNDS;
  if (state.currentRound >= maxRounds) {
    escalations.push(
      `ESCALATE: Maximum rounds (${String(maxRounds)}) reached for Phase ${String(state.currentPhase)}`
    );
  }
  return escalations;
}
function enforceRefactorVerifier(phaseNum, roundNum) {
  return `
\u26A0\uFE0F MANDATORY VERIFICATION CHECKPOINT

Before proceeding:
1. Spawn refactor-verifier agent
2. Provide git diff since phase-${String(phaseNum)}-round-${String(roundNum)}-start
3. Wait for verification report

If semantic_equivalence: false
  \u2192 STOP CAMPAIGN IMMEDIATELY
  \u2192 Rollback: git reset --hard phase-${String(phaseNum)}-round-${String(roundNum)}-start
  \u2192 Review report and retry with different approach

If semantic_equivalence: true
  \u2192 Proceed to next round/phase
  \u2192 Create checkpoint: git tag phase-${String(phaseNum)}-round-${String(roundNum)}-verified
`;
}
function findRetryReadyItems(backlog, fixedFiles, fixedRules) {
  return backlog.filter((error) => {
    if (!error.requiresUpstreamFix) {
      return false;
    }
    if (error.requiresUpstreamFix.type === "file") {
      return fixedFiles.includes(error.requiresUpstreamFix.target);
    }
    return fixedRules.includes(error.requiresUpstreamFix.target);
  });
}
function formatRoundSummary(round, state) {
  const deferredBreakdown = categorizeDeferredErrors(state.deferredBacklog);
  return `
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
ROUND ${String(round.round)} COMPLETE - Phase ${String(state.currentPhase)}
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

Agents: ${String(round.agentsSpawned)} spawned | ${String(round.agentsSuccess)} SUCCESS | ${String(round.agentsDeferred)} DEFERRED | ${String(round.agentsBlocked)} BLOCKED | ${String(round.agentsFailed)} FAILED

Errors: ${String(round.totalErrorsRemaining)} remaining (from ${String(round.totalErrorsRemaining + round.totalErrorsFixed)}) - ${String(round.totalErrorsFixed)} fixed this round

Deferred Backlog: ${String(round.deferredBacklogSize)} errors
  - ${String(deferredBreakdown.upstreamBlockers)} upstream blockers
  - ${String(deferredBreakdown.apiChanges)} API surface changes
  - ${String(deferredBreakdown.architectural)} architectural decisions
  - ${String(deferredBreakdown.generatedCode)} generated code

Files Processed: ${String(round.filesProcessed)}

\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
`;
}
function handleVerificationFailure(phaseNum, roundNum, reportPath) {
  return `
\u{1F6D1} CAMPAIGN STOPPED - VERIFICATION FAILED

Refactor-verifier detected behavioral changes.
This violates the zero-semantic-change requirement.

Actions:
1. Rollback: git reset --hard phase-${String(phaseNum)}-round-${String(roundNum)}-start
2. Review verification report: ${reportPath}
3. Identify which lint fixes introduced behavior changes
4. Retry with different fix approach OR mark errors as BLOCKED

Campaign cannot proceed until verification passes.
`;
}
async function calculateSpawnCount(phaseConfig) {
  const { count, phase_id, workflow_id } = phaseConfig;
  if (typeof count === "number") {
    if (count < 0) {
      throw new OrchestrationError("Spawn count cannot be negative", {
        category: ERROR_CATEGORIES.VALIDATION,
        code: ERROR_CODES.INVALID_NEXT_ACTION,
        context: { count }
      });
    }
    if (count === 0) {
      console.warn(`[Agent Orchestrator] Zero spawn count for phase ${phase_id} - no agents will be spawned`);
    }
    return count;
  }
  const previousPhase = await getPreviousPhase(workflow_id, phase_id);
  if (previousPhase === void 0) {
    throw new OrchestrationError("No previous phase found for dynamic count calculation", {
      category: ERROR_CATEGORIES.ORCHESTRATION,
      code: ERROR_CODES.MISSING_REQUIRED_FIELD,
      context: { countType: count, currentPhase: phase_id }
    });
  }
  if (count === "from_previous") {
    if (previousPhase.agents_spawned === 0) {
      console.warn(`[Agent Orchestrator] Previous phase ${previousPhase.id} spawned 0 agents - no agents will be spawned for current phase`);
    }
    return previousPhase.agents_spawned;
  }
  if (previousPhase.agents_failed === 0) {
    console.info(`[Agent Orchestrator] Previous phase ${previousPhase.id} had 0 failures - no retry agents needed`);
  }
  return previousPhase.agents_failed;
}
function categorizeDeferredErrors(backlog) {
  return {
    apiChanges: backlog.filter(
      (e) => e.reason === "api_surface_change"
    ).length,
    architectural: backlog.filter(
      (e) => e.reason === "architectural"
    ).length,
    generatedCode: backlog.filter(
      (e) => e.reason === "generated_code"
    ).length,
    upstreamBlockers: backlog.filter(
      (e) => e.reason === "upstream_blocker"
    ).length
  };
}
function extractAgentJSON(response) {
  const result = withSyncErrorHandling(
    () => {
      const jsonBlockMatch = /```(?:json)?\s*([\s\S]*?)\s*```/.exec(response);
      if (jsonBlockMatch?.[1] !== void 0) {
        try {
          const parsed = JSON.parse(jsonBlockMatch[1].trim());
          return parsed;
        } catch (error) {
          const eInstance = error instanceof Error ? error : new Error(String(error));
          logError(
            OrchestrationError.fromError(eInstance, {
              category: ERROR_CATEGORIES.PARSING,
              code: ERROR_CODES.JSON_PARSE_ERROR,
              context: {
                method: "codeblock",
                snippet: jsonBlockMatch[1].slice(0, SNIPPET_MAX_LENGTH)
              },
              operation: "extractAgentJSON-codeblock"
            })
          );
        }
      }
      const delimitedMatch = /=== AGENT JSON OUTPUT ===\s*([\s\S]*?)\s*=== END JSON OUTPUT ===/.exec(response);
      if (delimitedMatch?.[1] !== void 0) {
        try {
          const parsed = JSON.parse(delimitedMatch[1].trim());
          return parsed;
        } catch (error) {
          const eInstance = error instanceof Error ? error : new Error(String(error));
          logError(
            OrchestrationError.fromError(eInstance, {
              category: ERROR_CATEGORIES.PARSING,
              code: ERROR_CODES.JSON_PARSE_ERROR,
              context: {
                method: "delimited",
                snippet: delimitedMatch[1].slice(0, SNIPPET_MAX_LENGTH)
              },
              operation: "extractAgentJSON-delimited"
            })
          );
        }
      }
      const jsonObjectMatch = /\{[\s\S]*\}/.exec(response);
      if (jsonObjectMatch !== null) {
        try {
          const parsed = JSON.parse(jsonObjectMatch[0]);
          if (typeof parsed === "object" && parsed !== null && "agent_type" in parsed && typeof parsed.agent_type === "string") {
            return parsed;
          }
        } catch (error) {
          const eInstance = error instanceof Error ? error : new Error(String(error));
          logError(
            OrchestrationError.fromError(eInstance, {
              category: ERROR_CATEGORIES.PARSING,
              code: ERROR_CODES.JSON_PARSE_ERROR,
              context: {
                method: "raw",
                snippet: jsonObjectMatch[0].slice(0, SNIPPET_MAX_LENGTH)
              },
              operation: "extractAgentJSON-raw"
            })
          );
        }
      }
      return void 0;
    },
    {
      category: ERROR_CATEGORIES.PARSING,
      code: ERROR_CODES.AGENT_JSON_EXTRACTION_FAILED,
      context: { responseLength: response.length },
      fallback: () => void 0,
      operation: "extractAgentJSON"
    }
  );
  return result;
}
function formatBatchSpawnInstructions(spawnCount, phaseConfig) {
  const { agent_name, config, context, phase_id, workflow_id } = phaseConfig;
  const contextStr = context === void 0 ? "No additional context" : JSON.stringify(context, void 0, JSON_INDENT_SPACES);
  const contextInline = context === void 0 ? "{}" : JSON.stringify(context);
  const configStr = config === void 0 ? "" : `
4. Pass this configuration to each agent:
   \`\`\`json
   ${JSON.stringify(config, void 0, JSON_INDENT_SPACES)}
   \`\`\`
`;
  const configInline = config === void 0 ? "" : `, "config": ${JSON.stringify(config)}`;
  const maxConcurrent = DEFAULT_MAX_CONCURRENT_AGENTS;
  const needsBatching = spawnCount > maxConcurrent;
  let batchingInstructions = "";
  if (needsBatching) {
    batchingInstructions = `

## CONTEXT MANAGEMENT - MANDATORY
You have ${toStr(spawnCount)} agents to spawn but MUST only run ${toStr(maxConcurrent)} at a time.

**Batching protocol:**
1. Spawn batch of ${toStr(maxConcurrent)} agents with \`run_in_background=true\`
2. Poll for completion using TaskOutput (non-blocking)
3. When batch completes, tell the user: "Batch complete. Please run /compact before I spawn the next batch."
4. WAIT for user confirmation before spawning next batch
5. Repeat until all ${toStr(spawnCount)} agents are spawned

**Why:** Spawning all ${toStr(spawnCount)} at once will overflow the context window when results return simultaneously.`;
  }
  return `
\u{1F504} **Batch Agent Spawning Required**

**Workflow:** ${workflow_id}
**Phase:** ${phase_id}
**Agent:** ${agent_name}
**Count:** ${toStr(spawnCount)}
**Max Concurrent:** ${toStr(maxConcurrent)}
${batchingInstructions}

**Instructions for Main Claude:**

1. Spawn agents with \`run_in_background=true\` (max ${toStr(maxConcurrent)} at a time)
2. For each agent, include this metadata:
   \`\`\`json
   {
     "workflow_id": "${workflow_id}",
     "phase_id": "${phase_id}",
     "agent_index": <index>,
     "total_agents": ${toStr(spawnCount)}${configInline}
   }
   \`\`\`
3. Pass this context to each agent:
   ${contextStr}
${configStr}
**Example spawn command:**
\`\`\`
Task: Run ${agent_name} agent with:
- Metadata: {"workflow_id": "${workflow_id}", "phase_id": "${phase_id}", "agent_index": 1${configInline}}
- Context: ${contextInline}
\`\`\`
${CONCISE_RESPONSE_INSTRUCTION}
  `.trim();
}
function formatMultiSpawnInstructions(payload, workflowId) {
  const agentInstructions = payload.agents.map((agent, index) => {
    const agentNum = index + 1;
    const expectedAgentId = `${agent.agent_name}-${workflowId}-${String(index)}`;
    const payloadStr = JSON.stringify(agent.payload ?? {}, void 0, JSON_INDENT_SPACES);
    return `## Agent ${toStr(agentNum)}/${toStr(payload.agents.length)}: ${agent.agent_name}

**Expected Agent ID:** \`${expectedAgentId}\`
Spawn ${agent.agent_name} with payload:
\`\`\`json
${payloadStr}
\`\`\`

---`;
  }).join("\n\n");
  const maxConcurrent = DEFAULT_MAX_CONCURRENT_AGENTS;
  const needsBatching = payload.agents.length > maxConcurrent;
  let batchingNote = "";
  if (needsBatching) {
    batchingNote = `
## CONTEXT MANAGEMENT - MANDATORY
Spawn in batches of ${toStr(maxConcurrent)}. After each batch completes:
1. Tell the user: "Batch complete. Please run /compact before I spawn the next batch."
2. WAIT for user confirmation before spawning next batch.
This prevents context window overflow from simultaneous agent results.
`;
  }
  let instructions = `\u{1F916} MULTI-AGENT SPAWN REQUIRED

Total agents to spawn: ${toStr(payload.agents.length)}
Workflow ID: ${workflowId}
Max concurrent: ${toStr(maxConcurrent)}

CRITICAL: Spawn each agent SEPARATELY. Do NOT combine into one agent.
CRITICAL: Include the expected agent ID in each Task tool call for tracking.
CRITICAL: All agents MUST use \`run_in_background=true\`.
${batchingNote}
${agentInstructions}
${CONCISE_RESPONSE_INSTRUCTION}`;
  if (payload.integration_agent) {
    instructions += `

## Integration Agent

After ALL ${toStr(payload.agents.length)} agents complete, spawn:
- Agent: ${payload.integration_agent.agent_name}
- Purpose: Aggregate results from all ${toStr(payload.agents.length)} agents
- Trigger: Automatically spawned when all agents signal completion

The orchestrator will track completion and spawn the integration agent automatically.`;
  }
  return instructions;
}
function generatePhaseInstructions(state, phaseNum) {
  const PHASE_0 = 0;
  const PHASE_1 = 1;
  const PHASE_2 = 2;
  const PHASE_3 = 3;
  const PHASE_4 = 4;
  const TOP_FILES_COUNT = 15;
  const TOP_RULES_COUNT = 5;
  const DEFAULT_MAX_ITER = 5;
  const DEFAULT_FILE_ERROR_THRESHOLD = 10;
  const DEFAULT_RULE_VIOLATION_THRESHOLD = 50;
  const phase = state.phases.find((p) => p.phase === phaseNum);
  if (phase === void 0) {
    return `ERROR: Phase ${String(phaseNum)} not found in campaign definition`;
  }
  switch (phaseNum) {
    case PHASE_0: {
      return `
PHASE 0: AUTO-FIX

Instructions:
1. Run: npm run lint -- --fix
2. Commit changes: git add . && git commit -m "Phase 0: Auto-fix"
3. MANDATORY: Spawn refactor-verifier agent
   - Provide git diff since campaign start
   - STOP if semantic_equivalence: false
4. If verification passes, proceed to Phase 1

Expected: ${phase.description}
`;
    }
    case PHASE_1: {
      const threshold = phase.threshold ?? `No files >${String(DEFAULT_FILE_ERROR_THRESHOLD)} errors`;
      const maxRounds = phase.maxRounds ?? DEFAULT_MAX_ROUNDS;
      return `
PHASE 1: FILE SWARM (Round-Based)

Threshold: ${threshold}
Max Rounds: ${String(maxRounds)}

Round Instructions:
1. Run: npm run lint:summary
2. Identify top ${String(TOP_FILES_COUNT)} worst files (by error count)
3. Check deferred backlog for retry-ready items
4. Spawn ${String(TOP_FILES_COUNT)} parallel lint-fixer agents (mode: 'file')
   - Each agent gets one file path
   - Agents run retry loop (max ${String(DEFAULT_MAX_ITER)} iterations)
5. Collect agent reports (SUCCESS/DEFERRED/BLOCKED/FAILED)
6. Aggregate deferred errors to backlog
7. MANDATORY: Spawn refactor-verifier agent
   - STOP if semantic_equivalence: false
   - Rollback: git reset --hard phase-1-round-N-start
8. Check escalation triggers
9. Check threshold: Continue or advance?

Current Round: ${String(state.currentRound + 1)}
`;
    }
    case PHASE_2: {
      const threshold = phase.threshold ?? `No rules >${String(DEFAULT_RULE_VIOLATION_THRESHOLD)} violations`;
      const maxRounds = phase.maxRounds ?? DEFAULT_MAX_ROUNDS;
      return `
PHASE 2: RULE SWEEP (Round-Based)

Threshold: ${threshold}
Max Rounds: ${String(maxRounds)}

Round Instructions:
1. Run: npm run lint:summary
2. Identify top ${String(TOP_RULES_COUNT)} rules (by violation count)
3. Retry Phase 1 deferred items whose blockers are resolved
4. Spawn ${String(TOP_RULES_COUNT)} parallel lint-fixer agents (mode: 'rule')
   - Each agent gets one rule name
   - Agents run retry loop (max ${String(DEFAULT_MAX_ITER)} iterations)
5. Collect agent reports
6. Aggregate deferred errors
7. MANDATORY: Spawn refactor-verifier agent
8. Check escalation triggers
9. Check threshold: Continue or advance?

Current Round: ${String(state.currentRound + 1)}
`;
    }
    case PHASE_3: {
      return `
PHASE 3: FINAL POLISH

Instructions:
1. Run: npm run lint -- --fix
2. Run: npm test
3. Run: npm run build
4. Verify all checks pass
5. If checks pass, campaign complete
`;
    }
    case PHASE_4: {
      return `
PHASE 4: DEAD CODE REMOVAL (OPT-IN)

Requirements:
- Phases 0-2 complete
- User opt-in flag: deadCodeRemoval=true

Instructions:
1. Spawn dead-code-remover agent
2. Agent will prompt for confirmation on each removal
3. Tests MUST pass after each removal
`;
    }
    default: {
      return `Unknown phase: ${String(phaseNum)}`;
    }
  }
}
async function getPreviousPhase(workflowId, _currentPhaseId) {
  try {
    const workflow = await getWorkflowById(workflowId);
    if (workflow?.phase_history === void 0 || workflow.phase_history.length === 0) {
      return void 0;
    }
    const lastHistoryEntry = workflow.phase_history[workflow.phase_history.length - 1];
    if (lastHistoryEntry === void 0) {
      return void 0;
    }
    const results = lastHistoryEntry.results;
    return {
      agent: "",
      // Not available in history, but not needed for count calculation
      agents_completed: results?.agents_completed ?? 0,
      agents_failed: results?.agents_failed ?? 0,
      agents_spawned: results?.agents_spawned ?? 0,
      id: lastHistoryEntry.phase_id,
      started_at: lastHistoryEntry.started_at,
      status: lastHistoryEntry.status === "completed" ? "completed" : lastHistoryEntry.status === "failed" ? "failed" : "completed"
    };
  } catch (error) {
    console.error("Failed to get previous phase:", error);
    return void 0;
  }
}
async function initializeMultiSpawnWorkflow(workflowId, workflowName, payload) {
  const sessionId = getSessionId();
  await ensureSessionFolder2(sessionId);
  const stateResult = await getWorkflowState();
  const state = stateResult ?? {
    sessionId,
    taskMakerSpawns: [],
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    v0Workflows: {}
  };
  state.v0Workflows = state.v0Workflows ?? {};
  state.v0Workflows[workflowId] = {
    components_generated: [],
    components_pending: payload.agents.map((a) => {
      const componentSpec = a.payload?.component_spec;
      return componentSpec?.name ?? `agent-${String(payload.agents.indexOf(a))}`;
    }),
    planner_output: payload,
    started_at: (/* @__PURE__ */ new Date()).toISOString(),
    status: "generating"
  };
  if (payload.integration_agent !== void 0) {
    state.v0Workflows[workflowId].integration_agent = payload.integration_agent;
  }
  state.timestamp = (/* @__PURE__ */ new Date()).toISOString();
  const stateFile = `${process.cwd()}/.claude/logs/session-${sessionId}/workflow-state.json`;
  const tempFile = `${stateFile}.${String(process.pid)}.tmp`;
  await fs5.writeFile(tempFile, JSON.stringify(state, void 0, JSON_INDENT_SPACES), "utf8");
  await fs5.rename(tempFile, stateFile);
  const agentIds = payload.agents.map(
    (agent, index) => `${agent.agent_name}-${workflowId}-${String(index)}`
  );
  await Promise.all(agentIds.map((agentId) => registerSpawnedAgent(workflowId, agentId)));
  const integrationAgentName = payload.integration_agent?.agent_name ?? "none";
  logHookActivity("agent-orchestrator", "PostToolUse", {
    agentCount: payload.agents.length,
    details: `Multi-spawn workflow initialized: ${workflowId}`,
    integrationAgent: integrationAgentName,
    status: "success",
    workflowName
  });
}
function isLoopingAgent(currentAgent, targetAgent) {
  if (currentAgent === void 0 || currentAgent === "" || targetAgent === void 0 || targetAgent === "") {
    return false;
  }
  const loopPairs = [
    ["task-reviewer", "task-maker"],
    ["task-maker", "task-reviewer"],
    ["code-reviewer", "frontend-engineer"],
    ["code-reviewer", "backend-engineer"],
    ["code-reviewer", "devops-engineer"],
    ["task-reviewer", "feature-planner"]
  ];
  return loopPairs.some(
    (pair) => pair[0] === currentAgent && pair[1] === targetAgent || pair[1] === currentAgent && pair[0] === targetAgent
  );
}
function isWorkflowPhasePayload(payload) {
  if (payload === null || typeof payload !== "object" || Array.isArray(payload)) {
    return false;
  }
  const p = payload;
  return typeof p.phase_id === "string" && typeof p.workflow_id === "string" && "count" in p;
}
async function processOrchestration(agentData) {
  const nextAction = agentData.nextAction;
  const currentAgent = agentData.agent_type ?? "unknown";
  if (nextAction === void 0 || nextAction.type === "none") {
    return {
      action: "terminal",
      message: `${currentAgent} agent completed - terminal behavior`
    };
  }
  if (nextAction.type === "spawn_agent" && isLoopingAgent(agentData.agent_type, nextAction.agent_name)) {
    const targetAgentName = nextAction.agent_name ?? "unknown";
    return {
      action: "blocked",
      message: `Blocked infinite loop: ${currentAgent} \u2192 ${targetAgentName}`,
      output: {
        hookSpecificOutput: {
          additionalContext: `\u26A0\uFE0F Blocked potential infinite loop: ${currentAgent} \u2192 ${targetAgentName}`,
          hookEventName: "AgentOrchestrator",
          systemMessage: "Agent spawning blocked to prevent infinite recursion"
        },
        permissionDecision: "allow",
        reason: "Infinite loop detection - blocked agent spawning"
      }
    };
  }
  if (nextAction.type === "spawn_agent" && nextAction.payload && isWorkflowPhasePayload(nextAction.payload)) {
    return processWorkflowPhaseSpawning(nextAction, agentData);
  }
  if (nextAction.type === "spawn_agent" && nextAction.agent_name === "research") {
    const researchSpec = nextAction.payload?.research_spec;
    if (researchSpec && typeof researchSpec === "object" && "topics" in researchSpec) {
      const topicsArray = researchSpec.topics;
      if (Array.isArray(topicsArray) && topicsArray.length === 0) {
        const payloadWorkflowId0 = nextAction.payload?.workflow_id;
        const metadataWorkflowId0 = agentData.metadata?.workflow_id;
        const workflowId0 = typeof payloadWorkflowId0 === "string" && payloadWorkflowId0.trim() ? payloadWorkflowId0.trim() : typeof metadataWorkflowId0 === "string" && metadataWorkflowId0.trim() ? metadataWorkflowId0.trim() : agentData.agent_id ?? `workflow-${String(Date.now())}`;
        try {
          await transitionToNextPhase(workflowId0, "planning", "feature-planner");
        } catch {
        }
        logHookActivity("agent-orchestrator", "PostToolUse", {
          details: "Research-planner found 0 topics - skipping research phase, transitioning to planning",
          status: "info",
          workflowId: workflowId0
        });
        const featureSummary0 = typeof researchSpec.feature_request_summary === "string" ? researchSpec.feature_request_summary : "Feature request";
        return {
          action: "spawn_agent",
          message: "Zero research topics - skipping to feature-planner",
          output: {
            hookSpecificOutput: {
              additionalContext: `\u{1F52C} Research-planner found no research topics needed.
Skipping research phase and proceeding directly to feature planning.

Spawn feature-planner now with the original request:
${featureSummary0}`,
              hookEventName: "AgentOrchestrator",
              systemMessage: `Research-planner found 0 topics. Spawn feature-planner directly with the original feature request. Pass workflow_id="${workflowId0}".`
            },
            permissionDecision: "allow",
            reason: "Zero research topics - skip to feature-planner",
            workflowId: workflowId0
          }
        };
      }
      if (Array.isArray(topicsArray) && topicsArray.length > 0) {
        const payloadWorkflowId = nextAction.payload?.workflow_id;
        const metadataWorkflowId = agentData.metadata?.workflow_id;
        const workflowId = typeof payloadWorkflowId === "string" && payloadWorkflowId.trim() ? payloadWorkflowId.trim() : typeof metadataWorkflowId === "string" && metadataWorkflowId.trim() ? metadataWorkflowId.trim() : agentData.agent_id ?? `workflow-${String(Date.now())}`;
        const featureSummary = typeof researchSpec.feature_request_summary === "string" ? researchSpec.feature_request_summary : "Feature request";
        const agentIds = [];
        const topicInstructions = topicsArray.map((topic, index) => {
          const topicObj = topic;
          const topicId = typeof topicObj.id === "string" ? topicObj.id : `topic-${String(index + 1)}`;
          const topicTitle = typeof topicObj.title === "string" ? topicObj.title : "Research topic";
          const topicPrompt = typeof topicObj.prompt === "string" ? topicObj.prompt : "No research prompt provided";
          const topicDepth = typeof topicObj.depth === "string" ? topicObj.depth : "detailed";
          const agentId = `research-${String(index).padStart(3, "0")}`;
          agentIds.push(agentId);
          const isFirstSpawn = index === 0;
          const runInBackground = shouldRunInBackground("research", isFirstSpawn);
          return `Research Topic ${toStr(index + 1)}/${toStr(topicsArray.length)}:
Topic ID: ${topicId}
Title: ${topicTitle}
Depth: ${topicDepth}
Agent ID: ${agentId}
Workflow ID: ${workflowId}
Execution Mode: ${runInBackground ? "BACKGROUND" : "FOREGROUND"}${isFirstSpawn ? " - First spawn must complete before checking others" : ""}

Research Brief:
${topicPrompt}
---`;
        }).join("\n\n");
        try {
          await transitionToNextPhase(workflowId, "research", "research");
        } catch (transitionError) {
          const msg = transitionError instanceof Error ? transitionError.message : String(transitionError);
          logHookActivity("agent-orchestrator", "PostToolUse", {
            details: `Phase transition research_planning\u2192research failed: ${msg}`,
            status: "warning",
            workflowId
          });
        }
        await Promise.all(
          topicsArray.map((topic, index) => {
            const topicObj = topic;
            const topicPrompt = typeof topicObj.prompt === "string" ? topicObj.prompt : "No research prompt provided";
            const agentId = agentIds[index] ?? `research-${String(index).padStart(3, "0")}`;
            return registerSpawnedAgent(workflowId, agentId, "research", topicPrompt);
          })
        );
        logHookActivity("agent-orchestrator", "PostToolUse", {
          details: `Research multi-spawn: ${String(topicsArray.length)} research agents (first foreground, rest background)`,
          featureSummary,
          firstAgentForeground: true,
          phaseTransition: "research_planning \u2192 research",
          status: "info",
          topicCount: topicsArray.length,
          workflowId
        });
        return {
          action: "spawn_agent_multi",
          message: `Research multi-spawn: ${toStr(topicsArray.length)} research agents from research-planner`,
          output: {
            hookSpecificOutput: {
              additionalContext: `\u{1F52C} Research orchestration: Spawning ${toStr(topicsArray.length)} research agents

CRITICAL: Spawn each research agent SEPARATELY with its specific research brief below.
DO NOT pass all topics to one research agent. Each topic needs its own agent spawn.

WORKFLOW CONTEXT: Pass workflow_id="${workflowId}" to each research agent for workflow tracking.
FEATURE CONTEXT: ${featureSummary}

NOTE: First research agent runs in FOREGROUND.
      Subsequent research agents run in BACKGROUND for parallel execution.

AFTER ALL RESEARCH COMPLETES: Collect all report paths from research agent outputs.
Then spawn feature-planner with the original request PLUS all research report paths.

${topicInstructions}`,
              hookEventName: "AgentOrchestrator",
              systemMessage: `Detected ${toStr(topicsArray.length)} research topics. Spawn ${toStr(topicsArray.length)} SEPARATE research agents, each with the research brief shown above. Pass workflow_id="${workflowId}" to each agent. First agent foreground, rest background. After all complete, spawn feature-planner with research context.`
            },
            permissionDecision: "allow",
            reason: `Research orchestration: research-planner \u2192 ${toStr(topicsArray.length)}x research`,
            workflowId
          }
        };
      }
    }
  }
  if (nextAction.type === "spawn_agent" && nextAction.agent_name === "task-maker") {
    const taskSpec = nextAction.payload?.task_spec;
    if (taskSpec && typeof taskSpec === "object" && "tasks" in taskSpec) {
      const tasksArray = taskSpec.tasks;
      if (Array.isArray(tasksArray) && tasksArray.length > 0) {
        const payloadWorkflowId = nextAction.payload?.workflow_id;
        const metadataWorkflowId = agentData.metadata?.workflow_id;
        const workflowId = typeof payloadWorkflowId === "string" && payloadWorkflowId.trim() ? payloadWorkflowId.trim() : typeof metadataWorkflowId === "string" && metadataWorkflowId.trim() ? metadataWorkflowId.trim() : agentData.agent_id ?? `workflow-${String(Date.now())}`;
        const agentIds = [];
        const taskInstructions = tasksArray.map((task, index) => {
          const taskObj = task;
          const backlogId = taskObj.backlog_task_id;
          const backlogIdStr = typeof backlogId === "string" || typeof backlogId === "number" ? String(backlogId) : "unknown";
          const fullReqs = taskObj.full_requirements;
          const fullReqsStr = typeof fullReqs === "string" ? fullReqs : fullReqs === void 0 ? "No requirements provided" : JSON.stringify(fullReqs);
          const agentId = `task-maker-${String(index).padStart(3, "0")}`;
          agentIds.push(agentId);
          const isFirstSpawn = index === 0;
          const runInBackground = shouldRunInBackground("task-maker", isFirstSpawn);
          return `Task ${toStr(index + 1)}/${toStr(tasksArray.length)}:
Pre-allocated ID: ${backlogIdStr}
Agent ID: ${agentId}
Workflow ID: ${workflowId}
Execution Mode: ${runInBackground ? "BACKGROUND" : "FOREGROUND"}${isFirstSpawn ? " - First spawn must complete to create task file" : ""}

Full Requirements:
${fullReqsStr}
---`;
        }).join("\n\n");
        await Promise.all(agentIds.map((agentId) => registerSpawnedAgent(workflowId, agentId)));
        logHookActivity("agent-orchestrator", "PostToolUse", {
          details: `Multi-task spawning: ${String(tasksArray.length)} task-maker agents (first foreground, rest background)`,
          firstAgentForeground: true,
          status: "info",
          taskCount: tasksArray.length,
          workflowId
        });
        return {
          action: "spawn_agent_multi",
          message: `Multi-task spawning: ${toStr(tasksArray.length)} task-maker agents from ${String(agentData.agent_type)}`,
          output: {
            hookSpecificOutput: {
              additionalContext: `\u{1F916} Multi-task orchestration: Spawning ${toStr(tasksArray.length)} task-maker agents

CRITICAL: Spawn each task-maker SEPARATELY with its pre-allocated ID shown below.
DO NOT pass all tasks to one task-maker. Each task needs its own agent spawn.

WORKFLOW CONTEXT: Pass workflow_id="${workflowId}" to each task-maker agent for workflow tracking.

NOTE: First task-maker runs in FOREGROUND to ensure task file creation.
      Subsequent task-makers run in BACKGROUND for parallel execution.

${taskInstructions}`,
              hookEventName: "AgentOrchestrator",
              systemMessage: `Detected ${toStr(tasksArray.length)} tasks. Spawn ${toStr(tasksArray.length)} SEPARATE task-maker agents, each with the pre-allocated ID shown above. Pass workflow_id="${workflowId}" to each agent. First agent foreground, rest background.`
            },
            permissionDecision: "allow",
            reason: `Multi-task orchestration: ${String(agentData.agent_type)} \u2192 ${toStr(tasksArray.length)}x task-maker`,
            workflowId
          }
        };
      }
    }
  }
  if (nextAction.type === "spawn_multiple") {
    const payload = nextAction.payload;
    if (payload === void 0 || !isValidSpawnMultiplePayload(payload)) {
      return {
        action: "error",
        message: "Invalid spawn_multiple payload structure - missing required fields or incorrect types",
        output: {
          hookSpecificOutput: {
            actualPayload: JSON.stringify(payload),
            expectedStructure: JSON.stringify({
              agents: [{ agent_name: "string", payload: "optional object" }],
              integration_agent: "optional { agent_name, payload }",
              workflow_context: "optional { workflow_id, workflow_name }"
            }),
            systemMessage: "ERROR: Invalid spawn_multiple payload"
          },
          permissionDecision: "deny"
        }
      };
    }
    const workflowIdFromContext = payload.workflow_context?.workflow_id;
    const workflowId = typeof workflowIdFromContext === "string" ? workflowIdFromContext : `multi-spawn-${String(Date.now())}`;
    const workflowNameFromContext = payload.workflow_context?.workflow_name;
    const workflowName = typeof workflowNameFromContext === "string" ? workflowNameFromContext : "Multi-Agent Workflow";
    try {
      await initializeMultiSpawnWorkflow(workflowId, workflowName, payload);
      const spawnInstructions = formatMultiSpawnInstructions(payload, workflowId);
      const integrationAgentName2 = payload.integration_agent?.agent_name ?? "none";
      logHookActivity("agent-orchestrator", "PostToolUse", {
        agentCount: payload.agents.length,
        details: `Multi-spawn workflow initialized: ${workflowId}`,
        integrationAgent: integrationAgentName2,
        status: "success"
      });
      return {
        action: "spawn_multiple",
        message: `Multi-spawn: ${toStr(payload.agents.length)} agents for workflow ${workflowId}`,
        output: {
          hookSpecificOutput: {
            additionalContext: `Workflow: ${workflowName}
Agents: ${toStr(payload.agents.length)}
Integration: ${integrationAgentName2}`,
            hookEventName: "AgentOrchestrator",
            systemMessage: spawnInstructions
          },
          permissionDecision: "allow",
          reason: `Multi-agent spawning for ${workflowName}`
        }
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logHookActivity("agent-orchestrator", "PostToolUse", {
        details: `Multi-spawn workflow initialization failed: ${errorMsg}`,
        error: errorMsg,
        status: "error"
      });
      return {
        action: "error",
        message: `Failed to initialize multi-spawn workflow: ${errorMsg}`,
        output: {
          hookSpecificOutput: {
            systemMessage: "ERROR: Multi-spawn workflow initialization failed"
          },
          permissionDecision: "deny"
        }
      };
    }
  }
  if (nextAction.type === "spawn_agent" && agentData.agent_type === "architecture" && nextAction.payload !== void 0 && "campaign" in nextAction.payload) {
    const campaignPayload = nextAction.payload.campaign;
    const phasesPayload = nextAction.payload.phases;
    if (phasesPayload === void 0 || phasesPayload.length === 0) {
      return {
        action: "error",
        message: "Campaign missing phases definition",
        output: {
          hookSpecificOutput: {
            additionalContext: "lint-resolution-planner must output phases array",
            systemMessage: "ERROR: Lint resolution campaign missing phases array"
          },
          permissionDecision: "allow"
        }
      };
    }
    const campaignState = {
      campaignId: campaignPayload.id,
      currentPhase: 0,
      currentRound: 0,
      deferredBacklog: [],
      escalationTriggers: {},
      phases: phasesPayload,
      specFilePath: campaignPayload.specFilePath,
      strategy: campaignPayload.strategy,
      totalErrors: campaignPayload.totalErrors
    };
    void writeToSessionLog("campaign-state", {
      campaignId: campaignState.campaignId,
      state: campaignState,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    const phase0Instructions = generatePhaseInstructions(campaignState, 0);
    return {
      action: "campaign_orchestration",
      message: `Lint resolution campaign initialized: ${campaignState.campaignId}`,
      output: {
        hookSpecificOutput: {
          additionalContext: phase0Instructions,
          hookEventName: "PostToolUse",
          systemMessage: `\u{1F527} LINT RESOLUTION CAMPAIGN STARTED

Campaign ID: ${campaignState.campaignId}
Strategy: ${campaignState.strategy}
Total Errors: ${toStr(campaignState.totalErrors)}
Spec: ${campaignState.specFilePath}

${phase0Instructions}`
        },
        permissionDecision: "allow",
        reason: "Campaign orchestration initialized"
      }
    };
  }
  if (nextAction.type === "spawn_agent") {
    const targetAgent = nextAction.agent_name ?? nextAction.agent_type ?? "unknown";
    const contextValue = nextAction.payload?.context;
    const contextStr = typeof contextValue === "string" ? contextValue : contextValue === void 0 ? "No context provided" : JSON.stringify(contextValue);
    const payloadStr = JSON.stringify(nextAction.payload ?? {});
    const workflowState = await getWorkflowState();
    const currentPhaseAgents = workflowState?.workflows?.[0]?.current_phase?.spawned_agent_ids ?? [];
    const isFirstTaskMakerSpawn = targetAgent === "task-maker" && currentPhaseAgents.length === 0;
    const runInBackground = shouldRunInBackground(targetAgent, isFirstTaskMakerSpawn);
    const toolInput = {
      description: `Spawning ${targetAgent} agent`,
      prompt: contextStr,
      run_in_background: runInBackground,
      subagent_type: targetAgent
    };
    logHookActivity("agent-orchestrator", "PostToolUse", {
      details: `Spawning ${targetAgent}: ${runInBackground ? "background" : "foreground"} (isFirstTaskMaker: ${String(isFirstTaskMakerSpawn)})`,
      runInBackground,
      status: "info",
      targetAgent
    });
    return {
      action: "spawn_agent",
      message: `Spawning ${targetAgent} agent from ${currentAgent}${runInBackground ? " (background)" : ""}`,
      output: {
        hookSpecificOutput: {
          additionalContext: `\u{1F916} Auto-spawning ${targetAgent} agent${runInBackground ? " in background" : ""} based on ${currentAgent} recommendation

Context: ${contextStr}`,
          hookEventName: "AgentOrchestrator",
          systemMessage: `Spawn ${targetAgent} agent with payload: ${payloadStr}`,
          toolInput
          // Include tool input for Task tool with run_in_background flag
        },
        permissionDecision: "allow",
        reason: `Agent orchestration: ${currentAgent} \u2192 ${targetAgent}${runInBackground ? " (background)" : ""}`
      }
    };
  }
  if (nextAction.type === "create_task") {
    const taskSpecStr = JSON.stringify(nextAction.payload?.task_spec ?? {});
    return {
      action: "create_task",
      message: `Creating task from ${currentAgent} agent`,
      output: {
        hookSpecificOutput: {
          additionalContext: `\u{1F4DD} Auto-creating task based on ${currentAgent} output

Task spec: ${taskSpecStr}`,
          hookEventName: "AgentOrchestrator",
          systemMessage: "Create task with auto-generated specification"
        },
        permissionDecision: "allow",
        reason: `Task creation orchestrated by ${currentAgent}`
      }
    };
  }
  if (nextAction.type === "update_task") {
    const taskIdValue = nextAction.payload?.task_id;
    const taskIdStr = typeof taskIdValue === "string" || typeof taskIdValue === "number" ? String(taskIdValue) : "unknown";
    return {
      action: "update_task",
      message: `Updating task from ${currentAgent} agent`,
      output: {
        hookSpecificOutput: {
          additionalContext: `\u{1F504} Auto-updating task based on ${currentAgent} output`,
          hookEventName: "AgentOrchestrator",
          systemMessage: `Update task: ${taskIdStr}`
        },
        permissionDecision: "allow",
        reason: `Task update orchestrated by ${currentAgent}`
      }
    };
  }
  if (nextAction.type === "complete_task") {
    const taskIdValue = nextAction.payload?.task_id;
    const taskIdStr = typeof taskIdValue === "string" || typeof taskIdValue === "number" ? String(taskIdValue) : "unknown";
    return {
      action: "complete_task",
      message: `Completing task from ${currentAgent} agent`,
      output: {
        hookSpecificOutput: {
          additionalContext: `\u2705 Auto-completing task based on ${currentAgent} completion`,
          hookEventName: "AgentOrchestrator",
          systemMessage: `Complete task: ${taskIdStr}`
        },
        permissionDecision: "allow",
        reason: `Task completion orchestrated by ${currentAgent}`
      }
    };
  }
  if (nextAction.type === "user_input") {
    const userQuestionValue = nextAction.payload?.user_question;
    const userQuestionStr = typeof userQuestionValue === "string" ? userQuestionValue : userQuestionValue === void 0 ? "No question provided" : JSON.stringify(userQuestionValue);
    const optionsValue = nextAction.payload?.options;
    const hasOptions = Array.isArray(optionsValue) && optionsValue.length > 0;
    let askUserInstruction = `\u{1F6D1} USER INPUT REQUIRED

The ${currentAgent} agent needs clarification before continuing.

**Question:** ${userQuestionStr}

---

**ACTION REQUIRED:** You MUST ask the user this question using the AskUserQuestion tool.

`;
    if (hasOptions) {
      const optionsJson = JSON.stringify(optionsValue, null, 2);
      askUserInstruction += `Use this structured format:
\`\`\`
AskUserQuestion({
  questions: [{
    question: "${userQuestionStr.replace(/"/g, '\\"')}",
    header: "Clarification Required",
    options: ${optionsJson}
  }]
})
\`\`\``;
    } else {
      askUserInstruction += `Since this is a freeform question, ask the user directly in your response.
Then wait for their answer before proceeding.

Example response:
"The ${currentAgent} agent needs to know: ${userQuestionStr}

Please provide your answer so I can continue with the workflow."`;
    }
    return {
      action: "user_input",
      message: `User input required from ${currentAgent} agent - use AskUserQuestion tool`,
      output: {
        hookSpecificOutput: {
          additionalContext: askUserInstruction,
          hookEventName: "AgentOrchestrator",
          systemMessage: `STOP and ask the user: "${userQuestionStr}". Use AskUserQuestion tool or ask directly. Do NOT proceed without user response.`,
          // Include the question details for potential tool invocation
          userInputRequired: {
            question: userQuestionStr,
            fromAgent: currentAgent,
            hasOptions,
            options: hasOptions ? optionsValue : void 0
          }
        },
        permissionDecision: "allow",
        reason: `User input requested by ${currentAgent} - MUST ask user before continuing`
      }
    };
  }
  if (nextAction.type === "cli_command") {
    const commandValue = nextAction.payload?.cli_command;
    const commandStr = typeof commandValue === "string" ? commandValue : "unknown";
    return {
      action: "cli_command",
      message: `Executing CLI command from ${currentAgent}: ${commandStr}`,
      output: {
        hookSpecificOutput: {
          additionalContext: `\u26A1 Auto-executing CLI command: ${commandStr}`,
          hookEventName: "AgentOrchestrator",
          systemMessage: `Execute: ${commandStr}`
        },
        permissionDecision: "allow",
        reason: `CLI command orchestrated by ${currentAgent}`
      }
    };
  }
  if (nextAction.type === "hook_action") {
    const hookDataStr = JSON.stringify(nextAction.payload?.hook_data ?? {});
    return {
      action: "hook_action",
      message: `Triggering hook action from ${currentAgent} agent`,
      output: {
        hookSpecificOutput: {
          additionalContext: `\u{1FA9D} Triggering hook action based on ${currentAgent} output`,
          hookEventName: "AgentOrchestrator",
          systemMessage: `Hook action: ${hookDataStr}`
        },
        permissionDecision: "allow",
        reason: `Hook action orchestrated by ${currentAgent}`
      }
    };
  }
  return {
    action: "unknown",
    message: `Unknown nextAction type: ${nextAction.type} from ${currentAgent}`
  };
}
async function shouldSkipOptionalPhase(phaseConfig) {
  try {
    const context = phaseConfig.context;
    if (context !== void 0 && typeof context.deployment_platform === "string" && context.deployment_platform.length > 0) {
      return false;
    }
    const workflowState = await getWorkflowState();
    const workflows = workflowState?.workflows;
    const matchingWorkflow = workflows?.find((w) => w.workflow_id === phaseConfig.workflow_id);
    const workflowContext = matchingWorkflow?.context;
    if (workflowContext?.deployment_platform !== void 0 && typeof workflowContext.deployment_platform === "string" && workflowContext.deployment_platform.length > 0) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
async function processWorkflowPhaseSpawning(nextAction, _agentData) {
  if (nextAction?.payload === void 0) {
    throw new OrchestrationError("Missing nextAction or payload", {
      category: ERROR_CATEGORIES.VALIDATION,
      code: ERROR_CODES.MISSING_REQUIRED_FIELD
    });
  }
  const phaseConfig = nextAction.payload;
  if (phaseConfig.optional === true) {
    const shouldSkip = await shouldSkipOptionalPhase(phaseConfig);
    if (shouldSkip) {
      await startPhase(
        phaseConfig.workflow_id,
        phaseConfig.phase_id,
        {
          agents_spawned: 0,
          started_at: (/* @__PURE__ */ new Date()).toISOString(),
          status: "completed"
        }
      );
      await writeToSessionLog("agent-orchestration", {
        event: "phase_skipped",
        phaseId: phaseConfig.phase_id,
        reason: "Deployment not configured in workflow context",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        workflowId: phaseConfig.workflow_id
      });
      return {
        action: "phase_skipped",
        message: `Skipped optional phase ${phaseConfig.phase_id} - deployment not configured`,
        output: {
          hookSpecificOutput: {
            additionalContext: `Skipped optional phase "${phaseConfig.phase_id}" because deployment is not configured in the workflow context.`,
            hookEventName: "AgentOrchestrator",
            systemMessage: `Phase ${phaseConfig.phase_id} skipped (optional, no deployment configured). Proceed to next phase.`
          },
          permissionDecision: "allow",
          reason: `Optional phase skipped: ${phaseConfig.phase_id}`
        }
      };
    }
  }
  if (phaseConfig.requires_user_confirmation === true) {
    const phaseDescription = phaseConfig.context?.description ?? `Phase "${phaseConfig.phase_id}"`;
    const estimatedCost = phaseConfig.context?.estimated_cost;
    const costWarning = estimatedCost !== void 0 ? `

**Estimated cost:** ${estimatedCost}` : "";
    await writeToSessionLog("agent-orchestration", {
      event: "user_confirmation_required",
      phaseId: phaseConfig.phase_id,
      reason: "Phase requires user confirmation before execution",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      workflowId: phaseConfig.workflow_id
    });
    return {
      action: "requires_confirmation",
      message: `Phase ${phaseConfig.phase_id} requires user confirmation before proceeding`,
      output: {
        hookSpecificOutput: {
          additionalContext: `**User Confirmation Required**

The workflow has reached a phase that requires your explicit approval:

**Phase:** ${phaseConfig.phase_id}
**Description:** ${phaseDescription}
**Agent:** ${phaseConfig.agent_name}${costWarning}

Please confirm you want to proceed with this phase. This action may involve real financial transactions.

To continue, reply with confirmation. To skip, reply "skip this phase".`,
          hookEventName: "AgentOrchestrator",
          systemMessage: `PAUSE: Phase "${phaseConfig.phase_id}" has requires_user_confirmation=true. Present the confirmation prompt to the user and WAIT for their response before spawning agents. Do NOT proceed automatically.`
        },
        permissionDecision: "allow",
        reason: `User confirmation required for phase: ${phaseConfig.phase_id}`
      }
    };
  }
  try {
    const spawnCount = await calculateSpawnCount(phaseConfig);
    await startPhase(
      phaseConfig.workflow_id,
      phaseConfig.phase_id,
      {
        agents_spawned: spawnCount,
        started_at: (/* @__PURE__ */ new Date()).toISOString(),
        status: "running"
      }
    );
    await writeToSessionLog("agent-orchestration", {
      agentName: phaseConfig.agent_name,
      event: "batch_spawn_initiated",
      phaseId: phaseConfig.phase_id,
      spawnCount,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      workflowId: phaseConfig.workflow_id
    });
    const instructions = formatBatchSpawnInstructions(spawnCount, phaseConfig);
    await writeToSessionLog("agent-orchestration", {
      agentName: phaseConfig.agent_name,
      event: "batch_spawn_completed",
      phaseId: phaseConfig.phase_id,
      spawnCount,
      status: "success",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      workflowId: phaseConfig.workflow_id
    });
    return {
      action: "workflow_phase_spawn",
      message: `Spawning ${toStr(spawnCount)} ${phaseConfig.agent_name} agents for phase ${phaseConfig.phase_id}`,
      output: {
        hookSpecificOutput: {
          additionalContext: `Workflow: ${phaseConfig.workflow_id}
Phase: ${phaseConfig.phase_id}
Agent count: ${toStr(spawnCount)}`,
          hookEventName: "AgentOrchestrator",
          systemMessage: instructions
        },
        permissionDecision: "allow",
        reason: `Workflow phase spawning: ${phaseConfig.phase_id}`
      }
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    await writeToSessionLog("agent-orchestration", {
      agentName: phaseConfig.agent_name,
      error: errorMsg,
      event: "batch_spawn_failed",
      phaseId: phaseConfig.phase_id,
      status: "error",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      workflowId: phaseConfig.workflow_id
    });
    throw error;
  }
}
function formatDependentSpawnInstructions(readyAgents) {
  if (readyAgents.length === 0) {
    return "";
  }
  const instructions = [
    "## Dependent Agents Ready to Spawn",
    "",
    `The following ${toStr(readyAgents.length)} agent(s) had their dependencies satisfied and should be spawned:`,
    ""
  ];
  for (const agent of readyAgents) {
    instructions.push(`### ${agent.agent_id}`);
    instructions.push(`- **Type:** ${agent.subagent_type}`);
    instructions.push(`- **Status:** Ready (dependencies satisfied)`);
    instructions.push("");
    instructions.push("```");
    instructions.push(`Task(subagent_type="${agent.subagent_type}", prompt="""${agent.prompt}${AGENT_PROMPT_SUFFIX}""", run_in_background=true)`);
    instructions.push("```");
    instructions.push("");
  }
  instructions.push("**Important:** Spawn all ready agents in parallel with `run_in_background=true`.");
  return instructions.join("\n");
}
async function checkAndSpawnDependents(completedAgentId, workflowId) {
  const sessionId = getSessionId();
  const stateFile = `${process.cwd()}/.claude/logs/session-${sessionId}/workflow-state.json`;
  let state;
  try {
    const stateContent = await fs5.readFile(stateFile, "utf8");
    state = JSON.parse(stateContent);
  } catch {
    return void 0;
  }
  const workflow = state.workflows?.find((w) => w.workflow_id === workflowId);
  if (!workflow?.current_phase) {
    if (!state.multiPhaseWorkflow?.current_phase) {
      return void 0;
    }
  }
  const currentPhase = workflow?.current_phase ?? state.multiPhaseWorkflow?.current_phase;
  if (!currentPhase) {
    return void 0;
  }
  const records = currentPhase.spawned_agent_records ?? [];
  const waitingAgents = records.filter(
    (r) => r.status === "waiting_for_dependencies" && r.blocked_by?.includes(completedAgentId)
  );
  if (waitingAgents.length === 0) {
    logHookActivity("agent-orchestrator", "PostToolUse", {
      completedAgent: completedAgentId,
      details: "No waiting agents depend on completed agent",
      status: "info"
    });
    return void 0;
  }
  const maxConcurrent = workflow?.max_concurrent_agents ?? state.multiPhaseWorkflow?.max_concurrent_agents ?? 5;
  const readyAgents = [];
  for (const agent of waitingAgents) {
    agent.blocked_by = agent.blocked_by?.filter((id) => id !== completedAgentId) ?? [];
    if (agent.blocked_by.length === 0) {
      const runningCount = records.filter((r) => r.status === "running").length;
      if (runningCount < maxConcurrent) {
        agent.status = "running";
        agent.spawned_at = (/* @__PURE__ */ new Date()).toISOString();
        readyAgents.push(agent);
      } else {
        logHookActivity("agent-orchestrator", "PostToolUse", {
          agentId: agent.agent_id,
          details: `Agent ready but max concurrent (${String(maxConcurrent)}) reached - queued`,
          runningCount,
          status: "info"
        });
      }
    }
  }
  const tempFile = `${stateFile}.${String(process.pid)}.tmp`;
  await fs5.writeFile(tempFile, JSON.stringify(state, void 0, JSON_INDENT_SPACES), "utf8");
  await fs5.rename(tempFile, stateFile);
  if (readyAgents.length === 0) {
    logHookActivity("agent-orchestrator", "PostToolUse", {
      completedAgent: completedAgentId,
      details: "Dependencies updated but no agents ready yet (still have blockers or max concurrent reached)",
      status: "info",
      waitingCount: waitingAgents.length
    });
    return void 0;
  }
  const spawnInstructions = formatDependentSpawnInstructions(readyAgents);
  logHookActivity("agent-orchestrator", "PostToolUse", {
    completedAgent: completedAgentId,
    details: `${String(readyAgents.length)} dependent agent(s) ready to spawn`,
    readyAgentIds: readyAgents.map((a) => a.agent_id),
    status: "success"
  });
  return { readyAgents, spawnInstructions };
}
async function markDependentsBlocked(failedAgentId, workflowId, reason) {
  const sessionId = getSessionId();
  const stateFile = `${process.cwd()}/.claude/logs/session-${sessionId}/workflow-state.json`;
  let state;
  try {
    const stateContent = await fs5.readFile(stateFile, "utf8");
    state = JSON.parse(stateContent);
  } catch {
    return;
  }
  const workflow = state.workflows?.find((w) => w.workflow_id === workflowId);
  const currentPhase = workflow?.current_phase ?? state.multiPhaseWorkflow?.current_phase;
  if (!currentPhase) {
    return;
  }
  const records = currentPhase.spawned_agent_records ?? [];
  let blockedCount = 0;
  for (const agent of records) {
    if (agent.blocked_by?.includes(failedAgentId)) {
      agent.status = "blocked";
      agent.failure_reason = `blocked_by_${failedAgentId}: ${reason}`;
      blockedCount++;
    }
  }
  if (blockedCount > 0) {
    const tempFile = `${stateFile}.${String(process.pid)}.tmp`;
    await fs5.writeFile(tempFile, JSON.stringify(state, void 0, JSON_INDENT_SPACES), "utf8");
    await fs5.rename(tempFile, stateFile);
    logHookActivity("agent-orchestrator", "PostToolUse", {
      blockedCount,
      failedAgent: failedAgentId,
      details: `${String(blockedCount)} dependent agent(s) blocked due to failure`,
      reason,
      status: "warning"
    });
  }
}
function mapFailureReason(reason) {
  const lowerReason = reason.toLowerCase();
  if (lowerReason.includes("timeout")) {
    return "timeout";
  }
  if (lowerReason.includes("rate") || lowerReason.includes("limit")) {
    return "rate_limit";
  }
  if (lowerReason.includes("cancel")) {
    return "cancelled";
  }
  return "error";
}
function validateAgentJSON(data) {
  try {
    const validationResult = agent_validator_default.validate(data);
    if (validationResult.validationTime > VALIDATION_TIME_WARNING_THRESHOLD) {
      logHookActivity("agent-orchestrator", "PostToolUse", {
        details: `Schema validation took ${String(validationResult.validationTime)}ms (target: <${String(VALIDATION_TIME_WARNING_THRESHOLD)}ms)`,
        status: "warning"
      });
    }
    if (validationResult.isFallback === true) {
      logHookActivity("agent-orchestrator", "PostToolUse", {
        details: "Used fallback validation - schema file unavailable",
        status: "warning"
      });
    }
    return {
      errors: validationResult.errors,
      isFallback: validationResult.isFallback ?? false,
      valid: validationResult.valid,
      validationTime: validationResult.validationTime
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logHookActivity("agent-orchestrator", "PostToolUse", {
      error: `Validation error: ${errorMessage}`,
      status: "error"
    });
    return {
      errors: [`Validation system error: ${errorMessage}`],
      isFallback: false,
      valid: false,
      validationTime: 0
    };
  }
}
async function findAgentByBackgroundTaskId(backgroundTaskId) {
  const state = await getWorkflowState();
  if (state === void 0 || state.workflows === void 0) {
    return void 0;
  }
  const workflows = state.workflows;
  for (const workflow of workflows) {
    const records = workflow.current_phase?.spawned_agent_records ?? [];
    const matchingAgent = records.find((r) => r.background_task_id === backgroundTaskId);
    if (matchingAgent !== void 0) {
      return {
        agent: matchingAgent,
        workflowId: workflow.workflow_id
      };
    }
  }
  return void 0;
}
async function handleBackgroundOutputTool(toolName, toolResult) {
  let taskOutput;
  if (typeof toolResult === "string") {
    try {
      taskOutput = JSON.parse(toolResult);
    } catch {
      taskOutput = parseBackgroundOutputText(toolResult);
    }
  } else if (typeof toolResult === "object" && toolResult !== null) {
    const outputStr = toolResult.output ?? "";
    try {
      taskOutput = JSON.parse(outputStr);
    } catch {
      taskOutput = parseBackgroundOutputText(outputStr);
    }
  } else {
    return;
  }
  const taskId = taskOutput.task_id;
  if (taskId === void 0 || taskId === "") {
    logHookActivity("agent-orchestrator", "PostToolUse", {
      details: `${toolName} result has no task_id - cannot match to agent`,
      status: "info",
      toolName
    });
    return;
  }
  const agentResult = await findAgentByBackgroundTaskId(taskId);
  if (agentResult === void 0) {
    logHookActivity("agent-orchestrator", "PostToolUse", {
      details: `No agent found with background_task_id: ${taskId}`,
      status: "info",
      taskId,
      toolName
    });
    return;
  }
  const { agent, workflowId } = agentResult;
  if (agent.status === "completed" || agent.status === "failed" || agent.status === "stale") {
    logHookActivity("agent-orchestrator", "PostToolUse", {
      agentId: agent.agent_id,
      currentStatus: agent.status,
      details: "Agent already in terminal state - skipping update",
      status: "info",
      taskId,
      toolName
    });
    return;
  }
  const status = taskOutput.status;
  const isCompleted = status === "completed";
  const isFailed = status === "failed" || status === "terminated";
  const isStillRunning = status === "running" || status === void 0;
  if (isStillRunning) {
    logHookActivity("agent-orchestrator", "PostToolUse", {
      agentId: agent.agent_id,
      details: "Background task still running",
      status: "info",
      taskId,
      toolName
    });
    return;
  }
  const newStatus = isCompleted ? "completed" : "failed";
  const failureReason = isFailed ? mapFailureReasonFromOutput(taskOutput.output) : void 0;
  await updateAgentStatus(workflowId, agent.agent_id, newStatus, failureReason);
  logHookActivity("agent-orchestrator", "PostToolUse", {
    agentId: agent.agent_id,
    details: `Background agent ${isCompleted ? "completed" : "failed"}`,
    failureReason: failureReason ?? void 0,
    newStatus,
    status: isCompleted ? "success" : "warning",
    taskId,
    toolName,
    workflowId
  });
  if (isCompleted) {
    const dependencyResult = await checkAndSpawnDependents(agent.agent_id, workflowId);
    if (dependencyResult !== void 0) {
      logHookActivity("agent-orchestrator", "PostToolUse", {
        agentId: agent.agent_id,
        details: `${String(dependencyResult.readyAgents.length)} dependent agent(s) ready to spawn`,
        readyAgentIds: dependencyResult.readyAgents.map((a) => a.agent_id),
        status: "success"
      });
    }
  } else {
    await markDependentsBlocked(
      agent.agent_id,
      workflowId,
      failureReason ?? "Unknown failure"
    );
  }
}
function parseBackgroundOutputText(text) {
  const result = {};
  const taskIdPatterns = [
    /task[_\s-]?id[:\s]+([a-zA-Z0-9_-]+)/i,
    /Task\s+([a-zA-Z0-9_-]+)\s+(?:completed|failed|running)/i,
    /ID:\s*([a-zA-Z0-9_-]+)/i,
    /background.*?([a-z]+-\d+)/i
  ];
  for (const pattern of taskIdPatterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      result.task_id = match[1];
      break;
    }
  }
  const lowerText = text.toLowerCase();
  if (lowerText.includes("<status>completed</status>") || lowerText.includes("status: completed")) {
    result.status = "completed";
  } else if (lowerText.includes("<status>failed</status>") || lowerText.includes("status: failed")) {
    result.status = "failed";
  } else if (lowerText.includes("<status>running</status>") || lowerText.includes("status: running")) {
    result.status = "running";
  } else if (lowerText.includes("terminated") || lowerText.includes("killed")) {
    result.status = "terminated";
  } else if (lowerText.includes("completed successfully") || lowerText.includes("task completed")) {
    result.status = "completed";
  } else if (lowerText.includes("error") || lowerText.includes("failed")) {
    result.status = "failed";
  }
  result.output = text;
  return result;
}
function mapFailureReasonFromOutput(output) {
  if (output === void 0) {
    return "error";
  }
  const lowerOutput = output.toLowerCase();
  if (lowerOutput.includes("timeout") || lowerOutput.includes("timed out")) {
    return "timeout";
  }
  if (lowerOutput.includes("rate limit") || lowerOutput.includes("rate_limit") || lowerOutput.includes("too many requests")) {
    return "rate_limit";
  }
  if (lowerOutput.includes("cancel") || lowerOutput.includes("abort") || lowerOutput.includes("terminated")) {
    return "cancelled";
  }
  return "error";
}
async function checkForStuckAgents() {
  const state = await getWorkflowState();
  if (state === void 0 || state.workflows === void 0) {
    return;
  }
  const timeoutMs = Math.max(DEFAULT_AGENT_TIMEOUT_MS, MIN_AGENT_TIMEOUT_MS);
  const now = Date.now();
  const workflows = state.workflows;
  for (const workflow of workflows) {
    const records = workflow.current_phase?.spawned_agent_records ?? [];
    for (const agent of records) {
      if (agent.status !== "running") {
        continue;
      }
      const spawnedAt = new Date(agent.spawned_at).getTime();
      const runningDuration = now - spawnedAt;
      if (runningDuration > timeoutMs) {
        logHookActivity("agent-orchestrator", "PostToolUse", {
          agentId: agent.agent_id,
          details: `Agent timed out after ${String(Math.round(runningDuration / 6e4))} minutes`,
          runningDuration,
          status: "warning",
          timeoutMs,
          workflowId: workflow.workflow_id
        });
        await updateAgentStatus(
          workflow.workflow_id,
          agent.agent_id,
          "failed",
          "timeout"
        );
        await markDependentsBlocked(
          agent.agent_id,
          workflow.workflow_id,
          `Timeout after ${String(Math.round(runningDuration / 6e4))} minutes`
        );
      }
    }
  }
}
export {
  aggregateDeferredErrors,
  checkEscalationTriggers,
  enforceRefactorVerifier,
  findRetryReadyItems,
  formatRoundSummary,
  handleVerificationFailure
};
