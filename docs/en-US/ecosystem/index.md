---
title: Build a third-party Monica package
description: Use the Monica development skill to create a publish-ready independent module package.
sidebar_position: 1
---

# Build a third-party Monica package

The Monica third-party ecosystem lets an individual or organization publish independently maintained modules while keeping package identity, module discovery, and branding predictable. A package can be open source, proprietary, free, or commercial. Compatibility with Monica does not make a package official or imply Monica-team review.

## Start with the skill

The canonical development skill lives in the Monica repository at `.agents/skills/monica-third-party-module-development`. Install it into Codex from that repository, then invoke it by name:

```text
$skill-installer Install monica-third-party-module-development from
Tairitsua/Monica, path .agents/skills/monica-third-party-module-development.
```

```text
$monica-third-party-module-development Create a publish-ready Monica package for
Acme.Monica.Analytics. It contains Analytics, Alerts, and Analytics UI modules,
uses MIT, targets GitHub and nuget.org, and supports the selected Monica version.
```

The skill asks for the publisher, package purpose, module set, runtime kind, Monica version, license, distribution target, and publishing owner before it generates files. It does not silently choose a license.

## What the skill creates

- An SDK-style `.NET` repository and `.slnx` solution
- One package project containing one or more coherent Monica modules
- Module, option, Guide, and `IMonicaBuilder` registration entry points
- Infrastructure, web, provider, mixed UI, or standalone UI structure as requested
- Sociable tests that compose a real Monica host
- NuGet metadata, package README, compatibility assets, and license wiring
- CI and a GitHub Actions release workflow using NuGet Trusted Publishing where available
- Pack and consumer-restore validation from a clean local feed

Generated code is a starting implementation owned by the publisher. Review the public API, dependencies, security behavior, and legal terms before releasing it.

## The v1 contract

1. Use `<Publisher>.Monica.<Package>[.<Variant>]` for the NuGet package ID.
2. A package may contain any coherent number of modules.
3. Every module key equals the package ID or starts with `PackageId.`.
4. Reserve `Monica.*` and the purple official logo for Monica-owned packages.
5. Use the emerald Monica Compatibility Mark or the publisher's own package icon.
6. State that compatibility is self-attested and identify the independent publisher.
7. Publish with complete metadata, tests, a license expression or license file, and a reproducible release process.

## Continue

- [Package and branding standard](./package-and-branding-standard.md)
- [Multi-module package architecture](./multi-module-package-architecture.md)
- [Creation workflow](./creation-workflow.md)
- [Quality checklist](./quality-checklist.md)
- [Publish to NuGet](./publish-to-nuget.md)
- [Licensing and commercial use](./licensing-and-commercial-use.md)
