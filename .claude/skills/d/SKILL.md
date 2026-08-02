---
name: d
description: Dump thoughts to docs/dump.md. Quick way to save notes, ideas, or context for any project.
argument-hint: <your thoughts>
---

# Thought Dump

Append the user's text to `docs/dump.md` in the project root.

## Instructions

1. Create `docs/` directory if it doesn't exist
2. Append the user's input to `docs/dump.md` with a timestamp
3. Confirm what was saved

## Format

Each entry should be formatted as:

```markdown
---
## YYYY-MM-DD HH:MM

<user's text>

```

## Example

User: `/d Remember to add error handling for the auth flow`

Result appended to `docs/dump.md`:
```markdown
---
## 2024-01-15 14:30

Remember to add error handling for the auth flow

```

## Implementation

```bash
mkdir -p docs
echo -e "---\n## $(date '+%Y-%m-%d %H:%M')\n\n$ARGUMENTS\n" >> docs/dump.md
```

Just append the text. No questions, no confirmation prompts - just save it and confirm with "Saved to docs/dump.md".
