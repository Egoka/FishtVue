#!/usr/bin/env node

// src/templates/.claude/hooks/recovery/goal-context-restore.ts
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
var MAX_GOAL_TEXT = 500;
var MAX_LIST_ITEMS = 5;
function outputEmpty() {
  console.log(JSON.stringify({}));
}
function loadGoalState() {
  const goalsDir = join(process.cwd(), ".claude", "goals");
  const pointerPath = join(goalsDir, "active.json");
  if (!existsSync(pointerPath)) return null;
  try {
    const pointerRaw = readFileSync(pointerPath, "utf-8");
    const pointer = JSON.parse(pointerRaw);
    const goalPath = join(goalsDir, `${pointer.goal_id}.json`);
    if (!existsSync(goalPath)) return null;
    const raw = readFileSync(goalPath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function truncateList(items, max) {
  if (items.length === 0) return "(none)";
  const capped = items.slice(0, max);
  const lines = capped.map((item) => `  - ${item}`);
  if (items.length > max) {
    lines.push(`  - ... and ${String(items.length - max)} more`);
  }
  return lines.join("\n");
}
async function main() {
  try {
    const state = loadGoalState();
    if (!state || state.status !== "in_progress") {
      outputEmpty();
      return;
    }
    const goalText = state.goal_text.length > MAX_GOAL_TEXT ? state.goal_text.slice(0, MAX_GOAL_TEXT) + "..." : state.goal_text;
    const progress = state.cumulative_progress;
    const lastAttempt = state.attempts.at(-1);
    let nextStepsSection = "";
    if (lastAttempt && lastAttempt.next_steps.length > 0) {
      nextStepsSection = `
NEXT STEPS (from attempt ${String(lastAttempt.attempt_number)}):
${lastAttempt.next_steps.map((s) => `  - ${s}`).join("\n")}`;
    }
    const context = `
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
GOAL CONTEXT RESTORED (post-compact)
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501

GOAL: ${goalText}

Attempt: ${String(state.current_attempt)}${state.config.max_attempts !== void 0 ? `/${String(state.config.max_attempts)}` : ""}

COMPLETED:
${truncateList(progress.completed, MAX_LIST_ITEMS)}

IN PROGRESS:
${truncateList(progress.in_progress, MAX_LIST_ITEMS)}

NOT STARTED:
${truncateList(progress.not_started, MAX_LIST_ITEMS)}
${progress.key_decisions.length > 0 ? `
KEY DECISIONS (do not re-litigate):
${truncateList(progress.key_decisions, MAX_LIST_ITEMS)}` : ""}
${nextStepsSection}

Continue working toward the goal. When complete, output: GOAL_COMPLETE
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
`.trim();
    const output = {
      hookSpecificOutput: {
        additionalContext: context,
        hookEventName: "UserPromptSubmit"
      }
    };
    console.log(JSON.stringify(output));
  } catch (error) {
    console.error("[goal-context-restore] Error:", error);
    outputEmpty();
  }
}
main().catch((error) => {
  console.error("[goal-context-restore] Unhandled error:", error);
  outputEmpty();
});
