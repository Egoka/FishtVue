/**
 * Workflow State Management
 *
 * Tracks feature-planner completion and task creation status to enforce proper workflow.
 * Enables hooks to verify: feature-planner → task-maker spawning → task creation → implementation
 *
 * Extended with multi-phase workflow orchestration support:
 * - Workflow phase tracking with iteration limits
 * - Phase transition validation and history
 * - Concurrent workflow support (multiple workflow_id values)
 * - State recovery from corrupted files
 *
 * State is stored per-session to avoid conflicts between concurrent Claude sessions.
 * Uses TTL (30 minutes) to prevent stale state from affecting workflow enforcement.
 *
 * Session Isolation:
 * - Each Claude Code session gets its own workflow state file: workflow-state.json
 * - Stored in session-specific folder: .claude/logs/session-{sessionId}/
 * - Session ID determined by process.ppid (Claude's PID)
 *
 * @module workflow-state
 */
import { getSessionId } from "./session-state.js";
export { getSessionId };
/**
 * Pointer to an active workflow.
 * Stored at .claude/workflows/active/pointer-{workflowId}.json (one per workflow)
 * PID is used for stale detection: if PID is dead, workflow is orphaned.
 */
export interface WorkflowPointer {
    workflow_id: string;
    workflow_name: string;
    pid: number;
    started_at: string;
    session_id: string;
}
/**
 * Get absolute path to .claude/workflows/active/ directory
 */
export declare function getDurableWorkflowsDir(): string;
/**
 * Get absolute path to .claude/workflows/active/{workflowId}.json
 */
export declare function getDurableWorkflowPath(workflowId: string): string;
/**
 * Get absolute path to .claude/workflows/active/pointer-{workflowId}.json
 */
export declare function getWorkflowPointerPath(workflowId: string): string;
/**
 * Get absolute path to the legacy singleton pointer.json (for migration)
 */
export declare function getLegacyPointerPath(): string;
/**
 * Lazily migrate legacy pointer.json to per-workflow pointer-{workflowId}.json.
 * Idempotent: does nothing if legacy file doesn't exist or is already migrated.
 */
export declare function migrateLegacyPointer(): void;
/**
 * Get the active workflow pointer for a specific workflow (sync).
 * Triggers lazy migration of legacy pointer.json on first call.
 *
 * @param workflowId - The workflow ID to look up
 * @returns WorkflowPointer or null if no pointer for this workflow
 */
export declare function getActiveWorkflowPointer(workflowId: string): WorkflowPointer | null;
/**
 * Get ALL active workflow pointers by scanning for pointer-*.json files.
 * Triggers lazy migration of legacy pointer.json first.
 *
 * @returns Array of all active WorkflowPointers (may be empty)
 */
export declare function getAllActiveWorkflowPointers(): WorkflowPointer[];
/**
 * Set the active workflow pointer (sync).
 * Uses pointer.workflow_id to determine the filename.
 * Uses atomic write (temp + rename) for safety.
 */
export declare function setActiveWorkflowPointer(pointer: WorkflowPointer): void;
/**
 * Clear the active workflow pointer for a specific workflow (sync).
 *
 * @param workflowId - The workflow ID whose pointer to remove
 */
export declare function clearActiveWorkflowPointer(workflowId: string): void;
/**
 * Clear ALL active workflow pointers + legacy pointer (for cleanup/testing).
 * Removes every pointer-*.json and the legacy pointer.json if present.
 */
export declare function clearAllActiveWorkflowPointers(): void;
/**
 * Check if a workflow pointer is stale (PID is dead AND state file is cold).
 *
 * Primary check: process.kill(pid, 0) — if PID is alive, workflow is active.
 * Secondary check: when PID is dead, also check the durable state file's mtime.
 * If the state file was modified within the last 10 minutes, the workflow is
 * likely still active (another session's hook may have just written to it).
 * This prevents false positives from PID reuse edge cases or timing issues.
 *
 * @param pointer - The workflow pointer to check
 * @returns true if the workflow is genuinely orphaned (PID dead AND state file cold)
 */
