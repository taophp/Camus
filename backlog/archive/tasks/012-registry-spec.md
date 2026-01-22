---
title: "012 — Registry specification (draft)"
status: "To Do"
labels: ["spec","registry","security","publication"]
assignee: ""
milestone: "Publication & registry"
---

# Objective

Design a minimal, secure, and practical specification for the Camus registry (a.k.a. `registry.camus-lang.org`). The registry is the canonical point to publish, discover, and verify Camus components. This ticket captures the goals, data model, publishing constraints, verification rules and operational concerns; it also lists follow-up tasks needed to implement a PoC registry and CI integration.

> The registry must enforce the project's trust model: only release artifacts certified and signed according to policy are publishable; dev artifacts are never publishable.

---

# Scope

In scope:
- Data model and canonical metadata for published components (component manifest).
- Publication workflow and server-side checks (signatures, tests, lockfile verification).
- Minimal REST API surface and storage layout for artifacts and metadata.
- Trust model enforcement (basic / certified / audit modes) and verification rules.
- Immutability, deprecation and audit logging policy.

Out of scope (separate tickets):
- Full registry implementation & hosting automation.
- Advanced replication/mirroring strategy, CDN, or long-term archival.
- Full integration with external verification services (e.g., HSM, Sigstore); these are follow-ups.

---

# Definitions & Concepts

- Component: unit of publication (equivalent to a "crate"/"component" in conversation). Identified by `namespace/name:version`.
- Claim: the asserted behavior attached to a component (a `claim` block as defined by SPEC).
- Test artifacts: the records produced by `kiss test` (seeds, logs, descriptor hashes).
- Signed release: a component whose canonical source has been formatted, tested, and explicitly signed by a human (signature stored in metadata).
- Dev artifact: a local, unsigned artifact produced by `kiss build --dev`; explicitly non-publishable.

---

# Registry goals

1. Safety: prevent unsigned/dev artifacts from being published.
2. Verifiability: verify that a published component includes the signed canonical source (source-only signing initially) and references passing tests.
3. Traceability: keep immutable audit records of publication events and origins.
4. Policy enforcement: validate dependency trust levels at publish time (basic / certified / audit).
5. Usability: provide simple discoverability and fetch APIs for consumers and CI.

---

# Minimal data model (manifest sketch)

A single component claim manifest stored in the registry should include:

```/dev/null/registry/manifest.example.yaml#L1-28
name: "org.example/inventory"
version: "0.1.0"
namespace: "org.example"
component_type: "component"   # e.g., component/module
claim:
  text: "Manage inventory - add, remove, list, ensure counts."
  id: "claim:inventory:0.1.0"
metadata:
  description: "Small inventory example used for demos/test harness."
  source_hash: "sha256:..."            # hash of canonicalized, formatted source
  tests_hash: "sha256:..."             # hash summarizing the tests
  test_run_id: "2026-01-21T12:34:56Z-run-57"
  test_result: "passed"
  kiss_version: "0.1.0"
signatures:
  - signer_id: "ed25519:alice@example.com"
    signature: "base64..."
    signed_at: "2026-01-21T12:34:56Z"
published:
  published_at: "2026-01-21T13:00:00Z"
  publisher_id: "alice@example.com"
  trust_level: "certified"
dependencies:
  - "org.example/utility:0.2.0"
```

Notes:
- `source_hash` and `tests_hash` are used by registry verification to ensure the published artifact matches the certified source and tests.
- `trust_level` reflects the project's chosen trust model for the component (basic/certified/audit).

---

# API surface (minimal proposal)

1. `POST /api/v1/components` — Publish component (multipart: manifest + source bundle + optional artifacts).
   - Server verifies: canonical formatting, `tests` presence/passing, signature validity, dependency trust per project policy, and `published` constraints (no `dev` artifacts).
   - On success: returns `201` with component resource.

2. `GET /api/v1/components/{namespace}/{name}/{version}` — Fetch component manifest & metadata.

3. `GET /api/v1/components/{namespace}/{name}/{version}/source` — Fetch canonical source bundle.

4. `GET /api/v1/search?q=...` — Simple search by name, claim text, or tags.

5. `GET /api/v1/components/{namespace}/{name}/history` — Audit/history of publishes, retractions, and signatures.

6. `POST /api/v1/components/{namespace}/{name}/{version}/verify` — Re-run registry verification of a stored component (useful for audits after policy changes).

Implementation note: all write operations must be authenticated; publish operations require signing metadata and a stable signer identity.

---

# Trust model & publish checks

