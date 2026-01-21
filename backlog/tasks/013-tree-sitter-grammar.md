---
title: "013 — Propose a tree-sitter grammar for Camus"
status: "To Do"
labels: ["spec","parser","grammar","tooling"]
assignee: ""
milestone: "Syntax exploration"
---

# Objective

Propose a first-class Tree-sitter grammar for Camus and a small plan to produce a working proof-of-concept. The grammar should be unambiguous, friendly to both humans and LLMs, and enable the tooling we plan to build next (formatter, parser, `kiss` tooling, LSP/highlighting, canonicalization for signing and hashing).

This ticket defines design goals, a recommended structure for the grammar, a short example snippet, acceptance criteria, and proposed follow-up tasks for implementation and validation.

---

# Rationale

Tree-sitter gives us:
- a robust, incremental parser we can use in CLIs, editors, and CI,
- deterministic parse trees that are easy to transform (formatter, IR generator),
- straightforward syntax highlighting and editor integration,
- an ability to verify ambiguous cases early and produce well-structured ASTs for `kiss` tooling.

Design constraints aligned with Camus philosophy:
- explicit block delimiters (avoid significance of indentation),
- minimal nesting (no nested function declarations; functions are top-level entities),
- no anonymous functions or local function declarations,
- `claim` blocks (and tests) are structural, first-grade citizens that appear directly in the AST,
- canonical formatting is possible from the parse tree (deterministic output).

We should prefer explicit textual block markers (e.g., `begin` / `end`) rather than relying on indentation to make generation and LLM-assisted parsing more robust.

---

# Design principles & constraints

- Human readability and auditability first: every construct should be easy to identify in the source.
- LLM friendliness: prefer explicit tokens (`begin`/`end`, named sections) that are unambiguous when serialized.
- Deterministic parse trees: the grammar must avoid ambiguous productions.
- Minimal but expressive enough: include claims, tests (examples & property tests with seeds), clues, module and function definitions, and a simple statement set for bodies.
- The grammar should enable the formatter to produce a single canonical textual representation.

---

# Proposed core tokens / lexemes

- Keywords: `module`, `function`, `claim`, `tests`, `clues`, `begin`, `end`, `example`, `property`, `mut`, `let`, `const`, `return`
- Punctuation: `(` `)` `->` `:` `,` `{` `}` (mostly for internal use; prefer `begin`/`end` for blocks)
- Literals: `STRING` (double quotes), `NUMBER`, `IDENTIFIER`
- Comments: `//` line comment, `/* ... */` block comments

---

# Example Camus snippets (illustrative)

Minimal `Hello` example:

```/dev/null/examples/hello.camus#L1-12
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

Small `Inventory` sketch (illustrative):

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

# Grammar sketch (tree-sitter style, illustrative only)

Below is a small, high-level sketch showing how rules map to constructs. This is a starting point for a proper `grammar.js` for tree-sitter.

```/dev/null/tree-sitter/grammar-example.js#L1-60
module.exports = grammar({
  name: 'camus',
  rules: {
    source_file: $ => repeat($._top_level),
    _top_level: $ => choice($.module_decl, $.function_decl, $.import_decl),
    module_decl: $ => seq('module', $.identifier, optional($.claim_block), $.block),
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
    block: $ => seq('begin', repeat($._block_item), 'end'),
    _block_item: $ => choice($.statement, $.test_case),
    test_case: $ => choice($.example_test, $.property_test),
    example_test: $ => seq('example', $.test_body),
    property_test: $ => seq('property', $.property_body),
    // ... expressions, calls, assignments, conditionals
  }
});
```

Node type naming should be explicit and consistent (`function_declaration`, `claim_block`, `tests_block`, `example_test`, `property_test`, `body_statement`, ...). `node-types.json` should be generated and checked into the repository.

---

# Acceptance criteria (DoD)

- [ ] A written grammar proposal exists in the repo (this ticket) and is agreed as the baseline for implementation.
- [ ] The grammar drafts a small set of node types and a minimal tree shape for the top-level constructs (`module`, `function`, `claim`, `tests`, `clues`, `block`, `test_case`).
- [ ] The grammar explicitly disallows nested function declarations and anonymous functions (these rules are documented).
- [ ] A follow-up implementation ticket is created to add a Tree-sitter `grammar.js` and basic `node-types.json`.
- [ ] A minimal test-suite plan is defined showing how the grammar will be validated against `examples/hello.camus` and `examples/inventory.camus`.
- [ ] The grammar proposal documents how the parse tree will enable deterministic formatting and `source_hash` computation (formatter contract).
- [ ] Open design questions are listed and assigned to follow-up tickets (see below).

---

# Proposed subtasks (implementation pipeline)

1. Create `tools/tree-sitter-camus/` with an initial `grammar.js` file (PoC).
2. Add `node-types.json` (generated from the grammar) and commit it for stable tooling.
3. Add a minimal test harness that parses `examples/hello.camus` and `examples/inventory.camus` and asserts no parse errors.
4. Improve grammar iteratively to produce clean parse nodes that the formatter and IR generator can consume.
5. Add an integration test that the formatter (`kiss fmt` PoC) can round-trip: parse -> format -> parse (idempotence).
6. Add editor integration examples (syntax highlighting via tree-sitter queries).
7. Add a ticket to create an LSP prototype that uses the parse tree for diagnostics and `kiss explain` features.

(Each numbered item should be translated to a separate backlog ticket when implementation work starts.)

---

# Open questions (to resolve before implementation)

- Block delimiters: prefer `begin`/`end` (explicit) — confirm that choice. If we prefer braces `{}` instead, document reasons and implications for LLM friendliness.
- Comments: should comments be preserved in the canonical representation or excluded from the signed payload? (Recommendation: preserve comments in source for human readability but exclude them from canonical hash.)
- Strings & multiline text: decide on string escaping rules and whether a multiline string literal is needed for long `claim` texts.
- Tests block syntax: pick a compact, stable representation for `example` and `property` tests (how to express `input`, `expected`, and `seed`).
- Error recovery strategies for editor experiences (how tolerant should the grammar be for partial/incomplete code).
- Node naming and field choices for the IR generator (we need to lock a small set of field names early to stabilize tooling).

---

# Estimate & priority

- Estimate: M (initial spec + PoC grammar + tests). Full grammar and robust tests: larger (depends on feature scope).
- Priority: High for syntax exploration (grammar is a prerequisite for formatter, parser, and LSP work).

---

# References

- Related tickets: `005` (SPEC skeleton), `009` (test harness), `010` (`kiss` CLI scaffold), `011` (formatter & canonicalization).
- Examples: planned `Camus/examples/hello.camus`, `Camus/examples/inventory.camus`.
- Rationale discussion: `Camus/conversation.md` (sections on blocks, intentions/claims, and tooling).

---

*If you approve this draft, I will split the proposed subtasks into concrete backlog tickets and create a small PoC branch for an initial tree-sitter grammar and tests. Please comment on the open questions (especially `begin`/`end` vs braces and the comment handling policy).*