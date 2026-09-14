#!/usr/bin/env node

// src/templates/.claude/scripts/view-analytics.ts
import fs from "node:fs";
import path from "node:path";
var LOGS_DIR = path.join(process.cwd(), ".claude/logs");
var HOOK_LOG = path.join(LOGS_DIR, "hook-activity.log");
var FILE_LOG = path.join(LOGS_DIR, "file-changes.log");
function analyzeAgents(logs, verbose) {
  const agentStats = {};
  const timestamps = {};
  for (const log of logs) {
    if (log.hook === "agent-selection-prompt" && log.status === "success" && log.agents) {
      for (const agent of log.agents) {
        agentStats[agent] = (agentStats[agent] ?? 0) + 1;
        timestamps[agent] ??= [];
        timestamps[agent].push(new Date(log.timestamp));
      }
    }
  }
  console.log("\n\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501");
  console.log("         AGENT RECOMMENDATIONS");
  console.log("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n");
  const sorted = Object.entries(agentStats).toSorted((a, b) => b[1] - a[1]);
  if (sorted.length === 0) {
    console.log("No agent recommendations found in the selected time period.\n");
    return;
  }
  const AGENT_NAME_PADDING = 35;
  const RECOMMENDATION_COUNT_PADDING = 15;
  console.log("Agent Name                          Recommendations   Last Recommended");
  console.log("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500");
  for (const [agent, count] of sorted) {
    const agentTimestamps = timestamps[agent];
    if (agentTimestamps === void 0 || agentTimestamps.length === 0) continue;
    const lastTime = agentTimestamps.toSorted((a, b) => b.getTime() - a.getTime())[0];
    if (lastTime === void 0) continue;
    const lastStr = lastTime.toLocaleDateString() + " " + lastTime.toLocaleTimeString();
    console.log(
      `${agent.padEnd(AGENT_NAME_PADDING)} ${String(count).padStart(RECOMMENDATION_COUNT_PADDING)}   ${lastStr}`
    );
  }
  console.log("");
  if (verbose) {
    console.log("\nNote: Recommendations indicate when an agent was suggested, not necessarily used.");
  }
}
function analyzeFiles(days, verbose) {
  if (!fs.existsSync(FILE_LOG)) {
    console.log("\n\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501");
    console.log("           FILE MODIFICATIONS");
    console.log("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n");
    console.log("No file modification logs found.\n");
    return;
  }
  const content = fs.readFileSync(FILE_LOG, "utf8");
  const lines = content.trim().split("\n").filter(Boolean);
  const cutoffDate = /* @__PURE__ */ new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const fileStats = {};
  const toolStats = { Edit: 0, MultiEdit: 0, Write: 0 };
  for (const line of lines) {
    const match = /\[(.+?)\] (Edit|Write|MultiEdit): (.+)/.exec(line);
    if (match) {
      const [, timestamp, tool, filepath] = match;
      if (timestamp === void 0 || timestamp === "" || tool === void 0 || tool === "" || filepath === void 0 || filepath === "") continue;
      const date = new Date(timestamp);
      if (date >= cutoffDate) {
        fileStats[filepath] = (fileStats[filepath] ?? 0) + 1;
        toolStats[tool] = (toolStats[tool] ?? 0) + 1;
      }
    }
  }
  console.log("\n\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501");
  console.log("           FILE MODIFICATIONS");
  console.log("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n");
  console.log(`Total Operations: ${String((toolStats.Edit ?? 0) + (toolStats.Write ?? 0) + (toolStats.MultiEdit ?? 0))}`);
  console.log(`  - Edits: ${String(toolStats.Edit ?? 0)}`);
  console.log(`  - Writes: ${String(toolStats.Write ?? 0)}`);
  console.log(`  - MultiEdits: ${String(toolStats.MultiEdit ?? 0)}
`);
  const TOP_FILES_LIMIT = 10;
  const COUNT_PADDING = 3;
  if (verbose && Object.keys(fileStats).length > 0) {
    console.log("Most Modified Files:");
    console.log("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500");
    const sorted = Object.entries(fileStats).toSorted((a, b) => b[1] - a[1]).slice(0, TOP_FILES_LIMIT);
    for (const [file, count] of sorted) {
      console.log(`${String(count).padStart(COUNT_PADDING)}  ${file}`);
    }
  }
  console.log("");
}
function analyzeSkills(logs, verbose) {
  const skillStats = {};
  const criticalCount = {};
  const suggestedCount = {};
  for (const log of logs) {
    if (log.hook === "skill-activation-prompt" && log.status === "success") {
      if (log.critical !== void 0) {
        for (const skill of log.critical) {
          skillStats[skill] = (skillStats[skill] ?? 0) + 1;
          criticalCount[skill] = (criticalCount[skill] ?? 0) + 1;
        }
      }
      if (log.suggested !== void 0) {
        for (const skill of log.suggested) {
          skillStats[skill] = (skillStats[skill] ?? 0) + 1;
          suggestedCount[skill] = (suggestedCount[skill] ?? 0) + 1;
        }
      }
    }
  }
  console.log("\n\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501");
  console.log("           SKILL SUGGESTIONS");
  console.log("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n");
  const sorted = Object.entries(skillStats).toSorted((a, b) => b[1] - a[1]);
  if (sorted.length === 0) {
    console.log("No skill suggestions found in the selected time period.\n");
    return;
  }
  const SKILL_NAME_PADDING = 35;
  const TOTAL_COUNT_PADDING = 5;
  const CRITICAL_COUNT_PADDING = 8;
  const SUGGESTED_COUNT_PADDING = 9;
  console.log("Skill Name                          Total   Critical   Suggested");
  console.log("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500");
  for (const [skill, count] of sorted) {
    const critical = criticalCount[skill] ?? 0;
    const suggested = suggestedCount[skill] ?? 0;
    console.log(
      `${skill.padEnd(SKILL_NAME_PADDING)} ${String(count).padStart(TOTAL_COUNT_PADDING)}   ${String(critical).padStart(CRITICAL_COUNT_PADDING)}   ${String(suggested).padStart(SUGGESTED_COUNT_PADDING)}`
    );
  }
  console.log("");
  if (verbose) {
    console.log("\nNote: Critical = Required for task, Suggested = Optional recommendation");
  }
}
function main() {
  const options = parseArgs();
  const logs = readLogs(HOOK_LOG, options.days);
  if (options.type === "all" || options.type === "summary") {
    showSummary(logs, options.days);
  }
  if (options.type === "all" || options.type === "skills") {
    analyzeSkills(logs, options.verbose);
  }
  if (options.type === "all" || options.type === "agents") {
    analyzeAgents(logs, options.verbose);
  }
  if (options.type === "all" || options.type === "files") {
    analyzeFiles(options.days, options.verbose);
  }
}
function parseArgs() {
  const ARGV_SLICE_START = 2;
  const DEFAULT_DAYS = 7;
  const args = process.argv.slice(ARGV_SLICE_START);
  const options = {
    days: DEFAULT_DAYS,
    type: "all",
    // all, skills, agents, files
    verbose: false
  };
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--days":
      case "-d": {
        const daysArg = args[++i];
        if (daysArg !== void 0 && daysArg !== "") {
          options.days = Number.parseInt(daysArg);
        }
        break;
      }
      case "--help":
      case "-h": {
        showHelp();
        process.exit(0);
      }
      case "--type":
      case "-t": {
        const typeArg = args[++i];
        if (typeArg !== void 0 && typeArg !== "") {
          options.type = typeArg;
        }
        break;
      }
      case "--verbose":
      case "-v": {
        options.verbose = true;
        break;
      }
      default: {
        break;
      }
    }
  }
  return options;
}
function readLogs(logPath, days) {
  if (!fs.existsSync(logPath)) {
    return [];
  }
  const content = fs.readFileSync(logPath, "utf8");
  const lines = content.trim().split("\n").filter(Boolean);
  const cutoffDate = /* @__PURE__ */ new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  return lines.map((line) => {
    try {
      return JSON.parse(line);
    } catch {
      return void 0;
    }
  }).filter((log) => {
    if (!log) return false;
    const logDate = new Date(log.timestamp);
    return logDate >= cutoffDate;
  });
}
function showHelp() {
  console.log(`
Usage: node .claude/scripts/view-analytics.js [options]

Options:
  -t, --type <type>    Type of analytics: all, skills, agents, files (default: all)
  -d, --days <number>  Number of days to analyze (default: 7)
  -v, --verbose        Show detailed information
  -h, --help           Show this help message

Examples:
  node .claude/scripts/view-analytics.js --type skills
  node .claude/scripts/view-analytics.js --type agents --days 30
  node .claude/scripts/view-analytics.js --verbose
`);
}
function showSummary(logs, days) {
  const totalPrompts = logs.filter((l) => l.event === "UserPromptSubmit").length;
  const skillSuggestions = logs.filter(
    (l) => l.hook === "skill-activation-prompt" && l.status === "success" && (l.critical !== void 0 || l.suggested !== void 0)
  ).length;
  const agentRecommendations = logs.filter(
    (l) => l.hook === "agent-selection-prompt" && l.status === "success" && l.agents !== void 0
  ).length;
  console.log("\n\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501");
  console.log(`         SUMMARY (Last ${String(days)} days)`);
  console.log("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n");
  console.log(`Total User Prompts:      ${String(totalPrompts)}`);
  console.log(`Skill Suggestions:       ${String(skillSuggestions)}`);
  console.log(`Agent Recommendations:   ${String(agentRecommendations)}`);
  console.log("");
}
main();
