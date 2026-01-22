---
title: "006 — Add example modules: Hello & Inventory"
status: "To Do"
labels: ["examples","doc","spec"]
assignee: ""
milestone: "Examples & Demonstrations"
---

# Objective

Add two example modules that illustrate the `claim` + `tests` (+ optional `clues`) pattern and the intended `kiss` workflow:

1. `Hello` — the minimal example demonstrating a trivial claim and a simple example-based test.
2. `Inventory` — a small, realistic module with multiple functions, example tests and at least one property‑based test (with seed).

These examples will live under `Camus/examples/` and will be the canonical, reviewed references for newcomers and for early tooling (formatter, test harness, `kiss` prototype).

---

# In scope

- Define `Hello` and `Inventory` example source files (Camus source).
- Each example must include:
  - A `claim` statement (human readable).
  - One or more `tests` (executable examples, or property tests with seeds).
  - Optional `clues` for non‑executable justification/rationale.
- Add `Camus/examples/README.md` documenting how to run tests with `kiss test` (or the prototype test harness).
- Create a small example snapshot of expected `kiss.lock` entries (e.g., `Camus/examples/kiss.lock.example`) showing what test metadata/seed/signature fields should look like.
- Add these example entries to `SPEC.md` and `60-design.md` reference sections (as placeholders / links).

# Out of scope (for this ticket)

- Implementing full `kiss` tool or test runner. (This ticket creates the examples and the documentation; testing automation can be in follow-up implementation tickets.)
- Publishing to registry or adding signatures — those are follow-ups and depend on `kiss` features.

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
    // Example: print("Hello, world!")
  }
```

Inventory example (sketch with an example test and a property test with seed):

```/dev/null/examples/inventory.camus#L1-60
module Inventory

# Module-level claim describing responsibility and invariants
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
  // Module functions (examples)
  function addItem(inv: InventoryType, item: String) -> InventoryType
    claim "Return inventory with item appended (no duplicates)"
    tests {
      example {
        input: { inv: [], item: "a" }
        expected: { inv: ["a"] }
      }
    }
    {
      // Body: human-audited implementation goes here.
    }

  function removeItem(inv: InventoryType, item: String) -> InventoryType
    claim "Return inventory without the specified item (if present)"
    tests { ... }
    { ... }
}
```

> Note: the above code samples are illustrative. The actual example files must match the final Camus syntax once it is stabilized, but they must already include `claim`, `tests` and optionally `clues` sections as shown.

---

# Acceptance criteria (DoD)

- [ ] `Camus/examples/hello.camus` exists and contains a `claim` and at least one `tests` example.
- [ ] `Camus/examples/inventory.camus` exists and contains:
  - module-level `claim`,
  - at least one example-based `tests`,
  - at least one property-based test that includes an explicit `seed`,
  - function-level `claim` + tests for at least `addItem` (and ideally `removeItem`/`listItems`).
- [ ] `Camus/examples/README.md` exists and documents how to:
  - run the tests (intended `kiss test` commands, or prototype scripts),
  - interpret recorded test metadata (seed, test hash, run logs).
- [ ] A sample `Camus/examples/kiss.lock.example` demonstrates expected lockfile entries for an example test run (source_hash, tests_hash, test_seed, test_result).
- [ ] The examples are referenced from `SPEC.md` skeleton (ticket `005`) and `60-design.md` (ticket `002`).
- [ ] The examples are reviewed by at least one project member (review recorded in the backlog ticket).

---

# Proposed subtasks

1. Create `Camus/examples/hello.camus` (file stub + claim + tests).
2. Create `Camus/examples/inventory.camus` (module stub + claims + tests + property test with seed).
3. Add `Camus/examples/README.md` with run instructions and expected outputs.
4. Add `Camus/examples/kiss.lock.example` showing a sample entry for a passed test (metadata fields).
5. Link examples into `SPEC.md` and `60-design.md` (placeholders if those specs are drafts).
6. Open PR(s) with the example files, reference this backlog ticket, and request review.

---

# Notes & considerations

- Keep examples intentionally simple and reviewable by humans — they are teaching and audit artifacts, not performance or production code.
- Use deterministic, reproducible tests when possible (explicit `seed` for property tests).
- Examples are valuable for both documentation and for early tool validation (formatter, test harness).
- Once `kiss test` is implemented, a follow-up ticket should run the examples in CI and validate that recorded metadata is accepted.

---

# Estimate & priority

- Estimate: S (small task set).
- Priority: High for documentation and onboarding; medium for immediate tooling.

---

# References

- Related tickets: `000`, `001`, `002` (60-design), `004` (kiss CLI draft), `005` (SPEC skeleton).
- Project vision: `Camus/README.md`, `Camus/conversation.md`.

*End of ticket.*