- Basic mode: registry accepts components with valid signatures by their declared signer (low assurance).
- Certified mode: registry only accepts components whose signatures are by keys in a certified keylist (project-level trust store).
- Audit mode: for high-assurance projects, registry enforces additional checks (e.g., external audit records attached, or re-certification required).

Publish checks (server-side):
1. Is artifact flagged as `dev`? If yes: reject.
2. Does `manifest.source_hash` match SHA-256 of uploaded canonical source? If not: reject.
3. Are `tests` present and do they include recorded passing runs? If not: reject (or require further human attestation per project config).
4. Is signature present and valid? If not: reject.
5. For `certified` mode: is the signer in the project's trust list? If not: reject or require additional steps.
6. Record the publish action in the audit log (timestamp, publisher_id, manifest snapshot).

---

# Immutability, retraction & governance

- Once a version is published it is immutable: the manifest and artifacts are content-addressed and cannot be modified.
- To indicate removal or deprecation, the registry records a `deprecation` or `retraction` entry in the audit log rather than mutating the artifact.
- Takedown: the registry may support legal or policy-driven takedown with an audit trail; the artifact remains in immutable storage but marked `retracted: true` and flagged in search results (policy setting).
- Re-publishing a corrected version must use a bumped version identifier; this preserves an immutable history.

---

# Auditability and transparency

- Maintain an append-only audit log for publish/retract/verify events with timestamp, actor, and manifest snapshot.
- Optional: provide a public transparency log (similar in concept to certificate transparency) as a future enhancement (useful for verification and third-party audits).

---

# Acceptable artifact formats & storage

- Source bundle: a single canonical tarball containing the canonicalized source files and `kiss.lock` excerpt.
- Auxiliary artifacts: test-run JSON, optional build artifacts (release binaries) — these can be stored, but the registry must record whether they are allowed and how they were produced.
- Storage backend: object storage (S3-like) or a content-addressed store; the registry should store artifacts and serve via authenticated endpoints.

---

# Acceptance criteria (DoD)

- [ ] `REGISTRY_SPEC.md` (or this ticket) contains the minimal proposal above in the repo.
- [ ] Manifest schema (YAML/JSON Schema) is drafted and committed under `spec/registry.manifest.schema.yaml`.
- [ ] API surface is documented with example requests/responses for publish, fetch, and verify.
- [ ] A publish verification checklist is present and testable by a PoC (canonical source hash, tests passed, signatures valid, dev artifact blocked).
- [ ] Follow-up tickets created for:
  - PoC registry server + storage,
  - API endpoint implementation (publish/verify/fetch),
  - automated verification in CI (release pipeline),
  - registry UI minimal discovery page (optional).
- [ ] Security considerations and trust modes documented and linked to CI policy and signing policy tickets.

---

# Proposed subtasks

1. Draft `spec/registry.manifest.schema.yaml`.
2. Draft minimal OpenAPI-like doc for the registry API (publish/fetch/verify/search).
3. Implement a lightweight PoC registry service (storage + publish verification) as a disposable container for early experiments.
4. Integrate `kiss publish` (CLI) with the PoC: CLI should call registry publish API and perform pre-checks locally (same as server-side checks).
5. Create test scenarios (happy path, signature mismatch, dev artifact rejection, dependency trust failure).
6. Add a ticket to research a transparency log or other audit mechanisms (future work).

---

# Security & operational considerations

- Keys & signer identity: rely on ed25519 signer identity recorded in manifest; actual private keys are out of scope for the registry (signer signs locally before publishing).
- Protect publish endpoints: require strong authentication and use TLS; record publisher identity in the audit log.
- Rate limits, abuse detection and signing-of-compromised-key handling must be designed in follow-ups.
- Mitigate supply-chain attacks by enforcing test and signature verification and making audit logs visible for critical components.

---

# Open questions (to resolve in follow-up tickets)

- Should the registry accept multiple signatures per artifact (e.g., author + auditor)? (Likely yes; design needs to support multiple entries).
- Versioning scheme: semantic versioning is convenient, but the registry should also expose content hashes as canonical identifiers.
- Public discoverability vs private registries: support both public and private project-scoped registries?
- Should the registry store full test artifacts or reference external storage (CI job artifacts)?

---

# Estimate & priority

- Estimate: M → L for the spec + PoC (depending on scope).
- Priority: High — the registry enforces safe publication and is central to how certified components are distributed.

---

# References

- Tickets: `000`..`011` (backlog: initial design & CLI & spec tickets)
- `Camus/conversation.md` (design decisions on certification, claims, and `kiss`)
- `SPEC.md` (when drafted): to be referenced for `claim` & test shapes

---
*End of ticket (draft). Review, iterate and split into smaller implementation tickets when accepted.*