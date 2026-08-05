---
title: Creation workflow
description: Design, scaffold, implement, and validate a third-party Monica package repository and optional provider images.
sidebar_position: 4
---

# Creation workflow

Use `$monica-third-party-module-development` to turn repository, package, module, and runtime decisions into a publish-ready release unit. The workflow treats identity, dependency graphs, licensing, artifact ownership, and operational validation as design inputs rather than cleanup after implementation.

## 1. Define the publishing boundary

Decide before scaffolding:

- Durable repository ID, aligned release version, publisher, and NuGet.org owner
- Every NuGet package ID, purpose, project path, and package-to-package dependency
- Every module key, kind, module-to-module dependency, and provider target
- Non-web, web, provider/integration, mixed UI, or standalone UI shape
- Whether a provider runs in-process or through a companion OCI service
- For OCI services: registry repository, connector package, CPU/NVIDIA targets, platform, runtime stage, immutable tag suffix, provider-specific smoke commands, and managed NVIDIA runner labels
- Minimum supported Monica version and target frameworks
- Open-source, source-available, proprietary, or other license
- Public NuGet.org or private-feed distribution
- Repository, support, security, and release channels

A package may contain multiple modules, and one repository may contain multiple packages. Keep modules in one package when they share an install/version boundary. Keep packages in one repository when ownership, version, license, support, and release policy remain aligned.

## 2. Write the schema-v2 repository contract

`monica.manifest.json` is authoritative for the complete release unit:

- `packages[].packageDependencies` is the internal NuGet graph and uses full package IDs.
- `packages[].modules[].dependsOn` is the Monica runtime graph and uses full module keys.
- Every cross-package module edge must be backed by a package edge.
- A `kind: provider` module sets `providerFor` and also lists that target in `dependsOn`.
- `ociImages[]` maps one image repository to its connector through `companionPackageId`; the named package owns a provider module, and CPU/NVIDIA variants are targets of that same repository.
- Optional `releaseGates` declares the repository commands that prove meaningful CPU and NVIDIA provider inference. NVIDIA gates include shared `managedNvidiaRunnerLabels` containing `self-hosted` and `nvidia`.
- `version` applies to every declared NuGet package and every `<version>-<tagSuffix>` image tag.

Both dependency graphs must be complete and acyclic. Do not infer runtime dependencies from project references or shorten identities to repository-local names.

## 3. Scaffold with the skill

Give the skill concrete requirements:

```text
$monica-third-party-module-development Design Tairitsua.Monica.AI.OCR as one
repository with separate OCR contract, PaddleOCR connector, and OCR UI NuGet
packages. Use Monica 1.0.0-rc.6 from NuGet only. Pair the connector with one
layered OCI repository containing CPU amd64 and NVIDIA CUDA 12.6 amd64 targets.
Scaffold and validate locally, but do not publish.
```

This is a design example, not a statement that those packages or images are published. Review the generated identity manifest, package/module graphs, project references, OCI declarations, metadata, and license before accepting the scaffold. Declaring an OCI target creates the Bake contract and directory; it does not create a real provider service implementation. If any declared image lacks complete release gates, the scaffold omits the entire publish workflow rather than allowing a partial NuGet/OCI release.

For each UI module, the scaffold derives a stable navigation category ID from that module's key without the final `.UI`, registers its label with `RegisterLocalizedCategory<TResource>()`, and registers its page with `RegisterLocalizedPage<TPage, TResource>()`. Keep this explicit owner-resource pattern when adding more pages; do not replace it with a central resource or translated-string grouping.

## 4. Implement public module contracts

Each module uses the current Monica registration pattern:

```csharp
using Microsoft.Extensions.DependencyInjection;
using Monica.Core.Modularity.Abstractions;
using Monica.Core.Modularity.Annotations;

// ReSharper disable once CheckNamespace
namespace Acme.Monica.Analytics.Modules;

public static class ModuleAnalyticsBuilderExtensions
{
    extension(IMonicaBuilder builder)
    {
        public ModuleAnalyticsGuide AddAnalytics(
            Action<ModuleAnalyticsOption>? configure = null)
        {
            return builder.AddModule<
                ModuleAnalytics,
                ModuleAnalyticsOption,
                ModuleAnalyticsGuide>(configure);
        }
    }
}

[ModuleKey("Acme.Monica.Analytics")]
public sealed class ModuleAnalytics(ModuleAnalyticsOption option)
    : ModuleBase<ModuleAnalytics, ModuleAnalyticsOption, ModuleAnalyticsGuide>(option)
{
    public override void ConfigureServices(IServiceCollection services)
    {
        // Register the module's implementation boundary.
    }
}

public sealed class ModuleAnalyticsGuide
    : ModuleGuide<ModuleAnalytics, ModuleAnalyticsOption, ModuleAnalyticsGuide>
{
}

public sealed class ModuleAnalyticsOption : ModuleOptions<ModuleAnalytics>
{
}
```

