---
title: 60 Design: Decisions & Governance
layout: page_with_toc
---

# 60 — Design: Decisions & Governance

This page is the canonical, human-readable record of high-level decisions and governance for the Camus project.
It explains the project's governance norms (notably the "ticket before code" rule), how to propose and accept
design changes, and where to record decision artifacts.

Use this file as the single source of truth for project‑level decisions. When in doubt about a policy or workflow,
consult this page and the associated Backlog.md tasks that reference the decision.

---

## Short summary

- Ticket before code: Any non‑trivial change to design, spec, signing policy, governance, or the `kiss` toolchain
  must be proposed, discussed, and tracked as a Backlog.md ticket before implementation begins.
- Decision record: Significant decisions must have a visible record (ticket + decision note) that includes rationale,
  consequences and references to tests, artifacts, and PRs.
- Changes are accepted via ticket approval and standard PR process (reference the ticket in the PR).

---

## Ticket before code (mandatory)

This is the project's core governance rule:

- Before you implement a change that affects design, specification, release/signing policy, or governance, create a
  Backlog.md ticket describing the proposal, the problem it solves, and clear acceptance criteria.
- The ticket should include at minimum:
  - A short summary of the proposal.
  - Motivation and rationale.
  - Concrete acceptance criteria (testable / verifiable).
  - Impacted areas (files, commands, tests, stakeholders).
  - A suggested implementation plan or follow-ups if applicable.
- Implementation work (code changes, CI additions, release tasks) should begin only after:
  - The ticket has had the necessary discussion, and
  - The ticket is marked `In Progress` and assigned, or explicit approval/consensus has been recorded.

Rationale: this prevents accidental drift, ensures traceable decisions, and keeps governance changes auditable.

---

## How to propose a change (recommended workflow)

1. Create a ticket describing the change:
   - Use the Backlog CLI:
     ```
     backlog task create "Short title" -d "Description / rationale" --ac "Acceptance criterion 1" --ac "AC 2" -l design,doc -m "Language specifications"
     ```
   - Select an appropriate milestone and labels to make triage easier.
2. Discuss: Use the ticket comments to exchange ideas, attach prototypes, and iterate until consensus is reached.
3. Implementation: When you start work, update the ticket:
   ```
   backlog task edit <id> -s "In Progress" -a @yourself --plan "1. Do X\n2. Add tests\n3. Draft PR"
   ```
4. Create a PR referencing the ticket ID in the description.
5. Implementation notes: As you work, append notes to the ticket with `--append-notes` summarizing changes, test results, and CI statuses.
6. Approval & merge: After review and green CI, merge the PR. Ensure the ticket has implementation notes and the acceptance criteria checked.
7. Close: Mark the ticket `Done` once all ACs are satisfied and follow-up items are captured as new tickets.

---

## Definition of Done for design/governance changes

A design or governance change is considered Done when all of the following are true:

- A ticket exists and has clear acceptance criteria.
- The change has been implemented in a PR that references the ticket.
- Reviews are completed and required approvals are recorded.
- Relevant tests and CI checks pass.
- The canonical documentation (this file, or a dedicated `backlog/decisions/` file) is updated with the decision and rationale.
- The originating ticket includes implementation notes and its ACs are checked. The ticket is moved to `Done`.

---

## Decision records & where to put them

- Small decisions: can be recorded as a short entry in this file (with a one‑line summary and links).
- Larger decisions: create a dedicated file under `backlog/decisions/` and link it from here. Use this schema:
  - Filename: `YYYY-MM-DD - short-slug.md` or `decision-<id> - short-slug.md`.
  - Required fields in the file:
    - Title
    - Date (ISO8601)
    - Status (Proposed / Accepted / Rejected / Deprecated)
    - Summary (1–2 lines)
    - Rationale
    - Consequences / Migration notes
    - Links: ticket(s), PR(s), tests, artifacts
- Template (suggested):
  ```md
  ---
  title: "Decision title"
  date: 2026-01-23
  status: Accepted
  ---
  ## Summary
  ...
  ## Rationale
  ...
  ## Consequences
  ...
  ## Links
  - Ticket: task-42
  - PR: https://github.com/...
  ```

---

## Core decisions (current snapshot)

These items summarize decisions already made — treat this as an index and link to the detailed record when available.

- Terminology
  - `claim`: used to describe a function's assertion/contract (see `task-2` and the SPEC sketch).
- Signing policy
  - Initial policy: only normalized (formatter-canonicalized) source is signed; the IR is not signed initially.
- Formatting & canonicalization
  - Run `kiss fmt` before certification/signing. Use deterministic canonicalization for hashed artifacts (e.g. canonical JSON rules).
  - Hash algorithm: SHA‑256 (`sha256:<hex>`).
- `kiss` workflow (high-level)
  - `kiss init` — initialize project/dev environment
  - `kiss fmt` — canonicalize source
  - `kiss test` — run tests and record test-run artifacts (including seeds)
  - `kiss build --dev` — local dev build (unsigned, non-publishable)
  - `kiss build --release` — release artifact (to be paired with certification)
  - `kiss certify` — run tests, record evidence (seeds/hashes) and prepare signature data
- Tests & reproducibility
  - Test runs must include canonical test descriptors, seed where applicable, runner metadata, and stable artifact references.
  - `kiss.lock` should reference canonical test hashes (lock tests to known descriptors).
- Milestones & roadmap
  - Language specifications
  - Syntax exploration
  - Tools (kiss)
  - Compilation & self-hosting
  - Website & documentation

---

## Onboarding checklist

For new contributors or reviewers:
- Read `Camus/backlog/README.md` and this `60-design.md`.
- Run:
  ```
  backlog task list
  backlog browser
  backlog task <id> --plain
  ```
- If you plan to change a design decision, create a ticket first and follow the "How to propose a change" workflow above.

---

## How to update this page

Changes to this file follow the normal workflow (ticket before code):
1. Create a ticket describing the update (link `task-3` if you are drafting improvements to this page).
2. Draft the change in a branch and open a PR that references the ticket.
3. After review & approval, merge the PR. Add a short history entry below (date + summary).
4. Update the originating ticket: add implementation notes, check acceptance criteria, mark Done.

Small editorial updates (typos, phrasing) may be edited directly via PRs without a ticket only if the change is clearly non-substantive. Prefer to create a ticket if you're unsure.

---

## Contact & roles

- Owners / maintainers: people listed as repository maintainers (use the GitHub repository permissions).
- Product / PO decisions: major roadmap and priority questions should be resolved by the PO or an agreed decision body and recorded in the ticket.
- For day-to-day governance and small decisions, maintainers may decide by consensus, but every accepted change must be recorded.

---

## History / changelog

- 2026-01-23 — Initial draft created (see `task-3`).
- [Add future entries here with date and short summary when decisions are accepted or the page is modified.]

---

If you have suggestions for improving this page or the governance flow, please open a Backlog ticket (e.g. `task-3` / `Draft 60-design.md`) and propose the changes there.