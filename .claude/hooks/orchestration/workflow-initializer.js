#!/usr/bin/env node

// src/templates/.claude/hooks/orchestration/workflow-initializer.ts
import { randomUUID } from "node:crypto";
import { readFileSync as readFileSync2, existsSync as existsSync3 } from "node:fs";
import { join, dirname, resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";

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
function ensureDurableDir() {
  const dir = getDurableWorkflowsDir();
  if (!fsSync.existsSync(dir)) {
    fsSync.mkdirSync(dir, { recursive: true });
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
var MINUTES_IN_HOUR = 60;
var MILLISECONDS_PER_SECOND = 1e3;
var STATE_TTL_MINUTES = 30;
var STATE_TTL = STATE_TTL_MINUTES * MINUTES_IN_HOUR * MILLISECONDS_PER_SECOND;
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

// src/templates/.claude/hooks/orchestration/workflow-initializer.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var WORKFLOW_COMMANDS = {
  // Feature development workflow
  "/workflow": { yamlFile: "feature-development.yml", displayName: "Feature Development" },
  // Lint fix workflow
  "/lint-fix": { yamlFile: "lint-fix.yml", displayName: "Lint Fix" },
  "/lint": { yamlFile: "lint-fix.yml", displayName: "Lint Fix" },
  "/fix-lint": { yamlFile: "lint-fix.yml", displayName: "Lint Fix" },
  // QA testing workflow
  "/qa-testing": { yamlFile: "qa-testing.yml", displayName: "QA Testing" },
  "/qa": { yamlFile: "qa-testing.yml", displayName: "QA Testing" },
  "/test": { yamlFile: "qa-testing.yml", displayName: "QA Testing" },
  "/e2e": { yamlFile: "qa-testing.yml", displayName: "QA Testing" },
  // Frontend building workflow
  "/frontend-building": { yamlFile: "frontend-building.yml", displayName: "Frontend Building" },
  "/ui": { yamlFile: "frontend-building.yml", displayName: "Frontend Building" },
  "/frontend": { yamlFile: "frontend-building.yml", displayName: "Frontend Building" },
  "/v0": { yamlFile: "frontend-building.yml", displayName: "Frontend Building" },
  // Demo recording workflow
  "/demo": { yamlFile: "demo-recording.yml", displayName: "Demo Recording" },
  "/demo-video": { yamlFile: "demo-recording.yml", displayName: "Demo Recording" },
  "/demo-record": { yamlFile: "demo-recording.yml", displayName: "Demo Recording" },
  "/record-demo": { yamlFile: "demo-recording.yml", displayName: "Demo Recording" },
  // Surreal AI video workflow
  "/surreal": { yamlFile: "surreal-video.yml", displayName: "Surreal Video" },
  "/surreal-video": { yamlFile: "surreal-video.yml", displayName: "Surreal Video" },
  "/ai-video": { yamlFile: "surreal-video.yml", displayName: "Surreal Video" },
  // X account onboarding workflow
  "/x-onboard": { yamlFile: "x-account-onboarding.yml", displayName: "X Account Onboarding" },
  "/x-create": { yamlFile: "x-account-onboarding.yml", displayName: "X Account Onboarding" },
  "/create-x-accounts": { yamlFile: "x-account-onboarding.yml", displayName: "X Account Onboarding" },
  // X account operations workflow
  "/x-manage": { yamlFile: "x-account-operations.yml", displayName: "X Account Operations" },
  "/x-ops": { yamlFile: "x-account-operations.yml", displayName: "X Account Operations" },
  "/x-daily": { yamlFile: "x-account-operations.yml", displayName: "X Account Operations" },
  "/manage-x": { yamlFile: "x-account-operations.yml", displayName: "X Account Operations" },
  // App build workflow (meta-workflow: generates custom workflow YAML)
  "/build-app": { yamlFile: "app-build.yml", displayName: "App Build" },
  "/app": { yamlFile: "app-build.yml", displayName: "App Build" },
  "/new-app": { yamlFile: "app-build.yml", displayName: "App Build" }
};
var WORKFLOW_COMMAND_PATTERN = /^(\/workflow|\/lint-fix|\/lint|\/fix-lint|\/qa-testing|\/qa|\/test|\/e2e|\/frontend-building|\/ui|\/frontend|\/v0|\/demo|\/demo-video|\/demo-record|\/record-demo|\/surreal|\/surreal-video|\/ai-video|\/x-onboard|\/x-create|\/create-x-accounts|\/x-manage|\/x-ops|\/x-daily|\/manage-x|\/build-app|\/app|\/new-app)(?:\s|$)/i;
function parseWorkflowYaml(yamlPath) {
  if (!existsSync3(yamlPath)) {
    return null;
  }
  const content = readFileSync2(yamlPath, "utf8");
  const lines = content.split("\n");
  let name = "Unknown Workflow";
  let description = "";
  let firstPhaseId = "";
  let firstPhaseAgent = "";
  let firstPhaseDescription = "";
  let totalPhases = 0;
  let inPhases = false;
  let currentPhaseIndex = 0;
  let inFirstPhase = false;
  for (const line of lines) {
    const nameMatch = line.match(/^name:\s*(.+)/);
    if (nameMatch) {
      name = nameMatch[1].trim();
      continue;
    }
    const descMatch = line.match(/^description:\s*\|?\s*(.+)?/);
    if (descMatch && !description) {
      description = descMatch[1]?.trim() ?? "";
      continue;
    }
    if (line.match(/^phases:/)) {
      inPhases = true;
      continue;
    }
    if (inPhases) {
      const phaseIdMatch = line.match(/^\s+-\s+id:\s*(.+)/);
      if (phaseIdMatch) {
        totalPhases++;
        currentPhaseIndex++;
        if (currentPhaseIndex === 1) {
          firstPhaseId = phaseIdMatch[1].trim();
          inFirstPhase = true;
        } else {
          inFirstPhase = false;
        }
        continue;
      }
      if (inFirstPhase) {
        const agentMatch = line.match(/^\s+agent:\s*(.+)/);
        if (agentMatch) {
          firstPhaseAgent = agentMatch[1].trim();
          continue;
        }
        const phaseDescMatch = line.match(/^\s+description:\s*(.+)/);
        if (phaseDescMatch) {
          firstPhaseDescription = phaseDescMatch[1].trim();
          continue;
        }
      }
      if (line.match(/^[a-z]/)) {
        inPhases = false;
      }
    }
  }
  return {
    name,
    description,
    firstPhase: {
      id: firstPhaseId,
      agent: firstPhaseAgent,
      description: firstPhaseDescription
    },
    totalPhases
  };
}
function buildWorkflowContextMessage(workflow, workflowArgs) {
  const escapedArgs = workflowArgs.replace(/`/g, "\\`");
  const { firstPhase, totalPhases, name } = workflow;
  return `
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
\u26A1 WORKFLOW INITIALIZED: ${name.toUpperCase()}
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501

Phase 1 of ${totalPhases}: ${firstPhase.description.toUpperCase() || firstPhase.id.toUpperCase()} (Current)

You MUST spawn the ${firstPhase.agent} agent IMMEDIATELY as your FIRST action.

DO NOT:
- Search for files
- Read code
- Ask questions
- Follow routing recommendations
- Do anything else first

SPAWN THIS AGENT NOW:

\`\`\`
Task(subagent_type="${firstPhase.agent}", prompt="${escapedArgs}")
\`\`\`

The workflow will orchestrate subsequent phases automatically based on agent outputs.

IGNORE any routing recommendations above - this workflow overrides them.

\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
`;
}
function extractCommand(prompt) {
  const match = prompt.match(WORKFLOW_COMMAND_PATTERN);
  if (!match) return null;
  return match[1].toLowerCase();
}
function getWorkflowsDir() {
  return join(__dirname, "..", "..", "workflows");
}
function resolveWorkflowArgs(args) {
  const trimmed = args.trim();
  if (!trimmed.startsWith("@")) {
    return { content: trimmed };
  }
  const rawPath = trimmed.slice(1).trim();
  if (!rawPath) {
    return { content: trimmed };
  }
  const absolutePath = resolve(process.cwd(), rawPath);
  if (!existsSync3(absolutePath)) {
    console.error(`[workflow-initializer] Brief file not found: ${rawPath}`);
    return { content: trimmed };
  }
  try {
    const fileContent = readFileSync2(absolutePath, "utf8");
    return { content: fileContent, filePath: rawPath };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[workflow-initializer] Could not read brief file ${rawPath}: ${msg}`);
    return { content: trimmed };
  }
}
var inputData = "";
process.stdin.on("data", (chunk) => {
  inputData += String(chunk);
});
process.stdin.on("end", () => {
  void (async () => {
    try {
      const event = JSON.parse(inputData);
      const userPrompt = event.prompt ?? "";
      const command = extractCommand(userPrompt);
      if (!command) {
        process.stdout.write("{}");
        return;
      }
      const workflowConfig = WORKFLOW_COMMANDS[command];
      if (!workflowConfig) {
        console.error(`[workflow-initializer] Unknown command: ${command}`);
        process.stdout.write("{}");
        return;
      }
      const workflowsDir = getWorkflowsDir();
      const yamlPath = join(workflowsDir, workflowConfig.yamlFile);
      const workflow = parseWorkflowYaml(yamlPath);
      if (!workflow) {
        console.error(`[workflow-initializer] Failed to load workflow: ${yamlPath}`);
        process.stdout.write("{}");
        return;
      }
      const commandPattern = new RegExp(`^${command}\\s*`, "i");
      const rawArgs = userPrompt.replace(commandPattern, "").trim();
      const resolved = resolveWorkflowArgs(rawArgs);
      const workflowArgs = resolved.content;
      const workflowId = randomUUID();
      const argsDescription = resolved.filePath ? basename(resolved.filePath, ".md") : workflowArgs;
      const workflowName = argsDescription ? `${workflowConfig.displayName}: ${extractWorkflowName(argsDescription)}` : workflowConfig.displayName;
      const sessionId = getSessionId();
      logWorkflowStart({
        prompt: workflowArgs,
        workflowId,
        workflowName
      });
      const initialPhase = {
        id: workflow.firstPhase.id,
        agent: workflow.firstPhase.agent,
        status: "running",
        started_at: (/* @__PURE__ */ new Date()).toISOString(),
        agents_spawned: 0,
        agents_completed: 0,
        agents_failed: 0,
        spawned_agent_ids: [],
        spawned_agent_records: []
      };
      const workflowState = {
        workflow_id: workflowId,
        workflow_name: workflowName,
        session_id: sessionId,
        started_at: (/* @__PURE__ */ new Date()).toISOString(),
        status: "running",
        current_phase: initialPhase,
        iterations: {},
        max_iterations: {},
        pending_spawn_queue: [],
        phase_history: []
      };
      await updateWorkflowState(workflowId, workflowState, sessionId);
      const contextMessage = buildWorkflowContextMessage(workflow, workflowArgs);
      const output = {
        hookSpecificOutput: {
          hookEventName: "UserPromptSubmit",
          additionalContext: contextMessage
        }
      };
      process.stdout.write(JSON.stringify(output));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[workflow-initializer] Error: ${errorMessage}`);
      process.stdout.write("{}");
    }
  })();
});
