---
id: task-11
title: Scaffold KISS CLI in Rust (skeleton)
status: To Do
assignee: []
created_date: ''
updated_date: '2026-01-23 12:25'
labels:
  - tooling
  - kiss
  - rust
  - cli
milestone: Tools (kiss)
dependencies: []
ordinal: 11000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
# Objective

Create a minimal, reviewable Rust workspace that provides a scaffold for the `kiss` command‑line tool. The scaffold must be opinionated enough to enable safe, incremental feature work (formatter, test runner, build, certify, etc.) while intentionally avoiding early, heavy implementation choices.

This ticket produces a well-structured workspace, a `clap`‑based CLI skeleton with tested stubs, a small sample CI workflow that validates formatting & tests, and a short developer README to onboard contributors.

---

# Scope

In scope:
- Create a Cargo workspace for `kiss` under `tools/kiss/`.
- Add crates:
  - `kiss-cli` (binary crate) — `src/main.rs` with a `clap` derived subcommand surface.
  - helper library crates (stubs): `camus-formatter`, `camus-parser`, `camus-ir` — each with a minimal `README` and placeholder tests.
- Implement a minimal, well-tested CLI surface:
  - global flags: `--version`, `--help`
  - subcommands (stubbed): `init`, `fmt`, `test`, `build`, `certify`, `explain`
  - `init` should support safe behaviour:
    - `kiss init --dry-run` prints the planned scaffold and returns success (no fs changes)
    - `kiss init <target>` creates a minimal `kiss.toon` file (or directory skeleton) for manual verification
  - Other subcommands should return a clear `Not implemented` message and a non-zero exit code (unless explicitly producing a safe stub success for UX reasons).
- Add unit & integration tests validating the CLI surface:
  - `kiss --version` returns 0 and prints version
  - `kiss init --dry-run` prints a known message and returns 0
  - `kiss init <tmpdir>` creates `kiss.toon` (or prints a predictable dry-run output for tests)
- Add a sample GitHub Actions workflow (`.github/workflows/ci.yml`) that runs:
  - `cargo fmt -- --check`
  - `cargo clippy -- -D warnings` (optional, if configured)
  - `cargo test`
- Add a concise `tools/kiss/README.md` documenting how to build, run, and test the scaffold.
- Create follow-up backlog tickets for parser, formatter, IR, `kiss.lock` support, test runner PoC, signing UX, etc.

Out of scope:
- Implementing actual formatting, parsing, IR, signing, or publishing logic.
- Long-running CI or deployment segments — only example configs are required.

---

# Proposed repository layout (illustrative)

```
tools/kiss/
  Cargo.toml               # workspace manifest
  kiss-cli/                # binary crate
    Cargo.toml
    src/main.rs
    src/commands/
      mod.rs
      init.rs
      fmt.rs
      test.rs
      build.rs
      certify.rs
      explain.rs
    tests/
      cli.rs                # integration tests (assert_cmd)
  camus-formatter/         # lib crate (stub)
    Cargo.toml
    src/lib.rs
  camus-parser/            # lib crate (stub)
  camus-ir/                # lib crate (stub)
  README.md
  .github/workflows/ci.yml
```

---

# Recommended dependencies & tooling (initial)

- `clap` (derive) — CLI parsing
- `anyhow` / `thiserror` — ergonomic error handling
- `serde` / `serde_json` (or `serde_yaml`) — for writing sample lock/test artefacts
- `assert_cmd` + `predicates` — CLI integration tests
- `insta` (optional) — snapshot tests for command output
- `ed25519-dalek` (future, for signing PoCs)
- Enforce `rustfmt` and `clippy` in CI

Prefer stable Rust toolchain and keep dependencies small.
<!-- SECTION:DESCRIPTION:END -->

# Objective

Create a minimal, reviewable Rust workspace that provides a scaffold for the `kiss` command‑line tool. The scaffold must be opinionated enough to enable safe, incremental feature work (formatter, test runner, build, certify, etc.) while intentionally avoiding early, heavy implementation choices.

This ticket produces a well-structured workspace, a `clap`‑based CLI skeleton with tested stubs, a small sample CI workflow that validates formatting & tests, and a short developer README to onboard contributors.

---

# Scope

In scope:
- Create a Cargo workspace for `kiss` under `tools/kiss/`.
- Add crates:
  - `kiss-cli` (binary crate) — `src/main.rs` with a `clap` derived subcommand surface.
  - helper library crates (stubs): `camus-formatter`, `camus-parser`, `camus-ir` — each with a minimal `README` and placeholder tests.
