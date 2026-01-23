---
id: task-13
title: Registry specification (draft)
status: To Do
assignee: []
created_date: ''
updated_date: '2026-01-23 12:30'
labels:
  - spec
  - registry
  - security
  - publication
milestone: Publication & registry
dependencies: []
ordinal: 13000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
# Objective

Design a minimal, secure, and practical specification for the Camus registry (`registry.camus-lang.org`). The registry is the canonical service to publish, discover, and verify Camus components. This ticket captures goals, the data model, publish-time verification rules, operational concerns, and a set of follow-up tasks for building a PoC registry and CI integration.

Primary outcomes:
- a clear registry spec document (`REGISTRY_SPEC.md`) in the repo,
- a draft manifest schema (`spec/registry.manifest.schema.yaml`),
- a small set of implementable subtasks (PoC server, CLI integration tests, API docs).

---

# Definitions & concepts

- Component: a publishable unit (`namespace/name:version`) — e.g., a library, module, or component bundle.
- Claim: the asserted behavior attached to a component (as defined in SPEC).
- Signed release: a component whose canonical source has been formatted, tested, and signed by a human; recorded in `kiss.lock` and manifest signatures.
- Dev artifact: an unsigned, `dev`-marked artifact produced with `kiss build --dev`; explicitly non-publishable.
- Trust modes:
  - `basic` — accept valid signatures;
  - `certified` — accept signatures only from approved keys;
  - `audit` — require strong external audit evidence.

---

# Goals & core requirements

1. Safety: reject unsigned or `dev` artifacts at publish time.
2. Verifiability: ensure uploaded artifacts match signed, canonical source and passing tests referenced in `kiss.lock`.
3. Traceability: maintain immutable audit records for publish/retraction events.
4. Policy enforcement: validate dependency trust levels for publish operations.
5. Usability: expose discovery/fetch APIs for consumers and straightforward integration for `kiss publish`.

---

# Minimal manifest model (sketch)

A registry manifest must surface the fields necessary for verification and discovery:

```yaml
name: "org.example/inventory"
version: "0.1.0"
namespace: "org.example"
component_type: "component"
claim:
  id: "claim:inventory:0.1.0"
  text: "Manage inventory - add/remove/list, preserve counts"
metadata:
  description: "Inventory example"
  source_hash: "sha256:..."         # canonical source hash (signed payload)
  tests_hash: "sha256:..."          # canonical tests descriptor hash
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
- `source_hash` and `tests_hash` are core verification keys.
- Support multiple signatures (author + auditor) in `signatures`.

---

# API surface (minimal)

1. `POST /api/v1/components` — Publish component (multipart: manifest + canonical source bundle + optional test artifacts)
   - Server validates canonicalization, test artifacts, signatures, trust constraints.
   - Returns `201 Created` with manifest resource and audit info.

2. `GET /api/v1/components/{namespace}/{name}/{version}` — Retrieve manifest & metadata.

3. `GET /api/v1/components/{namespace}/{name}/{version}/source` — Download canonical source bundle.

4. `GET /api/v1/components/{namespace}/{name}` — List versions and metadata.

5. `GET /api/v1/search?q=...` — Search components by name, claim text, tags.

6. `POST /api/v1/components/{namespace}/{name}/{version}/verify` — Re-run verification checks for stored artifact (audit).

Security: write operations require authenticated and authorized clients. All endpoints use TLS.

---

# Publish-time verification checks

Server-side publish checks (minimum):

1. Reject if artifact is marked `dev: true`.
2. Validate `manifest.source_hash` matches computed SHA-256 of uploaded canonical source.
3. Validate `tests` presence and that `test_result` indicates passing runs (or an acceptable policy-driven exception).
4. Validate signature(s) over canonical payload bytes (ed25519).
5. Enforce trust mode: in `certified` mode verify signer key against project trust store; in `audit` mode require additional audit evidence.
6. Record the event in an append-only audit log (timestamp, actor, manifest snapshot, verification outcome).

---

# Immutability, retraction & governance

- Published versions are immutable: content-addressed storage + manifest snapshot required.
- Retraction: mark the artifact as `retracted: true` in audit log (do not delete underlying stored artifact).
- Deprecation: add metadata flags while preserving history.
- Re-publishing fixes must use new version numbers—no in-place mutations.

---

# Auditability & transparency

- Maintain append-only auditable logs (publish/retract/verify attempts).
- Provide an audit endpoint: `GET /api/v1/components/{namespace}/{name}/{version}/history`.
- Optionally: design a transparency log (future work) for public verifiability and supply chain observability.

---

# Storage & artifact formats

- Canonical source bundle: tarball or content-addressed archive containing canonicalized files + `kiss.lock` excerpt.
- Test artifacts: structured JSON/YAML test-run artifacts; registry may store or reference CI artifacts (policy decision).
- Storage backend: object storage (S3-like) or content-addressed store; MUST support immutable objects and integrity checks.
<!-- SECTION:DESCRIPTION:END -->

# Objective

Design a minimal, secure, and practical specification for the Camus registry (`registry.camus-lang.org`). The registry is the canonical service to publish, discover, and verify Camus components. This ticket captures goals, the data model, publish-time verification rules, operational concerns, and a set of follow-up tasks for building a PoC registry and CI integration.

Primary outcomes:
- a clear registry spec document (`REGISTRY_SPEC.md`) in the repo,
- a draft manifest schema (`spec/registry.manifest.schema.yaml`),
- a small set of implementable subtasks (PoC server, CLI integration tests, API docs).

---

# Definitions & concepts

- Component: a publishable unit (`namespace/name:version`) — e.g., a library, module, or component bundle.
- Claim: the asserted behavior attached to a component (as defined in SPEC).
- Signed release: a component whose canonical source has been formatted, tested, and signed by a human; recorded in `kiss.lock` and manifest signatures.
- Dev artifact: an unsigned, `dev`-marked artifact produced with `kiss build --dev`; explicitly non-publishable.
- Trust modes:
  - `basic` — accept valid signatures;
  - `certified` — accept signatures only from approved keys;
  - `audit` — require strong external audit evidence.

---

# Goals & core requirements

1. Safety: reject unsigned or `dev` artifacts at publish time.
2. Verifiability: ensure uploaded artifacts match signed, canonical source and passing tests referenced in `kiss.lock`.
3. Traceability: maintain immutable audit records for publish/retraction events.
4. Policy enforcement: validate dependency trust levels for publish operations.
5. Usability: expose discovery/fetch APIs for consumers and straightforward integration for `kiss publish`.

---

# Minimal manifest model (sketch)

A registry manifest must surface the fields necessary for verification and discovery:

```yaml
name: "org.example/inventory"
version: "0.1.0"
namespace: "org.example"
component_type: "component"
claim:
  id: "claim:inventory:0.1.0"
  text: "Manage inventory - add/remove/list, preserve counts"
