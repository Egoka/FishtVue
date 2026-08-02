#!/usr/bin/env node

// src/templates/.claude/scripts/session-sequence-counter.ts
import fsSync from "node:fs";
import fs2 from "node:fs/promises";
import path2 from "node:path";

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

// src/templates/.claude/scripts/session-sequence-counter.ts
var MAX_RETRIES = 5;
var BASE_BACKOFF_MS = 5;
var BACKOFF_MULTIPLIER = 2;
var JITTER_MAX_MS = 5;
var JSON_INDENT = 2;
var FALLBACK_MODULO = 1e6;
var MILLISECONDS_TO_SECONDS = 1e3;
async function getNextSequenceNumber(providedSessionId) {
  try {
    const sessionId = providedSessionId ?? getSessionId();
    const logsDir = resolveProjectPath(".claude", "logs");
    let sessionDir = path2.join(logsDir, `session-${sessionId}`);
    if (!fsSync.existsSync(sessionDir)) {
      try {
        const entries = fsSync.readdirSync(logsDir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory() && entry.name.endsWith(`-${sessionId}`)) {
            sessionDir = path2.join(logsDir, entry.name);
            break;
          }
        }
      } catch {
      }
    }
    const metadataPath = path2.join(sessionDir, "metadata.json");
    let retries = MAX_RETRIES;
    let lastError = void 0;
    while (retries > 0) {
      try {
        let metadata;
        try {
          const content = await fs2.readFile(metadataPath, "utf8");
          const parsed = JSON.parse(content);
          metadata = parsed;
        } catch (error) {
          const nodeErr = error;
          if (nodeErr.code === "ENOENT") {
            return 1;
          }
          throw error;
        }
        const currentCounter = metadata.sequenceCounter ?? 0;
        const nextCounter = currentCounter + 1;
        metadata.sequenceCounter = nextCounter;
        const tempPath = `${metadataPath}.${String(process.pid)}.${String(Date.now())}.tmp`;
        await fs2.writeFile(tempPath, JSON.stringify(metadata, void 0, JSON_INDENT), "utf8");
        await fs2.rename(tempPath, metadataPath);
        return nextCounter;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        retries--;
        try {
          const tempPath = `${metadataPath}.${String(process.pid)}.${String(Date.now())}.tmp`;
          if (fsSync.existsSync(tempPath)) {
            fsSync.unlinkSync(tempPath);
          }
        } catch {
        }
        if (retries === 0) {
          break;
        }
        const backoff = BASE_BACKOFF_MS * Math.pow(BACKOFF_MULTIPLIER, MAX_RETRIES - retries);
        const jitter = Math.random() * JITTER_MAX_MS;
        await new Promise((resolve) => setTimeout(resolve, backoff + jitter));
      }
    }
    throw lastError;
  } catch (error) {
    console.error("Sequence counter error:", error instanceof Error ? error.message : String(error));
    return Math.floor(Date.now() / MILLISECONDS_TO_SECONDS) % FALLBACK_MODULO;
  }
}
var session_sequence_counter_default = { getNextSequenceNumber };
export {
  session_sequence_counter_default as default,
  getNextSequenceNumber
};
