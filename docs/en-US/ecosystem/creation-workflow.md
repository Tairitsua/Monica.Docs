---
title: Creation workflow
description: Design, scaffold, implement, and validate a third-party Monica module package.
sidebar_position: 4
---

# Creation workflow

Use `$monica-third-party-module-development` to turn a package decision into a publish-ready repository. The workflow treats package identity, module boundaries, licensing, and release ownership as design inputs rather than cleanup after implementation.

## 1. Define the publishing boundary

Decide before scaffolding:

- Publisher and NuGet.org owner
- Package ID and purpose
- Modules included in the package and each module key
- Non-web, web, provider/integration, mixed UI, or standalone UI shape
- Minimum supported Monica version and target frameworks
- Open-source, source-available, proprietary, or other license
- Public NuGet.org or private-feed distribution
- Repository, support, security, and release channels

A package may contain multiple modules. Group them because they are coherent and released together, not because they happen to exist in the same repository.

## 2. Scaffold with the skill

Give the skill concrete requirements:

```text
$monica-third-party-module-development Create Acme.Monica.Analytics as one
publish-ready mixed Razor package. Include Analytics, Alerts, and Analytics UI
modules with keys Acme.Monica.Analytics, Acme.Monica.Analytics.Alerts, and
Acme.Monica.Analytics.UI. Use MIT and GitHub Actions Trusted Publishing.
```

Review the generated identity manifest, module table, project references, package metadata, and license before accepting the scaffold.

## 3. Implement public module contracts

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

## 4. Compose a real host

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

## 5. Validate the distributable package

Before publication:

1. Restore, build, and test with zero warnings.
2. Pack the Release configuration.
3. Inspect the `.nupkg` metadata, README, icon, license, assemblies, and static web assets.
4. Push the artifact to a temporary local feed.
5. Restore it into a clean consumer project with no project references to the package source.
6. Start a representative host and verify every public registration path.
7. Run the [quality checklist](./quality-checklist.md).

Do not publish placeholders, TODO implementations, disabled tests, or a package that was tested only through source-project references.
