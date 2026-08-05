---
title: Agent setup
description: Install Monica Guide, select a development profile, and preview repository-specific setup safely.
sidebar_position: 2
---

# Set up your coding agent for Monica

`monica-guide` is the supported entry point for agent-assisted Monica work. It selects the Monica development skills that match the repository, binds them to an immutable Monica release, and previews every workspace change before applying it. Monica skills follow the portable [Agent Skills specification](https://agentskills.io/specification) and its progressive-disclosure model.

## Start from the website prompt

Open the [Agent setup starter](/#start), choose **Codex** or **Claude Code**, and copy the prompt for your agent. The prompt installs only `monica-guide` from the advertised immutable Monica tag, verifies that the host can discover it, and passes that same tag to Guide as `--release-tag` before previewing initialization.

Each host prompt also passes its matching `--agent` target, so a Codex-only setup does not silently install Claude Code bindings and vice versa. The generic fallback selects both targets explicitly.

Skills are normally discovered without restarting:

- [Codex detects skills](https://learn.chatgpt.com/docs/build-skills) under its existing skill directories. Restart only if `monica-guide` does not appear. Codex reads `AGENTS.md` instructions at the start of a run, so start a new run after applying a new managed instruction block.
- [Claude Code watches skills](https://code.claude.com/docs/en/slash-commands) in existing `~/.claude/skills` and project `.claude/skills` directories. Restart only when the top-level skill directory did not exist when the session started. [`CLAUDE.md` and relative imports](https://code.claude.com/docs/en/memory) are loaded when a session starts.

## Choose a profile

Guide can suggest a profile from the repository identity and characteristic files, but it will not install skills or edit files until you confirm the choice.

| Profile | Use it for | Monica source policy |
|---|---|---|
| `application` | Applications that consume Monica packages | Exact read-only source is optional and recommended when work depends on framework internals |
| `extension-author` | Independent Monica modules, providers, UI packages, and companion images | Exact read-only Monica source is required; generated projects still consume Monica through NuGet |
| `framework-contributor` | Changes to the Monica framework repository | A writable Monica checkout is required |
| `docs-contributor` | Monica.Docs content, website, and example-application work | Writable Monica.Docs plus exact read-only Monica source are required; Monica write access is a separate decision |

Ambiguous, mixed, and non-Monica repositories remain a user choice. Guide does not guess a profile from weak evidence.

## Preview, then apply

Ask Guide to initialize the repository and show the plan:

```text
$monica-guide Initialize this repository. Explain the detected profile and preview every action without applying it.
```

Mutating intents—`init`, `update`, `configure`, `source`, `contribute`, and `forget`—default to a dry run. A preview contains the complete action list, file diff, and `planDigest`. Applying requires both `--apply` and that digest; Guide aborts if the workspace or plan changed after the preview.

For plans that install global skills, Guide protects both the selected Monica skills and all planned files in one compensating boundary. If a protected action fails, only attempted work is restored and the result is verified. Interrupted, incomplete, or cleanup-pending recovery evidence appears in `status` and `doctor` and blocks another mutation until it is reconciled. Because the underlying CLI does not expose per-agent copy-versus-symlink topology, Guide verifies canonical content, modes, memberships, and provenance rather than claiming hidden topology is atomic.

Use `status` for the current binding and `doctor` for actionable diagnostics. Both have readable output and `--json` for automation:

```text
$monica-guide Run doctor --json and explain any blocking findings before changing files.
```

## Release channels and global version behavior

- `stable` and `preview` resolve through the Monica skill index to an immutable Monica tag and verified catalog digest.
- `source` binds an explicitly selected commit. It never follows a moving branch.
- Offline operation uses only verified cached catalogs and sources. Guide will not substitute a different release or default branch when the requested artifact is unavailable.

Monica skills are installed globally, so one Monica skill release is active per user. A repository records its expected release in `.monica/guide.json`. If that differs from the active global release, `doctor` reports the conflict and requires an explicit global switch or repository upgrade; simultaneous global multi-version isolation is not claimed.

## Source binding

Guide resolves a project version from `ProjectReference`, lock/assets data, central package management, and then project declarations. Mixed versions, unresolved ranges, missing immutable releases, and unidentified dirty source checkouts fail closed.

Exact source is resolved through `inspect-dependency-source`. The binding records the verified ref, commit, provenance, access mode, and local path. Catalog-managed source is never modified.

## Managed instructions and state

Guide owns only its marked block in the root `AGENTS.md`; surrounding instructions remain untouched. Malformed, duplicate, or nested managed blocks are diagnosed instead of rewritten. For Claude Code, Guide can maintain a minimal root `CLAUDE.md` that imports `@AGENTS.md`.

State is deliberately split:

- `.monica/guide.json` is repository-shared configuration: profile, channel, selected capabilities, expected catalog release, and managed-instruction version.
- The platform-standard user `state.json` stores the active global release, agent targets, verified source bindings, and user preferences. Timestamped observations are kept separate from preferences.

State updates use schema migrations, locking, and atomic replacement. `forget` previews exactly which Guide-owned project or user state will be removed.

The shared repository file intentionally excludes user-local source paths. User state can contain local paths, provenance, and timestamped observations, so it remains in the platform-standard user location rather than the repository. Review `.monica/guide.json` like any other committed configuration change.

## Contribution safety

`monica-contribution` handles classification, reproduction, duplicate search, and Issue, Discussion, or PR drafting. It persists only `never`, `prepare`, or `ask` as contribution preferences.

Remote Issue or PR creation, branch creation, pushing, and draft PR publication always require approval in the current session. Suspected vulnerabilities are routed privately and must never be opened as public issues.

## Next steps

- Run `doctor` after switching Monica releases or source bindings.
- Use `update` to preview a catalog-selected skill update without touching unrelated user skills.
- Continue ordinary development through the profile-selected `monica-application`, `monica-framework`, and granular skills; Guide remains focused on setup, configuration, diagnosis, and routing.
- For a manual host setup, continue with [Getting started](./index.md).
