# Feature Brief Template

**Use for:** Product planning (WHAT/WHY) before task creation. **NOT for:** Complex architecture (use feature-spec-template.md).

**Location:** `backlog/plans/[feature-name]-brief.md`

---

```markdown
---
feature_id: brief-{YYYY-MM-DD}-{slug}
title: {Feature Name}
created_by: {Agent or User}
created_date: '{YYYY-MM-DD}'
status: draft
priority: medium
labels: [{label1}]
related_spec: {path if escalated}
---

# {Feature Name}

## Problem Statement
{2-3 sentences: WHAT to build and WHY. Focus on user/business value.}

## Success Metrics
- {Metric 1: e.g., "User engagement +20%"}
- {Metric 2: e.g., "Support tickets -15%"}
- {Metric 3: e.g., "50% adoption in 2 weeks"}

## Scope
**In:** {Included features} | **Out:** {Excluded items, future work}

## Technical Approach
{Brief overview. Libraries/patterns to consider. Key decisions needed.}

## Related Tasks
{Populated by feature-planner}
- task-XXX: {Title}

## Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| {Risk} | H/M/L | {How to mitigate} |

## Next Steps
1. Review brief
2. Run: `Plan tasks for {feature name}`
3. feature-planner generates JSON → spawn task-makers
**Escalate to cto-architect if:** New architecture, tech stack decisions, or complex migrations needed.
```

---

**Example:**

```markdown
---
feature_id: brief-2025-11-26-profile-dashboard
title: User Profile Dashboard
created_by: feature-planner
created_date: '2025-11-26'
status: ready
priority: high
labels: [frontend, ux]
---

# User Profile Dashboard

## Problem Statement
Users need centralized profile management (info, avatar, settings). Currently spread across pages, causing fragmented UX and support tickets.

## Success Metrics
- Profile completion: 45% → 75%
- Support tickets -30%
- Update time: 3min → 1min

## Scope
**In:** Profile display, avatar upload with crop, settings (notifications/privacy), form validation, mobile-responsive
**Out:** Password reset, account deletion, social integrations, 2FA

## Technical Approach
React component with React Hook Form and React Dropzone. Use existing design system and `/api/v1/users/profile`.
**Decisions:** S3 vs CDN, client vs server cropping, optimistic updates.

## Related Tasks
- task-031: Profile form component
- task-032: Avatar upload
- task-033: Settings panel
- task-034: Backend API

## Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Large uploads slow page | M | Client-side compression |
| GDPR compliance | H | Legal review, data export |

## Next Steps
1. ✅ Brief approved
2. feature-planner → JSON → task-makers
3. Assign to frontend-engineer
```

---

**Tips:** Keep concise. Focus on WHAT/WHY, not detailed HOW. Escalate to full spec if architecture/tech stack decisions needed.
