---
id: task-9
title: Document KISS signing policy
status: To Do
assignee: []
created_date: ''
updated_date: '2026-01-22 14:20'
labels:
  - spec
  - security
  - signing
milestone: Security & certification
dependencies: []
ordinal: 9000
---

# Objective

Define a clear, minimal, and reviewable signing policy for Camus and the `kiss` tool. The output of this ticket is:

- a short, machine-actionable policy document describing what is signed, preconditions, storage format and verification rules,
- a `kiss.lock` schema extension for signature metadata (spec file),
- a set of follow-up implementation tickets (PoC tooling + CI verification),
- worked examples and acceptance tests that CI can run to validate the policy.

This work aims to make certification explicit, auditable, and automatable while keeping the initial scope pragmatic (source-only signing, human attestation by default).

---

# Scope

In scope:
- Formalize the initial signing policy (source-level signing).
- Specify the minimal signature metadata recorded in `kiss.lock`.
- Define the preconditions for signing (formatting + tests + reproducible metadata).
- Describe the human-facing signing UX (recommended `kiss certify` + interactive sign flow).
- Document cascade invalidation rules and how `kiss` should report impacted artifacts.
- Describe verification and CI integration points (release checks).
- Create follow-up tickets for the implementation of PoCs and key management.

Out of scope (follow-up work):
- Production-grade key management/HSM or third-party signing services (investigated in a follow-up ticket).
- IR / binary signing (future extension).

---

# Policy specification (draft)

1) Scope of signing
- Unit of signing: function or component source unit (function-level or module-level).
- What is attested: the canonicalized (formatter-normalized) source and the associated tests/metadata for the claim.
- Initial policy: sign the canonicalized source text only (source-level signing).

2) Preconditions for signing
- Repository is formatted: `kiss fmt --write` or `kiss fmt --check` passes.
- Tests relevant to the claim have been executed and have `passed`. For property tests, seeds must be recorded.
- Test metadata (seed, test_hash, logs) are present in `.kiss/test-results/` and/or recorded in `kiss.lock`.
- Working tree is clean (recommended) or signing occurs in a controlled commit/branch.

3) Signature contents & storage
Minimum recorded fields (per signed unit) to keep in `kiss.lock`:

```/dev/null/kiss.lock.example#L1-16
functions:
  - name: sortList
    canonical_source_hash: "sha256:..."
    tests_hash: "sha256:..."
    test_seed: 123456789           # optional
    test_result: "passed"
    signer_id: "ed25519:alice@example.com"
    signature: "base64:..."        # base64(ed25519(signature_bytes(...)))
    signed_at: "2026-01-21T12:34:56Z"
    kiss_version: "0.1.0"          # optional
    published: false
```

4) Signature process & UX (recommended)
- `kiss certify` (recommended flow):
  1. Run `kiss fmt --check` (fail if formatting differs).
  2. Run `kiss test` (or validate recorded test metadata).
  3. Build a certification package (canonical source, test metadata, diffs).
  4. Present package to human reviewer (interactive prompt or review artifact).
  5. Human signs: interactive confirmation in `kiss certify` or `kiss sign <target>` with explicit identity.
  6. Update `kiss.lock` with signature metadata.

- Default UX: signing is a deliberate, interactive human action. Non-interactive signing (`--sign`) is allowed only under explicit, documented team policy (e.g., CI key agent under controlled circumstances).

5) Cascade invalidation & re-certification
- Any change in `canonical_source_hash` or `tests_hash` invalidates the signature for that unit.
- Invalidation cascades: when a unit A changes, any signed units that depend on A should be flagged as uncertified until re-tested and re-certified.
- `kiss diff` and `kiss verify` must be able to compute and list cascade invalidations.

6) Verification & CI integration
- `kiss verify <artifact|kiss.lock>` verifies that:
  - recorded `canonical_source_hash` matches canonicalized source,
  - `tests_hash` matches recorded tests and seeds,
  - signatures are valid for recorded signer identity.
- Release CI must:
  - refuse publishing if required signatures are missing or invalid,
  - verify dependency trust policy (see CI policy),
  - refuse to publish artifacts marked `dev: true`.

7) Key management (initial guidance)
- Initial approach: per-person ed25519 key pairs (private keys stored securely by owners).
- `signer_id` should include a stable identifier (email or key fingerprint).
- Private keys must not be stored in the repository. CI signing must be implemented via explicit, reviewed policies (separate security ticket).

---

# Acceptance criteria (DoD)

- [ ] Draft `SIGNING_POLICY.md` (or a dedicated section in `60-design.md`) is added describing the source-only signing policy and preconditions.
- [ ] `spec/kiss.lock.schema.yaml` includes the signature metadata fields (example schema added).
- [ ] `kiss certify` and `kiss verify` UX is documented (interactive signing by default).
- [ ] A small verification script or prototype (e.g., `scripts/ci-verify-kiss-lock.*`) is added as a PoC to check `kiss.lock` signature fields.
- [ ] CI policy ticket references signing verification and a sample release workflow that rejects unsigned/dev artifacts.
- [ ] A follow-up implementation ticket exists to add:
  - `kiss certify` sign stub / `kiss sign` UX,
  - `kiss verify` validation stub,
  - unit tests that assert cascade invalidation behavior.
- [ ] Security follow-up ticket created to design key management & signing automation policy.

---

# Proposed subtasks

1. Draft `SIGNING_POLICY.md` and add it to the repo (or add a `Signing` section to `60-design.md`) — include examples and DoD.
2. Add `spec/kiss.lock.schema.yaml` showing minimal signature metadata schema and an example file `spec/kiss.lock.example`.
3. Create a small verification PoC script `scripts/ci-verify-kiss-lock.sh` (or `.js`) that verifies presence and basic validity of signature fields (no cryptographic verification required for the first PoC).
4. Create implementation tickets:
   - PoC for `kiss certify` (produces certification package and updates `kiss.lock`),
   - PoC for `kiss verify` (validates recorded signatures and hashes),
   - Tests for cascade invalidation detection.
5. Create a security ticket to evaluate key management options (local key stores, OS keyring, signing agent, HSM or sigstore integration).
6. Add a minimal example PR (using `Camus/examples/hello.camus`) that runs PR checks and a release check demonstrating verification flow.

---

# Notes & risks

- Legal & operational risk: a signature is a human attestation — document what signing implies for the project (responsibility, revocation process).
- UX risk: a poor signing UX will lead contributors to bypass the process; aim for low-friction interactive UX and clear docs.
- Security risk: key leakage or bad key management undermines the trust model. The security follow-up ticket must address safe key handling and recommended practices.
- Scope creep: keep the initial policy intentionally small (source-only) so we can iterate.

---

# Estimate & priority

- Estimate: S (small policy document + schema + PoC scripts). Implementation PoCs and key management research will be separate tickets with their own estimates.
- Priority: High — signing is central to certification and safe publishing.

---

# References

- Parent/init: `task-1 - Initialize the backlog and define milestones`
- Related tickets: `task-3 - Draft 60-design.md`, `task-5 - Define KISS CLI workflow`, `task-6 - SPEC skeleton`, `task-8 - CI and Policy Integration`
- Examples & PoCs: `Camus/examples/*` (proposed targets for validation)

---
*When this ticket is complete and reviewed, create small follow-up implementation tickets and one security ticket for key management so signing can be safely implemented and iterated.*
