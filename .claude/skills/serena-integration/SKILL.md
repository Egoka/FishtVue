---
name: serena-integration
description: Semantic code navigation via Serena LSP MCP. Use when finding symbol definitions, locating all usages/references, performing safe codebase-wide renames, understanding class hierarchies, or making symbol-aware edits. More accurate than grep for finding all callers including dynamic references.
---

# Serena Integration Skill

Use Serena (MCP tool) for semantic code navigation when you need symbol-level understanding of the codebase.

## What is Serena?

Serena is a free, open-source MCP server that:
- Uses LSP (Language Server Protocol) for accurate symbol resolution
- Provides 36 tools for symbol-level code operations
- Works with any language that has LSP support
- Complements Claude Code's built-in grep/glob tools

## When to Use Serena

Use Serena when you need:
- **Accurate symbol resolution** - Find exact function/class definitions
- **All usages of a symbol** - Find where a function is called (including dynamic)
- **Safe refactoring** - Rename across entire codebase
- **Symbol-aware editing** - Insert code relative to a function/class

Use grep/glob instead when:
- Searching for string literals or comments
- Finding files by name pattern
- Searching across non-code files
- Need speed over accuracy

## Common Queries

These are examples of questions that activate this skill:

1. "Find all usages of the handleAuth function"
2. "Rename getUserById to findUserById across the codebase"
3. "Go to the definition of the UserService class"
4. "List all symbols in the auth module"
5. "Find where this function is called from"
6. "Refactor this method name safely across all files"
7. "Show me the definition of AuthMiddleware"
8. "Find all references to this variable"

### Decision Matrix

| Task | Serena | Grep/Glob |
|------|--------|-----------|
| Find function definition | **Yes** | No |
| Find all symbol usages | **Yes** | Partial |
| Rename symbol codebase-wide | **Yes** | Dangerous |
| Search string literal | No | **Yes** |
| Search comments | No | **Yes** |
| Find file by pattern | No | **Yes** |
| Symbol-aware insertion | **Yes** | No |

## Key Tools

### find_symbol
Find symbol definitions by name.

```
use serena find_symbol to locate the UserService class
```

### find_referencing_symbols
Find all places where a symbol is used.

```
use serena find_referencing_symbols for handleAuth function
```

### rename_symbol
Safely rename a symbol across the entire codebase.

```
use serena rename_symbol to change getUserById to findUserById
```

### insert_after_symbol
Add code after a specific symbol (function, class, etc).

```
use serena insert_after_symbol to add logging after the login function
```

### find_symbol (with include_body=True)
Get the full definition of a symbol.

```
use serena find_symbol (with include_body=True) for AuthService class
```

### get_symbols_overview
List all symbols in a file or module.

```
use serena get_symbols_overview in src/services/auth.ts
```

## Configuration

### Context Modes

Serena supports different context modes via the `--context` flag:

| Mode | Description |
|------|-------------|
| `claude-code` | **Recommended.** Disables file/shell tools to prevent conflicts |
| `default` | All tools enabled |
| `minimal` | Core symbol tools only |

The claude-workflow scaffold uses `--context claude-code` by default.

### Project Configuration

Serena can be configured via `.serena/project.yml`:

```yaml
# .serena/project.yml
language: typescript
root: ./src
exclude:
  - node_modules
  - dist
  - coverage
```

## Integration with Explore Agent

The Explore agent can use Serena tools when available. This enables:

1. **Symbol-based exploration** - Find definitions and usages accurately
2. **Safe refactoring suggestions** - Recommend renames with confidence
3. **Dependency mapping** - Trace symbol relationships

When Serena is not available, Explore falls back to grep/glob patterns.

## Known Limitations

### Plan Interference
Community feedback indicates Serena's tool loading can sometimes interfere with Claude's plan-creation workflow. If you experience this:
1. Try using `--context minimal` to reduce tool count
2. Use Serena tools explicitly rather than letting them auto-activate

### Language Support
Serena depends on LSP support for your language. Well-supported:
- TypeScript/JavaScript
- Python
- Go
- Rust
- Java

Less supported:
- Older language versions
- Niche languages without LSP servers

### Large Codebases
For very large codebases, initial LSP indexing may take time. Consider:
- Using `.serena/project.yml` to exclude unnecessary directories
- Running Serena on a subset of the codebase

## Troubleshooting

### "uvx not found"
Install uv: `pip install uv` or `pipx install uv`

### "Python 3.11+ required"
Serena requires Python 3.11 or later. Check version: `python --version`

### Symbol not found
1. Ensure LSP server is running for your language
2. Check `.serena/project.yml` root path
3. Wait for initial indexing to complete

### Tool conflicts
If experiencing conflicts with Claude Code's built-in tools:
1. Verify `--context claude-code` is set in MCP config
2. Restart Claude Code session

## Requirements

- **Python 3.11+** - Serena runtime
- **uv** - Python package manager (provides uvx command)
- **LSP server** - For your language (often auto-detected)

Install uv:
```bash
pip install uv
# or
pipx install uv
```

## Quick Reference

| Situation | Serena Query Example |
|-----------|---------------------|
| Find definition | `use serena find_symbol for [name]` |
| Find usages | `use serena find_referencing_symbols for [name]` |
| Rename | `use serena rename_symbol [old] to [new]` |
| List symbols | `use serena get_symbols_overview in [file]` |
| Get definition | `use serena find_symbol (with include_body=True) for [name]` |

## Summary

Serena provides semantic code navigation that complements grep/glob patterns.

**Use Serena for:**
- Symbol definitions and usages
- Safe codebase-wide refactoring
- Symbol-aware code insertion

**Use grep/glob for:**
- String/comment searching
- File pattern matching
- Speed over accuracy

**Key benefit:** Accurate symbol resolution for confident refactoring!
