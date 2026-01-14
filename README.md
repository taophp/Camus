# Camus
**Intention-driven programming language for AIs and humans**

> Misname an object adds to the misfortune of this world.
> 
> Mal nommer un objet, c’est ajouter au malheur de ce monde.
> 
> — Albert Camus, *Sur une philosophie de l’expression*, 1944

![License: MIT](https://img.shields.io/badge/License-MIT-green)
![Status: Concept](https://img.shields.io/badge/Status-Early%20Concept-blue)


_Camus_ is a general purpose programming language designed to be **easily written by AIs** and  **easily understood by humans**. AIs write the code, but humans review, validate, and take **responsibility**. The compilation process is deterministic, producing executable programs for existing ecosystems.

## Philosophy

Camus is guided by a single principle: **every program is a deliberate act**.

Key ideas:

- **Easy to read and write for IAs**: Until now, programming languages ​​were designed to be written by humans and understood by machines; Camus reverses the paradigm: it is designed to be written by machines and understood by humans.
- **Easy to read for humans**: Maybe boring, but clear; humans can then take responsibility.
- **Intention first**: Every function, module, or block should have a clearly defined purpose; things are easier to understand when you know their reason for being.  
- **Human responsibility**: AI may generate code, but humans are accountable for reviewing and approving it.  
- **Transparent execution**: Compilation produces deterministic code; Camus’ compilation is deterministic; AI is only involved in generation, not execution.
- **Traceable structure**: Programs are structured for readability, auditability, and accountability.

This is **an early-stage project**, exploring how programming can align human and AI collaboration with clarity and responsibility.

## Main goals

### AI-friendly ergonomics
Camus aims to be AI-friendly: its syntax should be flat, each block explicitly delimited, and code generable locally without relying on hidden context, limiting deep nesting or implicit scopes. These design choices are intended to minimize errors during AI generation and make each step understandable and auditable once implemented.

### Human auditability
Camus aims to be auditable by humans: every function, step, and block should be understandable and explainable, so that a human reviewer can take full responsibility for the code. By design, the language should make implicit logic explicit and minimize constructs that could obscure intent.

### General-purpose and compilable
Camus aims to be a general-purpose language capable of being compiled or transpiled into standard executable code across multiple environments. Its design should allow the underlying intentions to remain clear and auditable while supporting real execution.

## What Camus is not
Camus is not intended to be a specification language, a domain-specific language, a natural language interface, or a replacement for existing task or requirements management tools. While it deals with the mapping between intentions and code, it does not aim to formalize human intentions outside the scope of generating auditable, executable code.

## The Core Problem Camus Solves
The core problem Camus aims to address is not generating code from intentions, but understanding what the generated code actually does. Code produced by AI can be correct yet difficult to audit, especially when languages allow implicit constructs or when the AI introduces unexpected behavior. Camus aims to minimize such complexity by ensuring that every function, step, and block is explainable and auditable, allowing human reviewers to fully grasp the effects of the code, and ensuring that every generated step reflects its intended purpose.

## Roadmap

1. Refine syntax and core abstractions  
2. Define formal model for intention and responsibility  
3. Explore transcompilation to existing languages  
4. Gradually prototype execution and validation tools  

## Join the Discussion

Camus is open to [**discussion, feedback, and gradual exploration**](https://github.com/taophp/Camus/discussions).

## License

This project is licensed under the **MIT License** – see [LICENSE](LICENSE) for details.
