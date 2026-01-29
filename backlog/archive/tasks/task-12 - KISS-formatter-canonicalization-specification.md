---
id: task-12
title: KISS formatter & canonicalization specification
status: To Do
assignee: []
created_date: ''
updated_date: '2026-01-26 09:37'
labels:
  - spec
  - formatter
  - canonicalization
  - kiss
  - tooling
milestone: m-2
dependencies: []
ordinal: 12000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
# Objective

Define a precise, testable, and implementable specification for the `kiss` formatter and the canonicalization rules used for signing and verification.

Goals:
- Produce a deterministic, idempotent formatter (`kiss fmt`) that is usable locally and in CI.
- Define an unambiguous algorithm for computing the canonical bytes used as the basis for signing (`source_hash`).
- Provide clear acceptance tests, a migration/versioning plan, and an implementation-ready checklist for PoCs.

# Context & constraints

- Signing is performed over canonical data derived from source. The canonicalization algorithm must be clearly documented and deterministic.
- The formatter must be idempotent: running `kiss fmt --write` repeatedly must produce identical bytes.
- All files and artifacts must be UTF‑8 encoded. Platform differences (line endings, locales) must not affect canonical bytes.
- Documentation and example artifacts must be in English.

# CLI contract

`kiss fmt` must implement at least:

- `kiss fmt --write [paths...]` — rewrite files in place to canonical form. If no paths given, format repository source files by convention.
- `kiss fmt --check [paths...]` — check whether files are canonical; exit code `0` on success, non-zero if any file is not canonical.
- `kiss fmt --dry-run [paths...]` — print the diff or planned changes without writing.
- `kiss fmt --version` — print formatter tool version (used in `kiss.lock` metadata).

Behavior notes:
- `--check` must be fast and deterministic.
- `--write` must preserve non-semantic content where possible (e.g., non-significant comments) but guarantee canonical textual output.
- Implementations must provide stable output across OSes and runs.

# Canonicalization principles

The canonicalization algorithm must satisfy the following properties:

- Deterministic: same logical source always yields identical canonical bytes.
- Idempotent: canonicalization applied multiple times yields identical result.
- Semantics-preserving: canonicalization must not change the program semantics.
- Comment policy: comments are preserved in formatted files for humans but must not affect the canonical payload used for signing (see "signed payload" below).
- Unicode normalization: normalize text to NFC before any other processing.
- Line endings: normalize to LF (`\n`) for both formatted output and canonical payloads.
- Charset: use UTF-8 only.

# Signed payload vs formatted text

We distinguish two artifacts:

1. Formatted text — the human-facing output written by `kiss fmt --write`. It is intended to be readable and preserved in the repository.

2. Canonical payload bytes — the deterministic byte sequence computed from the AST/normalized representation used to calculate `source_hash` and to sign. This payload:
   - Must exclude non-semantic data (comments, formatting-only whitespace that does not change structure).
   - Must follow a strict canonical serializer (see "Canonical serializer" below).
   - Is what `kiss certify` signs and records hash/signature of.

Rationale: It keeps human edits and comments orthogonal to cryptographic attestation.

# Canonical serializer

Implementations of the canonical payload must:

- Parse source into a well-defined AST.
- Apply deterministic normalizations:
  - Normalize ordering of unordered collections (sort by key).
  - Collapse semantically equivalent syntactic variants to the same representation.
  - Remove comments and non-semantic whitespace.
  - Normalize identifiers consistently (no case folding unless language specifies).
- Serialize the normalized representation into a canonical JSON-like format using a deterministic encoding (recommendation: JCS — JSON Canonicalization Scheme — or equivalent).
- Compute SHA‑256 over the canonical bytes and represent as `sha256:<hex>`.

Notes:
- Using a canonical AST-to-JSON minimizes accidental divergence between implementations.
- The canonical format must be versioned (see "Versioning & migration").

# Example (illustrative)

Formatted source (human-facing):
```/dev/null/example.camus#L1-12
function sortList(list: Array[Int]) -> Array[Int]
  claim "Return a stable sorted list containing the same elements"
  tests {
    example [3,1,2] => [1,2,3]
    property "is_sorted"
  }
  {
    // body (human-audited)
  }
```

