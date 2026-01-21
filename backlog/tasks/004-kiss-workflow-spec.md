---
title: "004 — Define `kiss` CLI workflow and behavior (draft)"
status: "To Do"
labels: ["spec","kiss","tooling"]
assignee: ""
milestone: "Tools (kiss)"
---

# Objective

Draft a high-level specification for the `kiss` command-line tool. The document should describe each command's intended behavior, the expected developer workflow (dev vs release), and the minimal artifacts/metadata that `kiss` will produce or consume (example: `kiss.lock`). This ticket produces a reference spec that the implementation and follow-up tickets must reference.

> Important constraints (decisions already made)
> - The project terminology uses `claim` to denote a function/module assertion.
> - Initial signing policy: only the normalized source is signed (source-only signing).
> - `kiss` must support a dev build mode that produces unsigned, non-publishable artifacts for iterative development.
> - All project documentation and artifacts are written in English.

---

# High-level commands & semantics

Below is the proposed command surface and behavior for the initial `kiss` tool. These are draft semantics to be refined and validated by follow-up tickets.

- `kiss init`
  - Initialize a Camus project layout.
  - Create `kiss.toon` (project manifest) and a stub `kiss.lock` (metadata).
  - Add README and example claim skeletons under `examples/`.

- `kiss fmt` (formatter)
  - Enforce a single canonical formatting style for Camus source.
  - Apply or check formatting (subcommands: `kiss fmt --check`, `kiss fmt --write`).
  - `kiss fmt` must be run before certification/signing; signature assumes canonical formatting.

- `kiss test`
  - Execute the tests declared alongside `claim` objects.
  - Tests may be:
    - Examples (input → expected output)
    - Property-based (with seeds)
  - `kiss test` records per-test metadata: seed, run inputs, test hash, result (pass/fail), logs.
  - Test runs produce persistent artifacts stored under `.kiss/test-results/` and update `kiss.lock` entries for the tested functions.

- `kiss build --dev`
  - Produce a local, runnable developer artifact (e.g., a bundle or target directory).
  - Artifact metadata must mark it as `dev: true` / `unsigned`.
  - Artifacts produced by `--dev` builds are explicitly forbidden from being published to the registry (`kiss publish` must reject them).
  - Purpose: fast iteration and global behavior checks without certification overhead.

- `kiss build --release`
  - Produce a release artifact candidate. The release artifact must be certified and signed via `kiss certify` before it can be published.

- `kiss certify`
  - Full certification flow:
    1. Ensure repository is formatted (`kiss fmt --check`). Fail if formatting changes are required.
    2. Run `kiss test` (if tests have not already run or if test metadata changed). Fail on test failures.
    3. Collect and persist proof metadata (seeds, test hashes, logs) into `kiss.lock`.
    4. Prepare a certification package for human review (include claim, tests, test outputs, diffs, dependency signatures, etc.).
    5. Wait for explicit human approval (e.g., interactive prompt or separate `kiss sign` step). Human signs the canonical source. The signer identity and signature are stored in `kiss.lock`.
  - Behavior note: by default `kiss certify` should not sign automatically; signing is a deliberate human action. `kiss certify --sign` can be a convenience if an automated signing workflow is agreed by the team (not default).

- `kiss explain <function-or-module>`
  - Produce a concise, human-readable explanation of the selected object:
    - claim (text)
    - associated tests and coverage
    - test results
    - dependencies and their trust status
    - signatures and certification history
  - `kiss explain` output is intended for the human reviewer/auditor.

- `kiss diff <revA> <revB> [--scope=function:<name>]`
  - Show source-level diff and compute the set of functions whose signatures would be invalidated by the change (i.e., cascade of dependent functions).
  - Produce machine-readable output (JSON/YAML) for tooling.

- `kiss publish`
  - Publish a release artifact to the registry.
  - Pre-publish checks:
    - artifact is not `dev`
    - artifact has certification/signatures per policy
    - dependencies satisfy the project's trust policy (basic / certified / audit)
  - Reject publish if checks fail.

- `kiss verify <artifact-or-lock>`
  - Verify signatures, test hashes, and recorded seeds for reproducibility.

