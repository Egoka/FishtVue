#!/usr/bin/env node

// src/templates/.claude/hooks/core/agent-state-manager.ts
import fs from "node:fs/promises";
import path from "node:path";
var AgentStateManager = class {
  static STATE_DIR = ".claude/logs";
  /**
   * Get state file path for specific agent/tool invocation
   */
  static getStatePath(sessionId, toolUseId) {
    return path.join(
      process.cwd(),
      this.STATE_DIR,
      `session-${sessionId}`,
      `agent-state-${toolUseId}.json`
    );
  }
  /**
   * Get active agent state file path for a session
   */
  static getActiveAgentPath(sessionId) {
    return path.join(
      process.cwd(),
      this.STATE_DIR,
      `active-agent-${sessionId}.json`
    );
  }
  /**
   * Read agent state for specific tool invocation
   */
  static async readAgentState(sessionId, toolUseId, _agentType) {
    const statePath = this.getStatePath(sessionId, toolUseId);
    try {
      await fs.access(statePath, fs.constants.R_OK);
      const content = await fs.readFile(statePath, "utf8");
      const state = JSON.parse(content);
      const stateTime = new Date(state.timestamp).getTime();
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1e3;
      if (now - stateTime > fiveMinutes) {
        return { agent: void 0, expectedSkills: [] };
      }
      return {
        agent: state.agent,
        expectedSkills: state.expectedSkills ?? []
      };
    } catch {
      return { agent: void 0, expectedSkills: [] };
    }
  }
  /**
   * Read active agent state for a session
   * Used by skill tracker to detect agent context
   */
  static async readActiveAgent(sessionId) {
    const statePath = this.getActiveAgentPath(sessionId);
    try {
      await fs.access(statePath, fs.constants.R_OK);
      const content = await fs.readFile(statePath, "utf8");
      const state = JSON.parse(content);
      const stateTime = new Date(state.timestamp).getTime();
      const now = Date.now();
      const thirtyMinutes = 30 * 60 * 1e3;
      if (now - stateTime > thirtyMinutes) {
        return { agent: void 0, expectedSkills: [] };
      }
      return {
        agent: state.agent,
        expectedSkills: state.expectedSkills
      };
    } catch {
      return { agent: void 0, expectedSkills: [] };
    }
  }
  /**
   * Write agent state for specific tool invocation
   * Creates: .claude/logs/session-{sessionId}/agent-state-{toolUseId}.json
   */
  static async writeAgentState(sessionId, toolUseId, agent, expectedSkills, agentType) {
    const stateDir = path.join(process.cwd(), this.STATE_DIR);
    const sessionDir = path.join(stateDir, `session-${sessionId}`);
    await fs.mkdir(sessionDir, { recursive: true });
    const statePath = this.getStatePath(sessionId, toolUseId);
    const state = {
      agent,
      agentType,
      expectedSkills: expectedSkills ?? [],
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    await fs.writeFile(statePath, JSON.stringify(state, void 0, 2), "utf8");
  }
  /**
   * Write active agent state for a session
   * Called when an agent is spawned to track the current agent context
   * Creates: .claude/logs/active-agent-{sessionId}.json
   */
  static async writeActiveAgent(sessionId, agent, expectedSkills, toolUseId) {
    const stateDir = path.join(process.cwd(), this.STATE_DIR);
    await fs.mkdir(stateDir, { recursive: true });
    const statePath = this.getActiveAgentPath(sessionId);
    const state = {
      agent,
      expectedSkills,
      toolUseId,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    await fs.writeFile(statePath, JSON.stringify(state, void 0, 2), "utf8");
  }
  /**
   * Clear active agent state for a session
   * Called when an agent completes
   */
  static async clearActiveAgent(sessionId) {
    const statePath = this.getActiveAgentPath(sessionId);
    try {
      await fs.unlink(statePath);
    } catch {
    }
  }
  /**
   * Delete agent state file (for cleanup)
   */
  static async deleteAgentState(sessionId, toolUseId) {
    const statePath = this.getStatePath(sessionId, toolUseId);
    try {
      await fs.unlink(statePath);
    } catch {
    }
  }
};
export {
  AgentStateManager
};
