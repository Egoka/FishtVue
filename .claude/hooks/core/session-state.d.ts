/**
 * Session State Management
 *
 * Provides session folder creation and identification for hooks.
 * Each Claude Code session gets its own isolated folder for logs and state.
 *
 * Session Isolation:
 * - Each Claude Code session gets its own folder: session-{timestamp}-{claudePid}
 * - Session ID determined by CLAUDE_SESSION_ID env var or parent process ID
 */
/**
 * Get unique session identifier for this Claude Code session
 * CANONICAL implementation - all other modules should import from here
 *
 * Resolution Priority:
 * 1. CLAUDE_SESSION_ID environment variable (test mode / explicit override)
 * 2. Existing session folder for current Claude PID (restart recovery)
 * 3. Generate new timestamp-pid format (new session)
 *
 * Format: "{timestamp}-{claudePid}" for new sessions
 * This matches the session folder naming convention: session-{timestamp}-{pid}
 *
 * @returns {string} Session ID in format "{timestamp}-{claudePid}" or custom format from env var
 */
export declare function getSessionId(): string;
/**
 * Get a stable (long-lived) ancestor PID for use in workflow pointers.
 *
 * In hook execution context, Claude Code runs hooks via a shell:
 *   Claude Code (long-lived) → sh -c "node hook.js" (short-lived) → node (hook)
 *
 * process.ppid is the shell PID which dies immediately after the hook completes.
 * Storing it in workflow pointers makes them appear "stale" to other sessions,
 * causing cross-session workflow adoption via tryResumeOrphanedWorkflow().
 *
 * This function walks up the process tree to find Claude Code's actual PID
 * by looking for a process whose command is "claude".
 * Falls back to grandparent PID, then process.ppid.
 *
 * @returns A stable PID suitable for long-lived workflow pointer storage
 */
export declare function getStableAncestorPid(): number;
/**
 * Find existing session folder by walking the process tree.
 *
 * Simple approach: walk up the process tree, return first ancestor PID
 * that has a session folder. This works because all hooks and subagents
 * are descendants of the Claude process that created the session.
 *
 * @returns Session folder name or undefined if not found
 */
export declare function findExistingSessionFolderByProcessTree(): string | undefined;
/**
 * Find existing session folder or create new one with lock file protection.
 * Uses O_EXCL for atomic "create if not exists" to prevent TOCTOU race.
 *
 * Multiple hooks may run simultaneously and try to create the session folder.
 * The lock file ensures only one process creates the folder.
 *
 * Uses process tree walking to find existing sessions, ensuring all hooks
 * in the same Claude Code session use the same folder regardless of
 * which subprocess they run in.
 *
 * @returns Session folder name (not full path)
 */
export declare function findOrCreateSessionFolder(): string;
