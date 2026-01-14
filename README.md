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

## Deep Motivations

### The Fantasy of Cryptic AI Languages

[A recent experiment](https://github.com/ImJasonH/ImJasonH/blob/main/articles/llm-programming-language.md) attempted to have AI systems design a programming language optimized to minimize token consumption, deliberately setting aside readability concerns. The first attempt produced a cryptic language—but the AI proved unable to build a compiler for it. When another AI was consulted, it proposed a surprisingly *more readable* solution, leading the experimenter to realize that "optimized for AI" doesn't mean "incomprehensible to humans."

This outcome contradicts predictions that AI systems might develop cryptic, human-incomprehensible programming languages. It reveals a fundamental truth: Large Language Models are models of *human language*, trained on human communication patterns. A programming language truly "optimized for AI" would be *more readable*, not less. LLMs perform better with explicit code, verbose documentation, and clear structure. The clarity that helps humans understand code is precisely what helps AI systems process it effectively.

### The Token Density Fallacy

The idea of creating dense, compressed languages to save tokens is counterproductive. Reducing verbosity diminishes clarity, which increases misunderstandings and errors. This, in turn, generates costly back-and-forth corrections that far exceed any initial token savings. As developers have noted, [code that is "boring to read"](https://randuck.dev/blog/embracing-boring-code) may be a quality, not a flaw—predictability means no surprises, and no surprises means no unpleasant surprises.

### The Responsibility Problem

The core challenge with AI-generated code is not cost or performance—it's **accountability**. When we delegate decisions to AI, who bears responsibility for the outcomes? The developer who chose convenience? The AI designer who didn't provide adequate decision-making capabilities? Chance itself? The AI?

Responsibility isn't merely about credit or blame—it's about who faces concrete consequences when things go wrong: who repairs, compensates, pays, or faces legal sanctions. It makes no sense to fine or imprison an AI system.

### The Asimov Principle

Isaac Asimov found stories about robot uprisings absurd. His reasoning, [articulated through his Three Laws of Robotics](https://en.wikipedia.org/wiki/Three_Laws_of_Robotics#History), was simple: when we design tools, we build in safeguards against injury. While accidents happen, the notion that we'd march toward universal catastrophe due to a design flaw is fundamentally illogical.

This principle applies to AI code generation. We must design systems that prevent self-harm by design, not hope to retrofit safety after the fact.

### Auditability as the Solution

For a human to legitimately assume responsibility for AI-generated code, they must be able to audit it thoroughly. This requires the code to be perfectly readable and the AI's reasoning to be transparent.

This paradigm shift is the only viable path to solving the accountability problem: **require AI systems to explain their reasoning before entrusting them with significant decisions**. Since the internal workings of modern AI have become opaque to us, we must mandate external explicability as a prerequisite for delegation.

### The Camus Approach

This project embodies these principles: creating a framework where AI-generated code must be auditable and accompanied by clear explanations of architectural decisions and reasoning. The human review occurs after code generation and validation (compilation, testing), but before final compilation and production deployment. The human developer audits both the code and its rationale, assumes responsibility for the choices, and the resulting code becomes code that is truly *owned* rather than merely *accepted*.

This is not about limiting AI capability—it's about structuring human-AI collaboration so that responsibility remains where it must: with humans who can be accountable for consequences.

## Roadmap

- [ ] Define syntax and core abstractions  
- [ ] Define formal model for intention and responsibility  
- [ ] Explore transcompilation to existing languages  
- [ ] Gradually prototype execution and validation tools  

## Join the Discussion

Camus is open to [**discussion, feedback, and gradual exploration**](https://github.com/taophp/Camus/discussions).

## License

This project is licensed under the **MIT License** – see [LICENSE](LICENSE) for details.
