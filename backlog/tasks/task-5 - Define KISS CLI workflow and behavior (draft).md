---
title: "Define KISS CLI workflow and behavior (draft)"
status: "To Do"
labels: ["spec","kiss","tooling"]
assignee: ""
milestone: "Tools (kiss)"
parent: "task-1"
---

# Objective

Draft a clear, actionable specification for the `kiss` CLI covering:
- the command surface and precise semantics for each command,
- the expected artifacts and metadata (notably `kiss.lock` and test outputs),
- the dev vs release workflows and how certification/signing is performed,
- CI / policy integration points (gates, checks, and expected automation),
- a concise set of acceptance criteria and follow-up implementation tasks.

The goal is to produce a specification detailed enough for PoC implementations and CI integration.

---

# Scope & Constraints

- This ticket is a spec & coordination task (no implementation required here).
- Focus on initial, conservative choices that favour reproducibility and human reviewability (e.g., human-initiated signing by default).
- Make interoperability and machine-readable outputs a priority (JSON/YAML outputs for CI).
- Keep UX for day-to-day developers fast (dev build/test loops must be quick).

---

# High-level commands & semantics

Below are proposed commands and their minimal semantics. Each command should have examples, expected return codes, and machine-readable flags output where applicable.

- `kiss init`
  - Initialize a Camus project skeleton: create `kiss.toon` (manifest), `examples/` stubs, and a `kiss.lock` placeholder.
  - Optionally scaffold a `tests/` area and CI snippets.

- `kiss fmt [--check|--write]`
  - Enforce a canonical formatting style.
  - `--check` returns non-zero on formatting diff (CI friendly).
  - `--write` normalizes files in-place.

- `kiss test [--output json|yaml] [--filter <pattern>]`
  - Execute `tests` declared with `claim` objects.
  - Support example-based tests and property/seed-based tests.
  - Persist per-test metadata (seed, inputs, test hash, stdout/stderr logs) under `.kiss/test-results/` and emit a structured summary (JSON/YAML) for CI.
  - Non-zero exit code on any failing test.

- `kiss build --dev`
  - Produce a local developer artifact marked with metadata `dev: true` and `signed: false`.
  - Artifacts produced with `--dev` are explicitly non-publishable.

- `kiss build --release`
  - Produce a release artifact candidate requiring certification prior to publish.

- `kiss certify [--sign?]`
  - Certification flow:
    1. Ensure `kiss fmt --check` passes (fail-fast if formatting differs).
    2. Run `kiss test` (or validate recorded, up-to-date test metadata).
    3. Collect proof metadata (seeds, per-test hash, logs) into `kiss.lock`.
    4. Produce a certification package for human review (include diffs, test artifacts).
    5. Optionally `kiss sign` (default: *manual human sign*; `--sign` is allowed only with explicitly-approved automation).
  - Certification must fail if tests fail or formatting normalization is required.

- `kiss sign <artifact|lock-entry> --key <key-id>`
  - Sign the canonicalized source representation. Record signer identity and signature in `kiss.lock`.
  - Default UX favors an interactive prompt; headless signing may be implemented with an explicit flag + documented trust model.

- `kiss explain <target>`
  - Human-friendly summary: claim, `tests`, recent test runs, signatures, and dependency trust status.

- `kiss diff <revA> <revB> [--scope=function:<name>] [--json]`
  - Show source-level diffs and compute invalidation impact (which claims require re-certification).
  - Emit machine-readable JSON for automation.

- `kiss publish <artifact>`
  - Publish a certified release artifact to the registry; pre-publish checks: not dev, signatures present, dependencies satisfy policy.

- `kiss verify <artifact-or-lock>`
  - Verify signatures, test hashes and seeds against recorded metadata for reproducibility.

- `kiss lock [list|show <id>]`
  - Inspect `kiss.lock` entries, signatures, and test artifacts.

---

# Example usage

