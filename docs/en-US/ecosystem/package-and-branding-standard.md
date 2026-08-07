---
title: Package and branding standard
description: Apply the Monica ecosystem rules for package IDs, module keys, metadata, and compatibility branding.
sidebar_position: 2
---

The ecosystem uses publisher-first IDs so NuGet ownership is visible and the official `Monica.*` namespace remains unambiguous. The public package and compatibility rules remain ecosystem v1; schema v2 is the repository manifest format that can describe several packages and optional images.

## Repository manifest and release identity

Every generated repository uses a root `monica.manifest.json` with `schemaVersion: 2`:

- `repositoryId` is a durable publisher-owned identity and names the `.slnx` solution.
- `packages` contains every packable project. Each package has exactly one project at `src/<PackageId>/<PackageId>.csproj`, and no packable project exists outside the manifest.
- `version` is shared by all declared NuGet packages and companion OCI tags in one repository release.
- Publisher, NuGet owner, target framework, Monica version, source visibility, distribution, publishing target, license, branding, contacts, and security policy are repository-wide decisions.
- Split repositories when those shared policies or release versions need to differ.

Keep the NuGet package tag `monica-ecosystem-v1`; `schemaVersion: 2` does not change package compatibility status.

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
| Provider-neutral OCR contract | `Tairitsua.Monica.AI.OCR` |
| Separately shipped OCR provider | `Tairitsua.Monica.AI.OCR.PaddleOCR` |

These rows illustrate valid identities; they do not assert that the named packages are published.

Apply these rules:

- Begin with a publisher identifier controlled by the author or organization.
- Use dot-separated, C# identifier-compatible segments. The Monica convention is stricter than NuGet's general syntax and does not use hyphens or underscores.
- Keep the complete ID at 100 characters or fewer.
- Set `PackageId` explicitly. Match the project name, assembly name, and root namespace to it.
- Do not publish third-party packages as `Monica.*` or `Monica.Community.*`.
- Check NuGet.org before choosing an ID. Publishers with a durable package family should consider reserving their own publisher prefix.

The optional `<Variant>` identifies a separately versioned or distributed package. It is not needed merely because one package contains several modules.

All package IDs in one schema-v2 repository use the same publisher segment. `packages[].packageDependencies` lists internal dependencies by full package ID. Project references must match those edges during development, and packed nuspec dependencies must match them after packaging. Never embed a sibling package assembly to avoid declaring the dependency.

## Manifest module keys and runtime identity

Every module declaration in `monica.manifest.json` has its own globally unique ecosystem key:

- The key must equal the `PackageId` or start with `PackageId.`.
- Use the package ID itself for a root module when the package has one.
- Append a concise feature name for other modules.
- End a third-party UI module key with the exact `.UI` segment.
- Preserve the declared casing everywhere. Repository tooling compares manifest keys case-insensitively and rejects collisions.

Manifest keys describe distribution ownership and let repository tooling resolve `dependsOn` entries to concrete module types. Monica itself uses the concrete strategy `Type` as runtime graph identity; `ModuleKey` is derived diagnostic metadata, not an attribute or a second identity system.

For the manifest keys `Tairitsua.Monica.GachaPool` and `Tairitsua.Monica.GachaPool.UI`, the corresponding strategies use ordinary CLR types:

```csharp
using Monica.Core.Modularity.Abstractions;
using Monica.Modules;

namespace Tairitsua.Monica.GachaPool.Modules;

public sealed class ModuleGachaPool : MonicaModule<ModuleGachaPoolOption>
{
}

public sealed class ModuleGachaPoolOption : ModuleOptions<ModuleGachaPool>
{
}

public sealed class ModuleGachaPoolUI : MonicaModule<ModuleGachaPoolUIOption>, IUIModule
{
    public override void Describe(ModuleDescriptor module)
    {
        module.Require<ModuleGachaPool, ModuleGachaPoolOption>();
        module.Require<ModuleLocalization, ModuleLocalizationOption>();
        module.Require<ModuleShellUI, ModuleShellUIOption>();
    }
}

public sealed class ModuleGachaPoolUIOption : ModuleOptions<ModuleGachaPoolUI>
{
}
```

`Contoso.Monica.OtherFeature` is not valid inside that package because it is outside the package's identity boundary.

`modules[].dependsOn` lists distribution dependencies by full manifest key. The scaffold resolves each entry to `module.Require<TModule, TOptions>()` inside `Describe(ModuleDescriptor)`. A cross-package module edge requires the owning package to declare the corresponding package dependency. Provider modules set `kind: provider`, implement `IModuleProvider`, and name the provided capability with `providerFor`; the same target key must appear in `dependsOn`. Both the package graph and the resolved module graph must be acyclic.

## Registration names

Give every public module its own conventional registration surface:

