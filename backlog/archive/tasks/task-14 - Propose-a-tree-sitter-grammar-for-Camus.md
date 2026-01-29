---
id: task-14
title: Propose a tree-sitter grammar for Camus
status: To Do
assignee: []
created_date: ''
updated_date: '2026-01-26 09:39'
labels:
  - spec
  - parser
  - grammar
  - tooling
milestone: m-6
dependencies: []
ordinal: 14000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
# Objective

Propose a first-class Tree‑sitter grammar for Camus and an implementation plan for a practical proof‑of‑concept. The deliverables of this task are:

- a written grammar proposal & rationale (this ticket),
- a small, prioritized implementation plan (PoC steps),
- an agreed set of acceptance tests and node types that the formatter/IR/CLI will rely on.

The grammar should be unambiguous, LLM‑friendly, and enable the downstream tooling (formatter, canonicalizer, `kiss` CLI, test harness, editor integrations).

---

# Rationale

Tree‑sitter provides:

- an incremental, deterministic parser suitable for CLIs, editors and CI;
- a stable AST shape that can be consumed by formatter, IR generator, and verifier;
- standard tooling for syntax highlighting and editor integrations;
- a practical path to implement round-trip parsing/formatting tests.

Constraints aligned with Camus design principles:

- explicit block delimiters to avoid fragile indent-based syntax (prefer `begin`/`end` or clearly visible markers);
- `claim` and `tests` must appear as first-class syntactic constructs;
- parse trees must be deterministic and easy to transform to a canonical payload for hashing/signing.

---

# Design principles & constraints

- Human auditability: code should be easy for a reviewer to read; constructs should be explicit.
- LLM friendliness: prefer explicit tokens and named sections rather than relying on whitespace-sensitive parsing.
- Deterministic parse trees: minimize ambiguous productions and prefer explicit delimiters.
- Minimal core: include `module`, `function`, `claim`, `tests`, `clues`, `example`, `property`, and a compact body statement set.
- Comments preserved for readers but excluded from canonical payload used for signing.

---

# Core tokens / lexemes (proposed)

- Keywords: `module`, `function`, `claim`, `tests`, `clues`, `begin`, `end`, `example`, `property`, `mut`, `let`, `const`, `return`, `import`, `export`
- Punctuation: `(` `)` `->` `:` `,` `;` `[` `]`
- Literals: `STRING` (double-quoted), `NUMBER`, `IDENTIFIER`
- Comments: `//` single-line, `/* ... */` block comments

---

# Example Camus snippets (illustrative)

A minimal `Hello` example:
```/dev/null/examples/hello.camus#L1-16
function Hello() -> Unit
  claim "Print 'Hello, world!' to standard output"
  tests begin
    example {
      input: null
      expected_stdout: "Hello, world!\n"
    }
  end
  begin
    // body: human-audited implementation (pseudo)
  end
```

A small `Inventory` sketch:
```/dev/null/examples/inventory.camus#L1-40
module Inventory
  claim "Manage a simple inventory: add/remove/list items"

function addItem(inv: Array[String], item: String) -> Array[String]
  claim "Return new inventory with item appended"
  tests begin
    example { input: {[], "apple"} expected: {["apple"]} }
    property { seed: 42 description: "count increases by 1" }
  end
  begin
    // Implementation (audited)
  end
```

---

# Grammar sketch (Tree‑sitter style, conceptual)

An initial grammar sketch to illustrate the key rules. This is a starting point for a `grammar.js` implementation:

```/dev/null/tree-sitter/grammar-example.js#L1-60
module.exports = grammar({
  name: 'camus',
  rules: {
    source_file: $ => repeat($._top_level),
    _top_level: $ => choice($.module_decl, $.function_decl, $.import_decl),
    module_decl: $ => seq('module', $.identifier, optional($.claim_block), optional($.block)),
    function_decl: $ => seq(
      'function',
      $.identifier,
      '(',
      optional($.param_list),
      ')',
      optional(seq('->', $.type)),
      optional($.claim_block),
      optional($.tests_block),
      $.block
    ),
    claim_block: $ => seq('claim', choice($.string, $.block)),
    tests_block: $ => seq('tests', $.block),
    clues_block: $ => seq('clues', $.block),
    block: $ => seq('begin', repeat($._block_item), 'end'),
    _block_item: $ => choice($.statement, $.test_case),
    test_case: $ => choice($.example_test, $.property_test),
    example_test: $ => seq('example', $.test_body),
    property_test: $ => seq('property', $.property_body),
    // NOTE: define expressions, statements and literals in detail in PoC
  }
});
```

Guidelines for node names: prefer explicit, stable names (`function_declaration`, `claim_block`, `tests_block`, `example_test`, `property_test`, `block_statement`) — commit `node-types.json` early so tooling can rely on node names.
<!-- SECTION:DESCRIPTION:END -->

# Objective

