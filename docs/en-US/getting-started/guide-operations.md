---
title: Guide operations and safety
description: Understand Monica Guide releases, updates, source bindings, managed state, recovery, and contribution safeguards.
sidebar_position: 3
---

Use this page after installing the [Monica Guide toolbox](./agent-setup.md), when maintaining global bindings or an existing workspace, or when working in a Monica contributor repository. `monica-guide` remains responsible for orientation, bootstrap, configuration, diagnosis, updates, and routing; ordinary implementation continues through the development skills selected later.

## Three version axes

Guide keeps three related identities separate:

| Identity | What it describes | When it changes |
|---|---|---|
| **Monica framework version** | The NuGet or source version used by the project | When the project changes its Monica dependency |
| **Skill-bundle release** | One tested set of Monica skills, profiles, templates, and release contracts | When Monica publishes an immutable framework release |
| **Per-skill revision** | A human-readable catalog counter such as `r7` for one skill | During a release, only when that skill's authoritative content digest changed |

The catalog's SHA-256 digest is the machine identity of a skill's exact bytes. A revision and its `lastChangedIn` tag help people understand history; they do not belong in portable `SKILL.md` frontmatter.

Ordinary CI validates schemas, deterministic projections, dependency closures, prompt parity, and revision accounting. It does **not** publish user-visible skill updates. Only Monica's release workflow publishes immutable catalog and prompt assets, advances changed-skill revisions, and moves the `stable` or `preview` pointer after immutable-source, installation, and discovery smoke tests pass.

## Channels and exact releases

- `stable` and `preview` point to tested immutable Monica tags.
- An explicit `--release-tag` selects that exact release; its channel is derived from the selected release. An explicitly supplied channel is an assertion and must agree.
- `source` binds an explicitly selected commit and never follows a moving branch.
- Offline operation uses only verified cached contracts and sources. Guide never substitutes another release or a default branch.

Monica skills are global, so one skill-bundle release is active per user. A repository records its expected release in `.monica/guide.json`. When the active global release differs, `doctor` reports the conflict and requires an explicit global switch or a repository upgrade; Guide does not claim simultaneous global multi-version isolation.

## Status, doctor, and update

Use `status` without a workspace for a compact view of the active global release, installed skills, and every Monica or Monica.Docs source binding. Add a workspace when you also want its detected profile, expected release, selected capabilities, and managed instructions. Use `doctor` for actionable global or workspace checks. Both support `--json` for automation.

Any Guide output that includes source bindings or local paths—including `overview`, `source list`, `source resolve`, `status`, and `doctor` JSON—may contain private absolute paths. Keep it local; do not commit or share it by default.

Run `doctor` after initialization, after changing a release or source binding, and when discovery or managed instructions appear stale. You can inspect global health before choosing a repository. When you later configure a new workspace, Guide explains the profile options and produces an `init` preview only after you choose one.

`update` is also a dry run by default. Its preview compares installed and target revisions and digests. Guide reinstalls only new, changed, missing, unknown, or tampered Monica skills and leaves unrelated user skills alone. `update --skill <name>` still includes required dependencies and either produces a coherent release closure or refuses a mixed global release.

## Plan digests and protected apply

Every mutating intent—`init`, `update`, `configure`, `source`, `contribute`, and `forget`—previews its actions and file diffs before apply. The resulting `planDigest` covers the plan and relevant workspace observations. Applying requires `--apply --plan-digest <digest>` and fails after drift.

When a plan changes global skills, Guide protects the selected Monica skills and planned files in one compensating boundary. If an action fails, it restores only attempted work and verifies the observable result. Interrupted, incomplete, or cleanup-pending recovery evidence appears in `status` and `doctor` and blocks another mutation until reconciled.

## Source binding

Source bindings are global user resources keyed by canonical repository. Monica and Monica.Docs can each have one active exact binding, and either, both, or neither may be present. A binding records its verified ref, commit, provenance, and local path; `status` also exposes compatibility findings so an agent can reuse the source when a task needs framework or documentation internals.

Binding and workspace initialization are separate operations. Profiles may recommend or require a repository for a particular task, but source remains globally available and is not owned by the profile. Guide resolves exact source through `inspect-dependency-source`'s stable `resolve --json` contract or verifies an explicitly supplied checkout. Catalog-managed source is never modified, and offline mode requires the exact verified source already to be available.

For ordinary lookup, `source resolve` still returns a usable path when a checkout is dirty or version-mismatched, with prominent warnings. Only exact-parity operations—profile prerequisites, offline or source-channel installation, and exact dependency claims—block on those findings.

When a workspace needs a compatible Monica version, Guide resolves it from `ProjectReference`, lock/assets data, central package management, and then project declarations. Mixed versions, unresolved ranges, unavailable immutable releases, and source checkouts whose effective commit cannot be identified fail closed.

## Managed instructions and state

Guide manages only its marked block in the root `AGENTS.md`. It preserves surrounding content and diagnoses malformed, duplicate, or nested blocks instead of rewriting them implicitly. For Claude Code, it can maintain a minimal root `CLAUDE.md` import of `@AGENTS.md`.

State is split deliberately:

- `.monica/guide.json` stores repository-shared choices such as profile, channel, selected capabilities, expected release, and instruction-block version.
- The platform-standard user `state.json` stores the active global release, agent targets, repository-keyed Monica and Monica.Docs source bindings, preferences, and timestamped observations.

User-local paths do not belong in repository state. State changes use schema migration, locking, and atomic replacement. `forget` removes only workspace-owned Guide configuration, preferences, and managed-instruction ownership. It never removes global Monica or Monica.Docs source bindings.

## Contributor repositories

Choose `framework-contributor` only for a writable canonical Monica checkout. Choose `docs-contributor` for a writable Monica.Docs checkout; its exact Monica source requirement can reuse the existing global Monica binding. Even when a binding points to a writable checkout, Guide treats it as lookup-only; cross-repository edits require separate, explicit authorization in the current session. Application and extension users may also bind Monica.Docs whenever documentation implementation or examples are relevant.

`monica-contribution` can classify findings, prepare reproductions, search for duplicates, and draft Issue, Discussion, or pull-request content. Persisted preferences are limited to `never`, `prepare`, or `ask`. Creating a branch, pushing, publishing a draft pull request, or creating a remote Issue or PR always requires approval in the current session. Suspected vulnerabilities must use a private security route and must never become public issues.

## Operational checklist

1. Use global `status` to inspect the active release, installed skills, and Monica/Monica.Docs bindings.
2. Add a workspace only when you want profile, release-compatibility, or managed-instruction checks.
3. Preview `update` or any source change; review revisions, paths, refs or commits, provenance, compatibility warnings, files, and digest.
4. Apply only the unchanged plan with its digest, then run `doctor`.
5. Start a new agent run after managed instruction files change.
