---
id: task-6
title: 'SPEC skeleton: draft SPEC.md structure'
status: To Do
assignee: []
created_date: ''
updated_date: '2026-01-26 09:35'
labels:
  - spec
  - doc
milestone: m-1
dependencies: []
ordinal: 6000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
# Objective

Create a clear, reviewable skeleton for `SPEC.md` that will serve as the canonical specification for the Camus language and toolchain. The skeleton should:

- define the sections required for a full specification,
- indicate the acceptance criteria and open questions for each section,
- link decisions to backlog tickets and `60-design.md`,
- identify follow-up tasks (examples, schemas, PoCs) required to complete each section.

This ticket produces the baseline document and a small set of follow-up tasks enabling incremental implementation.

---

# Scope

The SPEC skeleton must at least cover:
- core terminology and glossary,
- the `claim` model and how evidence is attached (`tests`, `clues`),
- language units (function/module/component) and composition rules,
- types and core semantics,
- tests, reproducibility policy (seeds, hashes, logs),
- canonical formatting rules and canonicalization for signing,
- `kiss` lockfile (`kiss.lock`) sketch and signing metadata,
- developer workflows (dev vs release) and CI gating,
- registry & publishing policy (dev vs certified artifacts),
- examples and minimal PoCs (Hello, sortList, Inventory),
- list of open questions and governance rules (ticket-before-code).

---

# Proposed SPEC.md structure (skeleton)

1. Introduction
   - Purpose, scope, audience, and how SPEC relates to `60-design.md`.

2. Terminology & Glossary
   - Define `claim`, `tests`, `clues`, `certify`, `kiss.lock`, signer, etc.

3. Project model & units of composition
   - Project / Module / Component / Function definitions, composition and isolation rules.

4. Types & core semantics
   - Primitive and composite types, mutability model, nullability, type conventions.

5. Control flow & evaluation model
   - Determinism guarantees, side-effect model, I/O policy.

6. Claims, tests & clues
   - Structure of `claim` blocks, test schema (examples/properties/seeds), `clues` semantics.

7. Canonical formatting & normalization
   - `kiss fmt` rules, canonical representation used for hashing/signing.

8. Testing & certification
   - `kiss test` behavior, test metadata format, where test artifacts are stored, `kiss certify` flow.

9. Lockfile & signing model
   - Sketch of `kiss.lock` schema: canonical_source_hash, test metadata, signer identity, signature, published/dev flags.

10. Tools & CLI reference (overview)
    - High-level description of `kiss` commands and expected UX (dev loop vs certification).

11. Registry & publication policy
    - Trust levels, pre-publish checks, non-publishable dev artifacts.

12. Examples
    - Minimal runnable examples that include `claim + tests` and expected certification flows.

13. Governance & workflow
    - “Ticket before code” rule; where decisions are recorded and how to propose changes.

14. Appendix & schemas
    - Placeholders for `spec/claim.schema.yaml`, `spec/kiss.lock.schema.yaml`, examples.
<!-- SECTION:DESCRIPTION:END -->

# Objective

Create a clear, reviewable skeleton for `SPEC.md` that will serve as the canonical specification for the Camus language and toolchain. The skeleton should:

- define the sections required for a full specification,
- indicate the acceptance criteria and open questions for each section,
- link decisions to backlog tickets and `60-design.md`,
- identify follow-up tasks (examples, schemas, PoCs) required to complete each section.

This ticket produces the baseline document and a small set of follow-up tasks enabling incremental implementation.

---

# Scope

The SPEC skeleton must at least cover:
- core terminology and glossary,
- the `claim` model and how evidence is attached (`tests`, `clues`),
- language units (function/module/component) and composition rules,
- types and core semantics,
- tests, reproducibility policy (seeds, hashes, logs),
- canonical formatting rules and canonicalization for signing,
- `kiss` lockfile (`kiss.lock`) sketch and signing metadata,
- developer workflows (dev vs release) and CI gating,
- registry & publishing policy (dev vs certified artifacts),
- examples and minimal PoCs (Hello, sortList, Inventory),
- list of open questions and governance rules (ticket-before-code).

---

# Proposed SPEC.md structure (skeleton)

1. Introduction
   - Purpose, scope, audience, and how SPEC relates to `60-design.md`.

2. Terminology & Glossary
   - Define `claim`, `tests`, `clues`, `certify`, `kiss.lock`, signer, etc.

3. Project model & units of composition
   - Project / Module / Component / Function definitions, composition and isolation rules.

4. Types & core semantics
   - Primitive and composite types, mutability model, nullability, type conventions.

5. Control flow & evaluation model
   - Determinism guarantees, side-effect model, I/O policy.

6. Claims, tests & clues
   - Structure of `claim` blocks, test schema (examples/properties/seeds), `clues` semantics.

7. Canonical formatting & normalization
   - `kiss fmt` rules, canonical representation used for hashing/signing.

8. Testing & certification
   - `kiss test` behavior, test metadata format, where test artifacts are stored, `kiss certify` flow.

