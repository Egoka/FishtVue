#!/usr/bin/env node

// src/templates/.claude/hooks/recovery/workflow-context-restore.ts
import { existsSync as existsSync3, readFileSync as readFileSync2 } from "node:fs";
import { join } from "node:path";

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
var DEFAULT_MAX_RETRIES = 3;
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
function isNodeError(error) {
  return "code" in error;
}

// src/templates/.claude/hooks/core/event-writer.ts
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

// src/templates/.claude/hooks/core/workflow-logger.ts
function logWorkflowResumed(options) {
  const { workflowId, workflowName, previousSessionId, currentPhase, staleAgentCount } = options;
  const staleInfo = staleAgentCount > 0 ? ` (${staleAgentCount} stale agents)` : "";
  const message = `- workflow - \u{1F504} RESUMED: "${workflowName}" from phase ${currentPhase}${staleInfo}`;
  writeEventAtomic({
    ts: (/* @__PURE__ */ new Date()).toISOString(),
    type: "workflow_resumed",
    session: getSessionId(),
    workflowId,
    workflowName,
    previousSessionId,
    currentPhase,
    staleAgentCount,
    _message: message
  });
}

// src/templates/.claude/hooks/recovery/workflow-context-restore.ts
var DURABLE_RESUME_TTL_MS = 2 * 60 * 60 * 1e3;
function outputEmpty() {
  console.log(JSON.stringify({}));
}
function formatWorkflowContext(workflow) {
  const phase = workflow.current_phase;
  let nextAction;
  if (workflow.status === "awaiting_aggregation") {
    nextAction = "Spawn workflow-aggregator agent to combine phase results";
  } else if (phase.status === "running") {
    nextAction = `Continue ${phase.id} phase - ${phase.agents_spawned - phase.agents_completed - phase.agents_failed} agents pending`;
  } else {
    nextAction = `Resume workflow from ${phase.id} phase`;
  }
  return `
ACTIVE WORKFLOW: ${workflow.workflow_name}
   ID: ${workflow.workflow_id}
   Status: ${workflow.status}
   Phase: ${phase.id} (${phase.status})
   Progress: ${String(phase.agents_completed)}/${String(phase.agents_spawned)} agents complete
   ${phase.agents_failed > 0 ? `Failed: ${String(phase.agents_failed)} agents` : ""}
   NEXT: ${nextAction}
`.trim();
}
function formatFailedAgentRespawn(agent) {
  const escapedPrompt = agent.prompt.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$").replace(/\r?\n/g, "\\n");
  return `
Agent: ${agent.subagent_type}
Failure: ${agent.failure_reason ?? "unknown"}
Retry: ${String(agent.retry_count)}/3

EXECUTE THIS COMMAND:
Task(
  subagent_type="${agent.subagent_type}",
  prompt=\`${escapedPrompt}\`
)

To skip this agent: /workflow skip ${agent.agent_id}
`.trim();
}
async function tryResumeOrphanedWorkflow() {
  try {
    const allPointers = getAllActiveWorkflowPointers();
    if (allPointers.length === 0) return null;
    const livePointers = allPointers.filter((p) => !isWorkflowPointerStale(p));
    const stalePointers = allPointers.filter((p) => isWorkflowPointerStale(p));
    if (livePointers.length > 0) return null;
    if (stalePointers.length === 0) return null;
    const now = Date.now();
    const eligible = [];
    for (const pointer2 of stalePointers) {
      const workflowAge = now - new Date(pointer2.started_at).getTime();
      if (workflowAge > DURABLE_RESUME_TTL_MS) {
        clearActiveWorkflowPointer(pointer2.workflow_id);
        removeDurableWorkflowState(pointer2.workflow_id);
      } else {
        eligible.push(pointer2);
      }
    }
    if (eligible.length === 0) return null;
    eligible.sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
    const pointer = eligible[0];
    const workflow = loadDurableWorkflowState(pointer.workflow_id);
    if (workflow === null) return null;
    const currentSessionId = getSessionId();
    const previousSessionId = pointer.session_id;
    let staleAgentCount = 0;
    const records = workflow.current_phase.spawned_agent_records ?? [];
    for (const record of records) {
      if (record.status === "running") {
        record.status = "stale";
        record.completed_at = (/* @__PURE__ */ new Date()).toISOString();
        staleAgentCount++;
      }
    }
    workflow.session_id = currentSessionId;
    setActiveWorkflowPointer({
      workflow_id: pointer.workflow_id,
      workflow_name: pointer.workflow_name,
      pid: getStableAncestorPid(),
      started_at: pointer.started_at,
      session_id: currentSessionId
    });
    saveDurableWorkflowState(workflow);
    await ensureSessionFolder(currentSessionId);
    await updateWorkflowState(pointer.workflow_id, workflow, currentSessionId);
    logWorkflowResumed({
      workflowId: pointer.workflow_id,
      workflowName: pointer.workflow_name,
      previousSessionId,
      currentPhase: workflow.current_phase.id,
      staleAgentCount
    });
    const phase = workflow.current_phase;
    const pendingQueue = workflow.pending_spawn_queue?.length ?? 0;
    let staleBlock = "";
    if (staleAgentCount > 0) {
      const staleAgents = records.filter((r) => r.status === "stale");
      staleBlock = `
   STALE AGENTS (${String(staleAgentCount)}): These agents were running when the previous session died.
   They must be respawned to continue the workflow.
${staleAgents.map((a) => `     - ${a.agent_id} (${a.subagent_type})`).join("\n")}`;
    }
    let otherWorkflowsBlock = "";
    if (eligible.length > 1) {
      const others = eligible.slice(1);
      otherWorkflowsBlock = `
   OTHER ORPHANED WORKFLOWS (${String(others.length)}):
${others.map((p) => `     - ${p.workflow_name} (${p.workflow_id})`).join("\n")}
   Note: Only the most recent workflow was resumed. Others remain in durable storage.`;
    }
    return `
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
WORKFLOW RESUMED FROM PREVIOUS SESSION
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
WORKFLOW: ${workflow.workflow_name}
   ID: ${workflow.workflow_id}
   Status: ${workflow.status}
   Phase: ${phase.id} (${phase.status})
   Progress: ${String(phase.agents_completed)}/${String(phase.agents_spawned)} agents complete
   ${phase.agents_failed > 0 ? `Failed: ${String(phase.agents_failed)} agents` : ""}
   ${pendingQueue > 0 ? `Queued: ${String(pendingQueue)} agents pending spawn` : ""}
   Previous Session: ${previousSessionId}
${staleBlock}${otherWorkflowsBlock}

   ACTION: Continue orchestrating this workflow. Respawn any stale agents,
   then process the pending spawn queue and advance through phases.
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
`.trim();
  } catch (error) {
    console.error("[workflow-context-restore] Error resuming orphaned workflow:", error);
    return null;
  }
}
function getGoalContextIfActive() {
  try {
    const goalsDir = join(process.cwd(), ".claude", "goals");
    const pointerPath = join(goalsDir, "active.json");
    if (!existsSync3(pointerPath)) return null;
    const pointerRaw = readFileSync2(pointerPath, "utf-8");
    const pointer = JSON.parse(pointerRaw);
    const goalPath = join(goalsDir, `${pointer.goal_id}.json`);
    if (!existsSync3(goalPath)) return null;
    const raw = readFileSync2(goalPath, "utf-8");
    const state = JSON.parse(raw);
    if (state.status !== "in_progress") return null;
    const goalPreview = state.goal_text.slice(0, 300);
    const progress = state.cumulative_progress;
    const lastAttempt = state.attempts.at(-1);
    let nextSteps = "";
    if (lastAttempt && lastAttempt.next_steps.length > 0) {
      nextSteps = `
   Next Steps: ${lastAttempt.next_steps.slice(0, 3).join(", ")}`;
    }
    return `
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
GOAL CONTEXT RESTORED
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
GOAL: ${goalPreview}${state.goal_text.length > 300 ? "..." : ""}
   Attempt: ${String(state.current_attempt)}${state.config.max_attempts !== void 0 ? `/${String(state.config.max_attempts)}` : ""}
   Completed: ${String(progress.completed.length)} items
   In Progress: ${progress.in_progress.join(", ") || "(none)"}${nextSteps}

   Continue working toward GOAL_COMPLETE.
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
`.trim();
  } catch {
    return null;
  }
}
async function main() {
  try {
    const state = await getWorkflowState();
    let activeWorkflows = [];
    if (state?.workflows !== void 0 && state.workflows.length > 0) {
      activeWorkflows = state.workflows.filter(
        (w) => w.status === "running" || w.status === "awaiting_aggregation"
      );
    }
    if (activeWorkflows.length === 0) {
      const resumeContext = await tryResumeOrphanedWorkflow();
      if (resumeContext) {
        const output2 = {
          hookSpecificOutput: {
            additionalContext: resumeContext,
            hookEventName: "UserPromptSubmit"
          }
        };
        console.log(JSON.stringify(output2));
        return;
      }
      const goalContext = getGoalContextIfActive();
      if (goalContext) {
        const output2 = {
          hookSpecificOutput: {
            additionalContext: goalContext,
            hookEventName: "UserPromptSubmit"
          }
        };
        console.log(JSON.stringify(output2));
        return;
      }
      outputEmpty();
      return;
    }
    const activeWorkflow = activeWorkflows[0];
    if (activeWorkflow !== void 0) {
      const failedAgents = await getFailedAgents(
        activeWorkflow.workflow_id,
        3
        // max retries
      );
      if (failedAgents.length > 0) {
        const sortedAgents = failedAgents.sort(
          (a, b) => new Date(a.spawned_at).getTime() - new Date(b.spawned_at).getTime()
        );
        const respawnBlocks = sortedAgents.map(formatFailedAgentRespawn).join("\n---\n");
        const output2 = {
          hookSpecificOutput: {
            hookEventName: "UserPromptSubmit",
            // NOTE: systemMessage is NOT a valid field for UserPromptSubmit hooks
            // All instructions must go in additionalContext
            additionalContext: `
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
\u26A0\uFE0F WORKFLOW BLOCKED: AGENT RESPAWN REQUIRED
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501

The following agent(s) failed and MUST be respawned before continuing.
Execute the Task() commands shown below.

${respawnBlocks}

DO NOT skip these agents or implement manually unless instructed.
If rate limited again, inform the user and wait.
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
`
          }
        };
        console.log(JSON.stringify(output2));
        return;
      }
    }
    const workflowContexts = activeWorkflows.map((w) => formatWorkflowContext(w)).join("\n\n");
    const output = {
      hookSpecificOutput: {
        hookEventName: "UserPromptSubmit",
        additionalContext: `
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
WORKFLOW CONTEXT RESTORED
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
${workflowContexts}
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
`
      }
    };
    console.log(JSON.stringify(output));
  } catch (error) {
    console.error("[workflow-context-restore] Error reading workflow state:", error);
    outputEmpty();
  }
}
main().catch((error) => {
  console.error("[workflow-context-restore] Unhandled error:", error);
  outputEmpty();
});
