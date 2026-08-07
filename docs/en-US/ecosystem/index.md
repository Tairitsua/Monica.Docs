---
title: Build a third-party Monica repository
description: Use the Monica development skill to create publish-ready independent packages and companion provider images.
sidebar_position: 1
---

The Monica third-party ecosystem lets an individual or organization publish independently maintained modules while keeping repository, package, runtime, and branding identities predictable. A repository can release one or several NuGet packages and, when a provider is better isolated, one companion OCI repository with CPU and NVIDIA image variants. A release can be open source, proprietary, free, or commercial. Compatibility with Monica does not make it official or imply Monica-team review.

## Start with the skill

Use the [Agent setup guide](../getting-started/agent-setup.md) and initialize this repository with the `extension-author` profile. `monica-guide` installs the catalog-selected framework, architecture, development, third-party, and testing skill closure from the same immutable Monica release; it also binds the exact read-only Monica source required for extension work.

```text
$monica-guide Initialize this repository with the extension-author profile.
Preview the skill, source, and instruction changes before applying anything.
```

After initialization is applied, invoke the focused development skill for the repository design:

```text
$monica-third-party-module-development Create a publish-ready repository for
Tairitsua.Monica.AI.OCR with separate provider-neutral, PaddleOCR connector, and
UI NuGet packages. Pair the connector with layered CPU and NVIDIA images, use
the selected Monica release from NuGet only, and do not publish any artifact.
```

The skill asks for the publisher, repository purpose, package set, full package and module dependency graphs, runtime kind, optional OCI targets, Monica version, license, distribution target, and publishing owner before it generates files. It does not silently choose a license.

## What the skill creates

- An SDK-style `.NET` repository and `.slnx` solution
- A schema-v2 `monica.manifest.json` describing the complete release unit
- One or more NuGet package projects, each containing one or more coherent Monica modules
- Explicit internal NuGet dependencies and Monica runtime dependencies using full identities
- Module strategy, option, `ModuleRegistration<,>` extensions, and `IMonicaBuilder` entry points
- Infrastructure, web, provider, mixed UI, or standalone UI structure as requested
- Optional Buildx Bake targets for one provider-service OCI repository with layered CPU/NVIDIA variants
- Sociable tests that compose a real Monica host
- NuGet metadata, package README, compatibility assets, and license wiring
- CI and, only after complete provider-specific OCI release gates exist, a fail-closed GitHub Actions release workflow using NuGet Trusted Publishing where available
- Package/image inspection, clean local-feed consumers, CPU smoke tests, and applicable real-GPU inference gates

Generated code is a starting implementation owned by the publisher. The skill does not invent a working provider service merely because an OCI target was declared. Review and implement the public API, provider protocol, dependencies, image, security behavior, and legal terms before releasing anything. A repository containing OCI images receives no publish workflow until every image declares provider-specific CPU and applicable NVIDIA smoke commands; NVIDIA gates also identify a managed self-hosted GPU runner.

## Repository schema v2 and ecosystem v1

These labels describe different contracts:

- `monica.manifest.json` uses `schemaVersion: 2` because one repository can now declare multiple NuGet packages and optional OCI targets.
- NuGet packages keep the `monica-ecosystem-v1` tag and the v1 identity, navigation, branding, licensing, and compatibility rules below.

Schema v2 does not rename the public ecosystem standard or make a package officially certified.

## The v1 contract

1. Use `<Publisher>.Monica.<Package>[.<Variant>]` for the NuGet package ID.
2. One repository may release several aligned NuGet packages, and each package may contain any coherent number of modules.
3. Every module key equals the package ID or starts with `PackageId.`.
4. Reserve `Monica.*` and the purple official logo for Monica-owned packages.
5. Use the emerald Monica Compatibility Mark or the publisher's own package icon.
6. State that compatibility is self-attested and identify the independent publisher.
7. Publish with complete metadata, tests, a license expression or license file, and a reproducible release process. Validate all declared NuGet and OCI artifacts as one release unit before publishing any of them.

## Continue

- [Package and branding standard](./package-and-branding-standard.md)
- [Repository, package, and module architecture](./multi-module-package-architecture.md)
- [Creation workflow](./creation-workflow.md)
- [Quality checklist](./quality-checklist.md)
- [Publish packages and companion images](./publish-to-nuget.md)
- [Licensing and commercial use](./licensing-and-commercial-use.md)
