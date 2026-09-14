---
name: worktree
description: Git worktree boundary protection - automatically restricts file edits to your active worktree. Use when working with git worktrees to prevent accidental modifications to the main repository.
---

# Worktree Boundary Protection

Automatic protection that restricts Write/Edit operations to your active git worktree, preventing accidental modifications to the main repository.

## How It Works

The worktree boundary system uses three hooks that work together:

1. **Detection** (PostToolUse) - Automatically detects `git worktree add/remove` commands
2. **Enforcement** (PreToolUse) - Blocks Write/Edit operations outside the boundary
3. **Bypass** (UserPromptSubmit) - Clears boundary when you say specific phrases

## Pre-Worktree Check (REQUIRED)

**Before creating any worktree, you MUST:**

1. Run `git status` to check for uncommitted changes
2. If there are uncommitted changes, **STOP and ask the user**:

```
You have uncommitted changes in your working directory.
Worktrees start from commits - these changes won't appear in the new worktree.

Would you like me to commit and push your changes first?
```

3. Only proceed with `git worktree add` after:
   - User confirms they don't need the changes in the worktree, OR
   - Changes have been committed and pushed

**Why this matters:** Worktrees are created from commits, not from your working directory. Uncommitted changes stay in the original location and won't transfer to the new worktree.

## Automatic Activation

When you run `git worktree add`, the boundary is **automatically set**:

```bash
# This sets boundary to /path/to/feature-branch
git worktree add ../feature-branch feature

# Now all Write/Edit operations are restricted to ../feature-branch
```

## Boundary Enforcement

When a boundary is active:

- **Allowed**: Write/Edit to files inside the worktree
- **Blocked**: Write/Edit to files outside the worktree
- **Always allowed**: Read, Grep, Glob, Bash (non-destructive operations)

### Blocked Operation Example

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKTREE BOUNDARY VIOLATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You are working in worktree:
  /home/user/projects/feature-branch

Attempted file path:
  /home/user/projects/main-repo/src/config.ts

The file is OUTSIDE your worktree boundary.

To edit files in the main repo:
  Say: "edit main repo" or "work in main repo"
  Or set: CLAUDE_WORKTREE_BOUNDARY=ignore
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Clearing the Boundary

### Natural Language (Recommended)

Just say one of these phrases in your message:

- "edit main repo"
- "work in main repo"
- "switch to main"
- "exit worktree"
- "leave worktree"
- "clear worktree boundary"

### Environment Variable

```bash
export CLAUDE_WORKTREE_BOUNDARY=ignore
```

### Remove the Worktree

```bash
git worktree remove ../feature-branch
```

## Common Workflows

### Working on a Feature Branch

```
1. User: "Create a worktree for feature-xyz"

2. Claude: Runs `git status` to check for uncommitted changes

3. If changes exist, Claude asks:
   "You have uncommitted changes. Want me to commit and push first?"

4. After user confirms (or if no changes):
   git worktree add ../feature-xyz -b feature-xyz HEAD

5. Boundary automatically set - edits restricted to ../feature-xyz

6. When done:
   git worktree remove ../feature-xyz
```

### Temporarily Editing Main Repo

When you need to edit a shared config or root file:

```
User: "I need to edit the root package.json - work in main repo"
```

The boundary clears and you can edit anywhere.

### Multiple Worktrees

Each `git worktree add` command sets a new boundary. The most recent worktree becomes the active boundary.

## Rules

1. **Boundary is path-based** - Files must be inside the worktree directory tree
2. **Relative paths resolved** - Relative paths are resolved against project root
3. **Fail-open on errors** - If the hook fails, operations are allowed (safety)
4. **Only Write/Edit blocked** - Read operations always work everywhere

## Checking Current Boundary

Currently there's no command to check the boundary. If you hit a violation, the error message shows the current boundary path.

## Disabling Entirely

To permanently disable worktree boundary protection:

```bash
# In your shell profile
export CLAUDE_WORKTREE_BOUNDARY=ignore
```

Or remove the hooks from `.claude/settings.json`.

## Related Files

- `.claude/hooks/compliance/worktree-boundary-detector.ts` - Detection hook
- `.claude/hooks/compliance/worktree-boundary-enforcer.ts` - Enforcement hook
- `.claude/hooks/compliance/worktree-boundary-bypass.ts` - Bypass hook
- `.claude/state/hook-state.json` - Where boundary is stored
