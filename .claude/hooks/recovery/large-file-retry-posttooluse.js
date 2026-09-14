#!/usr/bin/env node

// src/templates/.claude/hooks/recovery/large-file-retry-posttooluse.ts
var TOKENS_PER_LINE = 12;
var MAX_TOKEN_USAGE_RATIO = 0.8;
var MAX_CHUNKS_TO_DISPLAY = 5;
var RADIX_DECIMAL = 10;
var inputData = "";
process.stdin.on("data", (chunk) => {
  inputData += chunk.toString("utf8");
});
process.stdin.on("end", () => {
  try {
    const event = JSON.parse(inputData);
    const toolName = event.tool_name ?? event.toolName ?? "";
    const toolResult = event.tool_response ?? event.result ?? "";
    const toolParams = event.tool_input ?? event.parameters ?? {};
    if (toolName !== "Read") {
      process.stdout.write("{}");
      process.exit(0);
    }
    const resultStr = typeof toolResult === "string" ? toolResult : JSON.stringify(toolResult);
    const tokenLimitMatch = /File content \((\d+) tokens?\) exceeds maximum allowed tokens \((\d+)\)/i.exec(resultStr);
    if (tokenLimitMatch === null) {
      process.stdout.write("{}");
      process.exit(0);
    }
    const actualTokens = Number.parseInt(tokenLimitMatch[1] ?? "0", RADIX_DECIMAL);
    const maxTokens = Number.parseInt(tokenLimitMatch[2] ?? "0", RADIX_DECIMAL);
    const filePath = "file_path" in toolParams && typeof toolParams.file_path === "string" ? toolParams.file_path : "the file";
    const safeLineCount = Math.floor(maxTokens * MAX_TOKEN_USAGE_RATIO / TOKENS_PER_LINE);
    const estimatedTotalLines = Math.ceil(actualTokens / TOKENS_PER_LINE);
    const chunksNeeded = Math.ceil(estimatedTotalLines / safeLineCount);
    const retryInstructions = buildRetryInstructions(
      filePath,
      actualTokens,
      maxTokens,
      safeLineCount,
      estimatedTotalLines,
      chunksNeeded
    );
    const response = {
      hookSpecificOutput: {
        additionalContext: retryInstructions,
        hookEventName: "PostToolUse"
      }
    };
    process.stdout.write(JSON.stringify(response));
    process.exit(0);
  } catch (error) {
    let errorMessage;
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    } else if (typeof error === "object" && error !== null && "message" in error) {
      const errorWithMessage = error;
      errorMessage = errorWithMessage.message;
    } else {
      errorMessage = String(error);
    }
    process.stderr.write(`Large file retry hook error: ${errorMessage}
`);
    process.stdout.write("{}");
    process.exit(0);
  }
});
function buildRetryInstructions(filePath, actualTokens, maxTokens, safeLineCount, estimatedTotalLines, chunksNeeded) {
  let msg = "\n";
  msg += "\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n";
  msg += "\u{1F4C4} LARGE FILE DETECTED - RETRY WITH PAGINATION\n";
  msg += "\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n\n";
  msg += `**File:** ${filePath}
`;
  msg += `**Size:** ${actualTokens.toLocaleString()} tokens (max: ${maxTokens.toLocaleString()})
`;
  msg += `**Estimated lines:** ~${estimatedTotalLines.toLocaleString()}

`;
  msg += "**\u26A1 REQUIRED ACTION:**\n";
  msg += "You MUST retry reading this file with pagination. Do NOT skip it.\n\n";
  msg += "**Option 1: Read first chunk (recommended start)**\n";
  msg += "```\n";
  msg += `Read file_path="${filePath}" limit=${String(safeLineCount)}
`;
  msg += "```\n\n";
  if (chunksNeeded > 1) {
    msg += "**Option 2: Read specific section (if you know what you need)**\n";
    msg += "```\n";
    msg += `Read file_path="${filePath}" offset=<start_line> limit=${String(safeLineCount)}
`;
    msg += "```\n\n";
    msg += `**Option 3: Read in ${String(chunksNeeded)} chunks (for full file)**
`;
    for (let i = 0; i < Math.min(chunksNeeded, MAX_CHUNKS_TO_DISPLAY); i++) {
      const offset = i * safeLineCount;
      msg += `  - Chunk ${String(i + 1)}: offset=${String(offset)}, limit=${String(safeLineCount)}
`;
    }
    if (chunksNeeded > MAX_CHUNKS_TO_DISPLAY) {
      msg += `  - ... (${String(chunksNeeded - MAX_CHUNKS_TO_DISPLAY)} more chunks)
`;
    }
    msg += "\n";
  }
  msg += "**Option 4: Use Grep instead (if searching for specific content)**\n";
  msg += "```\n";
  msg += `Grep pattern="<your_search_term>" path="${filePath}" output_mode="content"
`;
  msg += "```\n\n";
  msg += "\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n";
  msg += "\u26A0\uFE0F  DO NOT SKIP THIS FILE - Important data may be missed!\n";
  msg += "\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n";
  return msg;
}
