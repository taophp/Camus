---
title: Camus
layout: home_with_blog
---

## TL;DR

Camus is an intention-driven programming language designed to make intention and responsibility explicit. Programs are written with clear purposes and constraints; AI may assist in generating code, but humans review, validate, and accept responsibility before compilation. The project focuses on readability, auditability, and deterministic compilation to existing ecosystems.

If you want a quick introduction, read the [Quick Start Guide](10-quickstart.html).

**Camus is in early development.**
Tooling and specifications are still evolving; for now you can explore the language through the included examples and join the community to help shape the design.

## Why Camus?

Software created with or assisted by AI requires clearer ways to record intent and responsibility. Camus aims to:

- Make intention explicit in code
- Capture constraints and expected behavior
- Keep human responsibility and review central
- Produce deterministic, auditable outputs for compilation or transpilation

### A small example

Below is a minimal program that demonstrates the key ideas: imports, a function declaring an `intention`, and `constraints` for inputs and outputs.

    // file: HelloWorld.camus
    import HelloLib::PrefixWithHello
    import Io::{print,read}

    function Hello() -> Void
      intention "Welcoming someone"
      constraints {
        input {}
        output {}
      }
      {
        print(PrefixWithHello(read()))
      }

    // file: HelloWorldLib.camus
    module HelloLib
    const Hello = "Hello, "

    function PrefixWithHello(who: String) -> String
      intention "Provide a string prefixed with 'Hello, '"
      constraints {
        input {
          len(who) >= 2
        }
        output {
          len(result) == (len(who) + len(Hello))
        }
      }
      {
        return(Hello . who)
      }

View the complete example in `example.camus` in this repository.

## How it works (brief)

- Modules and imports structure code and dependencies.
- Functions include an `intention` string describing their purpose.
- `constraints` describe pre- and post-conditions for inputs and outputs.
- The aim is to produce deterministic compilation/transpilation targets so execution does not depend on AI runtime.
- Humans validate and take responsibility for the code before compilation.

## Get started

1. Read the [Quick Start Guide](10-quickstart.html).
2. Open `example.camus` to explore a minimal, working example.
3. Share ideas, ask questions, or propose changes on GitHub Discussions: https://github.com/taophp/Camus/discussions

## For Developers & Contributors

- Help formalize the model for intention and responsibility.
- Build validators, linters, and transpilers (TypeScript, Rust, etc.).
- Propose changes, open issues, or submit PRs to the repository.
- See the repository's contribution notes and backlog for ongoing work.

## Roadmap (high level)

- Refine syntax and core abstractions
- Define a formal model for intention and responsibility
- Explore deterministic transcompilation to existing languages
- Prototype execution/validation tools and developer utilities

## Join the Community

Camus is openly developed — join the conversation and contribute on GitHub:
https://github.com/taophp/Camus