```/dev/null/example.kiss#L1-6
# Typical dev iteration
kiss fmt --check
kiss test --output json > kiss-test-summary.json
kiss build --dev
# For a release:
kiss fmt --write
kiss certify
kiss sign kiss.lock#entry-42
kiss build --release
kiss publish artifact-42
```

---

# Expected `kiss.lock` metadata (sketch)

Provide a compact, machine-readable schema to persist the provenance data used to verify artifacts and signatures:

```/dev/null/kiss.lock.example#L1-20
functions:
  - name: sortList
    canonical_source_hash: "sha256:..."
    tests:
      - name: example-1
        type: example
        input: [3,1,2]
        expected: [1,2,3]
        seed: null
        run:
          timestamp: "2026-01-21T12:34:56Z"
          result: "passed"
          run_hash: "sha256:..."
          logs: ".kiss/test-results/sortList/example-1/2026-01-21.log"
    last_certification:
      signer: "ed25519:alice@example.com"
      signature: "base64..."
      cert_time: "2026-01-21T12:40:00Z"
    artifact:
      published: false
      dev: false
```

- `canonical_source_hash` is computed on normalized (formatter-fixed) source.
- Test runs are recorded with reproducibility info (seed, run_hash, logs).
- Signatures and signer identity are recorded per certification event.

---

# Acceptance criteria (DoD)

- [ ] A documented command reference exists (this ticket), describing flags, behavior, and exit codes.
- [ ] `kiss build --dev` semantics are unambiguously defined and documented.
- [ ] `kiss test` behavior is specified: it must persist seeds, test hashes, logs and provide a machine-readable summary useful for CI.
- [ ] `kiss certify` flow is fully described, including when it triggers tests and how it records metadata in `kiss.lock`.
- [ ] A first-pass `kiss.lock` schema (YAML/JSON) is included and reviewed in the repo.
- [ ] At least two CLI PoCs are planned (formatter, basic test runner) with concrete subtasks and acceptance tests.
- [ ] CI gating rules are defined (e.g., `kiss test` required, `kiss certify` required before publish).
- [ ] Open questions (signing UX, key management, sandboxing external tests) are enumerated and assigned to follow-up tickets.

---

# Proposed subtasks

1. Finalize the `kiss.lock` schema and add a formal JSON Schema + example file.
2. Implement PoC `kiss fmt --check` + `kiss fmt --write` and tests for canonicalization.
3. Implement PoC `kiss test` runner that writes structured outputs to `.kiss/test-results/` and a summary.
4. Implement `kiss build --dev` PoC that produces a dev artifact and records metadata.
5. Implement `kiss certify` PoC (no automatic signing) that updates `kiss.lock`.
6. Add CI jobs: `kiss fmt --check`, `kiss test --output json` and fail PRs on test or format failure.
7. Document signing & key management policy and implement `kiss sign` placeholder with safe defaults.
8. Add end-to-end tests that validate reproducibility from `kiss.lock` metadata.

---

# Open questions & notes

- Signing policy: prefer explicit human signatures by default — what automation patterns are acceptable later?
- Key management: local keys vs OS keyring vs external signing agents (sigstore-like) — tradeoffs and initial choice?
- Non-deterministic tests & external services: define sandboxing / mocking policy for certification runs.
- Should `kiss test` support timeouts and parallelism by default?
- How to represent multi-component repos in `kiss.lock` (component vs function granularity)?

---

# Estimate & priority

- Estimate: M (spec + prototypes + schema + CI).
- Priority: High — the `kiss` CLI and its certification semantics are central to project workflow and trust.

---

# References

- Parent ticket: `task-1 - Initialize the backlog and define milestones`
- Design / vocab tickets: `task-2`, `task-3`
- Milestones ticket: `task-4 - Backlog: Update milestones in config`
- Follow-ups: SPEC skeleton, formatter, test harness, registry spec.

---

*End of ticket — please review the proposed commands and acceptance criteria. After agreement, split the proposed subtasks into concrete implementation tickets and start the PoC work in small, reviewable increments.*