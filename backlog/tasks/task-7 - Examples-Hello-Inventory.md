---
id: task-7
title: 'Examples: Hello & Inventory'
status: To Do
assignee: []
created_date: ''
updated_date: '2026-01-22 14:20'
labels:
  - examples
  - doc
  - spec
milestone: Examples & Demonstrations
dependencies: []
ordinal: 7000
---

# Objective

Add two example modules that illustrate the `claim` + `tests` (+ optional `clues`) pattern and the intended `kiss` workflow:

1. `Hello` — the minimal example demonstrating a trivial `claim` and a simple example-based test.
2. `Inventory` — a small, realistic module with multiple functions, example tests and at least one property‑based test that includes an explicit `seed`.

These examples will live under `Camus/examples/` and serve as canonical, reviewed references for newcomers and for early tooling (formatter, test harness, `kiss` prototype).

---

# In scope

- Create `Camus/examples/hello.camus` and `Camus/examples/inventory.camus`.
- Each example must include:
  - A `claim` statement (human readable).
  - One or more `tests` (example-based and / or property tests with explicit `seed`).
  - Optional `clues` for non‑executable justification/rationale.
- Add `Camus/examples/README.md` documenting how to run tests (intended `kiss test` commands or prototype scripts).
- Provide a sample `Camus/examples/kiss.lock.example` showing the expected lockfile entry (source_hash, tests_hash, test_seed, test_result).
- Add links/placeholders in `Camus/SPEC.md` and `Camus/60-design.md`.

# Out of scope

- Implementing the full `kiss` tool or test runner (those are follow-up implementation tickets).
- Publishing to a registry and signature workflows — those depend on `kiss` features and are follow-ups.

---

# Example source (illustrative)

Hello example (minimal):
```/dev/null/examples/hello.camus#L1-16
function Hello() -> Unit
  claim "Print 'Hello, world!' to standard output"
  tests {
    example {
      input: null
      expected_stdout: "Hello, world!\n"
    }
  }
  clues {
    rationale "A trivial example to demonstrate claim, tests, and human-audited implementation."
  }
  {
    // Body: implementation is written and audited by a human.
    // Example implementation: print("Hello, world!")
  }
```

Inventory example (sketch with example + property test):
```/dev/null/examples/inventory.camus#L1-60
module Inventory

claim "Simple inventory manager: add/remove items, list items, and maintain count"

tests {
  example add_item {
    input: { inventory: [], item: "apple" }
    expected: { inventory: ["apple"], count: 1 }
  }

  property add_increases_count {
    seed: 42
    description: "For any inventory and any item, addItem increases item count by one"
    test_script: """
      // Pseudocode for property runner:
      // let (inv, item) = rand(seed)
      // let newInv = addItem(inv, item)
      // assert count(newInv) == count(inv) + 1
    """
  }
}

clues {
  rationale "Inventory is intentionally simple to show how property tests and seeds are recorded."
}
{
  function addItem(inv: InventoryType, item: String) -> InventoryType
    claim "Return inventory with item appended (no duplicates)"
    tests {
      example {
        input: { inv: [], item: "a" }
        expected: { inv: ["a"] }
      }
    }
    {
      // Implementation stub for human review
    }

  function removeItem(inv: InventoryType, item: String) -> InventoryType
    claim "Return inventory without the specified item (if present)"
    tests { /* example tests */ }
    { /* body */ }
}
```

> Note: these examples are illustrative. The actual files must match the stabilized Camus syntax but must already include `claim`, `tests` and optional `clues` sections.

---

# Acceptance criteria (DoD)

- [ ] `Camus/examples/hello.camus` exists and contains a `claim` and at least one example-based `test`.
- [ ] `Camus/examples/inventory.camus` exists and contains:
  - a module-level `claim`,
  - at least one example-based `test`,
  - at least one property-based `test` with an explicit `seed`,
  - function-level `claim` + tests for `addItem` (and ideally `removeItem` / `listItems`).
- [ ] `Camus/examples/README.md` documents:
  - how to run tests (intended `kiss test` commands or prototype scripts),
  - how to interpret recorded test metadata (seed, test hash, run logs).
- [ ] `Camus/examples/kiss.lock.example` demonstrates a sample lockfile entry (source_hash, tests_hash, test_seed, test_result).
- [ ] `Camus/SPEC.md` and `Camus/60-design.md` reference these example files.
- [ ] Examples are reviewed by at least one project maintainer (review recorded on the backlog ticket or PR).

---

# Proposed subtasks

1. Create `Camus/examples/hello.camus` (stub + `claim` + `tests`).
2. Create `Camus/examples/inventory.camus` (module stub + `claim` + example + property test with `seed`).
3. Add `Camus/examples/README.md` with run instructions and interpretation guide for test metadata.
4. Add `Camus/examples/kiss.lock.example` showing sample lockfile entries for a passed test.
5. Link the examples into `Camus/SPEC.md` and `Camus/60-design.md` (placeholders acceptable).
6. Open PR(s) with the example files, reference this ticket, and request review.

---

# Notes & considerations

- Keep examples intentionally simple, readable, and reviewable by humans — they are teaching and audit artifacts.
- Prefer deterministic property tests (explicit `seed`) to ensure reproducibility.
- Examples will be useful for early validation of the formatter and test harness — prioritize minimal, runnable examples that can be used by PoCs.
- After `kiss test` is implemented, add a follow-up ticket to run examples in CI and assert expected metadata is produced.

---

# Estimate & priority

- Estimate: S (small set of files + documentation).
- Priority: High for onboarding and tooling validation.

---

# References

- Parent ticket: `task-1 - Initialize the backlog and define milestones`
- Related tickets: `task-2` (vocabulary), `task-3` (60-design), `task-6` (SPEC skeleton), `task-5` (kiss CLI spec)
- Project docs: `Camus/README.md`, `Camus/conversation.md`