Canonical payload (conceptual — produced after parsing and removing comments, ordering, canonical JSON):
```/dev/null/example.canonical.json#L1-10
{
  "kind": "function",
  "name": "sortList",
  "params": [{"name":"list","type":"Array[Int]"}],
  "return": "Array[Int]",
  "claim": "Return a stable sorted list containing the same elements",
  "tests": [
    {"id":"example-1","type":"example","input":[3,1,2],"expected":[1,2,3]},
    {"id":"property-1","type":"property","name":"is_sorted"}
  ],
  "body": "..."
}
```

`source_hash = sha256` of the canonical JSON bytes.

# Hashing & signing policy

- Hash algorithm: SHA‑256; represent as `sha256:<hex>`.
- `kiss certify` must:
  - Run `kiss fmt --check` (or `--write` as part of an explicit certification flow).
  - Produce canonical payload bytes from the formatted source (per canonicalizer).
  - Compute `source_hash` and write it into `kiss.lock`.
  - The human signs the canonical payload bytes; signatures are recorded in `kiss.lock` with `signer_id`, `signed_at`, and `kiss_version`.
- `kiss verify` validates:
  - formatting (via canonicalizer equivalence),
  - `source_hash` matches computed canonical bytes,
  - signatures validate against recorded payloads.

# Versioning & migration

- Add a `canonicalization_version` (integer or semver-like) and `formatter_version` fields to `kiss.lock` entries.
- If canonicalization rules change, increment `canonicalization_version`. Provide migration tooling that can:
  - Recompute canonical payloads for previously signed artifacts and flag whether signatures remain valid.
  - Provide a "migration report" that lists artifacts requiring re-certification.
<!-- SECTION:DESCRIPTION:END -->

# Objective

Define a precise, testable, and implementable specification for the `kiss` formatter and the canonicalization rules used for signing and verification.

Goals:
- Produce a deterministic, idempotent formatter (`kiss fmt`) that is usable locally and in CI.
- Define an unambiguous algorithm for computing the canonical bytes used as the basis for signing (`source_hash`).
- Provide clear acceptance tests, a migration/versioning plan, and an implementation-ready checklist for PoCs.

# Context & constraints

- Signing is performed over canonical data derived from source. The canonicalization algorithm must be clearly documented and deterministic.
- The formatter must be idempotent: running `kiss fmt --write` repeatedly must produce identical bytes.
- All files and artifacts must be UTF‑8 encoded. Platform differences (line endings, locales) must not affect canonical bytes.
- Documentation and example artifacts must be in English.

# CLI contract

`kiss fmt` must implement at least:

- `kiss fmt --write [paths...]` — rewrite files in place to canonical form. If no paths given, format repository source files by convention.
- `kiss fmt --check [paths...]` — check whether files are canonical; exit code `0` on success, non-zero if any file is not canonical.
- `kiss fmt --dry-run [paths...]` — print the diff or planned changes without writing.
- `kiss fmt --version` — print formatter tool version (used in `kiss.lock` metadata).

Behavior notes:
- `--check` must be fast and deterministic.
- `--write` must preserve non-semantic content where possible (e.g., non-significant comments) but guarantee canonical textual output.
- Implementations must provide stable output across OSes and runs.

# Canonicalization principles

The canonicalization algorithm must satisfy the following properties:

- Deterministic: same logical source always yields identical canonical bytes.
- Idempotent: canonicalization applied multiple times yields identical result.
- Semantics-preserving: canonicalization must not change the program semantics.
- Comment policy: comments are preserved in formatted files for humans but must not affect the canonical payload used for signing (see "signed payload" below).
- Unicode normalization: normalize text to NFC before any other processing.
- Line endings: normalize to LF (`\n`) for both formatted output and canonical payloads.
- Charset: use UTF-8 only.

# Signed payload vs formatted text

We distinguish two artifacts:

1. Formatted text — the human-facing output written by `kiss fmt --write`. It is intended to be readable and preserved in the repository.

2. Canonical payload bytes — the deterministic byte sequence computed from the AST/normalized representation used to calculate `source_hash` and to sign. This payload:
   - Must exclude non-semantic data (comments, formatting-only whitespace that does not change structure).
   - Must follow a strict canonical serializer (see "Canonical serializer" below).
   - Is what `kiss certify` signs and records hash/signature of.

Rationale: It keeps human edits and comments orthogonal to cryptographic attestation.

# Canonical serializer

Implementations of the canonical payload must:

