---
title: Guide operations and safety
description: Manage Monica skill installations, exact releases, framework source lookup, and workspace state.
sidebar_position: 3
---

Use Monica Guide after [agent setup](./agent-setup.md) to inspect or change a workspace's skill installation. The executable owns setup behavior; the `monica-guide` skill teaches its commands and routes development work to the appropriate skills.

## Inspect state

`overview` describes installed products and next actions. `workspaces` lists initialized workspaces. `status` checks installed skill projections; add `--workspace <path>` for profile and managed-instruction health. `doctor` adds deeper runtime checks. All support machine-readable `--json` output.

Guide records one active skill release per product and verifies each installed skill tree against that release's catalog digest. A workspace profile selects its project-local skill closure. Release assets are immutable; offline operation uses the installed bundle and verified local state rather than a moving branch or another release.

## Preview changes

`init --workspace <path> --profile <name>` records a workspace profile and creates its managed instruction block. `configure --workspace <path>` installs or refreshes that profile's skills in the project's configured skill directories. `unconfigure --workspace <path>` removes its Guide-owned installations; `forget --workspace <path>` removes its Guide-owned workspace configuration and managed instruction block. A global `configure` is for an explicit machine-wide installation.

Every mutating command produces a plan first. Apply only the reviewed plan with `--apply --plan-digest <digest>`; Guide rejects drift and verifies the resulting projection. Managed `AGENTS.md` changes need a new agent run to take effect. Keep unrelated agent skills and surrounding repository instructions outside the Guide-owned span.

## Locate framework source

`source resolve --repository monica --json` observes a verified binding to the Monica framework checkout, including its ref, commit, path, provenance, and warnings. A dirty or moved checkout can still be returned with warnings for ordinary lookup. Bind an explicitly supplied canonical checkout through the command's preview and apply flow. A source binding is a lookup aid and never changes project dependencies or authorizes edits.

Monica.Docs has no Guide source binding or docs-contributor profile. Find its checkout through the active task or ordinary filesystem discovery. Documentation pages are maintained under that repository's `docs/` tree; canonical Agent Skills remain in Monica's `skills/` tree.

## Contributions and local paths

Guide's `issue status` reports the machine's issue-preparation preference. The preference does not authorize remote changes. Route contribution work to `$monica-contribution`, and use the private security route for suspected vulnerabilities.

Guide JSON may contain private absolute source or workspace paths. Keep such output local unless the task calls for sharing it. If a plan, installation, or managed instruction looks stale, use `doctor` before another mutation.
