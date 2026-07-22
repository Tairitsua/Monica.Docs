---
title: Package and branding standard
description: Apply the Monica ecosystem rules for package IDs, module keys, metadata, and compatibility branding.
sidebar_position: 2
---

# Package and branding standard

The ecosystem uses publisher-first IDs so NuGet ownership is visible and the official `Monica.*` namespace remains unambiguous.

## Package ID

Use this grammar:

```text
<Publisher>.Monica.<Package>[.<Variant>]
```

Examples:

| Purpose | Package ID |
|---|---|
| One package with core and UI modules | `Euynac.Monica.GachaPool` |
| RabbitMQ provider package | `Acme.Monica.EventBus.RabbitMQ` |
| Separately shipped UI package | `Acme.Monica.Analytics.UI` |

Apply these rules:

- Begin with a publisher identifier controlled by the author or organization.
- Use dot-separated, C# identifier-compatible segments. The Monica convention is stricter than NuGet's general syntax and does not use hyphens or underscores.
- Keep the complete ID at 100 characters or fewer.
- Set `PackageId` explicitly. Match the project name, assembly name, and root namespace to it.
- Do not publish third-party packages as `Monica.*` or `Monica.Community.*`.
- Check NuGet.org before choosing an ID. Publishers with a durable package family should consider reserving their own publisher prefix.

The optional `<Variant>` identifies a separately versioned or distributed package. It is not needed merely because one package contains several modules.

## Module keys

Every module in a package has its own globally unique `ModuleKey`:

- The key must equal the `PackageId` or start with `PackageId.`.
- Use the package ID itself for a root module when the package has one.
- Append a concise feature name for other modules.
- End a third-party UI module key with the exact `.UI` segment.
- Preserve the declared casing everywhere. Monica treats module-key identity case-insensitively and rejects a key collision between different module types.

For `Euynac.Monica.GachaPool`, valid keys include:

```csharp
[ModuleKey("Euynac.Monica.GachaPool")]
public sealed class ModuleGachaPool(ModuleGachaPoolOption option)
    : ModuleBase<ModuleGachaPool, ModuleGachaPoolOption, ModuleGachaPoolGuide>(option)
{
}

[ModuleKey("Euynac.Monica.GachaPool.UI")]
public sealed class ModuleGachaPoolUI(ModuleGachaPoolUIOption option)
    : ModuleBase<ModuleGachaPoolUI, ModuleGachaPoolUIOption, ModuleGachaPoolUIGuide>(option)
{
}
```

`Contoso.Monica.OtherFeature` is not valid inside that package because it is outside the package's identity boundary.

## Registration names

Give every public module its own conventional registration surface:

| Part | Pattern | Example |
|---|---|---|
| Module | `Module{Name}` | `ModuleGachaPool` |
| Options | `Module{Name}Option` | `ModuleGachaPoolOption` |
| Guide | `Module{Name}Guide` | `ModuleGachaPoolGuide` |
| Builder entry | `monica.Add{Name}()` | `monica.AddGachaPool()` |
| UI builder entry | `monica.Add{Name}UI()` | `monica.AddGachaPoolUI()` |

Place third-party module types, Guides, options, and builder extensions in the package-owned `<PackageId>.Modules` namespace. Consumers then import `Acme.Monica.Analytics.Modules` for that publisher's registration surface. Keep `Monica.Modules` reserved for Monica's first-party modules; otherwise two independent publishers choosing the same module name would create identical CLR type names.

Prefix contributed UI routes with the publisher and package family, omitting only the literal `Monica` segment. For example, `Euynac.Monica.GachaPool` owns `/euynac-gacha-pool`, and additional pages may live below that prefix. Generic routes such as `/dashboard` or `/settings` are not safe in a host that composes packages from several publishers.

## Required package metadata

Every release declares at least:

- `PackageId`, `PackageVersion`, `Authors`, `Description`, and copyright
- `PackageProjectUrl`, `RepositoryUrl`, and `RepositoryType` when a repository is available
- `PackageReadmeFile` and an embedded README
- `PackageIcon` and an embedded 128×128 transparent PNG
- `PackageTags`, including `monica`, `monica-module`, and `monica-ecosystem-v1`
- Exactly one of `PackageLicenseExpression` or `PackageLicenseFile`
- Release notes for each version

Use Source Link and `.snupkg` symbols when source is available to consumers. See NuGet's [package authoring best practices](https://learn.microsoft.com/nuget/create-packages/package-authoring-best-practices).

## Official and compatibility marks

The original purple `#512BD4` Monica package mark and `Monica.*` package prefix identify official packages. Third parties must not recolor, modify, or present that mark as their package icon.

An independent publisher may instead:

- Use its own icon; or
- Use the Monica Compatibility Mark supplied by the development skill as `monica-compatibility-mark.svg` and `monica-compatibility-mark.png`.

The compatibility mark is emerald `#10B981`, uses a visible plug/extension motif, and remains distinguishable without relying on color alone. Embed the PNG as the NuGet icon; use the SVG in repository documentation where appropriate. Keep the artwork unchanged.

![Monica Compatibility Mark](../../shared/attachments/monica-compatibility-mark.svg)

Include this notice near the first use of the mark:

> This community package is independently maintained and is not affiliated with, endorsed by, or supported by the Monica project.

Name the independent publisher on the same page and in the NuGet metadata.

Compatibility is self-attested in v1. The mark does not indicate a Monica security review, quality audit, support commitment, or trademark license beyond the published brand rules.

## Open-source badge

Open-source status is separate from compatibility and never changes the package ID. A publisher may show the ecosystem's README-only open-source badge when the package declares a NuGet-accepted open-source `PackageLicenseExpression`. Do not use that badge for custom, source-available, or proprietary licenses; use `PackageLicenseFile` and describe the terms directly instead.

![Monica Open Source badge](../../shared/attachments/monica-open-source-badge.svg)

## Consumer disclosure

The package README must identify:

- The independent publisher and support channel
- Supported Monica versions and target frameworks
- Every module and its registration method
- Whether modules add endpoints, middleware, hosted services, static web assets, persistence, or external network access
- License and distribution terms
- The self-attested compatibility notice
