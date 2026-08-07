---
title: Core composition
description: Compose, validate, and start a host-owned Monica module graph.
sidebar_position: 1
---

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

Composition completes at a host-specific boundary:

- For both host kinds, Monica waits at each declared composition-work deadline and drains every remaining work item before `AddMonica(...)` returns. A work-item failure aborts composition before `Build()`.
- A Generic Host completes when `AddMonica(...)` finishes service registration and all scheduled composition work. It must not call `UseMonica()` or `MapMonica()`.
- A Web Host completes only after `UseMonica()` and then `MapMonica()` have each run once on the same `WebApplication` instance.
- Starting an incompletely composed Web Host fails validation before hosted lifecycle services begin.

Scheduled composition work does not change the serial ordering of module callbacks. It lets a module start isolated CPU-bound work through `ModuleBase.ScheduleCompositionWork(...)` and declare the latest composition checkpoint at which Monica must wait for it. A deadline is not a timeout, and no work item may outlive `AddMonica(...)`. These checks make middleware and endpoint registration part of the validated Web composition rather than optional work that can fail after runtime activation has started.

`Monica.Core` also owns the [Execution Pipeline](../execution-pipeline/index.md), the shared typed kernel used by Mediator, MVC, EventBus, jobs, seeders, and hosted work-item adapters. Subsystems enter it through explicit adapters; application types are not intercepted merely because they are ProjectUnits. [Execution boundaries](../../concepts/execution-boundaries.md) explains the complete boundary and transaction matrix.

## Shared configuration

| Entry point | Purpose | Important default |
|---|---|---|
| `ConfigureApplication(...)` | Sets `ProjectName`, `AppId`, `AppName`, `AppVersion`, and `DomainName` fallbacks. | `ProjectName` and version are inferred from the entry assembly when possible. |
| `ConfigureModuleSystem(...)` | Controls registration failures, summary logs, default API grouping, Minimal API defaults, and an optional Monica-only listener. | Registration errors fail startup; Minimal APIs are disabled by default unless a module opts in. |
| `ConfigureTypeDiscovery(...)` | Adds or excludes assemblies used for business-type discovery. | Default project assemblies are included. |

### Module-system options

| Option | Type | Default | Purpose and constraints |
|---|---|---|---|
| `MaxConcurrentCompositionWorkItems` | `int` | `Math.Max(1, Environment.ProcessorCount)` | Limits how many scheduled composition work items Monica may execute concurrently. The value must be at least `1`; lower it when startup CPU or memory pressure warrants. It does not make module callbacks or Generic Host service startup concurrent. |

### Diagnostics

Module-system diagnostics keep serial callback duration separate from scheduled work. The UI reports each work item's origin phase, deadline, queue time, execution time, and terminal status, plus aggregate wall, execution, queue, and checkpoint-wait durations.

OpenTelemetry preserves the same distinction: `monica.module.init.duration` reports serial callback duration with the `phase` tag, while `monica.module.composition.work.duration` reports scheduled-work duration with `kind=wall|execution|queue|checkpoint_wait`.

Call `AddMonica(...)` exactly once per host builder. Do not retain a module Guide and mutate it after the callback; the graph is sealed at callback completion.

Continue with [Host-bound composition](../../concepts/host-bound-composition.md) for the lifecycle, work deadlines, and module-author constraints on scheduled composition work; [Execution boundaries](../../concepts/execution-boundaries.md) for runtime behavior composition; and [Getting started](../../getting-started/index.md) for a runnable host.
