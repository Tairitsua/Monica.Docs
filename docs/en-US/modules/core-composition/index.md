---
title: Core composition
description: Compose, validate, and start a host-owned Monica module graph.
sidebar_position: 1
---

# Core composition

`Monica.Core` provides the host boundary shared by every Monica application. One call to `AddMonica(...)` records the modules, application identity, type-discovery scope, and module-system policy for one host. The graph is validated and sealed before `Build()` returns a service provider.

## Install and compose

```bash
dotnet add package Monica.Core --prerelease
```

```csharp
using Monica.Core.Modularity.Extensions;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.ConfigureApplication(options =>
    {
        options.AppId = "orders";
        options.AppName = "Orders";
    });

    monica.ConfigureModuleSystem(options =>
    {
        options.DefaultApiGroupName = "Orders";
        options.EnableSummaryLog = true;
    });

    monica.AddMediator();
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

`UseMonica()` installs module middleware around routing. `MapMonica()` maps module-owned endpoints. Non-web hosts call only `AddMonica(...)` and register modules that support non-web operation.

## Shared configuration

| Entry point | Purpose | Important default |
|---|---|---|
| `ConfigureApplication(...)` | Sets `ProjectName`, `AppId`, `AppName`, `AppVersion`, and `DomainName` fallbacks. | `ProjectName` and version are inferred from the entry assembly when possible. |
| `ConfigureModuleSystem(...)` | Controls registration failures, summary logs, default API grouping, Minimal API defaults, and an optional Monica-only listener. | Registration errors fail startup; Minimal APIs are disabled by default unless a module opts in. |
| `ConfigureTypeDiscovery(...)` | Adds or excludes assemblies used for business-type discovery. | Default project assemblies are included. |

Call `AddMonica(...)` exactly once per host builder. Do not retain a module Guide and mutate it after the callback; the graph is sealed at callback completion.

Continue with [Host-bound composition](../../concepts/host-bound-composition.md) for the lifecycle and [Getting started](../../getting-started/index.md) for a runnable host.
