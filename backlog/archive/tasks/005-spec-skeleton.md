---
title: "005 — SPEC skeleton: draft SPEC.md structure"
status: "To Do"
labels: ["spec","doc"]
assignee: ""
milestone: "Language specifications"
---

# Objective

Create a clear, reviewable skeleton for `SPEC.md` that will serve as the canonical specification for Camus. The skeleton will:

- list the sections and subsections required for a complete language specification,
- outline the expectations for each section (what needs to be specified, examples, and acceptance criteria),
- identify concrete follow-up tasks (examples, schemas, PoC implementations),
- make explicit the points that must be decided before implementation work starts.

> Note: All project documents must be written in English.

---

# Scope

The SPEC skeleton should cover, at a minimum:
- terminology and glossary,
- the "claim" model and how evidence is attached,
- types and core semantic primitives,
- function and module rules (signatures, mutability, calling conventions),
- effects and policy for side-effects,
- tests, property tests, seeds and recording,
- canonical source formatting and canonicalization for signing,
- IR design and representation (readable, typed, pseudo-SSA),
- tooling & workflows (kiss commands, lockfile format),
- signing & certification policy (initial: source-only),
- registry & publish policy (dev vs release),
- examples (Hello, sortList, Inventory),
- open questions and governance rules (ticket-before-code).

---

# Proposed SPEC.md structure (skeleton)

1. Introduction
   - Purpose of the SPEC
   - Project goals and reasoning
   - Scope and audience

2. Terminology & Glossary
   - `claim` — definition and role
   - `tests` — executable proofs (mandatory for certification)
   - `clues` — non-executable evidence / rationale (optional)
   - `certify`, `signer`, `kiss`, `kiss.lock`, etc.

3. Language model and units of composition
   - Project, Module, Component, Function
   - Rules (no anonymous functions, no nested blocks, explicit block delimiters)
   - Function structure (signature, `claim`, tests, body)

4. Types
   - Primitive types (Bool, Int, Float, String, Char, Unit)
   - Composite types (Array, Tuple, Struct, Enum)
   - References & mutability semantics (immutable by default, `mut` explicit on both signature and call)
   - Unit vs Void

5. Control flow & evaluation model
   - Expression vs instruction decisions (clarify for readability)
   - Determinism expectations & non-determinism handling

6. Effects, side-effects and purity
   - Project stance: effects are omnipresent; responsibility via certification & traceability
   - How to document/declare intended external effects (if any)

7. Claims, tests and clues
   - Formal shape of a `claim` block
   - `tests` schema: examples, property tests, seeds
   - `clues` schema: rationale, audit references, proofs (non-executable)
   - Required minimum proofs for certification

8. Canonical formatting & source canonicalization
   - Definition of canonical formatting (`kiss fmt`)
   - Rationale for formatting before signing
   - Example canonical formatting rules

9. Intermediate Representation (IR)
   - IR goals and invariants (flattened, typed, stable)
   - IR shape (pseudo-SSA, explicit control flow, explicit effects)
   - Textual representation for human auditing
   - Versioning strategy for IR

10. Testing & certification
    - `kiss test` semantics and outputs
    - Recording tests: seeds, inputs, test hashes, logs
    - Reproducibility policies (store seeds + golden outputs)
    - `kiss certify` flow (runs `kiss test` when needed, prepare for human review)

11. Signing & lockfile
    - Initial signing policy: sign canonical source (ed25519)
    - `kiss.lock` schema sketch (source_hash, tests_hash, test_seed, signer_id, signature, published flag)
    - Cascade invalidation rules for dependent functions

12. Tooling & workflows
    - `kiss` commands (init, fmt, test, build --dev, build --release, certify, explain, diff, publish, verify)
    - Dev vs release workflows (dev artifacts unsigned, non-publishable)
    - Example command flows (dev iteration vs release cycle)

13. Registry & publication policy
    - Trust levels for dependencies (basic, certified, audit)
    - Publishing checks & requirements
    - Policy for accepting external components

14. Examples
    - Minimal, runnable examples: `Hello`, `sortList`, `Inventory`
    - For each example: claim + tests + expected artifacts + typical `kiss` workflow

15. Security, privacy & safety considerations
    - Sandbox rules for certification runs
    - Handling tests that require external resources
    - Human accountability model and disclaimers

16. Governance & decision procedure
    - "Ticket before code" rule
    - How to record decisions (60-design.md), and how to update SPEC
    - Tracing decisions to tickets

17. Appendix
    - Data schema artifacts (e.g., `spec/claim.schema.yaml`, `spec/kiss.lock.schema.yaml`)
    - Example `kiss.lock` snippet
    - Change log and SPEC versioning notes

---

# Acceptance criteria (DoD for this ticket)

- [ ] `SPEC.md` skeleton document is created in the repository (draft with the sections above).
- [ ] Each major section includes a brief explanatory paragraph and a list of open sub-questions to be resolved.
- [ ] The SPEC skeleton references `60-design.md` and links to the vocabulary decision ticket (`001`).
- [ ] Spec contains a placeholder for `spec/claim.schema.yaml` and `spec/kiss.lock.schema.yaml`.
- [ ] Examples section contains at least one fully specified example stub (`Hello` or `sortList`) demonstrating `claim` + `tests`.
- [ ] The ticket lists follow-up tasks for filling each section with full content and for implementing minimal PoCs (formatter, test harness).

---

# Proposed subtasks

1. Create `Camus/SPEC.md` with the skeleton described above (this ticket).
2. Draft `spec/claim.schema.yaml` (minimal schema for `claim` / `tests` / `clues`).
3. Add example implementations under `examples/` (Hello, sortList, Inventory) with `claim` and `tests`.
4. Draft `spec/kiss.lock.schema.yaml` and an example `kiss.lock` snippet.
5. Create PoCs:
   - `kiss fmt` proof of concept for canonical formatting
   - `kiss test` prototype that runs an example test and writes test metadata
   - `kiss build --dev` prototype to validate dev artifact flow
6. Review iteration and sign-off by project lead/PO before moving to implementation tickets.

---

# Notes & questions to be resolved in follow-up tickets

- Decide whether `clues` should be structured with subtypes or remain free-text.
- Finalize IR textual format and canonical serialization rules for hashing.
- Define signing UX and key management strategy (local vs external signing agent).
- Decide on exact enforcement policy for certification in CI (e.g., deny merge if not certified).
- Confirm location and naming convention for SPEC and related schemas.

---

# Estimate & Priority

- Estimate: M (skeleton + initial PoC tasks).
- Priority: High (SPEC shapes the rest of the project).

---

# References

- `Camus/conversation.md` (design discussion)
- Tickets: `000`, `001`, `002`, `003`, `004` (backlog items already created)
- README (project vision)

---
*End of ticket.*