Add public XML documentation to module entry points, options, Guide methods, public abstractions, models, and Facades. Explain defaults, prerequisites, lifecycle, side effects, and failure behavior.

### Schedule only isolated CPU-bound composition work

When a materialized module has synchronous CPU-bound work that can overlap later serial callbacks, prepare an immutable or exclusively module-owned input snapshot and call the protected `ScheduleCompositionWork(...)` method synchronously from that module's `ConfigureBuilder`, `ConfigureServices`, or `PostConfigureServices` callback. Choose the latest checkpoint at which the result is required:

```csharp
[ModuleKey("Acme.Monica.Analytics")]
public sealed class ModuleAnalytics(ModuleAnalyticsOption option)
    : ModuleBase<ModuleAnalytics, ModuleAnalyticsOption, ModuleAnalyticsGuide>(option)
{
    private readonly AnalyticsExpressionCatalog _catalog = new(option);

    public override void ConfigureServices(IServiceCollection services)
    {
        services.AddSingleton(_catalog);
    }

    public override void PostConfigureServices(IServiceCollection _)
    {
        ScheduleCompositionWork(
            "compile-analytics-expressions",
            _catalog.Compile,
            ModuleCompositionWorkDeadline.BeforeServiceRegistrationCompletion);
    }
}
```

`BeforeServiceRegistrationCompletion` is the default and may be omitted. Use `BeforeBusinessTypeIteration` or `BeforePostConfigureServices` when a later composition stage needs the result earlier. A deadline is the latest required composition checkpoint, not a timeout.

The work action must be synchronous, deterministic, and isolated; Monica rejects `async`/`async void` delegates. It must not mutate the host builder, `IServiceCollection`, the module graph, a service provider, or shared static state, and it must not rely on another work item's completion order. Monica owns bounded scheduling, waits at the declared checkpoint, propagates failures before continuing, and drains every work item before `AddMonica(...)` returns. Do not add `Task.Run`, `Task.WhenAll`, or fire-and-forget work inside the module.

Use `IHostedLifecycleService` or a hosted service for runtime activation, I/O, long-running work, and cleanup. `ScheduleCompositionWork(...)` does not make `ConfigureServices`, `PostConfigureServices`, or any other module callback concurrent.

## 5. Compose a real host

Test the same boundary consumers use:

```csharp
using Acme.Monica.Analytics.Modules;
using Monica.Core.Modularity.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.AddAnalytics();
    monica.AddAlerts();
    monica.AddAnalyticsUI();
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

Console and worker hosts need only `AddMonica(...)`. Web hosts apply `UseMonica()` and `MapMonica()` after `Build()`.

A .NET 10 UI bridge must use `Microsoft.NET.Sdk.Web` and set
`<RequiresAspNetWebAssets>true</RequiresAspNetWebAssets>` in its project.
Without that property, server prerendering may appear to work while
`/_framework/blazor.web.js` returns 404 and the page never becomes
interactive.

For a separated provider service, the provider NuGet package remains a small connector that implements the capability package's public abstraction. The connector-facing HTTP or gRPC contract must be identical for CPU and NVIDIA image tags, so consumers switch acceleration modes through deployment configuration rather than recompilation.

## 6. Validate the complete release unit

Before publication:

1. Run `python scripts/validate_repository.py --root .` and the applicable localization and OCI validators.
2. Restore the exact declared Monica version from NuGet. The repository validator requires every resolved `Monica.*` `PackageReference`, including centrally managed versions using ordinary property indirection, to equal manifest `monicaVersion`. Do not add `MonicaSourceRoot`, sibling Monica `ProjectReference` entries, or a local source-feed override.
3. Build and test with zero warnings, then pack every declared project in Release.
4. Run `python scripts/inspect_packages.py --root . --artifacts artifacts` to reject missing/extra packages, incorrect internal NuGet dependencies, or embedded sibling assemblies.
5. Push all `.nupkg` files to a temporary local feed. Restore every public package entry point in clean consumers with no project references to the package source.
6. For OCI releases, validate the normalized Bake graph, build every declared target, and run `python scripts/inspect_images.py --root .` to verify tags, labels, non-root execution, and health checks.
7. Run the declared provider-specific CPU smoke command. For every NVIDIA target, use the declared managed self-hosted GPU runner and NVIDIA smoke command to complete actual provider inference on the GPU. The release workflow loads and inspects images and runs these commands before registry login or any artifact push. An image build, `docker inspect`, CUDA import, or `nvidia-smi` alone is insufficient.
8. Start representative hosts and the UI bridge, verify every public registration path, and run the [quality checklist](./quality-checklist.md).

Do not publish placeholders, TODO implementations, disabled tests, fake provider responses, or artifacts tested only through source-project references. All declared packages and images must pass together before the first external push.
