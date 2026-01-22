---
id: task-10
title: "Test harness: metadata specification & storage"
status: "To Do"
labels: ["backlog","config","process"]
assignee: ""
milestone: "Initialisation"
parent: "task-1"
---

functions:
  - name: sortList
    source_hash: "sha256:..."
    tests_hash: "sha256:..."
    test_seed: 123456789
    test_result: "passed"
    test_run_id: "2026-01-21T12:34:56Z-run-57"
    test_artifact_path: ".kiss/test-results/Inventory/sortList/example-add-1/2026-01-21T12-34-56Z-run-57.json"
    signer_id: null
    signature: null
```

---

# Test-run artifact schema (sketch)

A single test-run artifact (JSON/YAML) must include at least:

- `meta`:
  - `test_run_id` (canonical: timestamp + run id or UUID)
  - `component` / `module`
  - `function`
  - `claim_id` (optional)
  - `kiss_version`
  - `runner` (tool name & version)
  - `platform` (OS, architecture, runtime versions)
  - `started_at`, `finished_at`, `duration_ms`

- `test_descriptor` (canonical description of the test):
  - `test_id` (unique within function e.g., `example:add-apple` or `property:add-increases-count`)
  - `type` (`example` / `property` / `regression` / `integration`)
  - `description` (human text)
  - `input` (structured, redacted for secrets when necessary)
  - `expected` (structured; for property tests, a predicate id or expected property)
  - `seed` (optional; required for property tests)

- `result`:
  - `status`: `passed` | `failed` | `skipped` | `flaky`
  - `assertions` (list of assertion outcomes)
  - `stdout` / `stderr` references or short snapshots (prefer file references)
  - `logs`: relative paths to logs/artifacts

- `hashes`:
  - `descriptor_hash` – canonicalized `test_descriptor` hash (`sha256:<hex>`)
  - `result_hash` – canonicalized `result` hash (`sha256:<hex>`)

- `notes`:
  - `flaky` object (if detected): sample counts and latest failing seeds
  - `artifact_refs`: list of additional artifact paths (coverage, snapshots)
  - `safety_redaction`: list of fields redacted from `input` or `result`

Example JSON skeleton:

```json
{
  "meta": {
    "test_run_id": "2026-01-21T12:34:56Z-run-57",
    "component": "Inventory",
    "function": "addItem",
    "kiss_version": "0.1.0",
    "runner": "kiss-test-runner/0.1.0",
    "platform": "linux-x86_64",
    "started_at": "2026-01-21T12:34:56Z",
    "finished_at": "2026-01-21T12:34:57Z"
  },
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
    "logs": [ "stdout.log" ]
  },
  "hashes": {
    "descriptor_hash": "sha256:...",
    "result_hash": "sha256:..."
  },
  "notes": {}
}
```

---

# Canonicalization & hashing rules

- Use a deterministic canonical JSON serialization (JCS or equivalent) for any object that will be hashed.
- Hashing algorithm: SHA-256, formatted as `sha256:<hex>` for stable identifiers.
- `descriptor_hash` computed from canonicalized `test_descriptor`.
- `result_hash` computed from canonicalized `result` excluding ephemeral fields like timestamps.
- `kiss.lock` references `tests_hash` (alias for `descriptor_hash`) as the canonical identity of the tests asserted for a function.

Rationale: canonicalization ensures stable identifiers across runs and environments and prevents accidental hash churn.

---

# Reproducibility & replay

- Each test run must contain all necessary data to re-run deterministically:
  - canonical test descriptor, seed, runner command, relevant environment summary (no secrets), and dependency versions.
- Provide replay capability (PoC-level CLI):
  - `kiss test --replay <test_run_id>` re-creates recorded environment (as closely as possible) and executes the test.
  - Replay produces a new test-run artifact and indicates whether the result matches the recorded result.
- Replay artifacts should include diffs and diagnostics when outcomes diverge.

---

# Flaky tests & seeds

- Property-based tests must include explicit `seed` values in descriptors or test runs.
- Flakiness detection (heuristics):
  - Re-run failing tests a configurable number of times.
  - If outcomes vary under identical recorded conditions, mark the run as `flaky` and record metadata (consecutive failure count, failing seeds).
- Flaky runs should create an automated backlog ticket (or issue placeholder) and be flagged for triage.

---

# CI considerations

- PR checks:
  - Run `kiss fmt --check` and `kiss test` for changes that affect code or tests.
  - Upload `.kiss/test-results/...` artifacts and the summary JSON/YAML as CI job artifacts.
- Release checks:
  - Verify `kiss.lock` references match recorded test-run artifacts and hashes.
  - Reject publish attempts if required `test_result` or `signature` fields are missing/invalid.
- CI should support replay: allow investigators to fetch a filed artifact and run `kiss test --replay` locally or in a diagnostic job.

---

# Privacy & security

- Do not include private keys, raw credentials, or sensitive production data in `input` or `result` fields.
- When secrets are required for tests, record redactions and provide pointers to secure provisioning (not plain text).
- Include a `safety_redaction` list in the `notes` when any redaction is applied.

---

# Acceptance criteria (DoD)

- [ ] `spec/test-result.schema.yaml` (or JSON Schema) is drafted and committed covering `meta`, `test_descriptor`, `result`, `hashes`, and `notes`.
- [ ] `kiss.lock` schema updated to reference `test_run_id`, `tests_hash`, `test_seed`, and `test_artifact_path` (examples added to `spec/`).
- [ ] Canonicalization rules (JCS or equivalent) and hash format are documented and a short HOWTO is available in the `spec/` directory.
- [ ] Example test-run artifacts (for Hello and Inventory) are added under `Camus/examples/.kiss-test-examples/`.
- [ ] A PoC ticket exists to implement `kiss test` that writes a test-run artifact and updates `kiss.lock`.
- [ ] A PoC ticket exists for `kiss test --replay` to support deterministic re-runs and diagnostics.
- [ ] CI integration guidance is documented (how to upload artifacts and validate test runs during release).

---

# Proposed subtasks

1. Draft and commit `spec/test-result.schema.yaml` and example artifacts under `Camus/examples/.kiss-test-examples/`.
2. Implement a PoC `kiss test` that:
   - runs example tests,
   - writes canonical test-run artifacts,
   - updates `kiss.lock` with `tests_hash` and `test_run_id`.
3. Implement a PoC `kiss test --replay <test_run_id>` that replays recorded runs and reports diffs.
4. Add CI example flows demonstrating artifact upload and release validation (PR & release workflow examples).
5. Add a short `TESTING_GUIDELINES.md` that documents privacy redactions and flakiness handling.
6. Create follow-up tickets to harden artifact signing and long-term archival (if required).

---

# Open questions

- Should test-run artifacts eventually be signed or include a provenance signature? (security vs complexity)
- Where to place long-term archival of artifacts (CI storage vs an artifact registry)? (policy decision)
- What is the desired replay fidelity for external dependencies (network, DB) vs recorded stubs? (policy & implementation tradeoff)
- Should we standardize a single `runner` interface for test harness integrations (language-agnostic adapters)?

---

# Estimate & priority

- Estimate: M (spec + examples + PoC tickets).
- Priority: High — test artifacts are fundamental for certification, auditing, and release gating.

---

# References

- Related backlog tickets: `task-1`, `task-2`, `task-3`, `task-5` (KISS CLI spec), `task-6` (SPEC skeleton), `task-8` (CI policy), `task-9` (signing policy).
- Example artifacts: placed under `Camus/examples/.kiss-test-examples/` (proposed).
- Canonicalization reference: JSON Canonicalization Scheme (JCS) or equivalent deterministic serializer.

*End of ticket.*
