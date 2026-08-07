---
title: Agent setup
description: Set up Codex or Claude Code for a Monica repository, preview the changes, and begin development safely.
sidebar_position: 2
---

`monica-guide` prepares a coding agent to work in a Monica repository. It installs the development guidance for your goal, checks the repository, and previews its setup before changing any files. It is not a runtime package, does not replace the .NET CLI, and does not edit your business code during initialization.

## Before you start

1. Open **Codex** or **Claude Code** at the root of the repository you want to work on.
2. Open the [Agent setup starter](/#start), then choose your coding agent and goal.
3. Copy the generated instruction and paste it into the **agent chat**, not a terminal.

You normally install Guide once for each user account on a machine and initialize it once in each repository. The website instruction pins Guide to an immutable Monica release and asks it to stop after a dry-run preview.

## Choose your goal

| Goal | Choose it when | Source requirement |
|---|---|---|
| **Build a Monica application** | The repository consumes Monica packages to implement an application | Exact read-only Monica source is optional and recommended when work depends on framework internals |
| **Build an extension** | You are creating an independent Monica module, provider, UI package, or companion image | Exact read-only Monica source is required; the extension itself continues to consume Monica through NuGet |

Guide can inspect the repository and explain its recommendation, but ambiguous or mixed repositories remain your decision. Framework and documentation contributors should use the repository-specific flows in [Guide operations and safety](./guide-operations.md#contributor-repositories).

## Review the preview

The pasted instruction asks your agent to:

- install only `monica-guide` from the advertised immutable Monica tag;
- verify that the selected host can discover the installed skill;
- restart only when discovery is unavailable;
- initialize the selected goal without `--apply`; and
- report the resolved release, actions, affected files, diff, warnings, blockers, and `planDigest`.

Read that result before approving it. Setup may install Monica development skills globally and may propose a managed block in the repository's root `AGENTS.md`. It does not authorize commits, pushes, issues, pull requests, or other remote changes.

## Apply the unchanged plan

If the preview is correct, tell the agent to apply that exact plan. Guide requires both `--apply` and the displayed `--plan-digest`; it refuses an apply if the repository or plan changed after preview. When that happens, request a fresh preview instead of reusing the old digest.

After a successful apply, ask the agent to run `doctor` and explain any remaining warnings. Start a new agent run when managed `AGENTS.md` or `CLAUDE.md` instructions changed so the host reads the new repository guidance.

## Start development

Try one concrete request after setup:

```text
Explain this repository's Monica architecture and show where a new order feature belongs. Do not change files yet.
```

```text
Implement the next application feature using the Monica skills selected for this repository, then run the relevant tests.
```

```text
Run Monica Guide status and tell me whether this repository and my active skill release still agree.
```

For channels, updates, source binding, state, recovery, and contribution controls, continue to [Guide operations and safety](./guide-operations.md).