export declare function isWorkflowPointerStale(pointer: WorkflowPointer): boolean;
/**
 * Save durable workflow state (sync)
 * Writes MultiPhaseWorkflowState to .claude/workflows/active/{workflowId}.json
 */
export declare function saveDurableWorkflowState(workflow: MultiPhaseWorkflowState): void;
/**
 * Load durable workflow state (sync)
 * @returns MultiPhaseWorkflowState or null if not found
 */
export declare function loadDurableWorkflowState(workflowId: string): MultiPhaseWorkflowState | null;
/**
 * Remove durable workflow state file (sync)
 */
export declare function removeDurableWorkflowState(workflowId: string): void;
/**
 * Multi-phase workflow state
 */
export interface MultiPhaseWorkflowState {
    current_phase: PhaseInfo;
    iterations: Record<string, number>;
    max_iterations: Record<string, number>;
    /**
     * Queue of agents waiting to spawn due to max_concurrent_agents limit.
     * Agents are processed FIFO when running agents complete.
     * @default []
     */
    pending_spawn_queue: PendingSpawnEntry[];
    phase_history: PhaseHistoryEntry[];
    session_id: string;
    started_at: string;
    status: WorkflowStatus;
    workflow_id: string;
    workflow_name: string;
}
/**
 * Phase type alias for workflow orchestration
 * Used by agent-orchestrator for phase spawning
 */
export type Phase = PhaseInfo;
/**
 * Phase execution history entry
 */
export interface PhaseHistoryEntry {
    completed_at: string;
    iteration: number;
    phase_id: string;
    results?: PhaseResults;
    started_at: string;
    status: "completed" | "failed" | "skipped";
}
/**
 * Current phase execution info
 */
export interface PhaseInfo {
    agent: string;
    agents_completed: number;
    agents_failed: number;
    agents_spawned: number;
    id: string;
    /** Array of agent IDs that were spawned in this phase. Used for phase completion tracking. */
    spawned_agent_ids: string[];
    /** Full records of spawned agents with metadata for respawn enforcement. */
    spawned_agent_records: SpawnedAgentRecord[];
    started_at: string;
    status: PhaseStatus;
}
/**
 * Record of a spawned agent with full metadata for respawn enforcement
 */
export interface SpawnedAgentRecord {
    /** Unique agent identifier (e.g., "task-maker-001") */
    agent_id: string;
    /**
     * Claude Code background task ID when spawned with run_in_background.
     * Used to track and query status of background-spawned agents.
     * @example "bg-task-12345"
     */
    background_task_id?: string;
    /**
     * Array of agent_ids from depends_on that are currently blocking this agent.
     * Updated dynamically as dependencies complete. Undefined when no blocking deps.
     * This allows UI to show which specific agents are blocking progress.
     */
    blocked_by?: string[];
    /** ISO timestamp when agent completed (success or failure) */
    completed_at?: string;
    /**
     * Array of agent_ids that must complete before this agent can run.
     * Empty array means no dependencies. Used for automatic dependency-based spawning.
     * When all dependencies complete successfully, the orchestrator can automatically
     * spawn this agent.
     * @default []
     */
    depends_on: string[];
    /** Reason for failure if status is 'failed' */
    failure_reason?: "cancelled" | "error" | "rate_limit" | "timeout";
    /** SHA256 hash of the FULL prompt (computed before truncation) */
    prompt_hash: string;
    /** Truncated prompt (max 5000 chars) */
    prompt: string;
    /** Number of retry attempts for this agent */
    retry_count: number;
    /** ISO timestamp when agent was spawned */
    spawned_at: string;
    /**
     * Current status of the agent.
     * - running: Agent is currently executing
     * - completed: Agent finished successfully
     * - failed: Agent encountered an error
     * - skipped: Agent was intentionally skipped
     * - stale: Agent state is outdated/expired
     * - waiting_for_dependencies: Agent cannot start until dependencies complete
     */
    status: "completed" | "failed" | "running" | "skipped" | "stale" | "waiting_for_dependencies";
    /** Type of agent spawned (e.g., "task-maker", "backend-engineer") */
    subagent_type: string;
}
/**
 * Entry in the pending spawn queue for agents waiting due to max_concurrent_agents limit.
 * Agents are processed FIFO when a running agent completes.
 */
