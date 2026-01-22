---
title: "009 — Test harness: metadata specification & storage"
status: "To Do"
labels: ["spec","tests","tooling"]
assignee: ""
milestone: "Tools (kiss)"
---

# Objective

Define the test-harness metadata format and the storage conventions for test runs and test-results so that:

- `kiss test` (and CI) produce reproducible, auditable, and machine-readable test artifacts,
- test artifacts can be uniquely identified and replayed (reproducibility),
- `kiss.lock` can reference concrete test runs and seeds for certification,
- the policy for handling non-deterministic tests (seeds), flaky tests and test privacy is clear.

This ticket produces:
- a minimal, reviewable test-result schema (JSON/YAML),
- storage layout and naming rules,
- canonicalization and hashing rules for test descriptors and results,
- acceptance criteria and follow-up implementation tasks.

> Note: all project documentation must be in English.

---

# In-scope

- Formalize the fields to be produced by any compliant `kiss test` run.
- Define the canonical serialization used to compute test descriptors hashes.
- Propose the default storage location and naming convention for test run artifacts.
- Specify the required test metadata to be recorded into `kiss.lock`.
- Define minimal replay API/CLI behavior (how to re-run a recorded test run).
- Define handling of seeds and property-based tests.
- Define how flakiness is recorded and surfaced.

# Out-of-scope (for this ticket)

- Full implementation of test runners across target backends.
- Storage archival policies across specific registries or long-term storage systems (these are follow-ups).
- Detailed CI implementation (only high-level CI requirements are included; actual CI jobs will be separate tickets).

---

# Design principles

- Reproducibility: every recorded test run must contain everything necessary to re-run it deterministically (seed, runtime metadata, run command).
- Canonical hashing: test descriptors must be canonicalized and hashed in a deterministic way for stable identifiers.
- Human + machine readable: artifacts must be readable in plain JSON/YAML and also suitable for automated verification.
- Minimal storage of secrets: test artifacts must not include raw secrets; sensitive data must be redacted.
- Traceability: each test result references the function/component `source_hash` and the `claim` it verifies.
- Flakiness detection: test metadata must mark runs as flaky if non-deterministic behavior is observed.

---

# Storage layout & file conventions

Default local layout (recommended):

- Test runs produced by `kiss test` are stored under:
  - `.kiss/test-results/<component>/<function>/<test_id>/<timestamp>-<run-id>.json`
  - Supporting logs and artifacts (if any) go into the same folder (e.g., `.kiss/test-results/.../stdout.log`, `details.jsonl`, etc.)

- `kiss.lock` maintains a reference to the most recent successful test run for a function:
  - fields: `tests_hash`, `test_seed`, `test_result`, `test_run_id`, `test_artifact_path`

Example (human-friendly):
```/dev/null/example.kiss.lock.fragment#L1-12
functions:
  - name: sortList
    source_hash: "sha256:..."
    tests_hash: "sha256:..."
    test_seed: 123456789
    test_result: "passed"
    test_run_id: "2026-01-21T12:34:56Z-run-57"
    test_artifact_path: ".kiss/test-results/Inventory/sortList/2026-01-21T12-34-56Z-run-57.json"
    signer_id: null
    signature: null
```

---

# Test run schema (sketch)

A single, machine-oriented test-run artifact (JSON) should contain at least:

- `meta`:
  - `test_run_id` (canonical: timestamp + random suffix or UUID)
  - `component` / `module`
  - `function`
  - `claim_id` (if available)
  - `kiss_version`
  - `runner` (tool name & version)
  - `platform` (OS, architecture, runtime versions)
  - `started_at`, `finished_at`, `duration_ms`
- `test_descriptor` (the canonical data describing the test):
  - `test_id` (unique within function, e.g., `example:case-1` or `property:add-increases-count`)
  - `type` (`example` / `property` / `regression` / `integration`)
  - `description` (free text)
  - `input` (structured, redacted of secrets)
  - `expected` (structured) – for property tests this can be a predicate identifier
  - `seed` (optional) – required for property tests
- `result`:
  - `status`: `passed` | `failed` | `skipped` | `flaky`
  - `assertions` (list of assertion results)
  - `stdout` / `stderr` references or snapshots (prefer file references rather than large inline blobs)
  - `logs`: path to logs (relative path inside the test-results dir)
- `hashes`:
  - `descriptor_hash` – computed from `test_descriptor` using the canonical serialization (see canonicalization rules)
  - `result_hash` – computed from the stable representation of `result`
- `notes`:
  - `flaky`: optional object describing flakiness detection metadata (e.g., number of consecutive runs, timeouts)
  - `artifact_refs`: list of additional artifacts (e.g., coverage, snapshots)
  - `safety_redaction`: list of fields redacted for privacy/security

Example test-run artifact:
```/dev/null/example.test-run.json#L1-40
{
  "meta": { "test_run_id": "2026-01-21T12:34:56Z-run-57", "component": "Inventory", "function": "addItem", "kiss_version": "0.1.0", "platform": "linux-x86_64", "started_at": "...", "finished_at": "..." },
  "test_descriptor": {
    "test_id": "example:add-apple",
    "type": "example",
    "description": "adding apple to empty inventory increases count to 1",
    "input": { "inventory": [], "item": "apple" },
    "expected": { "inventory": ["apple"], "count": 1 }
  },
  "result": {
    "status": "passed",
    "assertions": [{ "name": "count", "outcome": "passed" }],
    "logs": "stdout.log"
  },
  "hashes": {
    "descriptor_hash": "sha256:...",
    "result_hash": "sha256:..."
  }
}
```