Propose a first-class Tree‑sitter grammar for Camus and an implementation plan for a practical proof‑of‑concept. The deliverables of this task are:

- a written grammar proposal & rationale (this ticket),
- a small, prioritized implementation plan (PoC steps),
- an agreed set of acceptance tests and node types that the formatter/IR/CLI will rely on.

The grammar should be unambiguous, LLM‑friendly, and enable the downstream tooling (formatter, canonicalizer, `kiss` CLI, test harness, editor integrations).

---

# Rationale

Tree‑sitter provides:

- an incremental, deterministic parser suitable for CLIs, editors and CI;
- a stable AST shape that can be consumed by formatter, IR generator, and verifier;
- standard tooling for syntax highlighting and editor integrations;
- a practical path to implement round-trip parsing/formatting tests.

Constraints aligned with Camus design principles:

- explicit block delimiters to avoid fragile indent-based syntax (prefer `begin`/`end` or clearly visible markers);
- `claim` and `tests` must appear as first-class syntactic constructs;
- parse trees must be deterministic and easy to transform to a canonical payload for hashing/signing.

---

# Design principles & constraints

- Human auditability: code should be easy for a reviewer to read; constructs should be explicit.
- LLM friendliness: prefer explicit tokens and named sections rather than relying on whitespace-sensitive parsing.
- Deterministic parse trees: minimize ambiguous productions and prefer explicit delimiters.
- Minimal core: include `module`, `function`, `claim`, `tests`, `clues`, `example`, `property`, and a compact body statement set.
- Comments preserved for readers but excluded from canonical payload used for signing.

---

# Core tokens / lexemes (proposed)

- Keywords: `module`, `function`, `claim`, `tests`, `clues`, `begin`, `end`, `example`, `property`, `mut`, `let`, `const`, `return`, `import`, `export`
- Punctuation: `(` `)` `->` `:` `,` `;` `[` `]`
- Literals: `STRING` (double-quoted), `NUMBER`, `IDENTIFIER`
- Comments: `//` single-line, `/* ... */` block comments

---

# Example Camus snippets (illustrative)

A minimal `Hello` example:
```/dev/null/examples/hello.camus#L1-16
function Hello() -> Unit
  claim "Print 'Hello, world!' to standard output"
  tests begin
    example {
      input: null
      expected_stdout: "Hello, world!\n"
    }
  end
  begin
    // body: human-audited implementation (pseudo)
  end
```

A small `Inventory` sketch:
```/dev/null/examples/inventory.camus#L1-40
module Inventory
  claim "Manage a simple inventory: add/remove/list items"

function addItem(inv: Array[String], item: String) -> Array[String]
  claim "Return new inventory with item appended"
  tests begin
    example { input: {[], "apple"} expected: {["apple"]} }
    property { seed: 42 description: "count increases by 1" }
  end
  begin
    // Implementation (audited)
  end
```

---

# Grammar sketch (Tree‑sitter style, conceptual)

An initial grammar sketch to illustrate the key rules. This is a starting point for a `grammar.js` implementation:

```/dev/null/tree-sitter/grammar-example.js#L1-60
module.exports = grammar({
  name: 'camus',
  rules: {
    source_file: $ => repeat($._top_level),
    _top_level: $ => choice($.module_decl, $.function_decl, $.import_decl),
    module_decl: $ => seq('module', $.identifier, optional($.claim_block), optional($.block)),
    function_decl: $ => seq(
      'function',
      $.identifier,
      '(',
      optional($.param_list),
      ')',
      optional(seq('->', $.type)),
      optional($.claim_block),
      optional($.tests_block),
      $.block
    ),
    claim_block: $ => seq('claim', choice($.string, $.block)),
    tests_block: $ => seq('tests', $.block),
    clues_block: $ => seq('clues', $.block),
    block: $ => seq('begin', repeat($._block_item), 'end'),
    _block_item: $ => choice($.statement, $.test_case),
    test_case: $ => choice($.example_test, $.property_test),
    example_test: $ => seq('example', $.test_body),
    property_test: $ => seq('property', $.property_body),
    // NOTE: define expressions, statements and literals in detail in PoC
  }
});
```

Guidelines for node names: prefer explicit, stable names (`function_declaration`, `claim_block`, `tests_block`, `example_test`, `property_test`, `block_statement`) — commit `node-types.json` early so tooling can rely on node names.

---

# Acceptance criteria (DoD)

- [ ] Written grammar proposal exists in the repo (this ticket) and is reviewed.
- [ ] A minimal `grammar.js` proof-of-concept repository layout is agreed (`tools/tree-sitter-camus/`).
- [ ] `node-types.json` shape documented and checked‑in for tooling stability.
- [ ] A small parser test suite is defined that parses `examples/hello.camus` and `examples/inventory.camus` with zero parse errors.
- [ ] The grammar explicitly documents forbidden constructs (no nested function declarations; no anonymous functions).
- [ ] Formatter contract: parse tree can be normalized to canonical payload for hashing (`source_hash`) and to a stable textual representation (`kiss fmt`).
- [ ] Follow-up tickets created for implementation steps and editor integrations.

