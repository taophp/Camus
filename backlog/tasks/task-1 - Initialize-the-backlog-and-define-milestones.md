---
id: task-1
title: Initialize the backlog and define milestones
status: To Do
assignee: []
created_date: '2026-01-22 11:11'
updated_date: '2026-01-23 12:36'
labels:
  - infrastructure
  - backlog
  - setup
dependencies: []
ordinal: 1000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Context
-------
This ticket serves as the formal initialization of the Backlog.md backlog for the Camus project. It organizes the first operational decisions (nomenclature, minimal signing policy, the basic `kiss` workflow) and sets up the list of milestones that will be used to structure upcoming work.

Important reminders
------------------
- Any change to code/format/spec must start with a Backlog.md ticket _before_ any implementation.
- Terminology decision already made: the term `claim` will be used (equivalent to "prétention").
- Initial signing policy: to begin with, only the normalized source will be signed (not the IR).
- `kiss` must be able to produce a dev executable (unsigned and non-publishable) for fast local iterations.

Objective
---------
Provide a base of clear tasks and milestones so that subsequent work is traceable and can be planned.
<!-- SECTION:DESCRIPTION:END -->

# Initialize the backlog and define milestones

Context
-------
This ticket serves as the formal initialization of the Backlog.md backlog for the Camus project. It organizes the first operational decisions (nomenclature, minimal signing policy, the basic `kiss` workflow) and sets up the list of milestones that will be used to structure upcoming work.

Important reminders
------------------
- Any change to code/format/spec must start with a Backlog.md ticket _before_ any implementation.
- Terminology decision already made: the term `claim` will be used (equivalent to "prétention").
- Initial signing policy: to begin with, only the normalized source will be signed (not the IR).
- `kiss` must be able to produce a dev executable (unsigned and non-publishable) for fast local iterations.

Objective
---------
Provide a base of clear tasks and milestones so that subsequent work is traceable and can be planned.

Acceptance criteria (DoD)
-------------------------
- [ ] The following milestones are added to `Camus/backlog/config.yml`:
  - `Language specifications`
  - `Syntax exploration`
  - `Tools (kiss)`
  - `Compilation & self-hosting`
  - `Website & documentation`
- [ ] Each task listed in "Immediate tasks" exists as a separate file under `Camus/backlog/tasks/` (initial status `To Do`) and contains a description plus acceptance criteria.
- [ ] A Jekyll file `60-design.md` is planned (ticket created) and its location is agreed (`Camus/60-design.md` or `Camus/_pages/60-design.md`) so it appears on the site.
- [ ] The "no implementation without a ticket" rule is recorded in `60-design.md` or `CONTRIBUTING.md`.
- [ ] A person (or a bot) confirms they have read the Backlog.md documentation (or consulted the overview) and leaves a confirmation comment on this ticket.

Immediate tasks (to be created as separate tickets)
--------------------------------------------------
- [ ] `001-decision-vocab-claim-tests.md`  
  - Objective: formalize the terminology (`claim`, `tests` vs `clues`) and produce a short glossary entry in `60-design.md`.
  - Acceptance: decision documented and accepted by the PO; entry added to `60-design.md`.

- [ ] `002-create-60-design.md`  
  - Objective: draft the `60-design.md` page (initial structural and procedural decisions).  
  - Minimum content: terminology (`claim`), signing policy (source only), tests/seeds policy, `kiss` behaviour (dev build unsigned), rule "ticket before code".

- [ ] `003-backlog-milestones-update.md`  
  - Objective: update `Camus/backlog/config.yml` with the milestones above and verify their visibility in the Backlog.md UI.

- [ ] `004-kiss-workflow-spec.md`  
  - Objective: define the high-level `kiss` workflow (commands and minimal behavior):
    - `kiss init`
    - `kiss fmt`
    - `kiss test`
    - `kiss build --dev` (local artifact, unsigned, non-publishable)
    - `kiss build --release` (to be connected with `kiss certify` later)
    - `kiss certify`: runs tests, records seeds/hashes, prepares human signature
  - Acceptance: summary document + usage examples.

- [ ] `005-spec-skeleton.md`  
  - Objective: create the skeleton for `SPEC.md` (template for formal specification): sections, conventions, `claim` format, `tests` format (examples + property + seed), and expected formatter/canonical format.