| Part | Pattern | Example |
|---|---|---|
| Module | `Module{Name}` | `ModuleGachaPool` |
| Options | `Module{Name}Option` | `ModuleGachaPoolOption` |
| Registration | `ModuleRegistration<Module{Name}, Module{Name}Option>` | `ModuleRegistration<ModuleGachaPool, ModuleGachaPoolOption>` |
| Builder entry | `monica.Add{Name}()` | `monica.AddGachaPool()` |
| UI builder entry | `monica.Add{Name}UI()` | `monica.AddGachaPoolUI()` |

Place third-party module types, options, and registration extensions in the package-owned `<PackageId>.Modules` namespace. Host entries return `ModuleRegistration<TModule, TOptions>`, and fluent feature methods extend that same registration type. Consumers import `Acme.Monica.Analytics.Modules` for that publisher's registration surface. Keep `Monica.Modules` reserved for Monica's first-party modules; otherwise two independent publishers choosing the same module name would create identical CLR type names.

Derive contributed UI routes from the package family, without the ownership prefix. Remove the leading `<Publisher>.Monica.` segments and a distribution-only final `.UI` segment, then convert the remaining PascalCase segments to lowercase kebab case. For example, `Tairitsua.Monica.GachaPool` owns `/gacha-pool`, while `Acme.Monica.Analytics.UI` owns `/analytics`; additional pages may use extensions such as `/gacha-pool-history`.

Routes are host-global even though package IDs remain publisher-scoped. Monica rejects duplicate normalized routes during registration, so packages that must coexist need distinct package families or distinct package-family subroutes. Do not shorten a package-family route to an unrelated generic path such as `/dashboard` or `/settings`.

## Navigation identity and localization

Navigation category identity is independent of its translated label and public route. For each UI module:

- Derive the category ID from the UI manifest key by removing only its final `.UI` segment. `Tairitsua.Monica.GachaPool.UI` therefore owns category ID `Tairitsua.Monica.GachaPool` while its route remains `/gacha-pool`.
- Register package-owned category text once with `RegisterLocalizedCategory<TResource>()`. The returned ID is the grouping key; translated text is display-only.
- Register every page with `RegisterLocalizedPage<TPage, TResource>()`. Page-title and package-category keys belong to that module's resource, which must be registered through `AddResource<TResource>()`.
- Give categories and pages explicit numeric order. Monica never sorts or groups by translated text.

```csharp
using Monica.Core.Modularity.Abstractions;
using Monica.Modules;
using MudBlazor;
using Tairitsua.Monica.GachaPool.Localization;
using Tairitsua.Monica.GachaPool.Pages;

namespace Tairitsua.Monica.GachaPool.Modules;

public static class ModuleGachaPoolUIBuilderExtensions
{
    extension(IMonicaBuilder builder)
    {
        public ModuleRegistration<ModuleGachaPoolUI, ModuleGachaPoolUIOption> AddGachaPoolUI(
            Action<ModuleGachaPoolUIOption>? configure = null)
        {
            var registration = builder.AddModule<ModuleGachaPoolUI, ModuleGachaPoolUIOption>(configure);
            registration.Require<ModuleLocalization, ModuleLocalizationOption>()
                .AddResource<GachaPoolResource>();
            registration.Require<ModuleShellUI, ModuleShellUIOption>()
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
            return registration;
        }
    }
}
```

One NuGet package may contain several UI modules. Each uses its own UI manifest key minus `.UI`, so `Acme.Monica.Toolkit.Audit.UI` and `Acme.Monica.Toolkit.Admin.UI` remain distinct categories without forcing separate packages. Registration is startup-only; the shell freezes and validates the registry before routing.

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

## Companion OCI identity

A provider connector package that owns a provider module may name one separately runnable image repository through `ociImages[].companionPackageId`. CPU and NVIDIA variants are targets beneath that one registry repository, not separate product identities. Derive immutable tags as `<manifest-version>-<tag-suffix>`, for example:

```text
ghcr.io/tairitsua/monica-ai-ocr-paddleocr:0.1.0-alpha.1-cpu-amd64
ghcr.io/tairitsua/monica-ai-ocr-paddleocr:0.1.0-alpha.1-nvidia-cu126-amd64
```

These are illustrative names, not a statement that the images are published. Runtime images carry OCI version, source, and revision labels plus Monica companion-package and accelerator labels. The connector README must identify all supported image tags, ports/protocol, health endpoint, required volumes, model/dependency provenance, CPU/GPU prerequisites, data-handling behavior, and whether GPU failure can fall back to CPU. Automated publishing remains disabled until every image has provider-specific CPU and applicable NVIDIA release gates, including a managed self-hosted GPU runner declaration.

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
- Every companion OCI repository and immutable target-tag pattern, when applicable
- Which checks prove CPU service behavior and real NVIDIA inference