export interface PendingSpawnEntry {
    /** Unique agent identifier (e.g., "task-maker-001") */
    agent_id: string;
    /**
     * Array of agent_ids that must complete before this agent can run.
     * Empty array means no dependencies (only blocked by concurrency limit).
     * @default []
     */
    depends_on: string[];
    /** Priority for spawn ordering (lower = higher priority). Default is 0. */
    priority: number;
    /** SHA256 hash of the FULL prompt (computed before truncation) */
    prompt_hash: string;
    /** Truncated prompt (max 5000 chars) */
    prompt: string;
    /** ISO timestamp when the agent was added to the queue */
    queued_at: string;
    /** Type of agent to spawn (e.g., "task-maker", "backend-engineer") */
    subagent_type: string;
}
/**
 * Phase results data structure
 */
export interface PhaseResults {
    agents_completed: number;
    agents_failed: number;
    agents_spawned: number;
}
/**
 * Phase execution status
 */
export type PhaseStatus = "blocked" | "completed" | "failed" | "running";
/**
 * Workflow-level status
 */
export type WorkflowStatus = "aggregating" | "awaiting_aggregation" | "completed" | "failed" | "running";
interface AgentData {
    [key: string]: boolean | number | Record<string, boolean | number | string> | string | undefined;
    agentId: string;
    timestamp?: string;
    workflowId?: string;
}
interface FeaturePlannerState {
    status: "implementation_complete" | "implementation_started" | "pending_task_creation" | "tasks_created";
    taskCount: number;
    taskIds: number[];
    workflowId?: string;
}
interface TaskMakerSpawn {
    spawnedAt: string;
    status: "completed" | "spawned";
    taskId: number;
}
/**
 * Extended workflow state with multi-phase workflow support
 */
interface WorkflowState {
    /**
     * Dependency graph mapping agent_id to array of agent_ids it depends on.
     * Key: agent_id that has dependencies
     * Value: array of agent_ids that must complete first
     * Used for determining spawn order and detecting circular dependencies.
     */
    dependency_graph?: Record<string, string[]>;
    featurePlannerOutput?: {
        agentId: string;
        status: "implementation_complete" | "implementation_started" | "pending_task_creation" | "tasks_created";
        taskCount: number;
        taskIds: number[];
        workflowId?: string;
    };
    sessionId: string;
    taskMakerSpawns: TaskMakerSpawn[];
    timestamp: string;
    v0Workflows?: Record<string, {
        completed_at?: string;
        components_generated: string[];
        components_pending: string[];
        planner_output?: Record<string, boolean | number | string | string[]>;
        started_at: string;
        status: "completed" | "failed" | "generating" | "planning";
    }>;
    workflows?: MultiPhaseWorkflowState[];
}
export declare function clearWorkflowState(sessionId?: string): Promise<void>;
/**
 * Ensure session folder exists
 * @param {string} sessionId - Session identifier
 */
export declare function ensureSessionFolder(sessionId: string): Promise<void>;
/**
 * Get feature-planner state (returns undefined if no pending tasks)
 * @returns {Promise<FeaturePlannerState|undefined>} Task info or undefined
 */
export declare function getFeaturePlannerState(): Promise<FeaturePlannerState | undefined>;
/**
 * Get task-maker spawning progress from feature-planner workflow state.
 *
 * Returns the number of task-makers spawned vs total expected,
 * and whether all task-makers have been spawned.
 *
 * @returns {Promise<{completed: number, total: number, allDone: boolean} | undefined>}
 *   Progress info or undefined if no feature-planner workflow is active
 */
export declare function getTaskMakerProgress(): Promise<{
    allDone: boolean;
    completed: number;
    total: number;
} | undefined>;
/**
 * Quick boolean check if a feature-planner workflow is active and not yet complete.
 *
 * Returns true when featurePlannerOutput exists and status is NOT implementation_complete.
 * Used by phase-enforcement to quickly decide if enforcement rules apply.
 *
 * @returns {Promise<boolean>} True if feature-planner workflow is active
 */