- [ ] `006-examples-hello-inventory.md`  
  - Objective: add initial examples (Hello, Inventory) as example components and create tickets for their implementation/validation.

- [ ] `007-ci-and-policy.md`  
  - Objective: define minimal CI controls (run `kiss test`, verify seeds, reject release if no certification ticket) and document the rule "PR must reference a Backlog ticket".

Deliverables & DoD
------------------
- The tickets mentioned above appear in `Camus/backlog/tasks/` with minimal content (description + acceptance criteria).
- `60-design.md` is created (draft is acceptable), contains the decisions listed above, and is linked from the README or the backlog page.
- A confirmation comment (indicating that someone has read the Backlog.md overview) is added to the initial ticket.
- No implementation work related to the listed features is performed until the corresponding tickets are moved to `In Progress`/`Done`.

Notes & risks
------------
- Risk: persistent terminological ambiguities — the `001-decision-vocab-claim-tests.md` task must be prioritized as it impacts all documentation.
- Risk: signing non-normalized code will yield unstable signatures — reiterate the requirement to run the canonical formatter (`kiss fmt`) before signing.

Follow-up
---------
- Once the tickets are created and validated, they can be assigned and prioritized under the first milestone: `Language specifications`.

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The following milestones are added to `Camus/backlog/config.yml`:
  - `Language specifications`
  - `Syntax exploration`
  - `Tools (kiss)`
  - `Compilation & self-hosting`
  - `Website & documentation`
- [ ] #2 Each task listed in "Immediate tasks" exists as a separate file under `Camus/backlog/tasks/` (initial status `To Do`) and contains a description plus acceptance criteria.
- [ ] #3 A Jekyll file `60-design.md` is planned (ticket created) and its location is agreed (`Camus/60-design.md` or `Camus/_pages/60-design.md`) so it appears on the site.
- [ ] #4 The "no implementation without a ticket" rule is recorded in `60-design.md` or `CONTRIBUTING.md`.
- [ ] #5 A person (or a bot) confirms they have read the Backlog.md documentation (or consulted the overview) and leaves a confirmation comment on this ticket.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Immediate tasks (to be created as separate tickets)
--------------------------------------------------
- [ ] `001-decision-vocab-claim-tests.md`  
  - Objective: formalize the terminology (`claim`, `tests` vs `clues`) and produce a short glossary entry in `60-design.md`.
  - Acceptance: decision documented and accepted by the PO; entry added to `60-design.md`.

- [ ] `002-create-60-design.md`  
  - Objective: draft the `60-design.md` page (initial structural and procedural decisions).  
  - Minimum content: terminology (`claim`), signing policy (source only), tests/seeds policy, `kiss` behaviour (dev build unsigned), rule "ticket before code".

- [ ] `003-backlog-milestones-update.md`  
  - Objective: update `Camus/backlog/config.yml` with the milestones above and verify their visibility in the Backlog.md UI.

- [ ] `004-kiss-workflow-spec.md`  
  - Objective: define the high-level `kiss` workflow (commands and minimal behavior):
    - `kiss init`
    - `kiss fmt`
    - `kiss test`
    - `kiss build --dev` (local artifact, unsigned, non-publishable)
    - `kiss build --release` (to be connected with `kiss certify` later)
    - `kiss certify`: runs tests, records seeds/hashes, prepares human signature
  - Acceptance: summary document + usage examples.

- [ ] `005-spec-skeleton.md`  
  - Objective: create the skeleton for `SPEC.md` (template for formal specification): sections, conventions, `claim` format, `tests` format (examples + property + seed), and expected formatter/canonical format.

- [ ] `006-examples-hello-inventory.md`  
  - Objective: add initial examples (Hello, Inventory) as example components and create tickets for their implementation/validation.

- [ ] `007-ci-and-policy.md`  
  - Objective: define minimal CI controls (run `kiss test`, verify seeds, reject release if no certification ticket) and document the rule "PR must reference a Backlog ticket".
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Deliverables & DoD
------------------
- The tickets mentioned above appear in `Camus/backlog/tasks/` with minimal content (description + acceptance criteria).
- `60-design.md` is created (draft is acceptable), contains the decisions listed above, and is linked from the README or the backlog page.
- A confirmation comment (indicating that someone has read the Backlog.md overview) is added to the initial ticket.
- No implementation work related to the listed features is performed until the corresponding tickets are moved to `In Progress`/`Done`.
<!-- SECTION:NOTES:END -->
