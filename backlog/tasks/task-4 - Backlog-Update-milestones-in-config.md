---
id: task-4
title: 'Backlog: Update milestones in config'
status: To Do
assignee: []
created_date: ''
updated_date: '2026-01-22 14:20'
labels:
  - backlog
  - config
  - process
milestone: Initialisation
dependencies: []
ordinal: 4000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
# Objective
Add and structure the initial set of milestones in `Camus/backlog/config.yml` so the backlog can be organized, filtered, and navigated by development phase. This ticket prepares the project for milestone-based planning and review.

# Proposed milestones
- Language specifications
- Syntax exploration
- Tools (kiss)
- Compilation & self-hosting
- Website & documentation
- Examples & demonstrations
- Security & certification
- Publication & registry
- Maintenance & operations

# Why this matters
- Milestones provide high-level planning anchors and improve visibility for reviewers and contributors.
- They make it easier to group and prioritize related tickets as the project grows.
- With milestones in the config, the Backlog CLI and UI can surface progress and provide consistent filtering and reporting.
<!-- SECTION:DESCRIPTION:END -->

# Objective
Add and structure the initial set of milestones in `Camus/backlog/config.yml` so the backlog can be organized, filtered, and navigated by development phase. This ticket prepares the project for milestone-based planning and review.

# Proposed milestones
- Language specifications
- Syntax exploration
- Tools (kiss)
- Compilation & self-hosting
- Website & documentation
- Examples & demonstrations
- Security & certification
- Publication & registry
- Maintenance & operations

# Why this matters
- Milestones provide high-level planning anchors and improve visibility for reviewers and contributors.
- They make it easier to group and prioritize related tickets as the project grows.
- With milestones in the config, the Backlog CLI and UI can surface progress and provide consistent filtering and reporting.

# Acceptance criteria (DoD)
- [ ] `Camus/backlog/config.yml` contains a `milestones` key with the approved list (or an agreed variant).
- [ ] A PR is opened that updates `backlog/config.yml` and documents the rationale for each milestone name.
- [ ] Placeholder tasks exist in `Camus/backlog/tasks/` for each milestone (minimal: title + short description + status `To Do`).
- [ ] Existing tickets are updated to set the appropriate `milestone` frontmatter where applicable (e.g., `task-2`, `task-3`).
- [ ] Manual verification that `backlog board` / `backlog browser` shows the new milestones and that filtering by milestone works.
- [ ] A short note about milestone usage is added to `Camus/60-design.md` (or the agreed location) and the page links back to this ticket.

# Tasks
1. Edit `Camus/backlog/config.yml` to insert the `milestones` list.
2. Create a minimal placeholder task for each milestone in `Camus/backlog/tasks/`.
3. Update the `milestone` frontmatter on existing relevant tasks.
4. Open a PR with the updates and request a quick review from maintainers.
5. After merge, verify milestone visibility in CLI and browser and add a short “How to use milestones” paragraph to `60-design.md`.

# Notes & risks
- Keep milestone names concise and avoid overlapping semantics with labels (milestones are not epics).
- If localization is required later, consider adding aliases or documenting preferred names in `60-design.md`.
- Small name changes after the initial merge are acceptable but should be done with a short PR and rationale to avoid confusion.

# Estimate & priority
- Estimation: XS (small config update + create placeholders).
- Priority: High — establishes foundational planning structure.

# References
- Parent ticket: `task-1 - Initialize the backlog and define milestones`
- Related: `task-3 - Draft 60-design.md (Decisions & Design)`

*Once this ticket is completed, close it and ensure the milestone usage note is present in `60-design.md`.*

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 `Camus/backlog/config.yml` contains a `milestones` key with the approved list (or an agreed variant)
- [ ] #2 A PR is opened that updates `backlog/config.yml` and documents the rationale for each milestone name
- [ ] #3 Placeholder tasks exist in `Camus/backlog/tasks/` for each milestone (minimal: title + short description + status `To Do`)
- [ ] #4 Existing tickets are updated to set the appropriate `milestone` frontmatter where applicable (e.g., `task-2`, `task-3`)
- [ ] #5 Manual verification that `backlog board` / `backlog browser` shows the new milestones and that filtering by milestone works
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Edit `Camus/backlog/config.yml` to insert the `milestones` list.
2. Create a minimal placeholder task for each milestone in `Camus/backlog/tasks/`.
3. Update the `milestone` frontmatter on existing relevant tasks.
4. Open a PR with the updates and request a quick review from maintainers.
5. After merge, verify milestone visibility in CLI and browser and add a short “How to use milestones” paragraph to `60-design.md`.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
- Keep milestone names concise and avoid overlapping semantics with labels (milestones are not epics).
- If localization is required later, consider adding aliases or documenting preferred names in `60-design.md`.
- Small name changes after the initial merge are acceptable but should be done with a short PR and rationale to avoid confusion.
<!-- SECTION:NOTES:END -->
