#!/usr/bin/env node

// src/templates/.claude/hooks/orchestration/agent-schema-injector.ts
import * as fs2 from "node:fs";
import * as path2 from "node:path";

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

// src/templates/.claude/hooks/orchestration/agent-schema-injector.ts
function getSchemaDir() {
  const pkgPath = resolveClaudeWorkflowPath();
  if (pkgPath) {
    return path2.join(pkgPath, "..", "output-types");
  }
  return path2.join(process.cwd(), "packages/claude-workflow/src/output-types");
}
var SCHEMA_DIR = getSchemaDir();
function loadSchema(agentType) {
  const schemaPath = path2.join(SCHEMA_DIR, `${agentType}.schema.json`);
  try {
    if (!fs2.existsSync(schemaPath)) {
      const basePath = path2.join(SCHEMA_DIR, "agent-output-base.schema.json");
      if (fs2.existsSync(basePath)) {
        const content2 = fs2.readFileSync(basePath, "utf8");
        return JSON.parse(content2);
      }
      return null;
    }
    const content = fs2.readFileSync(schemaPath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    console.error(`[agent-schema-injector] Failed to load schema: ${schemaPath}`, error);
    return null;
  }
}
function summarizeSchema(schema) {
  const lines = [];
  if (schema.title) {
    lines.push(`Schema: ${schema.title}`);
  }
  if (schema.description) {
    lines.push(`Description: ${schema.description}`);
  }
  if (schema.required && schema.required.length > 0) {
    lines.push(`Required fields: ${schema.required.join(", ")}`);
  }
  if (schema.properties) {
    lines.push("\nExpected structure:");
    for (const [key, value] of Object.entries(schema.properties)) {
      let line = `  - ${key}`;
      if (value.type) line += ` (${value.type})`;
      if (value.enum) line += `: one of [${value.enum.join(", ")}]`;
      if (value.items?.type) line += ` of ${value.items.type}`;
      if (value.description) line += `: ${value.description}`;
      lines.push(line);
    }
  }
  return lines.join("\n");
}
function buildSchemaContext(schema, agentType) {
  const schemaSummary = summarizeSchema(schema);
  return `<output-schema>
Your response MUST end with a JSON block conforming to this schema:

Agent Type: ${agentType}
${schemaSummary}

Wrap your JSON output with:
\`\`\`json
{ ... }
\`\`\`

The JSON will be validated against the schema. Missing required fields or wrong types will cause validation failures.
</output-schema>

`;
}
function processEvent(event) {
  const toolName = event.tool_name ?? "";
  const toolInput = event.tool_input ?? {};
  if (toolName !== "Task" || !toolInput.subagent_type) {
    return {};
  }
  const agentType = toolInput.subagent_type;
  const schema = loadSchema(agentType);
  if (!schema) {
    return {};
  }
  const schemaContext = buildSchemaContext(schema, agentType);
  const originalPrompt = toolInput.prompt ?? "";
  const augmentedPrompt = schemaContext + originalPrompt;
  return {
    tool_input: {
      ...toolInput,
      prompt: augmentedPrompt
    }
  };
}
var inputData = "";
process.stdin.on("data", (chunk) => {
  inputData += String(chunk);
});
process.stdin.on("end", () => {
  try {
    const event = JSON.parse(inputData);
    const output = processEvent(event);
    console.log(JSON.stringify(output));
    process.exit(0);
  } catch (error) {
    console.error(
      "[agent-schema-injector] Error:",
      error instanceof Error ? error.message : String(error)
    );
    console.log("{}");
    process.exit(0);
  }
});
process.stdin.on("close", () => {
  if (!inputData) {
    console.log("{}");
    process.exit(0);
  }
});
