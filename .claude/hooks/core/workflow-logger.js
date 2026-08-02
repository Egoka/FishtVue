#!/usr/bin/env node

// src/templates/.claude/hooks/core/event-writer.ts
import { openSync as openSync2, writeSync, closeSync as closeSync2, constants as constants2, mkdirSync as mkdirSync2, existsSync as existsSync2 } from "node:fs";
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

// src/templates/.claude/hooks/core/event-writer.ts
function writeEventAtomic(event) {
  const eventsPath = resolveProjectPath(".claude", "logs", "events.jsonl");
  const dir = path3.dirname(eventsPath);
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
var STAGE_DESCRIPTIONS = {
  feature_planning: "Feature Planning - creating feature specifications",
  task_creation: "Task Creation - task-maker agents creating task files",
  implementation: "Implementation - engineers implementing tasks",
  code_review: "Code Review - reviewers validating implementations",
  complete: "Complete - all workflow stages finished"
};
var STAGE_EMOJIS = {
  feature_planning: "\u{1F4CB}",
  task_creation: "\u{1F4DD}",
  implementation: "\u{1F528}",
  code_review: "\u{1F50D}",
  complete: "\u2705"
};
var ACTION_EMOJIS = {
  allowed: "\u2713",
  blocked: "\u2717",
  override: "\u26A0"
};
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
function logWorkflowStage(options) {
  const { stage, action, agentType, toolName, reason, stageProgress } = options;
  const stageDescription = STAGE_DESCRIPTIONS[stage];
  const stageEmoji = STAGE_EMOJIS[stage];
  const actionEmoji = ACTION_EMOJIS[action];
  const actor = agentType || toolName || "stage";
  let message = `- workflow - ${stageEmoji} ${stage.toUpperCase()}: `;
  if (action === "allowed") {
    message += actor;
  } else {
    message += `${actor} ${actionEmoji} ${action}`;
  }
  if (reason) {
    message += ` (${reason})`;
  }
  if (stageProgress) {
    message += ` [${stageProgress.completed}/${stageProgress.total}]`;
  }
  writeEventAtomic({
    ts: (/* @__PURE__ */ new Date()).toISOString(),
    type: "workflow_stage",
    session: getSessionId(),
    stage,
    action,
    agentType,
    toolName,
    stageDescription,
    reason,
    stageProgress,
    // Include human-readable message for dashboard display
    _message: message
  });
}
function logWorkflowTrigger(options) {
  const { taskId, completedAgent, nextAgent, nextPrompt } = options;
  const message = `- workflow - \u26A1 PIPELINE: ${completedAgent} \u2192 ${nextAgent} for task-${taskId}`;
  writeEventAtomic({
    ts: (/* @__PURE__ */ new Date()).toISOString(),
    type: "workflow_trigger",
    session: getSessionId(),
    taskId,
    completedAgent,
    nextAgent,
    nextPrompt,
    _message: message
  });
}
function logWorkflowComplete(options) {
  const { taskId, stagesCompleted } = options;
  const message = `- workflow - \u2705 COMPLETE: task-${taskId} finished (${stagesCompleted.join(" \u2192 ")})`;
  writeEventAtomic({
    ts: (/* @__PURE__ */ new Date()).toISOString(),
    type: "workflow_complete",
    session: getSessionId(),
    taskId,
    stagesCompleted,
    _message: message
  });
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
function statusToStage(status) {
  switch (status) {
    case "pending_task_creation":
      return "task_creation";
    case "tasks_created":
      return "implementation";
    case "implementation_complete":
      return "code_review";
    case "review_complete":
      return "complete";
    default:
      return "feature_planning";
  }
}
function getAllowedAgentsForStage(stage) {
  switch (stage) {
    case "feature_planning":
      return ["feature-planner"];
    case "task_creation":
      return ["task-maker"];
    case "implementation":
      return ["frontend-engineer", "backend-engineer", "devops-engineer", "fullstack-engineer"];
    case "code_review":
      return ["code-reviewer"];
    case "complete":
      return [];
    default:
      return [];
  }
}
var RESEARCH_AGENTS = [
  "Explore",
  "research",
  "general-purpose",
  "cto-architect",
  "debugger"
];
function isResearchAgent(agentType) {
  return RESEARCH_AGENTS.includes(agentType);
}
export {
  RESEARCH_AGENTS,
  extractWorkflowName,
  getAllowedAgentsForStage,
  isResearchAgent,
  logWorkflowComplete,
  logWorkflowCompleteEarly,
  logWorkflowResumed,
  logWorkflowStage,
  logWorkflowStart,
  logWorkflowTrigger,
  statusToStage
};