export declare function isFeaturePlannerWorkflowActive(): Promise<boolean>;
/**
 * Agent types that perform implementation work.
 * Shared between phase-enforcement.ts and agent-orchestrator.ts.
 * Keep this list in sync with the enforcement logic.
 */
export declare const IMPLEMENTATION_AGENT_TYPES: readonly string[];
/**
 * Get workflow by ID from current session state
 *
 * SessionId Pattern Documentation:
 * - Instance methods (WorkflowStateManager): Use this.sessionId (no parameter)
 * - Module functions (workflow-state.ts): Accept optional sessionId parameter
 * - If sessionId omitted: Falls back to getSessionId() (process.ppid)
 *
 * BACKWARD COMPATIBLE: This is a NEW function, does not modify existing API
 *
 * @param {string} workflowId - Workflow identifier
 * @param {string} sessionId - Optional session ID (defaults to current session)
 * @returns {Promise<MultiPhaseWorkflowState|undefined>} Workflow state or undefined
 */
export declare function getWorkflowById(workflowId: string, sessionId?: string): Promise<MultiPhaseWorkflowState | undefined>;
/**
 * Get full workflow state for debugging
 *
 * Error Recovery Behavior:
 * - Corrupted state (JSON parse error): Delete file, return undefined
 * - Missing file (ENOENT): Return undefined (valid - no state exists)
 * - Other errors: Log error, return undefined
 *
 * @param {string} sessionId - Optional session ID (defaults to current session)
 * @returns {Promise<WorkflowState|undefined>} Complete workflow state or undefined if not found/expired
 */
export declare function getWorkflowState(sessionId?: string): Promise<undefined | WorkflowState>;
/**
 * Mark phase as complete and add to history
 *
 * @param {string} workflowId - Workflow identifier
 * @param {string} finalStatus - Final phase status (completed/failed)
 * @param {string} sessionId - Optional session ID (defaults to current session)
 */
export declare function markPhaseComplete(workflowId: string, finalStatus: "completed" | "failed", sessionId?: string): Promise<void>;
/**
 * Register a spawned agent with full metadata for respawn enforcement
 *
 * This function adds an agent record to the current workflow phase's spawned_agent_records array.
 * Supports both legacy (agent ID only) and full record registration modes for backward compatibility.
 *
 * Legacy mode: registerSpawnedAgent(workflowId, agentId) - adds to spawned_agent_ids only
 * Full mode: registerSpawnedAgent(workflowId, agentId, subagentType, prompt) - creates full record
 *
 * @param {string} workflowId - The workflow ID
 * @param {string} agentId - The spawned agent's ID (e.g., "task-maker-001")
 * @param {string} [subagentType] - Agent type (required for full record registration)
 * @param {string} [prompt] - Full prompt (required for full record registration)
 * @param {string} [backgroundTaskId] - Background task ID if agent was spawned with run_in_background: true
 */
export declare function registerSpawnedAgent(workflowId: string, agentId: string, subagentType?: string, prompt?: string, backgroundTaskId?: string): Promise<void>;
/**
 * Update the status of a spawned agent
 *
 * @param {string} workflowId - The workflow ID
 * @param {string} agentId - The agent ID to update
 * @param {SpawnedAgentRecord['status']} status - New status
 * @param {SpawnedAgentRecord['failure_reason']} [failureReason] - Reason if status is 'failed'
 * @returns {Promise<boolean>} True if agent was found and updated
 */
export declare function updateAgentStatus(workflowId: string, agentId: string, status: SpawnedAgentRecord["status"], failureReason?: SpawnedAgentRecord["failure_reason"]): Promise<boolean>;
/**
 * Get failed agents that are eligible for retry
 *
 * Returns agents with status 'failed' or 'stale' whose retry_count
 * is below the specified threshold.
 *
 * @param {string} workflowId - The workflow ID
 * @param {number} [maxRetries=3] - Maximum retry count threshold
 * @returns {Promise<SpawnedAgentRecord[]>} Array of failed agents eligible for retry
 */
