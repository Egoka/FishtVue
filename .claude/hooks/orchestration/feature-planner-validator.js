#!/usr/bin/env node
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
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
function getStableAncestorPid() {
  const startPid = process.ppid || process.pid;
  let currentPid = startPid;
  const maxDepth = 5;
  for (let depth = 0; depth < maxDepth && currentPid > 1; depth++) {
    try {
      const cmdline = readFileSync(`/proc/${currentPid}/cmdline`, "utf-8");
      const command = cmdline.split("\0")[0] ?? "";
      if (command === "claude" || command.endsWith("/claude")) {
        return currentPid;
      }
    } catch {
    }
    const parentPid = getParentPid(currentPid);
    if (parentPid === void 0 || parentPid <= 1) break;
    currentPid = parentPid;
  }
  const grandparentPid = getParentPid(startPid);
  if (grandparentPid !== void 0 && grandparentPid > 1) {
    return grandparentPid;
  }
  return startPid;
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

// src/templates/.claude/hooks/core/workflow-state.ts
var workflow_state_exports = {};
__export(workflow_state_exports, {
  IMPLEMENTATION_AGENT_TYPES: () => IMPLEMENTATION_AGENT_TYPES,
  addToDependencyGraph: () => addToDependencyGraph,
  canSpawnMore: () => canSpawnMore,
  clearActiveWorkflowPointer: () => clearActiveWorkflowPointer,
  clearAllActiveWorkflowPointers: () => clearAllActiveWorkflowPointers,
  clearWorkflowState: () => clearWorkflowState,
  ensureSessionFolder: () => ensureSessionFolder2,
  getActiveWorkflowPhase: () => getActiveWorkflowPhase,
  getActiveWorkflowPointer: () => getActiveWorkflowPointer,
  getAllActiveWorkflowPointers: () => getAllActiveWorkflowPointers,
  getDependentsOf: () => getDependentsOf,
  getDurableWorkflowPath: () => getDurableWorkflowPath,
  getDurableWorkflowsDir: () => getDurableWorkflowsDir,
  getFailedAgents: () => getFailedAgents,
  getFeaturePlannerState: () => getFeaturePlannerState,
  getLegacyPointerPath: () => getLegacyPointerPath,
  getNextQueuedSpawn: () => getNextQueuedSpawn,
  getQueueLength: () => getQueueLength,
  getReadyToSpawn: () => getReadyToSpawn,
  getRunningAgentCount: () => getRunningAgentCount,
  getSessionId: () => getSessionId,
  getTaskMakerProgress: () => getTaskMakerProgress,
  getWorkflowById: () => getWorkflowById,
  getWorkflowPointerPath: () => getWorkflowPointerPath,
  getWorkflowState: () => getWorkflowState,
  hasCircularDependency: () => hasCircularDependency,
  isFeaturePlannerWorkflowActive: () => isFeaturePlannerWorkflowActive,
  isPhaseComplete: () => isPhaseComplete,
  isWorkflowPointerStale: () => isWorkflowPointerStale,
  loadDurableWorkflowState: () => loadDurableWorkflowState,
  markAgentBlocked: () => markAgentBlocked,
  markPhaseComplete: () => markPhaseComplete,
  migrateLegacyPointer: () => migrateLegacyPointer,
  queueAgentSpawn: () => queueAgentSpawn,
  recordTaskMakerSpawn: () => recordTaskMakerSpawn,
  registerSpawnedAgent: () => registerSpawnedAgent,
  removeDurableWorkflowState: () => removeDurableWorkflowState,
  removeFromQueue: () => removeFromQueue,
  removeWorkflow: () => removeWorkflow,
  saveDurableWorkflowState: () => saveDurableWorkflowState,
  setActiveWorkflowPointer: () => setActiveWorkflowPointer,
  setFeaturePlannerOutput: () => setFeaturePlannerOutput,
  setWorkflowStatus: () => setWorkflowStatus,
  startPhase: () => startPhase,
  transitionToNextPhase: () => transitionToNextPhase,
  transitionWorkflowPhase: () => transitionWorkflowPhase,
  updateAgentStatus: () => updateAgentStatus,
  updatePhaseCompletion: () => updatePhaseCompletion,
  updateWorkflowState: () => updateWorkflowState
});
import crypto from "node:crypto";
import fs3 from "node:fs/promises";
import fsSync2 from "node:fs";
import path4 from "node:path";
function getDurableWorkflowsDir() {
  return resolveProjectPath(".claude", DURABLE_WORKFLOWS_DIR, DURABLE_ACTIVE_DIR);
}
function getDurableWorkflowPath(workflowId) {
  return path4.join(getDurableWorkflowsDir(), `${workflowId}.json`);
}
function getWorkflowPointerPath(workflowId) {
  return path4.join(getDurableWorkflowsDir(), `${POINTER_FILE_PREFIX}${workflowId}${POINTER_FILE_SUFFIX}`);
}
function getLegacyPointerPath() {
  return path4.join(getDurableWorkflowsDir(), LEGACY_POINTER_FILENAME);
}
function migrateLegacyPointer() {
  const legacyPath = getLegacyPointerPath();
  if (!fsSync2.existsSync(legacyPath)) return;
  try {
    const raw = fsSync2.readFileSync(legacyPath, "utf-8");
    const pointer = JSON.parse(raw);
    const newPath = getWorkflowPointerPath(pointer.workflow_id);
    if (!fsSync2.existsSync(newPath)) {
      fsSync2.writeFileSync(newPath, JSON.stringify(pointer, void 0, JSON_INDENT), "utf-8");
    }
    fsSync2.unlinkSync(legacyPath);
  } catch {
  }
}
function ensureDurableDir() {
  const dir = getDurableWorkflowsDir();
  if (!fsSync2.existsSync(dir)) {
    fsSync2.mkdirSync(dir, { recursive: true });
  }
}
function getActiveWorkflowPointer(workflowId) {
  migrateLegacyPointer();
  const pointerPath = getWorkflowPointerPath(workflowId);
  if (!fsSync2.existsSync(pointerPath)) return null;
  try {
    const raw = fsSync2.readFileSync(pointerPath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function getAllActiveWorkflowPointers() {
  migrateLegacyPointer();
  const dir = getDurableWorkflowsDir();
  if (!fsSync2.existsSync(dir)) return [];
  try {
    const files = fsSync2.readdirSync(dir);
    const pointers = [];
    for (const file of files) {
      if (file.startsWith(POINTER_FILE_PREFIX) && file.endsWith(POINTER_FILE_SUFFIX)) {
        try {
          const raw = fsSync2.readFileSync(path4.join(dir, file), "utf-8");
          pointers.push(JSON.parse(raw));
        } catch {
        }
      }
    }
    return pointers;
  } catch {
    return [];
  }
}
function setActiveWorkflowPointer(pointer) {
  ensureDurableDir();
  const pointerPath = getWorkflowPointerPath(pointer.workflow_id);
  const tempFile = `${pointerPath}.${String(process.pid)}.tmp`;
  try {
    fsSync2.writeFileSync(tempFile, JSON.stringify(pointer, void 0, JSON_INDENT), "utf-8");
    fsSync2.renameSync(tempFile, pointerPath);
  } catch (error) {
    console.error("[workflow-state] Failed to set workflow pointer:", error);
    try {
      fsSync2.unlinkSync(tempFile);
    } catch {
    }
  }
}
function clearActiveWorkflowPointer(workflowId) {
  const pointerPath = getWorkflowPointerPath(workflowId);
  try {
    if (fsSync2.existsSync(pointerPath)) {
      fsSync2.unlinkSync(pointerPath);
    }
  } catch (error) {
    console.error("[workflow-state] Failed to clear workflow pointer:", error);
  }
}
function clearAllActiveWorkflowPointers() {
  const dir = getDurableWorkflowsDir();
  if (!fsSync2.existsSync(dir)) return;
  try {
    const files = fsSync2.readdirSync(dir);
    for (const file of files) {
      if (file.startsWith(POINTER_FILE_PREFIX) && file.endsWith(POINTER_FILE_SUFFIX) || file === LEGACY_POINTER_FILENAME) {
        try {
          fsSync2.unlinkSync(path4.join(dir, file));
        } catch {
        }
      }
    }
  } catch (error) {
    console.error("[workflow-state] Failed to clear all workflow pointers:", error);
  }
}
function isWorkflowPointerStale(pointer) {
  try {
    process.kill(pointer.pid, 0);
    return false;
  } catch {
  }
  const FRESHNESS_TTL_MS = 10 * 60 * 1e3;
  try {
    const statePath = getDurableWorkflowPath(pointer.workflow_id);
    const stat = fsSync2.statSync(statePath);
    const age = Date.now() - stat.mtimeMs;
    if (age < FRESHNESS_TTL_MS) {
      return false;
    }
  } catch {
  }
  return true;
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
function loadDurableWorkflowState(workflowId) {
  const statePath = getDurableWorkflowPath(workflowId);
  if (!fsSync2.existsSync(statePath)) return null;
  try {
    const raw = fsSync2.readFileSync(statePath, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    console.error("[workflow-state] Failed to load durable workflow state:", error);
    return null;
  }
}
function removeDurableWorkflowState(workflowId) {
  const statePath = getDurableWorkflowPath(workflowId);
  try {
    if (fsSync2.existsSync(statePath)) {
      fsSync2.unlinkSync(statePath);
    }
  } catch (error) {
    console.error("[workflow-state] Failed to remove durable workflow state:", error);
  }
}
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
    await fs3.unlink(stateFile);
  } catch (error) {
    if (error instanceof Error && isNodeError(error) && error.code !== "ENOENT") {
      console.error("Failed to clear workflow state:", error);
    }
  }
}
async function ensureSessionFolder2(sessionId) {
  const sessionDir = resolveProjectPath(".claude", "logs", `session-${sessionId}`);
  try {
    await fs3.mkdir(sessionDir, { recursive: true });
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
async function getTaskMakerProgress() {
  const sessionId = getSessionId();
  const stateFile = getWorkflowStateFile(sessionId);
  try {
    const content = await fs3.readFile(stateFile, "utf8");
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
async function isFeaturePlannerWorkflowActive() {
  const plannerState = await getFeaturePlannerState();
  if (plannerState === void 0) {
    return false;
  }
  return plannerState.status !== "implementation_complete";
}
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
async function markPhaseComplete(workflowId, finalStatus, sessionId) {
  const resolvedSessionId = sessionId ?? getSessionId();
  const stateFile = getWorkflowStateFile(resolvedSessionId);
  const INDENT_SPACES = 2;
  const DEFAULT_ITERATION = 1;
  try {
    const content = await fs3.readFile(stateFile, "utf8");
    const state = JSON.parse(content);
    if (state.workflows === void 0) {
      console.warn(`No workflows in state for session ${resolvedSessionId}`);
      return;
    }
    const workflowIndex = state.workflows.findIndex((w) => w.workflow_id === workflowId);
    if (workflowIndex === -1) {
      console.warn(`Workflow ${workflowId} not found in session ${resolvedSessionId}`);
      return;
    }
    const workflow = state.workflows[workflowIndex];
    if (workflow === void 0) {
      console.warn(`Workflow at index ${String(workflowIndex)} is undefined`);
      return;
    }
    workflow.current_phase.status = finalStatus;
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
      status: finalStatus
    };
    workflow.phase_history.push(historyEntry);
    state.timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const tempFile = `${stateFile}.${String(process.pid)}.tmp`;
    await fs3.writeFile(tempFile, JSON.stringify(state, void 0, INDENT_SPACES), "utf8");
    await fs3.rename(tempFile, stateFile);
  } catch (error) {
    console.error("Failed to mark phase complete:", error);
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
async function getFailedAgents(workflowId, maxRetries = DEFAULT_MAX_RETRIES) {
  const state = await getWorkflowState();
  if (state === void 0 || state.workflows === void 0) {
    return [];
  }
  const workflow = state.workflows.find((w) => w.workflow_id === workflowId);
  if (workflow === void 0) {
    return [];
  }
  if (!workflow.current_phase.spawned_agent_records) {
    return [];
  }
  return workflow.current_phase.spawned_agent_records.filter(
    (record) => (record.status === "failed" || record.status === "stale") && record.retry_count < maxRetries
  );
}
async function addToDependencyGraph(agentId, dependsOn) {
  const state = await getWorkflowState();
  if (state === void 0) {
    console.error("[workflow-state] Cannot add to dependency graph: no workflow state");
    return;
  }
  if (state.dependency_graph === void 0) {
    state.dependency_graph = {};
  }
  state.dependency_graph[agentId] = [...dependsOn];
  for (const dep of dependsOn) {
    if (state.dependency_graph[dep] === void 0) {
      state.dependency_graph[dep] = [];
    }
  }
  await saveWorkflowState(state);
}
async function hasCircularDependency(agentId, newDeps) {
  const state = await getWorkflowState();
  if (state === void 0) {
    return false;
  }
  const graph = { ...state.dependency_graph ?? {} };
  const existingDeps = graph[agentId] ?? [];
  graph[agentId] = [.../* @__PURE__ */ new Set([...existingDeps, ...newDeps])];
  for (const dep of newDeps) {
    if (graph[dep] === void 0) {
      graph[dep] = [];
    }
  }
  const allNodes = /* @__PURE__ */ new Set();
  for (const node of Object.keys(graph)) {
    allNodes.add(node);
    for (const dep of graph[node] ?? []) {
      allNodes.add(dep);
    }
  }
  const dependentCount = {};
  for (const node of allNodes) {
    dependentCount[node] = 0;
  }
  for (const [_dependent, deps] of Object.entries(graph)) {
    for (const dep of deps) {
      dependentCount[dep] = (dependentCount[dep] ?? 0) + 1;
    }
  }
  const queue = [];
  for (const node of allNodes) {
    if ((dependentCount[node] ?? 0) === 0) {
      queue.push(node);
    }
  }
  let visitedCount = 0;
  while (queue.length > 0) {
    const current = queue.shift();
    visitedCount++;
    for (const dep of graph[current] ?? []) {
      dependentCount[dep] = (dependentCount[dep] ?? 1) - 1;
      if (dependentCount[dep] === 0) {
        queue.push(dep);
      }
    }
  }
  return visitedCount < allNodes.size;
}
async function getReadyToSpawn(workflowId) {
  const state = await getWorkflowState();
  if (state === void 0 || state.workflows === void 0) {
    return [];
  }
  const workflow = state.workflows.find((w) => w.workflow_id === workflowId);
  if (workflow === void 0) {
    return [];
  }
  const records = workflow.current_phase.spawned_agent_records ?? [];
  const depGraph = state.dependency_graph ?? {};
  const readyAgents = [];
  for (const record of records) {
    if (record.status !== "waiting_for_dependencies") {
      continue;
    }
    const deps = depGraph[record.agent_id] ?? record.depends_on ?? [];
    const allDepsCompleted = deps.every((depId) => {
      const depRecord = records.find((r) => r.agent_id === depId);
      return depRecord?.status === "completed";
    });
    if (allDepsCompleted) {
      readyAgents.push(record.agent_id);
    }
  }
  return readyAgents;
}
async function getDependentsOf(agentId) {
  const state = await getWorkflowState();
  if (state === void 0) {
    return [];
  }
  const graph = state.dependency_graph ?? {};
  const reverseGraph = {};
  for (const [dependent, deps] of Object.entries(graph)) {
    for (const dep of deps) {
      if (reverseGraph[dep] === void 0) {
        reverseGraph[dep] = [];
      }
      reverseGraph[dep].push(dependent);
    }
  }
  const visited = /* @__PURE__ */ new Set();
  const added = /* @__PURE__ */ new Set();
  const queue = [agentId];
  const dependents = [];
  while (queue.length > 0) {
    const current = queue.shift();
    if (visited.has(current)) {
      continue;
    }
    visited.add(current);
    const directDependents = reverseGraph[current] ?? [];
    for (const dependent of directDependents) {
      if (!visited.has(dependent)) {
        queue.push(dependent);
        if (!added.has(dependent)) {
          dependents.push(dependent);
          added.add(dependent);
        }
      }
    }
  }
  return dependents;
}
async function markAgentBlocked(workflowId, agentId, blockedBy) {
  const state = await getWorkflowState();
  if (state === void 0 || state.workflows === void 0) {
    console.error("[workflow-state] Cannot mark agent blocked: no workflow state");
    return false;
  }
  const workflow = state.workflows.find((w) => w.workflow_id === workflowId);
  if (workflow === void 0) {
    console.error(`[workflow-state] Cannot mark agent blocked: workflow ${workflowId} not found`);
    return false;
  }
  if (!workflow.current_phase.spawned_agent_records) {
    console.error("[workflow-state] Cannot mark agent blocked: no spawned_agent_records");
    return false;
  }
  const recordIndex = workflow.current_phase.spawned_agent_records.findIndex(
    (r) => r.agent_id === agentId
  );
  if (recordIndex === -1) {
    console.error(`[workflow-state] Cannot mark agent blocked: agent ${agentId} not found`);
    return false;
  }
  const record = workflow.current_phase.spawned_agent_records[recordIndex];
  if (record === void 0) {
    return false;
  }
  record.blocked_by = blockedBy;
  record.status = blockedBy.length > 0 ? "waiting_for_dependencies" : record.status;
  await saveWorkflowState(state);
  return true;
}
async function getMaxConcurrentAgentsSetting() {
  try {
    const settingsPath = resolveProjectPath(".claude", "settings.json");
    const content = await fs3.readFile(settingsPath, "utf8");
    const settings = JSON.parse(content);
    return settings.workflow?.max_concurrent_agents ?? DEFAULT_MAX_CONCURRENT_AGENTS;
  } catch {
    return DEFAULT_MAX_CONCURRENT_AGENTS;
  }
}
async function getRunningAgentCount(sessionId) {
  const state = await getWorkflowState(sessionId);
  if (state === void 0 || state.workflows === void 0) {
    return 0;
  }
  let count = 0;
  for (const workflow of state.workflows) {
    const records = workflow.current_phase.spawned_agent_records ?? [];
    for (const record of records) {
      if (record.status === "running") {
        count++;
      }
    }
  }
  return count;
}
async function canSpawnMore(sessionId) {
  const maxConcurrent = await getMaxConcurrentAgentsSetting();
  const runningCount = await getRunningAgentCount(sessionId);
  return runningCount < maxConcurrent;
}
async function queueAgentSpawn(workflowId, agentId, subagentType, prompt, dependsOn = [], priority = 0) {
  const state = await getWorkflowState();
  if (state === void 0 || state.workflows === void 0) {
    console.error("[workflow-state] Cannot queue agent spawn: no workflow state");
    return false;
  }
  const workflow = state.workflows.find((w) => w.workflow_id === workflowId);
  if (workflow === void 0) {
    console.error(`[workflow-state] Cannot queue agent spawn: workflow ${workflowId} not found`);
    return false;
  }
  if (!workflow.pending_spawn_queue) {
    workflow.pending_spawn_queue = [];
  }
  const existingIndex = workflow.pending_spawn_queue.findIndex((e) => e.agent_id === agentId);
  if (existingIndex !== -1) {
    console.warn(`[workflow-state] Agent ${agentId} already in spawn queue`);
    return false;
  }
  const fullPromptHash = hashPrompt(prompt);
  const truncatedPrompt = truncatePrompt(prompt);
  const entry = {
    agent_id: agentId,
    depends_on: dependsOn,
    priority,
    prompt: truncatedPrompt,
    prompt_hash: fullPromptHash,
    queued_at: (/* @__PURE__ */ new Date()).toISOString(),
    subagent_type: subagentType
  };
  let insertIndex = workflow.pending_spawn_queue.length;
  for (let i = 0; i < workflow.pending_spawn_queue.length; i++) {
    const existing = workflow.pending_spawn_queue[i];
    if (existing !== void 0 && priority < existing.priority) {
      insertIndex = i;
      break;
    }
  }
  workflow.pending_spawn_queue.splice(insertIndex, 0, entry);
  await saveWorkflowState(state);
  return true;
}
async function getNextQueuedSpawn(workflowId) {
  const state = await getWorkflowState();
  if (state === void 0 || state.workflows === void 0) {
    return void 0;
  }
  const workflow = state.workflows.find((w) => w.workflow_id === workflowId);
  if (workflow === void 0) {
    return void 0;
  }
  if (!workflow.pending_spawn_queue || workflow.pending_spawn_queue.length === 0) {
    return void 0;
  }
  const records = workflow.current_phase.spawned_agent_records ?? [];
  for (const entry of workflow.pending_spawn_queue) {
    if (entry.depends_on.length === 0) {
      return entry;
    }
    const allDepsCompleted = entry.depends_on.every((depId) => {
      const depRecord = records.find((r) => r.agent_id === depId);
      return depRecord?.status === "completed";
    });
    if (allDepsCompleted) {
      return entry;
    }
  }
  return void 0;
}
async function removeFromQueue(workflowId, agentId) {
  const state = await getWorkflowState();
  if (state === void 0 || state.workflows === void 0) {
    console.error("[workflow-state] Cannot remove from queue: no workflow state");
    return false;
  }
  const workflow = state.workflows.find((w) => w.workflow_id === workflowId);
  if (workflow === void 0) {
    console.error(`[workflow-state] Cannot remove from queue: workflow ${workflowId} not found`);
    return false;
  }
  if (!workflow.pending_spawn_queue) {
    return false;
  }
  const index = workflow.pending_spawn_queue.findIndex((e) => e.agent_id === agentId);
  if (index === -1) {
    return false;
  }
  workflow.pending_spawn_queue.splice(index, 1);
  await saveWorkflowState(state);
  return true;
}
async function getQueueLength(workflowId) {
  const state = await getWorkflowState();
  if (state === void 0 || state.workflows === void 0) {
    return 0;
  }
  const workflow = state.workflows.find((w) => w.workflow_id === workflowId);
  if (workflow === void 0) {
    return 0;
  }
  return workflow.pending_spawn_queue?.length ?? 0;
}
async function recordTaskMakerSpawn(taskId) {
  const sessionId = getSessionId();
  const stateFile = getWorkflowStateFile(sessionId);
  const INDENT_SPACES = 2;
  try {
    const content = await fs3.readFile(stateFile, "utf8");
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
    await fs3.writeFile(tempFile, JSON.stringify(state, void 0, INDENT_SPACES), "utf8");
    await fs3.rename(tempFile, stateFile);
  } catch (error) {
    if (error instanceof Error && isNodeError(error) && error.code === "ENOENT") {
      console.warn("No workflow state to update for task-maker spawn");
      return;
    }
    console.error("Failed to record task-maker spawn:", error);
  }
}
async function removeWorkflow(workflowId, sessionId) {
  const resolvedSessionId = sessionId ?? getSessionId();
  const stateFile = getWorkflowStateFile(resolvedSessionId);
  const INDENT_SPACES = 2;
  try {
    const content = await fs3.readFile(stateFile, "utf8");
    const state = JSON.parse(content);
    if (state.workflows === void 0) {
      return;
    }
    state.workflows = state.workflows.filter((w) => w.workflow_id !== workflowId);
    state.timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const tempFile = `${stateFile}.${String(process.pid)}.tmp`;
    await fs3.writeFile(tempFile, JSON.stringify(state, void 0, INDENT_SPACES), "utf8");
    await fs3.rename(tempFile, stateFile);
  } catch (error) {
    if (error instanceof Error && isNodeError(error) && error.code === "ENOENT") {
      return;
    }
    console.error("Failed to remove workflow:", error);
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
    await fs3.writeFile(tempFile, JSON.stringify(state, void 0, INDENT_SPACES), "utf8");
    await fs3.rename(tempFile, stateFile);
  } catch (error) {
    console.error("Failed to write workflow state:", error);
    try {
      await fs3.unlink(tempFile);
    } catch {
    }
  }
}
async function setWorkflowStatus(workflowId, status, sessionId) {
  const resolvedSessionId = sessionId ?? getSessionId();
  const stateFile = getWorkflowStateFile(resolvedSessionId);
  const INDENT_SPACES = 2;
  try {
    const content = await fs3.readFile(stateFile, "utf8");
    const state = JSON.parse(content);
    if (state.workflows === void 0) {
      console.warn(`No workflows in state for session ${resolvedSessionId}`);
      return;
    }
    const workflowIndex = state.workflows.findIndex((w) => w.workflow_id === workflowId);
    if (workflowIndex === -1) {
      console.warn(`Workflow ${workflowId} not found in session ${resolvedSessionId}`);
      return;
    }
    const workflow = state.workflows[workflowIndex];
    if (workflow === void 0) {
      console.warn(`Workflow at index ${String(workflowIndex)} is undefined`);
      return;
    }
    workflow.status = status;
    state.timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const tempFile = `${stateFile}.${String(process.pid)}.tmp`;
    await fs3.writeFile(tempFile, JSON.stringify(state, void 0, INDENT_SPACES), "utf8");
    await fs3.rename(tempFile, stateFile);
  } catch (error) {
    console.error("Failed to set workflow status:", error);
  }
}
async function startPhase(workflowId, phaseId, phaseData, sessionId) {
  const resolvedSessionId = sessionId ?? getSessionId();
  await ensureSessionFolder2(resolvedSessionId);
  const stateFile = getWorkflowStateFile(resolvedSessionId);
  const INDENT_SPACES = 2;
  try {
    const content = await fs3.readFile(stateFile, "utf8");
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
    await fs3.writeFile(tempFile, JSON.stringify(state, void 0, INDENT_SPACES), "utf8");
    await fs3.rename(tempFile, stateFile);
  } catch (error) {
    if (error instanceof Error && isNodeError(error) && error.code === "ENOENT") {
      throw new Error(`Workflow ${workflowId} not found in session ${resolvedSessionId}`);
    }
    console.error("Failed to start phase:", error);
    throw error;
  }
}
async function updatePhaseCompletion(workflowId, _agentId, status, sessionId) {
  const resolvedSessionId = sessionId ?? getSessionId();
  const stateFile = getWorkflowStateFile(resolvedSessionId);
  const INDENT_SPACES = 2;
  try {
    const content = await fs3.readFile(stateFile, "utf8");
    const state = JSON.parse(content);
    if (state.workflows === void 0) {
      console.warn(`No workflows in state for session ${resolvedSessionId}`);
      return;
    }
    const workflowIndex = state.workflows.findIndex((w) => w.workflow_id === workflowId);
    if (workflowIndex === -1) {
      console.warn(`Workflow ${workflowId} not found in session ${resolvedSessionId}`);
      return;
    }
    const workflow = state.workflows[workflowIndex];
    if (workflow === void 0) {
      console.warn(`Workflow at index ${String(workflowIndex)} is undefined`);
      return;
    }
    const isSuccess = status === "success" || status === "partial";
    if (isSuccess) {
      workflow.current_phase.agents_completed++;
    } else {
      workflow.current_phase.agents_failed++;
    }
    state.timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const tempFile = `${stateFile}.${String(process.pid)}.tmp`;
    await fs3.writeFile(tempFile, JSON.stringify(state, void 0, INDENT_SPACES), "utf8");
    await fs3.rename(tempFile, stateFile);
  } catch (error) {
    console.error("Failed to update phase completion:", error);
  }
}
async function updateWorkflowState(workflowId, workflowData, sessionId) {
  const resolvedSessionId = sessionId ?? getSessionId();
  await ensureSessionFolder2(resolvedSessionId);
  const INDENT_SPACES = 2;
  const stateFile = getWorkflowStateFile(resolvedSessionId);
  let state;
  try {
    const content = await fs3.readFile(stateFile, "utf8");
    state = JSON.parse(content);
  } catch (error) {
    if (error instanceof Error && isNodeError(error) && error.code === "ENOENT") {
      state = {
        sessionId: resolvedSessionId,
        taskMakerSpawns: [],
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        workflows: []
      };
    } else {
      console.error("Failed to read workflow state:", error);
      return;
    }
  }
  state.workflows ??= [];
  const existingIndex = state.workflows.findIndex((w) => w.workflow_id === workflowId);
  const isNewWorkflow = existingIndex === -1;
  if (isNewWorkflow) {
    state.workflows.push(workflowData);
  } else {
    state.workflows[existingIndex] = workflowData;
  }
  state.timestamp = (/* @__PURE__ */ new Date()).toISOString();
  const tempFile = `${stateFile}.${String(process.pid)}.tmp`;
  try {
    await fs3.writeFile(tempFile, JSON.stringify(state, void 0, INDENT_SPACES), "utf8");
    await fs3.rename(tempFile, stateFile);
  } catch (error) {
    console.error("Failed to write workflow state:", error);
    try {
      await fs3.unlink(tempFile);
    } catch {
    }
  }
  if (isNewWorkflow && workflowData.status === "running") {
    try {
      setActiveWorkflowPointer({
        workflow_id: workflowId,
        workflow_name: workflowData.workflow_name,
        pid: getStableAncestorPid(),
        started_at: workflowData.started_at,
        session_id: resolvedSessionId
      });
      saveDurableWorkflowState(workflowData);
    } catch (error) {
      console.error("[workflow-state] Failed to set durable pointer on new workflow:", error);
    }
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
var DURABLE_WORKFLOWS_DIR, DURABLE_ACTIVE_DIR, POINTER_FILE_PREFIX, POINTER_FILE_SUFFIX, LEGACY_POINTER_FILENAME, JSON_INDENT, MINUTES_IN_HOUR, MILLISECONDS_PER_SECOND, STATE_TTL_MINUTES, STATE_TTL, MAX_PROMPT_LENGTH, DEFAULT_MAX_RETRIES, IMPLEMENTATION_AGENT_TYPES, DEFAULT_MAX_CONCURRENT_AGENTS;
var init_workflow_state = __esm({
  "src/templates/.claude/hooks/core/workflow-state.ts"() {
    "use strict";
    init_path_resolver();
    init_session_state();
    DURABLE_WORKFLOWS_DIR = "workflows";
    DURABLE_ACTIVE_DIR = "active";
    POINTER_FILE_PREFIX = "pointer-";
    POINTER_FILE_SUFFIX = ".json";
    LEGACY_POINTER_FILENAME = "pointer.json";
    JSON_INDENT = 2;
    MINUTES_IN_HOUR = 60;
    MILLISECONDS_PER_SECOND = 1e3;
    STATE_TTL_MINUTES = 30;
    STATE_TTL = STATE_TTL_MINUTES * MINUTES_IN_HOUR * MILLISECONDS_PER_SECOND;
    MAX_PROMPT_LENGTH = 5e3;
    DEFAULT_MAX_RETRIES = 3;
    IMPLEMENTATION_AGENT_TYPES = [
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
    DEFAULT_MAX_CONCURRENT_AGENTS = 3;
  }
});

// src/templates/.claude/hooks/orchestration/feature-planner-validator.ts
import fsSync3 from "node:fs";
import path5 from "node:path";

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

// src/templates/.claude/hooks/orchestration/feature-planner-validator.ts
function extractAgentJSON(response) {
  const jsonBlockMatch = /```(?:json)?\s*([\s\S]*?)\s*```/.exec(response);
  if (jsonBlockMatch?.[1]) {
    try {
      return JSON.parse(jsonBlockMatch[1].trim());
    } catch {
    }
  }
  const delimitedMatch = /=== AGENT JSON OUTPUT ===\s*([\s\S]*?)\s*=== END JSON OUTPUT ===/.exec(response);
  if (delimitedMatch?.[1]) {
    try {
      return JSON.parse(delimitedMatch[1].trim());
    } catch {
    }
  }
  const jsonObjectMatch = /\{[\s\S]*\}/.exec(response);
  if (jsonObjectMatch) {
    try {
      const parsed = JSON.parse(jsonObjectMatch[0]);
      if (parsed.agent_type === "architecture") {
        return parsed;
      }
    } catch {
    }
  }
  return void 0;
}
function getProjectRoot() {
  if (process.env["CLAUDE_PROJECT_ROOT"]) {
    return process.env["CLAUDE_PROJECT_ROOT"];
  }
  let current = process.cwd();
  const maxDepth = 10;
  for (let i = 0; i < maxDepth; i++) {
    if (fsSync3.existsSync(path5.join(current, ".claude"))) {
      return current;
    }
    const parent = path5.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return process.cwd();
}
async function markPhaseAsFailed(error) {
  try {
    const { getWorkflowState: getWorkflowState2, saveWorkflowState: saveWorkflowState2 } = await Promise.resolve().then(() => (init_workflow_state(), workflow_state_exports));
    const state = await getWorkflowState2();
    if (state?.workflows && state.workflows.length > 0) {
      const runningWorkflow = state.workflows.find((w) => w.current_phase.status === "running");
      if (runningWorkflow) {
        runningWorkflow.current_phase.status = "failed";
        runningWorkflow.current_phase["error"] = error;
        await saveWorkflowState2(state);
      }
    }
  } catch (e) {
    console.error("[feature-planner-validator] Failed to update workflow state:", e);
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
      const toolResult = event.tool_response ?? event.toolResult;
      if (toolName !== "Task") {
        outputEmpty();
        exitSuccess();
        return;
      }
      let agentResponse = "";
      if (typeof toolResult === "string") {
        agentResponse = toolResult;
      } else if (toolResult?.output && typeof toolResult.output === "string") {
        agentResponse = toolResult.output;
      } else {
        outputEmpty();
        exitSuccess();
        return;
      }
      const agentData = extractAgentJSON(agentResponse);
      if (!agentData || agentData.agent_type !== "architecture") {
        outputEmpty();
        exitSuccess();
        return;
      }
      const featurePlan = agentData.results?.feature_plan;
      if (!featurePlan) {
        logHookActivity("feature-planner-validator", "PostToolUse", {
          details: "Feature-planner output missing feature_plan in results",
          status: "warning"
        });
        outputEmpty();
        exitSuccess();
        return;
      }
      const specPath = featurePlan.feature_brief_path;
      if (!specPath) {
        const error = {
          type: "spec_path_missing",
          message: "Feature-planner output missing feature_brief_path field",
          retry_recommended: true,
          retry_instructions: "Respawn feature-planner with explicit instruction to include feature_brief_path in JSON output"
        };
        await markPhaseAsFailed(error);
        logHookActivity("feature-planner-validator", "PostToolUse", {
          details: error.message,
          status: "error"
        });
        safeJsonOutput({
          error: `VALIDATION FAILED: ${error.message}. ${error.retry_instructions}`,
          hookSpecificOutput: {
            hookEventName: "FeaturePlannerValidator",
            validationError: error
          }
        });
        exitSuccess();
        return;
      }
      const projectRoot = getProjectRoot();
      const fullPath = path5.join(projectRoot, specPath);
      if (!fsSync3.existsSync(fullPath)) {
        const error = {
          type: "spec_file_missing",
          message: `Feature-planner did not create spec file at ${specPath}`,
          retry_recommended: true,
          retry_instructions: `Respawn feature-planner with explicit instruction: "You MUST use the Write tool to create ${specPath} BEFORE outputting JSON"`
        };
        await markPhaseAsFailed(error);
        logHookActivity("feature-planner-validator", "PostToolUse", {
          details: error.message,
          expectedPath: fullPath,
          status: "error"
        });
        safeJsonOutput({
          error: `VALIDATION FAILED: ${error.message}. ${error.retry_instructions}`,
          hookSpecificOutput: {
            hookEventName: "FeaturePlannerValidator",
            validationError: error,
            expectedPath: specPath
          }
        });
        exitSuccess();
        return;
      }
      const content = fsSync3.readFileSync(fullPath, "utf8");
      const minContentLength = 100;
      if (content.length < minContentLength) {
        const error = {
          type: "spec_file_empty",
          message: `Spec file at ${specPath} is too short (${content.length} chars, minimum ${minContentLength})`,
          retry_recommended: true,
          retry_instructions: `Respawn feature-planner - the spec file needs meaningful content with feature description, tasks, and acceptance criteria`
        };
        await markPhaseAsFailed(error);
        logHookActivity("feature-planner-validator", "PostToolUse", {
          contentLength: content.length,
          details: error.message,
          filePath: fullPath,
          status: "error"
        });
        safeJsonOutput({
          error: `VALIDATION FAILED: ${error.message}. ${error.retry_instructions}`,
          hookSpecificOutput: {
            hookEventName: "FeaturePlannerValidator",
            validationError: error
          }
        });
        exitSuccess();
        return;
      }
      logHookActivity("feature-planner-validator", "PostToolUse", {
        contentLength: content.length,
        details: `Feature-planner validation passed - spec file exists at ${specPath}`,
        filePath: fullPath,
        status: "success"
      });
      outputEmpty();
      exitSuccess();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("[feature-planner-validator] Error:", errorMessage);
      logHookActivity("feature-planner-validator", "PostToolUse", {
        error: errorMessage,
        status: "error"
      });
      outputEmpty();
      exitSuccess();
    }
  })();
});
