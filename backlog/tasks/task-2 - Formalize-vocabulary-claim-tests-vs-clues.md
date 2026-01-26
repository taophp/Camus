---
id: task-2
title: 'Formalize vocabulary: claim, tests vs clues'
status: To Do
assignee: []
created_date: ''
updated_date: '2026-01-26 13:05'
labels:
  - backlog
  - config
  - process
milestone: m-0
dependencies: []
ordinal: 2000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
```
function sortList(list: Array[Int]) -> Array[Int]
  claim "Return a stable sorted list containing the same elements"
  tests {
    example [3,1,2] => [1,2,3]
    property "is_sorted"
  }
  clues {
    rationale "Use a stable sort to preserve relative order when required by the caller."
    audit_ref "registry:audits/1234"
  }
  {
    // Camus body — written by AI and audited by a human
  }
```
<!-- SECTION:DESCRIPTION:END -->

# Acceptance criteria (DoD)
- [ ] The decision is taken and formalized in `60-design.md` (section Vocabulary / Claims & Proofs).
- [ ] The ticket clearly documents:
  - the exact meaning of `claim`, `tests`, and `clues`,
  - the expected behavior of `kiss test` and `kiss certify` regarding these fields,
  - how results are archived (seeds, hashes, logs).
- [ ] A minimal data schema (JSON Schema / YAML example) is written for `claim` (format for `tests` + `clues`).
- [ ] Concrete examples (Hello, Inventory or sortList) are added under `Camus/examples/` (or an agreed examples directory) demonstrating `claim` + `tests` + `clues`.
- [ ] Decisions are referenced from ticket `task-1 - Initialize the backlog and define milestones` and linked from `60-design.md`.
- [ ] (Optional / Nice-to-have) A small local demo script `kiss test` that reads the example and runs a simple test is provided to validate the approach (light prototype, not production).

---

# Proposed tasks to resolve this ticket
1. Draft the final proposal (English; French may be included as a reference) in the ticket for quick review.
2. Add the corresponding section to `60-design.md` (draft acceptable).
3. Write a minimal schema file `spec/claim.schema.yaml` (or `.json`) describing:
   - `claim.description` (string),
   - `tests` (list of test objects: `type`, `input`, `expected`, `seed?`, `notes?`),
   - `clues` (list of objects: `type`, `content`, `ref`).
4. Add 1–2 real examples to `Camus/examples/` demonstrating usage.
5. Verify with a manual run that a prototype `kiss test` can execute the example test and that `kiss certify` records seed + hash (if the prototype exists).
6. Finalize the text in `60-design.md` and close this ticket.

---

# Notes / Open questions
- Do you want `clues` to have subtypes (e.g., `rationale`, `audit_ref`, `property_proof`) or remain freetext for the initial phase?
- Seed / reproducibility policy: for `tests` we must require the storage of seeds/inputs and the "golden" result in the lockfile for reproducible certification (confirmed in previous discussions). This ticket should specify where/how that is stored (format of `kiss.lock`).
- Naming preference: `tests` is clear and standard; `clues` is useful for non-executable items. If you prefer a single name, we could use `tests` with a subtype `executable | documentary` — decision to be taken during review.

---

# Estimation & Priority
- Estimation: XS → S (small specification task + examples).
- Priority: High — affects how `kiss` will consume and archive evidence and therefore has a direct impact on certification.

---

# References
- Past discussions/decisions: `Camus/conversation.md` (sections "Tests", "Certification", "kiss").
- Parent ticket: `task-1 - Initialize the backlog and define milestones`.

---

*End of ticket — please comment your preference on `tests` vs `clues` (or accept the mixed proposal above) so we can close the decision and move to deliverables.*

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The decision is taken and formalized in `60-design.md` (section Vocabulary / Claims & Proofs).
- [ ] #2 The ticket clearly documents:
  - the exact meaning of `claim`, `tests`, and `clues`,
  - the expected behavior of `kiss test` and `kiss certify` regarding these fields,
  - how results are archived (seeds, hashes, logs).
- [ ] #3 A minimal data schema (JSON Schema / YAML example) is written for `claim` (format for `tests` + `clues`).
- [ ] #4 Concrete examples (Hello, Inventory or sortList) are added under `Camus/examples/` (or an agreed examples directory) demonstrating `claim` + `tests` + `clues`.
- [ ] #5 Decisions are referenced from ticket `task-1 - Initialize the backlog and define milestones` and linked from `60-design.md`.
- [ ] #6 (Optional / Nice-to-have) A small local demo script `kiss test` that reads the example and runs a simple test is provided to validate the approach (light prototype, not production).
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Draft the final proposal (English; French may be included as a reference) in the ticket for quick review.
2. Add the corresponding section to `60-design.md` (draft acceptable).
3. Write a minimal schema file `spec/claim.schema.yaml` (or `.json`) describing:
   - `claim.description` (string),
   - `tests` (list of test objects: `type`, `input`, `expected`, `seed?`, `notes?`),
   - `clues` (list of objects: `type`, `content`, `ref`).
4. Add 1–2 real examples to `Camus/examples/` demonstrating usage.
5. Verify with a manual run that a prototype `kiss test` can execute the example test and that `kiss certify` records seed + hash (if the prototype exists).
6. Finalize the text in `60-design.md` and close this ticket.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
- Do you want `clues` to have subtypes (e.g., `rationale`, `audit_ref`, `property_proof`) or remain freetext for the initial phase?
- Seed / reproducibility policy: for `tests` we must require the storage of seeds/inputs and the "golden" result in the lockfile for reproducible certification (confirmed in previous discussions). This ticket should specify where/how that is stored (format of `kiss.lock`).
- Naming preference: `tests` is clear and standard; `clues` is useful for non-executable items. If you prefer a single name, we could use `tests` with a subtype `executable | documentary` — decision to be taken during review.
<!-- SECTION:NOTES:END -->
