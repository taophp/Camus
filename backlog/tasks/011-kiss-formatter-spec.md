---
title: "011 — kiss formatter & canonicalization specification"
status: "To Do"
labels: ["spec","formatter","kiss","tooling"]
assignee: ""
milestone: "Tools (kiss)"
---

# Objective

Define the canonical formatting and serialization rules for Camus source so that:

- formatted source is deterministic and idempotent across platforms,
- the canonical representation is suitable for stable hashing and signing,
- `kiss fmt` provides both `--check` and `--write` behaviors,
- `kiss certify` and CI can rely on `kiss fmt` to guarantee the exact bytes that are signed.

This ticket delivers a reference spec describing formatter behavior, canonicalization rules, hash rules for signing, and acceptance criteria. Implementation tasks will be separate tickets.

---

# Context & constraints

- The project has chosen to sign the normalized source (source-only signing, initial policy).
- Before signing, sources must be canonicalized by `kiss fmt`.
- All documentation and artifacts must be in English.
- The formatter must be usable both locally (developer ergonomics) and in CI (enforcement).

---

# Scope

In scope:
- Specification of the canonical textual form for Camus source.
- Specification of canonicalization rules used to compute `source_hash`.
- CLI behavior for `kiss fmt` (flags, exit codes).
- Required properties (idempotence, determinism, normalization rules).
- Integration requirements for `kiss certify` and CI.

Out of scope (separate tickets):
- Parser implementation details (grammar, tree-sitter).
- Full formatter implementation (to be tracked in follow-ups).
- Signing key management.

---

# High-level behavior of `kiss fmt`

- `kiss fmt --write`: rewrite source files in place to canonical form.
- `kiss fmt --check`: verify files are in canonical form; exit status non-zero on mismatch.
- The formatter is idempotent: applying `kiss fmt --write` on already formatted source is a no-op.
- Formatting is deterministic across OSes and locales (line endings normalized to LF, charset UTF-8).
- Formatter must support a `--dry-run` mode that prints changes without writing (useful in CI and pre-commit hooks).

---

# Canonicalization rules (recommended)

1. Character encoding and line endings
   - Source is UTF-8.
   - Line endings are normalized to LF (`\n`).
   - No trailing whitespace on lines; final newline required at EOF.

2. Whitespace and indentation
   - Indentation is for readability only; it must follow a single canonical style (e.g., 2 or 4 spaces — decide in implementation).
   - Block boundaries are explicit tokens (e.g., `begin`/`end` or braces) — indentation is not semantically significant.

3. Ordering & normalization
   - Within syntactic constructs that are unordered by semantics (e.g., `constraints` fields), define a canonical ordering for deterministic output.
   - Object-like constructs (annotations, metadata) must be serialized in a well-defined order.

4. Minimal canonical form
   - Remove unnecessary syntactic sugar and optional commas/spaces according to canonical grammar.
   - Keep a minimal, clear representation that favors human readability and deterministic parsing.

5. Literal normalization
   - Strings are preserved as-is except for normalization of line endings and escaping per grammar rules.
   - No automatic trimming of semantic whitespace inside string literals — the formatter must not change semantic content.

6. Comments
   - Comments are retained when possible but are not part of the canonical signed payload unless explicitly included in the canonical representation (decision required). Recommend: keep comments for readability but do not rely on them for hashing/signing.

7. Stable hashing policy
   - The canonical bytes of the formatted source (UTF-8 bytes, LF endings) are the basis of `source_hash`.
   - Use SHA-256 for hashing; represent as `sha256:<hex>`.

8. Canonical serializer for hashing (optional)
   - Optionally generate a canonical AST->JSON (canonicalized JSON/JCS) representation for internal verification or future IR-signing. This is a "nice-to-have" and should be considered in a follow-up ticket.

---

# Examples (illustrative)

A small example showing the intended shape (not prescriptive final syntax):

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

Canonical formatter must produce stable, normalized output of the same example (consistent spacing, ordering and line endings).

---

# Integration with signing & certification

- `kiss certify` MUST run `kiss fmt --check` and fail if the check fails.
- Signing happens over the canonical byte sequence produced by `kiss fmt --write` (or an internal canonicalizer that produces the same bytes).
- On certification, `kiss` records `source_hash = sha256(canonical_bytes)` into `kiss.lock` and the human produces the signature over the canonical bytes.
- Any change to the source that modifies canonical bytes invalidates signatures and triggers cascade invalidation for dependents.

---

# Acceptance criteria (DoD)

- [ ] A clear `FORMATTER_SPEC.md` is created or `60-design.md` is updated with these rules.
- [ ] `kiss fmt` CLI contract is documented (`--write`, `--check`, `--dry-run`) and linked from `kiss` workflow spec (ticket `004`).
- [ ] Canonicalization rules cover line endings, encoding, indentation policy, and hashing policy.
- [ ] Idempotence and determinism tests are described (how to test them in CI).
- [ ] An example workflow is documented: `kiss fmt --write` → `kiss test` → `kiss certify`.
- [ ] Follow-up tickets exist to implement:
  - parser/AST (tree-sitter or similar),
  - formatter PoC with idempotence tests,
  - integration into `kiss` CLI (see ticket `010`).

---

# Proposed subtasks

1. Finalize indentation policy (2 vs 4 spaces) and canonical ordering of metadata fields (short task).
2. Draft `FORMATTER_SPEC.md` (detailed rules with examples and canonical byte examples).
3. Implement a minimal parser/AST PoC (separate ticket: parser).
4. Implement a formatter PoC that:
   - formats a set of example files,
   - exposes `--write`, `--check`, `--dry-run`,
   - passes idempotence & determinism tests across OSes.
5. Add CI checks:
   - `kiss fmt --check` on PR,
   - idempotence test (formatting twice is no-op),
   - verify that `source_hash` of formatted file is stable across agents.
6. Add tests that verify hash equality on identical source across platforms (e.g., containerized CI matrix).

---

# Notes, open questions & decisions required

- Should comments be part of the canonical signed payload? (Recommend: not for now — signing should be about semantic code.)
- Decide canonical indentation size.
- Decide whether to produce an auxiliary canonical AST/JSON for signing in addition to formatted text (future extension).
- Confirm policy on ordering of metadata inside blocks and whether that ordering is semantic or cosmetic.

---

# Estimate & priority

- Estimate: M for the spec and PoC.
- Priority: High — formatter is required for stable signing and certification workflows.

---

# References

- Ticket `004` — kiss CLI workflow spec
- Ticket `005` — SPEC skeleton
- Ticket `009` — Test harness & metadata
- Ticket `010` — kiss CLI scaffold (Rust)
- `Camus/conversation.md` (design discussions on formatting, signing and workflow)

---
*End of ticket.*