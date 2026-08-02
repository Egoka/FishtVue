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

// src/templates/.claude/hooks/orchestration/agent-context-writer.ts
init_path_resolver();
import fs4 from "node:fs/promises";
import { readFileSync as readFileSync2, existsSync as existsSync3 } from "node:fs";
import path6 from "node:path";

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
import { openSync as openSync2, writeSync, closeSync as closeSync2, constants as constants2, mkdirSync as mkdirSync2, existsSync as existsSync2 } from "node:fs";
import path4 from "node:path";
function writeEventAtomic(event) {
  const eventsPath = resolveProjectPath(".claude", "logs", "events.jsonl");
  const dir = path4.dirname(eventsPath);
  if (!existsSync2(dir)) {
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
var writeEvent = writeEventAtomic;

// src/templates/.claude/hooks/core/agent-state-manager.ts
import fs3 from "node:fs/promises";
import path5 from "node:path";
var AgentStateManager = class {
  static STATE_DIR = ".claude/logs";
  /**
   * Get state file path for specific agent/tool invocation
   */
  static getStatePath(sessionId, toolUseId) {
    return path5.join(
      process.cwd(),
      this.STATE_DIR,
      `session-${sessionId}`,
      `agent-state-${toolUseId}.json`
    );
  }
  /**
   * Get active agent state file path for a session
   */
  static getActiveAgentPath(sessionId) {
    return path5.join(
      process.cwd(),
      this.STATE_DIR,
      `active-agent-${sessionId}.json`
    );
  }
  /**
   * Read agent state for specific tool invocation
   */
  static async readAgentState(sessionId, toolUseId, _agentType) {
    const statePath = this.getStatePath(sessionId, toolUseId);
    try {
      await fs3.access(statePath, fs3.constants.R_OK);
      const content = await fs3.readFile(statePath, "utf8");
      const state = JSON.parse(content);
      const stateTime = new Date(state.timestamp).getTime();
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1e3;
      if (now - stateTime > fiveMinutes) {
        return { agent: void 0, expectedSkills: [] };
      }
      return {
        agent: state.agent,
        expectedSkills: state.expectedSkills ?? []
      };
    } catch {
      return { agent: void 0, expectedSkills: [] };
    }
  }
  /**
   * Read active agent state for a session
   * Used by skill tracker to detect agent context
   */
  static async readActiveAgent(sessionId) {
    const statePath = this.getActiveAgentPath(sessionId);
    try {
      await fs3.access(statePath, fs3.constants.R_OK);
      const content = await fs3.readFile(statePath, "utf8");
      const state = JSON.parse(content);
      const stateTime = new Date(state.timestamp).getTime();
      const now = Date.now();
      const thirtyMinutes = 30 * 60 * 1e3;
      if (now - stateTime > thirtyMinutes) {
        return { agent: void 0, expectedSkills: [] };
      }
      return {
        agent: state.agent,
        expectedSkills: state.expectedSkills
      };
    } catch {
      return { agent: void 0, expectedSkills: [] };
    }
  }
  /**
   * Write agent state for specific tool invocation
   * Creates: .claude/logs/session-{sessionId}/agent-state-{toolUseId}.json
   */
  static async writeAgentState(sessionId, toolUseId, agent, expectedSkills, agentType) {
    const stateDir = path5.join(process.cwd(), this.STATE_DIR);
    const sessionDir = path5.join(stateDir, `session-${sessionId}`);
    await fs3.mkdir(sessionDir, { recursive: true });
    const statePath = this.getStatePath(sessionId, toolUseId);
    const state = {
      agent,
      agentType,
      expectedSkills: expectedSkills ?? [],
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    await fs3.writeFile(statePath, JSON.stringify(state, void 0, 2), "utf8");
  }
  /**
   * Write active agent state for a session
   * Called when an agent is spawned to track the current agent context
   * Creates: .claude/logs/active-agent-{sessionId}.json
   */
  static async writeActiveAgent(sessionId, agent, expectedSkills, toolUseId) {
    const stateDir = path5.join(process.cwd(), this.STATE_DIR);
    await fs3.mkdir(stateDir, { recursive: true });
    const statePath = this.getActiveAgentPath(sessionId);
    const state = {
      agent,
      expectedSkills,
      toolUseId,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    await fs3.writeFile(statePath, JSON.stringify(state, void 0, 2), "utf8");
  }
  /**
   * Clear active agent state for a session
   * Called when an agent completes
   */
  static async clearActiveAgent(sessionId) {
    const statePath = this.getActiveAgentPath(sessionId);
    try {
      await fs3.unlink(statePath);
    } catch {
    }
  }
  /**
   * Delete agent state file (for cleanup)
   */
  static async deleteAgentState(sessionId, toolUseId) {
    const statePath = this.getStatePath(sessionId, toolUseId);
    try {
      await fs3.unlink(statePath);
    } catch {
    }
  }
};

// src/templates/.claude/hooks/orchestration/agent-context-writer.ts
var PROMPT_SNIPPET_MAX = 200;
function getGlobalAgentContextPath() {
  return resolveProjectPath(".claude", "agent-context.json");
}
async function writeAgentContext(context) {
  const contextPath = getGlobalAgentContextPath();
  const tempFile = `${contextPath}.${String(process.pid)}.tmp`;
  const JSON_INDENT = 2;
  await fs4.writeFile(tempFile, JSON.stringify(context, null, JSON_INDENT), "utf8");
  await fs4.rename(tempFile, contextPath);
}
function parseFrontmatterSkills(agentType) {
  try {
    const projectPath = path6.resolve(".");
    const agentFilePath = path6.join(projectPath, ".claude", "agents", `${agentType}.md`);
    if (!existsSync3(agentFilePath)) {
      return [];
    }
    const content = readFileSync2(agentFilePath, "utf8");
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) {
      return [];
    }
    const frontmatter = frontmatterMatch[1];
    const skillsMatch = frontmatter.match(/^skills:\s*(.+)$/m);
    if (!skillsMatch) {
      return [];
    }
    return skillsMatch[1].split(",").map((s) => s.trim()).filter((s) => s.length > 0);
  } catch {
    return [];
  }
}
function outputAllow() {
  console.log(JSON.stringify({}));
}
function exitSuccess() {
  process.exit(0);
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
      const toolInput = event.tool_input ?? event.toolInput ?? {};
      if (toolName !== "Task") {
        outputAllow();
        exitSuccess();
        return;
      }
      const subagentType = toolInput.subagent_type;
      if (!subagentType || typeof subagentType !== "string") {
        logHookActivity("agent-context-writer", "PreToolUse", {
          details: "Task tool called without subagent_type, skipping context write",
          status: "success"
        });
        outputAllow();
        exitSuccess();
        return;
      }
      const promptSnippet = typeof toolInput.prompt === "string" ? toolInput.prompt.slice(0, PROMPT_SNIPPET_MAX) : "";
      const context = {
        agentName: subagentType,
        parentPid: process.ppid,
        sessionId: getSessionId(),
        startedAt: (/* @__PURE__ */ new Date()).toISOString(),
        promptSnippet
      };
      await writeAgentContext(context);
      const eventSessionId = getSessionId();
      const expectedSkills = parseFrontmatterSkills(subagentType);
      try {
        await AgentStateManager.writeActiveAgent(
          eventSessionId,
          subagentType,
          expectedSkills,
          "pretooluse"
        );
      } catch (stateError) {
        const stateErrorMsg = stateError instanceof Error ? stateError.message : String(stateError);
        console.error("[agent-context-writer] Failed to write active agent state:", stateErrorMsg);
      }
      try {
        writeEvent({
          ts: context.startedAt,
          type: "agent_invocation",
          session: eventSessionId,
          agent: subagentType
        });
      } catch (eventError) {
        const eventErrorMsg = eventError instanceof Error ? eventError.message : String(eventError);
        console.error("[agent-context-writer] Failed to write agent_invocation event:", eventErrorMsg);
      }
      logHookActivity("agent-context-writer", "PreToolUse", {
        details: `Wrote agent context for ${subagentType}`,
        status: "success"
      });
      outputAllow();
      exitSuccess();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logHookActivity("agent-context-writer", "PreToolUse", {
        error: errorMessage,
        status: "error"
      });
      console.error("Agent context writer hook error:", errorMessage);
      outputAllow();
      exitSuccess();
    }
  })();
});
