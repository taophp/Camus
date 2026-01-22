---
title: "002 — Draft 60-design.md (Decisions & Design)"
status: "To Do"
labels: ["design","doc","spec"]
assignee: ""
milestone: "Language specifications"
---

# Objective
Create the Jekyll page `60-design.md` that records the structural and procedural decisions forming the foundation of the Camus project (terminology, signing policy, `kiss` workflow, rules for tests/seeds, dependency policy, "ticket before code" rule, etc.). This page will serve as the canonical reference for future decisions and must be accessible from the project website.

> Important note: Any change to these decisions must be preceded by a Backlog ticket and an explicit decision (comment/approval) before being merged into `60-design.md`.

---
# Expected content (suggested structure)
The `60-design.md` page should include at least the following sections:

1. Summary / Vision
   - Brief description of the founding principle (human ↔ AI interface, claims + human audit).
2. Terminology (glossary)
   - `claim`: definition and purpose.
   - `tests`: definition (executable) and usage.
   - `clues`: definition (optional / non-executable), if we decide to keep it.
3. Proof & testing policy
   - Requirement that a `claim` declares minimal `tests`.
   - Rule: `kiss certify` runs `kiss test` when needed.
   - Policy for preserving seeds / inputs / results for non‑deterministic tests.
4. Formatting & canonicalization
   - Requirement to run the canonical formatter (`kiss fmt`) before signing.
   - Concept: a human signs the normalized source (initial policy).
5. Signing policy
   - Initial policy: sign the normalized source (ed25519 or equivalent).
   - Note possible future extension (additional signatures: IR, build artifacts).
6. `kiss` : minimal workflow & modes
   - Essential commands (init, fmt, test, build --dev, build --release, certify, explain, diff).
   - `build --dev` produces a local unsigned executable that is not publishable.
7. Dependency policy & trust levels
   - Describe `basic` / `certified` / `audit` modes (or similar) that control which dependencies are accepted.
8. Decision governance
   - "ticket before code" rule (any action or policy change is preceded by a Backlog ticket).
   - Location and format of the document (`Camus/60-design.md` for Jekyll).
9. Links & references
   - Point to `Camus/conversation.md` (relevant sections) and associated Backlog tickets.
10. History / Addendum
    - Chronological list of decisions and their originating tickets.

---
# Acceptance criteria (DoD)
- [ ] `Camus/60-design.md` file created (Jekyll page) with appropriate frontmatter (`layout: page`, title, etc.).
- [ ] The page contains all sections listed above, at least as a full draft ready for review.
- [ ] The terminology `claim` is clearly defined; the decision `tests` vs `clues` is mentioned and linked to ticket `001` (if still open, note the status).
- [ ] `kiss` behavior (at least `fmt`, `test`, `build --dev`, `certify`) is described with simple usage examples.
- [ ] Signing policy (source-only for the initial phase) is documented.
- [ ] Instructions stating that any modification to `60-design.md` must be made via a Backlog ticket are written.
- [ ] The Backlog ticket that requested the draft (`002`) is linked from the page (History section) and vice-versa (the page references this ticket).

---
# Tasks (recommended subtasks)
1. Draft the first version of `Camus/60-design.md` locally following the structure above.
2. Add excerpts of decisions already made (`claim`, source-only signing, `kiss build --dev`, "ticket before code" rule).
3. Include concrete examples (mini-examples `Hello` and `sortList`) illustrating `claim` + `tests` syntax.
4. Suggest Jekyll frontmatter (minimal): `layout: page`, `title: "Decisions — 60 — Design"`, `permalink: /design/60-design/`.
5. Open a PR and reference this ticket (`002`) in the PR description.
6. Collect reviews / approvals and merge.

---
# Notes / Open questions
- Decision `tests` vs `clues`: if not decided at the time of writing, the page should indicate the status and link to ticket `001`.
- We sign the normalized source for now; add a "Signing Roadmap" section explaining how we might later sign IR / builds.
- Example test format: decide on a minimal JSON/YAML schema for `tests` (e.g., `type`, `input`, `expected`, `seed?`).
- Jekyll location: if you prefer `Camus/_pages/60-design.md` instead of `Camus/60-design.md`, indicate it in the PR — the goal is to have the page visible on the site.
- All project documentation must be written in English.

---
# Estimate & Priority
- Estimate: S (draftable in half a day, plus review iterations).
- Priority: High — this document structures the whole project.

---
# References
- Parent ticket: `000 — Initialize the backlog and define milestones`
- Vocabulary ticket: `001 — Formalize vocabulary: claim, tests vs clues`
- Discussions: `Camus/conversation.md` (sections Tests, Certification, Kiss)
- Project README (vision summary)

---
*Once this ticket is completed, we move to the more technical tickets (SPEC.md, `kiss` prototype, formatter, etc.).*