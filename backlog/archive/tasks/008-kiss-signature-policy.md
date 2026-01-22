---
title: "008 — Document the signing policy for `kiss` (signature policy)"
status: "To Do"
labels: ["spec","security","signing"]
assignee: ""
milestone: "Security & certification"
---

# Objective

Define a clear, minimal, and reviewable signing policy for Camus and the `kiss` tool. This ticket documents the initial policy decisions (what gets signed, by whom, and how), the metadata that must be recorded (where and in which format), and the follow-up tasks needed to implement the policy in `kiss` and CI.

> Initial decisions (already agreed)
> - Signing policy (initial): sign canonicalized source only (source-level signing).
> - Algorithm recommendation: ed25519 (signature encoded as base64).
> - Human attestation: signing is a deliberate human action; automation is allowed only under explicit team policy.
> - `kiss` must require canonical formatting (`kiss fmt`) before signing, and must record tests/seed metadata prior to certification.

---

# Scope

This ticket covers:
- formalizing the initial signing policy and the minimum metadata schema for signatures,
- describing the workflow a human follows to sign (via `kiss certify`/`kiss sign`),
- defining how signatures are recorded in `kiss.lock` and how `kiss` enforces signature validity,
- documenting cascade invalidation rules for dependent functions,
- identifying follow-up implementation tickets: key management, signing UX, registry verification.

Out of scope:
- production key management solutions (HSM, sigstore, etc.) — this will be a follow-up ticket.
- signing artifacts beyond source (IR, binary) — "nice to have" for the future.

---

# Policy specification (draft)

## 1) Scope of signing
- Unit of signing: a function or component source unit (function-level or module-level as appropriate).
- The signer attests that the canonicalized source (post-`kiss fmt`) matches the human-reviewed artifact and that the associated `tests` for the claim pass (or are accepted by the reviewer).
- Initial policy: sign the formatted source text or canonical representation of the function/module.

## 2) Preconditions for signing
- `kiss fmt --write` must be run (or `kiss fmt --check` must pass).
- `kiss test` must pass for the function(s) being certified. For property-based tests, required seeds must be recorded.
- The test run metadata (seed, test hashes, logs) must be present in `.kiss/test-results/` and referenced in `kiss.lock`.

## 3) Signature contents & storage
- Signing data to be recorded (minimum):
  - `source_hash`: canonical source SHA-256 hash
  - `tests_hash`: hash summarizing the tests relevant to the function
  - `test_seed`: seed used for property tests (if applicable)
  - `test_result`: `passed` | `failed`
  - `signer_id`: canonical identifier for the signer (e.g., `ed25519:alice@example.com` or `alice@org`)
  - `signature`: base64(ed25519(signature_bytes(source_manifest)))
  - `signed_at`: RFC3339 timestamp when signing occurred
  - `kiss_version`: optional, version of `kiss` used to certify
- Storage: all of the above are recorded in `kiss.lock` as part of the function's metadata.

Example `kiss.lock` snippet (illustrative):
```/dev/null/kiss.lock.example#L1-16
functions:
  - name: sortList
    source_hash: "sha256:..."
    tests_hash: "sha256:..."
    test_seed: 123456789
    test_result: "passed"
    signer_id: "ed25519:alice@example.com"
    signature: "base64:..."
    signed_at: "2026-01-21T12:34:56Z"
    published: false
```

## 4) Signature process & UX
- `kiss certify` behavior (recommended flow):
  1. Run `kiss fmt --check` (fail if formatting required).
  2. Run `kiss test` (if tests are not recorded/passing).
  3. Produce a certification package (claim, canonicalized source, tests metadata, diffs, dependency trust info).
  4. Present the package to the human reviewer (interactive prompt or review artifact).
  5. Human confirms and signs: either interactive `kiss certify` confirmation or explicit `kiss sign` with signer identity.
  6. `kiss` updates `kiss.lock` with signature metadata.
- Signing must be an explicit human action by default. Non-interactive signing (`--sign` flag) may be allowed if a project-level policy explicitly permits automation.

## 5) Cascade invalidation & re-certification
- Any change to a function's source or to its tests changes `source_hash` or `tests_hash` and therefore invalidates its signature.
- Invalidation cascades: when a signed function A changes, all functions that depend on A must be marked as un-certified (their signatures considered invalid) until they are re-tested and re-certified.
- `kiss diff` or `kiss verify` must be able to compute and list the cascade of invalidations.

## 6) Verification & CI integration
- `kiss verify <artifact_or_lock>` validates that recorded signatures correspond to stored canonical sources and that tests recorded in `kiss.lock` have matching hashes and recorded seeds.
- Release CI must reject publish attempts if required signatures are missing, invalid, or if dependencies violate the project's trust policy.

## 7) Key management & signer identity (initial approach)
- Recommended initial approach:
  - Per-person ed25519 key pairs (generated and managed locally).
  - `signer_id` should include a stable identifier (email or key fingerprint).
  - Private keys are stored in the developer's secure store and not in the repo.
- Follow-up: a separate ticket will investigate stronger key management — HSM, OS keyring integration, or use of an external signing service for higher assurance.

---

# Acceptance criteria (DoD)

- [ ] A `SIGNING_POLICY.md` section exists (or `60-design.md` is updated) describing the source-only signing policy, preconditions, and storage format.
- [ ] The minimum `kiss.lock` schema entries for signature metadata are defined and added to `spec/kiss.lock.schema.yaml` (or equivalent).
- [ ] The `kiss certify` recommended UX is documented (interactive signing by default).
- [ ] The cascade invalidation rule is documented and example behavior is described (how `kiss` reports invalidated functions).
- [ ] An implementation ticket is created to add: `kiss certify` sign stub, `kiss verify` verification stub, and `kiss.lock` writer/reader (PoC).
- [ ] A follow-up ticket is created to design signing key management and signing automation policy (if desired).

---

# Proposed subtasks

1. Draft `SIGNING_POLICY.md` and add a concise section to `60-design.md`. (This ticket)
2. Create `/spec/kiss.lock.schema.yaml` with the signature metadata fields described above.
3. Create an implementation ticket: `kiss` PoC to:
   - generate canonical source hash,
   - write/update `kiss.lock`,
   - validate `kiss.lock` entries via `kiss verify`.
4. Create an implementation ticket for `kiss certify` sign UX (interactive + optional non-interactive mode).
5. Create a security ticket to research and propose key management options (local keys vs agent vs external service).
6. Update CI policy (ticket `007`) to add a verification step validating signatures for release builds.

---

# Notes & risks

- Legal/operational caution: a signature is an attestation by a human. The project must make clear what signing implies legally/operationally (who bears responsibility).
- Signing the source only simplifies early implementation but leaves space for future extension (IR or binary signatures). Document the roadmap for extension.
- Careful handling of private keys and signing UX is essential — a bad UX will either encourage insecure practices or create friction (e.g., people circumventing the process).

---

# Estimate & priority

- Estimate: S (policy document + schema + a few follow-up tickets). Implementation work (PoC) will be a separate ticket with its own estimate.
- Priority: High — signing is fundamental to certification and release.

---

# References

- Related backlog tickets: `000`, `001`, `002`, `004`, `005`, `007`.
- Relevant files: `Camus/README.md`, `Camus/conversation.md` (sections "Certification" and "kiss").
- Example lockfile snippet included above.

*End of ticket.*