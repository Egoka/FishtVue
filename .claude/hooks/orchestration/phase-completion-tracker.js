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
function getStableAncestorPid() {
  const startPid = process.ppid || process.pid;
  let currentPid = startPid;
  const maxDepth = 5;
  for (let depth = 0; depth < maxDepth && currentPid > 1; depth++) {
    try {
      const cmdline = readFileSync2(`/proc/${currentPid}/cmdline`, "utf-8");
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
import fs4 from "node:fs/promises";
import fsSync2 from "node:fs";
import path5 from "node:path";
function getDurableWorkflowsDir() {
  return resolveProjectPath(".claude", DURABLE_WORKFLOWS_DIR, DURABLE_ACTIVE_DIR);
}
function getDurableWorkflowPath(workflowId) {
  return path5.join(getDurableWorkflowsDir(), `${workflowId}.json`);
}
function getWorkflowPointerPath(workflowId) {
  return path5.join(getDurableWorkflowsDir(), `${POINTER_FILE_PREFIX}${workflowId}${POINTER_FILE_SUFFIX}`);
}
function getLegacyPointerPath() {
  return path5.join(getDurableWorkflowsDir(), LEGACY_POINTER_FILENAME);
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
          const raw = fsSync2.readFileSync(path5.join(dir, file), "utf-8");
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
          fsSync2.unlinkSync(path5.join(dir, file));
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
async function markPhaseComplete(workflowId, finalStatus, sessionId) {
  const resolvedSessionId = sessionId ?? getSessionId();
  const stateFile = getWorkflowStateFile(resolvedSessionId);
  const INDENT_SPACES = 2;
  const DEFAULT_ITERATION = 1;
  try {
    const content = await fs4.readFile(stateFile, "utf8");
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
    await fs4.writeFile(tempFile, JSON.stringify(state, void 0, INDENT_SPACES), "utf8");
    await fs4.rename(tempFile, stateFile);
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
    const content = await fs4.readFile(settingsPath, "utf8");
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
async function removeWorkflow(workflowId, sessionId) {
  const resolvedSessionId = sessionId ?? getSessionId();
  const stateFile = getWorkflowStateFile(resolvedSessionId);
  const INDENT_SPACES = 2;
  try {
    const content = await fs4.readFile(stateFile, "utf8");
    const state = JSON.parse(content);
    if (state.workflows === void 0) {
      return;
    }
    state.workflows = state.workflows.filter((w) => w.workflow_id !== workflowId);
    state.timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const tempFile = `${stateFile}.${String(process.pid)}.tmp`;
    await fs4.writeFile(tempFile, JSON.stringify(state, void 0, INDENT_SPACES), "utf8");
    await fs4.rename(tempFile, stateFile);
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
async function setWorkflowStatus(workflowId, status, sessionId) {
  const resolvedSessionId = sessionId ?? getSessionId();
  const stateFile = getWorkflowStateFile(resolvedSessionId);
  const INDENT_SPACES = 2;
  try {
    const content = await fs4.readFile(stateFile, "utf8");
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
    await fs4.writeFile(tempFile, JSON.stringify(state, void 0, INDENT_SPACES), "utf8");
    await fs4.rename(tempFile, stateFile);
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
async function updatePhaseCompletion(workflowId, _agentId, status, sessionId) {
  const resolvedSessionId = sessionId ?? getSessionId();
  const stateFile = getWorkflowStateFile(resolvedSessionId);
  const INDENT_SPACES = 2;
  try {
    const content = await fs4.readFile(stateFile, "utf8");
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
    await fs4.writeFile(tempFile, JSON.stringify(state, void 0, INDENT_SPACES), "utf8");
    await fs4.rename(tempFile, stateFile);
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
    const content = await fs4.readFile(stateFile, "utf8");
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
    await fs4.writeFile(tempFile, JSON.stringify(state, void 0, INDENT_SPACES), "utf8");
    await fs4.rename(tempFile, stateFile);
  } catch (error) {
    console.error("Failed to write workflow state:", error);
    try {
      await fs4.unlink(tempFile);
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

// src/templates/.claude/hooks/orchestration/phase-completion-tracker.ts
import fsSync3 from "node:fs";
import path6 from "node:path";

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
  performFallbackValidation(data, startTime2) {
    console.warn("Using fallback validation - schema not available");
    const errors = [];
    if (data === null || typeof data !== "object" || Array.isArray(data)) {
      errors.push("Data must be a valid object");
      return this.createResult(false, errors, Date.now() - startTime2, true);
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
    const validationTime = Date.now() - startTime2;
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
    const startTime2 = Date.now();
    if (this.ajv === void 0) {
      return this.createResult(false, ["AJV validator not initialized"], Date.now() - startTime2);
    }
    const validator = this.compiledValidators.get("agent-output-schema");
    if (validator === void 0) {
      if (this.loadAndCompileSchema()) {
        return this.validate(data);
      }
      if (this.fallbackValidationEnabled) {
        return this.performFallbackValidation(data, startTime2);
      }
      return this.createResult(false, ["Schema not loaded and fallback disabled"], Date.now() - startTime2);
    }
    const isValid = validator(data);
    const validationTime = Date.now() - startTime2;
    if (isValid) {
      return this.createResult(true, [], validationTime);
    }
    const errors = this.formatAjvErrors(validator.errors ?? []);
    return this.createResult(false, errors, validationTime);
  }
};
var globalAgentValidator = new AgentValidator();
var agent_validator_default = globalAgentValidator;

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

// src/templates/.claude/hooks/orchestration/phase-completion-tracker.ts
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

// src/templates/.claude/hooks/orchestration/phase-completion-tracker.ts
function extractAgentJSON(response) {
  const jsonBlockMatch = /```(?:json)?\s*([\s\S]*?)\s*```/.exec(response);
  if (jsonBlockMatch?.[1] !== void 0 && jsonBlockMatch[1].length > 0) {
    try {
      return JSON.parse(jsonBlockMatch[1].trim());
    } catch {
    }
  }
  const delimitedMatch = /=== AGENT JSON OUTPUT ===\s*([\s\S]*?)\s*=== END JSON OUTPUT ===/.exec(response);
  if (delimitedMatch?.[1] !== void 0 && delimitedMatch[1].length > 0) {
    try {
      return JSON.parse(delimitedMatch[1].trim());
    } catch {
    }
  }
  const jsonObjectMatch = /\{[\s\S]*\}/.exec(response);
  if (jsonObjectMatch !== null) {
    try {
      const parsed = JSON.parse(jsonObjectMatch[0]);
      if (typeof parsed.agent_type === "string" && typeof parsed.agent_id === "string") {
        return parsed;
      }
    } catch {
    }
  }
  return void 0;
}
async function getWorkflowState2() {
  const { getWorkflowState: getState } = await Promise.resolve().then(() => (init_workflow_state(), workflow_state_exports));
  const state = await getState();
  if (state?.workflows === void 0 || state.workflows.length === 0) {
    return void 0;
  }
  const runningWorkflow = state.workflows.find((w) => w.current_phase.status === "running");
  if (runningWorkflow === void 0) {
    return void 0;
  }
  return {
    phases: [{
      agents_completed: runningWorkflow.current_phase.agents_completed,
      agents_failed: runningWorkflow.current_phase.agents_failed,
      agents_spawned: runningWorkflow.current_phase.agents_spawned,
      aggregation_strategy: "default",
      name: runningWorkflow.current_phase.id,
      spawned_agents: runningWorkflow.current_phase.spawned_agent_ids ?? [],
      status: "in_progress"
    }],
    sessionId: state.sessionId,
    status: "active",
    workflowId: runningWorkflow.workflow_id
  };
}
async function handlePhaseCompletion(phaseIndex, phase, workflowState) {
  if (workflowState.workflowId === void 0 || workflowState.workflowId.length === 0) {
    console.error("[phase-completion-tracker] No workflow ID in state");
    return;
  }
  const finalStatus = phase.agents_failed > 0 ? "failed" : "completed";
  await markPhaseCompleteForWorkflow(workflowState.workflowId, finalStatus);
  await setWorkflowStatusForWorkflow(workflowState.workflowId, "awaiting_aggregation");
  await writeToSessionLog("agent-orchestration", {
    agentsCompleted: phase.agents_completed,
    agentsFailed: phase.agents_failed,
    agentsSpawned: phase.agents_spawned,
    event: "phase_completion",
    phaseIndex,
    phaseName: phase.name,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
  const phaseIndexStr = String(phaseIndex);
  const agentsCompletedStr = String(phase.agents_completed);
  const agentsFailedStr = String(phase.agents_failed);
  const agentsSpawnedStr = String(phase.agents_spawned);
  logHookActivity("phase-completion-tracker", "PostToolUse", {
    agentsCompleted: phase.agents_completed,
    agentsFailed: phase.agents_failed,
    agentsSpawned: phase.agents_spawned,
    details: `Phase ${phaseIndexStr} (${phase.name}) completed - triggering aggregation`,
    phaseIndex,
    status: "success"
  });
  const aggregationStrategy = phase.aggregation_strategy ?? "default";
  const injectionMessage = `
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
\u{1F3AF} PHASE COMPLETION DETECTED
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501

Phase ${phaseIndexStr} (${phase.name}) completed:
  \u2713 Agents completed: ${agentsCompletedStr}
  \u2717 Agents failed: ${agentsFailedStr}
  Total spawned: ${agentsSpawnedStr}

REQUIRED NEXT ACTION:
  \u2192 Spawn aggregator agent to combine results
  \u2192 Use Task tool with subagent_type='aggregator'
  \u2192 Provide phase results for synthesis

Aggregation strategy: ${aggregationStrategy}

Phase results location: .claude/logs/session-${workflowState.sessionId}/phase-${phaseIndexStr}-results/
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
`;
  const response = {
    hookSpecificOutput: {
      additionalContext: injectionMessage,
      hookEventName: "PhaseCompletionTracker",
      systemMessage: `Spawn aggregator agent for phase ${phaseIndexStr}`
    },
    permissionDecision: "allow",
    reason: `Phase ${phaseIndexStr} completion detected - aggregation required`
  };
  safeJsonOutput(response);
}
async function markPhaseCompleteForWorkflow(workflowId, finalStatus) {
  const { markPhaseComplete: markPhaseComplete2 } = await Promise.resolve().then(() => (init_workflow_state(), workflow_state_exports));
  await markPhaseComplete2(workflowId, finalStatus);
}
async function processPhaseCompletion(agentData) {
  try {
    const workflowState = await getWorkflowState2();
    if (workflowState === void 0) {
      logHookActivity("phase-completion-tracker", "PostToolUse", {
        details: "No active workflow found",
        status: "skipped"
      });
      outputEmpty();
      return;
    }
    if (workflowState.phases === void 0 || workflowState.phases.length === 0) {
      logHookActivity("phase-completion-tracker", "PostToolUse", {
        details: "Workflow has no phases",
        status: "skipped"
      });
      outputEmpty();
      return;
    }
    const currentPhaseIndex = workflowState.phases.findIndex((p) => p.status === "in_progress");
    const noInProgressPhase = -1;
    if (currentPhaseIndex === noInProgressPhase) {
      logHookActivity("phase-completion-tracker", "PostToolUse", {
        details: "No in-progress phase found",
        status: "skipped"
      });
      outputEmpty();
      return;
    }
    const currentPhase = workflowState.phases[currentPhaseIndex];
    if (currentPhase === void 0) {
      const phaseIndexStr2 = String(currentPhaseIndex);
      logHookActivity("phase-completion-tracker", "PostToolUse", {
        details: `Phase at index ${phaseIndexStr2} is undefined`,
        status: "error"
      });
      outputEmpty();
      return;
    }
    if (!currentPhase.spawned_agents.includes(agentData.agent_id)) {
      const phaseIndexStr2 = String(currentPhaseIndex);
      logHookActivity("phase-completion-tracker", "PostToolUse", {
        agentId: agentData.agent_id,
        details: `Agent ${agentData.agent_id} not in phase ${phaseIndexStr2}`,
        phaseAgents: currentPhase.spawned_agents,
        status: "skipped"
      });
      outputEmpty();
      return;
    }
    const isSuccess = agentData.status === "success" || agentData.status === "partial";
    if (isSuccess) {
      currentPhase.agents_completed++;
    } else {
      currentPhase.agents_failed++;
    }
    if (workflowState.workflowId !== void 0 && workflowState.workflowId.length > 0) {
      await updatePhaseCompletionForWorkflow(workflowState.workflowId, agentData.agent_id, agentData.status);
    }
    const phaseIndexStr = String(currentPhaseIndex);
    logHookActivity("phase-completion-tracker", "PostToolUse", {
      agentId: agentData.agent_id,
      agentStatus: agentData.status,
      details: `Updated phase ${phaseIndexStr} completion: agent ${agentData.agent_id} ${agentData.status}`,
      phaseIndex: currentPhaseIndex,
      status: "success"
    });
    const totalProcessed = currentPhase.agents_completed + currentPhase.agents_failed;
    const phaseComplete = totalProcessed >= currentPhase.agents_spawned;
    if (!phaseComplete) {
      outputEmpty();
      return;
    }
    await handlePhaseCompletion(currentPhaseIndex, currentPhase, workflowState);
  } catch (error) {
    const orchError = error instanceof OrchestrationError ? error : OrchestrationError.fromError(error, {
      category: ERROR_CATEGORIES.ORCHESTRATION,
      code: ERROR_CODES.UNKNOWN_ERROR,
      operation: "processPhaseCompletion"
    });
    logHookActivity("phase-completion-tracker", "PostToolUse", {
      error: orchError.toLogString(),
      status: "error"
    });
    outputEmpty();
  }
}
async function setWorkflowStatusForWorkflow(workflowId, status) {
  const { setWorkflowStatus: setWorkflowStatus2 } = await Promise.resolve().then(() => (init_workflow_state(), workflow_state_exports));
  await setWorkflowStatus2(workflowId, status);
}
async function updatePhaseCompletionForWorkflow(workflowId, agentId, status) {
  const { updatePhaseCompletion: updatePhaseCompletion2 } = await Promise.resolve().then(() => (init_workflow_state(), workflow_state_exports));
  await updatePhaseCompletion2(workflowId, agentId, status);
}
function persistAgentOutput(agentData, sessionId) {
  try {
    const projectRoot = process.env["CLAUDE_PROJECT_ROOT"] ?? process.cwd();
    const logsDir = path6.join(projectRoot, ".claude", "logs");
    const sessionDir = path6.join(logsDir, `session-${sessionId}`);
    if (!fsSync3.existsSync(sessionDir)) {
      const entries = fsSync3.readdirSync(logsDir, { withFileTypes: true });
      const matchingSession = entries.find(
        (e) => e.isDirectory() && e.name.includes(sessionId)
      );
      if (!matchingSession) {
        logHookActivity("phase-completion-tracker", "PostToolUse", {
          details: `Session directory not found for ${sessionId}`,
          status: "warning"
        });
        return;
      }
    }
    const agentType = agentData.agent_type ?? "unknown";
    const agentId = agentData.agent_id ?? `agent-${Date.now()}`;
    const outputFile = path6.join(sessionDir, `${agentType}-${agentId}-output.json`);
    fsSync3.writeFileSync(outputFile, JSON.stringify(agentData, null, 2), "utf8");
    logHookActivity("phase-completion-tracker", "PostToolUse", {
      details: `Persisted agent output to ${outputFile}`,
      agentType,
      agentId,
      status: "success"
    });
  } catch (error) {
    logHookActivity("phase-completion-tracker", "PostToolUse", {
      details: `Failed to persist agent output: ${error instanceof Error ? error.message : String(error)}`,
      status: "warning"
    });
  }
}
async function handleFallbackCompletion(subagentType) {
  try {
    const {
      getWorkflowState: getState,
      isPhaseComplete: checkPhaseComplete,
      markPhaseComplete: markComplete,
      setWorkflowStatus: setStatus,
      updateAgentStatus: updateAgentStatus2,
      updatePhaseCompletion: updateCompletion
    } = await Promise.resolve().then(() => (init_workflow_state(), workflow_state_exports));
    const state = await getState();
    if (state?.workflows === void 0 || state.workflows.length === 0) {
      logHookActivity("phase-completion-tracker", "PostToolUse", {
        details: `Fallback: no active workflows for subagent_type="${subagentType}"`,
        status: "skipped"
      });
      return;
    }
    const workflow = state.workflows.find((w) => w.current_phase.status === "running");
    if (workflow === void 0) {
      logHookActivity("phase-completion-tracker", "PostToolUse", {
        details: `Fallback: no running workflow phase for subagent_type="${subagentType}"`,
        status: "skipped"
      });
      return;
    }
    const records = workflow.current_phase.spawned_agent_records ?? [];
    let matchingRecord = records.find(
      (r) => r.status === "running" && r.subagent_type === subagentType
    );
    if (matchingRecord === void 0) {
      matchingRecord = records.find(
        (r) => r.status === "running" && (r.agent_id === subagentType || r.agent_id.startsWith(subagentType + "-"))
      );
    }
    if (matchingRecord === void 0) {
      logHookActivity("phase-completion-tracker", "PostToolUse", {
        details: `Fallback: no running agent matching subagent_type="${subagentType}" in phase "${workflow.current_phase.id}"`,
        runningAgents: records.filter((r) => r.status === "running").map((r) => r.agent_id),
        status: "skipped"
      });
      return;
    }
    const workflowId = workflow.workflow_id;
    const agentId = matchingRecord.agent_id;
    logHookActivity("phase-completion-tracker", "PostToolUse", {
      agentId,
      details: `Fallback: completing agent "${agentId}" (subagent_type="${subagentType}") via tool_input detection`,
      status: "info"
    });
    await updateAgentStatus2(workflowId, agentId, "completed");
    await updateCompletion(workflowId, agentId, "success");
    const phaseComplete = await checkPhaseComplete(workflowId);
    if (!phaseComplete) {
      logHookActivity("phase-completion-tracker", "PostToolUse", {
        agentId,
        details: `Fallback: agent "${agentId}" completed, phase not yet done`,
        status: "success"
      });
      return;
    }
    const finalStatus = workflow.current_phase.agents_failed > 0 ? "failed" : "completed";
    await markComplete(workflowId, finalStatus);
    await setStatus(workflowId, "awaiting_aggregation");
    const phaseId = workflow.current_phase.id;
    const agentsCompleted = String(workflow.current_phase.agents_completed + 1);
    const agentsSpawned = String(workflow.current_phase.agents_spawned);
    logHookActivity("phase-completion-tracker", "PostToolUse", {
      agentId,
      details: `Fallback: phase "${phaseId}" complete (${agentsCompleted}/${agentsSpawned}) \u2014 triggering aggregation`,
      status: "success"
    });
    const injectionMessage = `
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
\u{1F3AF} PHASE COMPLETION DETECTED (fallback)
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501

Phase "${phaseId}" completed:
  \u2713 Agents completed: ${agentsCompleted}
  Total spawned: ${agentsSpawned}

REQUIRED NEXT ACTION:
  \u2192 Spawn aggregator agent to combine results
  \u2192 Use Task tool with subagent_type='workflow-aggregator'
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
`;
    safeJsonOutput({
      hookSpecificOutput: {
        additionalContext: injectionMessage,
        hookEventName: "PhaseCompletionTracker",
        systemMessage: `Phase "${phaseId}" complete. Spawn workflow-aggregator now.`
      },
      permissionDecision: "allow",
      reason: `Phase completion detected via fallback (subagent_type="${subagentType}")`
    });
  } catch (error) {
    logHookActivity("phase-completion-tracker", "PostToolUse", {
      details: `Fallback completion error: ${error instanceof Error ? error.message : String(error)}`,
      status: "error"
    });
  }
}
var startTime = performance.now();
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
        return;
      }
      let agentResponse = "";
      if (typeof toolResult === "string") {
        agentResponse = toolResult;
      } else if (toolResult.output !== void 0 && typeof toolResult.output === "string") {
        agentResponse = toolResult.output;
      } else {
        outputEmpty();
        return;
      }
      const agentData = extractAgentJSON(agentResponse);
      if (agentData === void 0) {
        const toolInput = event.tool_input ?? event.parameters;
        const subagentType = typeof toolInput?.subagent_type === "string" ? toolInput.subagent_type : void 0;
        if (subagentType !== void 0) {
          await handleFallbackCompletion(subagentType);
        } else {
          logHookActivity("phase-completion-tracker", "PostToolUse", {
            details: "No agent JSON and no subagent_type \u2014 cannot detect completion",
            status: "skipped"
          });
        }
        outputEmpty();
        return;
      }
      const validationResult = agent_validator_default.validate(agentData);
      if (!validationResult.valid) {
        outputEmpty();
        return;
      }
      const sessionId = agentData.session_id ?? "unknown";
      persistAgentOutput(agentData, sessionId);
      await processPhaseCompletion(agentData);
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      const performanceThresholdMs = 10;
      const decimalPlaces = 2;
      if (executionTime > performanceThresholdMs) {
        logHookActivity("phase-completion-tracker", "PostToolUse", {
          details: `Hook execution exceeded 10ms: ${executionTime.toFixed(decimalPlaces)}ms`,
          executionTime,
          status: "warning"
        });
      }
      exitSuccess();
    } catch (error) {
      console.error("[phase-completion-tracker] Error:", error);
      outputEmpty();
      exitSuccess();
    }
  })();
});