- Parse source into a well-defined AST.
- Apply deterministic normalizations:
  - Normalize ordering of unordered collections (sort by key).
  - Collapse semantically equivalent syntactic variants to the same representation.
  - Remove comments and non-semantic whitespace.
  - Normalize identifiers consistently (no case folding unless language specifies).
- Serialize the normalized representation into a canonical JSON-like format using a deterministic encoding (recommendation: JCS — JSON Canonicalization Scheme — or equivalent).
- Compute SHA‑256 over the canonical bytes and represent as `sha256:<hex>`.

Notes:
- Using a canonical AST-to-JSON minimizes accidental divergence between implementations.
- The canonical format must be versioned (see "Versioning & migration").

# Example (illustrative)

Formatted source (human-facing):
```/dev/null/example.camus#L1-12
function sortList(list: Array[Int]) -> Array[Int]
  claim "Return a stable sorted list containing the same elements"
  tests {
    example [3,1,2] => [1,2,3]
    property "is_sorted"
  }
  {
    // body (human-audited)
  }
```

Canonical payload (conceptual — produced after parsing and removing comments, ordering, canonical JSON):
```/dev/null/example.canonical.json#L1-10
{
  "kind": "function",
  "name": "sortList",
  "params": [{"name":"list","type":"Array[Int]"}],
  "return": "Array[Int]",
  "claim": "Return a stable sorted list containing the same elements",
  "tests": [
    {"id":"example-1","type":"example","input":[3,1,2],"expected":[1,2,3]},
    {"id":"property-1","type":"property","name":"is_sorted"}
  ],
  "body": "..."
}
```

`source_hash = sha256` of the canonical JSON bytes.

# Hashing & signing policy

- Hash algorithm: SHA‑256; represent as `sha256:<hex>`.
- `kiss certify` must:
  - Run `kiss fmt --check` (or `--write` as part of an explicit certification flow).
  - Produce canonical payload bytes from the formatted source (per canonicalizer).
  - Compute `source_hash` and write it into `kiss.lock`.
  - The human signs the canonical payload bytes; signatures are recorded in `kiss.lock` with `signer_id`, `signed_at`, and `kiss_version`.
- `kiss verify` validates:
  - formatting (via canonicalizer equivalence),
  - `source_hash` matches computed canonical bytes,
  - signatures validate against recorded payloads.

# Versioning & migration

- Add a `canonicalization_version` (integer or semver-like) and `formatter_version` fields to `kiss.lock` entries.
- If canonicalization rules change, increment `canonicalization_version`. Provide migration tooling that can:
  - Recompute canonical payloads for previously signed artifacts and flag whether signatures remain valid.
  - Provide a "migration report" that lists artifacts requiring re-certification.

# Tests & acceptance criteria (DoD)

- [ ] `FORMATTER_SPEC.md` created (a human-readable, machine-actionable specification).
- [ ] `kiss fmt` CLI contract documented and tests exist demonstrating `--check`, `--write`, `--dry-run`.
- [ ] A canonical serializer specification exists (JCS or equivalent) with at least one reference implementation or PoC.
- [ ] Idempotence tests:
  - Formatting the same file twice yields identical output.
  - `kiss fmt --check` passes after a `--write`.
- [ ] Determinism tests:
  - The canonical payload hash is stable across platforms and repeated runs on the same logically identical source.
- [ ] Integration tests:
  - `kiss certify` records `source_hash` equal to canonical payload hash.
  - `kiss verify` rejects modified sources that change canonical hash (even if comments only).
- [ ] Cross-version tests:
  - Demonstrate behavior when `canonicalization_version` changes (migration tests and guidance exist).
- [ ] A compatibility plan for existing commits is documented (how to bring a repository to a canonicalized state).

# Proposed subtasks (implementation plan)

1. Finalize decisions and record them in `FORMATTER_SPEC.md`:
   - indentation (recommendation: 2 spaces; finalize by consensus),
   - comment handling (preserved in formatted text; excluded from canonical payload),
   - Unicode normalization (NFC).
2. Implement a parser/AST PoC (prefer tree-sitter grammar + small evaluator).
3. Implement a canonical serializer PoC that outputs JCS JSON from AST.
4. Implement `kiss fmt` PoC in `tools/kiss` (Rust), add `--check`, `--write`, `--dry-run`.
5. Add test matrix (idempotence and determinism) to CI (GitHub Actions sample).
6. Add `kiss certify` integration: compute canonical payload and record `source_hash` & `canonicalization_version`.
7. Provide migration tooling & documentation for repo maintainers.

