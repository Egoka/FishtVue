#!/usr/bin/env node

// src/templates/.claude/hooks/core/workflow-state.ts
import crypto from "node:crypto";
import fs2 from "node:fs/promises";
import fsSync from "node:fs";
import path3 from "node:path";

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

// src/templates/.claude/hooks/core/workflow-state.ts
var DURABLE_WORKFLOWS_DIR = "workflows";
var DURABLE_ACTIVE_DIR = "active";
var POINTER_FILE_PREFIX = "pointer-";
var POINTER_FILE_SUFFIX = ".json";
var LEGACY_POINTER_FILENAME = "pointer.json";
var JSON_INDENT = 2;
function getDurableWorkflowsDir() {
  return resolveProjectPath(".claude", DURABLE_WORKFLOWS_DIR, DURABLE_ACTIVE_DIR);
}
function getDurableWorkflowPath(workflowId) {
  return path3.join(getDurableWorkflowsDir(), `${workflowId}.json`);
}
function getWorkflowPointerPath(workflowId) {
  return path3.join(getDurableWorkflowsDir(), `${POINTER_FILE_PREFIX}${workflowId}${POINTER_FILE_SUFFIX}`);
}
function getLegacyPointerPath() {
  return path3.join(getDurableWorkflowsDir(), LEGACY_POINTER_FILENAME);
}
function migrateLegacyPointer() {
  const legacyPath = getLegacyPointerPath();
  if (!fsSync.existsSync(legacyPath)) return;
  try {
    const raw = fsSync.readFileSync(legacyPath, "utf-8");
    const pointer = JSON.parse(raw);
    const newPath = getWorkflowPointerPath(pointer.workflow_id);
    if (!fsSync.existsSync(newPath)) {
      fsSync.writeFileSync(newPath, JSON.stringify(pointer, void 0, JSON_INDENT), "utf-8");
    }
    fsSync.unlinkSync(legacyPath);
  } catch {
  }
}
function ensureDurableDir() {
  const dir = getDurableWorkflowsDir();
  if (!fsSync.existsSync(dir)) {
    fsSync.mkdirSync(dir, { recursive: true });
  }
}
function getActiveWorkflowPointer(workflowId) {
  migrateLegacyPointer();
  const pointerPath = getWorkflowPointerPath(workflowId);
  if (!fsSync.existsSync(pointerPath)) return null;
  try {
    const raw = fsSync.readFileSync(pointerPath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function getAllActiveWorkflowPointers() {
  migrateLegacyPointer();
  const dir = getDurableWorkflowsDir();
  if (!fsSync.existsSync(dir)) return [];
  try {
    const files = fsSync.readdirSync(dir);
    const pointers = [];
    for (const file of files) {
      if (file.startsWith(POINTER_FILE_PREFIX) && file.endsWith(POINTER_FILE_SUFFIX)) {
        try {
          const raw = fsSync.readFileSync(path3.join(dir, file), "utf-8");
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
    fsSync.writeFileSync(tempFile, JSON.stringify(pointer, void 0, JSON_INDENT), "utf-8");
    fsSync.renameSync(tempFile, pointerPath);
  } catch (error) {
    console.error("[workflow-state] Failed to set workflow pointer:", error);
    try {
      fsSync.unlinkSync(tempFile);
    } catch {
    }
  }
}
function clearActiveWorkflowPointer(workflowId) {
  const pointerPath = getWorkflowPointerPath(workflowId);
  try {
    if (fsSync.existsSync(pointerPath)) {
      fsSync.unlinkSync(pointerPath);
    }
  } catch (error) {
    console.error("[workflow-state] Failed to clear workflow pointer:", error);
  }
}
function clearAllActiveWorkflowPointers() {
  const dir = getDurableWorkflowsDir();
  if (!fsSync.existsSync(dir)) return;
  try {
    const files = fsSync.readdirSync(dir);
    for (const file of files) {
      if (file.startsWith(POINTER_FILE_PREFIX) && file.endsWith(POINTER_FILE_SUFFIX) || file === LEGACY_POINTER_FILENAME) {
        try {
          fsSync.unlinkSync(path3.join(dir, file));
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
    const stat = fsSync.statSync(statePath);
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
    fsSync.writeFileSync(tempFile, JSON.stringify(workflow, void 0, JSON_INDENT), "utf-8");
    fsSync.renameSync(tempFile, statePath);
  } catch (error) {
    console.error("[workflow-state] Failed to save durable workflow state:", error);
    try {
      fsSync.unlinkSync(tempFile);
    } catch {
    }
  }
}
function loadDurableWorkflowState(workflowId) {
  const statePath = getDurableWorkflowPath(workflowId);
  if (!fsSync.existsSync(statePath)) return null;
  try {
    const raw = fsSync.readFileSync(statePath, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    console.error("[workflow-state] Failed to load durable workflow state:", error);
    return null;
  }
}
function removeDurableWorkflowState(workflowId) {
  const statePath = getDurableWorkflowPath(workflowId);
  try {
    if (fsSync.existsSync(statePath)) {
      fsSync.unlinkSync(statePath);
    }
  } catch (error) {
    console.error("[workflow-state] Failed to remove durable workflow state:", error);
  }
}
var MINUTES_IN_HOUR = 60;
var MILLISECONDS_PER_SECOND = 1e3;
var STATE_TTL_MINUTES = 30;
var STATE_TTL = STATE_TTL_MINUTES * MINUTES_IN_HOUR * MILLISECONDS_PER_SECOND;
var MAX_PROMPT_LENGTH = 5e3;
var DEFAULT_MAX_RETRIES = 3;
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
    await fs2.unlink(stateFile);
  } catch (error) {
    if (error instanceof Error && isNodeError(error) && error.code !== "ENOENT") {
      console.error("Failed to clear workflow state:", error);
    }
  }
}
async function ensureSessionFolder(sessionId) {
  const sessionDir = resolveProjectPath(".claude", "logs", `session-${sessionId}`);
  try {
    await fs2.mkdir(sessionDir, { recursive: true });
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
    const content = await fs2.readFile(stateFile, "utf8");
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
    const content = await fs2.readFile(stateFile, "utf8");
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
    const content = await fs2.readFile(stateFile, "utf8");
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
        await fs2.unlink(stateFile);
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
    const content = await fs2.readFile(stateFile, "utf8");
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
    await fs2.writeFile(tempFile, JSON.stringify(state, void 0, INDENT_SPACES), "utf8");
    await fs2.rename(tempFile, stateFile);
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
    await fs2.writeFile(tempFile, JSON.stringify(state, void 0, INDENT_SPACES), "utf8");
    await fs2.rename(tempFile, stateFile);
  } catch (error) {
    console.error("Failed to save workflow state:", error);
    try {
      await fs2.unlink(tempFile);
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
var DEFAULT_MAX_CONCURRENT_AGENTS = 3;
async function getMaxConcurrentAgentsSetting() {
  try {
    const settingsPath = resolveProjectPath(".claude", "settings.json");
    const content = await fs2.readFile(settingsPath, "utf8");
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
    const content = await fs2.readFile(stateFile, "utf8");
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
    await fs2.writeFile(tempFile, JSON.stringify(state, void 0, INDENT_SPACES), "utf8");
    await fs2.rename(tempFile, stateFile);
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
    const content = await fs2.readFile(stateFile, "utf8");
    const state = JSON.parse(content);
    if (state.workflows === void 0) {
      return;
    }
    state.workflows = state.workflows.filter((w) => w.workflow_id !== workflowId);
    state.timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const tempFile = `${stateFile}.${String(process.pid)}.tmp`;
    await fs2.writeFile(tempFile, JSON.stringify(state, void 0, INDENT_SPACES), "utf8");
    await fs2.rename(tempFile, stateFile);
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
    const content = await fs2.readFile(stateFile, "utf8");
    const parsed = JSON.parse(content);
    if (parsed.featurePlannerOutput === void 0) {
      console.warn("No feature-planner workflow to transition");
      return;
    }
    parsed.featurePlannerOutput.status = newStatus;
    parsed.timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const tempFile = `${stateFile}.${String(process.pid)}.tmp`;
    await fs2.writeFile(tempFile, JSON.stringify(parsed, void 0, INDENT_SPACES), "utf8");
    await fs2.rename(tempFile, stateFile);
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
  await ensureSessionFolder(sessionId);
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
    await fs2.writeFile(tempFile, JSON.stringify(state, void 0, INDENT_SPACES), "utf8");
    await fs2.rename(tempFile, stateFile);
  } catch (error) {
    console.error("Failed to write workflow state:", error);
    try {
      await fs2.unlink(tempFile);
    } catch {
    }
  }
}
async function setWorkflowStatus(workflowId, status, sessionId) {
  const resolvedSessionId = sessionId ?? getSessionId();
  const stateFile = getWorkflowStateFile(resolvedSessionId);
  const INDENT_SPACES = 2;
  try {
    const content = await fs2.readFile(stateFile, "utf8");
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
    await fs2.writeFile(tempFile, JSON.stringify(state, void 0, INDENT_SPACES), "utf8");
    await fs2.rename(tempFile, stateFile);
  } catch (error) {
    console.error("Failed to set workflow status:", error);
  }
}
async function startPhase(workflowId, phaseId, phaseData, sessionId) {
  const resolvedSessionId = sessionId ?? getSessionId();
  await ensureSessionFolder(resolvedSessionId);
  const stateFile = getWorkflowStateFile(resolvedSessionId);
  const INDENT_SPACES = 2;
  try {
    const content = await fs2.readFile(stateFile, "utf8");
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
    await fs2.writeFile(tempFile, JSON.stringify(state, void 0, INDENT_SPACES), "utf8");
    await fs2.rename(tempFile, stateFile);
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
    const content = await fs2.readFile(stateFile, "utf8");
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
    await fs2.writeFile(tempFile, JSON.stringify(state, void 0, INDENT_SPACES), "utf8");
    await fs2.rename(tempFile, stateFile);
  } catch (error) {
    console.error("Failed to update phase completion:", error);
  }
}
async function updateWorkflowState(workflowId, workflowData, sessionId) {
  const resolvedSessionId = sessionId ?? getSessionId();
  await ensureSessionFolder(resolvedSessionId);
  const INDENT_SPACES = 2;
  const stateFile = getWorkflowStateFile(resolvedSessionId);
  let state;
  try {
    const content = await fs2.readFile(stateFile, "utf8");
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
    await fs2.writeFile(tempFile, JSON.stringify(state, void 0, INDENT_SPACES), "utf8");
    await fs2.rename(tempFile, stateFile);
  } catch (error) {
    console.error("Failed to write workflow state:", error);
    try {
      await fs2.unlink(tempFile);
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
export {
  IMPLEMENTATION_AGENT_TYPES,
  addToDependencyGraph,
  canSpawnMore,
  clearActiveWorkflowPointer,
  clearAllActiveWorkflowPointers,
  clearWorkflowState,
  ensureSessionFolder,
  getActiveWorkflowPhase,
  getActiveWorkflowPointer,
  getAllActiveWorkflowPointers,
  getDependentsOf,
  getDurableWorkflowPath,
  getDurableWorkflowsDir,
  getFailedAgents,
  getFeaturePlannerState,
  getLegacyPointerPath,
  getNextQueuedSpawn,
  getQueueLength,
  getReadyToSpawn,
  getRunningAgentCount,
  getSessionId,
  getTaskMakerProgress,
  getWorkflowById,
  getWorkflowPointerPath,
  getWorkflowState,
  hasCircularDependency,
  isFeaturePlannerWorkflowActive,
  isPhaseComplete,
  isWorkflowPointerStale,
  loadDurableWorkflowState,
  markAgentBlocked,
  markPhaseComplete,
  migrateLegacyPointer,
  queueAgentSpawn,
  recordTaskMakerSpawn,
  registerSpawnedAgent,
  removeDurableWorkflowState,
  removeFromQueue,
  removeWorkflow,
  saveDurableWorkflowState,
  setActiveWorkflowPointer,
  setFeaturePlannerOutput,
  setWorkflowStatus,
  startPhase,
  transitionToNextPhase,
  transitionWorkflowPhase,
  updateAgentStatus,
  updatePhaseCompletion,
  updateWorkflowState
};