export declare function getFailedAgents(workflowId: string, maxRetries?: number): Promise<SpawnedAgentRecord[]>;
/**
 * Add an agent with its dependencies to the workflow dependency graph.
 *
 * This method stores the dependency relationship for later queries.
 * Does NOT validate for cycles - call hasCircularDependency() first.
 *
 * @param {string} agentId - The agent being added to the graph
 * @param {string[]} dependsOn - Array of agent_ids this agent depends on
 * @returns {Promise<void>}
 *
 * @example
 * // Register task-maker-002 depends on task-maker-001
 * await addToDependencyGraph('task-maker-002', ['task-maker-001']);
 */
export declare function addToDependencyGraph(agentId: string, dependsOn: string[]): Promise<void>;
/**
 * Check if adding dependencies would create a circular dependency.
 *
 * Uses Kahn's algorithm (BFS-based topological sort) to detect cycles.
 * Returns true if a cycle would be created, false if safe to add.
 *
 * @param {string} agentId - The agent that would receive new dependencies
 * @param {string[]} newDeps - The new dependencies to add
 * @returns {Promise<boolean>} True if circular dependency would result
 *
 * @example
 * // Check before adding dependency
 * if (await hasCircularDependency('agent-C', ['agent-A'])) {
 *   console.error('Would create cycle!');
 * }
 */
export declare function hasCircularDependency(agentId: string, newDeps: string[]): Promise<boolean>;
/**
 * Get all agents that are ready to spawn (all dependencies completed).
 *
 * An agent is ready to spawn when:
 * 1. It has status 'waiting_for_dependencies'
 * 2. All agents in its depends_on array have status 'completed'
 *
 * @param {string} workflowId - The workflow ID
 * @returns {Promise<string[]>} Array of agent_ids ready to spawn
 *
 * @example
 * const readyAgents = await getReadyToSpawn('workflow-123');
 * // Returns: ['task-maker-002', 'task-maker-003'] if their deps are complete
 */
export declare function getReadyToSpawn(workflowId: string): Promise<string[]>;
/**
 * Get all agents that depend on the specified agent (direct and indirect).
 *
 * Uses BFS traversal to find all downstream dependents.
 *
 * @param {string} agentId - The agent to find dependents of
 * @returns {Promise<string[]>} Array of agent_ids that depend on this agent
 *
 * @example
 * // If B depends on A, and C depends on B:
 * const dependents = await getDependentsOf('A');
 * // Returns: ['B', 'C']
 */
export declare function getDependentsOf(agentId: string): Promise<string[]>;
/**
 * Mark an agent as blocked by specific dependencies.
 *
 * Updates the agent's blocked_by field and sets status to 'waiting_for_dependencies'.
 *
 * @param {string} workflowId - The workflow ID
 * @param {string} agentId - The agent to mark as blocked
 * @param {string[]} blockedBy - Array of agent_ids currently blocking this agent
 * @returns {Promise<boolean>} True if agent was found and updated
 *
 * @example
 * // Mark task-maker-002 as blocked by task-maker-001
 * await markAgentBlocked('wf-1', 'task-maker-002', ['task-maker-001']);
 */
export declare function markAgentBlocked(workflowId: string, agentId: string, blockedBy: string[]): Promise<boolean>;
/**
 * Get the count of currently running agents across all workflows in the session.
 *
 * Counts agents with status "running" in spawned_agent_records.
 * Used to enforce max_concurrent_agents limit before spawning new agents.
 *
 * @param {string} [sessionId] - Optional session ID (defaults to current session)
 * @returns {Promise<number>} Count of running agents
 *
 * @example
 * const runningCount = await getRunningAgentCount();
 * console.log(`Currently ${runningCount} agents running`);
 */
export declare function getRunningAgentCount(sessionId?: string): Promise<number>;
/**
 * Check if more agents can be spawned based on max_concurrent_agents setting.
 *
 * Compares current running agent count against the configured limit.
 * If limit is reached, new agents should be queued instead of spawned.
 *
 * @param {string} [sessionId] - Optional session ID (defaults to current session)
 * @returns {Promise<boolean>} True if more agents can be spawned
 *
 * @example
 * if (await canSpawnMore()) {
 *   await spawnAgent(...);
 * } else {
 *   await queueAgentSpawn(...);
 * }
 */
