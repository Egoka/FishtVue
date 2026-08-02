#!/usr/bin/env node

// src/templates/.claude/hooks/core/path-resolver.ts
import fs from "node:fs";
import path from "node:path";
function resolveClaudeWorkflowPath() {
  try {
    const configPath = resolveProjectPath(".claude", "workflow-config.json");
    let config;
    try {
      config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    } catch (error) {
      if (error.code === "ENOENT") {
        return void 0;
      }
      throw error;
    }
    const pkgPath = config._packagePath;
    if (pkgPath === void 0 || pkgPath === "") {
      return void 0;
    }
    const packageJsonPath = path.resolve(pkgPath, "..", "package.json");
    try {
      fs.statSync(packageJsonPath);
      return pkgPath;
    } catch (error) {
      if (error.code === "ENOENT") {
        return void 0;
      }
      throw error;
    }
  } catch (error) {
    console.warn(`[path-resolver] Failed to resolve package path from config: ${error instanceof Error ? error.message : String(error)}`);
  }
  return void 0;
}
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
var path_resolver_default = {
  resolveClaudeWorkflowPath,
  resolveProjectPath,
  resolveProjectRoot
};
export {
  path_resolver_default as default,
  resolveClaudeWorkflowPath,
  resolveProjectPath,
  resolveProjectRoot
};
