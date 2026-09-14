---
description: Create a workflow brief template for planning
argument-hint: <name> [--type feature|qa|ui|lint|demo|surreal|setup|redesign]
---

Create a new workflow brief for "$ARGUMENTS".

## Instructions

1. Parse the arguments "$ARGUMENTS":
   - Extract the name (everything except `--type <value>`)
   - Extract the type if `--type` is provided (default: `feature`)
   - Valid types: `feature`, `qa`, `ui`, `lint`, `demo`, `surreal`, `setup`, `redesign`

2. Sanitize the name to a kebab-case slug (lowercase, hyphens instead of spaces)

3. Create the directory `backlog/workflows/<slug>/` if it doesn't exist

4. Write the appropriate template to `backlog/workflows/<slug>/brief.md` based on the type:

### Type: feature (default)

```markdown
---
name: <NAME>
created: "<today's date YYYY-MM-DD>"
status: draft
type: feature
---

# <NAME>

## What to Build
<!-- Describe the feature in 2-5 sentences. What should it do? What problem does it solve? -->

## Target Users
<!-- Who will use this? End users, developers, admins? -->

## Scope

**In scope:**
-

**Out of scope:**
-

## Complexity Hint
<!-- single-component | multi-component | system-wide -->

## Task Type Hints
<!-- Check all that apply -->
- [ ] frontend
- [ ] backend
- [ ] devops
- [ ] testing
- [ ] documentation
- [ ] research

## Constraints
-

## Codebase Areas
-

## Integration Points
-

## Dependencies
<!-- Other features or tasks that must complete before/after this one -->
-

## Non-Functional Requirements
-

## Success Criteria
-

## Additional Context

```

### Type: qa

```markdown
---
name: <NAME>
created: "<today's date YYYY-MM-DD>"
status: draft
type: qa
---

# <NAME>

## Test Target
<!-- URL or application entry point to test -->

## What to Test
<!-- Describe the features, flows, or pages that need E2E testing -->

## Coverage Level
<!-- Pick one: Smoke | Regression | Comprehensive -->
-

## Test Artifacts
<!-- Check all that apply -->
- [ ] Screenshots
- [ ] Video recordings
- [ ] Accessibility reports
- [ ] Performance metrics

## Automation Preference
<!-- Pick one: Fully automated | Phase-by-phase review | Manual review after each step -->
-

## Test Scenarios

### Critical Paths
-

### Edge Cases
-

### Regression Areas
-

## Authentication
<!-- How to log in, test accounts -->

## Browser / Device Requirements
- Chrome (desktop)

## Environment Setup

## Known Issues

## Success Criteria
- All critical paths pass without errors
```

### Type: ui

```markdown
---
name: <NAME>
created: "<today's date YYYY-MM-DD>"
status: draft
type: ui
---

# <NAME>

## Style Guide (BLOCKING)
<!-- ⚠️ v0-planner REQUIRES a style guide to generate components. -->
<!-- If you have one, provide the path. If not, run the style-guide-generator first. -->
<!-- e.g. docs/style-guide.md, src/styles/theme.css -->
- Path:
- [ ] Style guide exists (if unchecked, run: `/style-guide-generator` before proceeding)

## Visual Tone
<!-- How should the UI feel? Pick one or describe your own. -->
<!-- Options: Professional | Playful | Minimal | Bold | Corporate | Custom -->
-

## Color Scheme / Theme
<!-- Primary brand color(s) and mode preference. Used for design token extraction. -->
- Primary color:
- Secondary color:
- Mode: light | dark | both
<!-- If using @theme tokens, list the CSS file: e.g. src/styles/theme.css -->

## Component Description
<!-- What UI component(s) need to be built? -->

## User Interaction
<!-- Clicks, forms, drag-drop, keyboard? -->

## Design Reference
<!-- Mockups, Figma, screenshots, or style description -->

## Component Breakdown
-

## Data & State

## Responsive Behavior
- Mobile:
- Desktop:

## Existing Patterns

## Accessibility
-

## Integration Point

## Success Criteria
-
```

### Type: lint

```markdown
---
name: <NAME>
created: "<today's date YYYY-MM-DD>"
status: draft
type: lint
---

# <NAME>

## Scope
<!-- Which directories or packages to lint-fix -->

## Error Types to Fix
- TypeScript errors
- ESLint violations
- Unused exports (knip)

## Automation Level
<!-- Pick one: fully-automated | phase-by-phase | manual-review -->
- fully-automated
- phase-by-phase
- manual-review

## Risk Tolerance
<!-- Pick one: aggressive | conservative | cautious -->
- conservative
- aggressive
- cautious

## Priority Rules

## Exclusions

## Context

## Success Criteria
- `npm run lint` passes with zero errors
- `npm run typecheck` passes with zero errors
```

