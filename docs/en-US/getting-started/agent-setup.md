---
title: Agent setup
description: Install Monica Guide in any Agent Skills-compatible coding agent, explore its toolbox, and choose a development path when you are ready.
sidebar_position: 2
---

`monica-guide` is Monica's global toolbox for coding agents. You can install it while you are still learning Monica, before you have a repository or know whether you will build an application, an extension, framework code, or documentation. It is not a runtime package and does not replace the .NET CLI.

## Install before choosing a repository

1. Open the [Agent setup starter](/#start).
2. Copy its one universal instruction.
3. Paste the instruction into an **Agent Skills-compatible coding agent**, not a terminal.

The instruction gives the agent an immutable Monica Git URL. The agent installs only `monica-guide` globally, verifies that it can discover the installed skill, and restarts only when successful installation is not visible in the current session. Codex and Claude Code are release-smoke-tested hosts, but the instruction is not tied to either one.

If an agent cannot install the skill itself, expand the interactive `npx skills` fallback on the homepage and run it in a terminal. It asks which detected agent target to use instead of assuming a specific host.

## What Guide can do

After discovery, Guide explains these capabilities before asking what you want:

- show the active global Monica skill release and installed-skill health;
- show verified global bindings for Monica and Monica.Docs source;
- help you explore Monica without configuring a repository;
- inspect a workspace and recommend an application, extension, framework, or docs profile;
- initialize or reconfigure a workspace when you choose to do so;
- bind or unbind exact Monica and Monica.Docs source independently, or bind both;
- diagnose and update Monica skills; and
- route an upstream contribution without performing remote mutations automatically.

Installing Guide does not initialize a repository, select a profile, install downstream development skills, bind source, or modify files. Guide reports current global state and asks which capability you want to use next.

## What a source binding looks like

Source bindings are global user state, keyed by canonical repository rather than by workspace profile. `status` presents each binding with its repository, exact ref and commit, local path, provenance, and compatibility findings. This makes a verified checkout reusable whenever an agent needs Monica or Monica.Docs internals.

An application developer may bind neither source, only Monica, only Monica.Docs, or both. A profile can recommend source for a task, but it does not own or hide the binding. Offline work never substitutes another release or a default branch when the exact source is unavailable.

## Choose a workspace profile later

Profiles are optional initialization presets, not installation choices:

| Profile | Use it when |
|---|---|
| `application` | Building a Monica-consuming application |
| `extension-author` | Building an independently published Monica module or provider |
| `framework-contributor` | Working in a writable Monica checkout |
| `docs-contributor` | Working in a writable Monica.Docs checkout |

Guide can inspect an existing workspace and explain a recommendation. New, mixed, and ambiguous workspaces remain your decision, and you do not need to choose a profile merely to inspect status or manage global source bindings.

## Review changes before apply

Every later mutation remains preview-first. Guide reports the complete action list, file diff, warnings, blockers, and `planDigest`; applying requires the matching `--apply --plan-digest <digest>` and fails after plan or workspace drift. Initialization may install a profile's skill closure globally and propose a managed root `AGENTS.md` block, but it never authorizes commits, pushes, issues, pull requests, or other remote changes.

After an applied workspace change, run `doctor`. Start a new agent run when managed `AGENTS.md` or `CLAUDE.md` instructions changed so the host reads the updated guidance.

## Try the toolbox

```text
Use Monica Guide to explain its toolbox and help me choose what to do next. Do not change anything yet.
```

```text
Use Monica Guide to show my active Monica skill release and all global source bindings, then explain any issues.
```

```text
Use Monica Guide to preview binding exact Monica and Monica.Docs source globally. Show the paths, refs or commits, provenance, compatibility warnings, and plan digest before applying anything.
```

For channels, updates, source binding, state, recovery, and contribution controls, continue to [Guide operations and safety](./guide-operations.md).