9. Lockfile & signing model
   - Sketch of `kiss.lock` schema: canonical_source_hash, test metadata, signer identity, signature, published/dev flags.

10. Tools & CLI reference (overview)
    - High-level description of `kiss` commands and expected UX (dev loop vs certification).

11. Registry & publication policy
    - Trust levels, pre-publish checks, non-publishable dev artifacts.

12. Examples
    - Minimal runnable examples that include `claim + tests` and expected certification flows.

13. Governance & workflow
    - “Ticket before code” rule; where decisions are recorded and how to propose changes.

14. Appendix & schemas
    - Placeholders for `spec/claim.schema.yaml`, `spec/kiss.lock.schema.yaml`, examples.

---

# Acceptance criteria (DoD)

- [ ] `Camus/SPEC.md` skeleton file exists in the repository and is accessible for review.
- [ ] Each major section contains a short description and a list of open sub-questions or decisions to be resolved.
- [ ] SPEC references `60-design.md` and links to related tickets (e.g., `task-2`, `task-3`).
- [ ] Placeholders for `spec/claim.schema.yaml` and `spec/kiss.lock.schema.yaml` are present (empty or with a minimal example).
- [ ] The Examples section contains at least one stubbed example (`Hello` or `sortList`) with `claim` + `tests`.
- [ ] The ticket lists clear follow-up tasks for converting each skeleton section into a full specification (content + PoCs).
- [ ] A reviewer (PO/maintainer) has acknowledged the skeleton and approved the follow-up task list.

---

# Proposed subtasks

1. Create `Camus/SPEC.md` with the skeleton above (this ticket).
2. Draft `spec/claim.schema.yaml` (minimal schema for `claim`, `tests`, `clues`).
3. Draft `spec/kiss.lock.schema.yaml` (lockfile schema sketch + example).
4. Add example implementations under `examples/` (Hello, sortList) demonstrating `claim + tests`.
5. Create 2–3 small PoCs:
   - `kiss fmt` proof-of-concept (format+canonicalization)
   - `kiss test` prototype writing test metadata
   - `kiss certify` prototype that updates `kiss.lock`
6. Open follow-up backlog tickets to expand SPEC sections, prioritize, and implement PoCs.

---

# Notes & open questions

- Should `clues` be structured (subtypes) or free-text initially?
- Decide canonical hashing algorithm and exact canonicalization steps for signing.
- Signing UX & key management: interactive human signing vs headless automation (policy to be decided).
- How to handle tests requiring external resources (sandboxing policy for certification).
- Granularity in `kiss.lock`: function-level vs component-level entries.

---

# Estimate & priority

- Estimate: M (skeleton + small PoCs + basic schemas).
- Priority: High — SPEC will guide the implementation and certification model.

---

# References

- `Camus/60-design.md` (design & governance)
- Conversation notes: `Camus/conversation.md`
- Related tickets: `task-1` (backlog init), `task-2` (vocabulary), `task-3` (60-design), `task-4` (milestones), `task-5` (KISS CLI spec)

*When this skeleton is accepted, begin splitting the work into small, reviewable PRs: SPEC content sections + one PoC at a time.*

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 `Camus/SPEC.md` skeleton file exists in the repository and is accessible for review.
- [ ] #2 Each major section contains a short description and a list of open sub-questions or decisions to be resolved.
- [ ] #3 SPEC references `60-design.md` and links to related tickets (e.g., `task-2`, `task-3`).
- [ ] #4 Placeholders for `spec/claim.schema.yaml` and `spec/kiss.lock.schema.yaml` are present (empty or with a minimal example).
- [ ] #5 The Examples section contains at least one stubbed example (`Hello` or `sortList`) with `claim` + `tests`.
- [ ] #6 The ticket lists clear follow-up tasks for converting each skeleton section into a full specification (content + PoCs).
- [ ] #7 A reviewer (PO/maintainer) has acknowledged the skeleton and approved the follow-up task list.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
# Proposed subtasks

1. Create `Camus/SPEC.md` with the skeleton above (this ticket).
2. Draft `spec/claim.schema.yaml` (minimal schema for `claim`, `tests`, `clues`).
3. Draft `spec/kiss.lock.schema.yaml` (lockfile schema sketch + example).
4. Add example implementations under `examples/` (Hello, sortList) demonstrating `claim + tests`.
5. Create 2–3 small PoCs:
   - `kiss fmt` proof-of-concept (format+canonicalization)
   - `kiss test` prototype writing test metadata
   - `kiss certify` prototype that updates `kiss.lock`
6. Open follow-up backlog tickets to expand SPEC sections, prioritize, and implement PoCs.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
# Notes & open questions

- Should `clues` be structured (subtypes) or free-text initially?
- Decide canonical hashing algorithm and exact canonicalization steps for signing.
- Signing UX & key management: interactive human signing vs headless automation (policy to be decided).
- How to handle tests requiring external resources (sandboxing policy for certification).
- Granularity in `kiss.lock`: function-level vs component-level entries.
<!-- SECTION:NOTES:END -->
