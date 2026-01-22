---
title: "Initialize the backlog and define milestones"
status: "To Do"
labels: ["infrastructure","backlog","setup"]
assignee: ""
milestone: "Initialisation"
---

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
- [ ] Each task listed in "Immediate tasks" exists as a separate file under `Camus/backlog/tasks/` (initial status `To Do`) and follows the Backlog.md filename pattern `task-<id> - <title>.md`.
- [ ] A Jekyll file `60-design.md` is planned (ticket created) and its location is agreed (`Camus/60-design.md` or `Camus/_pages/60-design.md`) so it appears on the site.
- [ ] The "no implementation without a ticket" rule is recorded in `60-design.md` or `CONTRIBUTING.md`.
- [ ] A person (or a bot) confirms they have read the Backlog.md documentation (or consulted the overview) and leaves a confirmation comment on this ticket.

Immediate tasks (to be created as separate tickets)
--------------------------------------------------
- [ ] `task-2 - Formalize vocabulary: \`claim\`, \`tests\` vs \`clues\``  
  - Objective: formalize the terminology (`claim`, `tests` vs `clues`) and produce a short glossary entry in `60-design.md`.
  - Acceptance: decision documented and accepted by the PO; entry added to `60-design.md`.

- [ ] `task-3 - Draft 60-design.md (Decisions & Design)`  
  - Objective: draft the `60-design.md` page (initial structural and procedural decisions).  
  - Minimum content: terminology (`claim`), signing policy (source only), tests/seeds policy, `kiss` behaviour (dev build unsigned), rule "ticket before code".

- [ ] `task-4 - Backlog: Update milestones in config`  
  - Objective: update `Camus/backlog/config.yml` with the milestones above and verify their visibility in the Backlog.md UI.

- [ ] `task-5 - KISS workflow specification`  
  - Objective: define the high-level `kiss` workflow (commands and minimal behavior):
    - `kiss init`
    - `kiss fmt`
    - `kiss test`
    - `kiss build --dev` (local artifact, unsigned, non-publishable)
    - `kiss build --release` (to be connected with `kiss certify` later)
    - `kiss certify`: runs tests, records seeds/hashes, prepares human signature
  - Acceptance: summary document + usage examples.

- [ ] `task-6 - SPEC.md skeleton`  
  - Objective: create the skeleton for `SPEC.md` (template for formal specification): sections, conventions, `claim` format, `tests` format (examples + property + seed), and expected formatter/canonical format.

- [ ] `task-7 - Examples: Hello & Inventory`  
  - Objective: add initial examples (Hello, Inventory) as example components and create tickets for their implementation/validation.

- [ ] `task-8 - CI and policy`  
  - Objective: define minimal CI controls (run `kiss test`, verify seeds, reject release if no certification ticket) and document the rule "PR must reference a Backlog ticket".

- [ ] `task-9 - KISS signature policy`  
  - Objective: define minimal signing policy and where signatures apply (normalized source first).

- [ ] `task-10 - KISS test harness specification`  
  - Objective: define expected behavior and format for the test harness used by `kiss test`.

- [ ] `task-11 - KISS CLI skeleton (Rust)`  
  - Objective: provide the initial CLI skeleton for `kiss` (Rust prototype) with basic commands.

- [ ] `task-12 - KISS formatter specification`  
  - Objective: specify formatter invariants and canonical source format used for signing.

- [ ] `task-13 - Registry specification`  
  - Objective: draft the registry layout and API for published/registered artifacts.

- [ ] `task-14 - Tree-sitter grammar`  
  - Objective: design or stub a tree-sitter grammar for Camus for editor support and syntax tooling.

Deliverables & DoD
------------------
- The tickets mentioned above appear in `Camus/backlog/tasks/` as `task-<n> - <title>.md` (status `To Do`) with a short description and acceptance criteria.
- `60-design.md` is created (draft is acceptable), contains the decisions listed above, and is linked from the README or the backlog page.
- A confirmation comment (indicating that someone has read the Backlog.md overview) is added to this ticket.
- No implementation work related to the listed features is performed until the corresponding tickets are moved to `In Progress`/`Done`.

Notes & risks
------------
- Risk: persistent terminological ambiguities — the `task-2` ticket must be prioritized as it impacts all documentation.
- Risk: signing non-normalized code will yield unstable signatures — reiterate the requirement to run the canonical formatter (`kiss fmt`) before signing.

Follow-up
---------
- Create the `task-2` .. `task-14` files using the Backlog.md filename pattern and close this ticket when the child tasks exist and the milestones were added to `Camus/backlog/config.yml`.
- Once tasks are created and validated, they can be assigned and prioritized under the first milestone: `Language specifications`.

---

*This ticket is the formal trace of backlog initialization. Create the tickets listed above, then close this one.*