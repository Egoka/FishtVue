#!/usr/bin/env node

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
function isProcessRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}
function cleanupStaleLockFiles(logsDir) {
  try {
    const entries = readdirSync(logsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && entry.name.startsWith(".session-") && entry.name.endsWith(".lock")) {
        const match = entry.name.match(/^\.session-(\d+)\.lock$/);
        if (match) {
          const lockPid = parseInt(match[1], 10);
          if (!isProcessRunning(lockPid)) {
            const lockPath = path2.join(logsDir, entry.name);
            try {
              unlinkSync(lockPath);
            } catch {
            }
          }
        }
      }
    }
  } catch {
  }
}
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
function getSessionFolderName() {
  const timestamp = Math.floor(Date.now() / 1e3);
  const claudePid = process.ppid || process.pid;
  return `session-${timestamp}-${claudePid}`;
}
function findExistingSessionFolderByProcessTree() {
  const logsDir = resolveProjectPath(".claude", "logs");
  const sessionPids = /* @__PURE__ */ new Map();
  try {
    const entries = readdirSync(logsDir, { withFileTypes: true });
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
    const parentPid = getParentPid(currentPid);
    if (parentPid === void 0) break;
    currentPid = parentPid;
  }
  return void 0;
}
function findOrCreateSessionFolder() {
  const logsDir = resolveProjectPath(".claude", "logs");
  const claudePid = String(process.ppid || process.pid);
  const existingFolder = findExistingSessionFolderByProcessTree();
  if (existingFolder) {
    return existingFolder;
  }
  const folderName = getSessionFolderName();
  const folderPath = path2.join(logsDir, folderName);
  const lockPath = path2.join(logsDir, `.session-${claudePid}.lock`);
  if (!existsSync(logsDir)) {
    mkdirSync(logsDir, { recursive: true });
  }
  let canWriteToLogsDir = true;
  try {
    const testFile = path2.join(logsDir, `.write-test-${claudePid}`);
    const testFd = openSync(testFile, constants.O_CREAT | constants.O_EXCL | constants.O_RDWR, 420);
    closeSync(testFd);
    unlinkSync(testFile);
  } catch {
    canWriteToLogsDir = false;
  }
  if (!canWriteToLogsDir) {
    process.stderr.write(
      `[session-state] Warning: ${logsDir} is not writable (possibly owned by root).
Fix with: sudo chown -R $USER:$USER ${logsDir}
`
    );
    if (!existsSync(folderPath)) {
      try {
        mkdirSync(folderPath, { recursive: true });
      } catch {
      }
    }
    return folderName;
  }
  cleanupStaleLockFiles(logsDir);
  let lockFd = null;
  let retryCount = 0;
  const MAX_RETRIES = 2;
  while (retryCount <= MAX_RETRIES) {
    try {
      lockFd = openSync(
        lockPath,
        constants.O_CREAT | constants.O_EXCL | constants.O_RDWR,
        420
      );
      if (!existsSync(folderPath)) {
        mkdirSync(folderPath, { recursive: true });
      }
      break;
    } catch (err) {
      const errCode = err.code;
      if (errCode === "EEXIST") {
        const start = Date.now();
        const MAX_WAIT_MS = 1e3;
        let delay = 10;
        while (Date.now() - start < MAX_WAIT_MS) {
          const foundFolder = findExistingSessionFolderByProcessTree();
          if (foundFolder) {
            return foundFolder;
          }
          const spinEnd = Date.now() + delay;
          while (Date.now() < spinEnd) {
          }
          delay = Math.min(delay * 2, 100);
        }
        const lockMatch = lockPath.match(/\.session-(\d+)\.lock$/);
        if (lockMatch) {
          const lockPid = parseInt(lockMatch[1], 10);
          if (!isProcessRunning(lockPid)) {
            try {
              unlinkSync(lockPath);
              retryCount++;
              continue;
            } catch {
            }
          }
        }
        throw err;
      } else if (errCode === "EACCES") {
        const lockMatch = lockPath.match(/\.session-(\d+)\.lock$/);
        if (lockMatch && retryCount < MAX_RETRIES) {
          const lockPid = parseInt(lockMatch[1], 10);
          if (!isProcessRunning(lockPid)) {
            try {
              unlinkSync(lockPath);
              retryCount++;
              continue;
            } catch {
            }
          }
        }
        if (!existsSync(folderPath)) {
          try {
            mkdirSync(folderPath, { recursive: true });
            return folderName;
          } catch {
          }
        } else {
          return folderName;
        }
        throw err;
      } else {
        throw err;
      }
    } finally {
      if (lockFd !== null) {
        closeSync(lockFd);
        if (existsSync(folderPath)) {
          try {
            unlinkSync(lockPath);
          } catch {
          }
        }
        lockFd = null;
      }
    }
  }
  return folderName;
}
export {
  findExistingSessionFolderByProcessTree,
  findOrCreateSessionFolder,
  getSessionId,
  getStableAncestorPid
};