metadata:
  description: "Inventory example"
  source_hash: "sha256:..."         # canonical source hash (signed payload)
  tests_hash: "sha256:..."          # canonical tests descriptor hash
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
- `source_hash` and `tests_hash` are core verification keys.
- Support multiple signatures (author + auditor) in `signatures`.

---

# API surface (minimal)

1. `POST /api/v1/components` — Publish component (multipart: manifest + canonical source bundle + optional test artifacts)
   - Server validates canonicalization, test artifacts, signatures, trust constraints.
   - Returns `201 Created` with manifest resource and audit info.

2. `GET /api/v1/components/{namespace}/{name}/{version}` — Retrieve manifest & metadata.

3. `GET /api/v1/components/{namespace}/{name}/{version}/source` — Download canonical source bundle.

4. `GET /api/v1/components/{namespace}/{name}` — List versions and metadata.

5. `GET /api/v1/search?q=...` — Search components by name, claim text, tags.

6. `POST /api/v1/components/{namespace}/{name}/{version}/verify` — Re-run verification checks for stored artifact (audit).

Security: write operations require authenticated and authorized clients. All endpoints use TLS.

---

# Publish-time verification checks

Server-side publish checks (minimum):

1. Reject if artifact is marked `dev: true`.
2. Validate `manifest.source_hash` matches computed SHA-256 of uploaded canonical source.
3. Validate `tests` presence and that `test_result` indicates passing runs (or an acceptable policy-driven exception).
4. Validate signature(s) over canonical payload bytes (ed25519).
5. Enforce trust mode: in `certified` mode verify signer key against project trust store; in `audit` mode require additional audit evidence.
6. Record the event in an append-only audit log (timestamp, actor, manifest snapshot, verification outcome).

---

# Immutability, retraction & governance

- Published versions are immutable: content-addressed storage + manifest snapshot required.
- Retraction: mark the artifact as `retracted: true` in audit log (do not delete underlying stored artifact).
- Deprecation: add metadata flags while preserving history.
- Re-publishing fixes must use new version numbers—no in-place mutations.

---

# Auditability & transparency

- Maintain append-only auditable logs (publish/retract/verify attempts).
- Provide an audit endpoint: `GET /api/v1/components/{namespace}/{name}/{version}/history`.
- Optionally: design a transparency log (future work) for public verifiability and supply chain observability.

---

# Storage & artifact formats

- Canonical source bundle: tarball or content-addressed archive containing canonicalized files + `kiss.lock` excerpt.
- Test artifacts: structured JSON/YAML test-run artifacts; registry may store or reference CI artifacts (policy decision).
- Storage backend: object storage (S3-like) or content-addressed store; MUST support immutable objects and integrity checks.

---

# Acceptance criteria (DoD)