---

# Canonicalization & hashing rules

- Use a deterministic canonical JSON serialization (JCS or equivalent canonicalization) for any object that will be hashed.
- Hashing algorithm: SHA-256, presented as `sha256:<hex>` for stable identifiers.
- `descriptor_hash` is computed from the canonicalized `test_descriptor`.
- `result_hash` is computed from a canonicalized `result` object (excluding ephemeral fields like timestamps).
- `kiss.lock` entries should reference `tests_hash` as the `descriptor_hash` of the authoritative tests for a function (so that test identity is stable across attempts).

Rationale: canonicalization prevents accidental hash changes due to formatting or field ordering.

---

# Reproducibility & replay

- A test run must include everything necessary to re-run deterministically:
  - test `descriptor`, seed, runner command, required environment variables (only non-secret ones), and dependency versions.
- `kiss` should expose a replay command (PoC level) like:
  - `kiss test --replay <test_run_id>`
  - This command re-creates the recorded environment as closely as possible and re-executes the test; it should emit the new test-run artifact and mark whether the result matches the recorded result.
- Reproducibility logs should include environment differences; if a run does not match the recorded result, the replay artifact is marked `replay_mismatch` with details.

---

# Flaky tests & seeds

- Property-based tests must include an explicit `seed` in the test descriptor or in the test run record.
- `kiss` should detect flakiness heuristically:
  - Re-run failed tests a configurable number of times (CI policy decides the default).
  - If a test sometimes passes and sometimes fails with the same seed/config, mark it as `flaky` and create an issue placeholder.
- A `flaky` field in the test-run `notes` should capture the number of flakiness incidents and the last seed that caused failure.

---

# CI considerations

- CI jobs must:
  - run `kiss fmt --check` and `kiss test`,
  - save the produced `.kiss/test-results/...` artifacts and upload them alongside the job as retention artifacts,
  - for release builds: verify that recorded successful test runs are present and referenced in `kiss.lock`.
- CI should provide a way to re-run a recorded test run (`kiss test --replay`) from the artifact store when investigating failures.

---

# Privacy & security

- Do not include secret credentials, private keys, or raw sensitive data inside `input` or `result` fields.
- If tests require secrets, the test-run artifact should either:
  - record a **redacted** replacement and the test's behavior signature, or
  - provide a pointer to a secure test provisioning mechanism (not in source or public artifacts).
- A `safety_redaction` list must be part of the test-run metadata when any redaction was applied.

---

# Acceptance criteria (DoD)

- [ ] A `spec/test-result.schema.yaml` (or JSON Schema) is drafted and committed (covers `meta`, `test_descriptor`, `result`, `hashes`, `notes`).
- [ ] `kiss.lock` schema is updated to reference `test_run_id`, `tests_hash`, `test_seed`, and `test_artifact_path` (example added to `spec/kiss.lock.schema.yaml`).
- [ ] A canonicalization rule is documented (use JCS-style canonical JSON) and a short HOWTO is added to the spec.
- [ ] Examples of test-run artifacts (Hello, Inventory) are added under `Camus/examples/.kiss-test-examples/` (as JSON examples).
- [ ] A follow-up implementation ticket exists to make a PoC for `kiss test` that:
  - writes a test-run JSON artifact as specified,
  - updates `kiss.lock` accordingly,
  - supports `kiss test --replay <test_run_id>`.
- [ ] CI integration guidance is documented (how CI must collect/upload artifacts and how release validation uses `kiss.lock`).
- [ ] Privacy guidance is documented for test authors (what must be redacted).

---

# Proposed subtasks

1. Create `spec/test-result.schema.yaml` and add it to repo (this ticket).
2. Add example JSON artifacts to `Camus/examples/.kiss-test-examples/` (Hello, Inventory).
3. Create PoC ticket: implement `kiss test` prototype that writes artifacts and updates `kiss.lock`.
4. Create PoC ticket: `kiss test --replay` (replay tool).
5. Add CI example that uploads `.kiss/test-results` artifacts and verifies a recorded run in a release pipeline.
6. Add a short `TESTING_GUIDELINES.md` describing privacy redaction rules and flakiness handling.

---

# Open questions

- Should test-run artifacts be signed in the future (e.g., to attest test outputs)? (nice-to-have)
- Do we want a centralized artifact registry or leave artifacts in CI job storage and the repository `.kiss` folder? (policy question)
- How to represent complex external effects for tests that assert side-effects rather than pure return values?

---

# Estimate & Priority

- Estimate: M (spec + examples + PoC tickets).
- Priority: High (test artifacts are a core part of certification and auditability).

---

# References

- Related tickets: `000`, `001`, `002`, `004`, `005`, `006`, `007`
- Conversation context: `Camus/conversation.md` (sections "Tests", "Certification")
- Project README: `Camus/README.md`

*End of ticket.*