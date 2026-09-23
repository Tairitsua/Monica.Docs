---
title: Agent setup
description: Install Monica Guide and choose the skills for an application, extension, or framework workspace.
sidebar_position: 2
---

`monica-guide` is Monica's setup toolbox for coding agents. It installs and updates Agent Skills; it is separate from the .NET runtime packages used by your application.

## Start with the release installer

Open the [Agent setup starter](/#start) and paste its instruction into an Agent Skills-compatible coding agent. The release archive is selected for your platform and verified against `SHA256SUMS`. The agent locates the `Monica.Guide` executable, previews workspace setup, applies the plan digest after you choose a profile, and checks the result with `status` or `doctor`.

Guide can explain its toolbox and inspect installations without initializing a repository. A workspace installation is project-local by default; a machine-wide skill installation is an explicit choice. The Guide skill itself may be kept global by its product preference so it can help across projects.

## Choose a workspace profile

| Profile | Use it for |
| --- | --- |
| `application` | A Monica-based application. Choose one of `microservice` or `modular-monolith`; add `ui` when needed. |
| `extension-author` | An independently published Monica module or provider. |
| `framework-contributor` | The canonical Monica framework checkout. |

The profile selects a release-tested skill closure. Guide's workspace detection is advisory; choose the profile that matches the work. Monica.Docs is an ordinary documentation repository and has no Guide-specific docs profile or source binding. Use its checkout and repository instructions directly, and use the Monica framework source binding only when exact framework implementation lookup is needed.

## Review and verify

Mutating Guide commands first produce a preview with a `planDigest`. Apply the unchanged plan with `--apply --plan-digest <digest>`, then run `doctor --workspace <path>`. If Guide changed a managed `AGENTS.md` or `CLAUDE.md`, start a new agent run so the instructions reload.

For release updates, source lookup, recovery, and contribution controls, read [Guide operations and safety](./guide-operations.md).
