// src/templates/.claude/scripts/session-number-tracker.ts
import fs from "node:fs";
import path from "node:path";
var STATE_FILE = ".claude/logs/session-counter.json";
function getSessionNumber(projectPath, sessionId) {
  const stateFile = path.join(projectPath, STATE_FILE);
  let state = {
    currentSessionId: "",
    sessionNumber: 0,
    projectPath
  };
  if (fs.existsSync(stateFile)) {
    try {
      state = JSON.parse(fs.readFileSync(stateFile, "utf8"));
    } catch {
    }
  }
  if (state.currentSessionId !== sessionId) {
    state.currentSessionId = sessionId;
    state.sessionNumber += 1;
    const stateDir = path.dirname(stateFile);
    if (!fs.existsSync(stateDir)) {
      fs.mkdirSync(stateDir, { recursive: true });
    }
    fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
  }
  return state.sessionNumber;
}
export {
  getSessionNumber
};
