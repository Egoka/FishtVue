/**
 * Path Resolver - Resolves project root in monorepo environments
 *
 * Problem: In monorepos, Claude Code may run from subdirectories (e.g., packages/app/)
 * but hooks need to find .claude/ at the monorepo root.
 *
 * Solution: Find .claude/workflow-config.json by traversing up directories,
 * then use _projectRoot from the config (or fall back to the directory where config was found).
 */
/**
 * Resolve the claude-workflow package path from config
 * Searches up directory tree for workflow-config.json
 *
 * @returns Path to package dist directory, or undefined if not found
 */
export declare function resolveClaudeWorkflowPath(): string | undefined;
/**
 * Resolve a path relative to the project root
 *
 * @param segments - Path segments to join with project root
 * @returns Absolute path normalized for the current platform (Windows-safe)
 *
 * @example
 * // From anywhere in monorepo:
 * resolveProjectPath(".claude/workflow-config.json")
 * // Returns: "/absolute/path/to/monorepo/.claude/workflow-config.json"
 */
export declare function resolveProjectPath(...segments: string[]): string;
/**
 * Resolve the project root directory
 *
 * Resolution order:
 * 1. Find .claude/workflow-config.json by traversing up from cwd
 * 2. If found, read config and try to use _projectRoot field
 * 3. If _projectRoot fails (path not accessible), fall back to config directory
 * 4. If traversal fails (no config found), fall back to process.cwd()
 *
 * Fallback scenarios:
 * - Config has _projectRoot but path is invalid → uses config directory
 * - No config found in directory tree → uses process.cwd()
 * - Filesystem errors during traversal → uses process.cwd()
 *
 * All fallbacks are logged to console.warn for debugging.
 *
 * @returns Absolute path to project root
 */
export declare function resolveProjectRoot(): string;
declare const _default: {
    resolveClaudeWorkflowPath: typeof resolveClaudeWorkflowPath;
    resolveProjectPath: typeof resolveProjectPath;
    resolveProjectRoot: typeof resolveProjectRoot;
};
export default _default;