### Type: demo

```markdown
---
name: <NAME>
created: "<today's date YYYY-MM-DD>"
status: draft
type: demo
---

# <NAME>

## Platform
<!-- twitter | instagram | github-readme | general -->
-

## Target URL

## What to Show

## Scenes

### Scene 1
- Duration: 3-5s
- Actions:
  - click: "#selector" or "element description"
  - type: "#selector" "text to type"
  - scroll: 600px
  - wait: 2s

### Scene 2
- Duration: 3-5s
- Actions:
  - click: "#selector"

## Visual Style
- Device frame: browser | phone | laptop | none
- Theme: light | dark

## Background
<!-- purple-gradient | dark-blue-gradient | solid-black | solid-white | custom CSS -->
- purple-gradient

## Effects
- [x] Zoom on clicks
- [x] Click ripples
- [ ] Motion blur

## Captions

## Audio

## Output
- Format: mp4
- Quality: 80
- FPS: 30

## Success Criteria
-
```

### Type: surreal

```markdown
---
name: <NAME>
created: "<today's date YYYY-MM-DD>"
status: draft
type: surreal-video
---

# <NAME>

## Creative Brief
<!-- Describe the surreal vision in 2-3 sentences -->

## Aesthetic Direction
<!-- melting-clocks | cosmic-ocean | organic-machines | liquid-architecture | custom -->
-

## Provider Preference
<!-- replicate-luma (recommended) | runway | kling | hailuo | auto -->
- auto

## Clip Duration
<!-- 5 | 10 | 15 | 30 seconds -->
- 10

## Number of Clips
- 1

## Branding
- Logo path:
- Intro text:
- Outro text:

## Transitions
<!-- fade | dissolve | cut | wipe | none -->
- fade

## Audio

## Output
- Format: mp4
- Resolution: 1920x1080

## Success Criteria
-
```

### Type: setup

```markdown
---
name: <NAME>
created: "<today's date YYYY-MM-DD>"
status: draft
type: setup
---

# <NAME>

## Project Path
<!-- Leave blank for current directory, or specify a monorepo package path -->
-

## Phases to Run
<!-- Check all that apply. All checked by default. -->
- [x] Architecture (cto-architect)
- [x] Configuration (config-setup-agent)
- [x] Cleanup (cleanup-agent)
- [x] Lint Resolution (lint-resolution-planner + lint-fixer)
- [x] Style Guide (style-guide-generator)

## Architecture Preferences

### System Type
<!-- B2B SaaS | Consumer App | Internal Tool | API/Platform -->
-

### Scale Target
<!-- MVP (<10k users) | Growth (10k-100k) | Enterprise (100k+) -->
-

### Documentation Scope
<!-- Full 6-file structure | Minimal README only | Update existing -->
-

## Configuration Scope

### Config Files to Generate
- [x] eslint.config.ts
- [x] tsconfig.json
- [x] knip.config.ts

### Framework Hints
<!-- If auto-detection might fail, specify: Next.js, Vite, React, Vue, NestJS, etc. -->
-

### Custom Ignores
<!-- Additional patterns to ignore beyond auto-detected -->
-

## Cleanup Scope
<!-- all | hygiene | images | knip -->
- all

## Lint Preferences

### Automation Level
<!-- fully-automated | phase-by-phase | manual-review -->
- fully-automated

### Risk Tolerance
<!-- aggressive | conservative | cautious -->
- conservative

## Style Guide Preferences

### Mode
<!-- interactive | extract | skip -->
- interactive

### Brand Color
<!-- Blue | Purple | Green | Orange | Custom (provide hex) -->
-

### Spacing Scale
<!-- Tight | Standard | Relaxed -->
- Standard

### Typography
<!-- Sans-serif | Serif | Monospace -->
- Sans-serif

### Dark Mode
<!-- Yes | No -->
- Yes

## Success Criteria
- Architecture documentation exists
- Config files generated with appropriate ignores
- No scratch files or orphan images remain
- Zero lint errors (or documented exceptions)
- Style guide exists with @theme tokens
```

5. Tell the user:
   - The brief has been created at the file path
   - They should fill in each section with their requirements
   - Based on the type, show the correct workflow command:
     - feature: `/workflow @backlog/workflows/<slug>/brief.md`
     - qa: `/qa @backlog/workflows/<slug>/brief.md`
     - ui: `/ui @backlog/workflows/<slug>/brief.md`
     - lint: `/lint-fix @backlog/workflows/<slug>/brief.md`
     - demo: `/demo @backlog/workflows/<slug>/brief.md`
     - surreal: `/surreal @backlog/workflows/<slug>/brief.md`
     - setup: `/setup @backlog/workflows/<slug>/brief.md`
     - redesign: `/redesign @backlog/workflows/<slug>/brief.md`
