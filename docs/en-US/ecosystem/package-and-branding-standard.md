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
| One package with core and UI modules | `Tairitsua.Monica.GachaPool` |
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

For `Tairitsua.Monica.GachaPool`, valid keys include:

```csharp
[ModuleKey("Tairitsua.Monica.GachaPool")]
public sealed class ModuleGachaPool(ModuleGachaPoolOption option)
    : ModuleBase<ModuleGachaPool, ModuleGachaPoolOption, ModuleGachaPoolGuide>(option)
{
}

[ModuleKey("Tairitsua.Monica.GachaPool.UI")]
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

Derive contributed UI routes from the package family, without the ownership prefix. Remove the leading `<Publisher>.Monica.` segments and a distribution-only final `.UI` segment, then convert the remaining PascalCase segments to lowercase kebab case. For example, `Tairitsua.Monica.GachaPool` owns `/gacha-pool`, while `Acme.Monica.Analytics.UI` owns `/analytics`; additional pages may use extensions such as `/gacha-pool-history`.

Routes are host-global even though package IDs remain publisher-scoped. Monica rejects duplicate normalized routes during registration, so packages that must coexist need distinct package families or distinct package-family subroutes. Do not shorten a package-family route to an unrelated generic path such as `/dashboard` or `/settings`.

## Navigation identity and localization

Navigation category identity is independent of its translated label and public route. For each UI module:

- Derive the category ID from the UI `ModuleKey` by removing only its final `.UI` segment. `Tairitsua.Monica.GachaPool.UI` therefore owns category ID `Tairitsua.Monica.GachaPool` while its route remains `/gacha-pool`.
- Register package-owned category text once with `RegisterLocalizedCategory<TResource>()`. The returned ID is the grouping key; translated text is display-only.
- Register every page with `RegisterLocalizedPage<TPage, TResource>()`. Page-title and package-category keys belong to that module's resource, which must be registered through `AddResource<TResource>()`.
- Give categories and pages explicit numeric order. Monica never sorts or groups by translated text.

```csharp
DependsOnModule<ModuleLocalizationGuide>().Register()
    .AddResource<GachaPoolResource>();

DependsOnModule<ModuleShellUIGuide>().Register()
    .RegisterUIComponents(registry =>
    {
        var categoryId = registry.RegisterLocalizedCategory<GachaPoolResource>(
            "Tairitsua.Monica.GachaPool",
            "Navigation:Category",
            order: 450);

        registry.RegisterLocalizedPage<UIGachaPoolPage, GachaPoolResource>(
            UIGachaPoolPage.PAGE_URL,
            "Navigation:Title",
            Icons.Material.Filled.AutoAwesome,
            categoryId,
            addToNav: true,
            navOrder: 42);
    });
```

One NuGet package may contain several UI modules. Each uses its own UI module key minus `.UI`, so `Acme.Monica.Toolkit.Audit.UI` and `Acme.Monica.Toolkit.Admin.UI` remain distinct categories without forcing separate packages. Registration is startup-only; the shell freezes and validates the registry before routing.

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

The purple `#512BD4` Monica package mark and `Monica.*` package prefix identify official packages. Third parties must not use the purple asset, create their own recolors or geometry variants, or present it as their package icon. The canonical emerald compatibility asset below is the only approved shared-silhouette colorway for independent packages.

An independent publisher may instead:

- Use its own icon; or
- Use the Monica Compatibility Mark supplied by the development skill as `monica-compatibility-mark.svg` and `monica-compatibility-mark.png`.

The compatibility mark preserves the Monica silhouette in emerald `#10B981`. This fixed colorway distinguishes a self-attested ecosystem package from the purple first-party identity. Embed the PNG as the NuGet icon, use the SVG in repository documentation where appropriate, and keep both supplied assets unchanged.

![Monica Compatibility Mark](../../shared/attachments/monica-compatibility-mark.svg)

Include this notice near the first use of the mark:

> Monica compatibility is self-attested by the publisher. This community package is independently maintained and is not affiliated with, endorsed by, or supported by the Monica project.

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
