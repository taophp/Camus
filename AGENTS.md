## AI Agent Rules – Quick Reference


- Always use `backlog`; **never edit task files directly**.  
- Do **not** modify, create, or reorder tasks/milestones without human approval.  
- Always propose actions, list out-of-scope items, and **wait for explicit confirmation**.  
- Mark any tentative content clearly; **do not assume or guess**.  
- When in doubt, **stop and ask**.

# Mandatory Governance Rules (Normative)

All AI agents interacting with this repository **MUST strictly follow these rules**:

1. Before making any change, AI agents MUST check the repository status.

2. If uncommitted changes are detected, the agent MUST stop and report them.

3. No action is allowed on a dirty working tree.

4. During planning, AI agents may only READ existing content and PRODUCE proposals in chat. No file, task, or document modification is allowed at this stage
5. AI agents MUST NOT modify code, tasks, or documents during planning.

6. Any execution step requires explicit human approval.

7. When proposing a plan, AI agents MUST explicitly state the roles or competencies involved (e.g. language design, security analysis, tooling, project management).

8. When proposing a plan, AI agents MUST explicitly state the roles or competencies involved.

9. **Always use the official CLI tool (`backlog`)** for creating, modifying, or managing tasks, milestones, and structured items.  
   Direct editing of task files is **forbidden**.
10. **No autonomous modifications**: AI agents MUST NOT create, reorder, or complete any task, milestone, or project structure without prior human approval.
11. **Validation before action**: Before performing any action that changes repository content, the AI agent must:
   - Propose in detail **what will be done**.
   - List **what is out of scope**.
   - Wait for **explicit human confirmation**.
12. **Tentative content**: Any output that could create narrative or structural obligations (tasks, milestones, specifications) must be marked as **tentative** until approved.
13. **Default behavior on uncertainty**: When unsure, **stop and ask**. Never guess, infer, or auto-complete project structure or content.
14. **Accountability**: Non-compliance with these rules is a **violation of repository governance policy**.

## Backlog Usage (Normative)

- Backlog.md CLI is the sole interface for task and milestone management.
- Direct editing of task files is forbidden.
- Task creation, modification, and status changes require explicit human approval.
- AI agents must use `--plain` output when reading tasks.

For operational details on task management, see AGENTS-BACKLOG.md.
This document is mandatory for execution but non-normative.