- Implement a minimal, well-tested CLI surface:
  - global flags: `--version`, `--help`
  - subcommands (stubbed): `init`, `fmt`, `test`, `build`, `certify`, `explain`
  - `init` should support safe behaviour:
    - `kiss init --dry-run` prints the planned scaffold and returns success (no fs changes)
    - `kiss init <target>` creates a minimal `kiss.toon` file (or directory skeleton) for manual verification
  - Other subcommands should return a clear `Not implemented` message and a non-zero exit code (unless explicitly producing a safe stub success for UX reasons).
- Add unit & integration tests validating the CLI surface:
  - `kiss --version` returns 0 and prints version
  - `kiss init --dry-run` prints a known message and returns 0
  - `kiss init <tmpdir>` creates `kiss.toon` (or prints a predictable dry-run output for tests)
- Add a sample GitHub Actions workflow (`.github/workflows/ci.yml`) that runs:
  - `cargo fmt -- --check`
  - `cargo clippy -- -D warnings` (optional, if configured)
  - `cargo test`
- Add a concise `tools/kiss/README.md` documenting how to build, run, and test the scaffold.
- Create follow-up backlog tickets for parser, formatter, IR, `kiss.lock` support, test runner PoC, signing UX, etc.

Out of scope:
- Implementing actual formatting, parsing, IR, signing, or publishing logic.
- Long-running CI or deployment segments — only example configs are required.

---

# Proposed repository layout (illustrative)

```
tools/kiss/
  Cargo.toml               # workspace manifest
  kiss-cli/                # binary crate
    Cargo.toml
    src/main.rs
    src/commands/
      mod.rs
      init.rs
      fmt.rs
      test.rs
      build.rs
      certify.rs
      explain.rs
    tests/
      cli.rs                # integration tests (assert_cmd)
  camus-formatter/         # lib crate (stub)
    Cargo.toml
    src/lib.rs
  camus-parser/            # lib crate (stub)
  camus-ir/                # lib crate (stub)
  README.md
  .github/workflows/ci.yml
```

---

# Recommended dependencies & tooling (initial)

- `clap` (derive) — CLI parsing
- `anyhow` / `thiserror` — ergonomic error handling
- `serde` / `serde_json` (or `serde_yaml`) — for writing sample lock/test artefacts
- `assert_cmd` + `predicates` — CLI integration tests
- `insta` (optional) — snapshot tests for command output
- `ed25519-dalek` (future, for signing PoCs)
- Enforce `rustfmt` and `clippy` in CI

Prefer stable Rust toolchain and keep dependencies small.

---

# Acceptance criteria (Definition of Done)

- [ ] A workspace exists at `tools/kiss/` with `kiss-cli` and the helper crates (`camus-formatter`, `camus-parser`, `camus-ir`) as members.
- [ ] `kiss-cli` implements the basic CLI surface (using `clap`) and stubs for the subcommands: `init`, `fmt`, `test`, `build`, `certify`, `explain`.
- [ ] Subcommand behaviour:
  - `kiss --version` prints the CLI version and exits `0`.
  - `kiss init --dry-run` prints the intended scaffold and exits `0`.
  - `kiss init <target>` creates a minimal `kiss.toon` (or writes a short skeleton file) when invoked in a test, or clearly documents how to run in dry-run mode.
  - Unimplemented commands yield a clear "Not implemented" message and non-zero exit code.
- [ ] Integration tests exist (using `assert_cmd`) covering the above behaviours.
- [ ] `tools/kiss/README.md` documents how to build, test, and run the CLI.
- [ ] `.github/workflows/ci.yml` sample added to run `cargo fmt -- --check` and `cargo test`.
- [ ] Follow-up tickets are created and referenced from this ticket: parser, formatter, IR, `kiss.lock` writer/reader, test-runner PoC, signing UX & key-management research.
- [ ] Pull requests referencing this ticket implement only the scaffold and include tests & CI changes; maintainers have reviewed the PR.

---

# Proposed subtasks

1. Create workspace & crates:
   - Add `tools/kiss/Cargo.toml` (workspace)
   - Create directories & minimal `Cargo.toml` for `kiss-cli` and helper crates
2. Implement CLI skeleton in `kiss-cli` using `clap`:
   - Implement `--version`, `--help`, and the listed subcommands as stubs
   - Implement `init --dry-run` and `init <target>` behaviour