---

# Proposed implementation subtasks (PoC pipeline)

1. Create `tools/tree-sitter-camus/` with an initial `grammar.js` and a `package.json` to build the grammar.
2. Generate and commit `node-types.json` and create a small set of unit tests (parse fixtures).
3. Add a CI job that runs parsing tests against the example files (rejects parse failures).
4. Iterate grammar to ensure the AST supports deterministic formatting & canonicalization: parse → format → parse (round-trip idempotence test).
5. Implement simple tree-to-canonical-JSON serializer as a reference (PoC for canonical payload).
6. Add editor queries for syntax highlighting and a minimal LSP prototype (diagnostics & outline).
7. Document the grammar assumptions and publish an integration guide for `kiss fmt`, `kiss test`, and `kiss certify`.

Each step should be a separate, small backlog ticket with clear acceptance criteria.

---

# Open questions (to resolve before implementation)

- Block delimiters: confirm `begin`/`end` vs `{}`; recommendation: `begin`/`end` for LLM clarity and less punctuation ambiguity.
- Comments: preserve in formatted source but exclude from canonical payload used for signing (recommended).
- String multiline semantics: decide on a robust multiline string literal (e.g., triple-quoted) for long `claim` texts.
- Test case ergonomics: define compact encoding for `example` and `property` tests (`input`, `expected`, `seed`).
- Error recovery: decide how permissive the grammar should be for editor experience (recover from partial input).
- Node field naming: lock small set of canonical field names early for formatter/IR interoperability.

---

# Estimate & priority

- Estimate: M (initial spec + PoC grammar + tests). Full coverage and robust grammar tests: larger.
- Priority: High — the grammar is a prerequisite for formatter and tooling.

---

# References

- Related backlog tickets: `task-6` (SPEC skeleton), `task-10` (test harness spec), `task-11` (KISS CLI scaffold), `task-12` (formatter spec).
- Example files: `Camus/examples/hello.camus`, `Camus/examples/inventory.camus`.
- Tree-sitter docs and common practices for grammar engineering.

---

If you approve this draft, I will split the proposed subtasks into concrete backlog tickets, create the `tools/tree-sitter-camus/` PoC branch, and begin iterating on a minimal `grammar.js` + tests. Please review the open questions (especially `begin`/`end` vs braces and comment handling) and indicate preferred choices so we can lock the baseline for implementation.

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Written grammar proposal exists in the repo (this ticket) and is reviewed.
- [ ] #2 A minimal `grammar.js` proof-of-concept repository layout is agreed (`tools/tree-sitter-camus/`).
- [ ] #3 `node-types.json` shape documented and checked‑in for tooling stability.
- [ ] #4 A small parser test suite is defined that parses `examples/hello.camus` and `examples/inventory.camus` with zero parse errors.
- [ ] #5 The grammar explicitly documents forbidden constructs (no nested function declarations; no anonymous functions).
- [ ] #6 Formatter contract: parse tree can be normalized to canonical payload for hashing (`source_hash`) and to a stable textual representation (`kiss fmt`).
- [ ] #7 Follow-up tickets created for implementation steps and editor integrations.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
# Proposed implementation subtasks (PoC pipeline)

1. Create `tools/tree-sitter-camus/` with an initial `grammar.js` and a `package.json` to build the grammar.
2. Generate and commit `node-types.json` and create a small set of unit tests (parse fixtures).
3. Add a CI job that runs parsing tests against the example files (rejects parse failures).
4. Iterate grammar to ensure the AST supports deterministic formatting & canonicalization: parse → format → parse (round-trip idempotence test).
5. Implement simple tree-to-canonical-JSON serializer as a reference (PoC for canonical payload).
6. Add editor queries for syntax highlighting and a minimal LSP prototype (diagnostics & outline).
7. Document the grammar assumptions and publish an integration guide for `kiss fmt`, `kiss test`, and `kiss certify`.

Each step should be a separate, small backlog ticket with clear acceptance criteria.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
# Open questions (to resolve before implementation)

- Block delimiters: confirm `begin`/`end` vs `{}`; recommendation: `begin`/`end` for LLM clarity and less punctuation ambiguity.
- Comments: preserve in formatted source but exclude from canonical payload used for signing (recommended).
- String multiline semantics: decide on a robust multiline string literal (e.g., triple-quoted) for long `claim` texts.
- Test case ergonomics: define compact encoding for `example` and `property` tests (`input`, `expected`, `seed`).
- Error recovery: decide how permissive the grammar should be for editor experience (recover from partial input).
- Node field naming: lock small set of canonical field names early for formatter/IR interoperability.
<!-- SECTION:NOTES:END -->
