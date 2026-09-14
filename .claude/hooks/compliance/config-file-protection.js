#!/usr/bin/env node

// src/templates/.claude/hooks/compliance/config-file-protection.ts
import fs3 from "node:fs";
import path4 from "node:path";
import { fileURLToPath } from "node:url";

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

// src/templates/.claude/scripts/session-logger.ts
import fsSync from "node:fs";
import fs2 from "node:fs/promises";
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

// src/templates/.claude/scripts/session-logger.ts
var LOG_FILENAMES = {
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

// src/templates/.claude/hooks/compliance/config-file-protection.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path4.dirname(__filename);
var CONTENT_PREVIEW_LENGTH = 200;
var CONTENT_MAX_LENGTH = 500;
var PROTECTED_CONFIG_FILES = [
  "eslint.config.ts",
  "eslint.config.js",
  "eslint.config.mjs",
  ".eslintrc.js",
  ".eslintrc.json",
  "tsconfig.json",
  "knip.ts",
  "knip.json"
];
var CRITICAL_SECTION_PATTERNS = [
  '"rules"',
  // ESLint rule modifications
  "'rules'",
  '"compilerOptions"',
  // TypeScript strictness settings
  '"include"',
  // File scope changes
  '"exclude"',
  '"strict"',
  // Strictness toggles
  '"noImplicit',
  // Implicit any/this settings
  '"no-unsafe',
  // Unsafe type rule changes
  '"off"',
  // Disabling rules
  '"warn"',
  // Weakening errors to warnings
  '": "off"',
  '": "warn"',
  ': "off"',
  ': "warn"'
];
function buildConfigAskMessage(file, _toolName) {
  const reason = "Config file protected - asking user permission";
  let userMessage = "\n";
  userMessage += "\x1B[33m\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\x1B[0m\n";
  userMessage += "\x1B[33m\u26A0\uFE0F  CONFIG FILE MODIFICATION - USER PERMISSION REQUIRED\x1B[0m\n";
  userMessage += "\x1B[33m\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\x1B[0m\n\n";
  userMessage += `Agent wants to modify: \x1B[34m${file}\x1B[0m

`;
  userMessage += "**Why this is blocked:**\n";
  userMessage += "These configuration files define code quality standards and\n";
  userMessage += "require human approval. This prevents:\n";
  userMessage += "  \u2022 Weakening strictness to avoid fixing real issues\n";
  userMessage += "  \u2022 Breaking project-wide conventions\n";
  userMessage += "  \u2022 Bypassing architectural decisions\n\n";
  userMessage += "**Options:**\n";
  userMessage += "  \x1B[32m\u2713 Allow\x1B[0m - Proceed with modification\n";
  userMessage += "  \x1B[31m\u2717 Deny\x1B[0m - Block the modification\n";
  userMessage += "  \x1B[33m\u2139 Use cto-architect\x1B[0m - Review changes first\n\n";
  userMessage += "\x1B[33m\u26A0\uFE0F  Emergency bypass: CLAUDE_WORKFLOW_ALLOW_CONFIG_EDITS=1 (logged for audit)\x1B[0m\n";
  userMessage += "\x1B[33m\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\x1B[0m\n";
  let systemMessage = "\u26A0\uFE0F CONFIG FILE MODIFICATION - USER PERMISSION REQUIRED\n\n";
  systemMessage += `Agent wants to modify: ${file}

`;
  systemMessage += "Waiting for user permission decision...\n";
  return { reason, systemMessage, userMessage };
}
function detectConfigModification(toolName, parameters) {
  let filePath;
  let content;
  if (toolName === "Write" && typeof parameters.file_path === "string") {
    filePath = parameters.file_path;
    content = typeof parameters.content === "string" ? parameters.content : void 0;
  } else if (toolName === "Edit" && typeof parameters.file_path === "string") {
    filePath = parameters.file_path;
    const oldString = typeof parameters.old_string === "string" ? parameters.old_string : "";
    const newString = typeof parameters.new_string === "string" ? parameters.new_string : "";
    content = oldString + newString;
  }
  if (filePath === void 0 || filePath === "") {
    return { blocked: false };
  }
  if (!isProtectedConfigFile(filePath)) {
    return { blocked: false };
  }
  if (toolName === "Write") {
    return {
      blocked: true,
      file: filePath,
      reason: "Full file write to protected config"
    };
  }
  if (toolName === "Edit" && content !== void 0 && content !== "" && touchesCriticalSection(content)) {
    return {
      blocked: true,
      file: filePath,
      reason: "Edit touches critical config section"
    };
  }
  return { blocked: false };
}
function isProtectedConfigFile(filePath) {
  const normalizedPath = filePath.replaceAll("\\", "/");
  const fileName = path4.basename(normalizedPath);
  return PROTECTED_CONFIG_FILES.some(
    (protectedFile) => fileName === protectedFile || normalizedPath.endsWith(protectedFile)
  );
}
async function logConfigBlock(file, reason, parameters) {
  const sessionId = getSessionId();
  let changeDiff;
  if (typeof parameters.old_string === "string" && typeof parameters.new_string === "string") {
    changeDiff = `--- old
+++ new
- ${parameters.old_string}
+ ${parameters.new_string}`;
  } else if (typeof parameters.content === "string") {
    const contentPreview = parameters.content.slice(0, CONTENT_PREVIEW_LENGTH);
    changeDiff = `New content (preview): ${contentPreview}${parameters.content.length > CONTENT_PREVIEW_LENGTH ? "..." : ""}`;
  }
  const logEntry = {
    bypassed: false,
    changeDiff,
    file,
    parameters: {
      // Truncate large content fields
      content: typeof parameters.content === "string" ? parameters.content.slice(0, CONTENT_MAX_LENGTH) : void 0,
      file_path: parameters.file_path,
      new_string: typeof parameters.new_string === "string" ? parameters.new_string.slice(0, CONTENT_PREVIEW_LENGTH) : void 0,
      old_string: typeof parameters.old_string === "string" ? parameters.old_string.slice(0, CONTENT_PREVIEW_LENGTH) : void 0
    },
    reason,
    sessionId,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    type: "CONFIG_MODIFICATION_BLOCKED"
  };
  try {
    await writeToSessionLog("config-changes", logEntry);
    const globalLogDir = path4.join(__dirname, "../../logs");
    const globalLogFile = path4.join(globalLogDir, "config-changes.jsonl");
    if (!fs3.existsSync(globalLogDir)) {
      fs3.mkdirSync(globalLogDir, { recursive: true });
    }
    fs3.appendFileSync(globalLogFile, JSON.stringify(logEntry) + "\n", "utf8");
  } catch {
  }
}
async function logConfigBypass(file, reason, parameters) {
  const sessionId = getSessionId();
  let changeDiff;
  if (typeof parameters.old_string === "string" && typeof parameters.new_string === "string") {
    changeDiff = `--- old
+++ new
- ${parameters.old_string}
+ ${parameters.new_string}`;
  } else if (typeof parameters.content === "string") {
    const contentPreview = parameters.content.slice(0, CONTENT_PREVIEW_LENGTH);
    changeDiff = `New content (preview): ${contentPreview}${parameters.content.length > CONTENT_PREVIEW_LENGTH ? "..." : ""}`;
  }
  const logEntry = {
    bypassed: true,
    bypassMethod: "CLAUDE_WORKFLOW_ALLOW_CONFIG_EDITS=1",
    changeDiff,
    file,
    parameters: {
      file_path: parameters.file_path
    },
    reason,
    sessionId,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    type: "CONFIG_MODIFICATION_BYPASSED"
  };
  try {
    await writeToSessionLog("config-changes", logEntry);
    const globalLogDir = path4.join(__dirname, "../../logs");
    const globalLogFile = path4.join(globalLogDir, "config-changes.jsonl");
    if (!fs3.existsSync(globalLogDir)) {
      fs3.mkdirSync(globalLogDir, { recursive: true });
    }
    fs3.appendFileSync(globalLogFile, JSON.stringify(logEntry) + "\n", "utf8");
  } catch {
  }
}
function touchesCriticalSection(content) {
  return CRITICAL_SECTION_PATTERNS.some(
    (pattern) => content.includes(pattern)
  );
}
var inputData = "";
process.stdin.on("data", (chunk) => {
  inputData += chunk.toString();
});
process.stdin.on("end", () => {
  void (async () => {
    try {
      const event = JSON.parse(inputData);
      const toolName = event.tool_name ?? event.eventData?.toolName ?? "";
      const toolParameters = {};
      const rawParams = event.tool_input ?? event.eventData?.parameters ?? {};
      for (const [key, value] of Object.entries(rawParams)) {
        toolParameters[key] = typeof value === "string" ? value : void 0;
      }
      if (toolName === "Read" || toolName === "Glob" || toolName === "Grep") {
        safeJsonOutput({ permissionDecision: "allow" });
        exitSuccess();
      }
      const detection = detectConfigModification(toolName, toolParameters);
      if (!detection.blocked) {
        safeJsonOutput({ permissionDecision: "allow" });
        exitSuccess();
      }
      if (process.env.CLAUDE_WORKFLOW_ALLOW_CONFIG_EDITS === "1") {
        if (detection.file !== void 0 && detection.reason !== void 0) {
          await logConfigBypass(detection.file, detection.reason, toolParameters);
        }
        safeJsonOutput({ permissionDecision: "allow" });
        exitSuccess();
      }
      if (detection.file !== void 0 && detection.reason !== void 0) {
        await logConfigBlock(detection.file, detection.reason, toolParameters);
        const askingMessage = buildConfigAskMessage(detection.file, toolName);
        const response = {
          hookSpecificOutput: {
            additionalContext: askingMessage.userMessage,
            hookEventName: "PreToolUse",
            permissionDecision: "ask",
            permissionDecisionReason: askingMessage.reason,
            systemMessage: askingMessage.systemMessage
          }
        };
        safeJsonOutput(response);
        exitSuccess();
      }
    } catch {
      safeJsonOutput({ permissionDecision: "allow" });
      exitSuccess();
    }
  })();
});
