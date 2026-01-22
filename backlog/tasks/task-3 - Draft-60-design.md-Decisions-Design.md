---
id: task-3
title: Draft 60-design.md (Decisions & Design)
status: To Do
assignee: []
created_date: ''
updated_date: '2026-01-22 14:20'
labels:
  - design
  - doc
  - spec
milestone: Language specifications
dependencies: []
ordinal: 3000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
# Objective
Create the canonical design & decisions page `60-design.md` for the Camus project. This page will gather the project's core decisions (terminology, signing policy, `kiss` workflow, tests/seeds policy, "ticket before code" rule, and other governance items) and serve as the single source of truth for high-level project policy and rationale.

> Important: Any change to these decisions must be preceded by a Backlog ticket and explicit approval before the change is merged ("ticket before code" rule).

---

# Expected content (suggested structure)
The page should at minimum contain the following sections:

1. Summary / Vision — short project-level intent and goals.
2. Terminology / Glossary — define `claim`, `tests`, `clues`, and other core terms.
3. Proof & testing policy — what `kiss test` and `kiss certify` should do; seeds and reproducibility policy.
4. Formatting & canonicalization — rule to run `kiss fmt` before certification and signing.
5. Signing policy — initial policy (source-only signing), signer expectations, and storage of signatures.
6. `kiss` workflow overview — essential commands and intended high-level behavior (dev vs release).
7. Milestones & roadmap — link to backlog milestones and high-level phases.
8. Decision governance — how to propose, review, and accept decisions (tickets → decisions).
9. Links & references — related tickets, conversation notes, and specs.
10. History / Addendum — changelog of decisions and links to originating tickets.
<!-- SECTION:DESCRIPTION:END -->

# Objective
Create the canonical design & decisions page `60-design.md` for the Camus project. This page will gather the project's core decisions (terminology, signing policy, `kiss` workflow, tests/seeds policy, "ticket before code" rule, and other governance items) and serve as the single source of truth for high-level project policy and rationale.

> Important: Any change to these decisions must be preceded by a Backlog ticket and explicit approval before the change is merged ("ticket before code" rule).

---

# Expected content (suggested structure)
The page should at minimum contain the following sections:

1. Summary / Vision — short project-level intent and goals.
2. Terminology / Glossary — define `claim`, `tests`, `clues`, and other core terms.
3. Proof & testing policy — what `kiss test` and `kiss certify` should do; seeds and reproducibility policy.
4. Formatting & canonicalization — rule to run `kiss fmt` before certification and signing.
5. Signing policy — initial policy (source-only signing), signer expectations, and storage of signatures.
6. `kiss` workflow overview — essential commands and intended high-level behavior (dev vs release).
7. Milestones & roadmap — link to backlog milestones and high-level phases.
8. Decision governance — how to propose, review, and accept decisions (tickets → decisions).
9. Links & references — related tickets, conversation notes, and specs.
10. History / Addendum — changelog of decisions and links to originating tickets.

---

# Acceptance criteria (DoD)
- [ ] `Camus/60-design.md` file exists with Jekyll-compatible frontmatter (e.g., `layout: page`, `title`, `permalink`) and is draft-ready.
- [ ] The page includes all sections listed above, at least as an initial draft.
- [ ] Terminology `claim`, `tests`, and `clues` is clearly defined and linked to ticket `task-2` (vocabulary).
- [ ] `kiss` behavior is described (at minimum: `fmt`, `test`, `build --dev`, `certify`) with short examples or usage notes.
- [ ] Signing policy is documented (source-only initial policy), and the expected format for `kiss.lock` entries is outlined.
- [ ] A short note describing how to use milestones and where to find them is included (linking to the milestone placeholders).
- [ ] The ticket `task-3` is referenced in the page (History / Links), and the page references `task-3` (bidirectional traceability).

---

# Recommended subtasks
1. Draft `Camus/60-design.md` locally following the structure above (create Jekyll frontmatter).
2. Add a short glossary entry for `claim`, `tests`, and `clues` (link to `task-2`).
3. Add concrete examples (mini `Hello` and `sortList` examples showing `claim` + `tests`).
4. Add a short "How to update this page" paragraph that enforces "ticket before code".
5. Open a PR adding `Camus/60-design.md`, reference `task-3` in PR description.
6. Iterate on feedback and merge.

---

# Notes / open questions
- Should `clues` be a distinct, non-executable field or a subtype of `tests` (executable vs documentary)?
- Key management for signing: local key files vs OS keyring vs external signing agent — which to adopt initially?
- How to handle tests that require external services (sandboxing policy for certification)?
- Decide the canonical location for `60-design.md` (root `Camus/60-design.md` vs `_pages/60-design.md` for the site).

---

# Estimate & priority
- Estimate: S (draft + review; iterations to follow).
- Priority: High — structures project governance and developer workflow.

---

# References
- Parent ticket: `task-1 - Initialize the backlog and define milestones`
- Vocabulary ticket: `task-2 - Formalize vocabulary: claim, tests vs clues`
- Related conversations: `Camus/conversation.md` (sections on Tests, Certification, Kiss)
- Follow-ups: SPEC skeleton, `kiss` prototypes, formatter specification.

---

*Once this ticket is completed and accepted, split implementation work into concrete tickets (SPEC.md, `kiss` prototype, formatter, test harness, registry design, etc.).*

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 `Camus/60-design.md` file exists with Jekyll-compatible frontmatter (e.g., `layout: page`, `title`, `permalink`) and is draft-ready.
- [ ] #2 The page includes all sections listed above, at least as an initial draft.
- [ ] #3 Terminology `claim`, `tests`, and `clues` is clearly defined and linked to ticket `task-2` (vocabulary).
- [ ] #4 `kiss` behavior is described (at minimum: `fmt`, `test`, `build --dev`, `certify`) with short examples or usage notes.
- [ ] #5 Signing policy is documented (source-only initial policy), and the expected format for `kiss.lock` entries is outlined.
- [ ] #6 A short note describing how to use milestones and where to find them is included (linking to the milestone placeholders).
- [ ] #7 The ticket `task-3` is referenced in the page (History / Links), and the page references `task-3` (bidirectional traceability).
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Draft `Camus/60-design.md` locally following the structure above (create Jekyll frontmatter).
2. Add a short glossary entry for `claim`, `tests`, and `clues` (link to `task-2`).
3. Add concrete examples (mini `Hello` and `sortList` examples showing `claim` + `tests`).
4. Add a short "How to update this page" paragraph that enforces "ticket before code".
5. Open a PR adding `Camus/60-design.md`, reference `task-3` in PR description.
6. Iterate on feedback and merge.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
- Should `clues` be a distinct, non-executable field or a subtype of `tests` (executable vs documentary)?
- Key management for signing: local key files vs OS keyring vs external signing agent — which to adopt initially?
- How to handle tests that require external services (sandboxing policy for certification)?
- Decide the canonical location for `60-design.md` (root `Camus/60-design.md` vs `_pages/60-design.md` for the site).
<!-- SECTION:NOTES:END -->