export declare function canSpawnMore(sessionId?: string): Promise<boolean>;
/**
 * Add an agent to the pending spawn queue.
 *
 * When max_concurrent_agents limit is reached, agents are queued
 * instead of spawned immediately. The queue is processed FIFO
 * when running agents complete.
 *
 * @param {string} workflowId - The workflow ID
 * @param {string} agentId - Unique agent identifier
 * @param {string} subagentType - Agent type (e.g., "task-maker")
 * @param {string} prompt - Full prompt for the agent
 * @param {string[]} [dependsOn=[]] - Array of agent_ids this agent depends on
 * @param {number} [priority=0] - Priority for spawn ordering (lower = higher priority)
 * @returns {Promise<boolean>} True if agent was added to queue
 *
 * @example
 * await queueAgentSpawn('wf-1', 'task-maker-002', 'task-maker', 'Create task...', [], 0);
 */
export declare function queueAgentSpawn(workflowId: string, agentId: string, subagentType: string, prompt: string, dependsOn?: string[], priority?: number): Promise<boolean>;
/**
 * Get the next agent from the spawn queue that is ready to be spawned.
 *
 * Returns the highest priority agent whose dependencies are all completed.
 * Does NOT remove the agent from the queue - use removeFromQueue() after spawning.
 *
 * @param {string} workflowId - The workflow ID
 * @returns {Promise<PendingSpawnEntry | undefined>} Next agent to spawn or undefined if queue empty/blocked
 *
 * @example
 * const next = await getNextQueuedSpawn('wf-1');
 * if (next && await canSpawnMore()) {
 *   await spawnAgent(next);
 *   await removeFromQueue('wf-1', next.agent_id);
 * }
 */
export declare function getNextQueuedSpawn(workflowId: string): Promise<PendingSpawnEntry | undefined>;
/**
 * Remove an agent from the pending spawn queue.
 *
 * Call this after successfully spawning an agent from the queue.
 *
 * @param {string} workflowId - The workflow ID
 * @param {string} agentId - The agent ID to remove
 * @returns {Promise<boolean>} True if agent was found and removed
 *
 * @example
 * const removed = await removeFromQueue('wf-1', 'task-maker-002');
 */
export declare function removeFromQueue(workflowId: string, agentId: string): Promise<boolean>;
/**
 * Get the current length of the pending spawn queue.
 *
 * @param {string} workflowId - The workflow ID
 * @returns {Promise<number>} Number of agents waiting in the queue
 *
 * @example
 * const queueLength = await getQueueLength('wf-1');
 * console.log(`${queueLength} agents waiting to spawn`);
 */
export declare function getQueueLength(workflowId: string): Promise<number>;
/**
 * Record task-maker spawning for a specific task
 * @param {number} taskId - Backlog task ID that task-maker is creating
 */
export declare function recordTaskMakerSpawn(taskId: number): Promise<void>;
/**
 * Remove workflow from state
 *
 * @param {string} workflowId - Workflow identifier
 * @param {string} sessionId - Optional session ID (defaults to current session)
 */
export declare function removeWorkflow(workflowId: string, sessionId?: string): Promise<void>;
/**
 * Transition feature-planner workflow to a new phase
 *
 * Valid transitions:
 * - pending_task_creation → tasks_created (after all task-makers complete)
 * - tasks_created → implementation_started (when implementation begins)
 * - implementation_started → implementation_complete (after implementation done)
 *
 * @param {string} newStatus - New workflow phase status
 */
export declare function transitionWorkflowPhase(newStatus: "implementation_complete" | "implementation_started" | "tasks_created"): Promise<void>;
/**
 * Record feature-planner output with task specifications
 * @param {AgentData} agentData - Agent output data (agentId, timestamp, workflowId, etc.)
 * @param {number} taskCount - Number of tasks to be created
 * @param {number[]} taskIds - Pre-allocated backlog task IDs
 */