3. Add integration tests using `assert_cmd` and `predicates`
4. Add `tools/kiss/README.md` with developer instructions
5. Add `.github/workflows/ci.yml` sample that runs `cargo fmt -- --check` and `cargo test`
6. Create follow-up backlog tickets (small, focused):
   - parser implementation
   - formatter implementation
   - `kiss test` PoC
   - `kiss.lock` schema & writer
   - signing UX & key management
   - registry / publish PoC (as needed)

---

# Notes & implementation guidance

- Keep the scaffold minimal and heavily tested — the main value is a stable, reviewed starting point.
- Use `clap` (v3/v4) derive macros to ensure consistent help & flag semantics.
- Structure commands with one file/module per command for easy extension.
- For unimplemented commands prefer an exit code `1` and message `Not implemented — see <ticket>`; include the corresponding `task-` id in the message where applicable.
- Ensure tests are hermetic and do not depend on network or external state.
- Document next steps and expected follow-up tickets in the README and in the ticket description.

---

# Risks & mitigations

- Risk: design drift between the CLI spec (`task-5`) and the scaffold implementation.
  - Mitigation: reference `task-5` in PRs and require maintainers to validate CLI surface against the spec.
- Risk: over-engineering early (too many crates or abstractions).
  - Mitigation: keep helpers light-weight stubs; add complexity only when a clear, ticketed need appears.

---

# Estimate & priority

- Estimate: M (scaffold + tests + sample CI)
- Priority: High — establishes the foundation for the `kiss` toolchain and subsequent PoCs.

---

# References

- `task-5` — Define KISS CLI workflow and behavior (draft)
- `task-6` — SPEC skeleton
- `task-7` — Examples: Hello & Inventory
- `task-8` — CI and Policy Integration

*This ticket is the precondition for subsequent, small, focused implementation tickets. Implement incrementally and create follow-ups for each feature.*

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A workspace exists at `tools/kiss/` with `kiss-cli` and the helper crates (`camus-formatter`, `camus-parser`, `camus-ir`) as members.
- [ ] #2 `kiss-cli` implements the basic CLI surface (using `clap`) and stubs for the subcommands: `init`, `fmt`, `test`, `build`, `certify`, `explain`.
- [ ] #3 Subcommand behaviour:
  - `kiss --version` prints the CLI version and exits `0`.
  - `kiss init --dry-run` prints the intended scaffold and exits `0`.
  - `kiss init <target>` creates a minimal `kiss.toon` (or writes a short skeleton file) when invoked in a test, or clearly documents how to run in dry-run mode.
  - Unimplemented commands yield a clear "Not implemented" message and non-zero exit code.
- [ ] #4 Integration tests exist (using `assert_cmd`) covering the above behaviours.
- [ ] #5 `tools/kiss/README.md` documents how to build, test, and run the CLI.
- [ ] #6 `.github/workflows/ci.yml` sample added to run `cargo fmt -- --check` and `cargo test`.
- [ ] #7 Follow-up tickets are created and referenced from this ticket: parser, formatter, IR, `kiss.lock` writer/reader, test-runner PoC, signing UX & key-management research.
- [ ] #8 Pull requests referencing this ticket implement only the scaffold and include tests & CI changes; maintainers have reviewed the PR.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
# Proposed subtasks

1. Create workspace & crates:
   - Add `tools/kiss/Cargo.toml` (workspace)
   - Create directories & minimal `Cargo.toml` for `kiss-cli` and helper crates
2. Implement CLI skeleton in `kiss-cli` using `clap`:
   - Implement `--version`, `--help`, and the listed subcommands as stubs
   - Implement `init --dry-run` and `init <target>` behaviour
3. Add integration tests using `assert_cmd` and `predicates`
4. Add `tools/kiss/README.md` with developer instructions
5. Add `.github/workflows/ci.yml` sample that runs `cargo fmt -- --check` and `cargo test`
6. Create follow-up backlog tickets (small, focused):
   - parser implementation
   - formatter implementation
   - `kiss test` PoC
   - `kiss.lock` schema & writer
   - signing UX & key management
   - registry / publish PoC (as needed)
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
- Keep the scaffold minimal and heavily tested — the main value is a stable, reviewed starting point.
- Use `clap` (v3/v4) derive macros to ensure consistent help & flag semantics.
- Structure commands with one file/module per command for easy extension.
- For unimplemented commands prefer an exit code `1` and message `Not implemented — see <ticket>`; include the corresponding `task-` id in the message where applicable.
- Ensure tests are hermetic and do not depend on network or external state.
- Document next steps and expected follow-up tickets in the README and in the ticket description.
<!-- SECTION:NOTES:END -->
