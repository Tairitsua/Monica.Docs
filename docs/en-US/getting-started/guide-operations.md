---
title: Guide operations and safety
description: Understand Monica Guide releases, updates, source bindings, managed state, recovery, and contribution safeguards.
sidebar_position: 3
---

Use this page after the first [Agent setup](./agent-setup.md), when maintaining an existing setup, or when working in a Monica contributor repository. `monica-guide` remains responsible for bootstrap, configuration, diagnosis, updates, and routing; ordinary implementation continues through the development skills selected for the repository.

## Three version axes

Guide keeps three related identities separate:

| Identity | What it describes | When it changes |
|---|---|---|
| **Monica framework version** | The NuGet or source version used by the project | When the project changes its Monica dependency |
| **Skill-bundle release** | One tested set of Monica skills, profiles, templates, and release contracts | When Monica publishes an immutable framework release |
| **Per-skill revision** | A human-readable catalog counter such as `r7` for one skill | During a release, only when that skill's authoritative content digest changed |

The catalog's SHA-256 digest is the machine identity of a skill's exact bytes. A revision and its `lastChangedIn` tag help people understand history; they do not belong in portable `SKILL.md` frontmatter.

Ordinary CI validates schemas, deterministic projections, dependency closures, prompt parity, and revision accounting. It does **not** publish user-visible skill updates. Only Monica's release workflow publishes immutable catalog and prompt assets, advances changed-skill revisions, and moves the `stable` or `preview` pointer after install, discovery, and initialization smoke tests pass.

## Channels and exact releases

- `stable` and `preview` point to tested immutable Monica tags.
- An explicit `--release-tag` selects that exact release; its channel is derived from the selected release. An explicitly supplied channel is an assertion and must agree.
- `source` binds an explicitly selected commit and never follows a moving branch.
- Offline operation uses only verified cached contracts and sources. Guide never substitutes another release or a default branch.

Monica skills are global, so one skill-bundle release is active per user. A repository records its expected release in `.monica/guide.json`. When the active global release differs, `doctor` reports the conflict and requires an explicit global switch or a repository upgrade; Guide does not claim simultaneous global multi-version isolation.

## Status, doctor, and update

Use `status` for a compact view of the repository profile, expected release, active global release, selected skills, and source binding. Use `doctor` for actionable checks. Both support `--json` for automation.

Run `doctor` after initialization, after changing a release or source binding, and when discovery or managed instructions appear stale. New, unconfigured repositories should start with an `init` preview rather than treating `doctor` as a prerequisite.

`update` is also a dry run by default. Its preview compares installed and target revisions and digests. Guide reinstalls only new, changed, missing, unknown, or tampered Monica skills and leaves unrelated user skills alone. `update --skill <name>` still includes required dependencies and either produces a coherent release closure or refuses a mixed global release.

## Plan digests and protected apply

Every mutating intent—`init`, `update`, `configure`, `source`, `contribute`, and `forget`—previews its actions and file diffs before apply. The resulting `planDigest` covers the plan and relevant workspace observations. Applying requires `--apply --plan-digest <digest>` and fails after drift.

When a plan changes global skills, Guide protects the selected Monica skills and planned files in one compensating boundary. If an action fails, it restores only attempted work and verifies the observable result. Interrupted, incomplete, or cleanup-pending recovery evidence appears in `status` and `doctor` and blocks another mutation until reconciled.

## Source binding

Guide resolves the Monica version from `ProjectReference`, lock/assets data, central package management, and then project declarations. Mixed versions, unresolved ranges, unavailable immutable releases, and source checkouts whose effective commit cannot be identified fail closed.

Profiles that require exact source use `inspect-dependency-source` through its stable `resolve --json` contract. A binding records the verified ref, commit, provenance, access mode, and local path. Catalog-managed source is never modified, and offline mode requires the exact verified source already to be available.

## Managed instructions and state

Guide manages only its marked block in the root `AGENTS.md`. It preserves surrounding content and diagnoses malformed, duplicate, or nested blocks instead of rewriting them implicitly. For Claude Code, it can maintain a minimal root `CLAUDE.md` import of `@AGENTS.md`.

State is split deliberately:

- `.monica/guide.json` stores repository-shared choices such as profile, channel, selected capabilities, expected release, and instruction-block version.
- The platform-standard user `state.json` stores the active global release, agent targets, local source bindings, preferences, and timestamped observations.

User-local paths do not belong in repository state. State changes use schema migration, locking, and atomic replacement. `forget` previews exactly which Guide-owned project or user state it will remove.

## Contributor repositories

Use `framework-contributor` only in a writable canonical Monica checkout. Use `docs-contributor` in a writable Monica.Docs checkout with exact read-only Monica source; Monica write access remains a separate decision for cross-repository fixes.

`monica-contribution` can classify findings, prepare reproductions, search for duplicates, and draft Issue, Discussion, or pull-request content. Persisted preferences are limited to `never`, `prepare`, or `ask`. Creating a branch, pushing, publishing a draft pull request, or creating a remote Issue or PR always requires approval in the current session. Suspected vulnerabilities must use a private security route and must never become public issues.

## Operational checklist

1. Use `status` to confirm the repository and active global release agree.
2. Preview `update`; review changed revisions, dependency closure, files, and digest.
3. Apply only the unchanged plan with its digest.
4. Run `doctor` and resolve recovery or source findings before ordinary development.
5. Start a new agent run after managed instruction files change.