export declare function setFeaturePlannerOutput(agentData: AgentData, taskCount: number, taskIds: number[]): Promise<void>;
/**
 * Set workflow status
 *
 * @param {string} workflowId - Workflow identifier
 * @param {WorkflowStatus} status - New workflow status
 * @param {string} sessionId - Optional session ID (defaults to current session)
 */
export declare function setWorkflowStatus(workflowId: string, status: WorkflowStatus, sessionId?: string): Promise<void>;
/**
 * Start a phase in a workflow
 *
 * Updates the current phase with new data when a phase begins execution.
 * Used by agent-orchestrator when spawning agents for a workflow phase.
 *
 * @param {string} workflowId - Workflow identifier
 * @param {string} phaseId - Phase identifier (must match workflow's current_phase.id)
 * @param {Partial<Phase>} phaseData - Partial phase data to update (agents_spawned, spawned_agent_ids, status, etc.)
 * @param {string} sessionId - Optional session ID (defaults to current session)
 * @throws {Error} If workflow not found or phaseId doesn't match current phase
 */
export declare function startPhase(workflowId: string, phaseId: string, phaseData: Partial<Phase>, sessionId?: string): Promise<void>;
/**
 * Update phase completion count for a running workflow
 * Increments agents_completed or agents_failed based on agent status
 *
 * @param {string} workflowId - Workflow identifier
 * @param {string} _agentId - Agent ID that completed (unused, kept for API compatibility)
 * @param {string} status - Agent completion status (success/failure/partial/blocked/skipped)
 * @param {string} sessionId - Optional session ID (defaults to current session)
 */
export declare function updatePhaseCompletion(workflowId: string, _agentId: string, status: string, sessionId?: string): Promise<void>;
/**
 * Update workflow state (add or update existing workflow)
 *
 * Uses atomic write pattern (temp file + rename) to prevent corruption
 *
 * @param {string} workflowId - Workflow identifier
 * @param {MultiPhaseWorkflowState} workflowData - Workflow state data
 * @param {string} sessionId - Optional session ID (defaults to current session)
 */
export declare function updateWorkflowState(workflowId: string, workflowData: MultiPhaseWorkflowState, sessionId?: string): Promise<void>;
/**
 * Get the active workflow phase for enforcement.
 *
 * Returns phase info for the first workflow with status "running",
 * or undefined if no active workflow exists.
 * Used by phase-enforcement to check current phase and block out-of-order spawns.
 *
 * @returns {Promise<{workflowId: string, phase: PhaseInfo, workflowName: string} | undefined>}
 */
export declare function getActiveWorkflowPhase(): Promise<{
    phase: PhaseInfo;
    workflowId: string;
    workflowName: string;
} | undefined>;
/**
 * Transition a workflow to the next phase.
 *
 * Archives current_phase to phase_history (as "completed"), then sets
 * a fresh current_phase with the new id/agent and zeroed counters.
 * Performs an atomic write to prevent corruption.
 *
 * @param {string} workflowId - Workflow identifier
 * @param {string} nextPhaseId - Phase ID for the new phase (e.g., "research", "planning")
 * @param {string} nextPhaseAgent - Agent type for the new phase (e.g., "research", "feature-planner")
 * @param {string} [sessionId] - Optional session ID (defaults to current session)
 */
export declare function transitionToNextPhase(workflowId: string, nextPhaseId: string, nextPhaseAgent: string, sessionId?: string): Promise<void>;
/**
 * Check if all spawned agents in the current phase have terminal status.
 *
 * Returns true when every agent in spawned_agent_records has a terminal status
 * (completed, failed, skipped, or stale). Falls back to counter comparison
 * (completed + failed >= spawned) when spawned_agent_records is empty.
 *
 * @param {string} workflowId - Workflow identifier
 * @param {string} [sessionId] - Optional session ID (defaults to current session)
 * @returns {Promise<boolean>} True if all agents in the current phase are done
 */
export declare function isPhaseComplete(workflowId: string, sessionId?: string): Promise<boolean>;