- [ ] `REGISTRY_SPEC.md` added to the repo describing the above and linking related tickets.
- [ ] `spec/registry.manifest.schema.yaml` drafted and committed (YAML/JSON schema for manifest).
- [ ] Minimal API doc (OpenAPI/Swagger sketch) committed under `spec/` with example requests/responses for publish/fetch/verify.
- [ ] Publish verification checklist documented and testable.
- [ ] Follow-up tickets created for:
  - PoC registry server (publish + verify + storage),
  - CLI `kiss publish` integration and local pre-checks,
  - API integration tests and sample CI flows.
- [ ] Security considerations and trust modes documented and linked to CI & signing policy tickets.

---

# Proposed implementation subtasks

1. Draft `spec/registry.manifest.schema.yaml` (manifest schema + examples).
2. Draft OpenAPI-like API spec (`spec/registry.api.yaml`) with publish/fetch/verify endpoints.
3. Implement a lightweight PoC registry service (containerized) that:
   - accepts publish uploads,
   - verifies hash/signature/tests,
   - stores artifacts in a local content-addressed store,
   - exposes fetch & history endpoints.
4. Add `kiss publish` CLI integration (pre-check locally, then POST to registry).
5. Create automated tests (happy path, signature mismatch, dev artifact rejection, dependency trust failure).
6. Add CI job examples demonstrating release-time verification and publish flow.
7. Research public transparency log integration (future ticket).

---

# Security & operational considerations

- Require TLS + authenticated API tokens for publish endpoints; enforce RBAC for maintainers/publishers.
- Store signer identities but not private keys; signing happens client-side.
- Harden endpoints: rate limiting, abuse monitoring, replay protection.
- Plan for key compromise: provide revocation and re-certification flows and log entries that clearly show affected artifacts.
- Plan backup/restore and audit log preservation as part of operations.

---

# Open questions

- Accept multiple signatures per artifact (author + auditor)? Recommended: yes.
- Versioning approach: semantic versioning vs content-hash primary identifier — recommend both for discoverability and canonical identification.
- Artifact retention: store full test artifacts long-term or reference CI artifact storage? (trade-off: reproducibility vs storage cost)
- Public vs private registries: support scoping and access controls for both.

---

# Estimate & priority

- Estimate: M → L for spec + PoC depending on depth of PoC.
- Priority: High — the registry enforces safe publication and distribution for certified components.

---

# References

- `task-1` — Initialize backlog & milestones
- `task-5` — `kiss` workflow spec (certify/publish expectations)
- `task-8` — CI & policy integration
- `task-9` — Signing policy
- `task-10` — Test harness spec (test artifacts & reproducibility)

*End of ticket (draft). Please review and split implementation work into focused, reviewable subtasks.*

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 `REGISTRY_SPEC.md` added to the repo describing the above and linking related tickets.
- [ ] #2 `spec/registry.manifest.schema.yaml` drafted and committed (YAML/JSON schema for manifest).
- [ ] #3 Minimal API doc (OpenAPI/Swagger sketch) committed under `spec/` with example requests/responses for publish/fetch/verify.
- [ ] #4 Publish verification checklist documented and testable.
- [ ] #5 Follow-up tickets created for:
  - PoC registry server (publish + verify + storage),
  - CLI `kiss publish` integration and local pre-checks,
  - API integration tests and sample CI flows.
- [ ] #6 Security considerations and trust modes documented and linked to CI & signing policy tickets.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
# Proposed implementation subtasks

1. Draft `spec/registry.manifest.schema.yaml` (manifest schema + examples).
2. Draft OpenAPI-like API spec (`spec/registry.api.yaml`) with publish/fetch/verify endpoints.
3. Implement a lightweight PoC registry service (containerized) that:
   - accepts publish uploads,
   - verifies hash/signature/tests,
   - stores artifacts in a local content-addressed store,
   - exposes fetch & history endpoints.
4. Add `kiss publish` CLI integration (pre-check locally, then POST to registry).
5. Create automated tests (happy path, signature mismatch, dev artifact rejection, dependency trust failure).
6. Add CI job examples demonstrating release-time verification and publish flow.
7. Research public transparency log integration (future ticket).
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
# Security & operational considerations

- Require TLS + authenticated API tokens for publish endpoints; enforce RBAC for maintainers/publishers.
- Store signer identities but not private keys; signing happens client-side.
- Harden endpoints: rate limiting, abuse monitoring, replay protection.
- Plan for key compromise: provide revocation and re-certification flows and log entries that clearly show affected artifacts.
- Plan backup/restore and audit log preservation as part of operations.

---

# Open questions

- Accept multiple signatures per artifact (author + auditor)? Recommended: yes.
- Versioning approach: semantic versioning vs content-hash primary identifier — recommend both for discoverability and canonical identification.
- Artifact retention: store full test artifacts long-term or reference CI artifact storage? (trade-off: reproducibility vs storage cost)
- Public vs private registries: support scoping and access controls for both.
<!-- SECTION:NOTES:END -->
