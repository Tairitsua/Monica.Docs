---
title: Seeder
description: Run finite, idempotent startup work through a validated dependency graph with readiness evidence.
sidebar_position: 1
---

The Seeder module in `Monica.Framework` discovers concrete `ISeeder` implementations and runs one dependency-aware graph per host process after `ApplicationStarted`. Independent seeders run concurrently by default; a seeder can opt into exclusive execution, retries, optional readiness, or fail-fast behavior.

```bash
dotnet add package Monica.Framework --prerelease
```

```csharp
using Monica.Core.Modularity.Extensions;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.AddSeeder();
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

Each attempt owns a fresh asynchronous DI scope and enters Monica's execution pipeline as the business point `seeder.run` with automatic transaction mode. Implementations must be finite and idempotent because retries can execute the same operation again.

The module contributes the `monica.seeder` readiness check with `ready`, `monica`, and `seeder` tags. Required seeders keep readiness unhealthy until they succeed. Ordinary unsuccessful optional seeders report degraded readiness. Any effective `FailFast` failure aborts the run and makes readiness unhealthy, even when the trigger is optional.

Diagnostics are retained only for the current host process. `SeederFacade.GetSnapshotAsync(...)` exposes module configuration, run state and timing, effective policy origins, dependencies, every attempt, and bounded error evidence. The optional [Seeder UI](../seeder-ui/index.md) renders that snapshot without adding rerun controls.

## Next steps

- [Quick start](./quick-start.md)
- [Configuration](./configuration.md)
- [Registration, graph, and diagnostics](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
- [Diagnostics and operations surfaces](../../scenarios/diagnostics-and-ops.md)
