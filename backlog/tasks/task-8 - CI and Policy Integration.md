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

# Acceptance criteria (DoD)

- [ ] `CI_POLICY.md` is drafted and added to the repository (or a dedicated section in `60-design.md`) describing rules in plain English.
- [ ] A PR-check workflow example is added to the repo (e.g., `.github/workflows/pr-check.yml`) that:
  - runs `kiss fmt --check`,
  - runs `kiss test`,
  - uploads structured test results as artifacts.
- [ ] A release workflow example is added (e.g., `.github/workflows/release.yml`) that:
  - validates `kiss.lock` signatures and `published` flags,
  - rejects attempts to publish `dev` artifacts or unsigned artifacts,
  - enforces dependency trust rules for release mode.
- [ ] CI artifacts include test results with `seed` and test hashes; the policy doc references the `kiss.lock` schema and the artifact layout.
- [ ] A small verification script (e.g., `scripts/ci-verify-kiss-lock.js` or `scripts/ci-verify-kiss-lock.sh`) exists and is documented; an example invocation is shown in the release workflow.
- [ ] A PR template is added to require ticket reference and high-level checklist for PR authors (impact, tests, `kiss fmt` check, CI expectations).
- [ ] Follow-up tickets created for signing UX & key management and for implementing provider-specific CI jobs (if desired).
- [ ] At least one example PR demonstrates the PR-check and release-check flow on a trivial change (e.g., `examples/hello`).

# Proposed subtasks

1. Draft and commit `CI_POLICY.md` describing the policy and artifact expectations.
2. Create example PR workflow (`.github/workflows/pr-check.yml`) that:
   - runs `kiss fmt --check` and `kiss test`,
   - uploads `.kiss/test-results` and test summaries as job artifacts.
3. Create example release workflow (`.github/workflows/release.yml`) that:
   - validates `kiss.lock` entries and signatures,
   - rejects publishing of `dev` artifacts.
4. Add a small verification script `scripts/ci-verify-kiss-lock.*` to assert required fields and signature presence (prototype).
5. Add a PR template that requires Backlog ticket reference and a short PR checklist.
6. Open follow-up tickets:
   - signing UX & key management strategy,
   - provider-specific CI implementation tasks (GitHub Actions example → other providers).
7. Validate the end-to-end flow on a test PR that modifies an example (`Camus/examples/hello.camus`) and demonstrate proper artifact capture.

# Open questions & decisions to escalate

- Which CI provider(s) will be the canonical reference? (Recommend GitHub Actions examples, keep spec provider-agnostic.)
- Signing key management approach: local CI secrets vs HSM vs external signing service (e.g., sigstore) — needs security review.
- Level of enforcement during early development vs protected branches (e.g., more permissive on dev vs strict on main/release branches).
- How to handle tests requiring external services in certification runs (sandboxing vs recorded test doubles)?
- What is the exact JSON/YAML schema for `.kiss/test-results` and `kiss.lock`? (Specify and include schema files in `spec/`.)

# Estimate & priority

- Estimate: M (draft policy + example workflows + small verification scripts).
- Priority: High — CI and policy are enforcement points for certification and publishing.

# References

- Related backlog tickets: `task-1 - Initialize the backlog and define milestones`, `task-2`..`task-7` (already created).
- Project docs: `Camus/60-design.md`, `Camus/SPEC.md` (skeleton).
- Examples: `Camus/examples/hello.camus`, `Camus/examples/inventory.camus`.

*End of ticket — implement subtasks incrementally and open follow-ups for signing UX and provider-specific CI adoption.*