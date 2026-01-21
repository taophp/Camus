---
title: "010 — Scaffold `kiss` CLI in Rust (skeleton)"
status: "To Do"
labels: ["tooling","kiss","rust","cli"]
assignee: ""
milestone: "Tools (kiss)"
---

# Objective

Create a minimal, reviewable Rust workspace that provides a scaffold for the `kiss` command-line tool. The purpose of this ticket is to create a safe, well-structured skeleton (repository layout, workspace Cargo.toml, one binary crate `kiss` with subcommand layout, and a few basic unit/integration tests) so that subsequent feature work (formatter, test runner, build, certify, etc.) can be implemented as follow-up tickets.

This ticket does NOT implement full functionality; it only establishes the repository structure, a `clap`-based command parser with stub handlers, tests to validate the CLI surface, and a CI stub that runs `cargo fmt --check` and `cargo test`.

# Scope

In scope:
- Create a Cargo workspace for `kiss` under `tools/kiss` (or equivalent agreed location).
- Add crates:
  - `kiss-cli` (binary crate) — `src/main.rs` with `clap`-derived subcommands.
  - helper crates (libraries): `camus-formatter`, `camus-parser`, `camus-ir` (empty stubs with README & tests).
- Implement minimal, well-tested CLI surface:
  - `kiss --version`
  - `kiss help`
  - `kiss init` (stub: creates a minimal `kiss.toon` in a target directory)
  - add placeholder subcommands (`fmt`, `test`, `build`, `certify`, `explain`) that currently return success or a clear "not implemented" message.
- Add unit tests for the CLI (e.g., `kiss --version` and `kiss init` behavior).
- Provide a small example GitHub Actions workflow (`.github/workflows/ci.yml`) that runs `cargo fmt --check` and `cargo test`.
- Add a concise `README` for the `tools/kiss` workspace describing how to build, test, and run the CLI.
- Create follow-up tickets for parser, formatter, IR, lockfile writer, and signing integration.

Out of scope:
- Implementing production formatting or parsing logic.
- Implementing real signing, publishing, registry interactions, or full certification flows.
- Creating production-grade CI infra beyond a sample workflow.

# Proposed repository layout (illustrative)

```/dev/null/kiss-workspace-structure#L1-14
tools/kiss/
  Cargo.toml               # workspace manifest
  kiss-cli/                # binary crate (main CLI)
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
      cli.rs                # integration tests for CLI surface
  camus-formatter/         # library crate (stub)
    Cargo.toml
    src/lib.rs
  camus-parser/            # library crate (stub)
  camus-ir/                # library crate (stub)
  README.md
  .github/workflows/ci.yml
```

# Recommended dependencies & tooling (initial)
- `clap` (derive) — CLI argument parsing
- `anyhow` or `thiserror` — error handling
- `serde` / `serde_json` or `serde_yaml` — for test metadata & lockfile stubs
- `assert_cmd` / `predicates` — for CLI integration tests
- `ed25519-dalek` later (for signing) — *not required in the scaffold*
- Follow stable Rust toolchain; include `rustfmt` and `clippy` in CI

# Acceptance criteria (Definition of Done)

- [ ] A workspace exists at `tools/kiss/` with `kiss-cli` and the three helper crates (formatter/parser/ir) as members.
- [ ] `kiss-cli` implements the basic CLI surface with `clap` and the following subcommands stubbed: `init`, `fmt`, `test`, `build`, `certify`, `explain`. Each subcommand returns a clear message or success exit code when invoked.
- [ ] Integration tests cover at least:
  - `kiss --version` prints version and returns exit code 0
  - `kiss init <target>` produces an expected skeleton file (`kiss.toon`) in `<target>` or prints the expected message in dry-run mode
- [ ] `README.md` exists in `tools/kiss/` documenting build, test, and run instructions.
- [ ] A sample CI config is added under `.github/workflows/ci.yml` that runs `cargo fmt --check` and `cargo test` for the workspace (example only).
- [ ] Follow-up tickets are created and linked from this ticket: parser, formatter, IR, lockfile writer, signing UX, and the `kiss` PoC test runner.
- [ ] All changes are implemented only after the ticket is accepted and the PR references this ticket (ensures traceability).

# Proposed subtasks (to create as separate tickets if needed)
1. Create workspace & crates: `tools/kiss/Cargo.toml`, `kiss-cli`, `camus-formatter`, `camus-parser`, `camus-ir`. Add basic README files.
2. Implement CLI skeleton in `kiss-cli` using `clap` with stubs for commands and unit/integration tests.
3. Add integration tests using `assert_cmd` to verify CLI parsing and basic behavior.
4. Add sample GitHub Actions workflow `.github/workflows/ci.yml` running `cargo fmt --check` and `cargo test`.
5. Write small developer README with instructions to build and test locally.
6. Create separate tickets for parser implementation, formatter implementation, IR schema, test-run PoC, locking/writing `kiss.lock`, and signing workflow.

# Notes & Implementation guidance
- Keep code minimal and well-documented; emphasize tests for the CLI surface so follow-up features can be implemented safely.
- Use `clap` derive macros for consistent help and version output. Structure commands as submodules (one file per command).
- Stubs must fail fast with explicit "Not implemented" messages (exit code ≠ 0) for commands that are not implemented, except for `init` which should support a safe `--dry-run` mode or create a minimal skeleton file to validate the workflow.
- Ensure the `kiss-cli` crate includes a small test harness to exercise the public binary via integration tests (spawn process and assert outputs).
- Keep follow-up tickets small and focused; each feature (formatter, parser, test-runner) gets its own ticket and acceptance criteria.

# Risks & Mitigations
- Risk: design drift between CLI spec and `kiss` behavior (keep the CLI spec ticket `004` synchronized and referenced from PRs).
- Risk: over-engineering early (avoid adding complex crates until the SPEC and `60-design.md` decisions are finalized).
- Mitigation: the scaffold remains intentionally minimal and well-tested; further features require explicit ticketing and review.

# Estimate & Priority
- Estimate: M (scaffold + tests + sample CI)
- Priority: High — provides the foundation for the rest of the tooling and aligns with the decision to implement in Rust.

# References
- Ticket `004` — `kiss` workflow specification (behavior & commands)
- Ticket `005` — SPEC skeleton
- Ticket `001` — vocabulary (claims, tests, clues)
- Project README and `60-design.md` (when drafted)

---
*This ticket is the precondition for subsequent, granular implementation tickets. No functional implementation beyond the skeleton and tests should be merged without a corresponding ticket and PR referencing it.*