# Risks & mitigations

- Risk: Divergence between multiple formatter implementations.
  - Mitigation: Provide canonical serializer spec, test vectors, and a shared test suite (golden files).
- Risk: Comments change signature unintentionally if included in signed payload.
  - Mitigation: Exclude comments from canonical payload; store them only in formatted text.
- Risk: People manually edit formatted files and introduce non-significant drift.
  - Mitigation: `kiss fmt --check` in PRs and pre-commit/CI enforcement.

# Open questions for decision

- Indentation: 2 spaces recommended. Confirm and lock in `FORMATTER_SPEC.md`.
- Comments: confirm policy to exclude from canonical payload (recommended).
- Metadata ordering: define per-construct explicit ordering rules (alphabetic by key vs semantic order).
- Should we publish an explicit canonical AST schema (YAML/JSON schema)? (recommended)

# References

- `task-5` — KISS CLI workflow and behavior (top-level command expectations)
- `task-6` — SPEC skeleton (scope & governance)
- `task-11` — KISS CLI scaffold (Rust implementation layout)
- Implementation notes: use canonical JSON (JCS) for payload stability and cross-language interoperability

---

*When this specification is accepted, proceed with the minimal PoC implementation tasks (parser, canonicalizer, formatter), add test vectors to the repository, and include `kiss fmt --check` in the CI baseline checks.*

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 `FORMATTER_SPEC.md` created (a human-readable, machine-actionable specification).
- [ ] #2 `kiss fmt` CLI contract documented and tests exist demonstrating `--check`, `--write`, `--dry-run`.
- [ ] #3 A canonical serializer specification exists (JCS or equivalent) with at least one reference implementation or PoC.
- [ ] #4 Idempotence tests:
  - Formatting the same file twice yields identical output.
  - `kiss fmt --check` passes after a `--write`.
- [ ] #5 Determinism tests:
  - The canonical payload hash is stable across platforms and repeated runs on the same logically identical source.
- [ ] #6 Integration tests:
  - `kiss certify` records `source_hash` equal to canonical payload hash.
  - `kiss verify` rejects modified sources that change canonical hash (even if comments only).
- [ ] #7 Cross-version tests:
  - Demonstrate behavior when `canonicalization_version` changes (migration tests and guidance exist).
- [ ] #8 A compatibility plan for existing commits is documented (how to bring a repository to a canonicalized state).
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
# Proposed subtasks (implementation plan)

1. Finalize decisions and record them in `FORMATTER_SPEC.md`:
   - indentation (recommendation: 2 spaces; finalize by consensus),
   - comment handling (preserved in formatted text; excluded from canonical payload),
   - Unicode normalization (NFC).
2. Implement a parser/AST PoC (prefer tree-sitter grammar + small evaluator).
3. Implement a canonical serializer PoC that outputs JCS JSON from AST.
4. Implement `kiss fmt` PoC in `tools/kiss` (Rust), add `--check`, `--write`, `--dry-run`.
5. Add test matrix (idempotence and determinism) to CI (GitHub Actions sample).
6. Add `kiss certify` integration: compute canonical payload and record `source_hash` & `canonicalization_version`.
7. Provide migration tooling & documentation for repo maintainers.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
# Risks & mitigations

- Risk: Divergence between multiple formatter implementations.
  - Mitigation: Provide canonical serializer spec, test vectors, and a shared test suite (golden files).
- Risk: Comments change signature unintentionally if included in signed payload.
  - Mitigation: Exclude comments from canonical payload; store them only in formatted text.
- Risk: People manually edit formatted files and introduce non-significant drift.
  - Mitigation: `kiss fmt --check` in PRs and pre-commit/CI enforcement.

# Open questions for decision

- Indentation: 2 spaces recommended. Confirm and lock in `FORMATTER_SPEC.md`.
- Comments: confirm policy to exclude from canonical payload (recommended).
- Metadata ordering: define per-construct explicit ordering rules (alphabetic by key vs semantic order).
- Should we publish an explicit canonical AST schema (YAML/JSON schema)? (recommended)
<!-- SECTION:NOTES:END -->
