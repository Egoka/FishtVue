# Compliance Hooks

**Compliance hooks prevent accidental modifications to critical files and ensure workflow integrity.**

This directory contains PreToolUse hooks that block dangerous operations and enforce project standards.

---

## Config File Protection

**Hook:** `config-file-protection.ts`
**Purpose:** Protects code quality configuration files (ESLint, TSConfig, Knip)

**Why:** Prevents AI agents from weakening linting rules or TypeScript strictness to avoid fixing real issues.

Similar to template protection but focuses on:
- Preventing rule changes that weaken code quality
- Detecting partial edits to critical sections (rules, compilerOptions)
- Requiring cto-architect agent for config changes

**Protected files:**
- `eslint.config.ts`, `.eslintrc.*`
- `tsconfig.json`
- `knip.ts`, `knip.json`

**Bypass:** `CLAUDE_WORKFLOW_ALLOW_CONFIG_EDITS=1`

---

## Troubleshooting Template Protection

### Error: "TEMPLATE FILE PROTECTED"

**Full error message:**
```
⚠️ TEMPLATE FILE PROTECTED - SOURCE FILE

You attempted to modify: src/templates/package.template.json

This is a SOURCE TEMPLATE file used by scaffold operations.
Modifying templates here affects ALL future project scaffolds.

To make project-specific changes: Edit the scaffolded file instead
  ❌ src/templates/package.template.json (source)
  ✅ /your-project/package.json (scaffolded)

Emergency bypass: CLAUDE_WORKFLOW_ALLOW_TEMPLATE_EDITS=1 (logged)
```

**Cause:** Attempting to edit a template source file

**Solution 1 - Edit scaffolded file (recommended):**
```bash
# Find the scaffolded file in your project
cd /path/to/your/project

# Edit the project-specific file, not the template
Edit(file_path="/path/to/your/project/package.json", ...)
```

**Solution 2 - Update template source (advanced):**
```bash
# 1. Enable bypass for development
export CLAUDE_WORKFLOW_ALLOW_TEMPLATE_EDITS=1

# 2. Manually edit template source
vim src/templates/package.template.json

# 3. Test in clean scaffold
claude-workflow init test-project
cd test-project
# Verify changes work correctly

# 4. Test backwards compatibility
cd existing-project
# Ensure existing projects still work

# 5. Commit template changes
git add src/templates/package.template.json
git commit -m "Update package template: [reason]"
```

### Bypass Not Working

**Symptom:** Setting bypass environment variable still blocks edits

**Possible causes:**
1. Environment variable not exported
2. Variable set after Claude session started

**Solution:**
```bash
# Export before starting Claude
export CLAUDE_WORKFLOW_ALLOW_TEMPLATE_EDITS=1

# Verify it's set
echo $CLAUDE_WORKFLOW_ALLOW_TEMPLATE_EDITS
# Should output: 1

# Start Claude
claude

# Verify in session (if needed)
Bash(command="echo $CLAUDE_WORKFLOW_ALLOW_TEMPLATE_EDITS")
```

---

## Worktree Boundary Enforcer

**Hook:** `worktree-boundary-enforcer.ts`
**Purpose:** Blocks Write/Edit operations outside the configured worktree boundary

**Why:** When working in a git worktree, prevents accidental modifications to the main repository. This ensures developers stay within their assigned worktree and don't cause merge conflicts or confusion.

**How it works:**
1. Reads `worktreeBoundary` from hook state
2. Checks if Write/Edit file_path is inside the boundary
3. Blocks operations outside the boundary with clear error message
4. Allows operations inside the boundary or when no boundary is set

**Configuration:**
- `worktreeBoundary` in hook state (set by worktree detection hook)
- `CLAUDE_WORKTREE_BOUNDARY=ignore` environment variable to bypass

**Related hooks:**
- `worktree-boundary-bypass.ts` (UserPromptSubmit) - Clears boundary when user says "edit main repo"

**Error message includes:**
- Current worktree boundary path
- Attempted file path
- Instructions to bypass (say "edit main repo" or set env var)

**Bypass:** `CLAUDE_WORKTREE_BOUNDARY=ignore` or say "edit main repo" / "work in main repo"

---

## Path Validator

**Hook:** `path-validator.ts`
**Purpose:** Unified rule-based validation for file paths during Write/Edit operations

**Why:** Enforces consistent path validation rules across all agents. Prevents common mistakes like creating task files in subdirectories or feature-planner editing code files.

**Rules included:**
- Blocks task files in subdirectories of `backlog/tasks/`
- Enforces feature-planner can only write to `backlog/specs/` with correct naming
- Enforces feature-planner can only edit its own spec files

---

## Related Documentation

- [Hook Compliance System (Technical)](../../../../docs/hook-compliance-system.md)
- [Config File Protection Hook](./config-file-protection.ts)
- [Worktree Boundary Enforcer Hook](./worktree-boundary-enforcer.ts)
- [Path Validator Hook](./path-validator.ts)
