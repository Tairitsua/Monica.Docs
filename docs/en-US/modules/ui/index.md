---
title: UI
description: Host Monica's Blazor operational pages in one shared, theme-aware shell.
sidebar_position: 1
---

`Monica.UI` provides the interactive server Blazor shell, MudBlazor services, navigation registry, browser storage, themes, localization, and static-asset mapping used by Monica operational pages.

```bash
dotnet add package Monica.UI --prerelease
```

```csharp
using Monica.Core.Modularity.Extensions;
using Monica.Modules;
using Monica.UI.Theming;

var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.ConfigureApplication(options =>
    {
        options.AppId = "orders";
        options.AppName = "Orders operations";
    });

    monica.AddUIShell(options =>
    {
        options.DefaultTheme = MonicaThemeKind.Default;
        options.DefaultDarkMode = false;
        options.ShowLanguageSwitcher = true;
    });

    monica.AddModuleSystemUI();
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

Browser-stored theme and dark-mode choices override host defaults on later visits. The shell shows up to six navigation categories before moving extras into “More”, enables navigation search, and shows the language switcher by default.

## Module diagnostics workbench

`AddModuleSystemUI()` adds the read-only workbench at `/module-system-dashboard`. It provides Overview, Performance, Modules, Dependencies, and Discovery sections backed by one immutable Core diagnostics snapshot. Assembly inventory and bounded module option diagnostics load only when their views are opened; portable baseline comparison stays in the browser and creates no server-side history.

The workbench is available automatically in Development. Outside Development, configure one shell-wide host authorization policy:

```csharp
monica.AddUIShell(options =>
{
    options.OperationalPageAccess.AuthorizationPolicy = "SystemDiagnostics";
});

monica.AddModuleSystemUI();
```

The host must register that policy through ASP.NET Core authorization. Module System, Health Check, Seeder, and protected provider-option diagnostics inherit it. A page can replace it with `AuthorizationPolicyOverride`; a missing effective policy or unauthorized user cannot invoke its diagnostics facade and does not see protected navigation. See [Diagnostics and operations surfaces](../../scenarios/diagnostics-and-ops.md) for safe option disclosure, access configuration, assembly analysis, and baseline comparison.

## Health and Seeder operations pages

The shared shell also hosts independently packaged, read-only operational pages:

| Page | Route | Package | Data lifetime |
|---|---|---|---|
| [Health Check UI](../health-check-ui/index.md) | `/health-checks` | `Monica.HealthCheck.UI` | Newly executed, sanitized snapshot for the current host. |
| [Seeder UI](../seeder-ui/index.md) | `/seeders` | `Monica.Framework.UI` | The current process's one-run Seeder diagnostics. |

Both pages are Development-first and inherit the shell-wide operational policy outside Development. Their runtime modules remain independent: register Health Check probes and Seeder readiness in every environment even when the pages are inaccessible. See [Diagnostics and operations surfaces](../../scenarios/diagnostics-and-ops.md) for unified composition and page-specific overrides.

Navigation is composed incrementally by installed modules during startup. Every localized page declares its owning resource through `RegisterLocalizedPage<TPage, TResource>()`; the shell owns only a small shared category taxonomy such as Monitor or Configuration. Independent packages register their own stable category ID and localized label with `RegisterLocalizedCategory<TResource>()`. The registry groups by ID, orders categories numerically, and freezes before routing, so changing culture cannot split, merge, or reorder category identity.

`EnableDebug` follows the build configuration: enabled in DEBUG builds and disabled otherwise. It controls detailed Blazor and SignalR errors only.

`OperationalPageAccess.DebugMode` is a separate authorization bypass. When enabled, every operational surface using the shared contract is accessible without policy evaluation in every environment, page overrides are ignored, and Monica logs a startup warning. Keep it disabled on production-reachable hosts unless the host is deliberately isolated and the disclosure risk is accepted.

Operational UI packages—such as `Monica.HealthCheck.UI`, `Monica.Framework.UI`, `Monica.Configuration.UI`, `Monica.Repository.UI`, `Monica.JobScheduler.UI`, and `Monica.OpenTelemetry.UI`—are separate Stable packages. Add only the pages an operator should see, and protect the shell with the host's authentication and network policy.
