#!/bin/bash

# Claude Code Environment Configuration
# Source this file or add these exports to your shell profile (~/.bashrc or ~/.zshrc)

# Claude Code output limits
export CLAUDE_CODE_MAX_OUTPUT_TOKENS=64000
export MAX_THINKING_TOKENS=64000
export MAX_MCP_OUTPUT_TOKENS=100000

# Bash command limits
export BASH_MAX_OUTPUT_LENGTH=1000000
export BASH_DEFAULT_TIMEOUT_MS=600000
export BASH_MAX_TIMEOUT_MS=600000

echo "✓ Claude Code environment limits configured"
echo "  - Max output tokens: 64000"
echo "  - Bash output length: 1000000"
echo "  - Bash timeout: 600000ms (10 minutes)"
echo ""
echo "To make these permanent, add to your shell profile:"
echo "  echo 'source $(pwd)/.claude/scripts/set-limits.sh' >> ~/.bashrc"
echo "  or"
echo "  echo 'source $(pwd)/.claude/scripts/set-limits.sh' >> ~/.zshrc"
