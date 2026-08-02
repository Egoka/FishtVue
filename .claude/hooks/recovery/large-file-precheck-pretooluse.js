#!/usr/bin/env node

// src/templates/.claude/hooks/recovery/large-file-precheck-pretooluse.ts
import * as fs from "node:fs";
import * as path from "node:path";
var MAX_SAFE_TOKENS = 25e3;
var CHARS_PER_TOKEN = 4;
var MAX_SAFE_BYTES = MAX_SAFE_TOKENS * CHARS_PER_TOKEN;
var CHARS_PER_LINE = 80;
var TOKENS_PER_LINE = 12;
var BYTES_PER_KB = 1024;
var SIZE_DECIMAL_PLACES = 2;
var CHUNK_SAFETY_MARGIN = 0.8;
var MAX_CHUNKS_TO_DISPLAY = 3;
function safeJsonOutput(obj) {
  try {
    console.log(JSON.stringify(obj));
  } catch (error) {
    console.error("[PreToolUse] JSON stringify failed:", error);
    console.log('{"permissionDecision":"allow"}');
  }
}
var inputData = "";
process.stdin.on("data", (chunk) => {
  inputData += chunk.toString();
});
process.stdin.on("end", () => {
  try {
    const event = JSON.parse(inputData);
    const toolName = event.tool_name ?? event.tool?.name ?? event.toolName ?? "";
    const toolParameters = event.tool_input ?? event.tool?.parameters ?? event.parameters ?? {};
    console.error("[PreToolUse:LargeFilePrecheck] Processing tool:", toolName);
    if (toolName !== "Read") {
      console.error("[PreToolUse:LargeFilePrecheck] Not a Read tool, allowing");
      safeJsonOutput({ permissionDecision: "allow" });
      return;
    }
    const filePath = toolParameters.file_path;
    if (filePath === void 0 || filePath === "") {
      console.error("[PreToolUse:LargeFilePrecheck] No file_path provided, allowing");
      safeJsonOutput({ permissionDecision: "allow" });
      return;
    }
    const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
    console.error("[PreToolUse:LargeFilePrecheck] Checking file:", absolutePath);
    let fileSize;
    try {
      const stats = fs.statSync(absolutePath);
      fileSize = stats.size;
      console.error(`[PreToolUse:LargeFilePrecheck] File size: ${fileSize.toString()} bytes (${(fileSize / BYTES_PER_KB).toFixed(SIZE_DECIMAL_PLACES)} KB)`);
    } catch (error) {
      console.error("[PreToolUse:LargeFilePrecheck] Could not stat file, allowing Read to handle:", error);
      safeJsonOutput({ permissionDecision: "allow" });
      return;
    }
    if (fileSize > MAX_SAFE_BYTES) {
      console.error("[PreToolUse:LargeFilePrecheck] File too large, blocking read operation");
      const blockingMessage = buildBlockingMessage(filePath, fileSize);
      const response = {
        hookSpecificOutput: {
          additionalContext: blockingMessage.userMessage,
          hookEventName: "PreToolUse",
          systemMessage: blockingMessage.systemMessage
        },
        permissionDecision: "deny",
        reason: blockingMessage.reason
      };
      safeJsonOutput(response);
      return;
    }
    console.error("[PreToolUse:LargeFilePrecheck] File size acceptable, allowing");
    safeJsonOutput({ permissionDecision: "allow" });
  } catch (error) {
    console.error("[PreToolUse:LargeFilePrecheck] Unhandled error:", error);
    safeJsonOutput({ permissionDecision: "allow" });
  }
});
function buildBlockingMessage(filePath, fileSize) {
  const estimatedTokens = Math.ceil(fileSize / CHARS_PER_TOKEN);
  const estimatedLines = Math.ceil(fileSize / CHARS_PER_LINE);
  const safeLineCount = Math.floor(MAX_SAFE_TOKENS * CHUNK_SAFETY_MARGIN / TOKENS_PER_LINE);
  const chunksNeeded = Math.ceil(estimatedLines / safeLineCount);
  const reason = "File too large - would exceed token limits";
  let userMessage = "\n";
  userMessage += "\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n";
  userMessage += "\u{1F4C4} LARGE FILE DETECTED - READ BLOCKED\n";
  userMessage += "\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n\n";
  userMessage += `**File:** ${filePath}
`;
  userMessage += `**Size:** ${(fileSize / BYTES_PER_KB).toFixed(SIZE_DECIMAL_PLACES)} KB (${fileSize.toLocaleString()} bytes)
`;
  userMessage += `**Estimated tokens:** ~${estimatedTokens.toLocaleString()} (max: ${MAX_SAFE_TOKENS.toLocaleString()})
`;
  userMessage += `**Estimated lines:** ~${estimatedLines.toLocaleString()}

`;
  userMessage += "**\u26A1 REQUIRED ACTION:**\n";
  userMessage += "This file is too large to read at once. Use one of these approaches:\n\n";
  userMessage += "**Option 1: Read with pagination (recommended)**\n";
  userMessage += "```\n";
  userMessage += `Read(file_path="${filePath}", limit=${safeLineCount.toString()})
`;
  userMessage += "```\n\n";
  const minChunksForMultipleOptions = 1;
  if (chunksNeeded > minChunksForMultipleOptions) {
    userMessage += "**Option 2: Read specific section**\n";
    userMessage += "```\n";
    userMessage += `Read(file_path="${filePath}", offset=<start_line>, limit=${safeLineCount.toString()})
`;
    userMessage += "```\n\n";
    userMessage += `**Option 3: Read in ${chunksNeeded.toString()} chunks (full file)**
`;
    for (let i = 0; i < Math.min(chunksNeeded, MAX_CHUNKS_TO_DISPLAY); i++) {
      const offset = i * safeLineCount;
      const chunkNumber = i + 1;
      userMessage += `  - Chunk ${chunkNumber.toString()}: offset=${offset.toString()}, limit=${safeLineCount.toString()}
`;
    }
    if (chunksNeeded > MAX_CHUNKS_TO_DISPLAY) {
      const remainingChunks = chunksNeeded - MAX_CHUNKS_TO_DISPLAY;
      userMessage += `  - ... (${remainingChunks.toString()} more chunks)
`;
    }
    userMessage += "\n";
  }
  userMessage += "**Option 4: Use Grep for searching**\n";
  userMessage += "```\n";
  userMessage += `Grep(pattern="<search_term>", path="${filePath}", output_mode="content")
`;
  userMessage += "```\n\n";
  userMessage += "\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n";
  userMessage += "\u26A0\uFE0F  Reading without pagination will fail with token limit error!\n";
  userMessage += "\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n";
  const systemMessage = `\u26A0\uFE0F LARGE FILE BLOCKED

File: ${filePath}
Size: ${(fileSize / BYTES_PER_KB).toFixed(SIZE_DECIMAL_PLACES)} KB (~${estimatedTokens.toLocaleString()} tokens)

Use pagination or Grep instead.`;
  return { reason, systemMessage, userMessage };
}