- `kiss lock` (subcommands)
  - Inspect & manage the `kiss.lock` file (show function entries, signatures, test hashes, invalidations, etc).

---

# Expected `kiss.lock` metadata (sketch)

`kiss.lock` should record, for each publishable function/component, canonical metadata that was used for signing and for verification. Example sketch (not final schema):

```/dev/null/kiss.lock.example#L1-16
functions:
  - name: sortList
    source_hash: "sha256:..."
    tests_hash: "sha256:..."
    test_seed: 123456789
    test_result: "passed"
    signer_id: "ed25519:alice@example.com"
    signature: "base64..."
    published: false
```

Key points:
- Track `source_hash` (hash of canonicalized/formatted source).
- Track `tests_hash` and `test_seed` to enable reproducibility.
- Store signer identity and signature (source-only, initial policy).
- Record `published: true|false` to prevent accidental promotion of dev builds.

---

# Dev vs Release workflow (developer ergonomics)

- Fast iteration:
  1. `kiss fmt` (optional during iteration)
  2. `kiss test` (fast checks; developer can run often)
  3. `kiss build --dev` (run artifact locally)
- Certification & release:
  1. `kiss fmt --write` (normalize)
  2. `kiss certify` (runs tests, persists metadata)
  3. After human review and signature, `kiss build --release` -> `kiss publish`

Important: `kiss test` is callable standalone to speed iteration. `kiss certify` must call `kiss test` if tests are not already passed with recorded seeds.

---

# Acceptance criteria (DoD for this ticket)

- [ ] A CLI command list and behavior doc exists (this ticket).
- [ ] `kiss build --dev` semantics are clearly documented: produces local, unsigned, and non-publishable artifacts.
- [ ] `kiss certify` flow is described, including the requirement that it triggers `kiss test` if necessary.
- [ ] `kiss test` behavior defined: it must persist seeds, test hash, results and logs, and update `kiss.lock`.
- [ ] A minimal `kiss.lock` schema sketch is included (as above).
- [ ] Examples are given for a typical dev iteration and a certification + publish sequence.
- [ ] Open questions & decisions are listed to be turned into separate backlog tickets (e.g., signing UX, key management, registry policy).
- [ ] The ticket references related tickets: `000`, `001`, `002`, `003`.

---

# Proposed subtasks (next steps / tickets)

1. Write the full `kiss` command reference and examples (extend this draft).
2. Design the `kiss.lock` JSON/YAML schema and document the canonical serialization used for hash/signature.
3. Implement a small PoC `kiss fmt` and `kiss test` stub (prototype) to ensure metadata format works.
4. Define the signing UX / key management (interactive signing vs external key agent) — small spec ticket.
5. Implement `kiss build --dev` PoC to validate the dev artifact workflow and publish-blocking metadata.
6. Add CI checks document that integrates `kiss test` and `kiss certify` into CI pipelines.
7. Add a ticket to implement `kiss explain` and `kiss diff` as human-facing tools.

---

# Open questions & notes (to be resolved via further tickets)

- Signing UX: interactive approve & sign vs `kiss certify --sign` non-interactive flag (default should require human interaction).
- Key management: local key files, OS keyring, or integration with external signing services (sigstore-like) — pick an initial approach.
- Registry policy details: what constitutes an acceptable proof that a dependency is `certified` versus `basic`.
- How to handle tests that require external services (network, DB)? Decide sandboxing policy for certification runs.
- Decide storage/resolution for `clues` (non-executable evidence) vs `tests` (executable evidence) (see ticket `001`).

---

# Estimate & priority

- Estimate: M (spec + examples + small PoCs).
- Priority: High for CLI spec (this shapes the tool and developer workflow).

---

# References

- Parent ticket: `000 — Initialize the backlog and define milestones`
- Terminology ticket: `001 — Formalize vocabulary: claim, tests vs clues`
- `60-design.md` ticket: `002 — Draft 60-design.md (Decisions & Design)`

---
*End of ticket (draft). Please review and comment on the open questions; when accepted, split the subtasks into implementation tickets.*