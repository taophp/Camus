---
title: "007 — CI and Policy Integration"
status: "To Do"
labels: ["ci","policy","tooling","security"]
assignee: ""
milestone: "Security & certification"
---

# Objective

Define the minimal continuous integration (CI) workflows and the project-level policies that ensure reproducible testing, enforce certification requirements, and guard the release/publish flow. The ticket's outcome is:

- a short, machine-actionable CI policy document,
- a set of CI workflow stubs (examples) that implement the policy (PR checks + release checks),
- a list of follow-up tasks to implement infra and automation (signature verification, test artifact collection, dependency trust checks).

> All documents must be authored in English.

---

# Why this matters

Camus relies on human audit + reproducible evidence for `claim` certification. CI acts as the mechanical gatekeeper that:
- enforces formatting and test execution rules,
- records reproducible artifacts (test results, seeds, logs),
- ensures that only properly certified releases can be published,
- implements the project's dependency trust policies.

Without a clear CI policy and automated checks, certifications can be circumvented or become unreliable.

---

# In scope

- Define a minimal CI policy (PR + release flows).
- Specify required CI checks and their ordering.
- Provide example CI workflow files (tool-agnostic, with a recommended GitHub Actions reference).
- Define the required test artifacts and the `kiss.lock` fields that CI must validate/update.
- Document dependency trust levels and how CI should enforce them.
- Create small follow-up tasks for implementing the CI steps.

# Out of scope

- Full implementation of the signing infrastructure (key management) — separate ticket.
- Full implementation of the registry — separate ticket.
- Building production-grade CI pipelines for every provider — we provide canonical examples and requirements.

---

# CI Policy (draft rules)

1. PR (pre-merge) requirements:
   - Every PR must reference a Backlog ticket (enforced by PR template or CI check).
   - The PR must pass: `kiss fmt --check`, `kiss test`, and static checks (linters).
   - CI must capture `kiss test` structured output (JSON/YAML) and upload it as job artifacts.
   - If tests include property-based tests, CI must record the used `seed` and the test output (logs).
   - PR merges are blocked until all required checks pass.

2. Test reproducibility:
   - CI executes tests in a deterministic environment (container or ephemeral VM).
   - Seeds for property-based tests must be recorded and persisted in `kiss.lock` or `.kiss/test-results/`.
   - CI must be able to re-run a failing test with the recorded seed.

3. Certification and release:
   - Only artifacts that have been certified and signed can be published.
   - `kiss certify` must be executed (and pass tests) prior to release.
   - CI release workflow must verify signatures and check that `kiss.lock` indicates the functions/components are certified and signed.
   - Any attempt to publish a `dev` artifact (unsigned or marked `dev: true`) must fail the publish step.

4. Dependency trust policy:
   - The project supports three trust modes (configurable per project):
     - `basic`: accepts auto-signed dependencies (low assurance).
     - `certified`: accepts only dependencies signed by keys listed in the project's trust store.
     - `audit`: requires internal re-certification or an external audit proof for dependencies.
   - CI must verify dependency signatures against the project's trust policy on release builds.

5. Handling flaky tests:
   - Flaky tests must be tagged and moved to an issue; CI can enforce a policy of "no new flaky tests."
   - Certification should require non-flaky status for tests covering the `claim` under certification.

6. Secrets and signing:
   - Key material for signing must be treated as secrets. The signing UX & key-management approach is defined in a follow-up ticket.
   - CI should not store raw private keys in unobfuscated form; consider use of signing agents or external signing services.

---

# Expected artifacts & `kiss.lock` interactions

- CI must store:
  - `.kiss/test-results/<job>.json` : structured per-test metadata (seed, input, test_hash, result).
  - logs, test outputs, and compressed artifacts for audits.
- `kiss.lock` must be updated (or validated) by the release workflow to include:
  - `source_hash`, `tests_hash`, `test_seed`, `test_result`, `signer_id`, `signature`, `published` flag.
- Release CI must validate:
  - that `test_result == "passed"` for required functions,
  - that `signature` is present and valid for the sources being published,
  - that the artifact is not marked `dev: true`.

Example snippet (conceptual):

```yaml
# example entry (for humans)
functions:
  - name: sortList
    source_hash: "sha256:..."
    tests_hash: "sha256:..."
    test_seed: 123456789
    test_result: "passed"
    signer_id: "ed25519:alice@example.com"
    signature: "base64..."
    published: true
```

---

# Acceptance criteria (DoD)

- [ ] A `CI_POLICY.md` document is added (or a dedicated section in `60-design.md`) that records these CI rules in plain English.
- [ ] A PR-check workflow example is added to the repo (e.g., `.github/workflows/pr-check.yml` sample) that:
  - runs `kiss fmt --check`,
  - runs `kiss test`,
  - uploads structured test results as artifacts.
- [ ] A release workflow example is added (e.g., `.github/workflows/release.yml` sample) that:
  - verifies `kiss.lock` signatures and `published` flags,
  - rejects attempts to publish `dev` artifacts or unsigned artifacts,
  - enforces dependency trust rules for release mode.
- [ ] CI artifacts include test results with `seed` and test hashes and `kiss.lock` schema is referenced in the policy doc.
- [ ] A small checklist for handling flaky tests and for recording seeds is present in the policy doc.
- [ ] A follow-up ticket is created to decide the signing UX and key management (interactive vs signing agent).
- [ ] A follow-up ticket is created to implement the pipeline jobs as actual CI configs and to validate them on an example PR (e.g., with `examples/hello`).

---

# Proposed subtasks

1. Draft `CI_POLICY.md` and add it to the repo (or extend `60-design.md`).
2. Add a PR-check workflow example (GitHub Actions or generic CI script) that runs `kiss fmt --check` and `kiss test`.
3. Add a Release workflow example that validates `kiss.lock` and signature metadata before allowing publishing.
4. Add a simple job to collect/upload `.kiss/test-results/` as CI artifacts.
5. Add a PR template that requires the author to reference a Backlog ticket and declare the required checks.
6. Implement a small verification script that CI can use to assert that `kiss.lock` contains required fields and signatures (prototype).
7. Create tickets for signing UX and key management, and for dependency verified-trust enforcement in CI.

---

# Open questions & decisions to escalate

- Which CI provider(s) should be the canonical reference? (Recommended default: GitHub Actions for example workflows; keep spec provider-agnostic.)
- Signing key management: local (private key in CI secret), hardware (HSM), or external signing services (Sigstore-like)? Need security review.
- How strict should the policy be for early development vs protected branches (e.g., `dev`, `audit`, `release` modes)?
- How to safely run tests that require external services? Should certification runs require sandboxing or recorded test doubles?

---

# Estimate & priority

- Estimate: M (draft + examples + prototyping CI verification scripts).
- Priority: High (CI and policy are enforcement points for certification and publishing).

---

# References

- Tickets: `000`, `001`, `002`, `004`, `005`, `006`
- Project vision: `Camus/README.md`, `Camus/conversation.md`
- Examples: `Camus/examples/hello.camus`, `Camus/examples/inventory.camus`

---
*End of ticket.*